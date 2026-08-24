# GuzoMarket — UI/UX Design System v1.0

**Project:** GuzoMarket  
**Document:** UI/UX Design System  
**Version:** 1.0  
**Status:** Implementation baseline  
**Source documents:** GuzoMarket Master PRD v1.1; GuzoMarket Information Architecture & Complete Sitemap v1.0; GuzoMarket Database Schema & Entity Relationship Specification v1.0  
**Visual reference:** Approved GuzoMarket homepage direction  
**Primary implementation stack:** Next.js + React + TypeScript + Tailwind CSS + shadcn/ui

---

## 1. Purpose

This design system defines the visual language, interaction rules, reusable components,
responsive behavior, page templates, and accessibility requirements for GuzoMarket.

It exists to ensure that every page feels like one product rather than a collection of
independently styled screens.

The system is designed for:

- Marketplace browsing
- Search and filtering
- Listing creation
- Messaging
- Business discovery
- Jobs
- Events
- Community surfaces
- Account management
- Moderation and admin tooling

---

## 2. Product Experience Principles

GuzoMarket should feel:

- Modern
- Friendly
- Trustworthy
- Local
- Fast
- Clear
- Accessible
- Community-oriented
- Premium without feeling corporate
- Familiar without copying another marketplace

The interface should prioritize usefulness over decoration.

### Core UX principles

1. **Search first**
   - Search and location are primary discovery tools.

2. **Clarity over density**
   - Avoid text-heavy classifieds layouts.

3. **Trust through transparency**
   - Show verification, reporting, moderation, and privacy affordances clearly.

4. **Mobile-first behavior**
   - Do not merely shrink desktop layouts.

5. **Reusable patterns**
   - Similar actions should look and behave the same across domains.

6. **Location awareness**
   - Location is visible where it matters, without exposing precise private addresses.

7. **State clarity**
   - Loading, empty, success, error, moderation, and disabled states are first-class.

---

## 3. Brand Foundation

### Brand name

**GuzoMarket**

### Tagline

**Buy. Sell. Connect.**

### Brand character

- Warm
- Dependable
- Useful
- Community-rooted
- Contemporary
- Inclusive

### Visual direction

Use:

- White and light neutral surfaces
- Deep green primary accents
- Gold as a selective accent
- Dark navy for strong text and contrast
- Rounded cards
- High-quality photography
- Restrained shadows
- Clear typography
- Spacious section rhythm
- Simple icons

Avoid:

- Excessive gradients
- Heavy borders everywhere
- Overly playful UI
- Decorative ethnic motifs
- Visual stereotypes
- Tiny text
- Overly condensed layouts
- Heavy animation
- Neon colors
- Glassmorphism as a primary style

---

## 4. Color System

### 4.1 Core palette

| Token | Hex | Use |
|---|---|---|
| `brand-primary` | `#087F5B` | Primary actions, active states, brand emphasis |
| `brand-primary-hover` | `#066B4C` | Hover/pressed primary actions |
| `brand-primary-soft` | `#E8F5F0` | Soft green surfaces, selected chips |
| `brand-accent` | `#F4B740` | Limited accent, featured highlights |
| `navy` | `#102A43` | Strong headings, dark surfaces |
| `text-primary` | `#172B4D` | Main body and headings |
| `text-secondary` | `#64748B` | Supporting text |
| `background` | `#F8FAFC` | App/page background |
| `surface` | `#FFFFFF` | Cards, dialogs, panels |
| `border` | `#E5E7EB` | Default border |
| `success` | `#16A34A` | Success states |
| `warning` | `#F59E0B` | Warning states |
| `error` | `#DC2626` | Error/destructive |
| `info` | `#2563EB` | Informational state |

### 4.2 Semantic usage rules

- Primary green is reserved for primary actions, links, selection, and important brand
  moments.
- Gold is secondary and should not compete with primary CTAs.
- Error red must not be used decoratively.
- Do not use color alone to communicate state.
- Text must meet WCAG 2.2 AA contrast requirements.

