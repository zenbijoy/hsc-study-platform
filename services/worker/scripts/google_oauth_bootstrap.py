from __future__ import annotations

import argparse

from google_auth_oauthlib.flow import InstalledAppFlow


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--client-secret", required=True)
    parser.add_argument("--full-drive", action="store_true", help="Request full Drive instead of drive.file")
    args = parser.parse_args()
    scope = "https://www.googleapis.com/auth/drive" if args.full_drive else "https://www.googleapis.com/auth/drive.file"
    flow = InstalledAppFlow.from_client_secrets_file(args.client_secret, scopes=[scope])
    creds = flow.run_local_server(port=0, access_type="offline", prompt="consent")
    print("\nGOOGLE_REFRESH_TOKEN=", creds.refresh_token, sep="")
    print("Keep this secret on the worker only. Do not put it in the mobile/admin client.")


if __name__ == "__main__":
    main()
