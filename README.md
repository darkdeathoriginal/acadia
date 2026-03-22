# Acadia 🎓

[![GitHub stars](https://img.shields.io/github/stars/darkdeathoriginal/acadia?style=flat-square)](https://github.com/darkdeathoriginal/acadia/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/darkdeathoriginal/acadia?style=flat-square)](https://github.com/darkdeathoriginal/acadia/issues)
[![GitHub forks](https://img.shields.io/github/forks/darkdeathoriginal/acadia?style=flat-square)](https://github.com/darkdeathoriginal/acadia/network/members)

Acadia is a comprehensive student management and productivity dashboard built with Next.js. It helps students track their attendance, manage academic marks, calculate CGPA, and stay organized with a built-in planner and timetable.

## ✨ Features

- **Attendance Tracking**: Monitor your attendance across all subjects.
- **Marks Management**: Keep track of your academic performance and internal marks.
- **CGPA Calculator**: Easily calculate and predict your CGPA.
- **Interactive Timetable**: View your daily schedule with a clean, responsive layout.
- **Academic Calendar**: Stay updated with important academic dates and events.
- **PWA Support**: Installable on mobile and desktop for offline-ready access.
- **Feedback System**: Built-in module for providing academic or system feedback.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management & UI**: React Hooks, Lucide Icons
- **Backend & API**: Next.js API Routes, Prisma ORM
- **Data Handling**: Axios, Cheerio (for scraping/parsing), Tough Cookie
- **Forms**: React Hook Form, Zod (Validation)
- **Deployment**: Optimized for Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm / yarn / pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/darkdeathoriginal/acadia.git
   cd acadia
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable React components and page-specific logic.
- `hooks/`: Custom React hooks for data fetching and local storage.
- `lib/`: Shared contracts and library configurations.
- `utils/`: Helper functions and type definitions.
- `public/`: Static assets and PWA configurations.

## 📦 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality.
- `npm run tunnel`: Opens a local tunnel via ngrok for testing.
