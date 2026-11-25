#!/usr/bin/env python3
"""
Chuyển file Excel "mô tả sản phẩm.xlsx" thành backend/database/data/products.json
để seeder Laravel (ProductCatalogSeeder) nạp vào database.

Cách dùng:
    python3 backend/database/data/build_catalog.py
"""

import html
import json
import re
import unicodedata
from pathlib import Path

import openpyxl

BASE_DIR = Path(__file__).resolve().parent
SOURCE_XLSX = BASE_DIR / "mo-ta-san-pham.xlsx"
OUTPUT_JSON = BASE_DIR / "products.json"

PRICE = 1000
STOCK = 100
ORIGIN = "Kỳ Sơn, Nghệ An"

# ── Danh mục mới ────────────────────────────────────────────────
CATEGORIES = [
    {
        "key": "tra-cot-gung",
        "name": "Trà & Cốt Gừng",
        "slug": "tra-cot-gung",
        "icon": "🍵",
        "description": "Trà gừng, cốt gừng, cao gừng và các thức uống ấm cơ thể từ gừng Kỳ Sơn.",
        "sort_order": 1,
    },
    {
        "key": "vien-ngam",
        "name": "Viên Ngậm Gừng",
        "slug": "vien-ngam-gung",
        "icon": "🍬",
        "description": "Viên ngậm gừng, gừng chanh muối giúp dịu họng, giảm ho, giữ ấm.",
        "sort_order": 2,
    },
    {
        "key": "tinh-dau",
        "name": "Tinh Dầu Gừng",
        "slug": "tinh-dau-gung",
        "icon": "💧",
        "description": "Tinh dầu gừng nguyên chất: giảm đau mỏi, giữ ấm, thư giãn và khử mùi.",
        "sort_order": 3,
    },
    {
        "key": "bot",
        "name": "Bột Gừng & Tinh Bột",
        "slug": "bot-gung-tinh-bot",
        "icon": "🥣",
        "description": "Bột trà gừng, bột chuối xanh, tinh bột nghệ — tiện lợi cho bữa ăn lành mạnh.",
        "sort_order": 4,
    },
    {
        "key": "combo",
        "name": "Combo & Quà Tặng",
        "slug": "combo-qua-tang",
        "icon": "🎁",
        "description": "Các combo chăm sóc sức khỏe, làm đẹp và quà tặng từ An Khương.",
        "sort_order": 5,
    },
    {
        "key": "tam-cham-soc",
        "name": "Tắm & Chăm Sóc",
        "slug": "tam-cham-soc",
        "icon": "🛁",
        "description": "Nước cốt gừng tắm bé, ngâm tắm thư giãn và chăm sóc cơ thể.",
        "sort_order": 6,
    },
    {
        "key": "gung-tuoi",
        "name": "Gừng Tươi",
        "slug": "gung-tuoi",
        "icon": "🫚",
        "description": "Gừng sẻ núi Kỳ Sơn tươi, cay nồng, thơm đậm, dược tính cao.",
        "sort_order": 7,
    },
]

# Mã sản phẩm (cột A) → danh mục
CATEGORY_BY_SKU = {
    "58000207260": "tra-cot-gung",
    "57007758059": "bot",
    "56408102685": "vien-ngam",
    "56200241916": "tinh-dau",
    "55550189355": "vien-ngam",
    "54850223195": "combo",
    "54050354816": "combo",
    "53800365723": "combo",
    "53407762869": "bot",
    "53350357308": "combo",
    "52350356772": "combo",
    "52050360542": "combo",
    "51750242312": "tinh-dau",
    "51700227684": "combo",
    "51600356528": "combo",
    "51350202424": "tra-cot-gung",
    "51250360354": "combo",
    "51000362427": "combo",
    "49900204337": "vien-ngam",
    "49859396092": "bot",
    "49800375678": "combo",
    "49450233252": "tinh-dau",
    "49050370202": "combo",
    "49000263332": "combo",
    "47200212720": "tra-cot-gung",
    "47000222794": "tra-cot-gung",
    "46759401256": "tra-cot-gung",
    "46050227253": "tra-cot-gung",
    "45500247280": "combo",
    "44850262226": "tam-cham-soc",
    "43225907850": "combo",
    "42475917428": "combo",
    "42275917062": "combo",
    "29843417298": "tam-cham-soc",
    "25847671995": "gung-tuoi",
}

# Sản phẩm nổi bật hiển thị trang chủ
FEATURED_SKUS = {
    "58000207260",  # Bột trà gừng
    "56408102685",  # Viên ngậm gừng
    "56200241916",  # Tinh dầu gừng
    "51350202424",  # Trà gừng hòa tan
    "47200212720",  # Cốt gừng tắc
    "54850223195",  # Combo dưỡng ẩm tử cung
    "25847671995",  # Gừng tươi
}


# ── Helpers ─────────────────────────────────────────────────────
def slugify(text: str) -> str:
    text = text.replace("đ", "d").replace("Đ", "D")
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:180] or "san-pham"


def normalize_text(value) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def escape(text: str) -> str:
    return html.escape(text, quote=False)


def is_heading(line: str) -> bool:
    """Tiêu đề mục: I., II., III. ... hoặc dòng ngắn mở đầu bằng emoji."""
    if re.match(r"^[IVXLC]+\.\s+", line):
        return True
    if re.match(r"^[\U0001F300-\U0001FAFF]\s*", line) and len(line) < 80 and not line.endswith("."):
        return True
    letters = [c for c in line if c.isalpha()]
    if letters and len(line) < 80 and not line.endswith("."):
        upper_ratio = sum(1 for c in letters if c.isupper()) / len(letters)
        if upper_ratio > 0.75 and len(letters) > 4:
            return True
    return False


