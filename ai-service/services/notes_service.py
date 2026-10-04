import os
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger("noteforge.notes")

class NotesService:
    """
    Synthesizes real extracted lecture slide data into exactly 4 to 5 dense,
    high-yield student cheat-sheet pages (AKTU / University Exam Revision style).
    """

    def synthesize_lecture_notes(
        self,
        lecture_title: str,
        slide_notes: List[Dict[str, Any]],
        notes_style: str = "detailed"
    ) -> Dict[str, Any]:
        """
        Groups all real extracted slide points into 4 to 5 comprehensive Cheat Sheet pages.
        """
        all_topics = []
        all_formulas = []
        all_markers = []

        for slide in slide_notes:
            slide_title = slide.get("title", "Core Concepts")
            for t in slide.get("topics", []):
                all_topics.append(t)
                all_formulas.extend(t.get("formulas", []))
                all_markers.extend(t.get("importantMarkers", []))

        # Target 3 to 5 pages (AKTU / University One Page Exam Cheat Sheet style)
        if len(all_topics) <= 14:
            target_page_count = 3
        elif len(all_topics) <= 24:
            target_page_count = 4
        else:
            target_page_count = 5

        topics_per_page = max(4, (len(all_topics) + target_page_count - 1) // target_page_count)

        pages = []
        for page_idx in range(target_page_count):
            start_i = page_idx * topics_per_page
            end_i = min(len(all_topics), start_i + topics_per_page)
            page_topics = all_topics[start_i:end_i]

            # If page is light, ensure 4-6 dense concept blocks
            if len(page_topics) < 4 and all_topics:
                page_topics = page_topics + all_topics[:4 - len(page_topics)]

            module_names = [
                "Unit Overview & Foundational Architecture",
                "Core Mechanism, Protocols & Serializability",
                "Execution Flow, Algorithms & State Diagrams",
                "Advanced Methods, Failure Recovery & PYQs",
                "Comprehensive Quick Revision & Exam Formulas"
            ]

            subtitle = module_names[page_idx % len(module_names)]

            pages.append({
                "pageNumber": page_idx + 1,
                "title": f"{lecture_title} — {subtitle}",
                "timestamp": f"{page_idx * 5:02d}:00",
                "topics": page_topics if page_topics else [
                    {
                        "heading": "Core Definitions & Properties",
                        "points": ["Ensure full conceptual mastery of all properties.", "Review step-by-step algorithms and comparisons."],
                        "importantMarkers": ["High scoring question in university exam papers."],
                        "formulas": []
                    }
                ],
                "summary": f"High-yield revision sheet {page_idx + 1} for {lecture_title}."
            })

        flashcards = self._generate_flashcards(pages)
        mcqs = self._generate_mcqs(pages)

        return {
            "title": lecture_title,
            "totalPages": len(pages),
            "pages": pages,
            "flashcards": flashcards,
            "mcqs": mcqs,
            "keyFormulas": list(set(all_formulas)),
            "importantPoints": list(set(all_markers)),
            "notesStyle": notes_style
        }

    def _generate_flashcards(self, pages: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        cards = []
        for page in pages:
            for topic in page.get("topics", []):
                heading = topic.get("heading", "")
                points = topic.get("points", [])
                if heading and points:
                    cards.append({
                        "question": f"What are the key concepts of {heading}?",
                        "answer": " • " + "\n • ".join(points)
                    })
                for marker in topic.get("importantMarkers", []):
                    cards.append({
                        "question": f"Important exam takeaway for {heading}:",
                        "answer": marker
                    })
        return cards[:10]

    def _generate_mcqs(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        mcqs = []
        for page in pages:
            for topic in page.get("topics", []):
                heading = topic.get("heading", "")
                points = topic.get("points", [])
                if heading and len(points) >= 1:
                    correct = points[0]
                    mcqs.append({
                        "question": f"Which statement is true regarding '{heading}'?",
                        "options": [
                            correct,
                            "Arbitrary unvalidated state transitions",
                            "Deprecated non-standard legacy protocol",
                            "Uncontrolled concurrency without locking"
                        ],
                        "correctIndex": 0,
                        "explanation": f"Based on lecture slide extraction: {correct}"
                    })
        return mcqs[:6]
