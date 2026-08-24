# GuzoMarket — Admin Dashboard Specification v1.0

**Project:** GuzoMarket  
**Document:** Admin Dashboard Specification  
**Version:** 1.0  
**Status:** Implementation baseline  
**Initial market:** Washington, DC / Maryland / Northern Virginia (DMV)

## 1. Purpose

This specification defines the internal GuzoMarket administration and moderation
experience in implementation-level detail. It expands the admin requirements already
established by the Master PRD, sitemap, database specification, UI/UX system, backend
specification, Security & Trust/Safety specification, and Page-by-Page UX specification.

The admin product must enable authorized staff to operate the marketplace without giving
every internal user unrestricted power.

Primary responsibilities:

- Marketplace health monitoring
- User management
- Listing review and enforcement
- Report triage and investigation
- Category administration
- Location administration
- Business and event oversight as those modules launch
- Verification operations
- Audit review
- Trust & Safety escalation

---

# PART I — ADMIN PRINCIPLES

## 2. Core Principles

1. **Least privilege** — access is based on role and explicit permission.
2. **Auditability** — privileged actions create durable audit records.
3. **Safe defaults** — destructive actions require deliberate confirmation.
4. **Context before action** — reviewers see relevant evidence and history before enforcement.
5. **No silent enforcement** — meaningful moderation actions record actor, reason, target, and time.
6. **Privacy-aware operations** — internal access does not mean unlimited exposure of user data.
7. **Server authority** — UI visibility is never the authorization boundary.
8. **Operational efficiency** — common review work should require few clicks without weakening safeguards.

---

# PART II — ROLES & PERMISSIONS

## 3. Internal Roles

### Moderator

Primary purpose: review reports and marketplace content.

May:
- Access moderation dashboard
- Search/view users as needed for investigations
- Review listings
- Review reports
- Add internal moderation notes
- Approve/reject content where permitted
- Remove content where permitted
- Apply limited suspensions where policy permits
- Restore content where permitted

May not automatically:
- Change system configuration
- Manage administrator roles
- Access infrastructure secrets
- Modify audit records
- Perform ownership transfers
- Perform Super Admin actions

### Admin

Includes Moderator capabilities plus approved operational administration.

May:
- Manage users
- Manage categories
- Manage locations
- Manage business verification/oversight
- Manage event oversight
- Apply broader account enforcement
- Review audit history
- Manage selected marketplace configuration

### Super Admin

Highly restricted role.

May:
- Manage privileged roles
- Perform exceptional account/system administration
- Resolve escalations beyond normal Admin authority
- Access highly sensitive operational controls when explicitly required

Super Admin status should never be used simply for convenience.

---

## 4. Permission Model

Use explicit permission checks rather than role-name checks throughout business logic.

Example permissions:

```text
admin.dashboard.view

users.view
users.suspend
users.restore
users.verify
users.change_role

listings.view
listings.approve
listings.reject
listings.remove
listings.restore

reports.view
reports.assign
reports.resolve
reports.dismiss

categories.view
categories.manage

locations.view
locations.manage

businesses.view
businesses.manage
businesses.verify

events.view
events.manage

audit.view

moderation.notes.create
moderation.actions.view
```

Roles map to permission sets.

Backend policies remain authoritative.

---

## 5. Sensitive Permission Separation

The following should be tightly restricted:

```text
users.change_role
permanent account removal
Super Admin assignment
business ownership transfer
verification override
audit access
security-sensitive account operations
```

Where practical, particularly sensitive operations should require recent authentication.

---

# PART III — ADMIN INFORMATION ARCHITECTURE

## 6. Admin Routes

```text
/admin
/admin/dashboard

/admin/users
/admin/users/{id}

/admin/listings
/admin/listings/{id}

/admin/reports
/admin/reports/{id}

/admin/categories
/admin/categories/{id}

/admin/locations
/admin/locations/{id}

/admin/businesses
/admin/businesses/{id}

/admin/events
/admin/events/{id}

/admin/audit-log

/admin/settings        [restricted/future]
```

