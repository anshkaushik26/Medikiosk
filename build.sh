#!/bin/bash
set -o errexit

pip install -r MediKiosk/backend/requirements.txt

# If you have any database migrations, uncomment:
# python MediKiosk/backend/app/main.py  # or your migration command

echo "Build completed successfully"
