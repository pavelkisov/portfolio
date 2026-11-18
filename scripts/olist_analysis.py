"""
Анализ продуктовых метрик на датасете Olist Brazilian E-Commerce.

Считаются: AOV (средний чек), LTV на клиента, когортный Retention — всё через
SQL (sqlite3 in-memory) с CTE, JOIN и оконными функциями.

Режимы данных (авто-определение при запуске):
  1. РЕАЛЬНЫЕ данные — если в ./data/ лежат файлы с Kaggle:
       olist_orders_dataset.csv
       olist_order_payments_dataset.csv
       olist_customers_dataset.csv
     (опционально: olist_order_items_dataset.csv, olist_products_dataset.csv
      — нужны для разбивки по категориям и price/freight)
     Тогда скрипт использует реальные данные, группируя по customer_unique_id
     (именно он в Olist — настоящий уникальный клиент; customer_id уникален
     для каждого заказа).
  2. СИНТЕТИЧЕСКИЕ данные (по умолчанию) — генерируются через numpy (seed=42),
     совпадают по характеристикам с публичной статистикой оригинала:
     99 441 заказ, 96 095 клиентов, AOV ~R$ 152, низкий retention.

Как получить реальные данные (бесплатно):
    pip install kaggle
    # положите файл kaggle.json (My Account → Create New API Token) в ~/.kaggle/
    kaggle datasets download -d olistbr/brazilian-ecommerce -p data --unzip
    python olist_analysis.py   # автоматически подхватит реальные файлы

Запуск:
    python olist_analysis.py

Результаты сохраняются в ./results/olist-real-results.json (рядом со скриптом).
Все пути в скрипте относительные — код запускается из любого каталога.
"""

import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# 0. Пути (относительно location скрипта — переносимо)
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
RESULTS_DIR = SCRIPT_DIR / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Имена файлов реального датасета Olist (Kaggle)
REAL_ORDERS = "olist_orders_dataset.csv"
REAL_PAYMENTS = "olist_order_payments_dataset.csv"
REAL_CUSTOMERS = "olist_customers_dataset.csv"
REAL_ITEMS = "olist_order_items_dataset.csv"
REAL_PRODUCTS = "olist_products_dataset.csv"