Unauthorized users must not gain information about internal records through these routes.

---

## 7. Admin Navigation

Desktop sidebar:

```text
GuzoMarket Admin

Dashboard

Moderation
  Reports
  Listings

Marketplace
  Users
  Categories
  Locations
  Businesses
  Events

Operations
  Audit Log

Account
  Return to GuzoMarket
```

Navigation items are permission-driven.

Do not display unusable privileged controls merely to disable them.

---

## 8. Admin Shell

Desktop-first layout:

```text
┌──────────────────┬─────────────────────────────────────────┐
│ Admin Sidebar    │ Top Utility Bar                         │
│                  ├─────────────────────────────────────────┤
│                  │                                         │
│                  │ Main Admin Content                      │
│                  │                                         │
└──────────────────┴─────────────────────────────────────────┘
```

Top utility bar may include:

```text
Page title
Global admin search
Notifications/system alerts where implemented
Current staff account
Return to marketplace
```

Mobile/tablet admin should remain usable, but operational desktop workflows are the primary
design target.

---

# PART IV — DASHBOARD

## 9. Admin Dashboard

**Route:** `/admin/dashboard`

### Purpose

Provide an immediate view of marketplace activity and work requiring attention.

### Primary metric cards

MVP:

```text
Total Users
New Users
Active Listings
New Listings
Open Reports
Reports Awaiting Review
```

When modules are active:

```text
Active Businesses
Upcoming Events
Active Jobs
```

When monetization launches:

```text
Revenue
Active Promotions
Subscriptions
```

Do not display fake or placeholder business metrics in production.

---

## 10. Dashboard Time Ranges

Supported:

```text
Today
7 days
30 days
Custom range [later]
```

Metric labels must make their time basis clear.

Example:

```text
New Listings — Last 7 Days
```

---

## 11. Dashboard Operational Panels

Recommended:

### Moderation Queue

```text
Urgent reports
High-priority reports
Oldest unreviewed reports
```

### Marketplace Activity

```text
Listings created
Listings published
Listings removed
Users registered
```

### Report Trends

```text
Scam/fraud
Spam
Prohibited content
Harassment
Other
```

### System Attention

Examples:

```text
Failed background jobs
Email delivery degradation
Unusual report volume
Upload failures
```

Only expose system-health information supported by the implementation.

---

## 12. Dashboard Actions

Quick actions may include:

```text
Review Reports
Review Pending Listings
Search User
Manage Categories
Manage Locations
```

Avoid destructive actions directly from dashboard metric cards.

---

# PART V — SHARED ADMIN TABLE PATTERN

## 13. Table Anatomy

Admin tables should consistently support:

```text
Page title
Description
Search
Filters
Optional saved/admin view later
Result count
Table
Pagination
Row action menu
```

Use sticky headers where helpful.

---

## 14. Search

Search should support the fields appropriate to each entity.

Examples:

Users:
```text
display name
email
public ID
```

Listings:
```text
title
listing ID
seller
```

Reports:
```text
report ID
subject ID
reporter
```

Search input must be server validated and bounded.

---

## 15. Filters

Filter behavior:

- URL-addressable where practical
- Multiple filters can combine
- Active filters are visible
- Clear All is available
- Filter values persist through pagination
- Empty results distinguish "no data" from "no matches"

---

## 16. Sorting

Sortable columns must visibly indicate state.

Default sort should reflect operational priority.

Examples:

Reports:
```text
priority DESC
createdAt ASC within priority
```

Users:
```text
createdAt DESC
```

Listings:
```text
createdAt DESC
```

---

## 17. Pagination

Admin tables may use cursor or offset pagination depending on data behavior.

Rules:

