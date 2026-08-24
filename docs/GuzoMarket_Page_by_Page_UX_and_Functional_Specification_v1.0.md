# GuzoMarket — Page-by-Page UX & Functional Specification v1.0

**Project:** GuzoMarket  
**Document:** Page-by-Page UX & Functional Specification  
**Version:** 1.0  
**Status:** Implementation baseline  
**Source documents:** Master PRD v1.1; Information Architecture & Complete Sitemap v1.0; Database Schema & ER Specification v1.0; UI/UX Design System v1.0; API & Backend Specification v1.0; Security & Trust/Safety Specification v1.0  
**Initial market:** Washington, DC / Maryland / Northern Virginia (DMV)

---

## 1. Purpose

This document converts the approved product architecture into exact screen-level
requirements for the GuzoMarket web application.

For each major page or flow, it defines:

- Purpose
- Route
- Access requirements
- Desktop layout
- Mobile layout
- Required components
- Data requirements
- Primary and secondary actions
- Loading, empty, error, and permission states
- SEO/indexability
- Analytics events
- Accessibility considerations
- Acceptance criteria

This specification is implementation-oriented. It should be used by design, frontend,
backend, QA, and Codex implementation workflows to prevent individual screens from being
invented ad hoc.

---

# PART I — GLOBAL EXPERIENCE RULES

## 2. Global Shell

### Purpose

Provide a consistent frame for all consumer-facing GuzoMarket pages.

### Desktop shell

```text
Global Header
Main Page Content
Footer
```

The desktop header includes:

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

### Mobile shell

```text
Mobile Header
Main Page Content
Bottom Navigation
```

Bottom navigation:

```text
Home
Search
Post
Saved
Account
```

### Rules

- `Post` is visually prominent.
- Guest users can browse public pages.
- Protected actions route to authentication while preserving safe return destination.
- Current location/search context should persist where practical.
- Global shell must support keyboard navigation and skip-to-content.

---

## 3. Global Page States

Every major page must define:

```text
Loading
Empty
Error
Unauthorized
Not Found
Partial Data
```

Do not rely on generic browser errors.

---

## 4. Global Authentication Gate

When a guest triggers a protected action such as Save, Message, Post, account management,
or authenticated reporting, preserve the intended destination, route to authentication,
then return the user safely after success.

---

# PART II — PUBLIC DISCOVERY

## 5. Homepage

**Route:** `/`  
**Access:** Public  
**SEO:** Indexable

### Purpose

Introduce GuzoMarket, enable immediate search, surface local marketplace activity,
business discovery, community content, and account entry points.

### Desktop layout

```text
Global Header
Hero
  ├── Headline
  ├── Supporting text
  ├── Search field
  ├── Location selector
  └── Search button
Popular Searches
Contextual Welcome Surface
Primary Categories
Popular Near You
Trust & Privacy Benefits
Featured Businesses
Community Near You
Account Value Promotion
Footer
```

### Mobile layout

```text
Mobile Header
Hero
Stacked Search + Location
Popular Search chips
Horizontal category rail
Popular Near You
Trust strip
Featured Businesses
Community Near You
Account value section
Bottom Navigation
```

### Guest state

```text
Welcome to GuzoMarket
Join your local marketplace.
[ Sign Up ] [ Log In ]
```

### Authenticated state

```text
Welcome back, {displayName}
Unread messages
Saved updates
My Listings
Post Listing
```

### Required data

- Current marketplace/location
- Popular search terms
- Primary categories
- Popular Near You listings
- Featured businesses
- Community/Event content
- Authentication state
- Saved/favorite state where needed

### Primary action

`Search`

### Secondary action

`Post Listing`

### Loading

Use section-level skeletons. Keep hero/search usable where possible.

### Empty

```text
No listings near Washington, DC yet.
Be one of the first to post.
[ Post Listing ]
```

### Error

Use section-level retry instead of failing the whole page.

### Analytics

```text
homepage_viewed
homepage_search_submitted
homepage_category_selected
homepage_listing_clicked
homepage_business_clicked
homepage_community_clicked
homepage_signup_clicked
homepage_post_listing_clicked
```

### Acceptance criteria

