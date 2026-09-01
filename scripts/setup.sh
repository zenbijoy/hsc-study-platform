#!/usr/bin/env bash
set -euo pipefail
npm install
python -m venv services/worker/.venv
services/worker/.venv/bin/python -m pip install --upgrade pip
services/worker/.venv/bin/pip install -e 'services/worker[dev]'
[ -f services/worker/.env ] || cp services/worker/.env.example services/worker/.env
[ -f apps/admin/.env.local ] || cp apps/admin/.env.example apps/admin/.env.local
[ -f apps/mobile/.env ] || cp apps/mobile/.env.example apps/mobile/.env
printf '\nSetup complete. See README.md for run commands.\n'
