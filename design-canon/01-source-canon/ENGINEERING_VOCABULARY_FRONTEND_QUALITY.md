# Engineering Vocabulary for Production-Grade Frontend Quality
**The language you need to direct a senior engineering team to build a site people trust, use daily, and pay for.**

This is organized by what you're actually trying to say in a meeting or Slack message, not by textbook category. Each term includes the phrase you'd use with your CTO, what it actually means, and why it matters for AESDR specifically.

---

## 1. Visual Fidelity & Rendering

These are the terms for "does it look right, everywhere, every time."

**Pixel-perfect implementation** — The built UI matches the design file within 1–2px at every breakpoint. When you say this, you're telling engineering that "close enough" is not acceptable. The designer's Figma is the contract.

**Sub-pixel rendering** — How browsers handle elements that land between physical pixels. Text and thin borders look fuzzy or inconsistent across devices. Relevant to AESDR because your thin-weight Cormorant Garamond will render differently on Retina vs non-Retina displays. The fix is usually `transform: translateZ(0)` or explicit font-smoothing rules.

**Anti-aliasing** — How edges of text and shapes are smoothed. Two modes matter: `subpixel-antialiased` (default, sharper on LCDs) and `antialiased` (smoother, what most modern apps use). You want a global decision documented in the design system: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`

**Font rendering / FOUT / FOIT** — FOUT (Flash of Unstyled Text): the page loads with a fallback font, then snaps to the real font. FOIT (Flash of Invisible Text): text is invisible until the real font loads. With four custom fonts (Abril Fatface, Cormorant Garabond, Barlow Condensed, DM Mono), you are guaranteed to hit one of these unless you explicitly handle it. The engineering term is `font-display: swap` (shows fallback immediately, swaps when ready) vs `font-display: optional` (skips the custom font if it's slow). Swap is usually right for body text; optional can be right for decorative display text.

**Font subsetting** — Shipping only the character ranges you actually use instead of the full font file. If AESDR is English-only, you can cut font payloads by 60–80% by subsetting to Latin glyphs. The tool is `glyphhanger` or Google Fonts' built-in `&text=` parameter.

**Color space / gamut** — sRGB is the default web color space. P3 is wider (more vivid, supported on modern Apple devices). Your iridescent iris gradient will look different — potentially muted — on sRGB-only displays. The engineering term is `color(display-p3 ...)` with an sRGB fallback. You say: "Are we using P3 with sRGB fallback for the hero gradient?"

**CSS custom properties (design tokens)** — Variables like `--color-primary: #E6701E` defined once, used everywhere. The engineering concept is a "single source of truth for visual decisions." If someone asks you to change the accent color and it takes more than one line of code, your tokens are broken.

**Theming / dark mode support** — Not just "invert the colors." Proper theming means every color in the system has a semantic name (`--color-surface`, `--color-text-primary`) and a mapping per theme. Even if AESDR launches light-only, building on semantic tokens means dark mode is a config change, not a rewrite.

**Gradient banding** — Visible stepping/stripes in smooth gradients, especially on 8-bit displays. Your iridescent iris gradient is at high risk. The fix is `background-image` with dithering, or adding a subtle noise texture overlay. The engineering phrase: "Are we dithering the hero gradient to prevent banding on 8-bit panels?"

**Opacity vs transparency** — Opacity affects the entire element and its children; `background-color: rgba()` affects only the background. Mixing these up creates z-index nightmares and text readability issues. The term you want is "Is the glass effect using backdrop-filter or element opacity?"

**Backdrop-filter / glassmorphism** — `backdrop-filter: blur(...)` creates frosted-glass effects. Looks premium but has performance implications on mobile and is unsupported in some Android browsers. The engineering question: "What's our fallback for backdrop-filter on unsupported browsers?"

**Blend modes** — `mix-blend-mode` and `background-blend-mode` control how overlapping elements combine visually (multiply, screen, overlay). Used for sophisticated gradient effects, text over images. Can produce unexpected results on different backgrounds. The phrase: "Are blend modes producing consistent results across our background variants?"

