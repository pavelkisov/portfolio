'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Briefcase, GraduationCap, Mail } from 'lucide-react'
import { profile } from './data'
import { SectionHeading } from './section-heading'

export function About() {
  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Обо мне"
          title="Аналитик, который говорит на языке бизнеса"
          subtitle="Соединяю математику, технологии и бизнес-логику в единый процесс принятия решений."
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main bio card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <p className="text-base sm:text-lg leading-relaxed text-foreground/90">
              {profile.summary}
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
              <InfoItem icon={<Briefcase className="h-4 w-4" />} label="Опыт" value="Pet-проекты + 1 год" />
              <InfoItem icon={<MapPin className="h-4 w-4" />} label="Локация" value={profile.location} />
              <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
              <InfoItem icon={<GraduationCap className="h-4 w-4" />} label="Образование" value="СПО · Юриспруденция" />
            </div>
          </motion.div>

          {/* Side card with what I do */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-background p-6 sm:p-8"
          >
            <h3 className="text-sm font-medium uppercase tracking-widest text-primary mb-4">
              Чем занимаюсь
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary mt-0.5">→</span>
                <span>Анализ воронок и путей пользователей в продукте</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-0.5">→</span>
                <span>Постановка и анализ A/B-тестов со статистикой</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-0.5">→</span>
                <span>Построение витрин данных и дашбордов в BI</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-0.5">→</span>
                <span>ML-модели для прогнозирования и сегментации</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-0.5">→</span>
                <span>Автоматизация регулярной отчётности и алертов</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
