# Портфолио Data Analyst — Павел Кисов

Современный сайт-портфолио аналитика данных на **Next.js + Tailwind + shadcn/ui + Recharts**.
Готов к деплою на **GitHub Pages** или **Vercel**.

## Что внутри

- **Hero** — имя, локация (Орёл), статистика (3 pet-проекта, ROC-AUC 0.84, 7 043 → 7 032 записи Telco после очистки, курс МФТИ), контакты
- **About** — профессиональное саммари и направления работы
- **Skills** — 4 группы навыков с прогресс-барами + лента технологий
- **Projects** — 4 проекта с интерактивными графиками (Recharts):
  1. **Прогнозирование оттока клиентов Telco (РЕАЛЬНОЕ)** — XGBoost на датасете IBM Telco, ROC-AUC 0.84 (CV), 0.83 (test)
  2. **Анализ продуктовых метрик Olist (РЕАЛЬНОЕ)** — pandas + sqlite3 (CTE, JOIN, оконные функции), AOV, LTV, когортный Retention
  3. Атрибуция маркетинговых каналов (Markov Chain) — учебный кейс
  4. **A/B-тест нового алгоритма рекомендаций (СИНТЕТИКА)** — z-test для пропорций (основной) + Welch's t-test (перекрёстная проверка), p-value, 95% CI, Cohen's h
- **Experience** — Pet-проекты по аналитике данных (Python, SQL, ML), 2026 — наст., удалённо (Россия)
- **Education** — СПО Юриспруденция, РАНХиГС, окончание 2026
- **Обучение** — самостоятельное изучение курса МФТИ по аналитике данных
- **Contact** — email (kisovpavel255@gmail.com), Telegram @kisovpavel, GitHub
- **Footer** — навигация, соцсети, кнопка «Наверх»

## Источник данных для сайта

Сайт загружает метрики из JSON-файлов, которые генерируются Python-скриптами в
**отдельных репозиториях-источниках истины**:

| Проект на сайте | Репозиторий-источник | JSON |
|---|---|---|
| Telco Churn | [`pavelkisov/telco-churn`](https://github.com/pavelkisov/telco-churn) | `results/churn-real-results.json` |
| Olist Metrics | [`pavelkisov/olist-analysis`](https://github.com/pavelkisov/olist-analysis) | `results/olist-real-results.json` |
| A/B Test | [`pavelkisov/ab-test-analysis`](https://github.com/pavelkisov/ab-test-analysis) | `results/ab-test-real-results.json` |

> Каталог `scripts/` в этом репозитории содержит копии анализов для удобства
> локального запуска. **Источник истины — отдельные репозитории выше**; при
> изменении анализа обновляйте их, а сюда копируйте только свежий `results/*.json`
> (или перегенерируйте через `scripts/build_projects_json.py`).

## Метрики (согласованы с репозиториями-источниками)

Все числа на сайте берутся из свежих прогонов скриптов и совпадают с README
соответствующих репозиториев:

- **Telco Churn:** ROC-AUC 0.84 (CV mean, 5-fold), 0.83 (test, hold-out 20%). 7 043 сырых → 7 032 после очистки.
- **Olist:** AOV R$ 160.99, LTV (медиана) R$ 108.00, repeat rate 3.12% (реальный датасет Olist с Kaggle, скачивается через kagglehub без API-ключа).
- **A/B Test:** конверсия A 4.20% → B 5.42%, p = 0.0044 (z-test для пропорций, двухсторонний), 95% CI [0.38%, 2.06%], Cohen's h 0.057 (малый эффект).

## Локальный запуск

```bash
bun install          # или npm install
bun run dev          # http://localhost:3000
```

Для статической сборки под GitHub Pages:

```bash
bun run build        # next.config.ts настроен на output: export
```

## Технологии

- Next.js (App Router, статический экспорт)
- TypeScript
- Tailwind CSS + shadcn/ui
- Recharts (интерактивные графики)
- Python (скрипты анализа — см. отдельные репозитории)

## Структура

```
portfolio/
├── src/                  # Next.js приложение
├── public/data/          # JSON с метриками для графиков
├── scripts/              # копии анализов + download_data.py + build_projects_json.py
├── data/                 # локальные данные (raw / processed)
├── next.config.ts
├── package.json
└── README.md
```

## Что я бы сделал дальше

- ~~Подключить реальные данные Olist~~ — готово: kagglehub без API-ключа, метрики сайта обновлены (AOV R$ 160.99)
- Добавить раздел «What I learned» по каждому проекту — что было сложным и как решал
- Тёмная тема
- Добавить блог-секцию с разбором кейсов