---

## 2. Layout & Responsiveness

These are the terms for "does it work on every screen size without looking broken."

**Responsive vs adaptive** — Responsive: fluid layouts that continuously adjust. Adaptive: discrete layouts that snap at breakpoints. Modern practice is responsive with breakpoint-specific overrides. You want to say: "We're responsive-first with breakpoint overrides at 375, 768, 1024, 1280, and 1920."

**Breakpoints** — The viewport widths where layout changes. Don't pick arbitrary numbers; pick the widths where YOUR design breaks. Common: 375px (iPhone SE, the smallest screen that matters), 390px (iPhone 14/15), 768px (iPad portrait), 1024px (iPad landscape / small laptop), 1280px (standard laptop), 1920px (desktop).

**Container queries** — Newer CSS feature: components respond to THEIR container's size, not the viewport. This is how you build components that work correctly whether they're in a sidebar, a modal, or full-width. The engineering phrase: "Are our lesson cards using container queries or viewport-dependent media queries?"

**Intrinsic sizing** — Using `min-content`, `max-content`, `fit-content`, and `clamp()` instead of fixed pixel values. This is what makes text-heavy layouts (like course content) not break at weird viewport sizes. The phrase: "Is body copy using `clamp()` for fluid type scaling?"

**Fluid typography** — Font sizes that scale smoothly between breakpoints instead of jumping. Implemented with `clamp(min, preferred, max)`. Example: `font-size: clamp(1rem, 2.5vw, 1.5rem)`. For AESDR's four-font stack, each font needs its own fluid scale because display fonts (Abril Fatface) and body fonts (Barlow) have different optical sizes.

**Viewport units (vw, vh, dvh, svh, lvh)** — `vh` is broken on mobile because it doesn't account for the browser chrome (address bar, toolbar). `dvh` (dynamic viewport height) does. If your AESDR lesson player uses `100vh` for full-screen mode, it will be wrong on every mobile browser. The fix is `100dvh` with a fallback.

**Aspect ratio** — `aspect-ratio: 16/9` maintains proportions without padding hacks. Critical for video embeds, thumbnail grids, and certificate previews. The engineering term: "Are media elements using native aspect-ratio or the padding-bottom hack?"

**Overflow handling** — What happens when content exceeds its container. `overflow: hidden` clips silently (dangerous — hides content). `overflow: auto` adds scrollbars when needed. `overflow: clip` is like hidden but doesn't create a new scroll context. Quiz questions with long answer text, lesson descriptions, and user-generated content are where this breaks. The phrase: "What's our overflow strategy for variable-length user content?"

**Scroll snap** — `scroll-snap-type` and `scroll-snap-align` create that satisfying "lock to the next card" behavior when scrolling through carousels or lesson lists. The engineering phrase: "Is the course carousel using CSS scroll-snap or a JS library?"

**Safe area insets** — The notch, Dynamic Island, and rounded corners on modern phones eat into your layout. `env(safe-area-inset-top)` prevents content from hiding behind them. The phrase: "Are we respecting safe-area-insets on the lesson player and payment forms?"

**Logical properties** — `margin-inline-start` instead of `margin-left`. This makes your layout automatically work for RTL (right-to-left) languages. Even if AESDR is English-only today, using logical properties costs nothing and makes internationalization trivial later. The phrase: "Are we using logical properties or physical directional properties?"

---

## 3. Motion, Animation & Transitions

These are the terms for "does it feel alive and responsive, not janky or sluggish."

**Easing curves** — The acceleration profile of an animation. `ease-in-out` is the default and looks robotic. Premium sites use custom cubic-bezier curves. Apple's default is approximately `cubic-bezier(0.25, 0.1, 0.25, 1.0)`. The engineering phrase: "What's our default easing curve, and is it documented in the motion spec?"

