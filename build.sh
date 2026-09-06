#!/bin/bash
set -o errexit

pip install -r backend/requirements.txt

# If you have any database migrations, uncomment:
# python backend/app/main.py  # or your migration command

echo "Build completed successfully"
