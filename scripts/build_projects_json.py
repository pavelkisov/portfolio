"""
Собирает /public/data/projects.json — единый источник данных для графиков.

- churn-prediction: берёт РЕАЛЬНЫЕ результаты из churn-real-results.json
- остальные 4 проекта: переносятся из захардкоженных данных (как было в data.ts)

После этого data.ts содержит только метаданные (заголовки, описания, теги),
а вся информация для графиков (chartType, chartData, chartConfig) живёт в JSON,
который fetch'ится на клиенте.
"""
import json
from pathlib import Path

# Загружаем реальные результаты churn анализа
churn_path = Path("/home/z/my-project/data/processed/churn-real-results.json")
with open(churn_path, "r", encoding="utf-8") as f:
    churn = json.load(f)

# Реальные SHAP/permutation importance top-7 (из Python-расчёта на реальном датасете Telco)
churn_chart_data = churn["feature_importance_top7"]
# Нормализуем имена для понимания пользователем
churn_label_map = {
    "ContractMonths": "Тип контракта (1/12/24 мес)",
    "tenure": "Длительность (tenure)",
    "InternetService": "Тип интернет-сервиса",
    "AvgMonthlyCharges": "Средний платёж в мес",
    "OnlineSecurity": "Онлайн-безопасность",
    "TechSupport": "Тех. поддержка",
    "TotalCharges": "Сумма платежей за весь период",
    "PaperlessBilling": "Безбумажный биллинг",
    "PaymentMethod": "Метод оплаты",
    "MonthlyCharges": "Ежемесячный платёж",
}
for item in churn_chart_data:
    item["name"] = churn_label_map.get(item["name"], item["name"])
    # Округлим для чистоты
    item["value"] = round(item["value"], 4)

# Реальные метрики модели (заменим захардкоженные)
churn_real_results = [
    {"metric": "Точность модели (ROC-AUC, CV 5-fold)", "value": f"{churn['model_cv_metrics']['roc_auc_mean']:.2f}"},
    {"metric": "Recall по классу churn (test)", "value": f"{churn['test_set_metrics']['recall']:.0%}"},
    {"metric": "Размер датасета (исходно → после очистки)", "value": "7 043 → 7 032"},
    {"metric": "Реальный churn rate в данных", "value": f"{churn['dataset_info']['churn_rate']:.1%}"},
]

# Собираем все проекты в один JSON
# ВНИМАНИЕ: olist-ecommerce-analysis и ab-test-platform теперь имеют отдельные JSON
# (olist_results.json, ab_test_results.json) — генерируются соответствующими скриптами.
# В этом файле остаются только churn-prediction и marketing-attribution.
projects_json = {
    "churn-prediction": {
        "chartType": "bar",
        "chartData": churn_chart_data,
        "chartConfig": [
            {"dataKey": "value", "color": "var(--chart-1)", "label": "Permutation importance (drop в ROC-AUC при shuffle признака)"},
        ],
        "realMetrics": {
            "dataset_name": churn["dataset_info"]["name"],
            "source": churn["dataset_info"]["source"],
            "n_records": churn["dataset_info"]["n_records"],
            "churn_rate": churn["dataset_info"]["churn_rate"],
            "n_churned": churn["dataset_info"]["n_churned"],
            "algorithm": churn["model_cv_metrics"]["algorithm"],
            "roc_auc_cv_mean": churn["model_cv_metrics"]["roc_auc_mean"],
            "roc_auc_test": churn["test_set_metrics"]["roc_auc"],
            "accuracy_test": churn["test_set_metrics"]["accuracy"],
            "recall_test": churn["test_set_metrics"]["recall"],
            "precision_test": churn["test_set_metrics"]["precision"],
            "f1_test": churn["test_set_metrics"]["f1"],
            "segment_churn_rates": churn["segment_churn_rates"],
        },
        "realResults": churn_real_results,
    },
}

# Сохраняем в /public/data/projects.json
out_path = Path("/home/z/my-project/public/data/projects.json")
out_path.parent.mkdir(parents=True, exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(projects_json, f, indent=2, ensure_ascii=False)

print(f"✓ Saved → {out_path}")
print(f"  Keys: {list(projects_json.keys())}")
print(f"  churn real metrics: ROC-AUC CV={projects_json['churn-prediction']['realMetrics']['roc_auc_cv_mean']}, "
      f"test={projects_json['churn-prediction']['realMetrics']['roc_auc_test']}")
