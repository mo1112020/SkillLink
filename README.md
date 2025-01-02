# Skillshare Platform

A modern platform for connecting people who want to learn new skills with those willing to teach them.

## Features

- User Authentication
- Skill Sharing and Learning
- Real-time Messaging
- Post Creation and Interaction
- User Profiles
- Community Building

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma (PostgreSQL)
- NextAuth.js
- TailwindCSS
- Socket.IO (for real-time features)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and update the variables:
   ```bash
   cp .env.example .env
   ```

4. Set up the database:
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/         # React components
├── lib/               # Utility functions and configurations
└── types/             # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
