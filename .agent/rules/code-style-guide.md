---
trigger: always_on
---



**Project**: LogSplitter (SaaS Log Analysis Platform)  
**Stack**: React (Vite), TypeScript, Tailwind CSS, shadcn/ui, Clerk  
**Language**: TypeScript (**NOT JavaScript**)  
**Target**: Production-ready, MVP-focused, feature-complete per iteration  
**Backend Sync**: PostgreSQL primary DB + Redis cache/rate-limit; Clerk JWT auth on all protected endpoints; API responses follow `{ success: true|false, ... }`

---

## ✅ What Was Fixed (Only the Issues Encountered)

This prompt is the same feature plan you provided, but with **surgical fixes** applied where the original version would break or violate its own constraints:

1. **Clerk hook usage fixed**
   - `useAuth()` does **not** provide `user` (that comes from `useUser()`).
   - `AuthContext` updated to use `useAuth()` + `useUser()` correctly.

2. **API helper fixed for JSON + FormData**
   - Original helper always set `Content-Type: application/json`, which **breaks file uploads** (`FormData`).
   - Updated helper:
     - Detects `FormData` and avoids setting `Content-Type`
     - Handles non-JSON/empty responses safely
     - Preserves your backend response shape

3. **Path alias (`@/`) made consistent and build-safe**
   - Your code uses `@/components/ui/...`, but `vite.config.ts` and `tsconfig.json` alias were missing.
   - Added the exact alias config required for Vite + TS.

4. **“No custom UI components” constraint aligned with reality**
   - You included a `LoadingSpinner` and other wrappers. shadcn/ui does not ship a spinner component by default.
   - The prompt now clarifies: **wrapping shadcn primitives is OK**, but don’t reinvent buttons/cards/inputs/etc.

5. **shadcn/ui component list corrected**
   - You use `Checkbox`, but it wasn’t in the install list.
   - You use progress UI (you implemented manually); now you should install and use shadcn `progress`.

6. **Removed non-compliant raw `<button>` usage in Search suggestions**
   - Replaced suggestion chips with shadcn `Button` (variant + size), consistent with your constraint.

7. **Charts in Analytics feature updated to avoid inline `style={height}`**
   - Your constraints said “Tailwind only (no inline styles)”.
   - Replaced the demo “bar chart divs with inline height” with a **Progress-based visualization** that stays within shadcn + Tailwind constraints, without external chart libs.

---

## ⚠️ CRITICAL CONSTRAINTS (Apply to ALL Features)

### 1. TypeScript Only
- **ALL files must be `.tsx` or `.ts`** (never `.jsx` or `.js`)
- Use strict TypeScript (`"strict": true` in `tsconfig.json`)
- Type all props, state, API responses

Example:
```ts
interface LogEntry {
  lineNumber: number;
  level: 'ERROR' | 'WARN' | 'INFO' | 'UNKNOWN';
  message: string;
  timestamp?: string;
  fingerprint: string;
}
```

### 2. shadcn/ui Components Only (Primitives)
- **Use ONLY shadcn/ui primitives** for UI building blocks.
- You may create **thin wrapper components** (e.g., `Layout`, page-level compositions), but you **must not** reinvent primitives like cards, buttons, dialogs, inputs, etc.
- Install components as needed: `npx shadcn-ui@latest add [component]`

**Components needed across features (install in Feature 1):**
- button
- card
- input
- select
- toast
- toaster
- badge
- tabs
- dialog
- dropdown-menu
- alert
- separator
- scroll-area
- table
- pagination
- skeleton
- **checkbox** ✅ (required by Feature 6)
- **progress** ✅ (required by Feature 3 + Feature 4 loading/progress UI)

### 3. Clerk Authentication
- **Protected content must check** `isLoaded && isSignedIn`
- Token comes from Clerk `getToken()`
- **Do not assume** `user` exists inside `useAuth()`; use `useUser()` for profile fields.

Example:
```ts
const { isLoaded, isSignedIn, getToken } = useAuth();
const { user } = useUser();

if (!isLoaded) return <LoadingState />;
if (!isSignedIn) return <Navigate to="/sign-in" />;
```

### 4. API Integration Pattern (Backend-consistent)
- Base URL: `import.meta.env.VITE_API_URL` (from `.env.local`)
- **ALWAYS include Authorization header** with Clerk JWT for protected endpoints
- Error handling: Catch and display user-friendly messages
- Loading states: Use `Skeleton`, `Progress`, or a `Loader2` icon

**Important:** File upload uses `multipart/form-data`:
- Send `FormData` body
- **Do not set `Content-Type` manually** (browser will set boundary)

### 5. State Management
- React hooks only (`useState`, `useReducer`, `useContext`)
- Context for global state: auth + app settings + shared errors
- No Redux/Zustand/external state libs

### 6. API Response Types (Backend Sync)
Backend uses these shapes:

- **Success**: `{ success: true, data: {...}, message?: "..." }`
- **Error**: `{ success: false, error: "...", code: "ERROR_CODE" }`

Define:
```ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}
```

### 7. Environment Variables (`.env.local`)
```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
# Optional: if your Clerk setup uses a specific JWT template name
VITE_CLERK_JWT_TEMPLATE=
```

### 8. File Naming Convention
- Pages: `UploadPage.tsx`, `DashboardPage.tsx`
- Components: `UploadForm.tsx`, `LogViewer.tsx`
- Hooks: `useUpload.ts`, `useApiCall.ts`
- Types: `src/types/index.ts`
- Styles: Tailwind only (no CSS modules)

### 9. Error Handling (Every Feature)
- Try/catch all API calls
- Display toast notifications for errors
- Show user-friendly messages (avoid raw stack traces)
- Log to console in development

### 10. Component Props (Always Typed)
- Define interfaces for all props
- No implicit `any`

### 11. Tailwind Styling
- Tailwind classes only
- Use shadcn default design tokens
- Responsive mobile-first
- Dark mode using `dark:` classes

---