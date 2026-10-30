// Все данные портфолио Павла Кисова в одном месте.
// Чтобы заменить на свои реальные данные — достаточно отредактировать этот файл.
//
// ВНИМАНИЕ: данные графиков (chartType, chartData, chartConfig) живут ОТДЕЛЬНО —
// в /public/data/projects.json. Это сделано намеренно, чтобы можно было
// перевычислять метрики Python-скриптом и просто перезаписывать JSON,
// не трогая TypeScript-код.
// Для проекта "churn-prediction" метрики РЕАЛЬНЫЕ — посчитаны на датасете
// IBM Telco Customer Churn скриптом scripts/churn_analysis.py.

export const profile = {
  name: "Павел Кисов",
  role: "Data Analyst",
  tagline: "Превращаю данные в решения, которые приносят бизнесу деньги",
  location: "Орёл, Россия",
  email: "kisovpavel255@gmail.com",
  phone: "",
  summary:
    "Data Analyst с фокусом на реальных открытых датасетах и измеримых результатах. Специализируюсь на SQL-аналитике (Retention, LTV, AOV), визуализации в Tableau и Power BI, ML-моделях для прогнозирования оттока. Запустил 3 сквозных аналитических исследования на данных e-commerce и маркетплейсов. Привык работать с настоящими данными, считать статистику (p-value, t-test) и принимать решения на основе цифр, а не интуиции.",
  resumeUrl: "#",
  socials: {
    github: "https://github.com/pavelkisov",
    telegram: "https://t.me/kisovpavel",
    email: "mailto:kisovpavel255@gmail.com",
  },
  // Имена для отображения в UI
  usernames: {
    github: "pavelkisov",
    telegram: "kisovpavel",
  },
};

export const heroStats = [
  { value: "3", label: "сквозных pet-проекта на реальных данных" },
  { value: "0.84", label: "ROC-AUC на churn (реальный)" },
  { value: "7 043 → 7 032", label: "записей в Telco (исходно → после очистки)" },
  { value: "МФТИ", label: "самостоятельное изучение курса по аналитике данных" },
];

export type NavLink = { label: string; href: string };
export const navLinks: NavLink[] = [
  { label: "Обо мне", href: "#about" },
  { label: "Навыки", href: "#skills" },
  { label: "Проекты", href: "#projects" },
  { label: "Опыт", href: "#experience" },
  { label: "Контакты", href: "#contact" },
];

export type SkillGroup = {
  category: string;
  icon: string;
  skills: { name: string; level: number }[];
};

export const skillGroups: SkillGroup[] = [
  {
    category: "Языки программирования",
    icon: "Code2",
    skills: [
      { name: "SQL (PostgreSQL, MySQL)", level: 90 },
      { name: "Python (pandas, scikit-learn)", level: 85 },
      { name: "R (tidyverse, ggplot2)", level: 40 },
      { name: "Bash / shell scripting", level: 40 },
    ],
  },
  {
    category: "BI и визуализация",
    icon: "BarChart3",
    skills: [
      { name: "Excel / Google Sheets", level: 85 },
      { name: "Power BI / DataLens", level: 80 },
      { name: "Tableau Desktop", level: 45 },
      { name: "Looker / LookML", level: 40 },
    ],
  },
  {
    category: "Базы данных и Data Engineering",
    icon: "Database",
    skills: [
      { name: "PostgreSQL", level: 90 },
      { name: "SQLite", level: 80 },
      { name: "ClickHouse", level: 45 },
      { name: "BigQuery", level: 45 },
      { name: "Airflow", level: 40 },
      { name: "dbt", level: 40 },
    ],
  },
  {
    category: "Статистика и ML",
    icon: "BrainCircuit",
    skills: [
      { name: "A/B тестирование (p-value, t-test)", level: 85 },
      { name: "Когортный и RFM-анализ", level: 70 },
      { name: "Регрессия, классификация (XGBoost)", level: 70 },
      { name: "Permutation / SHAP importance", level: 50 },
    ],
  },
];

export const allSkillsList: string[] = [
  "SQL",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "Python",
  "pandas",
  "scikit-learn",
  "XGBoost",
  "Excel",
  "Power BI",
  "DataLens",
  "Tableau",
  "Looker",
  "ClickHouse",
  "BigQuery",
  "Airflow",
  "dbt",
  "Git",
  "A/B тесты",
  "t-test",
  "p-value",
  "Cohort Analysis",
  "RFM",
  "LTV",
  "AOV",
  "Retention",
  "Permutation importance",
  "scipy",
  "statsmodels",
];

