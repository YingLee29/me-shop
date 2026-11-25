# frozen_string_literal: true

# ─────────────────────────────────────────────────────
# Production – EC2 mocson-product (ap-southeast-2)
# ─────────────────────────────────────────────────────
server "52.65.121.166",
       user: "ubuntu",
       roles: %w[app],
       ssh_options: { keys: [File.expand_path("~/.ssh/mocson-product-key")] }

set :branch, "main"
set :deploy_user, "ubuntu"
set :deploy_host, "52.65.121.166"

# Đổi 2 dòng này khi mua domain (ví dụ https://mocson.vn)
set :app_url, "http://52-65-121-166.sslip.io"
set :admin_url, "http://admin.52-65-121-166.sslip.io"

set :app_host, "52-65-121-166.sslip.io"
set :admin_host, "admin.52-65-121-166.sslip.io"