- Bounded page sizes
- No unbounded exports through ordinary table routes
- Preserve search/filter state
- Show current result context

---

## 18. Row Actions

Use a predictable trailing action menu.

Example:

```text
View
Open public page
Review
Suspend
Restore
```

High-impact actions should not be placed as easy-to-misclick inline icons.

---

# PART VI — USER MANAGEMENT

## 19. Users List

**Route:** `/admin/users`

### Columns

```text
User
Email
Verification
Role
Account Status
Listings
Joined
Actions
```

Optional authorized indicators:

```text
Open report count
Recent moderation state
```

Do not expose raw internal risk scores in broad tables unless operationally justified.

---

## 20. User Filters

```text
Account status
Role
Email verified
Business membership
Joined date
Has open reports
```

Potential account statuses:

```text
ACTIVE
SUSPENDED
DEACTIVATED
DELETED/ANONYMIZED representation as applicable
```

---

## 21. User Detail

**Route:** `/admin/users/{id}`

### Header

```text
Avatar
Display Name
Email
Public ID
Account status
Role
Joined date
Verification badges
```

### Sections

```text
Overview
Listings
Reports
Moderation History
Business Memberships
Security Summary where permitted
Audit Activity where permitted
```

---

## 22. User Overview

Show only operationally relevant information.

May include:

```text
General profile
Email verification
Phone verification [future]
Listing counts
Message/account activity summary
Business memberships
Recent reports
Account status
```

Avoid exposing private message bodies outside a legitimate moderation context.

---

## 23. User Actions

Depending on permission:

```text
View Public Profile
Suspend Account
Restore Account
Revoke Verification
Review Business Membership
Change Role [highly restricted]
```

### Suspension dialog

Must require:

```text
Reason code
Internal note where appropriate
Duration if temporary
Confirmation
```

Example warning:

```text
Suspending this account may prevent posting and messaging and may affect public content.
```

---

## 24. Role Change Safeguard

Changing an internal role requires:

1. Explicit permission.
2. Current target role.
3. New role.
4. Reason.
5. Confirmation.
6. Audit event.

Super Admin assignment should have the strongest available safeguard.

---

# PART VII — LISTING MANAGEMENT

## 25. Listings List

**Route:** `/admin/listings`

### Columns

```text
Listing
Seller
Category
Location
Lifecycle Status
Moderation State
Reports
Published/Created
Actions
```

### Filters

```text
Lifecycle status
Moderation state
Category
Location
Date
Has reports
Featured
Seller/account status
```

---

## 26. Listing Detail

**Route:** `/admin/listings/{id}`

### Layout

```text
Listing Preview                     Action Panel
Seller Context                      Current State
Structured Attributes               Available Actions
Images                              Reason / Notes
Location
Reports
Moderation History
Audit Timeline
```

---

## 27. Listing Review Context

Moderator should be able to inspect:

```text
Title
Description
Price
Category
Dynamic attributes
Images
Public location
Seller account age
Seller verification
Seller listing history
Associated reports
Previous moderation actions
Relevant risk signals where authorized
```

Internal signals must be visually distinguished from user-visible facts.

---

## 28. Listing Actions

Possible actions:

```text
Approve
Reject
Request Correction [if implemented]
Remove
Restore
Suspend visibility
Mark for further review
```

Only state-valid actions should be offered.

Backend rejects illegal transitions even if UI is manipulated.

---

## 29. Listing Enforcement Dialog

Require:

```text
Action
Reason code
Optional/required internal note based on action
User-facing explanation template where applicable
Confirmation
```

The dialog should explain impact before confirmation.

---

## 30. Listing History

Display chronological events:

```text
Draft created
Submitted
Approved
Published
Edited
Reported
Reviewed
Removed
Restored
Expired
Archived
Completed
```

Where possible, distinguish:

```text
User action
System action
Moderator action
```

---

# PART VIII — REPORTS & MODERATION

## 31. Reports Queue

