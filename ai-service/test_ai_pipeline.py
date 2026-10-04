import os
import sys
import cv2
import numpy as np
import unittest
from fastapi.testclient import TestClient

# Ensure ai-service root is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from processors.slide_detector import SlideDetector
from processors.video_processor import VideoProcessor
from services.vision_service import VisionService
from services.notes_service import NotesService
from generators.handwriting import HandwritingRenderer
from generators.pdf_generator import PDFCompiler
from main import app

def test_slide_detector():
    detector = SlideDetector(similarity_threshold=0.82)
    
    # Frame 1: Blank canvas with text
    frame1 = np.ones((720, 1280, 3), dtype=np.uint8) * 255
    cv2.putText(frame1, "Slide 1: Introduction to AI", (100, 200), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 0), 3)
    
    # Frame 2: Identical to Frame 1 (should NOT trigger new slide)
    frame2 = frame1.copy()
    
    # Frame 3: Completely new slide
    frame3 = np.ones((720, 1280, 3), dtype=np.uint8) * 40
    cv2.putText(frame3, "Slide 2: Neural Networks & Backprop", (100, 200), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)

    assert detector.is_new_slide(frame1) is True, "First frame must be detected as a new slide"
    assert detector.is_new_slide(frame2) is False, "Duplicate frame must be rejected"
    assert detector.is_new_slide(frame3) is True, "Different frame must be detected as a new slide"
    print("[PASS] SlideDetector unit test passed!")

def test_video_processor(tmp_path):
    test_video_path = os.path.join(tmp_path, "sample_lecture.mp4")
    out_slides_dir = os.path.join(tmp_path, "slides")
    
    # Create synthetic 3-second 10fps video with 2 slide changes
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(test_video_path, fourcc, 10.0, (640, 360))
    
    for i in range(30):
        frame = np.ones((360, 640, 3), dtype=np.uint8) * (200 if i < 15 else 50)
        cv2.putText(frame, f"Slide {'A' if i < 15 else 'B'}", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 2)
        out.write(frame)
    out.release()

    processor = VideoProcessor(sample_interval_sec=0.5, similarity_threshold=0.82)
    slides = processor.extract_unique_slides(test_video_path, out_slides_dir)

    assert len(slides) >= 2, f"Expected at least 2 slides extracted, got {len(slides)}"
    for s in slides:
        assert os.path.exists(s["imagePath"]), f"Slide image file missing: {s['imagePath']}"
    print(f"[PASS] VideoProcessor test passed with {len(slides)} unique slides extracted!")

def test_notes_synthesis():
    notes_svc = NotesService()
    mock_slides = [
        {
            "slideIndex": 1,
            "title": "Database Normalization",
            "timestamp": "00:00",
            "topics": [
                {
                    "heading": "First Normal Form (1NF)",
                    "points": ["Values in each column must be atomic", "No repeating groups or arrays"],
                    "importantMarkers": ["Every row must have a unique primary key identifier"],
                    "formulas": []
                }
            ],
            "summary": "1NF overview."
        }
    ]
    guide = notes_svc.synthesize_lecture_notes("DBMS Lecture", mock_slides)
    assert 3 <= guide["totalPages"] <= 5, f"Expected 3-5 pages, got {guide['totalPages']}"
    assert len(guide["flashcards"]) > 0
    assert len(guide["mcqs"]) > 0
    print("[PASS] NotesService synthesis test passed!")

def test_fastapi_endpoints(tmp_path):
    client = TestClient(app)
    
    # Test health
    health_resp = client.get("/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] == "online"

    # Test direct render endpoint
    render_payload = {
        "lecture_title": "Operating Systems",
        "structured_notes": {
            "pages": [
                {
                    "pageNumber": 1,
                    "title": "Process Scheduling",
                    "topics": [
                        {
                            "heading": "Round Robin",
                            "points": ["Preemptive scheduling algorithm", "Fixed time quantum allocated"],
                            "importantMarkers": ["Time slice too small causes context switch overhead"],
                            "formulas": ["Turnaround Time = Completion Time - Arrival Time"]
                        }
                    ]
                }
            ]
        },
        "ink_style": "royal_blue"
    }

    render_resp = client.post("/render-notes", json=render_payload)
    assert render_resp.status_code == 200
    resp_json = render_resp.json()
    assert resp_json["success"] is True
    assert len(resp_json["renderedPages"]) == 1
    assert resp_json["pdfUrl"].endswith(".pdf")
    print("[PASS] FastAPI health and render endpoints test passed!")

if __name__ == "__main__":
    import tempfile
    with tempfile.TemporaryDirectory() as temp_dir:
        test_slide_detector()
        test_video_processor(temp_dir)
        test_notes_synthesis()
        test_fastapi_endpoints(temp_dir)
    print("\n==============================================")
    print("ALL AI-SERVICE UNIT & INTEGRATION TESTS PASSED")
    print("==============================================")