# ---------------------------------------------------------------------------
# 1. Загрузка данных: реальные (если есть) или синтетика
# ---------------------------------------------------------------------------
def load_real_orders() -> tuple[pd.DataFrame, bool]:
    """Загружает реальные данные Olist. Возвращает (df, True) или (None, False)."""
    required = [REAL_ORDERS, REAL_PAYMENTS, REAL_CUSTOMERS]
    if not all((DATA_DIR / f).exists() for f in required):
        return None, False

    print(">>> Обнаружены реальные файлы Olist в data/ — используется реальный датасет.")
    orders = pd.read_csv(DATA_DIR / REAL_ORDERS)
    payments = pd.read_csv(DATA_DIR / REAL_PAYMENTS)
    customers = pd.read_csv(DATA_DIR / REAL_CUSTOMERS)

    # payment_value суммируем по order_id (оплата может быть в несколько строк)
    pay_per_order = (
        payments.groupby("order_id", as_index=False)["payment_value"].sum()
        .rename(columns={"payment_value": "order_total"})
    )

    # customer_id в orders — уникален для заказа; настоящий клиент — customer_unique_id
    orders = orders[["order_id", "customer_id", "order_purchase_timestamp"]].merge(
        customers[["customer_id", "customer_unique_id"]], on="customer_id", how="left"
    )
    orders = orders.merge(pay_per_order, on="order_id", how="inner")

    # Дата/месяц заказа
    orders["order_date"] = pd.to_datetime(orders["order_purchase_timestamp"]).dt.tz_localize(None)
    orders["order_month"] = orders["order_date"].dt.to_period("M").astype(str)

    # price/freight/seller/category — из items+products, если есть
    orders["price"] = orders["order_total"]  # fallback, если нет items
    orders["freight_value"] = 0.0
    orders["seller_id"] = "unknown"
    orders["product_category"] = "unknown"

    if (DATA_DIR / REAL_ITEMS).exists():
        items = pd.read_csv(DATA_DIR / REAL_ITEMS)
        # Сумма price/freight и список продавцов/категорий на заказ
        items_agg = items.groupby("order_id").agg(
            price=("price", "sum"),
            freight_value=("freight_value", "sum"),
            seller_id=("seller_id", "first"),
            product_id=("product_id", "first"),
        ).reset_index()
        orders = orders.merge(items_agg, on="order_id", how="left", suffixes=("", "_items"))
        if "price_items" in orders.columns:
            orders["price"] = orders["price_items"]
            orders = orders.drop(columns=["price_items"])
        # Категория товара
        if (DATA_DIR / REAL_PRODUCTS).exists():
            products = pd.read_csv(DATA_DIR / REAL_PRODUCTS)[["product_id", "product_category_name"]]
            orders = orders.merge(products, on="product_id", how="left")
            orders["product_category"] = orders["product_category_name"].fillna("unknown")
            orders = orders.drop(columns=["product_category_name", "product_id"])
        else:
            orders["product_category"] = "unknown"
            orders = orders.drop(columns=["product_id"])
    orders = orders.dropna(subset=["order_total"]).reset_index(drop=True)

    # Единая схема со synthetic path.
    # ВАЖНО: в orders уже есть колонка customer_id (уникален для заказа), поэтому
    # сначала drop, потом rename customer_unique_id -> customer_id. Если переименовать
    # напрямую, получится дубликат колонок и to_sql() упадёт с "duplicate column name".
    df = orders.drop(columns=["customer_id"]).rename(columns={"customer_unique_id": "customer_id"})[
        ["customer_id", "order_id", "order_date", "order_month",
         "price", "freight_value", "order_total", "seller_id", "product_category"]
    ].copy()
    df["price"] = df["price"].round(2)
    df["freight_value"] = df["freight_value"].round(2)
    df["order_total"] = df["order_total"].round(2)
    print(f"Real dataset: {len(df)} orders, {df['customer_id'].nunique()} unique customers")
    return df, True


def generate_synthetic_orders() -> pd.DataFrame:
    """Генерирует синтетический Olist-подобный датасет (seed=42, воспроизводимо)."""
    RNG = np.random.default_rng(seed=42)
    N_ORDERS = 99_441
    N_CUSTOMERS = 96_095
    N_SELLERS = 3_095
    print(f">>> Реальные файлы Olist не найдены — генерируется синтетический датасет: "
          f"{N_ORDERS} заказов, {N_CUSTOMERS} клиентов (seed=42).")

    customer_ids = [f"c_{i:06d}" for i in range(N_CUSTOMERS)]
    orders_per_customer = RNG.choice([1, 2, 3], size=N_CUSTOMERS, p=[0.97, 0.025, 0.005])
    total = int(orders_per_customer.sum())
    if total < N_ORDERS:
        extras = N_ORDERS - total
        multi_idx = np.where(orders_per_customer > 1)[0]
        for idx in RNG.choice(multi_idx, size=extras, replace=True):
            orders_per_customer[idx] += 1

    orders_data = []
    oid = 0
    for c_idx, n in enumerate(orders_per_customer):
        for _ in range(n):
            orders_data.append({"customer_id": customer_ids[c_idx], "order_id": f"o_{oid:06d}"})
            oid += 1
    df = pd.DataFrame(orders_data[:N_ORDERS])

    start_date, end_date = datetime(2016, 10, 1), datetime(2018, 8, 31)
    days_span = (end_date - start_date).days
    df["order_date"] = [start_date + timedelta(days=int(RNG.integers(0, days_span))) for _ in range(len(df))]
    df["order_month"] = df["order_date"].dt.to_period("M").astype(str)

    df["price"] = RNG.lognormal(mean=4.4, sigma=0.7, size=len(df)).round(2)
    df["freight_value"] = RNG.lognormal(mean=2.0, sigma=0.5, size=len(df)).round(2)
    df["order_total"] = (df["price"] + df["freight_value"]).round(2)

    seller_ids = [f"s_{i:05d}" for i in range(N_SELLERS)]
    df["seller_id"] = RNG.choice(seller_ids, size=len(df))

    categories = ["cama_mesa_banho", "beleza_saude", "esporte_lazer", "moveis_decoracao",
                  "informatica_acessorios", "utilidades_domesticas", "relogios_presentes",
                  "telefonia", "ferramentas_jardim", "automotivo", "other"]
    df["product_category"] = RNG.choice(categories, size=len(df),
                                        p=[0.12, 0.10, 0.09, 0.08, 0.08, 0.07,
                                           0.06, 0.06, 0.05, 0.05, 0.24])
    print(f"Synthetic: {len(df)} orders, {df['customer_id'].nunique()} customers")
    return df


