#!/usr/bin/env bash
# ============================================================================
# TZW FEMS - Database Restore Script
# ----------------------------------------------------------------------------
# Restores a FEMS backup produced by backup.sh (pg_dump custom format).
#
# Usage:
#   ./database/scripts/restore.sh <path-to-backup.dump>
# ============================================================================
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-backup.dump>" >&2
  exit 1
fi

BACKUP_FILE="$1"
HOST="${POSTGRES_HOST:-localhost}"
PORT="${POSTGRES_PORT:-5432}"
DB="${POSTGRES_DB:-fems}"
USER="${POSTGRES_USER:-fems_app}"

if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "Backup file not found: ${BACKUP_FILE}" >&2
  exit 1
fi

echo "Restoring '${BACKUP_FILE}' into database '${DB}' ..."
# --clean drops objects before recreating; --if-exists avoids errors on first run.
pg_restore -h "${HOST}" -p "${PORT}" -U "${USER}" -d "${DB}" --clean --if-exists --no-owner "${BACKUP_FILE}"

echo "Restore complete."
