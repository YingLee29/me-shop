# ─────────────────────────────────────────────────────
# 🌾 NôngSản – Makefile
# Dùng: make <command>
# ─────────────────────────────────────────────────────

.PHONY: help up down build restart logs shell artisan composer npm-fe npm-admin

# Màu sắc terminal
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RESET  := \033[0m

help: ## Hiển thị danh sách lệnh
	@echo ""
	@echo "$(GREEN)🌾 NôngSản – Available Commands$(RESET)"
	@echo "────────────────────────────────────────"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(YELLOW)%-18s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

# ── Docker ──────────────────────────────────────────
up: ## Khởi động tất cả services
	@echo "$(GREEN)▶ Starting all services...$(RESET)"
	docker compose up -d

down: ## Dừng tất cả services
	@echo "$(YELLOW)■ Stopping all services...$(RESET)"
	docker compose down

build: ## Build lại images (dùng khi đổi Dockerfile)
	docker compose build --no-cache

restart: ## Khởi động lại tất cả services
	docker compose restart

restart-php: ## Restart chỉ PHP service
	docker compose restart php queue

restart-fe: ## Restart chỉ Frontend
	docker compose restart frontend

restart-admin: ## Restart chỉ Admin
	docker compose restart admin

ps: ## Xem trạng thái các containers
	docker compose ps

# ── Logs ────────────────────────────────────────────
logs: ## Xem logs tất cả services
	docker compose logs -f

logs-php: ## Xem logs PHP
	docker compose logs -f php

logs-nginx: ## Xem logs Nginx
	docker compose logs -f nginx

logs-fe: ## Xem logs Frontend
	docker compose logs -f frontend

logs-admin: ## Xem logs Admin
	docker compose logs -f admin

logs-queue: ## Xem logs Queue Worker
	docker compose logs -f queue

# ── Shell / Exec ─────────────────────────────────────
shell: ## Vào shell PHP container
	docker compose exec php bash

shell-mysql: ## Vào MySQL CLI
	docker compose exec mysql mysql -u nongsan_user -pnongsan_pass nongsan_db

shell-redis: ## Vào Redis CLI
	docker compose exec redis redis-cli

# ── Laravel Artisan ──────────────────────────────────
artisan: ## Chạy artisan command: make artisan CMD="migrate"
	docker compose exec php php artisan $(CMD)

migrate: ## Chạy migration
	docker compose exec php php artisan migrate

migrate-fresh: ## Reset và chạy lại toàn bộ migration + seeder
	docker compose exec php php artisan migrate:fresh --seed

seed: ## Chạy seeder
	docker compose exec php php artisan db:seed

cache-clear: ## Xóa toàn bộ cache Laravel
	docker compose exec php php artisan cache:clear
	docker compose exec php php artisan config:clear
	docker compose exec php php artisan route:clear
	docker compose exec php php artisan view:clear

# ── Composer ─────────────────────────────────────────
composer: ## Chạy composer command: make composer CMD="require package/name"
	docker compose exec php composer $(CMD)

composer-install: ## Cài packages Laravel
	docker compose exec php composer install

# ── NPM ──────────────────────────────────────────────
npm-fe: ## Chạy npm trong frontend: make npm-fe CMD="install"
	docker compose exec frontend npm $(CMD)

npm-admin: ## Chạy npm trong admin: make npm-admin CMD="install"
	docker compose exec admin npm $(CMD)

# ── Setup (chạy lần đầu) ─────────────────────────────
setup: ## Setup toàn bộ dự án lần đầu
	@echo "$(GREEN)🚀 Setting up NôngSản project...$(RESET)"
	@cp -n .env.example .env 2>/dev/null || true
	@echo "$(YELLOW)▶ Building Docker images...$(RESET)"
	docker compose build
	@echo "$(YELLOW)▶ Starting services...$(RESET)"
	docker compose up -d
	@echo "$(YELLOW)▶ Waiting for MySQL to be ready...$(RESET)"
	@sleep 15
	@echo "$(YELLOW)▶ Installing Laravel dependencies...$(RESET)"
	docker compose exec php composer install
	@echo "$(YELLOW)▶ Setting up Laravel...$(RESET)"
	docker compose exec php php artisan key:generate
	docker compose exec php php artisan storage:link
	docker compose exec php php artisan migrate --seed
	@echo "$(GREEN)✅ Setup complete!$(RESET)"
	@echo ""
	@echo "  Frontend : http://localhost:3000"
	@echo "  Admin    : http://localhost:3001"
	@echo "  API      : http://localhost/api/v1"
	@echo "  Mailpit  : http://localhost:8025"
	@echo "  MySQL    : localhost:3306"
	@echo "  Redis    : localhost:6379"
