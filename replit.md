# Church Member Management System

## Overview

This is a comprehensive church member management system built with modern web technologies. The application provides a complete CRUD interface for managing church members (jemaat), families (KK), and districts (rayon) with hierarchical relationships. It features a clean, responsive interface with authentication, data filtering, search capabilities, and CSV export functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development practices
- **Styling**: Tailwind CSS with shadcn/ui components for consistent, professional UI design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless database for scalability
- **Session Management**: Express sessions with PostgreSQL store for authentication
- **Data Validation**: Zod schemas shared between client and server for consistency

### Authentication System
- **Strategy**: Simple token-based authentication with bearer tokens
- **Storage**: Session data stored in PostgreSQL with connect-pg-simple
- **Protection**: Route-level authentication middleware for API endpoints
- **Client State**: AuthManager class for handling login/logout and token management

### Data Model Hierarchy
The system implements a three-tier hierarchical structure:
1. **Districts (Rayon)** - Top-level administrative divisions
2. **Families (KK)** - Household units within districts  
3. **Members (Jemaat)** - Individual church members within families

Each member contains comprehensive information including personal details, baptism status, communion status, family role, education, occupation, and additional notes.

### API Design
- **RESTful Architecture**: Standard HTTP methods (GET, POST, PUT, DELETE) for CRUD operations
- **Endpoint Structure**: Logical resource-based URLs (/api/members, /api/families, /api/districts)
- **Error Handling**: Consistent error responses with appropriate HTTP status codes
- **Data Export**: Dedicated CSV export endpoint for member data

### Development Workflow
- **Hot Reloading**: Vite development server with HMR for rapid development
- **Type Safety**: End-to-end TypeScript with shared schemas between client and server
- **Path Aliases**: Configured import aliases for clean, maintainable code structure
- **Build Process**: Separate client and server builds with esbuild for production

## External Dependencies

### Database & ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **drizzle-zod**: Integration between Drizzle and Zod for schema validation

### UI Components & Styling
- **@radix-ui/react-***: Comprehensive primitive component library for accessibility
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Type-safe CSS class composition
- **lucide-react**: Modern icon library

### Forms & Validation
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Integration resolvers for validation libraries
- **zod**: TypeScript-first schema validation

### State Management & Data Fetching
- **@tanstack/react-query**: Powerful data synchronization for React applications
- **wouter**: Minimalist routing library

### Development Tools
- **vite**: Next-generation frontend build tool
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **typescript**: Static type checking for JavaScript

### Session & Authentication
- **connect-pg-simple**: PostgreSQL session store for Express
- **express-session**: Session middleware for Express.js

### Utility Libraries
- **date-fns**: Modern JavaScript date utility library
- **clsx**: Utility for constructing className strings conditionally