#!/usr/bin/env bash
# create-vault-symlink.sh
#
# Creates a symbolic link from /vault (the Obsidian knowledge base)
# to apps/web/content so that edits made inside Obsidian are
# immediately reflected in the web application without any copy step.
#
# Usage:
#   bash scripts/create-vault-symlink.sh [--repo-root <path>]
#
# The script is safe to run multiple times (idempotent).

set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve the monorepo root.  Default to the directory that contains this
# script's parent (i.e. <repo-root>/scripts/ → <repo-root>).
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(cd "${SCRIPT_DIR}/.." && pwd)}"

# Allow an explicit override from the command line: --repo-root <path>
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo-root)
      REPO_ROOT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

VAULT_DIR="${REPO_ROOT}/vault"
CONTENT_DIR="${REPO_ROOT}/apps/web/content"

echo "🔗  Sapient monorepo — vault symlink setup"
echo "    Repo root : ${REPO_ROOT}"
echo "    Vault     : ${VAULT_DIR}"
echo "    Content   : ${CONTENT_DIR}"
echo ""

# ---------------------------------------------------------------------------
# Ensure the vault directory exists (Obsidian creates it, but guard anyway).
# ---------------------------------------------------------------------------
if [[ ! -d "${VAULT_DIR}" ]]; then
  echo "📁  Creating vault directory: ${VAULT_DIR}"
  mkdir -p "${VAULT_DIR}"
fi

# ---------------------------------------------------------------------------
# Handle the content path:
#   • If it is already a symlink pointing at vault → nothing to do.
#   • If it is a real directory with files → back it up first, then link.
#   • If it does not exist → create the parent dirs and link.
# ---------------------------------------------------------------------------
if [[ -L "${CONTENT_DIR}" ]]; then
  EXISTING_TARGET="$(readlink -f "${CONTENT_DIR}")"
  CANONICAL_VAULT="$(readlink -f "${VAULT_DIR}")"
  if [[ "${EXISTING_TARGET}" == "${CANONICAL_VAULT}" ]]; then
    echo "✅  Symlink already exists and is correct — nothing to do."
    exit 0
  else
    echo "⚠️   Removing stale symlink (was pointing to: ${EXISTING_TARGET})"
    rm "${CONTENT_DIR}"
  fi
elif [[ -d "${CONTENT_DIR}" ]]; then
  BACKUP_DIR="${CONTENT_DIR}.bak.$(date +%Y%m%d_%H%M%S)"
  echo "📦  Backing up existing content directory to: ${BACKUP_DIR}"
  mv "${CONTENT_DIR}" "${BACKUP_DIR}"
fi

# Ensure the parent directory exists.
mkdir -p "$(dirname "${CONTENT_DIR}")"

# Create the symbolic link.
ln -s "${VAULT_DIR}" "${CONTENT_DIR}"

echo "✅  Symlink created: ${CONTENT_DIR} → ${VAULT_DIR}"
echo ""
echo "Any file saved in Obsidian (${VAULT_DIR}) will now appear"
echo "instantly under apps/web/content for the web application."
