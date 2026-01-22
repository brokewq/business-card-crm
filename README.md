# Business Card CRM (PWA)

A multi-tenant SaaS Progressive Web Application for managing business contacts via AI-powered business card scanning.

## Features

- 📸 **Business Card Scanner** - Capture cards with camera or upload images
- 🤖 **AI-Powered OCR** - Automatic data extraction using Google Gemini
- 👥 **Contact Management** - Desktop spreadsheet and mobile card views
- 🏢 **Company Auto-Linking** - Automatic company creation based on domain matching
- 🏷️ **Tags & Lists** - Organize contacts with custom tags
- 📊 **Excel Export** - Export contacts to spreadsheet
- 📱 **PWA** - Install on mobile and desktop

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** Supabase Auth
- **AI:** Google Gemini API
- **Storage:** Supabase Storage

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google AI Studio API key

### Installation

1. Clone the repository:
```bash
cd business-card-crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Set up the database:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase/schema.sql`

5. Create a storage bucket:
   - Go to Supabase Storage
   - Create a bucket named `card-images` with public access

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── contacts/          # Contact-related components
│   ├── scanner/           # Scanner components
│   ├── tags/              # Tag components
│   └── ui/                # Shared UI components
├── lib/                   # Utility functions
│   ├── supabase/          # Supabase clients
│   ├── gemini.ts          # Gemini AI integration
│   ├── domain-utils.ts    # Domain extraction
│   └── image-utils.ts     # Image compression
└── types/                 # TypeScript types
```

## License

MIT
