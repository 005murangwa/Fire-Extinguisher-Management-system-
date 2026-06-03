#!/usr/bin/env bash
# ============================================================================
# TZW FEMS - Database Backup Script
# ----------------------------------------------------------------------------
# Creates a timestamped, compressed logical backup of the FEMS database using
# pg_dump. Reads connection settings from environment variables (never hard
# coded), consistent with the project security requirements.
#
# Usage:
#   ./database/scripts/backup.sh
#
# Environment (with sensible defaults):
#   POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, PGPASSWORD
# ============================================================================
set -euo pipefail

HOST="${POSTGRES_HOST:-localhost}"
PORT="${POSTGRES_PORT:-5432}"
DB="${POSTGRES_DB:-fems}"
USER="${POSTGRES_USER:-fems_app}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backups"
mkdir -p "${BACKUP_DIR}"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTFILE="${BACKUP_DIR}/fems_${TIMESTAMP}.dump"

echo "Backing up database '${DB}' to ${OUTFILE} ..."
# -F c  => custom compressed format (restore with pg_restore)
pg_dump -h "${HOST}" -p "${PORT}" -U "${USER}" -d "${DB}" -F c -f "${OUTFILE}"

echo "Backup complete: ${OUTFILE}"

# Retention: keep only the 14 most recent backups.
ls -1t "${BACKUP_DIR}"/fems_*.dump 2>/dev/null | tail -n +15 | xargs -r rm -f
echo "Old backups pruned (kept 14 most recent)."
