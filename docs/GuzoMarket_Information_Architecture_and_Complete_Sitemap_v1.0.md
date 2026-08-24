# GuzoMarket — Information Architecture & Complete Sitemap v1.0

**Project:** GuzoMarket  
**Document:** Information Architecture & Complete Sitemap  
**Version:** 1.0  
**Status:** Implementation baseline  
**Source of truth:** GuzoMarket Master PRD v1.1  
**Initial market:** Washington, DC / Maryland / Northern Virginia (DMV)

---

## 1. Purpose

This document defines the page hierarchy, route architecture, global navigation,
public/private boundaries, account areas, marketplace discovery structure,
content-type separation, mobile navigation, SEO/indexability rules, and
MVP-versus-post-MVP route scope for GuzoMarket.

The goal is to make the application structure explicit before database,
backend, and detailed UI implementation begin.

---

## 2. Information Architecture Principles

GuzoMarket should be organized around five primary user intents:

1. **Discover** — browse nearby listings, businesses, jobs, services, events, and community content.
2. **Search** — find something using keywords, categories, filters, and location.
3. **Post** — create marketplace content quickly and safely.
4. **Connect** — message sellers, businesses, employers, organizers, and community members.
5. **Manage** — control listings, saved items, messages, notifications, profile, and account settings.

The architecture must remain:

- Mobile-first
- Location-aware
- Search-friendly
- SEO-friendly for public content
- Permission-aware
- Modular by domain
- Extensible to additional U.S. and African markets
- Explicit about public versus authenticated experiences

---

## 3. Core Domain Destinations

The approved top-level discovery destinations are:

```text
Buy & Sell
Housing
Cars
Jobs
Services
Events
Businesses
Community
```

These destinations are navigation surfaces, not necessarily identical database models.

Primary domain concepts:

```text
Listing
Business
Job
Event
CommunityPost
User / Profile
```

`Gigs` remains supported within relevant job/service taxonomy but is not a permanent
top-level homepage navigation item.

---

## 4. Global Sitemap

```text
/
├── search
│   ├── results
│   └── map                         [Post-MVP / Phase 1.5]
│
├── buy-sell
│   ├── electronics
│   ├── furniture
│   ├── appliances
│   ├── clothing
│   ├── baby-kids
│   ├── home-garden
│   ├── sports-recreation
│   ├── collectibles
│   ├── books
│   ├── musical-instruments
│   ├── jewelry
│   ├── food-specialty
│   └── other
│
├── housing
│   ├── apartments
│   ├── houses
│   ├── rooms
│   ├── shared-housing
│   ├── sublets
│   ├── short-term
│   ├── housing-wanted
│   ├── parking
│   └── real-estate-services
│
├── cars
│   ├── cars
│   ├── suvs
│   ├── trucks
│   ├── vans
│   ├── motorcycles
│   ├── commercial-vehicles
│   ├── auto-parts
│   └── automotive-services
│
├── jobs
│   ├── full-time
│   ├── part-time
│   ├── remote
│   ├── temporary
│   ├── internship
│   ├── healthcare
│   ├── technology
│   ├── transportation
│   ├── construction
│   ├── hospitality
│   ├── retail
│   ├── professional
│   └── other
│
├── services
│   ├── home-services
│   ├── automotive
│   ├── cleaning
│   ├── beauty
│   ├── education
│   ├── legal
│   ├── accounting
│   ├── technology
│   ├── transportation
│   ├── childcare
│   ├── photography
│   └── professional-services
│
├── events
│   ├── [city/location landing pages]
│   └── {event-slug}-{stable-id}
│
├── businesses
│   ├── categories
│   ├── [city/location landing pages]
│   └── {business-slug}-{stable-id}
│
├── community
│   ├── posts
│   ├── announcements
│   ├── recommendations
│   ├── questions
│   ├── help-requests
│   └── groups                     [Phase 2+]
│
├── listings
│   └── {listing-slug}-{stable-id}
│
├── users
│   └── {username-or-public-id}
│
├── post
│   ├── category
│   ├── details
│   ├── photos
│   ├── location
│   ├── preview
│   └── success
│
├── messages
│   ├── inbox
│   └── {conversation-id}
│
├── saved
│   ├── listings
│   └── searches                   [Phase 1.5]
│
├── notifications
│
├── account
│   ├── profile
│   ├── listings
│   ├── listings/{listing-id}/edit
│   ├── businesses                 [Phase 1.5]
│   ├── security
│   ├── privacy
│   ├── notifications
│   └── settings
│
├── auth
│   ├── sign-up
│   ├── log-in
│   ├── verify-email
│   ├── forgot-password
│   └── reset-password
│
├── help
│   ├── how-it-works
│   ├── safety
│   ├── support
│   ├── faq
│   └── contact
│
├── legal
│   ├── terms
│   ├── privacy
│   └── prohibited-content
│
└── admin
    ├── dashboard
    ├── users
    ├── users/{user-id}
    ├── listings
    ├── listings/{listing-id}
    ├── reports
    ├── reports/{report-id}
    ├── categories
    ├── locations
    ├── businesses                 [Phase 1.5]
    ├── events                     [Phase 1.5]
    └── audit-log
```

