from __future__ import annotations

import hashlib
import json
import os
import struct
import tempfile
from dataclasses import dataclass
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.utils import b64d, b64e

MAGIC = b"HSCP0001"
HEADER_LIMIT = 4 * 1024 * 1024


@dataclass
class HscpBuildResult:
    output: Path
    content_key: bytes
    header: dict
    sha256: str


def _aad(book_id: str, version: int, index: int) -> bytes:
    return f"{book_id}:{version}:{index}".encode("utf-8")


def build_hscp(input_path: Path, output_path: Path, book_id: str, version: int = 1, chunk_size: int = 4 * 1024 * 1024, content_key: bytes | None = None) -> HscpBuildResult:
    key = content_key or os.urandom(32)
    if len(key) != 32:
        raise ValueError("HSCP requires a 32-byte AES-256 content key")
    aes = AESGCM(key)
    chunks: list[dict] = []
    rel_offset = 0
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.NamedTemporaryFile(prefix="hscp-data-", delete=False) as tmp:
        tmp_path = Path(tmp.name)
        try:
            with input_path.open("rb") as src:
                index = 0
                while True:
                    plain = src.read(chunk_size)
                    if not plain:
                        break
                    nonce = os.urandom(12)
                    cipher = aes.encrypt(nonce, plain, _aad(book_id, version, index))
                    blob = nonce + cipher
                    tmp.write(blob)
                    chunks.append({
                        "index": index,
                        "offset": rel_offset,
                        "cipherLength": len(cipher),
                        "plainLength": len(plain),
                        "nonceLength": len(nonce),
                        "sha256": hashlib.sha256(plain).hexdigest(),
                    })
                    rel_offset += len(blob)
                    index += 1

            header = {
                "schema": 1,
                "bookId": book_id,
                "version": version,
                "mediaType": "application/pdf" if input_path.suffix.lower() == ".pdf" else "application/octet-stream",
                "originalName": input_path.name,
                "originalSize": input_path.stat().st_size,
                "chunkSize": chunk_size,
                "chunks": chunks,
            }
            header_bytes = json.dumps(header, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
            if len(header_bytes) > HEADER_LIMIT:
                raise ValueError("HSCP header unexpectedly large")
            with output_path.open("wb") as out, tmp_path.open("rb") as data:
                out.write(MAGIC)
                out.write(struct.pack(">I", len(header_bytes)))
                out.write(header_bytes)
                while block := data.read(1024 * 1024):
                    out.write(block)
        finally:
            try:
                tmp_path.unlink(missing_ok=True)
            except Exception:
                pass

    return HscpBuildResult(output=output_path, content_key=key, header=header, sha256=_sha256(output_path))


def read_header(path: Path) -> tuple[dict, int]:
    with path.open("rb") as f:
        if f.read(8) != MAGIC:
            raise ValueError("Invalid HSCP magic")
        header_len = struct.unpack(">I", f.read(4))[0]
        if not 0 < header_len <= HEADER_LIMIT:
            raise ValueError("Invalid HSCP header length")
        header = json.loads(f.read(header_len))
        return header, 12 + header_len


def decrypt_hscp(path: Path, output_path: Path, content_key: bytes) -> Path:
    header, data_offset = read_header(path)
    aes = AESGCM(content_key)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("rb") as src, output_path.open("wb") as out:
        for chunk in header["chunks"]:
            src.seek(data_offset + int(chunk["offset"]))
            nonce = src.read(int(chunk["nonceLength"]))
            cipher = src.read(int(chunk["cipherLength"]))
            plain = aes.decrypt(nonce, cipher, _aad(header["bookId"], int(header["version"]), int(chunk["index"])))
            if hashlib.sha256(plain).hexdigest() != chunk["sha256"]:
                raise ValueError("HSCP plaintext hash mismatch")
            out.write(plain)
    return output_path


def wrap_content_key_for_server(content_key: bytes, master_key_b64: str, key_version: int) -> dict:
    master = b64d(master_key_b64)
    if len(master) != 32:
        raise ValueError("CONTENT_MASTER_KEY_B64 must decode to 32 bytes")
    nonce = os.urandom(12)
    aad = f"hscp-master-key:v{key_version}".encode()
    cipher = AESGCM(master).encrypt(nonce, content_key, aad)
    return {"key_version": key_version, "nonce_b64": b64e(nonce), "ciphertext_b64": b64e(cipher)}


def unwrap_content_key_from_server(wrapped: dict, master_key_b64: str) -> bytes:
    master = b64d(master_key_b64)
    aad = f"hscp-master-key:v{wrapped['key_version']}".encode()
    return AESGCM(master).decrypt(b64d(wrapped["nonce_b64"]), b64d(wrapped["ciphertext_b64"]), aad)


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while b := f.read(1024 * 1024): h.update(b)
    return h.hexdigest()
