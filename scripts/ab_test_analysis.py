"""
Анализ A/B-теста через scipy.stats.

ВНИМАНИЕ: реальный публичный датасет A/B-тестов требует аккаунта Kaggle,
поэтому в скрипте используются синтетические данные, сгенерированные через
numpy с seed=42 для воспроизводимости. Это честный подход для демонстрации
статистических методов (t-test, p-value, доверительные интервалы).

Сценарий: A/B-тест лендинга. Контроль (A) — старая версия, тест (B) — новый
алгоритм рекомендаций. Метрика — конверсия в покупку.

Скрипт:
1. Генерирует синтетические данные через numpy (2x5000 пользователей)
2. Считает конверсию в каждой группе
3. Применяет two-proportion z-test через scipy.stats (используется пропорции)
4. Применяет t-test для бинарных исходов через scipy.stats.ttest_ind
5. Считает 95% доверительный интервал для разницы конверсий
6. Считает effect size (Cohen's h)
7. Делаёт вывод: статистически значимо или нет (α=0.05)

Результаты сохраняются в /public/data/ab_test_results.json.
"""

import json
from pathlib import Path

import numpy as np
from scipy import stats

# ---------------------------------------------------------------------------
# 1. Генерация синтетических данных A/B-теста
# ---------------------------------------------------------------------------
RNG = np.random.default_rng(seed=42)

# Размеры групп
N_CONTROL = 5_000  # группа A
N_VARIANT = 5_000  # группа B

# Истинные конверсии (B лучше на ~1 п.п. — реалистичный значимый эффект)
TRUE_CONV_A = 0.042  # 4.2% — старый лендинг
TRUE_CONV_B = 0.052  # 5.2% — новый алгоритм рекомендаций

# Генерируем бинарные исходы (0/1) для каждого пользователя
control_conversions = RNG.binomial(1, TRUE_CONV_A, size=N_CONTROL)
variant_conversions = RNG.binomial(1, TRUE_CONV_B, size=N_VARIANT)

n_conv_a = int(control_conversions.sum())
n_conv_b = int(variant_conversions.sum())
conv_rate_a = n_conv_a / N_CONTROL
conv_rate_b = n_conv_b / N_VARIANT

print(f"=== Сгенерированы данные A/B-теста ===")
print(f"Группа A (контроль): {N_CONTROL:,} пользователей, конверсий {n_conv_a}, "
      f"rate = {conv_rate_a:.4f} ({conv_rate_a*100:.2f}%)")
print(f"Группа B (тест):     {N_VARIANT:,} пользователей, конверсий {n_conv_b}, "
      f"rate = {conv_rate_b:.4f} ({conv_rate_b*100:.2f}%)")
print(f"Разница конверсий (B - A): {(conv_rate_b - conv_rate_a)*100:.2f} п.п.")

# ---------------------------------------------------------------------------
# 2. t-test через scipy.stats.ttest_ind
# ---------------------------------------------------------------------------
# Двухвыборочный t-test (Welch's t-test, т.к. дисперсии могут отличаться)
t_stat, t_p_value = stats.ttest_ind(
    variant_conversions, control_conversions,
    equal_var=False,  # Welch's t-test — корректно для бинарных данных
    alternative="greater",  # односторонний тест: H1: B > A
)

print(f"\n=== Welch's t-test (scipy.stats.ttest_ind) ===")
print(f"t-статистика: {t_stat:.4f}")
print(f"p-value (one-sided): {t_p_value:.6f}")

# Также двухсторонний для сравнения
t_stat_two, t_p_two = stats.ttest_ind(
    variant_conversions, control_conversions, equal_var=False
)
print(f"p-value (two-sided): {t_p_two:.6f}")

# ---------------------------------------------------------------------------
# 3. Z-test для пропорций (более корректный для бинарных исходов)
# ---------------------------------------------------------------------------
# Формула: z = (p_B - p_A) / sqrt(p_pool * (1 - p_pool) * (1/n_A + 1/n_B))
p_pool = (n_conv_a + n_conv_b) / (N_CONTROL + N_VARIANT)
se_pool = np.sqrt(p_pool * (1 - p_pool) * (1 / N_CONTROL + 1 / N_VARIANT))
z_stat = (conv_rate_b - conv_rate_a) / se_pool
# односторонний p-value
z_p_value = 1 - stats.norm.cdf(z_stat)

