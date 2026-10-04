import os
from typing import List
from PIL import Image

class PDFCompiler:
    """
    Compiles note pages and raw slide captures into high-resolution study PDFs.
    """

    @staticmethod
    def compile_pages_to_pdf(image_paths: List[str], output_pdf_path: str) -> str:
        if not image_paths:
            raise ValueError("No image paths provided to compile PDF")

        os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)

        images = []
        for path in image_paths:
            if os.path.exists(path):
                img = Image.open(path)
                if img.mode != "RGB":
                    img = img.convert("RGB")
                images.append(img)

        if not images:
            raise FileNotFoundError("Could not find any images to compile into PDF")

        first_image = images[0]
        remaining_images = images[1:] if len(images) > 1 else []

        first_image.save(
            output_pdf_path,
            "PDF",
            resolution=100.0,
            quality=85,
            save_all=True,
            append_images=remaining_images,
        )

        for img in images:
            img.close()

        return output_pdf_path

    @staticmethod
    def compile_slides_to_pdf(slide_image_paths: List[str], output_pdf_path: str) -> str:
        """
        Compiles all unique lecture slide frames extracted from the video into a single clean slide deck PDF.
        """
        if not slide_image_paths:
            return output_pdf_path

        os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
        images = []
        for p in slide_image_paths:
            if os.path.exists(p):
                try:
                    im = Image.open(p)
                    if im.mode != "RGB":
                        im = im.convert("RGB")
                    # Downscale for ultra-lightweight PDF
                    if im.width > 1280:
                        im = im.resize((1280, int(im.height * (1280 / im.width))), Image.Resampling.LANCZOS)
                    images.append(im)
                except Exception:
                    pass

        if images:
            images[0].save(
                output_pdf_path,
                "PDF",
                resolution=90.0,
                quality=80,
                save_all=True,
                append_images=images[1:] if len(images) > 1 else []
            )
            for im in images:
                im.close()

        return output_pdf_path
