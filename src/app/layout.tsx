import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Павел Кисов — Data Analyst | Портфолио",
  description:
    "Портфолио аналитика данных Павла Кисова. SQL, Python, Tableau, Power BI. Проекты по ML, бизнес-аналитике, A/B тестам и прогнозированию.",
  keywords: [
    "Data Analyst",
    "Аналитик данных",
    "Павел Кисов",
    "SQL",
    "Python",
    "Tableau",
    "Power BI",
    "портфолио",
  ],
  authors: [{ name: "Павел Кисов" }],
  openGraph: {
    title: "Павел Кисов — Data Analyst",
    description: "Портфолио аналитика данных: SQL, Python, BI, ML, A/B тесты.",
    type: "profile",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Павел Кисов — Data Analyst",
    description: "Портфолио аналитика данных: SQL, Python, BI, ML, A/B тесты.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
