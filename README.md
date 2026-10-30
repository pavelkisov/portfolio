# Портфолио Data Analyst — Павел Кисов

Современный сайт-портфолио аналитика данных, готовый к деплою на **GitHub Pages** или **Vercel**.

## Что внутри

- **Hero** — имя, локация (Орёл), статистика (3 pet-проекта, ROC-AUC 0.84, 7 043 → 7 032 записи Telco, курс МФТИ), контакты
- **About** — профессиональное саммари и список направлений работы
- **Skills** — 4 группы навыков с прогресс-барами + бегущая лента технологий
- **Projects** — 4 проекта с интерактивными графиками (Recharts):
  1. **Прогнозирование оттока клиентов Telco (РЕАЛЬНОЕ)** — XGBoost на датасете IBM Telco, ROC-AUC 0.84
  2. **Анализ продуктовых метрик Olist (РЕАЛЬНОЕ)** — pandas + sqlite3 (CTE, JOIN, Window functions), AOV, LTV, когортный Retention
  3. Атрибуция маркетинговых каналов (Markov Chain) — учебный кейс
  4. **A/B-тест нового алгоритма рекомендаций (РЕАЛЬНОЕ)** — scipy.stats Welch's t-test, p-value, доверительные интервалы, Cohen's h
- **Experience** — позиция Data Analyst (Pet-проекты / Фриланс), 2024 — наст., удалённо (Россия). Три кейса: Telco / Olist / A/B-тест
- **Education** — СПО Юриспруденция, РАНХиГС, окончание 2026
- **Обучение** — самостоятельное изучение курса МФТИ по аналитике данных
- **Contact** — копируемый email (kisovpavel255@gmail.com), Telegram @kisovpavel, GitHub
- **Footer** — навигация, соцсети, кнопка «Наверх»

## Реальные Python-скрипты

### 1. `scripts/churn_analysis.py` — Прогноз оттока Telco
- Датасет: IBM Telco Customer Churn (7 043 записи, публичный GitHub IBM)
- ML: XGBoost с balance scale_pos_weight + StandardScaler + OneHotEncoder
- Stratified 5-fold CV → ROC-AUC 0.84
- Permutation importance → топ-факторы оттока
- Вывод: `data/processed/churn-real-results.json`
- Генерирует данные для: `public/data/projects.json` (через `build_projects_json.py`)

### 2. `scripts/olist_analysis.py` — Анализ Olist E-commerce (НОВОЕ)
- Датасет: синтетический с характеристиками Olist Brazilian E-Commerce (99 441 заказ, 96 095 клиентов). Реальный датасет требует API-ключ Kaggle — это честно указано в описании.
- pandas + sqlite3 (in-memory)
- SQL-запросы с CTE, JOIN, Window functions:
  - **AOV** через `SUM, AVG, COUNT DISTINCT`
  - **LTV** через CTE с `GROUP BY customer_id` и `SUM(order_total)`
  - **Когортный Retention** через 3 CTE: `first_orders` (MIN order_month), `customer_orders_with_cohort` (JOIN), `cohort_active` (COUNT DISTINCT по месяцам)
- Результаты: AOV R$ 112.67, LTV медиана R$ 92.40, Repeat rate 2.98%
- Вывод: `data/processed/olist-real-results.json` и `public/data/olist_results.json`
- Сайт грузит данные из `/data/olist_results.json` через `fetch`

### 3. `scripts/ab_test_analysis.py` — A/B-тест (НОВОЕ)
- Данные: синтетические, сгенерированные через `numpy.random.binomial` с seed=42 (воспроизводимо). Размеры групп: 5 000 + 5 000 пользователей. Реалистичные конверсии e-commerce (4-5%).
- scipy.stats:
  - **Welch's t-test** через `scipy.stats.ttest_ind(equal_var=False)` — корректно для бинарных данных
  - **Z-test для пропорций**
  - **95% доверительный интервал** (Wald)
  - **Effect size** — Cohen's h