BULLET_RE = re.compile(r"^(?:[-•✔✓+]\s*)+")
NUMBERED_RE = re.compile(r"^\d+[\.\)]\s+")


def clean_item(line: str) -> str:
    return BULLET_RE.sub("", line).strip()


def description_to_html(raw: str, product_name: str) -> str:
    """Chuyển mô tả dạng text (xuống dòng, gạch đầu dòng) sang HTML đơn giản."""
    lines = [ln.rstrip() for ln in (raw or "").splitlines()]
    # Bỏ dòng đầu nếu trùng tên sản phẩm
    while lines and not lines[0].strip():
        lines.pop(0)
    if lines and normalize_text(lines[0]) == product_name:
        lines.pop(0)

    out: list[str] = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        # Hashtag cuối bài
        if line.startswith("#"):
            tags = escape(line)
            out.append(f'<p style="color:#8a8a8a;font-size:0.88em">{tags}</p>')
            i += 1
            continue

        # Tiêu đề
        if is_heading(line):
            out.append(f"<h3>{escape(line)}</h3>")
            i += 1
            continue

        # Danh sách gạch đầu dòng
        if BULLET_RE.match(line):
            items = []
            while i < n and lines[i].strip() and BULLET_RE.match(lines[i].strip()):
                items.append(f"<li>{escape(clean_item(lines[i].strip()))}</li>")
                i += 1
            out.append("<ul>" + "".join(items) + "</ul>")
            continue

        # Danh sách đánh số
        if NUMBERED_RE.match(line):
            items = []
            while i < n and lines[i].strip() and NUMBERED_RE.match(lines[i].strip()):
                item = NUMBERED_RE.sub("", lines[i].strip())
                items.append(f"<li>{escape(item)}</li>")
                i += 1
            out.append("<ol>" + "".join(items) + "</ol>")
            continue

        # Đoạn văn thường: gộp các dòng liền nhau
        para = []
        while i < n:
            cur = lines[i].strip()
            if not cur or is_heading(cur) or BULLET_RE.match(cur) or NUMBERED_RE.match(cur) or cur.startswith("#"):
                break
            para.append(escape(cur))
            i += 1
        out.append("<p>" + "<br>".join(para) + "</p>")

    return "\n".join(out)


def make_short_description(raw: str, product_name: str, limit: int = 200) -> str:
    for line in (raw or "").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or normalize_text(line) == product_name:
            continue
        if is_heading(line):
            continue
        text = clean_item(line)
        if len(text) < 20:
            continue
        if len(text) > limit:
            cut = text[:limit].rsplit(" ", 1)[0]
            return cut.rstrip(" ,;:") + "…"
        return text
    return product_name


def truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[: limit - 1].rsplit(" ", 1)[0].rstrip(" ,;:") + "…"


def infer_unit(name: str, category: str) -> str:
    lower = name.lower()
    if category == "combo":
        return "bộ"
    if category == "gung-tuoi":
        return "kg"
    if "ml" in lower:
        return "chai"
    if category == "tinh-dau":
        return "lọ"
    return "hộp"


def placeholder_image(name: str) -> str:
    label = name if len(name) <= 45 else name[:45].rsplit(" ", 1)[0]
    from urllib.parse import quote

    return f"https://placehold.co/600x600/6B4226/FAF7F0?text={quote(label, safe='')}"


# ── Đọc Excel ───────────────────────────────────────────────────
def read_rows():
    wb = openpyxl.load_workbook(SOURCE_XLSX, data_only=True)
    ws = wb[wb.sheetnames[0]]

    header_row = None
    for idx, row in enumerate(ws.iter_rows(values_only=True), 1):
        if any("Tên Sản phẩm" in str(c or "") for c in row):
            header_row = idx
            break
    if header_row is None:
        raise SystemExit("Không tìm thấy dòng tiêu đề 'Tên Sản phẩm' trong file Excel.")

    for row in ws.iter_rows(min_row=header_row + 1, values_only=True):
        cells = list(row) + [None] * 5
        product_id = normalize_text(cells[0])
        name = normalize_text(cells[2])
        description = str(cells[3] or "").strip()
        if not product_id or not name:
            continue
        yield product_id, name, description


def main() -> None:
    products = []
    used_slugs: set[str] = set()

    for product_id, name, description in read_rows():
        category = CATEGORY_BY_SKU.get(product_id)
        if not category:
            raise SystemExit(f"Sản phẩm {product_id} chưa được gán danh mục.")

        slug = slugify(name)
        if slug in used_slugs:
            slug = f"{slug}-{product_id[-6:]}"
        used_slugs.add(slug)

        short = make_short_description(description, name)

        products.append(
            {
                "sku": f"AK-{product_id}",
                "supplier_product_id": product_id,
                "name": name,
                "slug": slug,
                "category": category,
                "short_description": short,
                "description": description_to_html(description, name),
                "price": PRICE,
                "stock_quantity": STOCK,
                "unit": infer_unit(name, category),
                "origin": ORIGIN,
                "is_featured": product_id in FEATURED_SKUS,
                "image_url": placeholder_image(name),
                "meta_title": truncate(name, 70),
                "meta_description": truncate(short, 160),
            }
        )

    if len(products) != len(CATEGORY_BY_SKU):
        print(f"⚠️  Excel có {len(products)} sản phẩm, mapping có {len(CATEGORY_BY_SKU)}.")

    payload = {"categories": CATEGORIES, "products": products}
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ Đã ghi {len(products)} sản phẩm vào {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
