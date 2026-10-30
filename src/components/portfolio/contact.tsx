'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Github, Send, Mail, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { SectionHeading } from './section-heading'
import { profile } from './data'

export function Contact() {
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', email: '', message: '' })

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      toast({ title: 'Email скопирован', description: profile.email })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Не удалось скопировать', variant: 'destructive' })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // В реальном проекте здесь будет POST на /api/contact или отправка через сервис
    const subject = encodeURIComponent(`Портфолио: сообщение от ${form.name || 'Anonymous'}`)
    const body = encodeURIComponent(
      `От: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    )
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
    toast({
      title: 'Открываю почтовый клиент',
      description: 'Подставил ваши данные в письмо.',
    })
  }

  return (
    <section id="contact" className="py-20 lg:py-28 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Контакты"
          title="Открыт к новым проектам и офферам"
          subtitle="Отвечаю в течение 24 часов. Готов к собеседованиям, тестовым заданиям и звонкам."
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col"
          >
            <h3 className="text-lg font-semibold tracking-tight mb-2">
              Связаться напрямую
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Самый быстрый путь — Telegram. По email — для серьёзных разговоров.
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={copyEmail}
                className="w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Email
                    </div>
                    <div className="text-sm font-medium">{profile.email}</div>
                  </div>
                </div>
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <a
                href={profile.socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-accent"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Telegram
                  </div>
                  <div className="text-sm font-medium">@{profile.usernames.telegram}</div>
                </div>
              </a>

              <a
                href={profile.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-accent"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Github className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    GitHub
                  </div>
                  <div className="text-sm font-medium">github.com/{profile.usernames.github}</div>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.form
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col"
          >
            <h3 className="text-lg font-semibold tracking-tight mb-2">
              Написать сообщение
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Заполните форму — открою ваш почтовый клиент с готовым письмом.
            </p>

            <div className="space-y-4 flex-1">
              <div>
                <label htmlFor="name" className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  Ваше имя
                </label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Например, Анна Иванова"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  Ваш email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="anna@company.com"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="message" className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  Сообщение
                </label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Расскажите о вакансии или проекте..."
                  className="resize-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <Send className="h-4 w-4" />
              Отправить
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