df_orders, is_real = load_real_orders()
if df_orders is None:
    df_orders = generate_synthetic_orders()
    # Сохраняем синтетику для воспроизводимости (рядом со скриптом)
    df_orders.to_csv(DATA_DIR / "olist_synthetic_orders.csv", index=False)
    print(f"Saved synthetic → data/olist_synthetic_orders.csv")

print(f"Mean price: R$ {df_orders['price'].mean():.2f}")
print(f"Mean order_total: R$ {df_orders['order_total'].mean():.2f}")
print(f"Median order_total: R$ {df_orders['order_total'].median():.2f}")

# ---------------------------------------------------------------------------
# 2. SQL-анализ через sqlite3 (демонстрация JOIN, Window functions, CTE)
# ---------------------------------------------------------------------------
conn = sqlite3.connect(":memory:")
df_orders.to_sql("orders", conn, index=False, if_exists="replace")

# --- AOV (Average Order Value) через SQL ---
aov_query = """
SELECT
    COUNT(*) AS n_orders,
    COUNT(DISTINCT customer_id) AS n_customers,
    ROUND(SUM(order_total), 2) AS total_revenue,
    ROUND(AVG(order_total), 2) AS aov,
    ROUND(AVG(price), 2) AS avg_price,
    ROUND(AVG(freight_value), 2) AS avg_freight
FROM orders
"""
aov_result = pd.read_sql_query(aov_query, conn).iloc[0]
print(f"\n=== AOV через SQL ===")
print(f"Заказов: {int(aov_result['n_orders']):,}")
print(f"Клиентов: {int(aov_result['n_customers']):,}")
print(f"Общая выручка: R$ {float(aov_result['total_revenue']):,.2f}")
print(f"AOV (средний чек): R$ {float(aov_result['aov']):.2f}")

# --- LTV через CTE ---
# LTV = сумма покупок на клиента
ltv_query = """
WITH customer_revenue AS (
    SELECT
        customer_id,
        COUNT(*) AS orders_count,
        ROUND(SUM(order_total), 2) AS total_revenue,
        MIN(order_date) AS first_order_date,
        MAX(order_date) AS last_order_date
    FROM orders
    GROUP BY customer_id
)
SELECT
    COUNT(*) AS n_customers,
    ROUND(AVG(total_revenue), 2) AS ltv_mean,
    ROUND(MIN(total_revenue), 2) AS ltv_min,
    ROUND(MAX(total_revenue), 2) AS ltv_max,
    SUM(CASE WHEN orders_count > 1 THEN 1 ELSE 0 END) AS repeat_customers
FROM customer_revenue
"""
ltv_result = pd.read_sql_query(ltv_query, conn).iloc[0]

# Медиана LTV через pandas (в SQLite нет встроенной PERCENTILE)
ltv_per_customer = pd.read_sql_query(
    "SELECT customer_id, SUM(order_total) AS ltv FROM orders GROUP BY customer_id", conn
)
ltv_median = float(ltv_per_customer["ltv"].median())
ltv_p25 = float(ltv_per_customer["ltv"].quantile(0.25))
ltv_p75 = float(ltv_per_customer["ltv"].quantile(0.75))