---

## 5. Typography

### 5.1 Fonts

**UI font:** Inter  
**Brand/display font:** Manrope

Use Manrope selectively for:
- Hero headline
- Marketing section headings
- Logo/brand moments

Use Inter for:
- Forms
- Buttons
- Listing cards
- Tables
- Messaging
- Admin
- Body text

### 5.2 Type scale

| Token | Desktop | Mobile target | Weight |
|---|---:|---:|---:|
| Display | 48px | 36px | 700 |
| H1 | 40px | 32px | 700 |
| H2 | 30px | 26px | 700 |
| H3 | 24px | 22px | 600 |
| H4 | 20px | 18px | 600 |
| Body Large | 18px | 18px | 400/500 |
| Body | 16px | 16px | 400 |
| Small | 14px | 14px | 400/500 |
| Caption | 12px | 12px | 400/500 |

### 5.3 Typography rules

- Default body line height: approximately 1.5–1.6.
- Headings should use tighter line-height than body copy.
- Avoid all-caps paragraphs.
- Use all caps only for compact badges when necessary.
- Do not use font weights below 400.
- Default button weight: 600.

---

## 6. Spacing System

Approved spacing scale:

```text
4
8
12
16
24
32
48
64
80
96px
```

### Usage guidance

- 4–8px: icon/text gaps, compact controls
- 12–16px: component padding, field spacing
- 24–32px: card spacing, form sections
- 48–64px: page sections
- 80–96px: major desktop marketing spacing

Avoid arbitrary values unless required by layout constraints.

---

## 7. Layout & Containers

### 7.1 Content widths

```text
Standard desktop content width: 1280px
Maximum wide content width: 1440px
Desktop gutter: 32px
Tablet gutter: 24px
Mobile gutter: 16px
```

### 7.2 Breakpoints

Recommended Tailwind-aligned breakpoints:

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### 7.3 Grid behavior

Desktop:
- 12-column conceptual grid
- Marketplace discovery typically 4–5 cards depending on viewport

Tablet:
- 2–3 cards

Mobile:
- 1-column primary content
- Horizontal rails only when intentionally designed

---

## 8. Border Radius

```text
sm = 8px
md = 12px
lg = 16px
xl = 24px
full = 9999px
```

Recommended usage:

- Buttons: `md`
- Inputs: `md`
- Cards: `lg`
- Hero panels: `xl`
- Pills/chips: `full`

---

## 9. Shadows

Use subtle elevation.

### Levels

```text
shadow-sm   — inputs, low emphasis
shadow-md   — cards on white background
shadow-lg   — dialogs, popovers, floating panels
```

Rules:

- Avoid stacking strong shadows.
- Cards on neutral backgrounds may use border + minimal shadow.
- Do not use shadows as the only separation mechanism.

---

## 10. Iconography

Use a consistent icon library such as Lucide.

Rules:

- Default icon stroke should be visually consistent.
- Avoid mixing filled and outline icon systems randomly.
- Icons should not replace labels for unfamiliar actions.
- Icon-only controls require accessible names/tooltips.
- Common sizes:
  - 16px compact
  - 20px standard
  - 24px navigation/action
  - 32px feature icons

---

## 11. Photography & Media

Marketplace imagery is important to perceived quality.

### Image rules

- Listing cards target 4:3 media ratio.
- Business hero/cover can use wider ratios.
- Avatars remain square/circular.
- Use `object-fit: cover`.
- Lazy-load below-the-fold images.
- Generate responsive image sizes.
- Show graceful placeholders.
- Preserve user privacy by stripping sensitive metadata where appropriate.

### Empty media state

Use:
- Neutral placeholder icon
- Soft background
- No broken-image browser UI

---

## 12. Buttons

### 12.1 Primary Button

Use for highest-priority action.

Examples:
- Post Listing
- Search
- Publish
- Message Seller

Style:
- Brand green background
- White label
- Medium radius
- Strong hover/focus/disabled states