**Spring animations** — Physics-based motion that feels natural (slight overshoot, deceleration). Libraries: Framer Motion, React Spring. The engineering concept: spring animations have `stiffness`, `damping`, and `mass` parameters instead of `duration`. The phrase: "Are interactive elements using spring physics or timed easings?"

**60fps / jank** — Animations must hit 60 frames per second (16.7ms per frame) to feel smooth. "Jank" is the visible stutter when a frame takes too long. The engineering tool is Chrome DevTools → Performance tab → look for long frames. The phrase: "Are we profiling animation performance and targeting 60fps on mid-range Android?"

**GPU-accelerated properties** — Only `transform` and `opacity` can be animated without triggering layout recalculation. Animating `width`, `height`, `top`, `left`, `margin`, or `padding` causes "layout thrashing" and kills performance. The phrase: "Are all animations using transform/opacity only, or are we triggering reflows?"

**Layout thrashing / forced reflow** — Reading layout properties (like `offsetHeight`) then immediately writing style changes forces the browser to recalculate layout synchronously. This is the #1 cause of animation jank. The engineering phrase: "Are we batching DOM reads and writes to avoid forced reflows?"

**will-change** — CSS hint that tells the browser to pre-optimize an element for animation. `will-change: transform` promotes the element to its own GPU layer. Overuse causes memory bloat. The phrase: "Are we using `will-change` selectively on animated elements, not globally?"

**Reduced motion** — `@media (prefers-reduced-motion: reduce)` — users with vestibular disorders or motion sensitivity set this OS preference. Your site MUST respect it. Animations should be replaced with instant transitions or subtle fades. This is both an accessibility requirement and a legal liability. The phrase: "Do all animations respect prefers-reduced-motion?"

**Skeleton screens / content shimmer** — The gray pulsing placeholder shapes that appear while content loads (Facebook, YouTube, LinkedIn all use these). Better than a spinner because it signals spatial layout before data arrives. The engineering term is "skeleton loading state" or "placeholder shimmer." The phrase: "Do our lesson cards have skeleton states or are they showing spinners?"

**Optimistic UI** — Updating the UI immediately before the server confirms the action. When a user clicks "Mark lesson complete," the checkmark appears instantly; if the server rejects it, you roll back. This is what makes apps feel fast. The phrase: "Are state-changing actions optimistic or do they wait for server confirmation?"

**Stagger animation** — Items in a list animate in sequence with a slight delay between each. The course catalog cards appearing one-by-one instead of all at once. The engineering term: `stagger` or `transition-delay` offset. The phrase: "Is the card grid using staggered entrance animation?"

**Micro-interactions** — Small, purposeful animations on interactive elements: button press feedback, toggle switches, progress indicators, form field focus states. These are 80% of what makes a site feel "polished" vs "functional." The phrase: "What's our micro-interaction spec for primary CTAs, form inputs, and progress indicators?"

**Scroll-driven animations** — Animations tied to scroll position rather than time. CSS `animation-timeline: scroll()` or `animation-timeline: view()` (new, native) or libraries like GSAP ScrollTrigger. The phrase: "Are scroll-triggered sections using native scroll-driven animations or a JS library?"

**Page transitions** — What happens between route changes. Hard cut (jarring), fade (acceptable), shared-element transition (premium — the card morphs into the page). The engineering term: View Transitions API (new native browser API). The phrase: "Are we using the View Transitions API for route changes or hard-cutting between pages?"

---

## 4. Forms, Inputs & Data Capture

These are the terms for "does filling out forms feel effortless and trustworthy."

**Form validation — inline vs submit-time** — Inline: errors appear as you type or when you leave a field. Submit-time: errors appear after you click submit. Inline is the modern standard; submit-time feels like 2010. The engineering term: "Are we doing inline validation with real-time feedback or submit-time validation?"

**Debounce vs throttle** — Debounce: wait until the user stops typing for N ms, then act. Throttle: act at most once every N ms regardless. Email uniqueness check = debounce (300ms after last keystroke). Search autocomplete = throttle (fire every 200ms while typing). The phrase: "Is the email field debounced for uniqueness checks? What's the interval?"

