'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { SectionHeading } from './section-heading'
import { skillGroups, allSkillsList } from './data'

type IconMap = Record<string, React.ComponentType<{ className?: string }>>
const iconMap = LucideIcons as unknown as IconMap

export function Skills() {
  return (
    <section id="skills" className="py-20 lg:py-28 border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Навыки"
          title="Технологический стек"
          subtitle="Полный цикл работы с данными: от сырых логов до self-service BI и продакшн ML-моделей."
        />

        {/* Skill groups */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          {skillGroups.map((group, gi) => {
            const Icon = iconMap[group.icon] ?? LucideIcons.Box
            return (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: gi * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-medium">{group.category}</h3>
                </div>

                <div className="space-y-4">
                  {group.skills.map((skill, si) => (
                    <div key={si}>
                      <div className="flex items-center justify-between mb-1.5 text-sm">
                        <span className="text-foreground/90">{skill.name}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.1 + si * 0.05, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* All skills marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 relative overflow-hidden rounded-2xl border border-border bg-card py-6"
        >
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-card to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-card to-transparent z-10" />
          <div className="flex gap-3 animate-marquee whitespace-nowrap will-change-transform">
            {[...allSkillsList, ...allSkillsList].map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center px-4 py-1.5 rounded-full border border-border bg-background text-sm text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