### 12.2 Secondary Button

Use for supporting actions.

Examples:
- Save
- Preview
- Cancel non-destructive flow
- View all

Style:
- White/neutral surface
- Border
- Primary or dark label

### 12.3 Ghost Button

Use in low-emphasis areas:
- Header text actions
- Inline utility actions

### 12.4 Destructive Button

Use only for:
- Delete
- Remove
- Confirm destructive admin actions

### Button sizes

```text
sm: 36px high
md: 44px high
lg: 48–52px high
```

Primary mobile actions should generally be at least 44px tall.

---

## 13. Inputs

Core input types:

- Text
- Search
- Email
- Password
- Number
- Currency
- URL
- Phone
- Date
- Time
- Textarea
- Select
- Combobox
- Checkbox
- Radio
- Switch

### Input anatomy

```text
Label
Optional helper text
Control
Validation/error message
```

Rules:

- Labels remain visible; do not use placeholders as labels.
- Error message appears below field.
- Required state must be clearly indicated.
- Disabled fields remain legible.
- Search fields may include leading search icon.

---

## 14. Search Component

The homepage/search-page search is a key branded component.

Desktop structure:

```text
[ Keyword / what are you looking for? ]
[ Location ]
[ Search ]
```

Mobile:

```text
[ Search GuzoMarket ]
[ Washington, DC ]
[ Search ]
```

or a compact stacked variant.

Rules:

- Search and location are distinct.
- Preserve submitted values.
- Support keyboard submission.
- Mobile search should not rely on tiny embedded controls.

---

## 15. Location Selector

Location selector should support:

- Current selected market
- City search
- Recent locations
- Optional use-current-location action
- Marketplace-region shortcuts

Privacy:
- Precise browser geolocation only after user permission.
- Public location labels use city/neighborhood-level precision where appropriate.

---

## 16. Cards

### 16.1 ListingCard

Required content:

```text
Image
Favorite control
Optional Featured badge
Price
Optional price suffix
Title
City, State
Relative posted time
Optional trust/verification indicator
```

Interaction:
- Card opens listing detail.
- Favorite control must not trigger card navigation.
- Keyboard focus order must be logical.

### 16.2 BusinessCard

Required:

```text
Cover/logo
Business name
Rating
Review count
City, State
Category
Optional verification
```

### 16.3 EventCard

Recommended:

```text
Image
Date badge
Event title
Venue/location
Time
Organizer
Optional RSVP/status
```

### 16.4 JobCard

Recommended:

```text
Job title
Employer
Location
Work mode
Employment type
Salary range where available
Posted date
Save action
```

### 16.5 CommunityCard

Recommended:

```text
Post type
Title or opening excerpt
Author
Location/community
Timestamp
Engagement summary where supported
```

---

## 17. Badges

Use compact labels for:

- Featured
- Verified
- Pending
- Sold
- Rented
- Filled
- Expired
- New
- Remote
- Urgent

Rules:
- Badge meaning must be consistent.
- Do not use green for every badge.
- Paid promotional badges must be clearly distinguishable from verification badges.

---

## 18. Navigation

### 18.1 Desktop Header

Approved order:

```text
GuzoMarket
Buy & Sell
Housing
Cars
Jobs
Services
Events
Businesses
Community

Messages
Saved
Account
[ + Post Listing ]
```

Rules:
- Sticky header may be used on long pages.
- Active navigation state is visible.
- Post Listing remains visually strongest.

### 18.2 Mobile Header

Prioritize:

```text
Logo
Search or search trigger
Inbox/account
```

Do not shrink full desktop navigation into a tiny row.

### 18.3 Mobile Bottom Navigation

```text
Home
Search
Post
Saved
Account
```

`Post` should be visually prominent.

---

## 19. Breadcrumbs

Use breadcrumbs on deeper hierarchy pages such as:

```text
Home > Cars > Sedans > Listing
Home > Businesses > Restaurants > Business
```