**Input masking** — Automatically formatting input as the user types (phone numbers, credit cards, dates). Libraries: IMask, Cleave.js. The phrase: "Are payment fields using input masking for card number and expiry?"

**Autofill compatibility** — Browsers autofill name, email, address, and payment fields using the `autocomplete` attribute. If your form fields don't have correct `autocomplete` values, Chrome and Safari won't offer to fill them, and checkout abandonment spikes. The phrase: "Are all form fields tagged with correct `autocomplete` attributes for browser autofill?"

**Focus management** — Where keyboard focus goes after an action (modal opens, form submits, error appears). Bad focus management means keyboard and screen reader users get lost. The engineering term: "focus trap" (focus stays within a modal), "focus restoration" (focus returns to the trigger after a modal closes). The phrase: "Do our modals trap focus and restore it on close?"

**Error state hierarchy** — Field-level error (red border + message), form-level error (summary at top), toast notification (temporary), inline banner (persistent). You need a documented decision about which level of error uses which pattern. The phrase: "What's our error state hierarchy and when does each pattern fire?"

**Progressive disclosure** — Showing only what's needed at each step, revealing more as the user progresses. Multi-step checkout instead of one long form. Accordion FAQ instead of wall of text. The phrase: "Is onboarding using progressive disclosure or showing everything at once?"

**Haptic feedback** — On mobile, triggering the device's vibration motor on certain interactions (successful payment, quiz completion). The API is `navigator.vibrate()`. Subtle, but makes mobile interactions feel native. The phrase: "Are we using haptic feedback on key mobile interactions like payment confirmation?"

**Touch target size** — Minimum 44x44px (Apple guideline) or 48x48px (Google Material). Anything smaller is a misclick magnet on mobile. Common violations: close buttons, secondary links, quiz answer radio buttons. The phrase: "Are all interactive elements meeting minimum 48x48 touch targets on mobile?"

---

## 5. Dialog, Modal & Overlay Patterns

These are the terms for "popups that don't make people want to close the tab."

**Modal vs dialog vs sheet vs drawer** — Modal: blocks interaction with the page behind it. Dialog: same as modal (the HTML `<dialog>` element is the native implementation). Sheet: slides up from the bottom (mobile pattern). Drawer: slides in from the side (navigation pattern). The engineering phrase: "Are we using native `<dialog>` with `::backdrop` or a custom modal implementation?"

**Backdrop / scrim** — The dark overlay behind a modal. Standard: `rgba(0,0,0,0.5)` or `rgba(0,0,0,0.6)`. The native CSS: `::backdrop`. The phrase: "What's our scrim opacity and is it using native `::backdrop`?"

**Scroll locking** — When a modal opens, the background page should not scroll. This is notoriously broken on iOS Safari. The engineering fix involves `body { overflow: hidden; position: fixed; }` with scroll position preservation. The phrase: "Is scroll locking working correctly on iOS Safari when modals are open?"

**Dismiss patterns** — How a modal closes: X button, click outside (backdrop click), Escape key, swipe down (mobile sheet). All four should work. The phrase: "Do all modals support X, backdrop click, Escape, and swipe dismiss?"

**Z-index management** — Overlapping layers (dropdowns, tooltips, modals, toasts) need a managed stacking order. Without a system, you get modals hidden behind headers or tooltips clipped by containers. The engineering term: "z-index scale" or "stacking context management." The phrase: "Do we have a documented z-index scale, and are we avoiding unnecessary stacking contexts?"

**Portal rendering** — Rendering a modal's DOM outside its parent component tree (at the document root) to avoid clipping and z-index issues. React: `createPortal()`. The phrase: "Are modals rendered via portals or inline in the component tree?"

**Confirmation dialogs / destructive action patterns** — Before irreversible actions (delete account, unenroll from course), show a confirmation with the destructive action in red and the safe action as the default/primary button. The phrase: "Are all destructive actions gated by a confirmation dialog with the destructive option de-emphasized?"

