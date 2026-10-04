import os
import sys
import time
import requests
import json

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from processors.youtube_downloader import YouTubeProcessor
from processors.video_processor import VideoProcessor
from services.vision_service import VisionService
from services.notes_service import NotesService
from generators.handwriting import HandwritingRenderer
from generators.pdf_generator import PDFCompiler

def test_pipeline(youtube_url):
    print("=" * 60)
    print(f"[TEST] Starting live test for: {youtube_url}")
    print("=" * 60)
    
    start_total = time.time()
    
    # 1. YouTube info & download
    t0 = time.time()
    print("[STEP 1] Fetching YouTube metadata and downloading lightweight video stream...")
    info = YouTubeProcessor.get_video_info(youtube_url)
    print(f"Title: {info.get('title')}")
    print(f"Duration: {info.get('duration')}s")
    
    output_dir = os.path.join(CURRENT_DIR, "scratch", "test_video")
    os.makedirs(output_dir, exist_ok=True)
    
    yt_data = YouTubeProcessor.download_lecture_video(youtube_url, output_dir)
    video_path = yt_data["videoPath"]
    print(f"[STEP 1 DONE] Video downloaded in {time.time() - t0:.2f}s -> {video_path}")
    
    # 2. Extract unique slides (Strict 60% change + teacher occlusion minimization)
    t1 = time.time()
    slides_output_dir = os.path.join(output_dir, "slides")
    video_proc = VideoProcessor(sample_interval_sec=30.0, change_threshold=0.60)
    extracted_slides = video_proc.extract_unique_slides(video_path, slides_output_dir)
    print(f"[STEP 2 DONE] Extracted {len(extracted_slides)} unique slides in {time.time() - t1:.2f}s")
    for s in extracted_slides:
        print(f"  - Slide #{s['slideIndex']} at {s['timestamp']} (Clarity/Occlusion Score: {s.get('clarityScore', 0):.1f})")
    
    # 3. Vision AI parallel extraction
    t2 = time.time()
    print("[STEP 3] Running Parallel Vision AI analysis...")
    vision_service = VisionService()
    
    from concurrent.futures import ThreadPoolExecutor
    def _analyze_single(slide_item):
        return vision_service.analyze_slide(
            image_path=slide_item["imagePath"],
            slide_index=slide_item["slideIndex"],
            timestamp=slide_item["timestamp"]
        )
        
    with ThreadPoolExecutor(max_workers=min(8, max(1, len(extracted_slides)))) as executor:
        slide_notes_list = list(executor.map(_analyze_single, extracted_slides))
    print(f"[STEP 3 DONE] Vision AI completed in {time.time() - t2:.2f}s")
    
    # 4. Notes synthesis (4-5 pages cheat sheet)
    t3 = time.time()
    notes_service = NotesService()
    study_guide = notes_service.synthesize_lecture_notes(
        lecture_title=info.get("title", "Lecture Notes"),
        slide_notes=slide_notes_list,
        notes_style="detailed"
    )
    total_pages = len(study_guide["pages"])
    print(f"[STEP 4 DONE] Notes synthesized into exactly {total_pages} Cheat Sheet Pages in {time.time() - t3:.2f}s")
    
    # 5. Handwriting rendering (Parallel)
    t4 = time.time()
    pages_output_dir = os.path.join(output_dir, "pages")
    os.makedirs(pages_output_dir, exist_ok=True)
    handwriting_renderer = HandwritingRenderer()
    
    def _render_single(page):
        page_num = page["pageNumber"]
        out_path = os.path.join(pages_output_dir, f"note_page_{page_num:03d}.png")
        handwriting_renderer.render_page(
            page_data=page,
            page_number=page_num,
            total_pages=total_pages,
            output_path=out_path,
            ink_style="royal_blue"
        )
        return out_path
        
    with ThreadPoolExecutor(max_workers=min(4, total_pages)) as executor:
        rendered_pages = list(executor.map(_render_single, study_guide["pages"]))
    print(f"[STEP 5 DONE] Rendered {len(rendered_pages)} high-yield handwritten cards in {time.time() - t4:.2f}s")
    
    # 6. PDF Compilations
    t5 = time.time()
    cheat_pdf = os.path.join(output_dir, "Exam_CheatSheet_Notes.pdf")
    PDFCompiler.compile_pages_to_pdf(rendered_pages, cheat_pdf)
    
    slide_image_files = [s["imagePath"] for s in extracted_slides if os.path.exists(s.get("imagePath", ""))]
    slides_pdf = os.path.join(output_dir, "All_Lecture_Slides.pdf")
    PDFCompiler.compile_slides_to_pdf(slide_image_files, slides_pdf)
    print(f"[STEP 6 DONE] Compiled CheatSheet PDF ({os.path.getsize(cheat_pdf)/1024:.1f} KB) and Slides PDF ({os.path.getsize(slides_pdf)/1024:.1f} KB) in {time.time() - t5:.2f}s")
    
    total_time = time.time() - start_total
    print("=" * 60)
    print(f"[SUCCESS] PIPELINE TEST COMPLETED SUCCESSFULLY IN {total_time:.2f}s TOTAL!")
    print(f"Total Unique Slides: {len(extracted_slides)}")
    print(f"Cheat Sheet Pages: {total_pages}")
    print(f"CheatSheet PDF: {cheat_pdf}")
    print(f"Lecture Slides PDF: {slides_pdf}")
    print("=" * 60)

if __name__ == "__main__":
    test_pipeline("https://youtu.be/8Ja8RQyvovA")
