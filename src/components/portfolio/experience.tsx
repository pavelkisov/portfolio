'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Briefcase, GraduationCap, BookOpen, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from './section-heading'
import { experience, education, courses } from './data'

export function Experience() {
  return (
    <section
      id="experience"
      className="py-20 lg:py-28 border-t border-border bg-secondary/30"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Опыт"
          title="Карьерный путь"
          subtitle="Pet-проекты на реальных открытых датасетах с 2024 года. Каждый кейс — с реальными метриками и измеримым вкладом. Коммерческого опыта нет — только честные self-driven исследования."
        />

        {/* Timeline */}
        <div className="mt-12 relative">
          {/* Vertical line */}
          <div
            className="absolute left-[14px] sm:left-1/2 top-0 bottom-0 w-px bg-border sm:-translate-x-1/2"
            aria-hidden
          />

          <div className="space-y-10">
            {experience.map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className={`relative grid sm:grid-cols-2 gap-x-8 sm:gap-x-12 ${
                  i % 2 === 0 ? '' : 'sm:[&>div:first-child]:order-2'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-0 sm:left-1/2 top-1 -translate-x-1/2 z-10">
                  <div className="h-7 w-7 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className={`hidden sm:block ${i % 2 === 0 ? 'order-1' : 'order-2'}`} />

                {/* Content card */}
                <div
                  className={`pl-12 sm:pl-0 ${
                    i % 2 === 0 ? 'sm:pr-12' : 'sm:pl-12'
                  }`}
                >
                  <article className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {job.period}
                      </Badge>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">{job.role}</h3>
                    <div className="text-sm text-primary mt-0.5">{job.company}</div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {job.description}
                    </p>
                    <ul className="mt-4 space-y-3">
                      {job.achievements.map((a, j) => {
                        const colonIdx = a.indexOf(':');
                        const hasTitle = colonIdx > 0 && colonIdx < 80;
                        const title = hasTitle ? a.slice(0, colonIdx) : null;
                        const rest = hasTitle ? a.slice(colonIdx + 1).trim() : a;
                        return (
                          <li key={j} className="flex gap-2 text-sm">
                            <span className="text-primary mt-1 text-xs shrink-0">▸</span>
                            <span className="text-foreground/80 leading-relaxed">
                              {title && (
                                <span className="font-semibold text-foreground">{title}: </span>
                              )}
                              {rest}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-1.5">
                      {job.stack.map((s) => (
                        <span
                          key={s}
                          className="text-xs font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </article>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education & Certifications */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-medium">Образование</h3>
            </div>
            <p className="text-sm font-medium">{education.degree}</p>
            <p className="text-sm text-primary mt-1">{education.university}</p>
            <p className="text-xs text-muted-foreground mt-1">{education.period}</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {education.details}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-medium">Обучение</h3>
            </div>
            <ul className="space-y-3">
              {courses.map((course, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 text-sm border-b border-border last:border-0 pb-3 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{course.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {course.issuer}
                    </div>
                    {course.note && (
                      <div className="text-xs text-muted-foreground/70 mt-1 italic">
                        {course.note}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {course.period}
                  </Badge>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