---

## 6. State Persistence & Save Mechanisms

These are the terms for "does my progress survive every weird thing a user does."

**Autosave** — Saving user progress without requiring a manual save action. Two patterns: time-based (save every 30 seconds) and event-based (save on every meaningful interaction). AESDR needs event-based for quiz progress and time-based as a safety net. The phrase: "Is lesson progress autosaved on every interaction plus a 30-second interval backup?"

**Optimistic persistence** — UI reflects the save immediately; actual write happens in the background. If the write fails, surface a non-blocking error with retry. The phrase: "Are progress saves optimistic with background persistence and retry?"

**Conflict resolution / last-write-wins** — When a user has the app open in two tabs and makes changes in both, what happens? Last-write-wins is simplest (later save overwrites earlier). Merge is better but complex. The phrase: "What's our conflict resolution strategy for multi-tab/multi-device progress?"

**Offline resilience** — What happens when the network drops mid-lesson? Service workers can cache the lesson content. IndexedDB can queue progress writes for sync when connectivity returns. The phrase: "Do we have offline fallback for lesson content and queued writes for progress?"

**Session persistence vs account persistence** — Session data (form draft, scroll position) lives in sessionStorage and dies when the tab closes. Account data (progress, settings) lives on the server and survives forever. Mixing these up means users lose work. The phrase: "Is quiz draft state session-persisted or account-persisted?"

**Idempotent writes** — If the same save request fires twice (network retry, double-click), the result is identical to firing once. Critical for payment and enrollment endpoints. The phrase: "Are payment and enrollment endpoints idempotent?"

**Retry with exponential backoff** — When a save fails, retry after 1s, then 2s, then 4s, then 8s, with a cap. Prevents thundering-herd retries from overwhelming the server. The phrase: "Are failed writes using exponential backoff with jitter?"

**Dirty state indicator** — A visual signal (dot, asterisk, "unsaved changes" text) when the user has made changes that haven't been persisted yet. Prevents the "did it save?" anxiety. The phrase: "Do we show a dirty-state indicator on unsaved quiz progress?"

---

## 7. Performance & Perceived Speed

These are the terms for "does it feel fast even when it isn't."

**Core Web Vitals** — Google's three metrics that affect both UX and SEO ranking:
- **LCP (Largest Contentful Paint)** — When the biggest visible element loads. Target: <2.5s. For AESDR, this is probably the hero section or the first lesson card.
- **INP (Interaction to Next Paint)** — How fast the page responds to user input. Target: <200ms. Quiz answer selection and lesson navigation are your critical interactions.
- **CLS (Cumulative Layout Shift)** — How much the page jumps around as it loads. Target: <0.1. Font loading (FOUT) and image loading without dimensions are the top causes.

The phrase: "What are our Core Web Vitals scores on mobile, and which metric is our weakest?"

**Time to Interactive (TTI)** — When the page is not just visible but actually responds to input. A page can look loaded but be frozen while JavaScript parses. The phrase: "What's our TTI on a mid-range Android device on 4G?"

**First Contentful Paint (FCP)** — When the first piece of content appears. Target: <1.8s. The phrase: "What's our FCP and are we blocking render with synchronous scripts or CSS?"

**Render-blocking resources** — CSS and synchronous JS that prevent the browser from painting anything until they're fully loaded. The fix: inline critical CSS, defer non-critical CSS, async/defer all JS. The phrase: "Are we inlining critical CSS and deferring everything else?"

**Code splitting / lazy loading** — Loading only the JavaScript needed for the current page, fetching the rest on demand. If your entire app's JS loads on the homepage, mobile users on 3G wait forever. The engineering term: "route-based code splitting." The phrase: "Are we code-splitting by route, and what's our initial bundle size?"

**Bundle size / tree shaking** — Total JavaScript shipped to the user. Tree shaking removes unused code. Target: initial bundle <100KB gzipped for fast load on mobile. The phrase: "What's our initial bundle size gzipped, and are we tree-shaking unused library code?"

