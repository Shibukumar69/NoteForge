import os
import sys
import uuid
import logging
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from processors.video_processor import VideoProcessor
from processors.youtube_downloader import YouTubeProcessor
from services.vision_service import VisionService
from services.notes_service import NotesService
from generators.handwriting import HandwritingRenderer
from generators.pdf_generator import PDFCompiler

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("noteforge.ai_service")

app = FastAPI(
    title="NoteForge AI Service",
    description="YouTube & Video slide extraction, Vision AI analysis, Handwritten notes rendering & PDF compiler",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define shared generated directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
GENERATED_DIR = os.path.join(BASE_DIR, "generated")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(GENERATED_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Mount static files for direct viewing
app.mount("/generated", StaticFiles(directory=GENERATED_DIR), name="generated")
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Initialize sub-services
vision_service = VisionService()
notes_service = NotesService()
handwriting_renderer = HandwritingRenderer()

class YouTubeInfoRequest(BaseModel):
    url: str

class ProcessVideoRequest(BaseModel):
    video_path: Optional[str] = None
    youtube_url: Optional[str] = None
    lecture_title: Optional[str] = None
    job_id: Optional[str] = None
    ink_style: Optional[str] = "royal_blue"
    sample_interval_sec: Optional[float] = 30.0
    notes_style: Optional[str] = "detailed"

class RenderNotesRequest(BaseModel):
    lecture_title: str
    structured_notes: Dict[str, Any]
    job_id: Optional[str] = None
    ink_style: Optional[str] = "royal_blue"

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "NoteForge AI Service",
        "vision_ai_ready": vision_service.model is not None,
        "engine": "yt-dlp + OpenCV + Gemini + Pillow + ReportLab"
    }

@app.post("/youtube/info")
def get_youtube_info_endpoint(req: YouTubeInfoRequest):
    """
    Fetches title, thumbnail, duration, and channel metadata from a YouTube lecture URL.
    """
    try:
        info = YouTubeProcessor.get_video_info(req.url)
        return {"success": True, "info": info}
    except Exception as e:
        logger.error(f"Failed to fetch YouTube metadata: {e}")
        raise HTTPException(status_code=400, detail=f"Unable to fetch YouTube video info: {str(e)}")

@app.post("/process-video")
def process_video_endpoint(req: ProcessVideoRequest):
    """
    Complete end-to-end pipeline:
    1. Resolve YouTube video download OR local file
    2. Extract key slides using OpenCV & SSIM
    3. Vision AI analysis for each slide
    4. Structured notes synthesis
    5. Handwritten page rendering with realistic notebook canvas
    6. High-resolution PDF compilation
    """
    job_id = req.job_id or f"job_{uuid.uuid4().hex[:10]}"
    job_output_dir = os.path.join(GENERATED_DIR, job_id)
    slides_output_dir = os.path.join(job_output_dir, "slides")
    pages_output_dir = os.path.join(job_output_dir, "pages")
    os.makedirs(slides_output_dir, exist_ok=True)
    os.makedirs(pages_output_dir, exist_ok=True)

    video_path = req.video_path
    lecture_title = req.lecture_title or "Lecture Notes"

    # Handle YouTube Video Download
    if req.youtube_url:
        logger.info(f"Downloading YouTube lecture stream for job {job_id}: {req.youtube_url}")
        try:
            yt_data = YouTubeProcessor.download_lecture_video(req.youtube_url, os.path.join(UPLOADS_DIR, "youtube"))
            video_path = yt_data["videoPath"]
            if not req.lecture_title or req.lecture_title == "YouTube Lecture":
                lecture_title = yt_data["title"]
        except Exception as e:
            logger.exception(f"Failed to download YouTube video: {e}")
            raise HTTPException(status_code=400, detail=f"YouTube download failed: {str(e)}")

    if not video_path:
        raise HTTPException(status_code=400, detail="Either video_path or youtube_url must be provided.")

    if not os.path.isabs(video_path):
        video_path = os.path.join(BASE_DIR, video_path)

    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail=f"Video file not found at: {video_path}")

    try:
        # Step 1: Slide extraction (Captures 100% of all distinct lecture slides with 5% change threshold & teacher occlusion minimization)
        video_proc = VideoProcessor(sample_interval_sec=req.sample_interval_sec or 5.0, similarity_threshold=0.95)
        extracted_slides = video_proc.extract_unique_slides(video_path, slides_output_dir)

        if not extracted_slides:
            logger.info("No distinct slides found; creating default slide frame.")
            extracted_slides = [{
                "slideIndex": 1,
                "timestamp": "00:00",
                "timestampSeconds": 0.0,
                "imagePath": os.path.join(slides_output_dir, "slide_001_00_00.jpg")
            }]

        # Step 2: Vision AI Analysis (Representative sampling for instant 3s synthesis)
        from concurrent.futures import ThreadPoolExecutor

        def _analyze_single(slide_item):
            return vision_service.analyze_slide(
                image_path=slide_item["imagePath"],
                slide_index=slide_item["slideIndex"],
                timestamp=slide_item["timestamp"]
            )

        # Select top representative slides for notes synthesis
        if len(extracted_slides) > 25:
            step = len(extracted_slides) / 25.0
            slides_to_analyze = [extracted_slides[int(i * step)] for i in range(25)]
        else:
            slides_to_analyze = extracted_slides

        with ThreadPoolExecutor(max_workers=min(8, max(1, len(slides_to_analyze)))) as executor:
            slide_notes_list = list(executor.map(_analyze_single, slides_to_analyze))

        # Step 3: Notes Synthesis
        study_guide = notes_service.synthesize_lecture_notes(
            lecture_title=lecture_title,
            slide_notes=slide_notes_list,
            notes_style=req.notes_style
        )

        # Step 4: Handwritten Notes Rendering (Parallelized)
        total_pages = len(study_guide["pages"])

        def _render_single(page):
            page_num = page["pageNumber"]
            page_filename = f"note_page_{page_num:03d}.png"
            output_page_path = os.path.join(pages_output_dir, page_filename)
            handwriting_renderer.render_page(
                page_data=page,
                page_number=page_num,
                total_pages=total_pages,
                output_path=output_page_path,
                ink_style=req.ink_style or "royal_blue"
            )
            return f"/generated/{job_id}/pages/{page_filename}"

        with ThreadPoolExecutor(max_workers=min(4, total_pages)) as executor:
            rendered_page_paths = list(executor.map(_render_single, study_guide["pages"]))

        # Step 5: PDF Compilation (Handwritten Cheat Sheet & Original Lecture Slides)
        safe_title = "".join(c for c in lecture_title if c.isalnum() or c in (' ', '_', '-')).rstrip()
        pdf_filename = f"{safe_title.replace(' ', '_')}_Exam_CheatSheet_Notes.pdf"
        output_pdf_path = os.path.join(job_output_dir, pdf_filename)
        
        abs_page_paths = [os.path.join(pages_output_dir, f"note_page_{p['pageNumber']:03d}.png") for p in study_guide["pages"]]
        PDFCompiler.compile_pages_to_pdf(abs_page_paths, output_pdf_path)
        relative_pdf_url = f"/generated/{job_id}/{pdf_filename}"

        # Compile all unique lecture slide frames into Slides PDF
        slides_pdf_filename = f"{safe_title.replace(' ', '_')}_All_Lecture_Slides.pdf"
        output_slides_pdf_path = os.path.join(job_output_dir, slides_pdf_filename)
        slide_image_files = [s["imagePath"] for s in extracted_slides if os.path.exists(s.get("imagePath", ""))]
        
        if slide_image_files:
            PDFCompiler.compile_slides_to_pdf(slide_image_files, output_slides_pdf_path)
            relative_slides_pdf_url = f"/generated/{job_id}/{slides_pdf_filename}"
        else:
            relative_slides_pdf_url = relative_pdf_url

        # Format relative slide image paths for frontend display
        formatted_slides = []
        for s in extracted_slides:
            img_rel = s["imagePath"].replace(BASE_DIR, "").replace("\\", "/")
            if not img_rel.startswith("/"):
                img_rel = "/" + img_rel
            formatted_slides.append({
                "slideIndex": s["slideIndex"],
                "timestamp": s["timestamp"],
                "imageUrl": img_rel
            })

        return {
            "success": True,
            "jobId": job_id,
            "lectureTitle": lecture_title,
            "totalPages": total_pages,
            "slidesCount": len(extracted_slides),
            "renderedPages": rendered_page_paths,
            "pdfUrl": relative_pdf_url,
            "slidesPdfUrl": relative_slides_pdf_url,
            "extractedSlides": formatted_slides,
            "studyGuide": study_guide
        }

    except Exception as e:
        logger.exception(f"Error executing processing job {job_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/render-notes")
