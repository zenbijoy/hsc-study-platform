from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    storage_provider: str = "local"
    warehouse_dir: Path = Path("./var/warehouse")
    inbox_dir: Path = Path("./var/inbox")
    job_db: Path = Path("./var/jobs.sqlite3")
    catalog_file: Path = Path("./var/catalog.json")
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    google_client_id: str = ""
    google_client_secret: str = ""
    google_refresh_token: str = ""
    google_drive_folder_id: str = ""
    google_drive_inbox_folder_id: str = ""
    google_drive_public_packages: bool = False
    google_application_credentials: str = ""

    # Optional Cloudflare R2 hot-storage/CDN provider. Keep Drive as the canonical origin if desired.
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket: str = ""
    r2_public_base_url: str = ""

    supabase_url: str = ""
    supabase_service_role_key: str = ""

    content_master_key_b64: str = ""
    content_master_key_version: int = 1

    default_chunk_size: int = 4 * 1024 * 1024
    max_upload_bytes: int = 2 * 1024 * 1024 * 1024
    deep_pdf_page_limit: int = 1200
    worker_concurrency: int = 4

    # Content Factory settings
    import_concurrency: int = 4
    ocr_concurrency: int = 2
    hscp_concurrency: int = 2
    ai_enabled: bool = False
    ai_max_calls_per_book: int = 3
    ai_max_total_tokens: int = 4000
    ai_timeout_seconds: int = 30
    auto_process_uploads: bool = True
    auto_publish_verified: bool = False
    min_free_disk_bytes: int = 500 * 1024 * 1024
    max_ocr_pages_per_job: int = 400
    drive_inbox_scan_interval_minutes: int = 15
    job_lease_duration_seconds: int = 120

    @property
    def allowed_origins(self) -> list[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

    def ensure_dirs(self) -> None:
        self.warehouse_dir.mkdir(parents=True, exist_ok=True)
        self.inbox_dir.mkdir(parents=True, exist_ok=True)
        self.job_db.parent.mkdir(parents=True, exist_ok=True)
        self.catalog_file.parent.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_dirs()
