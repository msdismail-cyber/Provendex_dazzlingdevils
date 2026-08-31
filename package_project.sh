#!/usr/bin/env bash
set -e

ZIP_NAME="Provendex_Procurement_OS.zip"
echo "Packaging Provendex repository into ${ZIP_NAME}..."

rm -f "${ZIP_NAME}"
zip -r "${ZIP_NAME}" . -x "node_modules/*" ".next/*" ".git/*" "*.db" "${ZIP_NAME}"

echo "Provendex archive created successfully: ${ZIP_NAME}"
