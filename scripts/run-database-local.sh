#!/usr/bin/env bash
# Run SQL migrations and pgTAP suites against a disposable loopback-only cluster.
# Requires PostgreSQL binaries, pgTAP installed for that PostgreSQL version, and Node.
# The auth.uid() shim tests SQL role behavior; it is not a full Supabase instance.
set -euo pipefail
umask 077

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
pg_bin=${SPIRITUAL_PG_BIN:-}
if [[ -z "$pg_bin" ]]; then
  if command -v initdb >/dev/null 2>&1; then
    pg_bin=$(dirname "$(command -v initdb)")
  elif [[ -x /opt/homebrew/opt/postgresql@17/bin/initdb ]]; then
    pg_bin=/opt/homebrew/opt/postgresql@17/bin
  else
    echo 'Blocked: PostgreSQL initdb/psql/pg_ctl are not installed. Set SPIRITUAL_PG_BIN to their bin directory.' >&2
    exit 1
  fi
fi
for executable in initdb pg_ctl pg_isready createdb psql; do
  if [[ ! -x "$pg_bin/$executable" ]]; then
    echo "Blocked: $pg_bin/$executable is missing or not executable." >&2
    exit 1
  fi
done
if ! command -v node >/dev/null 2>&1 || ! command -v openssl >/dev/null 2>&1; then
  echo 'Blocked: Node.js and openssl are required.' >&2
  exit 1
fi

port=${SPIRITUAL_DB_TEST_PORT:-65432}
if [[ ! "$port" =~ ^[0-9]+$ ]] || (( 10#$port < 1024 || 10#$port > 65535 )); then
  echo 'Blocked: SPIRITUAL_DB_TEST_PORT must be an unprivileged TCP port.' >&2
  exit 1
fi
if ! command -v lsof >/dev/null 2>&1; then
  echo 'Blocked: lsof is required to confirm the loopback test port is unused.' >&2
  exit 1
fi
if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Blocked: TCP port $port is already in use; choose another SPIRITUAL_DB_TEST_PORT." >&2
  exit 1
fi

temp_root=$(mktemp -d /tmp/spritual-db.XXXXXX)
cluster_dir="$temp_root/data"
server_started=0
cleanup() {
  result=$?
  trap - EXIT
  if [[ "$server_started" -eq 1 ]]; then
    if "$pg_bin/pg_ctl" -D "$cluster_dir" status >/dev/null 2>&1; then
      if ! "$pg_bin/pg_ctl" -D "$cluster_dir" -m fast stop >/dev/null 2>&1; then
        echo "Could not stop the temporary PostgreSQL server; retained $temp_root for inspection." >&2
        exit 1
      fi
    fi
  fi
  if [[ "$temp_root" != /tmp/spritual-db.* || ! -d "$temp_root" || -L "$temp_root" || -e "$cluster_dir/postmaster.pid" ]]; then
    echo "Refusing to remove unexpected or possibly active test directory: $temp_root" >&2
    exit 1
  fi
  rm -rf -- "$temp_root"
  exit "$result"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

password=$(openssl rand -hex 24)
printf '%s\n' "$password" > "$temp_root/password"
"$pg_bin/initdb" -D "$cluster_dir" -U spritual_test_admin --locale=C -E UTF8 \
  --auth-host=scram-sha-256 --auth-local=trust --pwfile="$temp_root/password" >/dev/null
rm -f -- "$temp_root/password"
server_started=1
"$pg_bin/pg_ctl" -D "$cluster_dir" -l "$temp_root/postgres.log" \
  -o "-h 127.0.0.1 -p $port -k $temp_root" start >/dev/null
export PGPASSWORD="$password"
"$pg_bin/pg_isready" -h 127.0.0.1 -p "$port" -U spritual_test_admin >/dev/null
"$pg_bin/createdb" -h 127.0.0.1 -p "$port" -U spritual_test_admin spritual_test

"$pg_bin/psql" -h 127.0.0.1 -p "$port" -U spritual_test_admin -d spritual_test \
  --no-psqlrc --set ON_ERROR_STOP=1 --quiet <<'SQL'
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
CREATE EXTENSION pgtap;
SQL

for migration in "$repo_root"/supabase/migrations/[0-9][0-9][0-9][0-9]_*.sql; do
  printf 'Applying %s\n' "${migration##*/}"
  "$pg_bin/psql" -h 127.0.0.1 -p "$port" -U spritual_test_admin -d spritual_test \
    --no-psqlrc --single-transaction --set ON_ERROR_STOP=1 --quiet -f "$migration"
done

cd "$repo_root"
PATH="$pg_bin:$PATH" \
  DB_URL="postgresql://spritual_test_admin:$password@127.0.0.1:$port/spritual_test" \
  node scripts/test-database.mjs
