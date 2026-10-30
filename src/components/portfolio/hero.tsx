'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Github, Mail, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { profile, heroStats } from './data'

export function Hero() {
  return (
    <section
      id="top"
      className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden"
    >
      {/* Background patterns */}
      <div className="absolute inset-0 grid-pattern opacity-50" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-primary/5 via-primary/2 to-transparent"
        aria-hidden
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Открыт к новым предложениям · {profile.location}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight text-balance max-w-4xl"
        >
          {profile.name}
          <span className="block text-primary mt-2">
            {profile.role}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed text-balance"
        >
          {profile.tagline}. Большие данные в {`PostgreSQL`}, {`ClickHouse`} и {`BigQuery`},
          визуализация в {`Tableau`} и {`Power BI`}, ML-модели на {`Python`}.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <a href="#projects">
              Смотреть проекты
              <ArrowDown className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <a href="#contact">
              <Mail className="h-4 w-4" />
              Написать мне
            </a>
          </Button>
          <div className="flex items-center gap-1 ml-1">
            <Button asChild variant="ghost" size="icon" aria-label="GitHub">
              <a href={profile.socials.github} target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Telegram">
              <a href={profile.socials.telegram} target="_blank" rel="noopener noreferrer">
                <Send className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border rounded-2xl overflow-hidden"
        >
          {heroStats.map((stat, i) => (
            <div
              key={i}
              className="bg-background p-6 sm:p-8 transition-colors hover:bg-accent/30"
            >
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary tabular-nums">
                {stat.value}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex items-center justify-center"
        >
          <a
            href="#about"
            className="inline-flex flex-col items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Прокрутить вниз"
          >
            <span className="uppercase tracking-widest">Прокрутить</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowDown className="h-4 w-4" />
            </motion.div>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