- Search accepts keyword + location.
- Guest and authenticated states differ.
- Community Near You is present.
- Featured content is labeled.
- Location formatting uses `Washington, DC`.
- Footer year is dynamic.
- Native app badges are hidden until real apps exist.
- Mobile layout is intentionally designed.

---

## 6. Search Results

**Route:** `/search`  
**Access:** Public  
**SEO:** Controlled indexability

Example:

```text
/search?q=toyota&location=washington-dc
```

### Desktop layout

```text
Header
Search + Location
Breadcrumb / Context
Filter Sidebar
Results Header
  ├── Result count
  └── Sort
Results Grid/List
Pagination / Progressive Load
Footer
```

### Mobile layout

```text
Header
Search
Filter button
Sort button
Selected filter chips
Results
Bottom navigation
```

### Required components

SearchBar, LocationSelector, FilterPanel, SortControl, SelectedFilterChip,
domain-specific result cards, pagination/cursor loader, EmptyState, ErrorState.

### Primary actions

Open result, apply filters, change search.

### Empty

```text
No results found.
Try widening your location, changing filters, or searching for something else.
[ Clear Filters ]
```

### Analytics

```text
search_performed
search_filter_applied
search_filter_removed
search_sort_changed
search_result_clicked
search_no_results
```

### Acceptance criteria

- Search state survives refresh.
- URL reflects shareable state.
- Filters are server validated.
- Mobile filters use a sheet/full-screen presentation.
- Results are bounded and paginated.
- Back navigation restores previous state.

---

## 7. Category Landing Page

**Routes:** `/buy-sell`, `/housing`, `/cars`, `/jobs`, `/services`  
**Access:** Public  
**SEO:** Indexable

### Layout

```text
Header
Breadcrumb
Category Heading
Location Context
Search
Subcategory Shortcuts
Featured/Recent Content
Filters
Results
SEO Supporting Content
Footer
```

### Acceptance criteria

- Active category is clear.
- Subcategory navigation is accessible.
- Category-specific filters work.
- SEO metadata is unique.
- Disabled categories are not publicly discoverable.

---

# PART III — LISTING EXPERIENCE

## 8. Listing Detail

**Route:** `/listings/{slug}-{stable-id}`  
**Access:** Public when active  
**SEO:** Indexable for active listings

### Desktop layout

```text
Breadcrumbs
Image Gallery              Listing Summary
                           Price
                           Title
                           Key attributes
                           Location
                           Posted time
                           [ Message Seller ]
                           [ Save ]
                           Share
                           Report
Description                Seller Card
Attributes                 Trust/Safety note
Location
Seller's Other Listings
Similar Listings
Footer
```

### Mobile layout

```text
Gallery
Price
Title
Key attributes
Location / posted time
Save / Share
Description
Attributes
Seller
Safety note
Similar listings
Sticky [ Message Seller ]
Bottom navigation
```

### Required data

Listing public DTO, images, category attributes, public location, seller public profile,
verification, favorite state, similar listings, ownership state.

### Primary CTA

`Message Seller`

### Secondary actions

`Save`, `Share`, `Report`

### Special states

Sold/Rented/Filled: show status; disable or adapt contact CTA; emphasize alternatives.

Expired/Archived: exclude from discovery; direct link may show archival state.

Removed/Suspended: use public restricted/not-found state without moderation details.

### Analytics

```text
listing_viewed
listing_gallery_interacted
listing_saved
listing_shared
message_started
seller_profile_clicked
report_started
similar_listing_clicked
```

### Acceptance criteria

- No private coordinates/contact data.
- Sticky mobile CTA works.
- Owner receives management shortcut.
- Removed content leaks no moderation details.

---

## 9. Public Seller Profile

**Route:** `/users/{username-or-public-id}`  
**Access:** Public subject to profile visibility

### Layout

```text
Avatar
Display Name
General Location
Joined Date
Verification
Seller Metrics
Bio
Active Listings
```

### Privacy

Never expose private email, phone, exact residential address, or internal moderation history.

---

# PART IV — POSTING

## 10. Post Listing Entry

**Route:** `/post`  
**Access:** Authenticated

If no draft exists, route to `/post/category`. If a resumable draft exists, optionally
offer Continue Draft or Start New Listing.

---

## 11. Post Step 1 — Category

**Route:** `/post/category`