---

## 5. Route Conventions

### 5.1 Public marketplace routes

Preferred location/category patterns:

```text
/washington-dc/cars
/washington-dc/housing
/washington-dc/jobs
/maryland/housing
/virginia/cars
```

Where possible, category and location landing pages should be human-readable,
indexable, and stable.

### 5.2 Entity detail routes

```text
/listings/{slug}-{stable-id}
/businesses/{slug}-{stable-id}
/events/{slug}-{stable-id}
```

The stable ID is authoritative. The slug is for readability and SEO.

### 5.3 Search routes

```text
/search?q=toyota&location=washington-dc
/search?q=apartment&location=silver-spring-md&minPrice=1200&maxPrice=2000
```

Filter state should be represented in URL/query parameters when practical.

### 5.4 Private account routes

```text
/account/profile
/account/listings
/account/listings/{id}/edit
/account/security
/account/privacy
/account/notifications
```

### 5.5 Administrative routes

All administrative routes live under:

```text
/admin/*
```

and require role-based authorization.

---

## 6. Global Desktop Navigation

Approved desktop navigation:

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
Account/Profile
[ + Post Listing ]
```

### Rules

- `Post Listing` is the strongest persistent CTA.
- Guests may browse all public destinations.
- `Messages`, `Saved`, and posting actions require authentication.
- Clicking a protected action while logged out should preserve the intended
  destination and return the user after authentication.
- The active destination should be visibly indicated.
- Location selection is handled through search/context rather than occupying a
  permanent full-width navigation item.

---

## 7. Mobile Navigation

Primary bottom navigation:

```text
Home
Search
Post
Saved
Account
```

### Mobile rules

- `Post` should be visually prominent.
- Messages are accessible through Account or a top-right inbox icon.
- Category navigation may use a horizontal scroll rail.
- Search remains a first-class surface.
- Mobile must not reproduce the desktop header at reduced scale.
- All touch targets should meet accessibility requirements.

---

## 8. Homepage Architecture

Route:

```text
/
```

Approved section order:

1. Global navigation
2. Hero / keyword search / location
3. Popular searches
4. Contextual welcome surface
5. Primary category shortcuts
6. Popular Near You
7. Trust & Privacy benefits
8. Featured Businesses
9. Community Near You
10. Account/value promotion
11. Footer

### Guest welcome state

May show:

- Welcome message
- Sign Up
- Log In

### Authenticated welcome state

May show:

- Unread messages
- Saved listing updates
- My Listings shortcut
- Post Listing shortcut

Never show guest authentication CTAs to authenticated users.

### Homepage personalization priority

```text
1. Explicit user-selected location
2. Profile location
3. Previous session preference
4. Approximate regional inference
5. Default: Washington, DC
```

---

## 9. Search & Results Architecture

Route:

```text
/search
```

### Search page structure

Desktop:

```text
Header
Search bar + location
Filter sidebar
Sort control
Results count
Listing grid/list
Optional map toggle
Pagination / progressive loading
Footer
```

Mobile:

```text
Header
Search bar
Filter button
Sort button
Results
Sticky or sheet-based filters
Bottom navigation
```

### Core MVP filters

- Keyword
- Category
- Location
- Price
- Sort

### Conditional category filters

Housing:
- Property type
- Bedrooms
- Bathrooms
- Availability

Cars:
- Vehicle type
- Make
- Model
- Year
- Mileage
- Condition

Jobs:
- Employment type
- Remote/hybrid/on-site
- Salary range
- Date posted

Services:
- Service category
- Location
- Seller/business type

### Sort options

- Recommended / Relevant
- Newest
- Price low to high
- Price high to low
- Distance where supported

---

## 10. Category Landing Pages

Each major category receives a public landing page.

Examples:

```text
/buy-sell
/housing
/cars
/jobs
/services
```

Each landing page may include:

- Category title
- Location context
- Search
- Subcategory shortcuts
- Featured/recent content
- Filters
- SEO-supporting descriptive copy
- Pagination
- Related categories

Subcategory pages inherit the same structure.

---

## 11. Listing Detail Architecture

Route:

```text
/listings/{slug}-{stable-id}
```

### Primary content

- Image gallery
- Title
- Price
- Structured attributes
- Description
- Location
- Posted date/time
- Seller profile summary
- Verification indicators where applicable
- Listing status

### Primary actions

```text
Message Seller
Save
Share
Report
```

### Secondary content

- Seller's other active listings
- Similar listings
- Safety guidance

### Listing states

Public active listing:
- fully accessible

Sold/Rented/Filled:
- detail may remain accessible
- interaction CTA should change/disable appropriately
- similar active content should be emphasized

Expired/Archived:
- generally excluded from discovery
- direct-link behavior may show limited archival state

Removed/Suspended:
- not publicly viewable

---

## 12. Public User/Seller Profile

Route:

```text
/users/{username-or-public-id}
```

### Public content

- Profile photo
- Display name
- General location
- Joined date
- Verification indicators
- Seller rating when supported
- Response metrics when supported
- Active listings

### Private content

Never expose by default:

- Email
- Phone number
- Precise residential address
- Security/account data

---

## 13. Post Listing Flow

Entry route:

```text
/post
```

Authentication required.

Recommended flow:

```text
/post/category
      ↓