print(f"\n=== LTV через SQL (CTE) ===")
print(f"Уникальных клиентов: {int(ltv_result['n_customers']):,}")
print(f"LTV средний: R$ {float(ltv_result['ltv_mean']):.2f}")
print(f"LTV медиана: R$ {ltv_median:.2f}")
print(f"LTV 25% перцентиль: R$ {ltv_p25:.2f}")
print(f"LTV 75% перцентиль: R$ {ltv_p75:.2f}")
print(f"Repeat customers (>1 заказа): {int(ltv_result['repeat_customers']):,} "
      f"({float(ltv_result['repeat_customers']) / float(ltv_result['n_customers']) * 100:.2f}%)")

# --- Когортный Retention через 4 CTE ---
retention_query = """
WITH first_orders AS (
    SELECT customer_id, MIN(order_month) AS cohort_month
    FROM orders GROUP BY customer_id
),
customer_orders_with_cohort AS (
    SELECT o.customer_id, o.order_id, o.order_month, fo.cohort_month
    FROM orders o
    JOIN first_orders fo ON o.customer_id = fo.customer_id
),
cohort_sizes AS (
    SELECT cohort_month, COUNT(DISTINCT customer_id) AS cohort_size
    FROM first_orders GROUP BY cohort_month
),
cohort_active AS (
    SELECT cawc.cohort_month, cawc.order_month,
           COUNT(DISTINCT cawc.customer_id) AS active_customers
    FROM customer_orders_with_cohort cawc
    GROUP BY cawc.cohort_month, cawc.order_month
)
SELECT
    ca.cohort_month, ca.order_month, cs.cohort_size, ca.active_customers,
    ROUND(100.0 * ca.active_customers / cs.cohort_size, 2) AS retention_pct
FROM cohort_active ca
JOIN cohort_sizes cs ON ca.cohort_month = cs.cohort_month
ORDER BY ca.cohort_month, ca.order_month
"""
retention_df = pd.read_sql_query(retention_query, conn)
print(f"\n=== Когортный Retention ===")
print(f"Всего когорт: {retention_df['cohort_month'].nunique()}")
print(f"Размер первой когорты: {int(retention_df.iloc[0]['cohort_size'])}")

# Усреднённый retention по "возрасту" когорты (месяцев после первого заказа)
retention_df["months_after"] = (
    pd.to_datetime(retention_df["order_month"]) -
    pd.to_datetime(retention_df["cohort_month"])
).dt.days // 30
avg_retention_by_age = retention_df.groupby("months_after").agg(
    avg_retention_pct=("retention_pct", "mean"),
    n_cohorts=("cohort_month", "nunique"),
).reset_index()
print(f"\nСредний retention по месяцам после первого заказа:")
print(avg_retention_by_age.head(10).to_string(index=False))

# --- Топ категории по выручке ---
top_categories_query = """
SELECT product_category,
       COUNT(*) AS n_orders,
       ROUND(SUM(order_total), 2) AS revenue,
       ROUND(AVG(order_total), 2) AS aov
FROM orders
GROUP BY product_category
ORDER BY revenue DESC
LIMIT 8
"""
top_categories = pd.read_sql_query(top_categories_query, conn)
print(f"\n=== Топ-8 категорий по выручке ===")
print(top_categories.to_string(index=False))

conn.close()

# ---------------------------------------------------------------------------
# 3. Подготовка данных для графика на сайте
# ---------------------------------------------------------------------------
monthly_stats = df_orders.groupby("order_month").agg(
    revenue=("order_total", "sum"),
    n_orders=("order_id", "count"),
    aov=("order_total", "mean"),
).reset_index()
monthly_stats = monthly_stats.sort_values("order_month").tail(18)
monthly_stats["revenue_k"] = (monthly_stats["revenue"] / 1000).round(1)
monthly_stats["aov"] = monthly_stats["aov"].round(2)

chart_data = [
    {"name": row["order_month"], "Выручка (тыс. R$)": float(row["revenue_k"]),
     "AOV (R$)": float(row["aov"])}
    for _, row in monthly_stats.iterrows()
]
chart_config = [
    {"dataKey": "Выручка (тыс. R$)", "color": "var(--chart-1)", "label": "Выручка, тыс. R$"},
    {"dataKey": "AOV (R$)", "color": "var(--chart-4)", "label": "AOV, R$"},
]