```text
Progress Indicator
Choose a category
Category cards/list
Subcategory drill-down
Back / Continue
```

Category controls the later dynamic fields.

---

## 12. Post Step 2 — Details

**Route:** `/post/details`

Common fields:

```text
Title
Description
Price
Price type
Condition where applicable
Availability where applicable
Contact preference
```

Dynamic fields come from CategoryAttributeDefinition.

Rules:

- Save draft where practical.
- Preserve values on validation errors.
- Server rejects unknown/mismatched attributes.

---

## 13. Post Step 3 — Photos

**Route:** `/post/photos`

Features:

- Multiple upload
- Drag/drop desktop
- Camera/gallery mobile
- Progress
- Reorder
- Delete
- Retry
- Primary image
- Validation

Acceptance:
- Upload authorization checks ownership.
- File signatures/types are validated.
- Sensitive metadata is stripped where required.
- Reordering persists.

---

## 14. Post Step 4 — Location

**Route:** `/post/location`

Inputs:

```text
City
State/Region
Postal code
Neighborhood
Approximate map location where supported
```

Privacy copy should explain that exact residential address is not shown publicly by default.

---

## 15. Post Step 5 — Preview

**Route:** `/post/preview`

Use actual Listing Detail components.

Actions:

```text
Back to Edit
Publish
Save Draft
```

Publish validates complete listing again server-side.

---

## 16. Publish Success

**Route:** `/post/success`

Active:

```text
Your listing is live.
[ View Listing ]
[ Manage Listing ]
[ Post Another ]
```

Pending:

```text
Your listing is being reviewed.
We’ll notify you when its status changes.
[ Manage Listing ]
```

---

# PART V — AUTHENTICATION

## 17. Sign Up

**Route:** `/auth/sign-up`  
**Access:** Guest

Fields:

```text
Display name
Email
Password
Terms acknowledgement
```

Primary: `Create Account`  
Secondary: `Already have an account? Log In`

Acceptance:
- Secure password handling.
- Safe email/account-existence behavior.
- Return destination preserved.

---

## 18. Log In

**Route:** `/auth/log-in`

Fields:

```text
Email
Password
```

Actions:

```text
Log In
Forgot Password
Create Account
```

Use generic invalid-credentials wording.

---

## 19. Verify Email

**Route:** `/auth/verify-email`

States:

```text
Check your email
Verifying
Verified
Expired token
Invalid token
Resend available
```

Resend is rate limited; token is single-use and expiring.

---

## 20. Forgot / Reset Password

**Routes:** `/auth/forgot-password`, `/auth/reset-password`

Forgot password returns a neutral confirmation.

Reset must handle valid, expired, and already-used tokens plus password validation.

---

# PART VI — ACCOUNT

## 21. Account Overview

**Route:** `/account`  
**Access:** Authenticated

Desktop: account sidebar + main content.  
Mobile: account menu leading to dedicated screens.

Shortcuts:

```text
Profile
My Listings
Saved
Messages
Notifications
Security
Privacy
Settings
```

---

## 22. Account Profile

**Route:** `/account/profile`

Fields:

```text
Avatar
Display name
Username where enabled
Bio
City/region
Public profile visibility
```

Actions:

```text
Save Changes
View Public Profile
```

---

## 23. My Listings

**Route:** `/account/listings`

Tabs:

```text
Active
Pending
Drafts
Completed
Expired
Archived
```

Actions:

```text
View
Edit
Mark Sold/Rented/Filled
Archive
Renew
Delete
```

---

## 24. Edit Listing

**Route:** `/account/listings/{listing-id}/edit`

Reuse posting form sections.

Rules:
- Active edits may trigger review.
- Users cannot edit internal moderation fields.
- Only owner/authorized admin may access.

---

## 25. Saved Listings

**Route:** `/saved/listings`

Show saved item state such as Sold, Rented, Expired, Removed, or price change where supported.

Empty:

```text
No saved listings yet.
Save listings you like and they’ll appear here.
[ Browse Listings ]
```

---

## 26. Saved Searches

**Route:** `/saved/searches`  
**Phase:** 1.5

Functions:

```text
View
Rename
Run
Change notification frequency
Pause
Delete
```

---

## 27. Notifications

**Route:** `/notifications`

