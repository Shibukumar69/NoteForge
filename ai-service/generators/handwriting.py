import os
import random
from PIL import Image, ImageDraw, ImageFont
from typing import Dict, Any, List

class HandwritingRenderer:
    """
    Renders structured educational notes into high-yield student exam cheat sheets
    matching authentic multi-card grid layouts with pastel headers, tables, flowcharts, and callouts.
    """

    def __init__(self, font_path: str = None):
        # A4 Ultra High-Res Canvas (300 DPI equivalent)
        self.width = 1754
        self.height = 2480
        self.font_path = font_path

        # Colors
        self.bg_color = (255, 255, 255)
        self.border_color = (60, 100, 180)
        self.header_bg = (240, 245, 255)
        self.card_border = (180, 205, 240)
        
        # Pastel Title Pill Colors
        self.pill_colors = [
            ((245, 215, 235), (140, 30, 100)),   # Pastel Pink / Berry
            ((220, 235, 255), (20, 70, 160)),    # Pastel Blue / Royal
            ((220, 250, 230), (20, 120, 70)),    # Pastel Mint / Emerald
            ((255, 240, 200), (160, 90, 10)),    # Pastel Gold / Amber
            ((240, 225, 255), (90, 40, 150)),    # Pastel Purple / Violet
            ((255, 225, 220), (160, 40, 30)),    # Pastel Coral / Rust
        ]

    def _get_fonts(self):
        try:
            # Try to load Windows standard clean fonts
            font_names = ["segoeui.ttf", "calibri.ttf", "arial.ttf", "DejaVuSans.ttf"]
            font_bold_names = ["segoeuib.ttf", "calibrib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"]
            
            main_font_file = None
            bold_font_file = None

            for name in font_names:
                win_path = os.path.join(os.environ.get("WINDIR", "C:\\Windows"), "Fonts", name)
                if os.path.exists(win_path):
                    main_font_file = win_path
                    break

            for name in font_bold_names:
                win_path = os.path.join(os.environ.get("WINDIR", "C:\\Windows"), "Fonts", name)
                if os.path.exists(win_path):
                    bold_font_file = win_path
                    break

            if main_font_file:
                return {
                    "header_title": ImageFont.truetype(bold_font_file or main_font_file, 38),
                    "header_sub": ImageFont.truetype(main_font_file, 22),
                    "pill_title": ImageFont.truetype(bold_font_file or main_font_file, 24),
                    "card_heading": ImageFont.truetype(bold_font_file or main_font_file, 21),
                    "body": ImageFont.truetype(main_font_file, 19),
                    "body_bold": ImageFont.truetype(bold_font_file or main_font_file, 19),
                    "small": ImageFont.truetype(main_font_file, 16),
                    "callout": ImageFont.truetype(bold_font_file or main_font_file, 22)
                }
        except Exception:
            pass

        default = ImageFont.load_default()
        return {k: default for k in ["header_title", "header_sub", "pill_title", "card_heading", "body", "body_bold", "small", "callout"]}

    def render_page(
        self,
        page_data: Dict[str, Any],
        page_number: int,
        total_pages: int,
        output_path: str,
        ink_style: str = "royal_blue"
    ) -> str:
        """
        Renders an AKTU/University style multi-box revision cheat-sheet page.
        """
        image = Image.new("RGB", (self.width, self.height), self.bg_color)
        draw = ImageDraw.Draw(image)
        fonts = self._get_fonts()

        margin = 35
        # 1. Outer Master Blueprint Border
        draw.rectangle(
            [(margin, margin), (self.width - margin, self.height - margin)],
            outline=self.border_color,
            width=3
        )

        # 2. Header Banner Box
        header_height = 140
        draw.rectangle(
            [(margin, margin), (self.width - margin, margin + header_height)],
            fill=self.header_bg,
            outline=self.border_color,
            width=2
        )

        # Quick Revision Score High Badge
        badge_x1 = self.width - margin - 220
        badge_y1 = margin + 15
        draw.rounded_rectangle(
            [(badge_x1, badge_y1), (badge_x1 + 205, badge_y1 + 105)],
            radius=12,
            fill=(255, 245, 180),
            outline=(210, 160, 20),
            width=2
        )
        draw.text((badge_x1 + 20, badge_y1 + 15), "Quick Revision", fill=(140, 70, 0), font=fonts["body_bold"])
        draw.text((badge_x1 + 35, badge_y1 + 45), "Cheat Sheet", fill=(30, 30, 30), font=fonts["body_bold"])
        draw.text((badge_x1 + 30, badge_y1 + 75), "★ Score High!", fill=(180, 20, 20), font=fonts["small"])

        # Title & Subtitle in Header
        lecture_title = page_data.get("title", "Lecture Revision Notes").upper()
        draw.text((margin + 30, margin + 20), lecture_title[:65], fill=(160, 20, 80), font=fonts["header_title"])

        summary_text = page_data.get("summary", "Complete Concept Summary • Formulas • Differences • Exam Focus")
        draw.text((margin + 32, margin + 75), summary_text[:85], fill=(20, 60, 140), font=fonts["header_sub"])

        # Page index tag
        draw.text((margin + 32, margin + 105), f"Module Sheet {page_number} of {total_pages} • NoteForge Vision Engine", fill=(90, 90, 100), font=fonts["small"])

        # 3. Multi-Card Content Grid (2 Columns x 3 Rows = 6 clean dense cards per sheet)
        grid_top = margin + header_height + 15
        grid_bottom = self.height - margin - 90
        available_height = grid_bottom - grid_top
        available_width = self.width - (margin * 2) - 20

        col_width = available_width // 2
        row_height = available_height // 3

        topics = page_data.get("topics", [])
        # Pad topics to fill the sheet neatly
        while len(topics) < 6:
            topics.append({
                "heading": f"Key Concept & Exam Notes",
                "points": ["Ensure full mastery of definitions and operational properties.", "Apply formulas directly to solve previous year numerical questions."],
                "importantMarkers": ["High scoring topic frequently tested in university exams."],
                "formulas": []
            })

        for i in range(min(6, len(topics))):
            col = i % 2
            row = i // 2

            card_x1 = margin + (col * (col_width + 20))
            card_y1 = grid_top + (row * (row_height + 15))
            card_x2 = card_x1 + col_width
            card_y2 = card_y1 + row_height

            topic = topics[i]
            pill_bg, pill_fg = self.pill_colors[i % len(self.pill_colors)]

            # Card Outer Box
            draw.rounded_rectangle([(card_x1, card_y1), (card_x2, card_y2)], radius=10, fill=(254, 254, 255), outline=self.card_border, width=2)

            # Card Title Pill Header
            pill_h = 42
            draw.rounded_rectangle([(card_x1 + 8, card_y1 + 8), (card_x2 - 8, card_y1 + pill_h + 8)], radius=8, fill=pill_bg, outline=pill_fg, width=1)
            
            card_num_title = f"{i + 1}. {topic.get('heading', 'Core Topic')}"
            draw.text((card_x1 + 18, card_y1 + 16), card_num_title[:45], fill=pill_fg, font=fonts["pill_title"])

            # Card Body Items
            cursor_y = card_y1 + pill_h + 20
            points = topic.get("points", [])

            for pt in points[:4]:
                # Bullet point symbol
                draw.text((card_x1 + 18, cursor_y), "•", fill=(20, 60, 140), font=fonts["body_bold"])
                # Text wrapping simulation
                words = pt.split()
                line = ""
                for w in words:
                    test_line = f"{line} {w}".strip()
                    if len(test_line) < 48:
                        line = test_line
                    else:
                        draw.text((card_x1 + 36, cursor_y), line, fill=(30, 30, 40), font=fonts["body"])
                        cursor_y += 24
                        line = w
                if line:
                    draw.text((card_x1 + 36, cursor_y), line, fill=(30, 30, 40), font=fonts["body"])
                    cursor_y += 26

            # Formulas or Table Box inside Card
            formulas = topic.get("formulas", [])
            for formula in formulas[:1]:
                if cursor_y < card_y2 - 50:
                    draw.rectangle([(card_x1 + 16, cursor_y), (card_x2 - 16, cursor_y + 36)], fill=(240, 245, 255), outline=(100, 150, 220), width=1)
                    draw.text((card_x1 + 24, cursor_y + 8), f"Formula: {formula[:45]}", fill=(10, 40, 120), font=fonts["small"])
                    cursor_y += 42

            # Important Exam Marker Pill
            markers = topic.get("importantMarkers", [])
            for marker in markers[:1]:
                if cursor_y < card_y2 - 35:
                    draw.rounded_rectangle([(card_x1 + 16, cursor_y), (card_x2 - 16, cursor_y + 32)], radius=6, fill=(255, 235, 235), outline=(220, 80, 80), width=1)
                    draw.text((card_x1 + 24, cursor_y + 6), f"★ Imp: {marker[:46]}", fill=(160, 20, 20), font=fonts["small"])

        # 4. Bottom Golden Quote / Motivation Banner
        banner_y1 = self.height - margin - 75
        banner_y2 = self.height - margin - 15
        draw.rounded_rectangle(
            [(margin + 10, banner_y1), (self.width - margin - 10, banner_y2)],
            radius=10,
            fill=(255, 248, 170),
            outline=(210, 170, 10),
            width=2
        )
        quote = '"Learn the Concepts, Practice the Diagrams, Write with Examples, Score High!"'
        draw.text((margin + 160, banner_y1 + 16), quote, fill=(120, 50, 0), font=fonts["callout"])

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        image.save(output_path, "PNG", quality=95)
        return output_path