**Route:** `/admin/reports`

### Purpose

Serve as the primary Trust & Safety work queue.

### Columns

```text
Priority
Reason
Subject
Subject Type
Reporter
Assigned To
Status
Age
Actions
```

### Default ordering

Operational recommendation:

```text
URGENT first
HIGH next
NORMAL next
LOW last
Oldest first within priority
```

---

## 32. Report Filters

```text
Status
Priority
Reason
Subject type
Assigned moderator
Unassigned only
Created date
```

Statuses:

```text
OPEN
TRIAGED
UNDER_REVIEW
RESOLVED
DISMISSED
```

---

## 33. Report Assignment

Moderators may:

```text
Assign to self
Assign to another permitted moderator
Unassign where allowed
```

Assignment changes should be recorded.

Assignment is not itself a moderation decision.

---

## 34. Report Detail

**Route:** `/admin/reports/{id}`

### Layout

```text
Report Summary                    Review Panel
Reporter Context                  Assignment
Subject Snapshot                  Status
Evidence                          Moderation Actions
Related Reports                   Resolve / Dismiss
Account/Content History
Internal Notes
Audit Timeline
```

---

## 35. Report Summary

Show:

```text
Report ID
Created
Priority
Reason
Description
Subject type
Subject ID
Current status
Assigned moderator
```

Reporter identity is internal and must never be revealed to the reported user through the
normal enforcement flow.

---

## 36. Evidence Panel

Evidence may include:

```text
Reported listing/post/message
Relevant images
User-provided report details
Relevant contextual messages where policy permits
Related reports
Historical enforcement
```

Access to private content must be purpose-limited.

---

## 37. Internal Notes

Moderators can add factual internal notes.

Notes should record:

```text
Author
Timestamp
Text
```

Rules:

- Not user visible
- Not editable after submission where feasible; corrections can be appended
- No unnecessary sensitive data
- No insults/speculation
- Searchable only if operationally required and access-controlled

---

## 38. Moderation Actions from Report

Depending on subject:

```text
No Action
Warn User
Reject Listing
Remove Listing
Restore Listing
Restrict Posting
Restrict Messaging
Suspend Account
Suspend Business
Escalate
```

A report may be resolved without enforcement.

---

## 39. Resolve Report

Resolution requires:

```text
Resolution category
Optional/required note
Linked moderation action where applicable
Confirmation
```

Examples:

```text
Violation confirmed — action taken
No violation
Duplicate report
Insufficient evidence
Resolved through another report
```

---

## 40. Dismiss Report

Dismissal should not silently delete the report.

It remains part of moderation history with actor, reason, and timestamp.

---

# PART IX — ESCALATION

## 41. Escalation Workflow

Use escalation when:

- Moderator lacks permission
- Policy is ambiguous
- Potential legal/security issue exists
- High-impact permanent enforcement is considered
- Coordinated abuse is suspected
- Staff conflict-of-interest exists
- Sensitive verification issue exists

Possible state:

```text
ESCALATED
```

if supported by the data model; otherwise represent escalation through assignment/priority
until schema is extended.

---

## 42. Escalation Record

Recommended future structure:

```text
reportId
escalatedBy
escalatedTo
reason
createdAt
resolvedAt
resolution
```

Do not silently invent this database entity if it is not yet in the approved schema;
add it through a controlled schema revision when implementation requires it.

---

# PART X — BULK ACTION SAFEGUARDS

## 43. Bulk Actions

Bulk actions should be limited in MVP.

Reason: bulk moderation can create high-impact mistakes.

Potential safe bulk operations:

```text
Assign selected reports
Change report priority
Export selected IDs for authorized operational use
```

Avoid initial bulk support for:

```text
Suspend users
Delete users
Remove listings
Change roles
Grant verification
```

unless a dedicated safeguard is designed.

---

## 44. Bulk Confirmation

