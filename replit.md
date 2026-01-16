# Wesvalia Kloktye

## Overview

Wesvalia Kloktye is a school timetable calculator application for Wesvalia school. Users select a start time using an iOS-style scroll wheel picker, and the app calculates period timings that end at 13:50, accounting for walking time between classes and a fixed break period. The generated timetable can be saved as an image for sharing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for smooth page transitions and scroll animations
- **Build Tool**: Vite with custom Replit plugins for development

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect

### Project Structure
```
client/           # React frontend application
  src/
    components/   # UI components including shadcn/ui
    pages/        # Page components (Home, not-found)
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API route definitions
  storage.ts      # Database operations
  db.ts           # Database connection
shared/           # Shared code between client and server
  schema.ts       # Drizzle database schemas
  routes.ts       # API contract definitions with Zod
```

### Key Design Decisions

1. **Client-Side Calculation**: Timetable calculations happen entirely on the frontend for instant feedback. The calculation uses seconds precision to avoid rounding errors.

2. **Scroll Wheel Time Picker**: Uses Embla Carousel configured for vertical scrolling to create an iOS-style time picker that's touch-friendly.

3. **Image Export**: html2canvas library enables saving the generated timetable as a shareable image.

4. **Shared Type Safety**: Zod schemas in `shared/routes.ts` define API contracts used by both client and server, ensuring type safety across the stack.

5. **Timetable Logic**:
   - End time is fixed at 13:50
   - Walking time is 4 minutes between periods (8 walking gaps total)
   - 30-minute break between Period 4 and 5
   - 8 periods total with equal duration

### Database Schema
- **schedules**: Stores generated schedules with `startTime` (HH:mm format) and `generatedAt` timestamp

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with schema defined in `shared/schema.ts`

### Third-Party Libraries
- **shadcn/ui**: Pre-built accessible React components (Radix UI primitives)
- **Embla Carousel**: Powers the scroll wheel time picker
- **html2canvas**: Captures timetable as downloadable image
- **Framer Motion**: Animations and transitions
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **Replit Plugins**: Development banner and cartographer for Replit environment