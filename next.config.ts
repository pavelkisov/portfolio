import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Статический экспорт — генерирует папку ./out с готовым статическим сайтом,
  // который можно залить на GitHub Pages, Netlify или любой статический хостинг.
  output: "export",
  // Относительные пути к ассетам: одна и та же сборка работает в любой подпапке
  // (https://<user>.github.io/<repo>/, https://<user>.github.io/, на локальном
  // сервере, на Netlify). Это снимает необходимость знать имя репозитория на
  // этапе сборки — fetch() к /data/*.json в коде сам определяет basePath в
  // рантайме (см. src/components/portfolio/projects.tsx).
  assetPrefix: "./",
  // Ассеты и страницы должны лежать в той же папке — GitHub Pages раздаёт их
  // по относительным путям корректно только если trailingSlash включён.
  trailingSlash: true,
  images: {
    // GitHub Pages не умеет делать server-side оптимизацию картинок Next.js,
    // поэтому от next/image отказываемся и используем обычные <img>.
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
