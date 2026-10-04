import sys
import os
import numpy as np

# Force UTF-8 standard output for Windows CMD/PowerShell consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from processors.slide_detector import SlideDetector


def test_detector():
    print("==================================================")
    print("[TEST] Testing SlideDetector Algorithm (SSIM Threshold = 0.82)...")
    print("==================================================")

    detector = SlideDetector(similarity_threshold=0.82)

    # 1. Simulate First Frame (Initial slide)
    frame1 = np.ones((720, 1280, 3), dtype=np.uint8) * 255
    is_slide_1 = detector.is_new_slide(frame1)
    print(f"  [Test 1] First Frame: Detected = {is_slide_1} (Expected: True)")
    assert is_slide_1 is True, "First frame must be detected as a valid slide"

    # 2. Simulate Duplicate Frame (Same slide)
    frame2 = frame1.copy()
    is_slide_2 = detector.is_new_slide(frame2)
    print(f"  [Test 2] Duplicate Frame: Detected = {is_slide_2} (Expected: False)")
    assert is_slide_2 is False, "Duplicate frame must be rejected"

    # 3. Simulate New Dark Slide (Slide transition)
    frame3 = np.zeros((720, 1280, 3), dtype=np.uint8)
    is_slide_3 = detector.is_new_slide(frame3)
    print(f"  [Test 3] New Slide (Content Change): Detected = {is_slide_3} (Expected: True)")
    assert is_slide_3 is True, "Different slide must be detected as a new slide"

    print("\n==================================================")
    print("[SUCCESS] ALL SLIDE DETECTOR UNIT TESTS PASSED!")
    print("==================================================")


if __name__ == "__main__":
    test_detector()
