from pathlib import Path
import os
from app.hscp import build_hscp, decrypt_hscp, read_header


def test_hscp_roundtrip(tmp_path: Path):
    source = tmp_path / "book.pdf"
    source.write_bytes(os.urandom(2_500_000))
    package = tmp_path / "book.hscp"
    out = tmp_path / "out.pdf"
    result = build_hscp(source, package, book_id="book-1", version=3, chunk_size=300_000)
    header, offset = read_header(package)
    assert header["bookId"] == "book-1"
    assert header["version"] == 3
    assert len(header["chunks"]) > 1
    assert offset > 12
    decrypt_hscp(package, out, result.content_key)
    assert out.read_bytes() == source.read_bytes()
