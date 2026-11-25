# frozen_string_literal: true

set :application, "mocson-product"
set :deploy_to, "/opt/mocson-product"
set :compose_file, "docker-compose.prod.yml"
set :env_file, ".env.production"
set :keep_releases, 0

set :local_root, File.expand_path("..", __dir__)
set :ssh_key, File.expand_path("~/.ssh/mocson-product-key")

set :ssh_options, {
  keys: [fetch(:ssh_key)],
  auth_methods: %w[publickey],
  verify_host_key: :never,
  forward_agent: false,
  keepalive: true,
  keepalive_interval: 30,
}

# Không đẩy những thứ không cần / không được ghi đè lên server
set :rsync_excludes, %w[
  .git
  .github
  .idea
  .vscode
  node_modules
  .next
  vendor
  backend/vendor
  backend/node_modules
  backend/.env
  backend/storage/logs
  backend/storage/framework/cache
  backend/storage/framework/sessions
  backend/storage/framework/views
  backend/bootstrap/cache
  .env
  .env.production
  docker/nginx/certs
  composer.phar
  composer-setup.php
  backend-scaffold
  docs
  log
]