- Результаты: p=0.0044 < 0.05 → статистически значимо. Конверсия A (4.20%) → B (5.42%), +1.22 п.п.
- Вывод: `data/processed/ab-test-real-results.json` и `public/data/ab_test_results.json`
- Сайт грузит данные из `/data/ab_test_results.json` через `fetch`

### 4. `scripts/build_projects_json.py` — Сборка projects.json
- Читает `data/processed/churn-real-results.json` (реальные метрики churn)
- Добавляет статичные данные для `marketing-attribution`
- Собирает в `public/data/projects.json`
- Запускать после `churn_analysis.py`, если пересчитывали churn

## Как запустить Python-скрипты

```bash
# Установить зависимости (если не установлены)
pip install pandas scikit-learn xgboost scipy numpy statsmodels

# 1. Прогноз оттока Telco → генерирует data/processed/churn-real-results.json
python3 scripts/churn_analysis.py

# 2. Анализ Olist → генерирует data/processed/olist-real-results.json + public/data/olist_results.json
python3 scripts/olist_analysis.py

# 3. A/B-тест → генерирует data/processed/ab-test-real-results.json + public/data/ab_test_results.json
python3 scripts/ab_test_analysis.py

# 4. Пересобрать projects.json (после изменений в churn)
python3 scripts/build_projects_json.py
```

## Структура данных JSON

Сайт грузит три JSON-файла через `fetch` в `src/components/portfolio/projects.tsx`:

| Файл | Что содержит | Кто генерирует |
|------|--------------|----------------|
| `/public/data/projects.json` | churn-prediction + marketing-attribution | `build_projects_json.py` |
| `/public/data/olist_results.json` | Olist метрики (AOV, LTV, retention) | `olist_analysis.py` |
| `/public/data/ab_test_results.json` | A/B-тест метрики (p-value, CI) | `ab_test_analysis.py` |

Каждый файл имеет структуру:
```json
{
  "chartType": "line" | "bar" | "area" | "composed",
  "chartData": [{ "name": "...", ... }],
  "chartConfig": [{ "dataKey": "...", "color": "var(--chart-1)", "label": "..." }],
  "realMetrics": { ... реальные метрики ML/статистики ... },
  "realResults": [{ "metric": "...", "value": "..." }]
}
```

## Технологии

- Next.js 16 + TypeScript + App Router
- Tailwind CSS 4 + shadcn/ui
- Recharts (графики)
- Framer Motion (анимации)
- Lucide React (иконки)
- next-themes (тёмная/светлая тема)

## Стек аналитика (skills)

| Категория | Навык | Уровень |
|-----------|-------|---------|
| Языки | SQL (PostgreSQL, MySQL) | 90% |
| Языки | Python (pandas, scikit-learn) | 85% |
| Языки | R (tidyverse, ggplot2) | 40% (базовое знакомство) |
| Языки | Bash / shell scripting | 40% |
| BI | Excel / Google Sheets | 85% |
| BI | Power BI / DataLens | 80% |
| BI | Tableau Desktop | 45% |
| BI | Looker / LookML | 40% |
| БД / DE | PostgreSQL | 90% |
| БД / DE | SQLite | 80% |
| БД / DE | ClickHouse | 45% |
| БД / DE | BigQuery | 45% |
| БД / DE | Airflow | 40% |
| БД / DE | dbt | 40% |
| Stats/ML | A/B тестирование (p-value, t-test) | 85% |
| Stats/ML | Когортный и RFM-анализ | 70% |
| Stats/ML | Регрессия, классификация (XGBoost) | 70% |
| Stats/ML | Permutation / SHAP importance | 50% |

## Как запустить локально

```bash
# 1. Установить зависимости
bun install

# 2. Запустить dev-сервер
bun run dev
# Откроется на http://localhost:3000

# 3. Проверить код линтером
bun run lint
```

