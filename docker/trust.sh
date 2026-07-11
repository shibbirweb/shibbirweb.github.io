#!/usr/bin/env bash
# Issues a localhost certificate signed by the mkcert local CA (into /certs, which
# nginx serves) and installs that CA into whichever browser NSS trust stores exist
# under the mounted host home, so the browser trusts https://localhost without a
# "not secure" warning. On Linux, browsers read NSS (not the system trust store),
# and snap browsers keep their NSS under ~/snap/<app>/..., so each store is handled
# explicitly. Runs as the host user; nothing is installed on the host.
set -euo pipefail

HOSTHOME="${HOSTHOME:-/host}"
CERTS="${CERTS:-/certs}"
export CAROOT="$HOSTHOME/.local/share/mkcert"

mkdir -p "$CAROOT" "$CERTS"

# Server cert signed by the local CA (mkcert creates the CA in CAROOT if missing).
if [ ! -f "$CERTS/localhost.pem" ] || [ ! -f "$CERTS/localhost-key.pem" ]; then
    mkcert -cert-file "$CERTS/localhost.pem" -key-file "$CERTS/localhost-key.pem" \
        localhost 127.0.0.1 ::1
fi

ROOTCA="$CAROOT/rootCA.pem"
if [ ! -f "$ROOTCA" ]; then
    echo "error: no rootCA.pem in $CAROOT" >&2
    exit 1
fi

trust_db() {
    # $1 = NSS database directory (holds cert9.db)
    local db="$1"
    mkdir -p "$db"
    [ -f "$db/cert9.db" ] || certutil -d "sql:$db" -N --empty-password >/dev/null 2>&1 || true
    if certutil -d "sql:$db" -L -n mkcert-dev-CA >/dev/null 2>&1; then
        echo "  already trusted: $db"
    elif certutil -d "sql:$db" -A -t "CT,C,C" -n mkcert-dev-CA -i "$ROOTCA" 2>/dev/null; then
        echo "  trusted: $db"
    else
        echo "  skipped (could not write): $db"
    fi
}

echo "Installing the local CA into browser trust stores..."

# Chromium / Chrome: shared NSS for deb builds, confined NSS for the snap build.
trust_db "$HOSTHOME/.pki/nssdb"
[ -d "$HOSTHOME/snap/chromium" ] && trust_db "$HOSTHOME/snap/chromium/current/.pki/nssdb"

# Firefox: one NSS db per profile, for both deb and snap installs. Only touch
# profiles that already exist (a profile has an nss cert db).
for base in \
    "$HOSTHOME/.mozilla/firefox" \
    "$HOSTHOME/snap/firefox/common/.mozilla/firefox"; do
    [ -d "$base" ] || continue
    for profile in "$base"/*/; do
        [ -f "${profile}cert9.db" ] || [ -f "${profile}cert8.db" ] || continue
        trust_db "${profile%/}"
    done
done

echo "Done. Restart the browser if it was already open."
