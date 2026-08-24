# GuzoMarket --- Master Product Requirements Document (PRD) v1.1

**Project:** GuzoMarket\
**Working tagline:** Buy. Sell. Connect.\
**Document version:** 1.1\
**Status:** Approved product foundation / implementation baseline\
**Primary development approach:** ChatGPT Codex\
**Initial launch market:** Washington, DC / Maryland / Virginia, with
architecture designed for broader U.S. and African expansion

------------------------------------------------------------------------

## 1. Product Vision

GuzoMarket is a modern, trustworthy, mobile-first classifieds and
community marketplace designed initially for Ethiopian and African
communities in the United States.

The platform combines the useful functionality of traditional
classifieds with a significantly better modern user experience, stronger
trust and safety, richer profiles, messaging, business discovery,
community functionality, location-based discovery, and AI-assisted
listing creation.

GuzoMarket should be an original marketplace product, not a visual or
technical copy of Craigslist.

The long-term goal is to build a scalable African marketplace and
community platform that can expand from the initial Washington, DC
region to cities across the United States and eventually countries
across Africa.

------------------------------------------------------------------------

## 2. Product Positioning

### Core positioning

**GuzoMarket is a trusted marketplace and community platform for buying,
selling, working, discovering services, finding businesses, and
connecting with local communities.**

### Brand promise

-   Simple
-   Local
-   Trustworthy
-   Community-driven
-   Modern
-   Accessible
-   Mobile-first

### Brand tagline

**Buy. Sell. Connect.**

### Product philosophy

GuzoMarket should feel like a modern marketplace, local community hub,
trusted classifieds platform, and business discovery platform.

It should not feel like a traditional classifieds directory, generic
social network, school website, overly corporate marketplace, or
stereotypical "African-themed" website.

------------------------------------------------------------------------

## 3. Target Users

### Consumers

People looking to buy products, sell products, find apartments, find
rooms, buy or sell cars, find jobs, find gigs, find services, find
events, discover local businesses, and participate in community
activities.

### Sellers

Individuals selling used products, furniture, electronics, cars,
clothing, household goods, specialty products, and free items.

### Service providers

Contractors, cleaners, mechanics, drivers, tutors, accountants,
designers, beauty professionals, photographers, moving services, real
estate professionals, and other local providers.

### Businesses

Businesses can create professional profiles and promote products,
services, events, and job openings.

### Community organizations

Cultural organizations, community groups, nonprofits, religious
organizations, professional organizations, and event organizers.

### Job seekers and employers

Job seekers can browse jobs, create resumes/profiles, save jobs, and
apply/contact employers. Employers can post jobs, manage applicants,
promote jobs, and create company profiles.

------------------------------------------------------------------------

## 4. Geographic Strategy

The application must be designed as a multi-location platform from day
one.

### Initial launch

-   Washington, DC
-   Maryland
-   Virginia

### Future U.S. markets

-   New York
-   New Jersey
-   Massachusetts
-   Georgia
-   Texas
-   California
-   Minnesota
-   Pennsylvania
-   Ohio
-   North Carolina

### Future African markets

-   Ethiopia
-   Kenya
-   Nigeria
-   Ghana
-   Tanzania
-   Uganda
-   Rwanda
-   South Africa
-   Senegal

### Geographic hierarchy

``` text
Country
  └── State / Region
       └── City
            └── Neighborhood
```

Listings should store structured geographic information rather than
relying only on free-text addresses.

------------------------------------------------------------------------

## 5. Core Marketplace Categories

### Buy & Sell

-   Electronics
-   Furniture
-   Appliances
-   Clothing
-   Baby & Kids
-   Home & Garden
-   Sports & Recreation
-   Collectibles
-   Books
-   Musical Instruments
-   Jewelry
-   Food & Specialty Products
-   Other

### Cars & Vehicles

-   Cars
-   SUVs
-   Trucks
-   Vans
-   Motorcycles
-   Commercial vehicles
-   Auto parts
-   Automotive services

### Housing

-   Apartments
-   Houses
-   Rooms
-   Shared housing
-   Sublets
-   Short-term rentals
-   Housing wanted
-   Parking
-   Real estate services

### Jobs

-   Full-time
-   Part-time
-   Remote
-   Temporary
-   Internship
-   Healthcare
-   Technology
-   Transportation
-   Construction
-   Hospitality
-   Retail
-   Professional
-   Other

### Gigs

-   Delivery
-   Moving
-   Labor
-   Events
-   Photography
-   Creative
-   Freelance
-   Other

### Services

-   Home services
-   Automotive
-   Cleaning
-   Beauty
-   Education
-   Legal
-   Accounting
-   Technology
-   Transportation
-   Childcare
-   Photography
-   Professional services

### Community

