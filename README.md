# Health Screening Portal

A central portal application that provides a unified landing page and patient profile management for health screening services. This application redirects users to external Oroscan (Oral Cancer Screening) and Medtech (Anemia Screening) applications.

## Features

- **Landing Page**: Same design as the BTP application with information about available screenings
- **Authentication**: Login and registration system using NextAuth.js
- **Patient Profile**: Fill in patient information before starting screening
- **External Redirects**: Redirects users to external Oroscan and Medtech applications with patient data
- **Dashboard Access**: Quick access to external dashboards for viewing screening records
- **Multi-language Support**: English, Hindi, and Bengali
- **Theme Support**: Light and dark mode

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Oroscan and Medtech applications running on their respective URLs

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file and configure:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/screening_db"
NEXTAUTH_URL="http://localhost:3003"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_OROSCAN_URL="http://localhost:3001"
NEXT_PUBLIC_MEDTECH_URL="http://localhost:3002"
NEXT_PUBLIC_OROSCAN_DASHBOARD_URL="http://localhost:3001/dashboard"
NEXT_PUBLIC_MEDTECH_DASHBOARD_URL="http://localhost:3002/dashboard"
```

4. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3003`

## Application Flow

1. **Landing Page** (`/`): Users see the health screening platform overview
2. **Login** (`/auth/login`): Users authenticate to access screening
3. **Screening** (`/screening`): Users fill in patient profile information
4. **Select Screening Type**: Choose between Oroscan or Medtech
5. **External Redirect**: User is redirected to the selected application with patient data

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL database connection string |
| `NEXTAUTH_URL` | URL where this app is running |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js |
| `NEXT_PUBLIC_OROSCAN_URL` | URL of the Oroscan application |
| `NEXT_PUBLIC_MEDTECH_URL` | URL of the Medtech application |
| `NEXT_PUBLIC_OROSCAN_DASHBOARD_URL` | URL of the Oroscan dashboard |
| `NEXT_PUBLIC_MEDTECH_DASHBOARD_URL` | URL of the Medtech dashboard |

## Project Structure

```
screening/
├── app/
│   ├── api/auth/           # NextAuth API routes
│   ├── auth/               # Login and register pages
│   ├── screening/          # Patient profile page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # UI components (Button, Card, etc.)
│   ├── language-provider.tsx
│   ├── session-provider.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Utility functions
└── prisma/
    └── schema.prisma       # Database schema
```

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Animations**: Framer Motion

