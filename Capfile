# frozen_string_literal: true

# ─────────────────────────────────────────────────────
# Capistrano – điều khiển deploy qua SSH
# Không dùng SCM plugin: code được rsync thẳng từ máy local
# (phù hợp vì repo còn nhiều thay đổi chưa commit)
# ─────────────────────────────────────────────────────

require "capistrano/setup"
require "stringio"

# Tắt SCM mặc định (git) – ta tự quản lý việc đưa code lên server.
set :scm, nil

Dir.glob(File.expand_path("config/deploy/tasks/*.rake", __dir__)).sort.each { |r| import r }
