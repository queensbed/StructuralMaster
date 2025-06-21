# Structural Engineering Analysis Application

## Overview

This is a web-based structural engineering analysis application that allows users to create and analyze 2D structural models including beams, columns, loads, and supports. The application features a modern interface with a graphical canvas for model creation, comprehensive analysis capabilities, and detailed results visualization.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom structural engineering color scheme
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Canvas**: HTML5 Canvas for structural model visualization
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Neon Database (serverless PostgreSQL)
- **API**: RESTful API with JSON responses
- **Development**: tsx for TypeScript execution in development

### Project Structure
- `client/` - Frontend React application
- `server/` - Backend Express.js API
- `shared/` - Shared TypeScript types and database schema
- Database migrations handled via Drizzle Kit

## Key Components

### Database Schema (Drizzle ORM)
- **Projects**: Main container for structural models with metadata and JSON model data
- **Materials**: Engineering material properties (steel, concrete, timber)
- **Sections**: Cross-sectional properties for structural elements
- **Elements**: Structural members (beams, columns) with geometry and properties
- **Loads**: Point and distributed loads applied to the structure
- **Supports**: Boundary conditions (fixed, pinned, roller supports)
- **Analysis Results**: Computed structural responses (displacements, forces, moments)

### Frontend Components
- **Structural Canvas**: Interactive HTML5 canvas for model creation and visualization
- **Toolbar**: Tool selection for drawing elements, loads, and supports
- **Properties Panel**: Element property editing interface
- **Results Panel**: Analysis results display with charts and tables
- **Sidebar**: Navigation for project management and analysis tools

### Backend API Routes
- Project CRUD operations (`/api/projects`)
- Material library management (`/api/materials`)
- Section library management (`/api/sections`)
- Element management per project
- Load and support management
- Analysis execution and results retrieval

## Data Flow

### Model Creation Flow
1. User selects tool from toolbar (beam, column, load, support)
2. User draws elements on canvas with mouse interactions
3. Element data sent to backend via API
4. Database updated with new model geometry
5. Canvas re-renders with updated model state

### Analysis Flow
1. User initiates analysis from toolbar
2. Frontend shows loading modal with progress indication
3. Backend retrieves complete model data from database
4. Structural analysis engine processes model (matrix operations)
5. Results computed and stored in database
6. Frontend displays results in panels and on canvas

### Property Management
1. User selects element on canvas
2. Properties panel populated with element data
3. User modifies properties in form inputs
4. Changes saved to database via API
5. Canvas updates to reflect property changes

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL for production
- **Connection**: Via `@neondatabase/serverless` driver
- **Local Development**: PostgreSQL 16 via Replit modules

### UI Framework
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code quality and formatting (configured via shadcn/ui)

## Deployment Strategy

### Replit Deployment
- **Build Command**: `npm run build` (Vite build + esbuild for server)
- **Start Command**: `npm run start` (production server)
- **Development**: `npm run dev` (concurrent client/server with HMR)
- **Port Configuration**: Server on port 5000, mapped to external port 80

### Database Migration
- **Command**: `npm run db:push` (Drizzle Kit schema push)
- **Environment**: `DATABASE_URL` environment variable required
- **Schema**: Located in `shared/schema.ts`

### Build Output
- **Client**: Built to `dist/public/` for static serving
- **Server**: Bundled to `dist/index.js` for Node.js execution
- **Assets**: Static files served from built client directory

## Changelog

```
Changelog:
- June 21, 2025: Initial setup with database schema and React components
- June 21, 2025: Integrated advanced FEM engine with professional finite element analysis
- June 21, 2025: Added international design code checking (AISC 360, Eurocode 3, BS 5950)
- June 21, 2025: Implemented professional tabbed interface (Professional, Analysis, Results)
- June 21, 2025: Connected frontend to backend with full API integration
- June 21, 2025: Verified structural analysis workflow with real engineering calculations
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```