# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a website redesign for Salty Architects, migrating from WordPress to a modern Astro-based stack. The site showcases architectural projects with image galleries, press coverage, and company information.

## Tech Stack
- **Astro 5.x** - Static site generator with TypeScript support
- **Tailwind CSS** - Utility-first CSS framework
- **Playwright** - End-to-end testing framework
- **TypeScript** - Type safety and better development experience

## Common Commands

### Development
```bash
npm run dev          # Start development server at localhost:4321
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm run test         # Run Playwright tests (requires dev server)
```

## Architecture

### Data Structure
- **Projects**: JSON files in `data/projects/[slug]/[slug].json` with accompanying images
- **Press**: JSON files in `data/press/` directory
- **Static assets**: Images in `assets/` directory organized by type (home, icons, fonts)

### Key Files
- `src/utils/data.ts` - Data fetching utilities for projects and press items
- `src/layouts/Layout.astro` - Main layout with navigation and SEO metadata
- `src/types/index.ts` - TypeScript interfaces for ProjectData, PressItem, ContactInfo

### Page Structure
- `/` - Homepage (accessible via logo click)
- `/projects` - Projects index page (navigation "INDEX" button)
- `/projects/[slug]` - Individual project pages
- `/about` - About page
- `/press` - Press coverage
- `/contact` - Contact information

### Design System
- **Fonts**: Brown_std and Neue Haas Grotesk Text Pro (loaded via @font-face)
- **Colors**: Background #E9E9E9, text #3D3D3D
- **Navigation**: Fixed header with special behavior for homepage

### Special Features
- Projects page shows details inline with URL changes to `/projects/:slug`
- Homepage image carousel with left/right navigation zones
- MD Penthouse project always displays first in project listings
- Responsive design with desktop and mobile layouts

### Testing
- Playwright tests in `tests/` directory
- Visual regression testing with screenshot comparisons
- Tests run against local development server on port 4321
- See `docs/PIXEL-PERFECT-TESTING.md` for design-to-implementation testing guide

## Development Notes
- Project data is loaded statically from JSON files at build time
- Images are referenced relative to the project folder structure
- The site uses Astro's static site generation for optimal performance
- All pages are server-side rendered at build time