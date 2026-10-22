# Barber Booking Web

Frontend сервиса записи в барбершоп. Стек: Vite, React, TypeScript, Tailwind CSS, TanStack Query, Zustand, Wouter, React Hook Form и Zod.

## Запуск

```bash
Copy-Item .env.example .env
npm install
npm run dev
```

По умолчанию Vite доступен на `http://localhost:5173` и проксирует `/api` на `http://localhost:3000`. Backend должен быть запущен отдельно.

Проверка проекта:

```bash
npm run check
```

Аутентификация работает через `httpOnly` session cookie. Токены не сохраняются в браузере, все API-запросы отправляются с `credentials: include`, а доступ к данным и ролям окончательно проверяет backend.
