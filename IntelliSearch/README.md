# IntelliSearch IR Platform — Frontend

A high-performance information retrieval frontend for searching research papers and
technical documents. Built with React 19, Vite, Tailwind CSS v4, and React Query, with
an integrated PDF viewer.

---

## Features

- **Light & dark themes** — light is the default; a toggle switches instantly (CSS-variable
  driven, persisted to `localStorage`, no flash on load).
- **Google-style search** with a focused, accessible search bar and suggested topics.
- **Card-based results** with relevance score, metadata, and a "Read more" summary.
- **Integrated PDF viewer** (react-pdf / pdf.js) opened in a modal, lazy-loaded so the
  heavy worker never ships in the main bundle.
- **External links** open the document's source in a new tab.
- **Paginated** results with query and scroll position preserved across pages.
- **Elegant empty / error / loading states**.
- **Responsive** mobile-first layout, keyboard navigation and ARIA labels.
- Data fetching, caching and request states handled by **React Query**.

---

## Getting Started

```bash
npm install
npm run dev      # http://localhost:5173
```

The app expects the Spring Boot backend at the URL configured in `.env`.
Search requests go to `POST {VITE_API_BASE_URL}/api/search`.

---

## Configuration

Backend URL lives in `.env` (see `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8080
```

All API usage reads from `src/config/constants.ts`, so switching backends is a one-line
change. That file also holds page size, summary truncate length, debounce delay and the
suggested-topic list.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
  api/
    searchApi.ts              Fetch wrapper with timeout + typed errors
    documentApi.ts            Document content fetcher
  components/
    Logo.tsx                  Brand mark + wordmark
    SearchBar.tsx             Search input with submit
    Header.tsx                Sticky header with logo + theme toggle
    ThemeToggle.tsx           Light/dark mode switch
    ResultCard.tsx            Single search result card
    SummaryText.tsx           Truncated summary with "Read more"
    Pagination.tsx            Page navigation
    PdfViewerModal.tsx        In-app PDF viewer (lazy-loaded)
    AppBackground.tsx         Subtle page backdrop
    states/
      EmptyState.tsx          No results found
      ErrorState.tsx          Error with retry
      ResultsSkeleton.tsx     Loading skeleton cards
  config/
    constants.ts              Env-driven configuration
  hooks/
    useSearch.ts              React Query search hook
    useDebounce.ts            Debounce utility hook
  pages/
    HomePage.tsx              Home page with hero + suggested topics
    SearchPage.tsx            Search results with pagination
  theme/
    themeContext.ts            Theme context + useTheme hook
    ThemeProvider.tsx          Theme provider (light/dark)
  types/
    index.ts                  API request/response types
```
