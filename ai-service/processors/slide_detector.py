import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim

class SlideDetector:
    """
    Industry-Level Slide Change Detector:
    Detects slide changes with a 5% difference threshold (similarity < 0.95).
    Captures every distinct slide, diagram, new bullet point, equation, and board update.
    Scores frames to isolate the best timing when the instructor is standing aside
    and covering the least possible slide area.
    """

    def __init__(self, change_threshold: float = 0.05, similarity_threshold: float = None):
        # 5% change required => similarity threshold = 0.95
        if similarity_threshold is not None:
            self.similarity_threshold = float(similarity_threshold)
            self.change_threshold = 1.0 - self.similarity_threshold
        else:
            self.change_threshold = float(change_threshold)
            self.similarity_threshold = 1.0 - self.change_threshold  # 0.95
        self.last_slide_gray = None

    def compute_similarity(self, frame_bgr: np.ndarray) -> float:
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, (480, 270), interpolation=cv2.INTER_AREA)

        if self.last_slide_gray is None:
            self.last_slide_gray = resized
            return 0.0

        score, _ = ssim(self.last_slide_gray, resized, full=True)
        return float(score)

    def calculate_occlusion_and_clarity(self, frame_bgr: np.ndarray) -> float:
        """
        Calculates how clear and unobstructed the slide text is:
        - Higher score = Teacher is completely aside, full text visible with sharp edges
        - Lower score = Teacher is blocking slide text or moving in front
        """
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)

        # 1. Edge & Text Sharpness (High when text is visible, low on human body/blur)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        sharpness = min(400.0, float(laplacian_var))

        # 2. Text Pixel Density (Detects crisp text lines vs blurry clothing)
        edges = cv2.Canny(gray, 60, 160)
        edge_density = (np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])) * 1000.0

        # 3. Brightness Uniformity & Contrast
        contrast = float(np.std(gray))

        # Composite score: Teacher aside = Max text density + Sharpness + Contrast
        composite_score = (sharpness * 0.35) + (edge_density * 0.45) + (contrast * 0.20)
        return float(composite_score)

    def is_new_slide(self, current_frame_bgr: np.ndarray) -> bool:
        """
        Returns True if >= 5% of the slide has changed (similarity < 0.95).
        """
        score = self.compute_similarity(current_frame_bgr)
        if score < self.similarity_threshold:
            gray = cv2.cvtColor(current_frame_bgr, cv2.COLOR_BGR2GRAY)
            self.last_slide_gray = cv2.resize(gray, (480, 270), interpolation=cv2.INTER_AREA)
            return True
        return False

    def reset(self):
        self.last_slide_gray = None