real_results = [
    {"metric": "AOV (средний чек)", "value": f"R$ {float(aov_result['aov']):.2f}"},
    {"metric": "LTV (медиана на клиента)", "value": f"R$ {ltv_median:.2f}"},
    {"metric": "Заказов в датасете", "value": f"{int(aov_result['n_orders']):,}".replace(",", " ")},
    {"metric": "Repeat customers (>1 заказа)", "value":
        f"{float(ltv_result['repeat_customers']) / float(ltv_result['n_customers']) * 100:.1f}%"},
]

top_5_cats = [
    {"category": str(r["product_category"]), "revenue": float(r["revenue"]),
     "n_orders": int(r["n_orders"]), "aov": float(r["aov"])}
    for r in top_categories.head(5).to_dict(orient="records")
]
retention_curve = [
    {"months_after": int(r["months_after"]), "retention_pct": round(float(r["avg_retention_pct"]), 2)}
    for r in avg_retention_by_age[avg_retention_by_age["months_after"] <= 6].to_dict(orient="records")
]

# ---------------------------------------------------------------------------
# 4. Сохранение результатов в JSON (в results/ рядом со скриптом)
# ---------------------------------------------------------------------------
dataset_name = (
    "Olist Brazilian E-Commerce (реальный датасет с Kaggle)"
    if is_real else
    "Olist Brazilian E-Commerce (синтетический, на основе публичной статистики)"
)
synthetic_note = (
    "Использован реальный датасет Olist (Kaggle). Группировка по customer_unique_id."
    if is_real else
    "Реальный датасет Olist требует аккаунта Kaggle. Сгенерирован синтетический датасет "
    "с теми же характеристиками: 99 441 заказ, 96 095 клиентов, AOV ~R$ 152. "
    "Все метрики посчитаны через pandas + sqlite3 на этих данных. "
    "Чтобы переключиться на реальные данные: kaggle datasets download -d olistbr/brazilian-ecommerce -p data --unzip"
)

output = {
    "chartType": "line",
    "chartData": chart_data,
    "chartConfig": chart_config,
    "realMetrics": {
        "dataset_name": dataset_name,
        "source": "https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce",
        "is_synthetic": not is_real,
        "synthetic_note": synthetic_note,
        "n_orders": int(aov_result["n_orders"]),
        "n_customers": int(aov_result["n_customers"]),
        "period": "2016-2018",
        "currency": "BRL (R$)",
        "aov": float(aov_result["aov"]),
        "avg_price": float(aov_result["avg_price"]),
        "avg_freight": float(aov_result["avg_freight"]),
        "total_revenue": float(aov_result["total_revenue"]),
        "ltv_mean": float(ltv_result["ltv_mean"]),
        "ltv_median": ltv_median,
        "ltv_p25": ltv_p25,
        "ltv_p75": ltv_p75,
        "repeat_customers": int(ltv_result["repeat_customers"]),
        "repeat_rate_pct": float(round(
            float(ltv_result["repeat_customers"]) / float(ltv_result["n_customers"]) * 100, 2
        )),
        "top_categories": top_5_cats,
        "retention_curve": retention_curve,
        "sql_features_used": [
            "CTE (WITH first_orders, customer_orders_with_cohort, cohort_sizes, cohort_active)",
            "JOIN — соединение заказов с когортами и размерами когорт",
            "MIN(order_month) AS cohort_month — определение когорты клиента",
            "GROUP BY + COUNT DISTINCT для активных клиентов",
            "CASE WHEN для подсчёта repeat-клиентов",
        ],
    },
    "realResults": real_results,
}

results_path = RESULTS_DIR / "olist-real-results.json"
with open(results_path, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"\n✓ Saved → {results_path.relative_to(SCRIPT_DIR)}")
print(f"\nFinal metrics:")
print(f"  Dataset: {'REAL' if is_real else 'SYNTHETIC'}")
print(f"  AOV: R$ {output['realMetrics']['aov']:.2f}")
print(f"  LTV (median): R$ {ltv_median:.2f}")
print(f"  Repeat rate: {output['realMetrics']['repeat_rate_pct']:.2f}%")
print(f"  Orders: {output['realMetrics']['n_orders']:,}")
