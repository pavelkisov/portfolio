'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import {
  ArrowUpRight,
  Github,
  Lightbulb,
  TrendingUp,
  Wrench,
  CheckCircle2,
  Database,
  Activity,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionHeading } from './section-heading'
import { type ProjectMeta, projects } from './data'

// Типы данных, которые приходят из JSON-файлов (projects.json, olist_results.json, ab_test_results.json)
type ChartDatum = { name: string; [key: string]: string | number }
type RealMetrics = {
  // Общие поля для всех проектов
  dataset_name: string
  source: string
  is_synthetic?: boolean
  synthetic_note?: string

  // Churn (Telco) — из churn_analysis.py
  n_records?: number
  churn_rate?: number
  n_churned?: number
  algorithm?: string
  roc_auc_cv_mean?: number
  roc_auc_test?: number
  accuracy_test?: number
  recall_test?: number
  precision_test?: number
  f1_test?: number
  segment_churn_rates?: Record<string, Record<string, { churn_rate: number; n: number }>>

  // Olist — из olist_analysis.py
  n_orders?: number
  n_customers?: number
  n_sellers?: number
  period?: string
  currency?: string
  aov?: number
  avg_price?: number
  avg_freight?: number
  total_revenue?: number
  ltv_mean?: number
  ltv_median?: number
  ltv_p25?: number
  ltv_p75?: number
  repeat_customers?: number
  repeat_rate_pct?: number
  top_categories?: { category: string; revenue: number; n_orders: number; aov: number }[]
  retention_curve?: { months_after: number; retention_pct: number }[]
  sql_features_used?: string[]

  // A/B-тест — из ab_test_analysis.py
  test_name?: string
  metric?: string
  n_control?: number
  n_variant?: number
  n_conv_control?: number
  n_conv_variant?: number
  conv_rate_control?: number
  conv_rate_variant?: number
  absolute_diff?: number
  relative_lift_pct?: number
  t_statistic?: number
  p_value_one_sided?: number
  p_value_two_sided?: number
  z_statistic?: number
  z_p_value?: number
  ci_95_low?: number
  ci_95_high?: number
  ci_95_level?: number
  effect_size_cohens_h?: number
  effect_size_interpretation?: string
  alpha?: number
  is_significant?: boolean
  conclusion?: string
  method?: string
}
type ProjectChartData = {
  chartType: 'line' | 'bar' | 'area' | 'composed' | 'pie'
  chartData: ChartDatum[]
  chartConfig: { dataKey: string; color: string; label: string }[]
  realMetrics?: RealMetrics
  realResults?: { metric: string; value: string }[]
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-xl">
      <div className="text-xs font-medium mb-1.5">{label}</div>
      {payload.map((entry, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-medium tabular-nums">
            {typeof entry.value === 'number' ? entry.value.toLocaleString('ru-RU') : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function ProjectChart({ data }: { data: ProjectChartData }) {
  const commonAxis = {
    stroke: 'var(--muted-foreground)',
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  }
  const height = 260

  if (data.chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data.chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" {...commonAxis} />
          <YAxis {...commonAxis} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="line" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          {data.chartConfig.map((c) => (
            <Line
              key={c.dataKey}
              type="monotone"
              dataKey={c.dataKey}
              stroke={c.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: c.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (data.chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data.chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            {data.chartConfig.map((c) => (
              <linearGradient
                key={c.dataKey}
                id={`grad-${c.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={c.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={c.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" {...commonAxis} />
          <YAxis {...commonAxis} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="line" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          {data.chartConfig.map((c) => (
            <Area
              key={c.dataKey}
              type="monotone"
              dataKey={c.dataKey}
              stroke={c.color}
              strokeWidth={2}
              fill={`url(#grad-${c.dataKey})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (data.chartType === 'composed') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data.chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" {...commonAxis} />
          <YAxis {...commonAxis} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="line" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          {data.chartConfig.map((c, idx) => (
            <Bar
              key={c.dataKey}
              dataKey={c.dataKey}
              fill={c.color}
              radius={[4, 4, 0, 0]}
              barSize={idx === 0 ? 16 : 12}
              opacity={idx === 0 ? 0.4 : 1}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  // bar
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data.chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" {...commonAxis} interval={0} angle={-15} textAnchor="end" height={60} />
        <YAxis {...commonAxis} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
        <Legend iconType="line" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        {data.chartConfig.map((c) => (
          <Bar key={c.dataKey} dataKey={c.dataKey} fill={c.color} radius={[4, 4, 0, 0]} barSize={28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// Хук: грузит данные для конкретного проекта из соответствующего JSON
// Каждый "реальный" проект имеет свой JSON-файл (сгенерированный Python-скриптом).
// Для учебных проектов (churn-исходно, marketing) — общий projects.json.
const PROJECT_DATA_SOURCES: Record<string, { url: string; isSingleFile: boolean }> = {
  'churn-prediction': { url: '/data/projects.json', isSingleFile: false },
  'olist-ecommerce-analysis': { url: '/data/olist_results.json', isSingleFile: true },
  'ab-test-platform': { url: '/data/ab_test_results.json', isSingleFile: true },
}

function useProjectChartData(projectId: string) {
  const [data, setData] = React.useState<ProjectChartData | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const source = PROJECT_DATA_SOURCES[projectId] ?? {
      url: '/data/projects.json',
      isSingleFile: false,
    }
    setData(null)
    setError(null)
    fetch(source.url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((payload: ProjectChartData | Record<string, ProjectChartData>) => {
        if (cancelled) return
        if (source.isSingleFile) {
          setData(payload as ProjectChartData)
        } else {
          const item = (payload as Record<string, ProjectChartData>)[projectId]
          if (!item) throw new Error(`No data for project ${projectId}`)
          setData(item)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.error(`[projects] fetch failed for ${projectId}:`, e)
          setError(e.message ?? 'Unknown error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  return { data, error }
}

function RealMetricsPanel({ metrics }: { metrics: NonNullable<ProjectChartData['realMetrics']> }) {
  const isChurn = metrics.algorithm !== undefined && metrics.roc_auc_cv_mean !== undefined
  const isOlist = metrics.aov !== undefined && metrics.n_orders !== undefined
  const isAbTest = metrics.p_value_two_sided !== undefined && metrics.conv_rate_control !== undefined

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 sm:p-6 mb-5">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
        <span className="text-xs font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          {isAbTest ? 'Реальные статистические расчёты' : 'Реальные результаты ML-расчёта'}
        </span>
      </div>

      {/* ============== CHURN (Telco) ============== */}
      {isChurn && (
        <ChurnRealMetricsPanel metrics={metrics} />
      )}

      {/* ============== OLIST (E-commerce) ============== */}
      {isOlist && (
        <OlistRealMetricsPanel metrics={metrics} />
      )}

      {/* ============== A/B-TEST ============== */}
      {isAbTest && (
        <AbTestRealMetricsPanel metrics={metrics} />
      )}

      {/* Synthetic note */}
      {metrics.is_synthetic && metrics.synthetic_note && (
        <div className="mt-5 pt-4 border-t border-emerald-500/20">
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-emerald-700 dark:text-emerald-400">⚠ Синтетические данные:</strong>{' '}
            {metrics.synthetic_note}
          </div>
        </div>
      )}

      {/* Источник */}
      <div className="mt-4 text-xs text-muted-foreground">
        Источник:{' '}
        <a
          href={metrics.source}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-700"
        >
          {metrics.source}
        </a>
      </div>
    </div>
  )
}

// ============================================================================
// Подпанели для конкретных типов проектов
// ============================================================================

function ChurnRealMetricsPanel({ metrics }: { metrics: NonNullable<ProjectChartData['realMetrics']> }) {
  const segments = metrics.segment_churn_rates ?? {}
  const topSegment = Object.entries(segments).slice(0, 1).flatMap(([key, vals]) =>
    Object.entries(vals).map(([seg, info]) => ({ dimension: key, segment: seg, ...info }))
  )

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <RealMetric label="Датасет" value={metrics.dataset_name} icon={<Database className="h-3.5 w-3.5" />} />
        <RealMetric label="Размер (исходно → после очистки)" value="7 043 → 7 032" icon={<Database className="h-3.5 w-3.5" />} />
        <RealMetric label="Churn rate" value={`${((metrics.churn_rate ?? 0) * 100).toFixed(1)}%`} icon={<Activity className="h-3.5 w-3.5" />} />
        <RealMetric label="Алгоритм" value={(metrics.algorithm ?? '').split(' ')[0]} icon={<Activity className="h-3.5 w-3.5" />} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RealMetric label="ROC-AUC (CV)" value={(metrics.roc_auc_cv_mean ?? 0).toFixed(2)} highlight />
        <RealMetric label="ROC-AUC (test)" value={(metrics.roc_auc_test ?? 0).toFixed(2)} />
        <RealMetric label="Recall churn" value={(metrics.recall_test ?? 0).toFixed(2)} />
        <RealMetric label="F1" value={(metrics.f1_test ?? 0).toFixed(2)} />
      </div>

      {topSegment.length > 0 && (
        <div className="mt-5 pt-4 border-t border-emerald-500/20">
          <div className="text-xs text-muted-foreground mb-2">
            Топ-сегмент по оттоку ({topSegment[0].dimension}):
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
              {topSegment[0].segment}
            </Badge>
            <span className="text-sm font-semibold tabular-nums">
              {(topSegment[0].churn_rate * 100).toFixed(1)}% churn
            </span>
            <span className="text-xs text-muted-foreground">
              · {topSegment[0].n.toLocaleString('ru-RU')} клиентов
            </span>
          </div>
        </div>
      )}
    </>
  )
}

function OlistRealMetricsPanel({ metrics }: { metrics: NonNullable<ProjectChartData['realMetrics']> }) {
  const topCats = metrics.top_categories ?? []
  const retentionCurve = metrics.retention_curve ?? []

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <RealMetric label="Датасет" value="Olist E-commerce" icon={<Database className="h-3.5 w-3.5" />} />
        <RealMetric label="Заказов" value={(metrics.n_orders ?? 0).toLocaleString('ru-RU')} icon={<Database className="h-3.5 w-3.5" />} />
        <RealMetric label="Клиентов" value={(metrics.n_customers ?? 0).toLocaleString('ru-RU')} icon={<Database className="h-3.5 w-3.5" />} />
        <RealMetric label="Период" value={metrics.period ?? '2016-2018'} icon={<Activity className="h-3.5 w-3.5" />} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RealMetric label="AOV (средний чек)" value={`R$ ${(metrics.aov ?? 0).toFixed(2)}`} highlight />
        <RealMetric label="LTV (медиана)" value={`R$ ${(metrics.ltv_median ?? 0).toFixed(2)}`} />
        <RealMetric label="Repeat rate" value={`${(metrics.repeat_rate_pct ?? 0).toFixed(2)}%`} />
        <RealMetric label="Total revenue" value={`R$ ${((metrics.total_revenue ?? 0) / 1000).toFixed(0)}K`} />
      </div>

      {/* SQL features */}
      {metrics.sql_features_used && metrics.sql_features_used.length > 0 && (
        <div className="mt-5 pt-4 border-t border-emerald-500/20">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            SQL-конструкции (через sqlite3):
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.sql_features_used.map((feat, i) => (
              <Badge key={i} variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-mono text-xs">
                {feat}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Top categories */}
      {topCats.length > 0 && (
        <div className="mt-5 pt-4 border-t border-emerald-500/20">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Топ-3 категории по выручке:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {topCats.slice(0, 3).map((cat, i) => (
              <div key={i} className="rounded-lg border border-border bg-background p-2.5">
                <div className="text-xs font-mono text-foreground truncate">{cat.category}</div>
                <div className="text-sm font-semibold tabular-nums mt-0.5">
                  R$ {(cat.revenue / 1000).toFixed(1)}K
                </div>
                <div className="text-[10px] text-muted-foreground">{cat.n_orders} заказов</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retention curve */}
      {retentionCurve.length > 0 && (
        <div className="mt-5 pt-4 border-t border-emerald-500/20">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Когортный Retention (мес. после первого заказа):
          </div>
          <div className="flex flex-wrap items-baseline gap-4">
            {retentionCurve.map((r, i) => (
              <div key={i} className="text-sm">
                <span className="text-muted-foreground">+{r.months_after} мес:</span>{' '}
                <span className="font-semibold tabular-nums">{r.retention_pct.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function AbTestRealMetricsPanel({ metrics }: { metrics: NonNullable<ProjectChartData['realMetrics']> }) {
  const isSignificant = metrics.is_significant ?? false

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <RealMetric label="Тест" value="A/B лендинг" icon={<Activity className="h-3.5 w-3.5" />} />
        <RealMetric label="Группа A (контроль)" value={`${(metrics.n_control ?? 0).toLocaleString('ru-RU')} польз.`} icon={<Database className="h-3.5 w-3.5" />} />
        <RealMetric label="Группа B (тест)" value={`${(metrics.n_variant ?? 0).toLocaleString('ru-RU')} польз.`} icon={<Database className="h-3.5 w-3.5" />} />
        <RealMetric label="Метрика" value="Конверсия (0/1)" icon={<Activity className="h-3.5 w-3.5" />} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RealMetric label="P-value (two-sided)" value={(metrics.p_value_two_sided ?? 0).toFixed(4)} highlight={isSignificant} />
        <RealMetric label="Конверсия A → B" value={`${((metrics.conv_rate_control ?? 0) * 100).toFixed(2)}% → ${((metrics.conv_rate_variant ?? 0) * 100).toFixed(2)}%`} />
        <RealMetric label="95% CI для разницы" value={`[${((metrics.ci_95_low ?? 0) * 100).toFixed(2)}%, ${((metrics.ci_95_high ?? 0) * 100).toFixed(2)}%]`} />
        <RealMetric label="Cohen's h" value={(metrics.effect_size_cohens_h ?? 0).toFixed(3)} />
      </div>

      {/* Significance verdict */}
      <div className="mt-5 pt-4 border-t border-emerald-500/20">
        <div className="flex items-start gap-3">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${isSignificant ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
            <CheckCircle2 className={`h-4 w-4 ${isSignificant ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
          </div>
          <div className="flex-1">
            <div className={`text-sm font-semibold ${isSignificant ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {isSignificant ? '✓ Статистически значимо (p < 0.05)' : '⚠ Не значимо на уровне α=0.05'}
            </div>
            {metrics.conclusion && (
              <div className="text-xs text-muted-foreground leading-relaxed mt-1">
                {metrics.conclusion}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Method */}
      {metrics.method && (
        <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
          <span className="uppercase tracking-widest">Метод: </span>
          <span className="font-mono">{metrics.method}</span>
        </div>
      )}
    </>
  )
}

function RealMetric({
  label,
  value,
  icon,
  highlight,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-border bg-background'}`}>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className={`text-base font-semibold tabular-nums ${highlight ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
        {value}
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[260px] w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

function ProjectCard({ project, index }: { project: ProjectMeta; index: number }) {
  const { data, error } = useProjectChartData(project.id)
  const isReal = project.isReal

  // Если это реальный проект и данные загрузились — показываем realResults из JSON,
  // иначе fallback на results из data.ts
  const displayResults =
    isReal && data?.realResults && data.realResults.length > 0
      ? data.realResults
      : project.results

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative rounded-3xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30"
    >
      {/* Header with title + meta */}
      <div className="p-6 sm:p-8 border-b border-border">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {project.category}
              </Badge>
              <span className="text-xs text-muted-foreground">{project.year}</span>
              {isReal && (
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Реальные данные
                </Badge>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {project.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              {project.shortDescription}
            </p>
          </div>
          {project.githubUrl && (
            <Button asChild variant="outline" size="sm" className="shrink-0 gap-2">
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Real metrics panel — только для проекта с реальными данными */}
      {isReal && data?.realMetrics && <RealMetricsPanel metrics={data.realMetrics} />}

      {/* Chart */}
      <div className="p-6 sm:p-8 bg-secondary/20 border-b border-border">
        {error ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
            Не удалось загрузить данные графика: {error}
          </div>
        ) : !data ? (
          <ChartSkeleton />
        ) : (
          <ProjectChart data={data} />
        )}
      </div>

      {/* Details */}
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-2">
              <Lightbulb className="h-4 w-4" />
              Проблема
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.problem}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary mb-2">
              <Wrench className="h-4 w-4" />
              Подход
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.approach}
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-emerald-500 dark:text-emerald-400 mb-4">
            <TrendingUp className="h-4 w-4" />
            Результаты
            {isReal && (
              <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 ml-1 normal-case tracking-normal">
                · из реального ML-расчёта
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {displayResults.map((result, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-4">
                <div className="text-xl font-semibold tracking-tight text-primary tabular-nums">
                  {result.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground leading-tight">
                  {result.metric}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-2">
          {project.tools.map((tool) => (
            <Badge key={tool} variant="outline" className="font-mono text-xs">
              {tool}
            </Badge>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

export function Projects() {
  return (
    <section id="projects" className="py-20 lg:py-28 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Проекты"
          title="Реальные кейсы с измеримым результатом"
          subtitle="Данные для графиков берутся из /public/data/projects.json. Для прогноза оттока — реальные метрики ML-модели, посчитанные на датасете IBM Telco Python-скриптом."
        />

        <div className="mt-12 space-y-6">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