Avoid breadcrumbs where they add visual clutter without navigation value.

---

## 20. Filters

### Desktop

- Sidebar filters
- Selected filters visible as chips
- Clear all
- Apply automatically or via explicit apply depending on complexity

### Mobile

Use:
- Filter button
- Bottom sheet or full-screen filter panel
- Clear all
- Apply/show results CTA

Rules:
- Preserve filter state.
- Show active filter count.
- Avoid deeply nested accordion overload.

---

## 21. Sort Control

Supported options include:

- Recommended / Relevant
- Newest
- Price low to high
- Price high to low
- Distance

Use a compact Select or menu.

On mobile, sort may share a control row with Filters.

---

## 22. Tabs

Use for sibling states rather than unrelated navigation.

Examples:

My Listings:
```text
Active
Pending
Drafts
Completed
Expired
Archived
```

Saved:
```text
Listings
Searches
```

Admin:
```text
Open
Under Review
Resolved
```

Tabs must remain horizontally scrollable on small screens if needed.

---

## 23. Dialogs, Sheets & Popovers

### Dialog

Use for:
- Confirmations
- Short forms
- Destructive actions

### Sheet

Use for:
- Mobile filters
- Mobile navigation
- Secondary detail panels

### Popover

Use for:
- Account menu
- Compact sort
- Location quick picker
- Small contextual controls

Never place long complex forms in small popovers.

---

## 24. Toasts & Feedback

Use toasts for brief confirmation:

- Saved
- Copied link
- Listing updated
- Message sent

Do not use toast as the only communication for critical errors.

Critical errors should appear inline or in-page.

---

## 25. Forms

### Form structure

Use clear sections with descriptive headings.

Example listing form:

```text
Basic Details
Price
Category Details
Photos
Location
Contact
```

Rules:
- Prefer one-column forms on mobile.
- Use two-column layouts only when fields are truly related and desktop space supports it.
- Keep primary action visible.
- Preserve user input when validation fails.
- Provide autosave/draft support where practical.

---

## 26. Post Listing UX

Approved sequence:

```text
Category
Details
Photos
Location
Preview
Publish
```

### Progress UI

Use:
- Step indicator
- Current step title
- Back
- Continue
- Save Draft where practical

### Preview

Preview should resemble actual listing detail rather than an abstract form summary.

### Publish

Show:
- Submission success
- Current moderation/status
- View listing if active
- Manage listing
- Post another listing

---

## 27. File Upload

Listing image upload should support:

- Drag/drop desktop
- Camera/gallery mobile
- Multiple upload
- Progress
- Reorder
- Delete
- Validation
- Retry
- Primary image indication

Error states:
- Unsupported type
- Too large
- Upload failed
- Moderation rejected if applicable

---

## 28. Messaging UI

### Desktop layout

```text
Conversation list | Active conversation
```

### Mobile

Separate screens:

```text
Inbox
→ Conversation
```

Conversation anatomy:

```text
Context card
Participant header
Message history
Composer
Attachment action
Block/report menu
```

Messages should clearly distinguish sender and recipient without excessive bubble styling.

---

## 29. Notification UI

Notification center should:

- Group by recency
- Show unread state
- Include relevant icon
- Link directly to context
- Allow mark read
- Support empty state

Notification preferences belong in account settings.

---

## 30. Profile UI

Public profile:

- Avatar
- Display name
- Location
- Joined date
- Verification
- Seller metrics
- Active listings

Private account profile:

- Editable information
- Avatar upload
- Bio
- Location
- Privacy controls

Do not expose sensitive contact information by default.

---

## 31. Business Detail Template

Suggested hierarchy:

1. Cover image
2. Logo/name/verification
3. Rating
4. Category/location
5. Primary actions
6. About
7. Hours
8. Services
9. Listings/products
10. Reviews
11. Photos
12. Map/directions where appropriate

Primary actions:

```text
Message
Call
Visit Website
Get Directions
```

---

## 32. Job Detail Template