-   Events
-   Announcements
-   Groups
-   Activities
-   Volunteers
-   Lost & Found
-   Free items
-   Community discussions

### Businesses

-   Restaurants
-   Grocery stores
-   Auto services
-   Construction
-   Professional services
-   Beauty
-   Healthcare
-   Retail
-   Transportation
-   Real estate
-   Education

------------------------------------------------------------------------

## 6. User Roles

### Guest

Can browse listings, search, filter, view listing details, view public
profiles, view businesses, and view events.

Cannot post listings, send messages, save listings, or review
businesses.

### Registered User

Can create/edit/delete listings, favorite listings, save searches, send
messages, receive notifications, report content, block users, create
reviews where permitted, and manage their profile.

### Business Account

Can create a business profile, add business members, publish listings,
publish services, receive messages/leads, manage business reviews, view
analytics, promote listings, and purchase subscriptions.

### Moderator

Can review reports, review flagged listings, remove violating content,
suspend users when authorized, review the moderation queue, and record
moderation actions.

### Admin

Can manage users, listings, categories, locations, businesses, reports,
subscriptions, featured content, and analytics.

### Super Admin

Full system-level access.

------------------------------------------------------------------------

## 7. Core Features

### Authentication

Required:

-   Email registration
-   Email verification
-   Login
-   Logout
-   Password reset
-   Session management
-   Account deletion

Future:

-   Google login
-   Apple login
-   Phone authentication

### User Profiles

Each registered user should have:

-   Profile photo
-   Display name
-   Username
-   City/region
-   Bio
-   Joined date
-   Verification status
-   Active listings
-   Seller rating where applicable
-   Response rate
-   Response time

Privacy controls must allow users to control what is public.

------------------------------------------------------------------------

## 8. Listing Creation

The listing flow should be simple and mobile-friendly.

### Step 1 --- Category

User selects a category such as Buy & Sell, Cars, Housing, Jobs,
Services, Gigs, Community, or Other.

### Step 2 --- Listing information

Common fields:

-   Title
-   Description
-   Price
-   Condition
-   Location
-   Contact preference
-   Availability

Fields should change based on category.

### Step 3 --- Photos

Allow multiple images, reordering, deletion, preview, image compression,
and file validation.

### Step 4 --- Location

Support city, state, ZIP/postal code, neighborhood, and approximate map
location.

Avoid exposing a precise residential address publicly unless explicitly
appropriate.

### Step 5 --- Preview

Show the user exactly what the listing will look like.

### Step 6 --- Publish

The listing enters moderation/risk checks and becomes active according
to platform rules.

------------------------------------------------------------------------

## 9. Listing Detail Page

Include:

-   Image gallery
-   Title
-   Price
-   Description
-   Key attributes
-   Location
-   Posted date
-   Seller profile
-   Verification badges
-   Seller rating
-   Message button
-   Favorite button
-   Share button
-   Report button
-   Similar listings

Primary CTA:

**Message Seller**

Secondary CTA:

**Save**

------------------------------------------------------------------------

## 10. Search

### Basic search

Search by keyword, category, and location.

### Advanced filters

Depending on category:

-   Price
-   Distance
-   Date posted
-   Condition
-   Availability
-   Seller type
-   Verified seller
-   Business
-   Delivery available
-   Remote
-   Job type
-   Property type
-   Vehicle type

### Sorting

-   Recommended
-   Newest
-   Price low to high
-   Price high to low
-   Distance
-   Most relevant

------------------------------------------------------------------------

## 11. Location & Map Search

Listings should support:

-   Map view
-   List view
-   Radius search
-   City search
-   Neighborhood search

Example:

> Apartments under \$2,000 within 15 miles of Washington, DC.

The mapping provider should be abstracted so it can be replaced later
without rewriting the marketplace domain model.

------------------------------------------------------------------------

## 12. Favorites & Saved Searches

### Favorites

Users can save listings and manage them from a Favorites page.

### Saved searches

Users can save:

-   Search query
-   Filters
-   Location
-   Radius
-   Notification frequency
-   Active/inactive state

Notifications can be instant, daily, or weekly.

------------------------------------------------------------------------

## 13. Messaging

GuzoMarket should have a secure internal messaging system.

Features:

-   Conversations
-   Unread count
-   Message timestamps
-   Read state
-   Image attachments where permitted
-   Block user
-   Report conversation
-   Listing context
-   Seller/buyer identity

The listing should automatically be associated with the conversation.

Do not expose users' private email addresses or phone numbers
automatically.

------------------------------------------------------------------------

## 14. Notifications

Notification types:

-   New message
-   Listing approved
-   Listing rejected
-   Listing expiring
-   Saved search match
-   Favorite listing update
-   Price change
-   Review received
-   Business inquiry
-   Moderation action
-   Security alert