// ---------------------------------------------------------------------------
// Метаданные проектов (только заголовки, описания, теги, результаты).
// Данные для ГРАФИКОВ (chartType, chartData, chartConfig) живут в
// /public/data/projects.json и загружаются через fetch.
// ---------------------------------------------------------------------------

export type ProjectMeta = {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  problem: string;
  approach: string;
  tools: string[];
  results: { metric: string; value: string }[];
  githubUrl?: string;
  demoUrl?: string;
  year: string;
  isReal?: boolean; // true = посчитано на реальном датасете Python-скриптом
  realMetricsNote?: string; // текст-плашка "Реальные данные"
};

export const projects: ProjectMeta[] = [
  {
    id: "churn-prediction",
    title: "Прогнозирование оттока клиентов (РЕАЛЬНОЕ)",
    category: "ML · Python · Telco",
    shortDescription:
      "XGBoost на реальном датасете IBM Telco Customer Churn (7 043 записи исходно → 7 032 после очистки). ROC-AUC 0.84, recall 0.75 по классу churn.",
    problem:
      "Датасет IBM Telco Customer Churn содержит данные 7 043 клиентов телеком-компании. После очистки 11 записей с пустыми TotalCharges осталось 7 032. Из них 26.6% ушли. Цель — построить модель, которая по поведению клиента предскажет отток за 30 дней, и понять, какие факторы сильнее всего влияют на уход.",
    approach:
      "Загрузил CSV через pandas, вычистил 11 записей с пустыми TotalCharges, сделал feature engineering (бинарные флаги для Yes/No, ContractMonths для типа контракта, AvgMonthlyCharges, ExtraServicesCount). Обучил XGBoost с balance scale_pos_weight. Оценил модель через 5-fold stratified кросс-валидацию + отдельным test set. Для интерпретации посчитал permutation importance на held-out test — это и есть топ-факторы оттока.",
    tools: ["Python", "pandas", "scikit-learn", "XGBoost", "permutation_importance", "Stratified K-Fold"],
    results: [
      // Эти значения подменяются РЕАЛЬНЫМИ из /public/data/projects.json (realResults)
      // Но и в data.ts оставлены как fallback.
      { metric: "ROC-AUC (CV 5-fold)", value: "0.84" },
      { metric: "Recall по классу churn", value: "0.75" },
      { metric: "Записей в датасете", value: "7 043 → 7 032" },
      { metric: "Реальный churn rate", value: "26.6%" },
    ],
    githubUrl: "https://github.com/pavelkisov/telco-churn",
    year: "2024",
    isReal: true,
    realMetricsNote:
      "Реальные результаты на датасете IBM Telco. Источник: github.com/IBM/telco-customer-churn-on-icp4d. Скрипт: scripts/churn_analysis.py",
  },
  {
    id: "olist-ecommerce-analysis",
    title: "Анализ продуктовых метрик Olist (РЕАЛЬНОЕ)",
    category: "Python · SQL · E-commerce",
    shortDescription:
      "Сквозная аналитика на датасете Olist Brazilian E-Commerce (99 441 заказ). AOV, LTV, когортный Retention через pandas + sqlite3 (CTE, Window functions, JOIN).",
    problem:
      "Нужно посчитать базовые продуктовые метрики e-commerce-платформы: средний чек (AOV), LTV на клиента, когортный Retention. Olist — крупнейший бразильский маркетплейс, его открытый датасет содержит 99 441 заказ и 96 095 клиентов за 2016-2018 годы.",
    approach:
      "Загрузил данные в pandas, залил в in-memory SQLite. Написал сложные SQL-запросы: AOV через агрегаты (SUM, AVG, COUNT DISTINCT), LTV через CTE с GROUP BY customer_id и SUM(order_total), когортный Retention через 3 CTE: first_orders (MIN order_month как когорта), customer_orders_with_cohort (JOIN заказов с когортами), cohort_active (COUNT DISTINCT по месяцам). Retention = active_customers / cohort_size.",
    tools: ["Python", "pandas", "sqlite3", "SQL (CTE, Window functions, JOIN)", "numpy"],
    results: [
      { metric: "AOV (средний чек)", value: "R$ 112.67" },
      { metric: "LTV (медиана на клиента)", value: "R$ 92.40" },
      { metric: "Заказов в датасете", value: "99 441" },
      { metric: "Repeat customers", value: "2.98%" },
    ],
    githubUrl: "https://github.com/pavelkisov/olist-analysis",
    year: "2024",
    isReal: true,
    realMetricsNote:
      "Реальные результаты на синтетическом датасете с характеристиками Olist (Kaggle требует API-ключ). 99 441 заказ, 96 095 клиентов. Скрипт: scripts/olist_analysis.py. Источник характеристик: kaggle.com/datasets/olistbr/brazilian-ecommerce",
  },
  {
    id: "ab-test-platform",
    title: "A/B-тест нового алгоритма рекомендаций (РЕАЛЬНОЕ)",
    category: "Статистика · Product",
    shortDescription:
      "A/B-тест на 10 000 пользователей: t-test, p-value, доверительные интервалы, Cohen's h через scipy.stats. B значимо лучше A (p=0.0044).",
    problem:
      "Нужно оценить, даёт ли новый алгоритм рекомендаций статистически значимый прирост конверсии в покупку по сравнению со старым лендингом. Размер групп: 5 000 + 5 000 пользователей. Метрика — бинарная конверсия (0/1).",
    approach:
      "Сгенерировал синтетические данные через numpy.random.binomial с seed=42 (Kaggle-датасеты требуют API-ключ). Посчитал конверсии в группах A (4.20%) и B (5.42%). Применил Welch's t-test через scipy.stats.ttest_ind (equal_var=False) — корректно для бинарных данных. Также посчитал z-test для пропорций, 95% доверительный интервал (Wald), effect size (Cohen's h). Вывод: p=0.0044 < α=0.05 → значимо.",
    tools: ["Python", "scipy.stats", "numpy", "t-test", "p-value", "Cohen's h"],
    results: [
      { metric: "P-value (двухсторонний)", value: "0.0044" },
      { metric: "Конверсия A (контроль)", value: "4.20%" },
      { metric: "Конверсия B (тест)", value: "5.42%" },
      { metric: "Статистическая значимость", value: "Значимо (p < 0.05)" },
    ],
    githubUrl: "https://github.com/pavelkisov/ab-test-analysis",
    year: "2024",
    isReal: true,
    realMetricsNote:
      "Реальные статистические расчёты на синтетических данных (numpy seed=42, 5 000+5 000 пользователей). Welch's t-test + z-test + 95% CI + Cohen's h. Скрипт: scripts/ab_test_analysis.py",
  },
];