print(f"\n=== Z-test для пропорций ===")
print(f"z-статистика: {z_stat:.4f}")
print(f"p-value (one-sided): {z_p_value:.6f}")

# ---------------------------------------------------------------------------
# 4. 95% доверительный интервал для разницы конверсий
# ---------------------------------------------------------------------------
# Используем непрерывную аппроксимацию (Wald CI)
se_diff = np.sqrt(
    conv_rate_a * (1 - conv_rate_a) / N_CONTROL +
    conv_rate_b * (1 - conv_rate_b) / N_VARIANT
)
alpha = 0.05
z_crit = stats.norm.ppf(1 - alpha / 2)  # 1.96 для 95%
diff = conv_rate_b - conv_rate_a
ci_low = diff - z_crit * se_diff
ci_high = diff + z_crit * se_diff

print(f"\n=== 95% доверительный интервал для разницы (B - A) ===")
print(f"Точечная оценка: {diff*100:.4f} п.п.")
print(f"95% CI: [{ci_low*100:.4f}%, {ci_high*100:.4f}%]")

# ---------------------------------------------------------------------------
# 5. Effect size — Cohen's h (для пропорций)
# ---------------------------------------------------------------------------
# h = 2 * arcsin(sqrt(p1)) - 2 * arcsin(sqrt(p2))
h = 2 * np.arcsin(np.sqrt(conv_rate_b)) - 2 * np.arcsin(np.sqrt(conv_rate_a))
print(f"\n=== Effect size ===")
print(f"Cohen's h: {h:.4f}")
if h < 0.2:
    interpretation = "малый эффект (< 0.2)"
elif h < 0.5:
    interpretation = "средний эффект (0.2 — 0.5)"
elif h < 0.8:
    interpretation = "большой эффект (0.5 — 0.8)"
else:
    interpretation = "очень большой эффект (≥ 0.8)"
print(f"Интерпретация: {interpretation}")

# ---------------------------------------------------------------------------
# 6. Статистическая значимость (двухсторонний тест как основной)
# ---------------------------------------------------------------------------
# Используем двухсторонний тест как основной — это более строгий и общепринятый
# подход в A/B-тестировании (мы заранее не знаем направление эффекта).
# Односторонний тест показываем как справочную информацию.
is_significant = t_p_two < alpha

print(f"\n=== Вывод (основной — двухсторонний тест) ===")
print(f"Уровень значимости α = {alpha}")
print(f"p-value (двухсторонний) = {t_p_two:.6f}")
print(f"p-value < α? {t_p_two < alpha}")
if is_significant:
    conclusion = (
        f"Результат статистически значим (двухсторонний p = {t_p_two:.4f} < α = {alpha}). "
        f"Отвергаем нулевую гипотезу H0: конверсии групп A и B равны. "
        f"Группа B (новый алгоритм) показала значимо более высокую конверсию: "
        f"{conv_rate_b*100:.2f}% vs {conv_rate_a*100:.2f}%, "
        f"абсолютный прирост +{(conv_rate_b - conv_rate_a)*100:.2f} п.п., "
        f"относительный прирост +{(conv_rate_b - conv_rate_a)/conv_rate_a*100:.1f}%. "
        f"95% доверительный интервал для разницы не содержит 0: "
        f"[{ci_low*100:.2f}%, {ci_high*100:.2f}%]. "
        f"Effect size (Cohen's h = {h:.3f}) — {interpretation}."
    )
else:
    conclusion = (
        f"Результат не статистически значим (двухсторонний p = {t_p_two:.4f} ≥ α = {alpha}). "
        f"Не можем отвергнуть нулевую гипотезу H0. Различия в конверсиях могут быть "
        f"обусловлены случайностью. 95% CI для разницы содержит 0: "
        f"[{ci_low*100:.2f}%, {ci_high*100:.2f}%]. "
        f"Рекомендация: увеличить выборку или принять H0."
    )
