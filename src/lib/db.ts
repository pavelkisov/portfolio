// Заглушка для db.ts — в портфолио аналитика данных БД не используется,
// все данные хранятся в JSON-файлах (public/data/*.json) и считаются Python-скриптами.
//
// Если захочешь добавить БД — установи Prisma: `bun add prisma @prisma/client`,
// создай schema.prisma, и замени этот файл на реальную реализацию.

export const db = null