Features:
- Chronological list
- Unread state
- Mark read / mark all read
- Deep link to context

---

## 28. Notification Preferences

**Route:** `/account/notifications`

Controls per type:

```text
In-app
Email
Push [future]
SMS [future]
```

Only implemented channels are interactive.

---

## 29. Security Settings

**Route:** `/account/security`

MVP:

```text
Password change
Email verification status
Security information
Account deletion entry point
```

Future: phone verification, MFA, passkeys, active sessions.

---

## 30. Privacy Settings

**Route:** `/account/privacy`

Controls:

```text
Public profile visibility
Location display preference where applicable
Communication/privacy guidance
Blocked users management
```

---

# PART VII — MESSAGING

## 31. Message Inbox

**Route:** `/messages`  
**Access:** Authenticated

Desktop:

```text
Conversation List | Selected Conversation
```

Mobile: separate inbox then conversation screen.

List item:

```text
Participant
Listing/entity context
Last message preview
Timestamp
Unread state
```

---

## 32. Conversation

**Route:** `/messages/{conversation-id}`

Layout:

```text
Context header
Participant summary
Message history
Composer
Attachment control
More menu
```

Actions:

```text
Send
Attach image where permitted
Block
Report
```

Safety:
- Entity context stays visible.
- Block/report available.
- Private contact information is not injected automatically.

---

# PART VIII — JOBS

## 33. Jobs Landing

**Route:** `/jobs`  
**Access:** Public  
**SEO:** Indexable

Layout:

```text
Jobs heading
Search + location
Job type shortcuts
Filters
Job results
Footer
```

Filters:

```text
Employment type
Work mode
Salary
Date posted
Location
```

---

## 34. Job Detail

**Route:** `/jobs/{slug}-{stable-id}`

Layout:

```text
Job title
Employer
Location/work mode
Employment type
Salary
Apply/contact CTA
Description
Skills
Employer/business info
Report
Related jobs
```

MVP application methods:

```text
In-app contact
External URL
Email
```

External links must be validated.

---

# PART IX — BUSINESSES

## 35. Business Directory

**Route:** `/businesses`  
**Access:** Public  
**SEO:** Indexable

Layout:

```text
Business Search
Location
Category shortcuts
Filters
Business Cards
Footer
```

Filters:

```text
Category
Location
Verified
Rating where supported
```

---

## 36. Business Detail

**Route:** `/businesses/{slug}-{stable-id}`

Layout:

```text
Cover
Logo / Name / Verification
Rating
Category / Location
Message / Call / Visit Website / Get Directions
About
Hours
Services
Listings/Products
Reviews [Phase 1.5]
Photos
Map
Related Businesses
```

Public business contact/address may appear only if intentionally configured.

---

## 37. Business Management

**Route:** `/account/businesses`  
**Phase:** 1.5 / richer business launch

Functions:

```text
Create business
Edit profile
Manage members
Manage listings
View inquiries
View verification
View reviews
```

Permissions derive from BusinessMember role.

---

# PART X — EVENTS

## 38. Events Landing

**Route:** `/events`  
**Access:** Public  
**SEO:** Indexable

Layout:

```text
Events heading
Date/location filters
Category shortcuts
Upcoming event cards
Footer
```

---

## 39. Event Detail

**Route:** `/events/{slug}-{stable-id}`

Layout:

```text
Hero image
Event title
Date/time
Venue/location
Organizer
RSVP/contact
Description
Photos
Related events
Report
```

States: Upcoming, Cancelled, Completed, Archived.

---

# PART XI — COMMUNITY

## 40. Community Landing

**Route:** `/community`

Content types:

```text
Announcements
Recommendations
Questions
Help requests
Local information
```

Layout:

```text
Community heading
Location/community context
Content-type filters
Community cards/posts
Create post CTA for authenticated users
```

Community content receives stronger rate limits and moderation.

---

## 41. Community Post Creation

Conceptual route: `/community/new` if enabled.

Fields:

```text
Post type
Title where relevant
Body
Location/community
```

Server validation, rate limiting, moderation state, and no arbitrary HTML.

---

## 42. Community Groups

**Routes:** `/community/groups`, `/community/groups/{group-slug}`  
**Phase:** 2+

---

