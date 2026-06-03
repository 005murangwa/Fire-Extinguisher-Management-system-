#!/usr/bin/env bash
# Boot every backend service briefly and confirm it starts listening and that
# its router + Swagger UI are wired. The database is expected to be down here,
# so /health returns 503 (degraded) which still proves the process booted.
set -u

declare -A SERVICES=(
  [auth-service]=4001
  [user-service]=4002
  [extinguisher-service]=4003
  [inspection-service]=4004
  [notification-service]=4005
  [reporting-service]=4006
)

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fail=0

for svc in "${!SERVICES[@]}"; do
  port="${SERVICES[$svc]}"
  node "${ROOT}/services/${svc}/src/server.js" >/tmp/${svc}.log 2>&1 &
  pid=$!
  sleep 2
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}/health")
  docs=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}/docs/")
  if [[ "$code" == "200" || "$code" == "503" ]]; then
    echo "OK   ${svc} (health=${code}, docs=${docs})"
  else
    echo "FAIL ${svc} (health=${code})"; cat /tmp/${svc}.log; fail=1
  fi
  kill $pid 2>/dev/null; wait $pid 2>/dev/null
done

exit $fail
