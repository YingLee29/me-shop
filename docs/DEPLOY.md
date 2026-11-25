# Deploy lên EC2 — `mocson-product`

Tài liệu vận hành server production của shop (Mộc Sơn).

## 1. Hạ tầng đã tạo

| Thành phần | Giá trị |
|---|---|
| AWS account | `853679917312` (gói **FREE**, còn ~$100 credit, hạn 25/05/2027) |
| Region | `ap-southeast-2` (Sydney) |
| Instance | `i-0f19b1f6ca4f94331` — tên **`mocson-product`** |
| Loại | `t4g.micro` (ARM64, 1 vCPU, 1 GB RAM) + **swap 2 GB** |
| Ổ đĩa | 30 GB gp3 |
| OS | Ubuntu 24.04 LTS (arm64) |
| Elastic IP | **`52.65.121.166`** |
| Security Group | `sg-0baea94f4fbd07bd6` — mở `22` (IP admin), `80`, `443` |
| Key pair | `mocson-product-key` (private key: `~/.ssh/mocson-product-key`) |
| URL tạm | http://52-65-121-166.sslip.io |
| Admin tạm | http://admin.52-65-121-166.sslip.io |

> `sslip.io` là DNS wildcard miễn phí: `52-65-121-166.sslip.io` tự trỏ về `52.65.121.166`.
> Khi mua domain thật chỉ cần đổi cấu hình, không phải tạo lại server.

SSH (đã thêm alias trong `~/.ssh/config`):

```bash
ssh mocson-product
# hoặc đầy đủ:
ssh -i ~/.ssh/mocson-product-key ubuntu@52.65.121.166
```

**Lưu ý cổng 22**: Security Group chỉ cho IP `27.72.101.127/32` (IP lúc tạo).
Nếu IP mạng đổi, SSH sẽ timeout — cần thêm IP mới vào inbound rule của
`sg-0baea94f4fbd07bd6` (AWS Console → EC2 → Security Groups), hoặc nhờ agent
cập nhật.

Muốn SSH từ máy khác: copy file private key `~/.ssh/mocson-product-key`
sang máy đó (qua AirDrop/USB/kênh an toàn), `chmod 600`, rồi dùng lệnh trên.

## 2. Cấu trúc trên server

```
/opt/mocson-product/          ← code (rsync từ máy local)
├── .env.production           ← secret production (KHÔNG commit, đã .gitignore)
├── docker-compose.prod.yml
├── docker/php/Dockerfile.prod
├── docker/node/Dockerfile.*.prod
└── docker/nginx/prod/*.conf
```

Container: `mocson_nginx`, `mocson_php`, `mocson_queue`, `mocson_scheduler`,
`mocson_mysql`, `mocson_redis`, `mocson_frontend`, `mocson_admin`.

Chỉ nginx mở port 80 ra ngoài. MySQL/Redis không expose.

## 3. Deploy bằng Capistrano

Capistrano chạy **trên máy local**, SSH vào server để rsync code + chạy Docker.
Không cần git trên server, nên deploy được cả thay đổi chưa commit.

```bash
cd /home/le/quan-pr/my-shop

# Kiểm tra kết nối
./bin/deploy deploy:check

# Deploy đầy đủ
./bin/deploy
```

`bin/deploy` tự set `ASDF_RUBY_VERSION` và gọi `cap production <task>`.

Các task riêng lẻ:

| Lệnh | Việc |
|---|---|
| `./bin/deploy deploy:env` | Sinh `.env.production` (nếu chưa có) với secret ngẫu nhiên |
| `./bin/deploy deploy:sync` | Rsync code local → `/opt/mocson-product` |
| `./bin/deploy deploy:build` | Build image (tuần tự: php → frontend → admin) |
| `./bin/deploy deploy:up` | `docker compose up -d` |
| `./bin/deploy deploy:migrate` | `php artisan migrate --force` |
| `./bin/deploy deploy:seed` | Roles + catalog + admin (idempotent) |
| `./bin/deploy deploy:optimize` | Clear + cache config/view |
| `./bin/deploy deploy:restart` | Restart container |
| `./bin/deploy deploy:status` | `docker compose ps` |
| `SERVICE=php ./bin/deploy deploy:logs` | 150 dòng log của service |