Delivery channels:

-   In-app
-   Email
-   Push notification in future
-   SMS only where justified

Users should control notification preferences.

------------------------------------------------------------------------

## 15. Trust & Safety

Trust is a major differentiator for GuzoMarket.

### Verification

Possible badges:

-   Email Verified
-   Phone Verified
-   Identity Verified
-   Business Verified

Verification should never imply a guarantee of transaction safety.

### Reporting

Users can report:

-   Scam
-   Spam
-   Prohibited item
-   Harassment
-   Fraud
-   Duplicate listing
-   Misleading listing
-   Copyright/IP complaint
-   Other

### Blocking

Users can block another user. Blocked users should not be able to
interact through supported platform channels.

------------------------------------------------------------------------

## 16. Fraud & Scam Detection

Eventually use automated risk scoring based on signals such as:

-   Unusually low price
-   Repeated identical listings
-   Duplicate images
-   Suspicious URLs
-   High-volume posting
-   Rapid account creation
-   Suspicious messaging patterns
-   Payment requests outside approved flows
-   Repeated reports
-   Account/device/IP risk signals where legally and technically
    appropriate

AI should assist moderation but should not automatically make
irreversible high-impact decisions without appropriate controls.

------------------------------------------------------------------------

## 17. Business Directory

Business profiles should include:

-   Logo
-   Cover image
-   Business name
-   Description
-   Category
-   Location
-   Hours
-   Contact options
-   Website
-   Services
-   Products/listings
-   Reviews
-   Verification
-   Photos
-   Social links where appropriate

Primary actions:

-   Call
-   Message
-   Visit Website
-   Get Directions

------------------------------------------------------------------------

## 18. Business Reviews

Users can review eligible businesses.

Review includes:

-   Rating
-   Text
-   Date
-   User identity/profile

Features:

-   Review reporting
-   Business response
-   Moderation
-   Anti-review-abuse controls

------------------------------------------------------------------------

## 19. Community Features

### Community posts

Examples:

-   Local announcements
-   Recommendations
-   Questions
-   Help requests
-   Community information

### Events

Fields:

-   Title
-   Description
-   Date
-   Time
-   Location
-   Organizer
-   Images
-   Category
-   RSVP/contact information

### Groups

Potential examples:

-   Ethiopian Community
-   Nigerian Community
-   Ghanaian Community
-   Kenyan Community
-   Somali Community
-   Professional groups
-   Local city groups

Community features require strong moderation and privacy controls.

------------------------------------------------------------------------

## 20. Jobs

Job listings should support:

-   Job title
-   Employer
-   Description
-   Location
-   Remote/hybrid/on-site
-   Employment type
-   Salary range
-   Experience
-   Skills
-   Application method
-   Expiration date

Future job-seeker features:

-   Resume/profile
-   Saved jobs
-   Applications
-   Job alerts

------------------------------------------------------------------------

## 21. AI Features

AI should improve usability, not replace the marketplace.

### AI Listing Assistant

Example user input:

> Selling a 2019 Honda Accord, 75k miles, good condition, new tires.

AI can suggest:

**Title:**\
2019 Honda Accord --- 75K Miles --- New Tires

**Description:**\
A clean, well-maintained 2019 Honda Accord...

AI can also suggest category, attributes, keywords, price range, and
missing information.

### AI Search

Example:

> Find me a two bedroom apartment near Silver Spring under \$2,000.

The system converts the request into structured filters.

### AI Moderation Assistance

AI can flag potential spam, scams, prohibited content, and duplicate
content.

All automated moderation should have appropriate human-review paths.

------------------------------------------------------------------------

## 22. Recommendations

Future recommendation engine:

-   Similar listings
-   Recently viewed
-   Popular near you
-   Recommended businesses
-   Recommended jobs
-   Recommended services

Recommendations should be explainable where appropriate.

------------------------------------------------------------------------

## 23. Monetization

### Free

-   Browse
-   Search
-   Basic user profile
-   Standard listings
-   Messaging
-   Favorites

### Paid listing promotion

Potential products:

-   Featured
-   Boosted
-   Urgent
-   Homepage placement

### Business subscriptions

#### Free Business

-   Basic profile
-   Limited listings

#### Pro

-   More listings
-   Analytics
-   Verification
-   Better profile customization

#### Premium

-   Featured placement
-   Lead tools
-   Advanced analytics
-   Promotions

### Paid job postings

Employers can purchase premium job placement.

------------------------------------------------------------------------

## 24. Admin Dashboard

### Overview

-   Users
-   Active listings
-   New listings
-   Reports
-   Businesses
-   Messages
-   Revenue
-   Growth metrics

### Users

-   Search
-   View profile
-   Suspend
-   Restore
-   Verification
-   Moderation history

### Listings

