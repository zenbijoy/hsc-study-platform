from pathlib import Path

import pytest

from app.models import ContentItem, ImportJob
from app.utils import sha256_file


def test_content_item_validation():
    # Valid formula
    formula = ContentItem(
        type="formula",
        subject="physics",
        chapter="Dynamics",
        title="Newton's Second Law",
        latex="F = ma",
        importance=5,
    )
    assert formula.type == "formula"
    assert formula.canonical_text() == "F = ma"

    # Valid MCQ
    mcq = ContentItem(
        type="mcq",
        subject="chemistry",
        chapter="Periodic Table",
        question="Which element is the most electronegative?",
        options=["Fluorine", "Oxygen", "Chlorine", "Nitrogen"],
        answer="Fluorine",
    )
    assert mcq.type == "mcq"
    assert len(mcq.options) == 4

    # Invalid difficulty range should fail validation
    with pytest.raises(ValueError):
        ContentItem(type="formula", difficulty=10)


def test_import_job_idempotency_hash(tmp_path: Path):
    sample = tmp_path / "sample.txt"
    sample.write_text("E = mc^2\nF = ma\n")
    hash1 = sha256_file(sample)
    hash2 = sha256_file(sample)
    assert hash1 == hash2
    assert len(hash1) == 64


def test_import_job_states():
    job = ImportJob(
        id="job-123",
        source_name="physics.pdf",
        source_type="application/pdf",
        source_path="/tmp/physics.pdf",
    )
    assert job.status == "queued"
    assert job.stage == "upload"

    job.status = "ready_for_review"
    job.stage = "review"
    assert job.status == "ready_for_review"