# PART XII — ADMIN & MODERATION

## 43. Admin Shell

**Route:** `/admin/*`

Layout:

```text
Admin Sidebar
Top Utility Bar
Main Content
```

Navigation:

```text
Dashboard
Users
Listings
Reports
Categories
Locations
Businesses [Phase 1.5]
Events [Phase 1.5]
Audit Log
```

High-impact actions require confirmation and audit.

---

## 44. Admin Dashboard

**Route:** `/admin/dashboard`

Metrics:

```text
Users
Active listings
New listings
Open reports
Businesses
Growth
Revenue when monetization launches
```

Widgets:
- Moderation queue summary
- User growth
- Listing activity
- Report trends
- System alerts

---

## 45. Admin Users

**Route:** `/admin/users`

Columns:

```text
User
Email verification
Status
Joined
Listings count
Reports/risk summary where authorized
Actions
```

Filters:

```text
Status
Verification
Role
Joined date
```

Actions: View, Suspend, Restore, Verification Review.

---

## 46. Admin User Detail

**Route:** `/admin/users/{user-id}`

Sections:

```text
Account summary
Profile
Verification
Listings
Reports
Moderation history
Audit-relevant actions
```

High-impact actions require reason, confirmation, and audit record.

---

## 47. Admin Listings

**Route:** `/admin/listings`

Columns:

```text
Listing
Seller
Category
Location
Status
Moderation state
Published
Reports
Actions
```

Filters: status, moderation state, category, location, date, report count.

---

## 48. Admin Listing Detail

**Route:** `/admin/listings/{listing-id}`

Sections:

```text
Listing preview
Seller context
Structured attributes
Images
Reports
Moderation history
Risk signals where authorized
Action panel
```

Actions:

```text
Approve
Reject
Remove
Restore
Suspend
Flag
```

Only state-valid actions should be enabled.

---

## 49. Reports Queue

**Route:** `/admin/reports`

Fields:

```text
Priority
Reason
Subject type
Subject
Reporter
Assigned moderator
Status
Created
```

Filters:

```text
Open
Triaged
Under Review
Resolved
Dismissed
Priority
Reason
Subject type
Assigned moderator
```

---

## 50. Report Detail

**Route:** `/admin/reports/{report-id}`

Layout:

```text
Report summary
Reporter context
Subject content
Relevant evidence
Related reports/history
Moderator notes
Action panel
Audit history
```

Actions:

```text
Assign
Begin Review
Take Moderation Action
Resolve
Dismiss
```

Reporter privacy and moderator-note privacy must be preserved.

---

## 51. Category Administration

**Route:** `/admin/categories`

Functions:

```text
Create
Edit
Disable
Reorder
Manage attribute definitions
```

Disabling does not delete historical references.

---

## 52. Location Administration

**Route:** `/admin/locations`

Functions:

```text
Create location
Edit
Disable
Manage hierarchy
Assign marketplace region
```

Referenced locations are not destructively removed.

---

## 53. Audit Log

**Route:** `/admin/audit-log`

Columns:

```text
Timestamp
Actor
Action
Entity
Safe metadata summary
```

Filters: actor, action, entity type, date.

Audit entries are not editable.

---

# PART XIII — HELP & LEGAL

## 54. Safety Center

**Route:** `/help/safety`  
**Access:** Public  
**SEO:** Indexable

Content:

```text
Marketplace scam awareness
Messaging safety
Payments/deposit caution
Meeting/exchange guidance
Housing scam guidance
Job scam guidance
Verification explanation
How to report
How to block
```

---

## 55. Help / FAQ / Contact

Routes:

```text
/help/how-it-works
/help/faq
/help/contact
```

---

## 56. Legal Pages

Routes:

```text
/legal/terms
/legal/privacy
/legal/prohibited-content
```

Final legal text requires appropriate legal review before production launch.

---

# PART XIV — CROSS-PAGE FUNCTIONAL RULES

## 57. Favorite Behavior

Guest → authentication.  
Authenticated → idempotent toggle.  
Removed/sold/expired state reflected in Saved.

---

## 58. Share Behavior

Use native Web Share where supported with Copy Link fallback. Never include private params.

---

## 59. Report Behavior

Flow:

```text
Select reason
Optional details
Submit
Confirmation
```