-   Search
-   Review
-   Approve
-   Reject
-   Remove
-   Feature
-   Flag

### Reports

-   Queue
-   Priority
-   Reason
-   Evidence
-   Action
-   Moderator notes

### Businesses

-   Approvals
-   Verification
-   Reviews
-   Subscriptions

### Categories

-   Create
-   Edit
-   Disable
-   Reorder

### Locations

-   Countries
-   States/regions
-   Cities
-   Neighborhoods

------------------------------------------------------------------------

## 25. UI/UX Design System

### Brand

**GuzoMarket**

### Tagline

**Buy. Sell. Connect.**

### Colors

  Purpose          Hex
  ---------------- -----------
  Primary Green    `#087F5B`
  Primary Hover    `#066B4C`
  Light Green      `#E8F5F0`
  Accent Gold      `#F4B740`
  Navy             `#102A43`
  Main Text        `#172B4D`
  Secondary Text   `#64748B`
  Background       `#F8FAFC`
  Card             `#FFFFFF`
  Border           `#E5E7EB`
  Success          `#16A34A`
  Warning          `#F59E0B`
  Error            `#DC2626`

### Typography

**UI font:** Inter

Weights:

-   400 Regular
-   500 Medium
-   600 SemiBold
-   700 Bold

**Brand/display font:** Manrope

Use primarily for the logo and selected brand moments.

### Visual style

Use:

-   Clean white surfaces
-   Generous whitespace
-   Rounded cards
-   Subtle shadows
-   High-quality photography
-   Clear typography
-   Strong visual hierarchy
-   Simple iconography
-   Responsive layouts

Avoid:

-   Excessive gradients
-   Excessive shadows
-   Clutter
-   Tiny typography
-   Excessive animation
-   Heavy decorative patterns
-   Stereotypical African visual elements
-   Craigslist-style text-heavy layouts

### Border radius

``` text
sm = 8px
md = 12px
lg = 16px
xl = 24px
```

------------------------------------------------------------------------

## 26. Responsive Strategy

Mobile-first.

### Mobile

-   1--2 listing columns depending on viewport
-   Bottom navigation
-   Large touch targets
-   Sticky primary actions
-   Simplified filters

### Tablet

-   2--3 listing columns
-   Expanded navigation

### Desktop

-   4+ listing columns depending on viewport
-   Full navigation
-   Sidebar filters
-   Map/list split view where appropriate

------------------------------------------------------------------------

## 27. Main Navigation

### Desktop

``` text
GuzoMarket
Categories
Jobs
Services
Community
Events
Businesses
Messages
Saved
[ + Post Listing ]
```

### Mobile

``` text
Home
Search
Post
Saved
Account
```

------------------------------------------------------------------------

## 28. Homepage

Recommended structure:

1.  Navigation
2.  Hero/search
3.  Location selector
4.  Popular searches
5.  Category shortcuts
6.  Trending near you
7.  Trust benefits
8.  Featured businesses
9.  Community discovery
10. App promotion
11. Footer

Hero:

**Buy. Sell. Connect.\
All in one place.**

Supporting text:

**The trusted marketplace for the Ethiopian and African community.**

Primary action:

**Search**

Secondary action:

**Post Listing**

The generated homepage mockup is the visual reference for the design
direction. Implementation should use reusable responsive components
rather than recreating the screenshot as a static page.

------------------------------------------------------------------------

## 29. Listing Card

Standard listing card:

``` text
Image
Favorite button
Featured badge if applicable

Price
Title
Location
Posted time
Optional verification indicator
```

Cards should be reusable across homepage, search, category pages,
favorites, and recommendations.

------------------------------------------------------------------------

## 30. Accessibility

Target WCAG 2.2 AA where practical.

Requirements:

-   Keyboard navigation
-   Visible focus states
-   Semantic HTML
-   Accessible labels
-   Sufficient color contrast
-   Alt text
-   Screen-reader-friendly forms
-   Proper error messaging
-   Accessible dialogs
-   Appropriate touch targets

Never communicate important information using color alone.

------------------------------------------------------------------------

## 31. Recommended Technical Stack

### Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui

### Backend

-   Next.js server-side functionality
-   Server Actions where appropriate
-   API routes where appropriate

### Database

-   PostgreSQL
-   Prisma ORM

### File storage

S3-compatible object storage.

### Search

Phase 1:

-   PostgreSQL search

Later:

-   Meilisearch
-   Typesense
-   OpenSearch

### Maps

Use a production mapping/geocoding provider.

### Payments

Use a trusted payment provider such as Stripe.

### Email

Use a transactional email provider.

### AI

Use an AI API for listing assistance, search parsing, moderation
assistance, and recommendations.

------------------------------------------------------------------------

## 32. Database Domain Model

Core entities:

