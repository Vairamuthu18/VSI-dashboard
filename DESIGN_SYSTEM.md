# Light Dashboard Design System

Extracted from the redesigned VSI dashboard. Use this for consistent styling across all pages.

## Color Palette

### Backgrounds
- **Primary Background**: `bg-gray-50` (#F9FAFB) - Main page background
- **Card Background**: `bg-white` (#FFFFFF) - All cards and containers
- **Hover Background**: `bg-gray-50`, `bg-gray-100`, `bg-gray-200` - Interactive states
- **Disabled/Subtle**: `bg-gray-100` (#F3F4F6) - Buttons, inputs, neutral areas

### Text Colors
- **Primary Text**: `text-gray-900` (#111827) - Headlines, main content
- **Secondary Text**: `text-gray-600` (#4B5563) - Subtext, labels
- **Tertiary Text**: `text-gray-500` (#6B7280) - Disabled, metadata
- **Light Text**: `text-gray-400` (#9CA3AF) - Subtle labels, chart axes

### Accent Colors
- **Primary Accent**: `text-orange-500`, `bg-orange-500`, `border-orange-500` (#F97316) - Primary CTA, highlights
- **Accent Light**: `bg-orange-100` (#FED7AA) - Badge backgrounds
- **Accent Dark**: `text-orange-700`, `text-orange-600` (#B45309, #EA580C) - Active states

### Semantic Colors
- **Success**: `bg-green-100`, `text-green-600`, `text-green-700` (#DCFCE7, #16A34A, #15803D)
- **Warning**: `bg-yellow-100`, `text-yellow-600` (#FEF3C7, #CA8A04)
- **Info**: `text-blue-600` (#2563EB)
- **Border**: `border-gray-100`, `border-gray-200` (#F3F4F6, #E5E7EB)

## Typography

### Headings
```html
<!-- Page Title -->
<h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
  Dashboard
</h1>

<!-- Section Title -->
<h3 className="text-xl font-semibold text-gray-900">
  Key Metrics
</h3>

<!-- Card Title/Label -->
<p className="text-sm font-medium text-gray-600 mb-1">
  Total Clients
</p>
```

### Body Text
```html
<!-- Primary Body -->
<p className="text-sm sm:text-base text-gray-600 leading-6">
  Description text
</p>

<!-- Small Label -->
<p className="text-xs text-gray-500 uppercase tracking-wider">
  Labels
</p>
```

### Font Stack
- Use system font stack (Tailwind default)
- Font weights: `font-medium` (500), `font-semibold` (600), `font-bold` (700)

## Components

### Cards
```html
<div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
  <!-- Card content -->
</div>
```
- Background: `bg-white`
- Border: `border border-gray-100`
- Radius: `rounded-2xl`
- Padding: `p-6 sm:p-8`
- Shadow: `shadow-sm` (subtle shadow)

### Buttons - Primary
```html
<button className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
  Button Text
</button>
```
- Background: `bg-gray-50`
- Hover: `hover:bg-gray-100`
- Border: `border border-gray-200`
- Radius: `rounded-full`
- Padding: `px-4 py-2`

### Buttons - Accent/CTA
```html
<button className="bg-orange-500 text-white rounded-lg px-6 py-3 font-semibold hover:bg-orange-600 transition-colors">
  Action Button
</button>
```
- Background: `bg-orange-500`
- Hover: `hover:bg-orange-600`
- Text: `text-white`

### Badge
```html
<span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded">
  <Icon /> 12%
</span>
```
- For success: `bg-green-100 text-green-700`
- For orange: `bg-orange-100 text-orange-600`

### Input Fields
```html
<input
  type="text"
  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-shadow"
  placeholder="Search..."
/>
```
- Background: `bg-gray-50`
- Border: `border border-gray-200`
- Focus: `focus:ring-1 focus:ring-orange-500`
- Radius: `rounded-xl`

### Icon Circles
```html
<div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
  <Icon className="w-5 h-5" />
</div>
```
- Size options: `w-10 h-10`, `w-12 h-12`, `w-14 h-14`
- Background: `bg-{color}-100` (orange-100, green-100, blue-100, etc.)
- Icon color: `text-{color}-500` or `text-{color}-600`

## Spacing & Sizing

### Padding
- Card content: `p-6 sm:p-8`
- Sections: `py-4`, `py-6`, `px-4`, `px-6`
- Sidebar/Nav: `px-6 py-6`

### Gaps
- Item spacing: `gap-3`, `gap-4`, `gap-6`
- Grid gaps: `gap-4` (default), `gap-6`, `gap-8`

### Margin
- Page sections: `space-y-6`
- Component groups: `mb-2`, `mb-4`, `mb-6`, `mt-3`

### Breakpoints
- Responsive padding: `p-4 sm:p-8` (4px on mobile, 8px on desktop)
- Grid layouts: `grid-cols-1 lg:grid-cols-3`

## Shadows & Borders

### Shadows
```html
<!-- Subtle Shadow (default) -->
<div className="shadow-sm">

<!-- Larger Shadow -->
<div className="shadow-lg">

<!-- Drop Shadow on SVG -->
<svg className="drop-shadow-sm">
```

### Borders
- Thin border: `border border-gray-100`
- Thicker border: `border-2 border-gray-200`
- No border (default): `border border-transparent`

### Radius
- Cards: `rounded-2xl`
- Buttons: `rounded-full` (pill), `rounded-lg`, `rounded-xl`
- Inputs: `rounded-xl`
- Small elements: `rounded`, `rounded-lg`

## Transitions & Interactions

### Hover Effects
```html
<!-- Smooth color transition -->
<button className="hover:bg-gray-100 transition-colors">

<!-- Multiple property transition -->
<div className="hover:border-gray-200 hover:bg-gray-50 transition-colors">

<!-- Quick transition -->
<div className="hover:opacity-100 transition-opacity">
```

### Interactive States
- Hover: `hover:{property}`
- Focus: `focus:ring-1 focus:ring-orange-500`
- Active: Background color change, border highlight
- Disabled: Reduced opacity, cursor-not-allowed

## Layout Patterns

### Hero Section
```html
<div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-100">
  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
    <!-- Left content -->
    <div className="max-w-2xl flex-1">
      <h1 className="text-3xl sm:text-4xl font-semibold">Title</h1>
      <p className="mt-3 text-gray-600">Description</p>
    </div>
    <!-- Right actions -->
    <div className="flex items-center gap-3">
      <!-- Buttons -->
    </div>
  </div>
</div>
```

### Grid Layout (3 columns on desktop)
```html
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div><!-- Card --></div>
  <div><!-- Card --></div>
  <div><!-- Card --></div>
</div>
```

### Two-Column Layout
```html
<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
  <div><!-- Left column --></div>
  <div><!-- Right column --></div>
</div>
```

## Examples

### Metric Card
```html
<div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-colors group cursor-pointer shadow-sm">
  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-10">
    <Icon className="w-5 h-5" />
  </div>
  <p className="text-sm text-gray-600 mb-1">Total Clients</p>
  <p className="text-3xl font-semibold text-gray-900">9</p>
</div>
```

### List Item
```html
<div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors group">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200">
      <Icon className="w-5 h-5 text-gray-600" />
    </div>
    <div>
      <h4 className="text-[15px] font-medium text-gray-900">Item Title</h4>
      <p className="text-[13px] text-gray-500 mt-0.5">Subtitle · Details</p>
    </div>
  </div>
  <div className="text-right">
    <p className="text-[15px] font-medium text-gray-900">Badge</p>
  </div>
</div>
```

### Bar Chart (Light Theme)
```html
<!-- Mentioned (Orange) -->
<div className="w-3 sm:w-4 rounded-t-sm bg-orange-500 hover:bg-orange-600"></div>

<!-- Invisible (Gray) -->
<div className="w-3 sm:w-4 rounded-t-sm bg-gray-300 hover:bg-gray-400"></div>

<!-- Tooltip (Dark) -->
<div className="bg-gray-900 border border-gray-700 rounded-lg text-white"></div>
```

## Dark Mode (Future)

If needed, use these as dark mode counterparts:
- Replace `bg-white` → `dark:bg-gray-800`
- Replace `bg-gray-50` → `dark:bg-gray-900`
- Replace `text-gray-900` → `dark:text-white`
- Replace `border-gray-100` → `dark:border-gray-700`
- Keep accent colors the same: `text-orange-500`, `bg-orange-500`

---

**Last Updated**: 2026-06-15
**Theme**: Light Mode (Clean, Minimal, Professional)
**Framework**: Tailwind CSS + React/Next.js
