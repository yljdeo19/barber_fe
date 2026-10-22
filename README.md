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
<img width="2550" height="1328" alt="image" src="https://github.com/user-attachments/assets/ac380d56-607e-4f4a-90d6-1cb581aa9ad7" />

<img width="2555" height="1267" alt="image" src="https://github.com/user-attachments/assets/48c2067b-a527-41ad-a653-f7c3876a2b9a" />
<img width="2557" height="1271" alt="image" src="https://github.com/user-attachments/assets/d833099a-28bb-4b81-8150-4f1d1ad1e99d" />
<img width="2556" height="1275" alt="image" src="https://github.com/user-attachments/assets/ddce8a9b-e916-45c5-9c1a-2e7cb8c94bdb" />
<img width="2547" height="1271" alt="image" src="https://github.com/user-attachments/assets/363e025d-74a3-4220-8bc9-a91682c37d10" />
<img width="2548" height="1262" alt="image" src="https://github.com/user-attachments/assets/88d39f00-f44b-4120-b026-64036d71583e" />