Any high-impact bulk operation introduced later must show:

```text
Number of affected records
Action
Scope
Reason
Irreversibility/recovery information
Explicit confirmation
```

and create appropriate audit records.

---

# PART XI — CATEGORIES

## 45. Category Management

**Route:** `/admin/categories`

### Tree view

Show hierarchy:

```text
Buy & Sell
  Electronics
  Furniture
  Clothing
Cars
  Cars
  Motorcycles
Housing
  Apartments
  Rooms
```

### Actions

```text
Create
Edit
Disable
Enable
Reorder
Manage Attribute Definitions
```

---

## 46. Category Edit

Fields may include:

```text
Name
Slug
Parent
Description
Icon identifier
Sort order
Active state
SEO metadata where supported
```

Do not hard-delete categories referenced by historical content.

---

## 47. Dynamic Attribute Management

For each category, admins may manage approved attribute definitions.

Examples:

Cars:

```text
Make
Model
Year
Mileage
Transmission
Fuel Type
```

Housing:

```text
Bedrooms
Bathrooms
Property Type
Rent Period
Furnished
```

Changes must consider existing ListingAttributeValue records.

---

# PART XII — LOCATIONS

## 48. Location Management

**Route:** `/admin/locations`

### Hierarchy

Support normalized hierarchy such as:

```text
United States
  District of Columbia
    Washington
  Maryland
    Silver Spring
    Bethesda
  Virginia
    Arlington
    Alexandria
```

Marketplace region assignment can associate locations with DMV.

---

## 49. Location Actions

```text
Create
Edit
Enable/Disable
Set parent
Assign marketplace region
Adjust public label
```

Do not destructively delete referenced locations.

---

## 50. Location Detail

Show:

```text
Name
Type
Parent
Region membership
Active state
Referenced listing count where practical
Normalized slug
Geographic metadata where approved
```

Precise private user coordinates do not belong in broad location administration views.

---

# PART XIII — BUSINESSES & VERIFICATION

## 51. Business Administration

**Route:** `/admin/businesses`

When business features are enabled, support:

```text
Search businesses
Filter by verification/status/category/location
View profile
Review members
Verify/revoke verification
Suspend/restore
Review reports
```

---

## 52. Business Verification Review

Show only required evidence and operational context.

Decision options:

```text
Approve Verification
Reject Verification
Request More Information [if workflow exists]
Revoke Verification
```

A Business Verified badge means only the defined business verification checks were
completed.

---

## 53. Verification Safeguards

Verification action requires:

```text
Authorized permission
Evidence/context
Reason
Confirmation
Audit record
```

Verification must be revocable.

---

# PART XIV — EVENTS

## 54. Event Administration

**Route:** `/admin/events`

When enabled:

```text
Search
Filter by status/date/location
View event
Review reports
Cancel/remove where authorized
Restore where appropriate
```

Cancellation and moderation removal are distinct states.

---

# PART XV — AUDIT LOG

## 55. Audit Log

**Route:** `/admin/audit-log`

### Purpose

Provide immutable operational history for privileged actions.

### Columns

```text
Timestamp
Actor
Action
Target Type
Target
Metadata Summary
```

### Filters

```text
Actor
Action
Target type
Date range
```

---

## 56. Audit Detail

Where a detail view is useful, show:

```text
Timestamp
Actor
Action
Target
Previous state summary where recorded
New state summary where recorded
Reason
Request/correlation identifier where available
Safe metadata
```

Audit UI is read-only.

---

## 57. Audit Privacy

Audit logs must not become a secondary store for excessive sensitive content.

Prefer identifiers and concise safe metadata over copying:

- Message bodies
- Password/security tokens
- Identity documents
- Full private user data

---

# PART XVI — ADMIN SEARCH

## 58. Global Admin Search

Future/optional MVP utility.

May search authorized entity types:

```text
Users
Listings
Reports
Businesses
```