Hierarchy:

1. Job title
2. Employer
3. Location/work mode
4. Employment type
5. Salary
6. Apply/contact CTA
7. Description
8. Skills
9. Employer/business info
10. Report action

---

## 33. Event Detail Template

Hierarchy:

1. Hero/image
2. Event title
3. Date/time
4. Location/venue
5. Organizer
6. RSVP/contact CTA
7. Description
8. Photos
9. Related events

---

## 34. Community UI

Community surfaces should feel distinct from product listings while remaining within the
same design language.

Use:
- Softer content cards
- Clear author/context
- Report affordances
- Location/community context
- Moderation-sensitive interactions

Avoid:
- Designing it like a generic social network feed
- Optimizing for addictive engagement patterns

---

## 35. Admin Design

Admin may use denser information layouts than consumer UI.

### Admin patterns

- Sidebar navigation
- Data tables
- Filter bars
- Status badges
- Bulk actions only where safe
- Detail drawers/pages
- Confirmation dialogs
- Audit history

Maintain:
- Accessible type sizes
- Clear destructive-action distinction
- Visible moderation history
- No hidden permission-dependent actions

---

## 36. Tables

Use tables primarily in admin and management views.

Rules:

- Sticky header when helpful
- Row actions in predictable location
- Responsive collapse/card mode on small screens
- Sortable headers visibly indicated
- Empty/loading states built in
- Avoid horizontal scrolling when a better responsive pattern exists

---

## 37. Empty States

Every key page needs a designed empty state.

Examples:

### Favorites
**No saved listings yet**  
Save listings you like and they’ll appear here.

CTA: **Browse Listings**

### Messages
**No conversations yet**  
Start by messaging a seller from a listing.

CTA: **Explore Listings**

### My Listings
**You haven’t posted anything yet**  
Create your first listing in a few minutes.

CTA: **Post Listing**

---

## 38. Loading States

Preferred patterns:

- Skeleton cards
- Skeleton text blocks
- Inline spinners only for small actions
- Button-level pending state for mutations

Avoid:
- Full-screen blocking spinners for ordinary navigation
- Layout jumps where skeletons can preserve dimensions

---

## 39. Error States

Error messages should state:

1. What happened
2. What the user can do next

Example:

**We couldn’t load nearby listings.**  
Check your connection and try again.

CTA: **Try Again**

For destructive or irreversible failures, provide stronger explanation.

---

## 40. Success States

Use success feedback after:

- Listing published
- Profile updated
- Message sent
- Email verified
- Report submitted

Success feedback should not unnecessarily interrupt the workflow.

---

## 41. Moderation States

UI must represent content state clearly.

Examples:

```text
Pending review
Rejected
Removed
Suspended
Expired
Sold
Rented
Filled
```

Owner-facing views may show more detail than public views.

Do not expose internal risk scores or sensitive moderation signals.

---

## 42. Trust & Safety UI

Trust is a product differentiator, but claims must remain precise.

Use concrete messages such as:

- Email verified
- Business verified
- Report listing
- Block user
- Keep communication in GuzoMarket
- Never send money without verifying the transaction

Avoid absolute language such as:

- Guaranteed safe
- 100% secure
- Trusted seller unless verification actually supports that label

---

## 43. Verification UI

Verification types:

- Email Verified
- Phone Verified
- Identity Verified
- Business Verified

Each badge should:
- Have distinct label
- Have accessible tooltip/details
- Never imply transaction guarantee

---

## 44. Featured & Promotion UI

Featured content must be visually marked.

Recommended badge:

```text
Featured
```

Rules:
- If paid, disclosure must be clear.
- Featured styling should not mimic verification.
- Ranking treatment should be documented elsewhere.

---

## 45. Homepage Design Specification

Approved homepage visual direction:

### Header
- White
- Minimal
- Strong Post Listing CTA

### Hero
- Large brand headline
- Search + location
- Community/local imagery
- Optional guest welcome card

