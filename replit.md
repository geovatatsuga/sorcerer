# Overview

This is a full-stack fantasy webnovel reading platform called "The Return of the First Sorcerer". The application is built as a React-based frontend with an Express.js backend, designed to showcase chapters, characters, world-building content, and a codex of fantasy lore. The platform includes features for chapter reading with progress tracking, character galleries, an interactive world map, blog posts, and newsletter subscription functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming, featuring a dark fantasy aesthetic
- **State Management**: TanStack React Query for server state management and data fetching
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation resolvers

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API endpoints for chapters, characters, locations, codex entries, blog posts, and reading progress
- **Error Handling**: Centralized error middleware with structured error responses
- **Development Tools**: Hot reloading with Vite integration and runtime error overlays

## Data Storage Solutions
- **Database**: PostgreSQL configured with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL adapter
- **Fallback Storage**: In-memory storage implementation for development/testing

## Key Features
- **Chapter Reading**: Full chapter content with reading progress tracking
- **Character Gallery**: Character profiles with role-based filtering
- **World Map**: Interactive map with clickable locations
- **Codex System**: Categorized lore entries for magic, creatures, and locations
- **Blog Platform**: Author blog posts with category filtering
- **Reading Progress**: Session-based progress tracking with local storage
- **Newsletter Signup**: Email subscription functionality

## Project Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend
├── shared/          # Shared TypeScript types and schemas
├── migrations/      # Database migration files
└── attached_assets/ # Static content files
```

# External Dependencies

## Frontend Dependencies
- **UI Framework**: React 18 with TypeScript support
- **Component Library**: Shadcn/ui with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with PostCSS processing
- **State Management**: TanStack React Query for server state and caching
- **Form Handling**: React Hook Form with Hookform Resolvers for validation
- **Icons**: Lucide React for consistent iconography
- **Date Utilities**: date-fns for date formatting and manipulation

## Backend Dependencies
- **Database ORM**: Drizzle ORM with Drizzle Zod for schema validation
- **Database Connection**: Neon Database serverless PostgreSQL adapter
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Validation**: Zod for runtime type checking and validation
- **Development**: TSX for TypeScript execution and hot reloading

## Build and Development Tools
- **Build Tool**: Vite for fast development and optimized production builds
- **TypeScript**: Full TypeScript support across frontend and backend
- **ESBuild**: For backend bundling in production
- **Development**: Replit-specific plugins for enhanced development experience

## Database Schema
The application uses PostgreSQL with the following main entities:
- **Chapters**: Story content with slug-based routing and reading time estimates
- **Characters**: Character profiles with roles (protagonist, antagonist, supporting)
- **Locations**: World map locations with coordinate-based positioning
- **Codex Entries**: Categorized lore content (magic, creatures, locations)
- **Blog Posts**: Author blog content with category organization
- **Reading Progress**: User session-based reading tracking