**Image optimization** — Serving modern formats (WebP, AVIF) at appropriate dimensions with responsive `srcset`. A 4000px hero image served to a 375px phone is a performance crime. The phrase: "Are images served in WebP/AVIF with responsive srcset and appropriate quality?"

**CDN / edge caching** — Serving static assets from servers geographically close to the user. Your Cloudflare Pages deployment handles this, but you need to verify cache headers are correct. The phrase: "What are our cache-control headers for static assets, and are we busting cache on deploys?"

**Prefetching / preloading** — `<link rel="preload">` tells the browser to fetch a resource before it's needed. Preload your custom fonts, hero image, and critical API calls. `<link rel="prefetch">` pre-fetches the NEXT page the user is likely to visit. The phrase: "Are we preloading critical fonts and above-the-fold images? Are we prefetching the next likely route?"

**Virtual scrolling / windowing** — For long lists (course catalog with 500+ items), only render the items currently visible in the viewport. Libraries: TanStack Virtual, react-window. The phrase: "Is the course catalog using virtualized scrolling or rendering the full DOM?"

---

## 8. Accessibility (a11y)

These are the terms for "can every human use this, and will we survive an audit."

**WCAG compliance level** — AA is the standard for commercial websites. AAA is aspirational. The phrase: "Are we targeting WCAG 2.2 AA compliance?"

**Semantic HTML** — Using `<nav>`, `<main>`, `<article>`, `<aside>`, `<button>`, `<dialog>` instead of `<div>` for everything. Screen readers use these to navigate. The phrase: "Is our markup using semantic elements or div-soup?"

**ARIA roles and attributes** — `aria-label`, `aria-describedby`, `aria-expanded`, `role="dialog"`, etc. These fill gaps where semantic HTML isn't enough. Overuse is as bad as underuse (screen readers get confused). The phrase: "Are we using ARIA only where semantic HTML is insufficient, not as a crutch for div-soup?"