### Popular Searches
- Compact pill/chip pattern

### Categories
- Icon shortcuts
- Clear labels
- Responsive rail/grid

### Popular Near You
- Listing cards
- View all link
- Local context

### Trust strip
Recommended themes:
- Verified profiles
- Privacy & Safety
- Local discovery
- Easy messaging

### Featured Businesses
- Business cards
- Location/category/rating

### Community Near You
- Events, announcements, local recommendations

### Promotion
Before native apps exist:
- Account/signup value promotion
- Saved favorites/messages benefits

After native apps ship:
- App Store / Google Play promotion may replace or supplement

### Footer
- Explore
- Help
- Company
- Legal
- Social links
- Dynamic copyright year

---

## 46. Search Results Template

Desktop:

```text
Header
Search
Breadcrumb/category context
Filters sidebar
Results count + sort
Result grid/list
Pagination / progressive load
Footer
```

Mobile:

```text
Header
Search
Filter + sort row
Results
Bottom nav
```

Result cards should not become visually denser than necessary.

---

## 47. Listing Detail Template

Desktop recommendation:

```text
Breadcrumbs
Gallery                   | Listing summary/actions
Description               | Seller card
Attributes                | Safety note
Location
Similar listings
```

Mobile:

```text
Gallery
Title/price
Key attributes
Sticky Message Seller CTA
Description
Seller
Location
Similar listings
```

---

## 48. Account Layout

Desktop:
- Account sidebar
- Main content panel

Mobile:
- Account menu screen
- Individual settings screens

Account sections:
- Profile
- My Listings
- Saved
- Messages
- Notifications
- Security
- Privacy
- Settings

---

## 49. Responsive Behavior Rules

### Desktop
- Full navigation
- Sidebar filters
- Multi-column grids
- Split messaging
- Wider forms where useful

### Tablet
- Simplified navigation
- 2–3 column grids
- Collapsible filters

### Mobile
- Bottom navigation
- One-column content
- Sticky primary CTA where useful
- Full-screen/sheet filters
- Horizontal rails only where intentional
- No tiny side-by-side form fields unless necessary

---

## 50. Accessibility

Target WCAG 2.2 AA.

Requirements:

- Semantic HTML
- Visible keyboard focus
- Logical tab order
- Skip-to-content
- Accessible labels
- Proper heading hierarchy
- Screen-reader-friendly validation
- Contrast compliance
- 44px touch target where practical
- Dialog focus trapping
- Escape closes appropriate overlays
- `aria-live` for important async feedback
- Alt text for meaningful images
- Decorative images marked appropriately

Never communicate important information using color alone.

---

## 51. Motion

Use restrained motion.

Allowed:
- Small hover transitions
- Dialog/sheet entrance
- Toast appearance
- Skeleton loading
- Favorite/save feedback

Avoid:
- Long page transitions
- Autoplay animations
- Large parallax
- Repetitive bouncing attention cues

Respect `prefers-reduced-motion`.

---

## 52. Dark Mode

Not required for MVP unless explicitly promoted into scope.

The token architecture should make future dark mode feasible.

Do not delay MVP implementation for dark mode.

---

## 53. Localization Readiness

MVP launches in English.

Future languages include:
- Amharic
- Afaan Oromo
- Tigrinya
- Somali
- Swahili
- French

Design must avoid:
- Hard-coded widths that break with longer translations
- Text embedded in images
- Layouts that assume English-only length

Future RTL requirements should be evaluated if supported languages expand.

---

## 54. Currency Readiness

Initial market default:

```text
USD
```

Do not show global currency selectors until multi-market functionality requires them.

Price components should support:
- Currency code
- Locale formatting
- Price suffix such as `/mo`

---

## 55. Design Tokens for Tailwind

Recommended semantic naming layer:

```text
bg-background
bg-surface
bg-surface-muted

text-primary
text-secondary
text-inverse

border-default
border-strong

bg-brand
hover:bg-brand-hover

text-success
text-warning
text-error
text-info
```

