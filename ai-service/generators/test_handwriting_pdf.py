import sys
import os

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from generators.handwriting import HandwritingRenderer
from generators.pdf_generator import PDFCompiler


def test_handwriting_and_pdf():
    print("==================================================")
    print("[TEST] Testing Handwriting Canvas & PDF Generation...")
    print("==================================================")

    renderer = HandwritingRenderer()
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../generated/test_output"))
    os.makedirs(out_dir, exist_ok=True)

    # Mock Lecture Data (DBMS Normalization)
    sample_page_1 = {
        "title": "DBMS Normalization 1NF & 2NF",
        "topics": [
            {
                "heading": "1NF (First Normal Form)",
                "points": [
                    "Each table cell must contain atomic (single) values.",
                    "No repeating groups or arrays of data in a single column.",
                ],
                "importantMarkers": ["Primary Key uniquely identifies each tuple."],
                "formulas": ["Atomicity: Columns != {val1, val2, ...}"]
            },
            {
                "heading": "2NF (Second Normal Form)",
                "points": [
                    "Must strictly satisfy all conditions of 1NF.",
                    "No partial dependency allowed (Non-prime attributes must depend on entire PK).",
                ],
                "importantMarkers": ["Eliminate partial dependency by decomposing tables."],
                "formulas": ["Candidate Key -> Non-Prime Attributes"]
            }
        ]
    }

    page1_path = os.path.join(out_dir, "test_page_1.png")
    renderer.render_page(sample_page_1, page_number=1, total_pages=1, output_path=page1_path, ink_style="royal_blue")
    print(f"  [Test 1] Rendered Page 1 PNG: {page1_path}")
    assert os.path.exists(page1_path), "Handwritten PNG page must be created"

    # Test PDF Compilation
    pdf_path = os.path.join(out_dir, "DBMS_Normalization_Sample.pdf")
    PDFCompiler.compile_pages_to_pdf([page1_path], pdf_path)
    print(f"  [Test 2] Compiled Final PDF: {pdf_path}")
    assert os.path.exists(pdf_path), "Final PDF must be created"

    print("\n==================================================")
    print("[SUCCESS] HANDWRITING CANVAS & PDF COMPILED SUCCESSFULLY!")
    print("==================================================")


if __name__ == "__main__":
    test_handwriting_and_pdf()