``` text
User
Profile
Role
Verification
Listing
ListingImage
ListingAttribute
Category
Location
Favorite
SavedSearch
Conversation
Message
Notification
Report
ModerationAction
Business
BusinessMember
BusinessReview
Event
Community
CommunityMember
JobApplication
Resume
Subscription
Payment
Promotion
AuditLog
```

Relationships should be carefully defined before implementation.

------------------------------------------------------------------------

## 33. Security Requirements

Security must be designed from the beginning.

Required:

-   Secure authentication
-   Authorization checks
-   Server-side validation
-   Input sanitization
-   Rate limiting
-   File upload validation
-   Image size/type restrictions
-   Secure password handling
-   Secure sessions
-   CSRF protection where applicable
-   XSS protection
-   SQL injection prevention
-   Audit logging
-   Abuse controls
-   Secure secrets management

Never trust client-side validation alone.

------------------------------------------------------------------------

## 34. Privacy

Principles:

-   Don't expose private contact information by default.
-   Allow users to control profile visibility.
-   Avoid exposing precise residential locations.
-   Provide account deletion.
-   Provide appropriate data-management controls.
-   Clearly explain how information is used.

Legal/privacy requirements should be reviewed for each launch market.

------------------------------------------------------------------------

## 35. SEO

Public marketplace pages should be search-engine friendly.

Requirements:

-   Server-rendered public pages
-   Unique title/meta descriptions
-   Canonical URLs
-   Structured data where appropriate
-   Sitemap
-   Robots configuration
-   Clean URLs
-   Location/category landing pages
-   Fast loading
-   Open Graph metadata

Example URL concepts:

``` text
/guzo-market/washington-dc/cars
/guzo-market/maryland/housing
/listing/2019-toyota-camry-se
/business/abebe-auto-repair
/events/washington-dc
```

Final URL conventions should be decided before implementation.

------------------------------------------------------------------------

## 36. Performance

Target:

-   Fast first load
-   Optimized images
-   Lazy loading
-   Responsive image sizes
-   Minimal JavaScript where possible
-   Efficient database queries
-   Pagination/infinite loading where appropriate
-   Caching for public content
-   CDN for static/media assets

Avoid loading large libraries globally when a feature does not need
them.

------------------------------------------------------------------------

## 37. Analytics

Track product events such as:

-   Search performed
-   Listing viewed
-   Listing favorited
-   Listing shared
-   Message started
-   Listing posted
-   Listing published
-   Business viewed
-   Business contacted
-   Job viewed
-   Job application started
-   Report submitted
-   Subscription started

Do not collect unnecessary sensitive information.

------------------------------------------------------------------------

## 38. MVP Scope

The first release should focus on the core marketplace.

### Foundation

-   Branding
-   Design system
-   Responsive UI
-   Navigation

### Authentication

-   Register
-   Login
-   Profile

### Marketplace

-   Categories
-   Locations
-   Create listing
-   Edit listing
-   Delete listing
-   Photos
-   Listing details

### Search

-   Keyword
-   Category
-   Location
-   Price
-   Sorting

### User tools

-   Favorites
-   Messaging
-   Notifications

### Trust

-   Reporting
-   Blocking
-   Email verification
-   Basic moderation

### Admin

-   Dashboard
-   Users
-   Listings
-   Reports

------------------------------------------------------------------------

## 39. Post-MVP

After the MVP is stable:

-   Saved searches
-   Alerts
-   Map search
-   Phone verification
-   Seller ratings
-   Business directory
-   Business profiles
-   Events
-   Community groups
-   Paid promotions
-   Subscriptions
-   AI listing assistant
-   AI search
-   Advanced moderation
-   Recommendations
-   Mobile apps

------------------------------------------------------------------------

## 40. Future Expansion

Potential long-term features:

-   Native iOS app
-   Native Android app
-   Multi-language support
-   Amharic
-   Afaan Oromo
-   Tigrinya
-   Somali
-   Swahili
-   French
-   Pan-African locations
-   Cross-border marketplace
-   Payments
-   Delivery integrations
-   Business advertising
-   Local deals
-   Professional networking
-   Community fundraising tools where legally appropriate

------------------------------------------------------------------------

## 41. User Journey --- Buying

``` text
Homepage
   ↓
Search
   ↓
Search Results
   ↓
Filter
   ↓
Listing
   ↓
Seller Profile
   ↓
Message Seller
   ↓
Transaction outside or through approved platform flow
   ↓
Optional review
```

------------------------------------------------------------------------

## 42. User Journey --- Selling

``` text
Login
   ↓
Post Listing
   ↓
Choose Category
   ↓
Enter Details
   ↓
Upload Photos
   ↓
Location
   ↓
AI Assistance (optional)
   ↓
Preview
   ↓
Safety/Moderation Checks
   ↓
Publish
   ↓
Receive Messages
   ↓
Manage Listing
```

