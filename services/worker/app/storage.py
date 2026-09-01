from __future__ import annotations

import mimetypes
import os
import shutil
from abc import ABC, abstractmethod
from pathlib import Path

from app.config import settings
from app.models import StorageObject


class StorageProvider(ABC):
    @abstractmethod
    def put(self, path: Path, logical_name: str, public: bool = False, metadata: dict | None = None) -> StorageObject: ...


class LocalStorageProvider(StorageProvider):
    def __init__(self, root: Path):
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def put(self, path: Path, logical_name: str, public: bool = False, metadata: dict | None = None) -> StorageObject:
        target = self.root / logical_name
        target.parent.mkdir(parents=True, exist_ok=True)
        if path.resolve() != target.resolve():
            shutil.copy2(path, target)
        return StorageObject(provider="local", object_id=str(target.relative_to(self.root)).replace(os.sep, "/"), name=target.name, size=target.stat().st_size, delivery_url=f"/v1/content/{str(target.relative_to(self.root)).replace(os.sep, '/')}", metadata=metadata or {})


class GoogleDriveProvider(StorageProvider):
    def __init__(self):
        from google.oauth2.credentials import Credentials
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        creds = None
        if settings.google_client_id and settings.google_client_secret and settings.google_refresh_token:
            creds = Credentials(
                token=None,
                refresh_token=settings.google_refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.google_client_id,
                client_secret=settings.google_client_secret,
                scopes=["https://www.googleapis.com/auth/drive.file"],
            )
        elif settings.google_application_credentials:
            creds = service_account.Credentials.from_service_account_file(
                settings.google_application_credentials,
                scopes=["https://www.googleapis.com/auth/drive"],
            )
        if creds is None:
            raise RuntimeError("Drive credentials are not configured")
        self.service = build("drive", "v3", credentials=creds, cache_discovery=False)
        self.root_folder = settings.google_drive_folder_id or None

    def put(self, path: Path, logical_name: str, public: bool = False, metadata: dict | None = None) -> StorageObject:
        from googleapiclient.http import MediaFileUpload

        body: dict = {
            "name": logical_name.replace("/", "__"),
            "appProperties": {"hscLogicalName": logical_name, **{str(k): str(v) for k, v in (metadata or {}).items()}},
        }
        if self.root_folder:
            body["parents"] = [self.root_folder]
        media = MediaFileUpload(str(path), mimetype=mimetypes.guess_type(path.name)[0] or "application/octet-stream", resumable=True, chunksize=8 * 1024 * 1024)
        created = self.service.files().create(body=body, media_body=media, fields="id,name,size,webContentLink").execute()
        if public:
            self.service.permissions().create(fileId=created["id"], body={"type": "anyone", "role": "reader"}, fields="id").execute()
            created = self.service.files().get(fileId=created["id"], fields="id,name,size,webContentLink").execute()
        return StorageObject(provider="drive", object_id=created["id"], name=created.get("name", path.name), size=int(created.get("size") or path.stat().st_size), delivery_url=created.get("webContentLink") if public else None, metadata=metadata or {})


class R2StorageProvider(StorageProvider):
    """S3-compatible Cloudflare R2 provider for hot-cache/CDN delivery.

    The provider never makes a bucket public. If ``R2_PUBLIC_BASE_URL`` is configured,
    ``public=True`` only returns the deterministic public/CDN URL; bucket/custom-domain
    access policy must be configured separately in Cloudflare.
    """

    def __init__(self):
        import boto3

        required = {
            "R2_ACCOUNT_ID": settings.r2_account_id,
            "R2_ACCESS_KEY_ID": settings.r2_access_key_id,
            "R2_SECRET_ACCESS_KEY": settings.r2_secret_access_key,
            "R2_BUCKET": settings.r2_bucket,
        }
        missing = [name for name, value in required.items() if not value]
        if missing:
            raise RuntimeError(f"R2 credentials are not configured: {', '.join(missing)}")
        self.bucket = settings.r2_bucket
        self.client = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            region_name="auto",
        )

    def put(self, path: Path, logical_name: str, public: bool = False, metadata: dict | None = None) -> StorageObject:
        content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        extra = {
            "ContentType": content_type,
            "Metadata": {str(k): str(v) for k, v in (metadata or {}).items()},
        }
        self.client.upload_file(str(path), self.bucket, logical_name, ExtraArgs=extra)
        base = settings.r2_public_base_url.rstrip("/")
        delivery_url = f"{base}/{logical_name}" if public and base else None
        return StorageObject(
            provider="r2",
            object_id=logical_name,
            name=path.name,
            size=path.stat().st_size,
            delivery_url=delivery_url,
            metadata=metadata or {},
        )


def get_storage_provider() -> StorageProvider:
    provider = settings.storage_provider.lower()
    if provider == "drive":
        return GoogleDriveProvider()
    if provider == "r2":
        return R2StorageProvider()
    if provider != "local":
        raise RuntimeError(f"Unsupported STORAGE_PROVIDER={settings.storage_provider!r}; use local, drive or r2")
    return LocalStorageProvider(settings.warehouse_dir)
