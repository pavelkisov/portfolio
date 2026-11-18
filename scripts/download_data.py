"""
Скачивает реальный датасет Olist Brazilian E-Commerce и раскладывает нужные CSV
в data/. Использует kagglehub — работает БЕЗ Kaggle-аккаунта и API-ключа
(датасет публичный). После скачивания olist_analysis.py автоматически
переключается на реальные данные, а olist_eda.ipynb можно запускать.

Запуск:
    pip install kagglehub
    python download_data.py
"""

import shutil
from pathlib import Path

try:
    import kagglehub
except ImportError:
    raise SystemExit(
        "kagglehub не установлен. Выполните: pip install kagglehub"
    )

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Файлы, нужные скрипту и ноутбуку
NEEDED = [
    "olist_orders_dataset.csv",
    "olist_order_payments_dataset.csv",
    "olist_customers_dataset.csv",
    "olist_order_items_dataset.csv",
    "olist_products_dataset.csv",
]

print(">>> Скачивается Olist Brazilian E-Commerce (~50 МБ) через kagglehub…")
path = Path(kagglehub.dataset_download("olistbr/brazilian-ecommerce"))
print(f">>> Датасет: {path}")

for name in NEEDED:
    src = path / name
    if not src.exists():
        print(f"!! В датасете нет файла {name} — пропущен")
        continue
    shutil.copy2(src, DATA_DIR / name)
    print(f"OK data/{name}  ({(DATA_DIR / name).stat().st_size / 1e6:.1f} МБ)")

print("\nГотово. Теперь запустите: python olist_analysis.py")
print("(скрипт сам обнаружит реальные файлы и пересчитает метрики)")