------------------------------------------------------------------------

## 43. User Journey --- Business

``` text
Create Account
   ↓
Create Business Profile
   ↓
Business Verification
   ↓
Add Services/Products
   ↓
Receive Leads
   ↓
Manage Reviews
   ↓
View Analytics
   ↓
Promote Business
```

------------------------------------------------------------------------

## 44. User Journey --- Moderator

``` text
Admin/Moderator Dashboard
   ↓
Reports Queue
   ↓
Open Report
   ↓
Review Listing/User/Evidence
   ↓
Take Action
   ↓
Record Moderation Action
   ↓
Notify User Where Appropriate
```

------------------------------------------------------------------------

## 45. Project Architecture Principle

The codebase should be modular.

Recommended conceptual structure:

``` text
app/
components/
features/
lib/
server/
db/
types/
hooks/
config/
public/
tests/
```

Prefer feature-oriented organization over placing every component into
one large generic folder.

Example:

``` text
features/
  listings/
  search/
  messaging/
  favorites/
  users/
  businesses/
  moderation/
  notifications/
```

------------------------------------------------------------------------

## 46. Development Strategy for Codex

Do not ask Codex to build the entire platform in one prompt.

Codex should work in controlled phases.

Each implementation task should:

1.  Explain the goal.
2.  Identify files/modules involved.
3.  Define acceptance criteria.
4.  Implement the smallest complete feature.
5.  Run tests/type checks/lint.
6.  Fix errors.
7.  Summarize changes.
8.  Avoid unrelated refactoring.

Codex should not silently change architecture decisions.

------------------------------------------------------------------------

## 47. Recommended Codex Sprint Sequence

### Sprint 1 --- Project Foundation

-   Create project
-   Configure TypeScript
-   Tailwind
-   shadcn/ui
-   Fonts
-   Theme tokens
-   Responsive layout
-   Base components
-   Header
-   Footer

### Sprint 2 --- Database

-   PostgreSQL
-   Prisma
-   Core schema
-   Migrations
-   Seed data

### Sprint 3 --- Authentication

-   Registration
-   Login
-   Sessions
-   Profile
-   Permissions

### Sprint 4 --- Categories & Locations

-   Category system
-   Geographic hierarchy
-   Admin management

### Sprint 5 --- Listings

-   CRUD
-   Images
-   Attributes
-   Publishing workflow

### Sprint 6 --- Search

-   Search
-   Filters
-   Sorting
-   Pagination

### Sprint 7 --- Listing Experience

-   Listing page
-   Seller profile
-   Favorites
-   Sharing

### Sprint 8 --- Messaging

-   Conversations
-   Messages
-   Notifications

### Sprint 9 --- Trust & Safety

-   Reports
-   Blocking
-   Verification
-   Moderation queue

### Sprint 10 --- Admin

-   Dashboard
-   Users
-   Listings
-   Reports
-   Categories

### Sprint 11 --- Businesses

-   Business profiles
-   Directory
-   Reviews

### Sprint 12 --- Community

-   Events
-   Groups
-   Posts

### Sprint 13 --- AI

-   Listing assistant
-   Search parser
-   Moderation assistance

### Sprint 14 --- Monetization

-   Promotions
-   Business plans
-   Payments

### Sprint 15 --- Production Hardening

-   Security audit
-   Performance
-   SEO
-   Accessibility
-   Testing
-   Monitoring
-   Deployment

------------------------------------------------------------------------

## 48. Definition of Done

A feature is not complete simply because the UI exists.

Every feature should have:

-   UI
-   Mobile responsiveness
-   Server-side validation
-   Permission checks
-   Error states
-   Loading states
-   Empty states
-   Accessibility
-   Tests
-   Type safety
-   Security review
-   Database migration where necessary
-   Analytics events where appropriate
-   Documentation where needed

------------------------------------------------------------------------

## 49. Quality Standards

### UX

-   Simple
-   Fast
-   Predictable
-   Mobile-first
-   Accessible

### Engineering

-   Type-safe
-   Modular
-   Testable
-   Secure
-   Maintainable

### Product

-   Trustworthy
-   Scalable
-   Search-friendly
-   Community-focused

------------------------------------------------------------------------

## 50. Recommended Initial Launch Strategy

Start with a focused geographic market rather than launching globally.

Recommended:

**Washington, DC + Maryland + Northern Virginia**

Build strong marketplace liquidity in this region.

Focus initial categories on:

1.  Buy & Sell
2.  Housing
3.  Cars
4.  Jobs
5.  Services
6.  Businesses
7.  Community

Once usage and supply/demand are healthy, expand to additional U.S.
cities.

------------------------------------------------------------------------