**Color contrast ratios** — WCAG AA requires 4.5:1 for normal text, 3:1 for large text. Your warm orange (#E6701E) on white (#FFFFFF) has a contrast ratio of approximately 3.5:1, which actually fails AA for normal text. This is a real issue to flag. The phrase: "Have we audited all text/background combinations for WCAG AA contrast ratios?"

**Keyboard navigation** — Every interactive element must be reachable and operable via Tab, Enter, Space, Escape, and Arrow keys. Common failure: custom dropdowns, sliders, and interactive lesson elements that only respond to mouse/touch. The phrase: "Is the complete critical user flow navigable by keyboard alone?"

**Screen reader testing** — VoiceOver (macOS/iOS), NVDA (Windows, free), TalkBack (Android). Automated tools catch ~30% of a11y issues; manual screen reader testing catches the rest. The phrase: "Have we tested the signup, lesson, and quiz flows with VoiceOver and NVDA?"

**Focus visible** — `:focus-visible` shows focus rings only for keyboard users, not mouse users. This replaces the old practice of `outline: none` (which breaks keyboard navigation). The phrase: "Are we using `:focus-visible` instead of removing focus outlines?"

**Live regions** — `aria-live="polite"` and `aria-live="assertive"` announce dynamic content changes to screen readers. When a quiz answer is graded, when a toast appears, when progress saves — screen readers need to know. The phrase: "Are dynamic state changes (toasts, quiz results, save confirmations) announced via ARIA live regions?"

**Skip navigation** — A hidden link at the top of the page that lets keyboard users jump past the nav to the main content. The phrase: "Do we have a skip-nav link?"

---

## 9. Trust & Commerce Patterns

These are the terms for "does it feel safe enough to enter my credit card."

**Trust signals** — Visual elements that increase payment confidence: SSL badge, payment provider logos (Stripe badge), money-back guarantee, social proof (student count, testimonials). The engineering term: "trust surface." The phrase: "What trust signals are visible within the viewport at the payment step?"

**PCI compliance** — Payment Card Industry Data Security Standard. If you use Stripe Elements or Stripe Checkout, Stripe handles PCI compliance for you — your servers never touch card numbers. The phrase: "Are we using Stripe Elements so card data never touches our servers, maintaining PCI SAQ-A eligibility?"

**Secure context indicators** — HTTPS lock icon, no mixed-content warnings (HTTP resources loaded on an HTTPS page). The phrase: "Are we free of mixed-content warnings on all pages, especially checkout?"

**Cart/checkout abandonment tracking** — Instrumenting every step of the payment flow so you know exactly where users drop off. PostHog funnels handle this. The phrase: "Do we have funnel analytics on every step of the checkout flow?"

**Social proof / activity indicators** — "47 people enrolled today," "Last completed 3 minutes ago." Creates urgency and trust simultaneously. The phrase: "Are we showing real-time social proof on the enrollment page?"

**Perceived security theater** — Some trust patterns are functionally meaningless but psychologically powerful: the brief "Securing your payment..." loading state before redirecting to confirmation. The three-second pause makes users feel the system is doing important security work. The engineering term: "artificial latency for trust." The phrase: "Are we adding a brief securing-payment interstitial before confirmation?"

**Graceful payment failure** — When a card is declined, the user should see a clear, non-alarming message with specific guidance ("Your card was declined — try a different card or contact your bank"). Never show raw Stripe error codes. The phrase: "Are payment failures mapped to human-readable messages, and are we handling all Stripe decline codes?"

---

## 10. Error Handling & Edge Case UX

These are the terms for "what happens when things go wrong."

**Error boundaries** — In React, a component that catches JavaScript errors in its child tree and shows a fallback UI instead of a white screen. Every major page section should have one. The phrase: "Do we have error boundaries around every route and major UI section?"

**Graceful degradation** — When a feature breaks, the rest of the app still works. If the certificate service is down, lessons still play. If analytics fails, nothing user-facing breaks. The phrase: "If any single microservice goes down, does the rest of the app degrade gracefully?"

**Empty states** — What the user sees when there's no data: no courses enrolled, no progress yet, no certificates earned. A blank page is a UX failure. Empty states should have illustration + message + CTA. The phrase: "Do we have designed empty states for every list, feed, and dashboard view?"

**Loading states** — Three levels: skeleton (spatial placeholder), spinner (activity indicator), progress bar (determinate progress). Each has a use case. Skeleton for content loading, spinner for actions under 3 seconds, progress bar for actions over 3 seconds (file uploads, certificate generation). The phrase: "Do we have appropriate loading states for every async operation, with skeletons for content and deterministic progress bars for long operations?"

**Retry UX** — When an action fails, give the user a retry button, not just an error message. Automatic retry with visual feedback ("Retrying... attempt 2 of 3") is even better. The phrase: "Do failed actions offer an inline retry with attempt feedback?"

**Boundary conditions** — What happens at the extremes: user with 0 courses, user with 500 courses, lesson title with 3 characters, lesson title with 300 characters, quiz with 1 question, quiz with 100 questions. The phrase: "Have we tested all list views and form fields at both minimum and maximum content lengths?"

**404 / error page experience** — Custom error pages that match the app's design, explain what went wrong, and offer navigation back to useful pages. The phrase: "Do our 404 and 500 pages match the app design and provide navigation to recover?"

---

## 11. Design System Maturity

These are the terms for "is our visual language consistent and maintainable."

**Design tokens** — The atomic values (colors, spacing, typography, shadows, radii) stored as variables and shared between design tools (Figma) and code (CSS custom properties or a tool like Style Dictionary). The phrase: "Are our design tokens the single source of truth shared between Figma and code?"

**Component library** — A set of reusable UI components (Button, Input, Card, Modal, Toast, Badge) with documented variants, states, and usage guidelines. The phrase: "Is every UI element in the app an instance of a component from our library, or are there one-off implementations?"

**Spacing scale** — A consistent set of spacing values (4, 8, 12, 16, 24, 32, 48, 64, 96px or a similar geometric progression). Random spacing values make layouts feel subtly "off." The phrase: "Are we using a defined spacing scale, and are there any hardcoded pixel values outside the scale?"

**Typography scale** — A set of defined type styles (heading-1 through heading-6, body-large, body, body-small, caption, overline) with defined size, weight, line-height, and letter-spacing at each breakpoint. The phrase: "Is our type scale documented and are all text elements using named styles from the scale?"

**Elevation / shadow scale** — A set of defined box-shadows that create consistent depth hierarchy (elevation-1 for cards, elevation-2 for dropdowns, elevation-3 for modals). The phrase: "Do we have a documented elevation scale with consistent shadow values?"

**Border radius scale** — Consistent rounding (2px for subtle, 4px for inputs, 8px for cards, 12px for modals, 9999px for pills). Random radii make a design feel incoherent. The phrase: "Are border radii from a defined scale or ad-hoc per component?"

**Icon system** — A consistent icon set (Lucide, Phosphor, custom) with defined size, stroke weight, and usage guidelines. Mixing icon libraries or using inconsistent sizes is immediately visible. The phrase: "Are we using a single icon system with consistent sizing and stroke weight?"

**Motion spec** — A documented set of animation durations, easing curves, and patterns. "Cards use 200ms ease-out, modals use 300ms spring, page transitions use 400ms ease-in-out." The phrase: "Do we have a documented motion spec, or are animation values ad-hoc per component?"

---

## 12. Resilience, Monitoring & Recovery

The terms for "when it does break, we know immediately and fix fast."

**Real User Monitoring (RUM)** — Collecting performance metrics from actual user sessions, not just synthetic tests. Shows you that users in Brazil on 3G have a 6-second LCP even though your US-based Lighthouse score is 95. The phrase: "Are we collecting RUM data segmented by geography, device, and connection speed?"

**Synthetic monitoring** — Automated bots that check your critical paths on a schedule (every 1–5 minutes) and alert if anything breaks. Better Stack, Checkly, Datadog Synthetics. The phrase: "Do we have synthetic monitors on every critical path with <5-minute check intervals?"

**Error budget** — A target error rate (e.g., 99.9% success = 0.1% error budget). When you've consumed your error budget, you stop shipping features and fix reliability. The phrase: "What's our error budget, and do we have a policy to freeze deploys when it's exhausted?"

**Feature flags / kill switches** — The ability to disable any feature in production without deploying code. Essential for launch: if the certificate generator starts failing, flip a flag and show "Certificate available soon" instead of a 500 error. The phrase: "Can we kill any feature in <30 seconds via feature flag without a deploy?"

**Canary deployment** — Rolling out a new version to 1–5% of users first, monitoring for errors, then gradually expanding. The alternative to "deploy to everyone and pray." The phrase: "Are we using canary deploys with automatic rollback on error rate spike?"

**Runbook** — A step-by-step document for responding to known failure modes. "If Stripe webhooks stop arriving: step 1, check Stripe dashboard status; step 2, check webhook endpoint logs; step 3, re-register webhook." The phrase: "Do we have runbooks for our top 10 likely failure modes?"

---

## How to Use This in Practice

When reviewing a PR or a design implementation, you now have the vocabulary to ask targeted questions instead of "does it look good":

- "What's our CLS score on mobile? Are fonts preloaded to avoid FOUT?"
- "Is this animation GPU-accelerated or are we triggering reflows?"
- "Does this modal trap focus, support Escape dismiss, and lock background scroll on iOS?"
- "Are we optimistic on this save, and what's the retry strategy if it fails?"
- "What's our empty state for this list view?"
- "Is this hitting our touch target minimums on mobile?"
- "Does this respect prefers-reduced-motion?"

Each of these questions will signal to a senior engineer that you understand the quality bar and won't accept "it works on my machine."
