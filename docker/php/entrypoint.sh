#!/bin/sh
# ─────────────────────────────────────────────────────
# Entrypoint dùng chung cho php / queue / scheduler
# ─────────────────────────────────────────────────────
set -e

cd /var/www/backend

mkdir -p \
    storage/app/public \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

# Chỉ chạy bootstrap Laravel cho container php-fpm (tránh ghi đè cache song song)
if [ "${SKIP_ARTISAN_BOOTSTRAP:-0}" != "1" ]; then
    php artisan package:discover --ansi >/dev/null 2>&1 || true
    php artisan storage:link >/dev/null 2>&1 || true
    php artisan config:cache >/dev/null 2>&1 || php artisan config:clear >/dev/null 2>&1 || true
fi

exec "$@"