Results must respect current staff permissions.

Search must not expose inaccessible records through titles, counts, or suggestions.

---

# PART XVII — EMPTY, LOADING & ERROR STATES

## 59. Loading

Use:

- Table skeletons
- Panel skeletons
- Button-level pending states
- Non-blocking detail loading where practical

Avoid full-screen spinners for ordinary admin navigation.

---

## 60. Empty States

Reports:

```text
No reports match these filters.
```

Users:

```text
No users match your search.
```

Pending listings:

```text
No listings are waiting for review.
```

Distinguish an empty system from filtered zero results.

---

## 61. Errors

Operational errors should say what failed and what can be done next.

Example:

```text
We couldn’t apply this moderation action.
The record may have changed. Refresh and review the current state before trying again.
```

Do not show raw database/framework errors.

---

## 62. Concurrent Review

Moderation records may change while another moderator is viewing them.

Before high-impact action:

- Re-check current state server-side.
- Reject stale illegal transitions.
- Return a conflict response where appropriate.
- Prompt reviewer to refresh current context.

---

# PART XVIII — SECURITY REQUIREMENTS

## 63. Admin Authentication

Admin routes require:

```text
Authenticated account
Active account status
Authorized role/permissions
Valid session
```

Future higher-risk deployments should consider MFA/passkeys for privileged staff.

---

## 64. Admin Authorization

Authorization is checked:

1. At route/page boundary.
2. At server action/API boundary.
3. At domain policy/service boundary where appropriate.

Never rely on hidden buttons.

---

## 65. Sensitive Data Access

Staff access to sensitive data must be:

- Necessary for assigned function
- Permission-controlled
- Logged where appropriate
- Minimized in broad list views

---

## 66. Destructive Action Design

For actions such as suspension/removal:

- Use text-labeled controls
- Require reason
- Explain impact
- Confirm
- Disable while submitting
- Prevent double submission
- Show success/failure clearly

---

## 67. Session & Browser Safety

Admin surfaces should:

- Avoid sensitive data in URL query strings where possible
- Avoid caching private admin pages publicly
- Prevent indexing
- Use secure session behavior
- Use appropriate security headers
- Avoid leaking data into client logs/analytics

---

# PART XIX — ADMIN ANALYTICS

## 68. Internal Product Events

Useful events:

```text
admin_dashboard_viewed
admin_user_viewed
admin_listing_viewed
admin_report_viewed
report_assigned
report_resolved
report_dismissed
moderation_action_taken
user_suspended
user_restored
listing_removed
listing_restored
business_verification_changed
category_updated
location_updated
```

Analytics do not replace AuditLog.

---

## 69. Audit vs Analytics

**Audit log:** security/operational record of privileged actions.

**Analytics:** aggregate product/operations measurement.

Never depend on analytics as the authoritative record of enforcement.

---

# PART XX — ACCESSIBILITY & RESPONSIVENESS

## 70. Accessibility

Admin UI must meet the same WCAG 2.2 AA target as consumer UI.

Required:

- Keyboard table/action navigation
- Visible focus
- Accessible menus/dialogs
- Proper labels
- Error associations
- Semantic headings
- Non-color-only status indicators
- Screen-reader-accessible loading/action feedback

---

## 71. Responsive Admin

Desktop is primary.

Tablet/mobile should allow urgent operations such as:

```text
Review report
View user/listing
Add note
Take permitted moderation action
```

Complex category/location configuration may reasonably be optimized for larger screens,
but must not become inaccessible.

---

# PART XXI — TESTING

## 72. Permission Tests

Test every privileged action with:

```text
Guest
Normal user
Moderator
Admin
Super Admin
```

Expected access must be explicit.

---

## 73. Critical Admin Test Scenarios