## 51. Brand Guidelines Summary

``` text
Brand:
GuzoMarket

Tagline:
Buy. Sell. Connect.

Primary:
#087F5B

Accent:
#F4B740

Navy:
#102A43

UI Font:
Inter

Brand Font:
Manrope

Design:
Modern
Minimal
Friendly
Premium
Mobile-first
Community-driven

Primary CTA:
Post Listing

Primary User Action:
Search
```

------------------------------------------------------------------------

## 52. Important Product Principle

GuzoMarket should not attempt to compete only by having more features.

The strongest differentiation should be:

**Trust + local relevance + modern UX + community + business
discovery.**

The product should make users feel:

> "This is the marketplace for my community, but it works like a modern
> technology product."

------------------------------------------------------------------------

## 53. Next Development Deliverables

After this PRD is approved, create the following documents in order:

1.  **GuzoMarket Information Architecture & Complete Sitemap**
2.  **GuzoMarket Database Schema & Entity Relationship Specification**
3.  **GuzoMarket UI/UX Design System**
4.  **GuzoMarket API & Backend Specification**
5.  **GuzoMarket Security & Trust/Safety Specification**
6.  **GuzoMarket Admin Dashboard Specification**
7.  **GuzoMarket AI Feature Specification**
8.  **GuzoMarket Codex Master Instructions**
9.  **GuzoMarket Sequential Codex Build Prompts**

------------------------------------------------------------------------

## 54. Final Product Goal

The finished product should combine:

``` text
Classifieds
     +
Marketplace
     +
Jobs
     +
Housing
     +
Services
     +
Business Directory
     +
Community
     +
Events
     +
Messaging
     +
Trust & Safety
     +
AI
```

under one modern brand:

# GuzoMarket

## Buy. Sell. Connect.

------------------------------------------------------------------------


------------------------------------------------------------------------

## 55. PRD v1.1 Implementation Decisions

This section supersedes any conflicting ambiguity elsewhere in v1.0 and
turns the approved visual direction into implementation rules.

### 55.1 MVP product boundary

The MVP exists to create marketplace liquidity and safe buyer/seller
communication in the Washington, DC / Maryland / Northern Virginia
launch region.

GuzoMarket facilitates discovery and communication in MVP but does not
process buyer-to-seller marketplace payments, escrow, or delivery
fulfillment.

**MVP non-goals:**

- Native iOS or Android applications
- Buyer-to-seller payments or escrow
- Delivery fulfillment
- Advanced recommendation engine
- Automated irreversible AI moderation decisions
- Full social/community feed
- Advanced subscriptions
- Multi-language UI at initial launch
- Phone verification unless explicitly promoted into MVP scope

### 55.2 Domain boundaries

Do not force all content into a single generic Listing model. Treat these
as distinct domain concepts where their behavior differs:

``` text
Listing
Business
Job
Event
CommunityPost
User / Profile
```

Shared infrastructure and reusable UI are encouraged, but each domain
must retain appropriate validation, lifecycle, permissions, attributes,
and search behavior.

Category-specific listing data should use structured attributes rather
than adding every possible field to the base Listing table.

### 55.3 Top-level navigation and taxonomy

Approved desktop discovery/navigation destinations:

``` text
Buy & Sell
Housing
Cars
Jobs
Services
Events
Businesses
Community
```

Gigs remains a supported marketplace/job-style category but does not
need a permanent top-level homepage navigation slot.

Events are a first-class content type and discovery destination, not
merely a generic Community listing.

### 55.4 Listing lifecycle

Use explicit listing states rather than a simple published boolean:

``` text
DRAFT
  ↓
PENDING_REVIEW
  ↓
ACTIVE
  ├── SOLD / RENTED / FILLED
  ├── EXPIRED
  └── ARCHIVED

Exceptional states:
REJECTED
REMOVED
SUSPENDED
```

All moderation-driven transitions must be auditable.

### 55.5 Location model

Extend the geographic model to support:

``` text
Country
State / Region
County / District
City
Neighborhood
Postal Code
Latitude
Longitude
Marketplace Region
```

A Marketplace Region may cross administrative boundaries. For example,
the DMV market may include Washington, DC plus nearby Maryland and
Northern Virginia locations.

Store public display location separately from internal geocoded
location. Consumer listings should normally expose city/neighborhood
level location, not a precise residential address. Exact addresses may
be shown where appropriate for verified businesses or public venues.

Homepage location resolution priority:

1. Explicit user-selected location
2. Saved profile location
3. Previous session preference
4. Approximate regional inference where legally appropriate
5. Default launch market: Washington, DC

Precise browser geolocation requires user permission.

### 55.6 Search behavior

Homepage search consists of keyword query, selected location, and Search
action. Search/filter state should be shareable and bookmarkable through
clean URL/query state where practical.

