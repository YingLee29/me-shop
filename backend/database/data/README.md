# Dữ liệu danh mục sản phẩm

Thư mục này chứa nguồn dữ liệu sản phẩm được nhập từ file Excel của nhà cung cấp.

| File | Mô tả |
|---|---|
| `mo-ta-san-pham.xlsx` | File gốc (35 sản phẩm An Khương) |
| `build_catalog.py` | Script chuyển Excel → `products.json` |
| `products.json` | Dữ liệu đã chuẩn hoá để seeder Laravel đọc |

## Cập nhật lại danh mục

1. Thay file `mo-ta-san-pham.xlsx` bằng file mới (giữ nguyên các cột:
   Mã sản phẩm, SKU, Tên sản phẩm, Mô tả sản phẩm).
2. Cập nhật bảng `CATEGORY_BY_SKU` trong `build_catalog.py` nếu có mã sản phẩm mới.
3. Sinh lại JSON:

   ```bash
   python3 backend/database/data/build_catalog.py
   ```

4. Nạp vào database (trong Docker):

   ```bash
   docker exec nongsan_php php artisan db:seed --class=ProductCatalogSeeder --force
   ```

Seeder chạy lại nhiều lần được: sản phẩm được upsert theo `sku`,
sản phẩm cũ không còn trong danh sách sẽ bị soft-delete và ẩn khỏi shop.

## Quy ước hiện tại

- Giá bán: **1.000đ** cho tất cả sản phẩm (giá tạm, sẽ cập nhật sau).
- Tồn kho: 100.
- Ảnh: placeholder `placehold.co` (chưa có ảnh thật từ nhà cung cấp).
- Danh mục: 7 danh mục mới; 14 danh mục nông sản cũ được ẩn (`is_active = false`).