1. Normal user attempts `/admin`.
2. Moderator attempts Admin-only role change.
3. Moderator removes a permitted listing.
4. Moderator attempts an illegal listing transition.
5. Two moderators act on the same report.
6. Admin suspends user with reason.
7. Suspended user loses prohibited capabilities.
8. Admin restores user.
9. Category is disabled without orphaning listings.
10. Referenced location cannot be destructively removed.
11. Business verification change creates audit record.
12. Audit record cannot be edited through ordinary UI.
13. Reporter identity is not exposed to reported user.
14. Internal notes remain private.
15. Admin API rejects forged role/permission data from client.

---

# PART XXII — MVP ADMIN SCOPE

## 74. Required for MVP

```text
Admin shell
Permission model
Dashboard
Users list/detail
Listings list/detail
Reports queue/detail
Moderation actions
Internal notes
User suspension/restoration
Listing approval/removal/restoration
Category management
Location management
Audit log
Loading/empty/error states
Admin security tests
```

---

## 75. Phase 1.5

```text
Business administration
Business verification
Event administration
Improved moderation analytics
Appeals workflow
More advanced admin search
Saved operational views
```

---

## 76. Phase 2+

```text
Advanced fraud operations
AI-assisted moderation
Community group moderation
Advanced reputation operations
Payment/dispute operations if marketplace payments launch
More sophisticated case management
```

---

# PART XXIII — ACCEPTANCE CRITERIA

## 77. Admin Foundation Acceptance

The admin system is ready when:

- Unauthorized users cannot access admin routes or data.
- Moderator/Admin/Super Admin permissions are server enforced.
- Reports can be searched, filtered, assigned, reviewed, resolved, and dismissed.
- Listing moderation supports legal state transitions only.
- User suspension/restoration works end-to-end.
- High-impact actions require reasons and confirmation.
- Internal notes remain private.
- Reporter identity is protected.
- Category and location administration preserve referenced data.
- Audit records are created for privileged actions.
- Audit records are read-only in normal admin UI.
- Admin tables support loading, empty, filtered-empty, and error states.
- Concurrent/stale moderation actions fail safely.
- Sensitive information is minimized.
- Critical permission and moderation workflows are tested.

---

# PART XXIV — LOCKED DECISIONS

## 78. Decisions Locked by This Document

Unless superseded through a controlled revision:

1. Admin access uses explicit permissions, not UI-only role checks.
2. Moderator, Admin, and Super Admin remain distinct.
3. Super Admin is highly restricted.
4. Reports are the primary moderation work queue.
5. High-impact actions require reason, confirmation, and audit.
6. Reporter identity is private from reported users.
7. Internal moderator notes are never public.
8. Audit history is read-only through normal application behavior.
9. Bulk destructive enforcement is not part of initial MVP.
10. Category/location records referenced by content are not casually hard-deleted.
11. Verification is a specific factual status, not a generic trust guarantee.
12. Admin analytics and AuditLog remain separate systems.
13. Backend permission and lifecycle checks remain authoritative even when UI disables actions.
14. Admin mobile supports urgent review, while complex configuration remains desktop-first.

---

## 79. Next Deliverable

After approval of this Admin Dashboard Specification, create:

**GuzoMarket AI Feature Specification v1.0**

It should define a restrained, staged AI strategy including:

- AI listing-writing assistance
- Photo/category assistance
- Natural-language marketplace search
- Search query parsing
- Scam/spam risk assistance
- Duplicate-content detection
- Moderator summaries
- Business content assistance
- User disclosure
- Privacy boundaries
- Human review requirements
- Provider abstraction
- Cost controls
- Rate limits
- Prompt/version management
- Evaluation metrics
- Failure/fallback behavior
- Phase 1.5 vs Phase 2+ rollout
- Explicit features that must not use autonomous AI

After the AI specification:

1. **GuzoMarket Codex Master Instructions**
2. **GuzoMarket Sequential Codex Build Prompts**

---

**End of GuzoMarket Admin Dashboard Specification v1.0**
