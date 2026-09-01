from __future__ import annotations

import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

from app.canonical_syllabus import resolve_paper_alias, resolve_subject_alias
from app.config import settings
from app.models import DiscoveryCandidate, DiscoverySummary, ImportSourceType

SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".jsonl", ".ndjson", ".json", ".csv", ".md"}
IGNORED_PATTERNS = {".ds_store", "thumbs.db", ".git", ".gitignore"}


class SourceDiscoveryProvider(ABC):
    @abstractmethod
    def discover(self, location: str | Path, **options) -> DiscoverySummary: ...


class LocalFolderDiscovery(SourceDiscoveryProvider):
    def discover(self, location: str | Path, **options) -> DiscoverySummary:
        root = Path(location).resolve()
        if not root.exists() or not root.is_dir():
            raise FileNotFoundError(f"Directory not found: {root}")

        recursive = options.get("recursive", True)
        manifest_data: dict[str, Any] = {}

        # Check for optional manifest.json or import-manifest.json
        manifest_file = root / "import-manifest.json"
        if not manifest_file.exists():
            manifest_file = root / "manifest.json"
        if manifest_file.exists():
            try:
                manifest_data = json.loads(manifest_file.read_text("utf-8"))
            except Exception:
                pass

        manifest_defaults = manifest_data.get("defaults", {})
        manifest_files_map = {f.get("path"): f for f in manifest_data.get("files", []) if f.get("path")}

        candidates: list[DiscoveryCandidate] = []
        new_count = 0
        unsupported_count = 0

        iterator = root.rglob("*") if recursive else root.glob("*")
        for p in iterator:
            if not p.is_file():
                continue
            name_lower = p.name.lower()
            if name_lower.startswith((".", "~$", "_temp_")) or name_lower in IGNORED_PATTERNS or name_lower.endswith((".tmp", ".crdownload", ".part")):
                continue

            ext = p.suffix.lower()
            if ext not in SUPPORTED_EXTENSIONS:
                unsupported_count += 1
                continue

            rel_path = str(p.relative_to(root)).replace("\\", "/")
            file_meta = manifest_files_map.get(rel_path, {})

            # Extract hints from directory structure & filename
            folder_parts = list(p.relative_to(root).parent.parts)
            hint_subject = file_meta.get("subject") or manifest_defaults.get("subject")
            hint_paper = file_meta.get("paper") or manifest_defaults.get("paper")

            if not hint_subject:
                for part in reversed(folder_parts):
                    subj = resolve_subject_alias(part)
                    if subj:
                        hint_subject = subj
                        break
                if not hint_subject:
                    hint_subject = resolve_subject_alias(p.stem)

            if not hint_paper:
                for part in reversed(folder_parts):
                    pap = resolve_paper_alias(part)
                    if pap:
                        hint_paper = pap
                        break
                if not hint_paper:
                    hint_paper = resolve_paper_alias(p.stem)

            hints = {
                "folder_hierarchy": folder_parts,
                "suggested_subject": hint_subject,
                "suggested_paper": hint_paper,
                "rights_status": file_meta.get("rightsStatus") or manifest_defaults.get("rightsStatus", "UNVERIFIED"),
                "distribution_allowed": file_meta.get("distributionAllowed", manifest_defaults.get("distributionAllowed", False)),
                "offline_download_allowed": file_meta.get("offlineDownloadAllowed", manifest_defaults.get("offlineDownloadAllowed", False)),
            }

            candidates.append(
                DiscoveryCandidate(
                    source_type="local_folder",
                    source_path=str(p),
                    filename=p.name,
                    size=p.stat().st_size,
                    modified_time=str(p.stat().st_mtime),
                    hints=hints,
                    status="discovered",
                )
            )
            new_count += 1

        return DiscoverySummary(
            source_type="local_folder",
            new_files=new_count,
            already_imported=0,
            changed_files=0,
            unsupported=unsupported_count,
            candidates=candidates,
        )


class GoogleDriveInboxDiscovery(SourceDiscoveryProvider):
    def discover(self, location: str | Path = "", **options) -> DiscoverySummary:
        from app.storage import GoogleDriveProvider

        inbox_folder_id = str(location) or settings.google_drive_inbox_folder_id or settings.google_drive_folder_id
        if not inbox_folder_id:
            raise ValueError("Google Drive Inbox folder ID is not configured")

        provider = GoogleDriveProvider()
        service = provider.service

        query = f"'{inbox_folder_id}' in parents and trashed = false"
        candidates: list[DiscoveryCandidate] = []
        new_count = 0
        unsupported_count = 0

        page_token = None
        while True:
            response = service.files().list(
                q=query,
                spaces="drive",
                fields="nextPageToken, files(id, name, size, mimeType, modifiedTime, version, md5Checksum)",
                pageToken=page_token,
                pageSize=100,
            ).execute()

            files = response.get("files", [])
            for f in files:
                name = f.get("name", "")
                ext = Path(name).suffix.lower()
                if ext not in SUPPORTED_EXTENSIONS:
                    unsupported_count += 1
                    continue

                hint_subject = resolve_subject_alias(name)
                hint_paper = resolve_paper_alias(name)

                candidates.append(
                    DiscoveryCandidate(
                        source_type="drive_inbox",
                        source_path=f"drive://{f.get('id')}",
                        filename=name,
                        size=int(f.get("size") or 0),
                        modified_time=f.get("modifiedTime"),
                        drive_file_id=f.get("id"),
                        source_hash=f.get("md5Checksum"),
                        hints={
                            "drive_file_id": f.get("id"),
                            "drive_version": f.get("version"),
                            "suggested_subject": hint_subject,
                            "suggested_paper": hint_paper,
                            "rights_status": "UNVERIFIED",
                            "distribution_allowed": False,
                        },
                        status="discovered",
                    )
                )
                new_count += 1

            page_token = response.get("nextPageToken")
            if not page_token:
                break

        return DiscoverySummary(
            source_type="drive_inbox",
            new_files=new_count,
            already_imported=0,
            changed_files=0,
            unsupported=unsupported_count,
            candidates=candidates,
        )
