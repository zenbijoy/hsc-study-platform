from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path


class OcrProvider(ABC):
    @abstractmethod
    def extract_pdf_pages(self, pdf: Path, pages: list[int]) -> dict[int, str]: ...


class DisabledOcrProvider(OcrProvider):
    def extract_pdf_pages(self, pdf: Path, pages: list[int]) -> dict[int, str]:
        return {}


class TesseractHook(OcrProvider):
    """Optional extension point.

    Install `pytesseract`, system Tesseract and Bengali language data, then implement page rendering
    and OCR here. The core starter intentionally does not pretend a 300 MB scanned Bengali book can
    be OCRed instantly or reliably without a configured OCR engine.
    """

    def extract_pdf_pages(self, pdf: Path, pages: list[int]) -> dict[int, str]:
        raise RuntimeError("Tesseract hook is not enabled. See docs/OCR.md")