/post/details
      ↓
/post/photos
      ↓
/post/location
      ↓
/post/preview
      ↓
Publish
      ↓
/post/success
```

### Flow rules

- Draft state should persist when practical.
- Category determines structured fields.
- Validation should occur both client-side and server-side.
- User may move backward without losing completed data.
- Final publish triggers moderation/risk checks.
- Success state should show listing status and next actions.

---

## 14. My Listings

Route:

```text
/account/listings
```

Tabs or filters:

```text
Active
Pending
Drafts
Sold / Rented / Filled
Expired
Archived
```

Actions may include:

- Edit
- Mark Sold/Rented/Filled
- Renew
- Archive
- Delete
- View
- Promote [Post-MVP]

---

## 15. Messaging Architecture

Routes:

```text
/messages
/messages/{conversation-id}
```

Authentication required.

### Inbox structure

- Conversation list
- Unread state
- Listing/business/job context
- Last message
- Timestamp
- Participant summary

### Conversation structure

- Context header
- Message thread
- Composer
- Attachment support where allowed
- Block
- Report

A conversation must retain context for the listing or entity that initiated it.

---

## 16. Saved Architecture

Route:

```text
/saved
```

MVP:

```text
/saved/listings
```

Phase 1.5:

```text
/saved/searches
```

Saved listings should clearly indicate if an item becomes sold, removed, expired,
or changes price where supported.

---

## 17. Notifications

Route:

```text
/notifications
```

Notification classes:

- Message
- Listing moderation/status
- Listing expiration
- Saved-search match
- Favorite/listing update
- Review
- Business inquiry
- Moderation/security

Users control delivery preferences under:

```text
/account/notifications
```

---

## 18. Jobs Architecture

Public landing:

```text
/jobs
```

Detail:

```text
/jobs/{slug}-{stable-id}
```

Jobs are treated as a distinct domain where the requirements differ from normal
marketplace listings.

Job detail may include:

- Job title
- Employer
- Location
- Remote/hybrid/on-site
- Employment type
- Salary range
- Experience
- Skills
- Description
- Expiration date
- Application method

MVP application behavior may route to contact/employer-defined application
method. Full in-platform job applications remain post-MVP unless explicitly
promoted.

---

## 19. Business Directory Architecture

Phase 1.5 as a richer product surface, but basic browse capability may exist
earlier if included in launch.

Routes:

```text
/businesses
/businesses/{category}
/businesses/{slug}-{stable-id}
```

Business detail:

- Logo
- Cover image
- Name
- Description
- Category
- Location
- Hours
- Contact actions
- Website
- Services/products
- Reviews
- Photos
- Verification

Primary actions:

```text
Call
Message
Visit Website
Get Directions
```

Exact addresses may be public for appropriate business profiles.

---

## 20. Events Architecture

Routes:

```text
/events
/events/{location}
/events/{slug}-{stable-id}
```

Event detail:

- Title
- Description
- Date
- Time
- Venue/location
- Organizer
- Images
- Category
- RSVP/contact information

Events are first-class content and should not be modeled as ordinary product listings.

---

## 21. Community Architecture

Route:

```text
/community
```

MVP/early surface:

- Announcements
- Recommendations
- Questions
- Help requests
- Local information

Phase 2+:

```text
/community/groups
/community/groups/{group-slug}
/community/posts/{post-id}
```

Community content requires stronger moderation and privacy rules than standard
listing content.

---

## 22. Authentication Architecture

Routes:

```text
/auth/sign-up
/auth/log-in
/auth/verify-email
/auth/forgot-password
/auth/reset-password
```

### Protected-action behavior

When a guest triggers:

- Post Listing
- Message
- Save
- Report where identity is required

the application should route to authentication and preserve the intended return
destination where safe.

---

## 23. Account Architecture

Root:

```text
/account
```

Pages:

```text
/account/profile
/account/listings
/account/security
/account/privacy
/account/notifications
/account/settings
```

Possible Phase 1.5+ additions:

```text
/account/businesses
/account/reviews
/account/subscriptions
/account/payments
```

Account deletion must be available in an appropriate settings/security area.

---

## 24. Admin & Moderation Architecture

Root:

```text
/admin
```

Role-gated.

### Dashboard

- Users
- Active listings
- New listings
- Reports
- Businesses
- Revenue where applicable
- Growth metrics

### Users

```text
/admin/users
/admin/users/{user-id}
```

Actions:
- Search
- View
- Suspend
- Restore
- Verification review
- Moderation history

### Listings

```text
/admin/listings
/admin/listings/{listing-id}
```

Actions:
- Review
- Approve
- Reject
- Remove
- Feature
- Flag

### Reports

```text
/admin/reports
/admin/reports/{report-id}
```

Includes:
- Reason
- Priority
- Evidence
- Subject entity
- Reporter context
- Moderator notes
- Action history

### Taxonomy & locations

```text
/admin/categories
/admin/locations
```

### Audit

```text
/admin/audit-log
```

Sensitive actions must be auditable.

---

## 25. Footer Architecture

Footer groups:

### Brand
- GuzoMarket logo
- Short positioning statement
- Social links

### Explore
- Buy & Sell
- Housing
- Cars
- Jobs
- Services
- Events
- Businesses
- Community

### Help
- How it works
- Safety tips
- Support
- FAQs
- Contact

### Company
- About
- Careers
- Blog
- Terms
- Privacy

### Utility
- Newsletter
- Language [future multilingual support]
- Currency [only when needed for multi-market expansion]

Do not show native app-store badges until real applications are publicly available.

---

## 26. Public vs Private Page Matrix

| Area | Guest | Registered User | Business | Moderator/Admin | Search-indexable |
|---|---|---|---|---|---|
| Homepage | Yes | Yes | Yes | Yes | Yes |
| Category pages | Yes | Yes | Yes | Yes | Yes |
| Search results | Yes | Yes | Yes | Yes | Controlled |
| Listing detail | Yes | Yes | Yes | Yes | Yes if active |
| Public profile | Yes | Yes | Yes | Yes | Yes/controlled |
| Business detail | Yes | Yes | Yes | Yes | Yes |
| Event detail | Yes | Yes | Yes | Yes | Yes |
| Community public content | Yes | Yes | Yes | Yes | Policy-dependent |
| Post Listing | No | Yes | Yes | Yes | No |
| Messages | No | Yes | Yes | Yes | No |
| Saved | No | Yes | Yes | Yes | No |
| Notifications | No | Yes | Yes | Yes | No |
| Account | No | Yes | Yes | Yes | No |
| Admin | No | No | No | Authorized only | No |

---

## 27. SEO & Indexability Rules

Indexable by default:

- Homepage
- Category landing pages
- Location/category landing pages
- Active listing detail pages
- Business pages
- Event pages
- Selected public community pages
- Help and company informational pages

Non-indexable:

- Authentication
- Account
- Messages
- Saved
- Notifications
- Post flow
- Admin
- Private moderation states
- Draft/pending content

Search/filter combinations should not automatically create unlimited indexable URL
variants. Canonicalization rules will be finalized in the SEO/technical specification.

---

## 28. Error, Empty, and Restricted States

Every major area must define:

- Loading state
- Empty state
- Error state
- Permission-denied state
- Not-found state

Examples:

### No search results
- Explain that no matches were found
- Suggest clearing filters
- Suggest nearby locations/categories

### No saved listings
- Explain saving
- Link to browse/search

### No messages
- Encourage starting from a listing

### Removed listing
- Do not expose violating content
- Offer navigation back to active results

---

## 29. Canonical User Journeys

### Buying

```text
Home
→ Search / Category
→ Results
→ Listing Detail
→ Seller Profile (optional)
→ Message Seller
→ Continue conversation
```

### Selling

```text
Log In
→ Post Listing
→ Category
→ Details
→ Photos
→ Location
→ Preview
→ Publish
→ Pending/Active
→ Manage Listing
→ Messages
→ Sold/Rented/Filled
```

### Business discovery

```text
Home / Businesses
→ Business Search/Category
→ Business Detail
→ Message / Call / Website / Directions
```

### Event discovery

```text
Home / Events
→ Event List
→ Event Detail
→ RSVP / Contact
```

### Moderator

```text
Admin Dashboard
→ Reports Queue
→ Report Detail
→ Subject Entity
→ Action
→ Audit Record
```

---

## 30. MVP Route Scope

### Required for MVP

```text
/
/search
/buy-sell
/housing
/cars
/jobs
/services
/listings/{id}
/users/{id}
/post/*
/messages/*
/saved/listings
/notifications
/account/profile
/account/listings
/account/security
/account/privacy
/account/notifications
/auth/*
/help/*
/legal/*
/admin/dashboard
/admin/users/*
/admin/listings/*
/admin/reports/*
/admin/categories
/admin/locations
```

### May launch as basic surfaces if ready

```text
/businesses
/businesses/{id}
/events
/events/{id}
/community
```

### Phase 1.5

```text
/search/map
/saved/searches
richer /businesses/*
richer /events/*
seller ratings
phone verification
```

### Phase 2+

```text
/community/groups/*
subscriptions
promotions
AI-assisted flows
native-app-specific routes/features
payments/delivery flows
```

---

## 31. Route Naming Guidelines

- Use lowercase kebab-case.
- Prefer plural collection routes: `/listings`, `/businesses`, `/events`.
- Stable entity IDs must not depend on mutable titles.
- Human-readable slugs may change while redirects preserve discoverability.
- Avoid unnecessary prefixes such as `/guzo-market/...`.
- Keep public URLs short, understandable, and shareable.
- Avoid leaking database implementation details in URLs.

---

## 32. Navigation State Rules

The application should preserve:

- Current location
- Current search query
- Applied filters
- Sort order
- Reasonable return path from detail → results
- Intended destination after authentication

Browser Back should behave predictably.

Filter panels, dialogs, and mobile sheets should not destroy search state.

---

## 33. Accessibility Requirements for IA

- Navigation landmarks must be semantic.
- Breadcrumbs should be used where hierarchy materially helps users.
- Keyboard users must be able to traverse primary navigation.
- Mobile drawers/sheets must trap focus correctly while open.
- Active page/current location must not rely only on color.
- Skip-to-content support should exist on major templates.
- Page titles/H1s must be unique and meaningful.

---

## 34. Analytics Events by Page Family

Key route-level analytics include:

- Homepage viewed
- Search performed
- Filter applied
- Category viewed
- Listing viewed
- Listing saved
- Message started
- Listing creation started
- Listing published
- Business viewed/contacted
- Job viewed
- Event viewed
- Report submitted
- Admin moderation action

Analytics details will be finalized in the analytics specification.

---

## 35. Implementation Guidance

The frontend should reflect the route/domain architecture rather than putting all
screens into generic page folders.

Recommended feature organization:

```text
features/
  listings/
  search/
  categories/
  locations/
  users/
  messaging/
  favorites/
  notifications/
  jobs/
  businesses/
  events/
  community/
  moderation/
  admin/
```

Shared reusable UI belongs in a design-system/shared-components layer, while
business/domain logic stays in feature modules.

---

## 36. Decisions Locked by This Document

The following are considered product architecture decisions unless superseded by
a later approved specification:

1. Top-level navigation destinations.
2. Separation of Listing, Business, Job, Event, and CommunityPost domains.
3. Stable-ID public route pattern.
4. Public versus private route boundaries.
5. Mobile bottom navigation structure.
6. Homepage section hierarchy.
7. Search state in shareable URLs.
8. Explicit multi-step post flow.
9. Explicit account and admin route families.
10. MVP versus Phase 1.5 versus Phase 2+ route scope.

---

## 37. Next Deliverable

After approval of this Information Architecture, create:

**GuzoMarket Database Schema & Entity Relationship Specification v1.0**

That document should map the approved page/domain architecture into PostgreSQL /
Prisma entities, enums, relationships, constraints, indexes, lifecycle states,
audit requirements, and seed taxonomy.

---

**End of GuzoMarket Information Architecture & Complete Sitemap v1.0**