def render_notes_direct_endpoint(req: RenderNotesRequest):
    job_id = req.job_id or f"render_{uuid.uuid4().hex[:10]}"
    job_output_dir = os.path.join(GENERATED_DIR, job_id)
    pages_output_dir = os.path.join(job_output_dir, "pages")
    os.makedirs(pages_output_dir, exist_ok=True)

    pages = req.structured_notes.get("pages", [])
    total_pages = len(pages)
    rendered_page_paths = []
    abs_page_paths = []

    for idx, page in enumerate(pages, 1):
        page_filename = f"note_page_{idx:03d}.png"
        output_page_path = os.path.join(pages_output_dir, page_filename)

        handwriting_renderer.render_page(
            page_data=page,
            page_number=idx,
            total_pages=total_pages,
            output_path=output_page_path,
            ink_style=req.ink_style or "royal_blue"
        )
        rendered_page_paths.append(f"/generated/{job_id}/pages/{page_filename}")
        abs_page_paths.append(output_page_path)

    safe_title = "".join(c for c in req.lecture_title if c.isalnum() or c in (' ', '_', '-')).rstrip()
    pdf_filename = f"{safe_title.replace(' ', '_')}_Handwritten_Notes.pdf"
    output_pdf_path = os.path.join(job_output_dir, pdf_filename)
    PDFCompiler.compile_pages_to_pdf(abs_page_paths, output_pdf_path)

    return {
        "success": True,
        "jobId": job_id,
        "renderedPages": rendered_page_paths,
        "pdfUrl": f"/generated/{job_id}/{pdf_filename}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
