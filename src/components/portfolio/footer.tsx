'use client'

import { BarChart3, Github, Send, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { profile, navLinks } from './data'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <a href="#top" className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">{profile.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Data Analyst
                </span>
              </div>
            </a>
            <p className="text-sm text-muted-foreground max-w-xs">
              {profile.tagline}.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Навигация
            </h4>
            <ul className="space-y-1.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Соцсети
            </h4>
            <div className="flex items-center gap-2">
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
            <p className="mt-4 text-xs text-muted-foreground">
              {profile.location}
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {profile.name}. Сайт сделан на Next.js + shadcn/ui.
          </p>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href="#top">
              <ArrowUp className="h-4 w-4" />
              Наверх
            </a>
          </Button>
        </div>
      </div>
    </footer>
  )
}
