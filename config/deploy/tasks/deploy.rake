# frozen_string_literal: true

# ─────────────────────────────────────────────────────
# Deploy tasks – rsync code + Docker Compose trên EC2
# Dùng: ./bin/deploy            (mặc định deploy:all)
#       ./bin/deploy deploy:sync
# ─────────────────────────────────────────────────────

namespace :deploy do
  desc "Kiểm tra kết nối SSH + Docker trên server"
  task :check do
    on roles(:app) do
      puts "host    : #{capture('hostname')}"
      puts "docker  : #{capture('docker --version')}"
      puts "compose : #{capture('docker compose version')}"
      puts capture("free -h | head -2")
      puts capture("df -h / | tail -1")
    end
  end

  desc "Sinh .env.production trên server nếu chưa có (secret ngẫu nhiên)"
  task :env do
    deploy_to  = fetch(:deploy_to)
    env_file   = fetch(:env_file)
    app_url    = fetch(:app_url)
    admin_url  = fetch(:admin_url)
    app_host   = fetch(:app_host)
    admin_host = fetch(:admin_host)

    on roles(:app) do
      path = "#{deploy_to}/#{env_file}"

      if test("[ -f #{path} ]")
        puts "→ #{path} đã tồn tại, giữ nguyên"
      else
        execute :mkdir, "-p", deploy_to

        db_pass    = capture("openssl rand -hex 16").strip
        root_pass  = capture("openssl rand -hex 16").strip
        redis_pass = capture("openssl rand -hex 16").strip
        app_key    = capture("openssl rand -base64 32").strip
        admin_pass = capture("openssl rand -hex 12").strip

        content = <<~ENVFILE
          APP_NAME="Moc Son"
          APP_ENV=production
          APP_KEY=base64:#{app_key}
          APP_DEBUG=false
          APP_URL=#{app_url}
          FRONTEND_URL=#{app_url}
          ADMIN_URL=#{admin_url}
          PUBLIC_SITE_URL=#{app_url}

          ADMIN_EMAIL=admin@mocson.vn
          ADMIN_PASSWORD=#{admin_pass}

          DB_CONNECTION=mysql
          DB_HOST=mysql
          DB_PORT=3306
          DB_DATABASE=mocson_db
          DB_USERNAME=mocson_user
          DB_PASSWORD=#{db_pass}
          DB_ROOT_PASSWORD=#{root_pass}

          REDIS_CLIENT=phpredis
          REDIS_HOST=redis
          REDIS_PASSWORD=#{redis_pass}
          REDIS_PORT=6379

          SESSION_DRIVER=redis
          SESSION_LIFETIME=120
          SESSION_DOMAIN=null
          QUEUE_CONNECTION=redis
          CACHE_STORE=redis
          BROADCAST_CONNECTION=log

          SANCTUM_STATEFUL_DOMAINS=#{app_host},#{admin_host}

          FILESYSTEM_DISK=public

          LOG_CHANNEL=stack
          LOG_STACK=single
          LOG_LEVEL=warning

          MAIL_MAILER=log
          MAIL_FROM_ADDRESS="no-reply@#{app_host}"
          MAIL_FROM_NAME="Moc Son"

          AWS_ACCESS_KEY_ID=
          AWS_SECRET_ACCESS_KEY=
          AWS_DEFAULT_REGION=ap-southeast-2
          AWS_BUCKET=
          AWS_USE_PATH_STYLE_ENDPOINT=false
        ENVFILE

        upload! StringIO.new(content), path
        execute :chmod, "600", path
        puts "→ Đã tạo #{path} (secret ngẫu nhiên)"
        puts "→ Admin: admin@mocson.vn / #{admin_pass}"
      end
    end
  end

  desc "Push nhánh production từ máy local lên bare repo trên EC2"
  task :push do
    require "shellwords"

    bare_repo = fetch(:bare_repo)
    branch    = fetch(:deploy_branch)
    user      = fetch(:deploy_user)
    host      = fetch(:deploy_host)
    ssh_key   = fetch(:ssh_key)

    git_ssh = "ssh -i #{ssh_key} -o StrictHostKeyChecking=no"

    run_locally do
      execute "GIT_SSH_COMMAND=#{Shellwords.escape(git_ssh)} git push --force ssh://#{user}@#{host}#{bare_repo} #{branch}:#{branch}"
    end
  end

  desc "Pull code mới nhất trên server (git fetch + reset --hard)"
  task :pull do
    deploy_to = fetch(:deploy_to)
    branch    = fetch(:deploy_branch)

    on roles(:app) do
      execute "cd #{deploy_to} && git fetch origin && git reset --hard origin/#{branch}"
      execute "cd #{deploy_to} && git log --oneline -1"
    end
  end

  desc "Rsync code từ máy local lên server (phương án dự phòng)"
  task :sync do
    require "shellwords"

    excludes   = fetch(:rsync_excludes).map { |e| "--exclude=#{Shellwords.escape(e)}" }
    ssh_key    = fetch(:ssh_key)
    local_root = fetch(:local_root)
    deploy_to  = fetch(:deploy_to)
    user       = fetch(:deploy_user)
    host       = fetch(:deploy_host)

    remote_shell = "ssh -i #{ssh_key} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

    cmd = [
      "rsync", "-az", "--delete",
      "-e", Shellwords.escape(remote_shell),
      *excludes,
      Shellwords.escape("#{local_root}/"),
      Shellwords.escape("#{user}@#{host}:#{deploy_to}/")
    ].join(" ")

    run_locally do
      execute cmd
    end
  end

  desc "Build images tuần tự (tránh OOM trên 1GB RAM)"
  task :build do
    deploy_to    = fetch(:deploy_to)
    env_file     = fetch(:env_file)
    compose_file = fetch(:compose_file)

    on roles(:app) do
      %w[php frontend admin].each do |svc|
        puts "→ Building #{svc}..."
        execute "cd #{deploy_to} && docker compose --env-file #{env_file} -f #{compose_file} build #{svc}"
      end
    end
  end

  desc "Khởi động toàn bộ stack"
  task :up do
    deploy_to    = fetch(:deploy_to)
    env_file     = fetch(:env_file)
    compose_file = fetch(:compose_file)

    on roles(:app) do
      execute "cd #{deploy_to} && docker compose --env-file #{env_file} -f #{compose_file} up -d --remove-orphans"
    end
  end

  desc "Chạy migration"
  task :migrate do
    deploy_to    = fetch(:deploy_to)
    env_file     = fetch(:env_file)
    compose_file = fetch(:compose_file)

    on roles(:app) do
      execute "cd #{deploy_to} && docker compose --env-file #{env_file} -f #{compose_file} exec -T php php artisan migrate --force"
    end
  end

  desc "Nạp roles + catalog + admin (idempotent)"
  task :seed do
    deploy_to    = fetch(:deploy_to)
    env_file     = fetch(:env_file)
    compose_file = fetch(:compose_file)

    on roles(:app) do
      execute "cd #{deploy_to} && docker compose --env-file #{env_file} -f #{compose_file} exec -T php php artisan db:seed --class=ProductionSeeder --force"
    end
  end

  desc "Tối ưu Laravel (config + view cache)"
  task :optimize do
    deploy_to    = fetch(:deploy_to)
    env_file     = fetch(:env_file)
    compose_file = fetch(:compose_file)
    base         = "cd #{deploy_to} && docker compose --env-file #{env_file} -f #{compose_file} exec -T php php artisan"

    on roles(:app) do
      execute "#{base} optimize:clear"
      execute "#{base} config:cache"
      execute "#{base} view:cache"
    end
  end

  desc "Restart toàn bộ container"
  task :restart do
    deploy_to    = fetch(:deploy_to)
    env_file     = fetch(:env_file)
    compose_file = fetch(:compose_file)

    on roles(:app) do
      execute "cd #{deploy_to} && docker compose --env-file #{env_file} -f #{compose_file} restart"
    end
  end

  desc "Trạng thái container"
  task :status do
    deploy_to    = fetch(:deploy_to)
    env_file     = fetch(:env_file)
    compose_file = fetch(:compose_file)

    on roles(:app) do
      execute "cd #{deploy_to} && docker compose --env-file #{env_file} -f #{compose_file} ps"
    end
  end

  desc "Xem log: SERVICE=php ./bin/deploy deploy:logs"
  task :logs do
    deploy_to    = fetch(:deploy_to)
    env_file     = fetch(:env_file)
    compose_file = fetch(:compose_file)
    service      = ENV.fetch("SERVICE", "")

    on roles(:app) do
      execute "cd #{deploy_to} && docker compose --env-file #{env_file} -f #{compose_file} logs --tail=150 #{service}"
    end
  end

  desc "Deploy đầy đủ (push → pull → build → up → migrate → seed)"
  task all: %i[env push pull build up migrate seed optimize status]
end