Tài khoản admin production nằm trong `.env.production` trên server
(`ADMIN_EMAIL`, `ADMIN_PASSWORD`):

```bash
ssh -i ~/.ssh/mocson-product-key ubuntu@52.65.121.166 \
  'grep "^ADMIN_" /opt/mocson-product/.env.production'
```

> Build Next.js trên `t4g.micro` khá chậm (5–15 phút/lần) vì chỉ 1 GB RAM.
> Nếu cần deploy nhanh thường xuyên, nâng lên `t4g.small` (2 GB) là đủ thoải mái.

## 4. Cập nhật code hằng ngày

```bash
./bin/deploy deploy:sync
./bin/deploy deploy:build      # chỉ khi đổi code FE/BE
./bin/deploy deploy:up
./bin/deploy deploy:migrate
./bin/deploy deploy:optimize
```

Hoặc gộp: `./bin/deploy`.

## 5. Khi mua domain thật

Ví dụ `mocson.vn` + `admin.mocson.vn`:

1. **DNS**: trỏ `A` record `mocson.vn` và `admin.mocson.vn` → `52.65.121.166`
   (hoặc dùng Cloudflare proxy).
2. **Sửa `config/deploy/production.rb`**:
   ```ruby
   set :app_url,   "https://mocson.vn"
   set :admin_url, "https://admin.mocson.vn"
   set :app_host,  "mocson.vn"
   set :admin_host, "admin.mocson.vn"
   ```
3. **Sửa `.env.production` trên server** (APP_URL, FRONTEND_URL, ADMIN_URL,
   SANCTUM_STATEFUL_DOMAINS) rồi `cap production deploy:restart`.
4. **Nginx**: `docker/nginx/prod/admin.conf` đang dùng `server_name admin.*`
   nên vẫn khớp `admin.mocson.vn`. Frontend là `default_server`.
5. **SSL** (chọn 1):
   - **Cloudflare** (dễ nhất): bật proxy, SSL mode *Full (strict)*, tạo
     Origin Certificate dán vào `docker/nginx/certs/` + thêm server 443.
   - **Let's Encrypt**: cài `certbot` trên host, mount cert vào nginx.

> `NEXT_PUBLIC_API_URL` đang là `/api/v1` (tương đối) nên **đổi domain không cần
> rebuild** frontend/admin.

## 6. Backup database

Chạy tay:

```bash
ssh -i ~/.ssh/mocson-product-key ubuntu@52.65.121.166 \
  'cd /opt/mocson-product && docker compose --env-file .env.production -f docker-compose.prod.yml exec -T mysql \
   sh -c "exec mysqldump -uroot -p\$MYSQL_ROOT_PASSWORD --single-transaction --routines --triggers \$MYSQL_DATABASE"' \
  > backup-$(date +%F).sql
```

Nên thêm cron trên server đẩy file lên S3/R2 (xem `docs/` sau).

## 7. Xử lý sự cố

```bash
# Xem RAM/swap
ssh ... 'free -h; docker stats --no-stream'

# Log từng service
SERVICE=php cap production deploy:logs
SERVICE=mysql cap production deploy:logs
SERVICE=nginx cap production deploy:logs

# Vào container
ssh ... 'cd /opt/mocson-product && docker compose --env-file .env.production -f docker-compose.prod.yml exec php sh'

# Artisan
ssh ... 'cd /opt/mocson-product && docker compose --env-file .env.production -f docker-compose.prod.yml exec -T php php artisan about'
```

Nếu hết RAM (OOM): kiểm tra `docker stats`, giảm `pm.max_children`, hoặc nâng
instance type (`t4g.small`).

## 8. Chi phí

| Khoản | Ước tính |
|---|---|
| EC2 `t4g.micro` | ~$6/tháng |
| Elastic IP | ~$3.6/tháng |
| EBS 30 GB gp3 | ~$2.4/tháng |
| **Tổng** | **~$12/tháng**, trừ vào credit $100 (đủ ~8 tháng) |

Không gắn thẻ, không bật Paid plan. Hết credit hoặc hết hạn Free plan
(25/05/2027) thì cần quyết định chuyển sang Paid hoặc hạ tầng khác.