Do not expose moderation outcome immediately unless policy permits.

---

## 60. Verification Badge Behavior

Badges explain exactly what was verified and never imply transaction guarantees.

---

## 61. Featured Content Behavior

Featured content is clearly marked. Paid placement must use approved disclosure and must
not be confused with verification or organic popularity.

---

## 62. Location Display Behavior

Consumer content uses location like:

```text
Silver Spring, MD
Washington, DC
Arlington, VA
```

Exact residential street address remains private by default.

---

## 63. Relative Time

Discovery cards may use:

```text
2 hours ago
Yesterday
3 days ago
```

Detail pages may show exact date where useful.

---

## 64. Status Display

Owner/admin surfaces may show:

```text
Draft
Pending Review
Active
Sold
Rented
Filled
Expired
Archived
Rejected
Removed
Suspended
```

Public surfaces show only appropriate user-facing states.

---

## 65. Page Metadata

Indexable public pages require unique title, meta description, canonical URL, and Open Graph
metadata where appropriate.

---

## 66. Structured Data

Where appropriate later, support Product/Offer-like listing data, LocalBusiness, JobPosting,
Event, and BreadcrumbList structured data matching actual visible content.

---

## 67. Accessibility Per Page

Every page must verify:

- One clear H1
- Logical heading hierarchy
- Keyboard accessibility
- Visible focus
- Form labels
- Error associations
- Accessible dialogs/sheets
- Meaningful alt text
- Appropriate touch targets
- Screen-reader-compatible status updates

---

## 68. Analytics Naming

Use stable snake_case event names and avoid unnecessary sensitive properties.

---

# PART XV — IMPLEMENTATION PRIORITY

## 69. MVP Page Priority

### Tier 1 — Marketplace Core

1. Homepage
2. Search Results
3. Category Landing
4. Listing Detail
5. Post Listing Flow
6. Sign Up / Login / Verification
7. Public Seller Profile
8. Account Profile
9. My Listings
10. Saved Listings
11. Messaging
12. Notifications

### Tier 2 — Operations & Trust

13. Admin Dashboard
14. Admin Users
15. Admin Listings
16. Reports Queue
17. Report Detail
18. Categories
19. Locations
20. Safety Center

### Tier 3 — Launch Extensions

21. Jobs
22. Businesses
23. Events
24. Basic Community

---

## 70. Page Completion Definition

A page is not complete until it has:

- Desktop layout
- Mobile layout
- Real data integration
- Authorization
- Loading state
- Empty state
- Error state
- Accessibility
- Analytics where applicable
- SEO where applicable
- Security/privacy review
- Tests for critical flows
- No hard-coded mock-only behavior remaining in production paths

---

## 71. Decisions Locked by This Document

Unless superseded later:

1. Homepage uses the approved visual structure and Community Near You.
2. Search state remains shareable through URL state.
3. Listing detail prioritizes Message Seller.
4. Mobile listing detail uses a sticky primary contact CTA where practical.
5. Posting uses Category → Details → Photos → Location → Preview → Publish.
6. Guest protected actions preserve return destination through authentication.
7. Account management uses dedicated private routes.
8. Messaging keeps entity context visible.
9. Jobs, Businesses, Events, and Community use distinct page patterns.
10. Admin/moderation uses denser management UI but retains accessibility.
11. Public pages never expose private contact, exact private location, internal moderation,
    or risk data.
12. Every implementation screen includes loading, empty, error, and permission handling.

---

## 72. Next Deliverable

After approval of this Page-by-Page UX & Functional Specification, create:

**GuzoMarket Admin Dashboard Specification v1.0**

That document should go deeper into:

- Admin information architecture
- Moderator vs Admin vs Super Admin permissions
- Dashboard metrics
- User management
- Listing management
- Report queue
- Moderation detail workflow
- Category/location administration
- Business/event management
- Audit log
- Search/filter patterns
- Bulk-action safeguards
- Internal notes
- Escalation
- Admin security
- Acceptance criteria

After that:

1. GuzoMarket AI Feature Specification v1.0
2. GuzoMarket Codex Master Instructions
3. GuzoMarket Sequential Codex Build Prompts

---

**End of GuzoMarket Page-by-Page UX & Functional Specification v1.0**