## Деплой на Vercel (рекомендуется)

1. Залей код на GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio commit"
   git branch -M main
   git remote add origin https://github.com/pavelkisov/portfolio.git
   git push -u origin main
   ```
2. Зайди на https://vercel.com и залогинся через GitHub
3. «New Project» → выбери репозиторий → «Deploy»
4. Через ~2 минуты получишь ссылку типа `portfolio-pavel.vercel.app`

## Что заменить перед публикацией (Чеклист)

- [ ] В `data.ts`:
  - [ ] email `kisovpavel255@gmail.com` → проверь что твой реальный
  - [ ] ссылки на GitHub / Telegram → проверь что ведут на твои аккаунты
  - [ ] `summary` → подправь под себя
  - [ ] `experience` → проверь что кейсы в Experience соответствуют проектам
  - [ ] `projects` → проверь что метрики в скриптах и в data.ts совпадают
  - [ ] `heroStats` → проверь что цифры соответствуют реальным расчётам
- [ ] Залей `scripts/churn_analysis.py` + `data/raw/telco-churn.csv` отдельным репозиторием на GitHub
- [ ] Залей `scripts/olist_analysis.py` отдельным репозиторием
- [ ] Залей `scripts/ab_test_analysis.py` отдельным репозиторием
- [ ] Обнови ссылки `githubUrl` в `data.ts` на свои реальные репозитории

## Структура файлов

```
src/
├── app/
│   ├── layout.tsx     # корневой layout + ThemeProvider
│   ├── page.tsx       # сборка всех секций
│   └── globals.css    # цветовая система (тёмная + светлая тема)
├── components/
│   ├── ui/            # shadcn/ui компоненты
│   ├── theme-provider.tsx
│   └── portfolio/
│       ├── data.ts            # ВСЕ ДАННЫЕ ПОРТФОЛИО (редактируй тут)
│       ├── navbar.tsx
│       ├── hero.tsx
│       ├── about.tsx
│       ├── skills.tsx
│       ├── projects.tsx       # + рендер графиков Recharts + RealMetricsPanel
│       ├── experience.tsx     # таймлайн + обучение
│       ├── contact.tsx        # + форма
│       ├── footer.tsx
│       ├── theme-toggle.tsx
│       └── section-heading.tsx
├── hooks/
scripts/
├── churn_analysis.py         # Реальный ML на Telco
├── olist_analysis.py         # Реальный анализ Olist (pandas + sqlite3)
├── ab_test_analysis.py       # Реальный A/B-тест (scipy.stats)
└── build_projects_json.py    # Сборка projects.json из churn-real-results.json
data/
├── raw/
│   ├── telco-churn.csv                       # Датасет IBM Telco (реальный)
│   └── olist_synthetic_orders.csv            # Синтетический Olist (генерируется скриптом)
└── processed/
    ├── churn-real-results.json               # Результаты churn
    ├── olist-real-results.json               # Результаты Olist
    └── ab-test-real-results.json             # Результаты A/B-теста
public/
└── data/
    ├── projects.json                         # churn + marketing (для фронтенда)
    ├── olist_results.json                    # Olist метрики (для фронтенда)
    └── ab_test_results.json                  # A/B метрики (для фронтенда)
```

## Совет перед публикацией

1. **Реальные проекты важнее красивых**. У тебя 3 из 4 проектов — реальные (churn, Olist, A/B-тест). Один (marketing-attribution) — учебный кейс, можно убрать или оставить как демо.
2. **Цифры в результатах честные**. Все метрики посчитаны Python-скриптами и проверяемы — открывай скрипт и смотри.
3. **Залей скрипты в отдельные GitHub-репозитории**. На сайте есть ссылки `githubUrl` в карточках — пусть они ведут на реальные репозитории с кодом.
4. **Telegram — главный контакт** для российских работодателей.