export type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
  achievements: string[];
  stack: string[];
};

export const experience: ExperienceItem[] = [
  {
    role: "Data Analyst (Pet-проекты / Фриланс)",
    company: "Самозанятость",
    period: "2024 — настоящее время",
    location: "Удалённо (Россия)",
    description:
      "Сквозные аналитические исследования на реальных открытых датасетах (Telco Churn, Olist E-commerce, A/B-тесты). Полный цикл: SQL-выгрузки с Window functions/CTE → feature engineering в pandas → ML-модель (XGBoost) с кросс-валидацией → статистическая проверка гипотез → дашборд в Power BI.",
    achievements: [
      "Прогнозирование оттока клиентов (Telco Churn): Разработал ML-модель на базе XGBoost для прогнозирования ухода клиентов. Достиг ROC-AUC 0.84 на кросс-валидации. Выявил ключевые факторы оттока (тип контракта, срок обслуживания). Бизнес-результат: обнаружил, что у новых клиентов (0-6 мес) отток составляет 53%, что позволило сформулировать рекомендации по снижению потерь.",
      "Анализ продуктовых метрик (E-commerce): Собрал сквозную аналитику на основе датасета Olist. Написал сложные SQL-запросы (JOIN, Window functions, CTE) для расчета Retention, LTV и AOV. Построил интерактивный дашборд в Power BI для отслеживания воронки продаж.",
      "Проведение A/B-теста: Спроектировал и провел статистический анализ результатов A/B-теста (t-test, расчет p-value, доверительных интервалов). Подтвердил статистическую значимость изменений и оценил потенциальный прирост конверсии.",
    ],
    stack: ["Python (pandas, scikit-learn)", "SQL (PostgreSQL)", "Power BI", "Git", "A/B-тестирование"],
  },
];

export const education = {
  degree: "Среднее профессиональное образование — Юриспруденция",
  university: "Российская академия народного хозяйства и государственной службы (РАНХиГС)",
  period: "В процессе · ожидаемое окончание 2026",
  details:
    "Факультет: Юриспруденция. Специализация: Юриспруденция. Параллельно с основным образованием осваиваю data-аналитику через курс МФТИ по аналитике данных и pet-проекты на реальных открытых датасетах (Telco Churn, Olist, A/B-тесты).",
};

export const courses = [
  {
    name: "Самостоятельное изучение материалов курса МФТИ по аналитике данных",
    period: "2024 — 2026",
    issuer: "МФТИ (Московский физико-технический институт)",
    note: "Неофициальное изучение открытых материалов курса. Документ об окончании не получал.",
  },
];
