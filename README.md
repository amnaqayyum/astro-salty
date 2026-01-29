# Salty Architects - About Page Task

Welcome! You've been hired to improve the **About page** design for desktop and mobile.

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:4321/about

## Your Task

Make the About page (`src/pages/about.astro`) look great on:
- **Desktop**: 1920px, 1440px, 1024px widths
- **Mobile**: 375px width

The current implementation is basic - feel free to be creative while keeping the content intact.

## What is Astro?

Astro is a static site generator. Think of it like HTML templates with superpowers:

- `.astro` files = HTML + CSS + JS in one file
- The `---` section at the top is server-side code (runs at build time)
- Below that is your template (HTML-like)
- `<style>` tags are scoped to the component by default

Example:
```astro
---
// This runs at build time (like PHP/Node)
const title = "Hello";
---

<h1>{title}</h1>

<style>
  /* This only affects THIS component */
  h1 { color: red; }
</style>
```

Learn more: https://docs.astro.build

## Project Structure

```
src/
  pages/
    about.astro      <-- YOUR MAIN FILE
    index.astro      (home - ignore)
    contact.astro    (for reference)
    press.astro      (for reference)
  layouts/
    Layout.astro     (shared header/nav - don't modify)
  components/
    MobileSidebar.astro
assets/
  about/team.jpeg    (team photo)
  fonts/             (custom fonts - already loaded)
```

## Styling

We use **Tailwind CSS**. You can use:
- Tailwind classes: `<div class="flex gap-4 p-8">`
- Scoped `<style>` blocks for custom CSS
- Both together

Tailwind docs: https://tailwindcss.com/docs

## Design System

- **Background**: `#E9E9E9`
- **Text color**: `#3D3D3D`
- **Fonts**:
  - `'Neue Haas Grotesk Text Pro'` - body text
  - `'Brown_std'` - headings (if needed)
- **Mobile breakpoint**: 768px (`@media (max-width: 768px)`)

## Content to Keep

The About page must include:
- Team photo (already there)
- Studio intro paragraph
- 4 team member bios: Motti, Hadar, Tamara, Shir
- Footer with Instagram link, address, and credits

## Commands

```bash
npm run dev      # Start dev server at localhost:4321
npm run build    # Build for production
npm run preview  # Preview production build
```

## Screenshot Testing (Info Only)

We use Playwright for screenshot testing. The tests compare your page against baseline screenshots at different viewport sizes.

**You don't need to run tests** - just be aware that your design will be evaluated at these exact widths:
- 1920px (large desktop)
- 1440px (desktop)
- 1024px (small desktop/tablet)
- 375px (mobile)

Test file for reference: `tests/about.spec.ts`

## Tips

1. Start the dev server and keep it running - changes hot-reload instantly
2. Use browser DevTools to test different screen sizes
3. The layout should adapt smoothly, not break at certain widths
4. Keep the design clean and professional - this is an architecture firm

## Submitting Your Work

When done:
1. Push your changes to this repo
2. Deploy to Vercel (free): https://vercel.com/new
3. Send both the repo URL and the live preview URL

## Questions?

Reach out if anything is unclear. Good luck!