Preferred route concepts:

``` text
/washington-dc/cars
/maryland/housing
/washington-dc/jobs
/search?q=toyota&location=washington-dc
/listings/2019-toyota-camry-se-{stable-id}
/businesses/abebe-auto-repair-{stable-id}
/events/ethiopian-festival-dc-{stable-id}
```

Stable identifiers must remain authoritative even when human-readable
slugs change.

### 55.7 Approved homepage hierarchy

The supplied homepage design is the approved desktop visual baseline,
not a pixel-perfect static implementation contract.

Desktop hierarchy:

1. Global navigation
2. Hero/search with integrated location
3. Popular searches
4. Contextual guest/authenticated welcome surface
5. Primary category shortcuts
6. Popular Near You
7. Trust/privacy benefits
8. Featured Businesses
9. Community Near You
10. Account/value promotion
11. Footer

Use **Popular Near You** for MVP rather than implying a sophisticated
recommendation engine. Ranking may combine recency, views, favorites,
conversation starts, listing quality, geographic relevance, and clearly
identified featured placement.

Guest users may see Sign Up / Log In prompts. Authenticated users must
not see guest authentication CTAs in the same space.

Do not display App Store or Google Play download badges until real native
applications are available.

### 55.8 Listing and business cards

**ListingCard required content:**

``` text
Primary image (target 4:3)
Favorite control
Featured badge when applicable
Price / price suffix
Title
City, State
Relative posted time
Optional verification/delivery/seller indicator
```

**BusinessCard required content:**

``` text
Cover image or logo
Business name
Rating and review count
City, State
Business category
Optional verification indicator
```

BusinessCard and ListingCard are separate reusable components.

Featured placement must have a defined source. Paid placement must never
be represented as an organic recommendation.

### 55.9 Responsive homepage

Mobile must be intentionally designed rather than created by shrinking
the desktop layout.

Mobile requirements:

- Header prioritizes logo/account and search
- Search and location remain prominent
- Category shortcuts may horizontally scroll
- Discovery cards use one-column layouts or intentional horizontal rails
- Bottom navigation: Home, Search, Post, Saved, Account
- Post action is visually prominent
- Large accessible touch targets
- Simplified mobile filters
- Sticky primary actions where useful

### 55.10 Design-system additions

Layout tokens:

``` text
Standard desktop content width: 1280px
Maximum wide content width: 1440px
Desktop gutter: 32px
Tablet gutter: 24px
Mobile gutter: 16px

Spacing:
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 96px
```

Typography targets:

``` text
Display: 48px
H1: 40px
H2: 30px
H3: 24px
H4: 20px
Body Large: 18px
Body: 16px
Small: 14px
Caption: 12px
```

Expose semantic theme tokens rather than scattering raw colors:

``` text
brand-primary
brand-primary-hover
brand-accent
background
surface
surface-muted
text-primary
text-secondary
text-inverse
border
border-strong
success
warning
error
```

Core reusable components include Button, Input, Card, Badge, Dialog,
Dropdown, Navigation, ListingCard, and BusinessCard.

### 55.11 Trust-language guardrails

Avoid wording that implies GuzoMarket guarantees transactions or that
every user is verified. Prefer concrete language describing verified
profiles, private messaging, reporting, moderation, and privacy tools.

Use **Privacy & Safety** or similarly precise language instead of broad
claims such as "Safe & Secure" when the product does not provide payment
or transaction protection.

### 55.12 Moderation data

Moderation-capable entities should support an auditable model including,
as appropriate:

``` text
status
riskScore
moderationState
moderationReason
moderatorId
reviewedAt
action
appealStatus
```

Sensitive administrative and moderation actions must be written to an
AuditLog.

### 55.13 Post-MVP sequencing

**Phase 1.5**

- Saved searches and alerts
- Map search
- Phone verification
- Seller ratings
- Richer business profiles/directory
- Event enhancements

**Phase 2+**

- Community groups and richer community features
- Paid promotions and subscriptions
- AI listing assistant
- AI search
- Advanced moderation assistance
- Recommendations
- Native mobile apps
- Marketplace payments/delivery only after dedicated product, legal,
  fraud, and operations design

### 55.14 Homepage reference corrections

The production homepage should differ from the original sample in these
ways:

- Add Community Near You so the homepage reflects the community pillar.
- Use precise trust/privacy language.
- Use Washington, DC formatting consistently.
- Do not hard-code the copyright year.
- Hide native-app download badges until native apps actually ship.
- Treat Events as a first-class destination.
- Preserve the clean white/green visual direction, strong search hero,
  category shortcuts, listing cards, business discovery, generous
  whitespace, rounded cards, and restrained shadows.

------------------------------------------------------------------------

**End of GuzoMarket Master PRD v1.1**