Component classes should reference semantic tokens rather than raw hex values.

---

## 56. Core Reusable Component Inventory

Foundation:

```text
Button
IconButton
Input
Textarea
Select
Combobox
Checkbox
Radio
Switch
Badge
Avatar
Tooltip
Popover
Dialog
Sheet
DropdownMenu
Tabs
Breadcrumb
Pagination
Skeleton
Toast
Alert
EmptyState
ErrorState
```

Marketplace:

```text
GlobalHeader
MobileBottomNav
SearchBar
LocationSelector
CategoryShortcut
ListingCard
BusinessCard
JobCard
EventCard
CommunityCard
SellerCard
PriceDisplay
VerificationBadge
FavoriteButton
ShareButton
ReportMenu
PhotoGallery
FilterPanel
SortControl
SelectedFilterChip
```

Account/admin:

```text
AccountSidebar
StatusBadge
DataTable
AdminSidebar
ModerationHistory
ConfirmActionDialog
AuditTimeline
```

---

## 57. Component State Requirements

Every interactive component should define:

```text
Default
Hover
Focus
Active
Disabled
Loading
Error
Selected where applicable
```

Do not ship components that only look correct in the default state.

---

## 58. Naming Conventions

Use names based on purpose, not appearance.

Good:

```text
ListingCard
PrimaryButton
VerificationBadge
FilterPanel
```

Avoid:

```text
GreenButton
BigCard
LeftBox
```

This keeps the design system maintainable.

---

## 59. Page-Level State Checklist

Every page should consider:

- Loading
- Empty
- Error
- Unauthorized
- Not found
- Partial data
- Offline/retry where appropriate
- Mobile
- Keyboard navigation
- Screen reader behavior

---

## 60. Design QA Checklist

A page is design-complete when:

- Typography matches tokens
- Spacing uses system values
- Color roles are semantic
- Components are reused
- Mobile behavior is intentionally designed
- Empty/loading/error states exist
- Focus states are visible
- Touch targets are appropriate
- Images preserve aspect ratio
- Text truncation is intentional
- Long translations will not immediately break layout
- Primary CTA is obvious
- Destructive actions are distinct
- Trust/status labels are accurate
- No private location/contact data is accidentally exposed

---

## 61. MVP Design Priorities

The design implementation should prioritize:

1. Homepage
2. Search results
3. Listing detail
4. Post listing flow
5. Authentication
6. Profile
7. My Listings
8. Favorites
9. Messaging
10. Notifications
11. Admin moderation
12. Jobs

Basic launch surfaces may also include:
- Businesses
- Events
- Community

Richer versions can follow after the marketplace core is stable.

---

## 62. Design Decisions Locked by This Document

Unless superseded later:

1. Inter is the primary UI font.
2. Manrope is the selected display/brand font.
3. Green remains the primary interaction color.
4. Listing images target 4:3.
5. Cards use rounded corners and restrained shadows.
6. Desktop uses full navigation; mobile uses bottom navigation.
7. Search + location remain primary discovery controls.
8. Mobile is intentionally designed rather than desktop-scaled.
9. ListingCard, BusinessCard, JobCard, EventCard, and CommunityCard remain separate patterns.
10. Native app promotion is hidden until native apps exist.
11. Verification and promotion labels remain visually distinct.
12. Accessibility states are part of component completion.

---

## 63. Next Deliverable

After approval of this design system, create:

**GuzoMarket API & Backend Specification v1.0**

That document should define:

- Authentication endpoints/flows
- Authorization rules
- Listing CRUD
- Image uploads
- Search/query APIs
- Favorites
- Messaging
- Notifications
- Reports
- Moderation
- Jobs
- Businesses
- Events
- Community
- Rate limits
- Validation
- Error contracts
- Pagination
- Security boundaries
- Server Actions vs API routes
- Background jobs
- Email delivery
- Audit requirements

---

**End of GuzoMarket UI/UX Design System v1.0**