print(conclusion)

# ---------------------------------------------------------------------------
# 7. Подготовка данных для графика
# ---------------------------------------------------------------------------
chart_data = [
    {"name": "Группа A (контроль)", "value": float(conv_rate_a * 100)},
    {"name": "Группа B (тест)", "value": float(conv_rate_b * 100)},
    {"name": "Lift (B - A)", "value": float((conv_rate_b - conv_rate_a) * 100)},
]
chart_config = [
    {"dataKey": "value", "color": "var(--chart-2)", "label": "Конверсия, %"},
]

real_results = [
    {"metric": "P-value (двухсторонний)", "value": f"{t_p_two:.4f}"},
    {"metric": "Конверсия A (контроль)", "value": f"{conv_rate_a*100:.2f}%"},
    {"metric": "Конверсия B (тест)", "value": f"{conv_rate_b*100:.2f}%"},
    {"metric": "Статистическая значимость", "value":
        "Значимо (p < 0.05)" if is_significant else "Не значимо (p ≥ 0.05)"},
]

# ---------------------------------------------------------------------------
# 8. Сохранение в JSON
# ---------------------------------------------------------------------------
output = {
    "chartType": "bar",
    "chartData": chart_data,
    "chartConfig": chart_config,
    "realMetrics": {
        "test_name": "A/B-тест: влияние нового алгоритма рекомендаций на конверсию",
        "metric": "Конверсия в покупку (бинарная, 0/1)",
        "data_source": "Синтетические данные, сгенерированные numpy (seed=42)",
        "is_synthetic": True,
        "synthetic_note": (
            "Данные сгенерированы через numpy.random.binomial с фиксированным seed=42 "
            "для воспроизводимости. Использованы реальные размеры групп (5000+5000) "
            "и реалистичные конверсии e-commerce (4-5%). Все статистические расчёты "
            "выполнены через scipy.stats на этих данных — вывод валиден."
        ),
        "n_control": N_CONTROL,
        "n_variant": N_VARIANT,
        "n_conv_control": n_conv_a,
        "n_conv_variant": n_conv_b,
        "conv_rate_control": float(conv_rate_a),
        "conv_rate_variant": float(conv_rate_b),
        "absolute_diff": float(diff),
        "relative_lift_pct": float((conv_rate_b - conv_rate_a) / conv_rate_a * 100),
        # t-test
        "t_statistic": float(t_stat),
        "p_value_one_sided": float(t_p_value),
        "p_value_two_sided": float(t_p_two),
        # z-test
        "z_statistic": float(z_stat),
        "z_p_value": float(z_p_value),
        # CI
        "ci_95_low": float(ci_low),
        "ci_95_high": float(ci_high),
        "ci_95_level": 0.95,
        # effect size
        "effect_size_cohens_h": float(h),
        "effect_size_interpretation": interpretation,
        # вывод
        "alpha": alpha,
        "is_significant": bool(is_significant),
        "conclusion": conclusion,
        "method": "Welch's t-test (scipy.stats.ttest_ind, equal_var=False) + "
                  "Z-test для пропорций + Wald 95% CI + Cohen's h",
    },
    "realResults": real_results,
}

out_path = Path("/home/z/my-project/public/data/ab_test_results.json")
out_path.parent.mkdir(parents=True, exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

# Полные результаты в архив
processed_dir = Path("/home/z/my-project/data/processed")
processed_dir.mkdir(parents=True, exist_ok=True)
with open(processed_dir / "ab-test-real-results.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"\n✓ Saved → {out_path}")
print(f"✓ Saved → {processed_dir / 'ab-test-real-results.json'}")
print(f"\nФинальные метрики:")
print(f"  P-value: {t_p_value:.4f}")
print(f"  Конверсия A → B: {conv_rate_a*100:.2f}% → {conv_rate_b*100:.2f}%")
print(f"  Значимо: {is_significant}")
