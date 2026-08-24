# GuzoMarket — Security & Trust/Safety Specification v1.0

**Project:** GuzoMarket  
**Document:** Security & Trust/Safety Specification  
**Version:** 1.0  
**Status:** Implementation baseline  
**Source documents:** Master PRD v1.1; Information Architecture & Complete Sitemap v1.0; Database Schema & ER Specification v1.0; UI/UX Design System v1.0; API & Backend Specification v1.0  
**Initial market:** Washington, DC / Maryland / Northern Virginia (DMV)

---

## 1. Purpose

This specification defines the security, privacy, abuse-prevention, marketplace trust,
reporting, moderation, enforcement, and incident-handling requirements for GuzoMarket.

The goal is not to claim that marketplace transactions are risk-free. The goal is to
provide concrete controls that reduce abuse, protect private information, make suspicious
behavior easier to detect and report, and give moderators auditable tools for enforcement.

This document covers:

- Account security
- Verification
- Marketplace abuse
- Scam and fraud signals
- Listing/content policy
- Prohibited and restricted content
- Messaging safety
- Location and contact privacy
- Reporting
- Moderation queues
- Enforcement
- Appeals
- Business trust
- Administrative permissions
- Audit logging
- Security incidents
- Data retention principles
- AI moderation boundaries

---

## 2. Trust & Safety Principles

1. **No absolute safety claims**
   - GuzoMarket must not claim that every user, listing, business, or transaction is safe.

2. **Privacy by default**
   - Do not expose precise residential addresses, private contact details, internal risk
     signals, or moderation data by default.

3. **Layered defenses**
   - Combine verification, rate limits, reporting, blocking, moderation, audit logs,
     security controls, and user education.

4. **Proportional enforcement**
   - Enforcement should reflect severity, confidence, history, and risk.

5. **Human accountability**
   - High-impact or ambiguous moderation decisions require appropriate human review.

6. **Auditable privileged actions**
   - Sensitive moderator/admin actions must be attributable and reviewable.

7. **Clear user controls**
   - Report, block, save, privacy, and verification states must be understandable.

8. **Minimize unnecessary data**
   - Collect and retain only what is justified for product, security, legal, and
     operational needs.

---

## 3. Security Ownership

Security is a system-wide requirement.

Responsibility areas:

```text
Authentication       → account/session protection
Authorization        → object and role access
Application security → input/output and server controls
Trust & Safety       → abuse, content, scams, reports
Moderation           → review and enforcement
Privacy              → location/contact/data exposure
Operations           → incidents, audit, recovery
```

No client-side UI check is considered an authorization boundary.

---

## 4. Account Security

Required controls:

- Email verification
- Secure password hashing
- Secure session cookies
- Session expiration/revocation
- Password reset with expiring single-use tokens
- Login rate limiting
- Generic invalid-login responses
- Account suspension enforcement
- Security event logging
- Protection against cross-user object access

Future controls may include:

- Phone verification
- Multi-factor authentication
- Passkeys
- Device/session management
- Higher-assurance identity verification

---

## 5. Password Policy

Implementation should use a modern password policy emphasizing length and resistance to
common/compromised passwords rather than arbitrary complexity alone.

Requirements:

- Minimum length defined in implementation security configuration
- Maximum length to prevent resource abuse
- No plaintext storage/logging
- Strong adaptive password hashing
- Password reset invalidates reset token after use
- Sensitive password changes may require reauthentication

Exact hashing parameters should follow the selected authentication library's current
production guidance.

---

## 6. Session Security

Sessions must:

- Use secure, HTTP-only cookies in production
- Use appropriate SameSite policy
- Be revocable
- Expire
- Stop granting access when account becomes suspended/deactivated
- Never expose session secrets to client JavaScript unnecessarily

Sensitive actions may require recent authentication.

---

## 7. Account Enumeration

Registration, login, password-reset, and verification flows should avoid unnecessary
disclosure of whether a specific email/account exists.

Use neutral responses where enumeration risk is material.

---

## 8. Verification Model

Supported verification concepts:

```text
Email Verified
Phone Verified                 [Phase 1.5]
Identity Verified              [Future / risk-based]
Business Verified
```

Verification indicates only what was actually checked.

It must not imply:

- Transaction guarantee
- Background check unless one occurred
- Product authenticity
- Seller honesty
- Payment protection
- Government endorsement

---

## 9. Verification Badge Rules

Each badge must have:

- Specific label
- Defined verification type
- Verification status
- Revocation capability
- Explanation/tooltip in UI where helpful

Examples:

```text
Email Verified
Phone Verified
Business Verified
```

Avoid vague badges such as:

```text
Trusted Seller
100% Safe
Guaranteed
```

unless a future program has explicit criteria supporting those claims.

---

## 10. Business Verification

Business verification may consider:

- Verified account ownership
- Business contact verification
- Business registration evidence where appropriate
- Public business information consistency
- Manual review for higher-risk categories

Sensitive submitted documents must have restricted access and defined retention.

---

## 11. Marketplace Abuse Categories

GuzoMarket should recognize at least:

```text
Scams
Spam
Fraud / impersonation
Prohibited items
Restricted items
Counterfeit/misleading goods
Harassment
Threats
Discrimination where prohibited
Duplicate listings
Misleading descriptions
Off-platform payment pressure
Phishing / malicious links
Account takeover
Review manipulation
Business impersonation
Community abuse
```

The reporting taxonomy may expose a simpler user-facing subset.

---

## 12. Scam & Fraud Signals

Rules-based risk signals may include:

- Newly created account posting unusually high volume
- Repeated duplicate listing text
- Repeated images across unrelated listings/accounts
- Price materially inconsistent with category norms
- Rapid location changes
- Multiple reports in short period
- Suspicious external links
- Requests to move immediately off-platform
- Repeated payment/deposit language associated with scams
- High-volume unsolicited messaging
- Contact information patterns reused across many accounts
- Previously removed content being reposted

Signals are indicators, not automatic proof of wrongdoing.

---

## 13. Risk Scoring

If a risk score is implemented:

```text
riskScore
moderationState
riskReasons
```

must remain internal.

Rules:

- Never expose risk score to normal users.
- Risk score may prioritize review.
- A single heuristic should not trigger irreversible high-impact enforcement without
  appropriate confidence/policy.
- Risk inputs and outcomes should be auditable enough for internal review.

---

## 14. Listing Content Policy

Listings must:

- Describe the actual item/service/property being offered
- Use accurate category
- Use materially accurate price/terms
- Use images the poster is authorized to use
- Avoid deceptive identity/contact claims
- Avoid prohibited content
- Avoid malicious links
- Follow applicable location/category rules

GuzoMarket may remove, reject, limit, or require changes to noncompliant listings.

---

## 15. Prohibited Content Framework

The production policy should prohibit categories that create unacceptable legal, safety,
fraud, or platform risk.

At minimum, the policy framework should include review of:

- Illegal goods/services
- Stolen property
- Fraudulent financial schemes
- Counterfeit goods
- Exploitative or abusive sexual content
- Human trafficking/exploitation
- Illegal drugs and controlled substances
- Dangerous weapons or regulated weapons where prohibited
- Hazardous materials
- Fake identification/documents
- Malware, stolen accounts, credentials, or hacking services
- Personal data sold without authorization
- Hate/extremist material where prohibited by platform policy/law
- Animal/wildlife trade where unlawful
- Illegal gambling
- Any service whose primary purpose is unlawful activity

Before launch, a jurisdiction-aware legal/policy review should turn this framework into a
public-facing prohibited-content policy.

---

## 16. Restricted Content

Some categories may be legal only under conditions and should be:

- Disallowed entirely for MVP, or
- Allowed only after dedicated compliance design.

Examples may include regulated products, age-restricted goods, financial products,
health-related services, and other jurisdiction-sensitive categories.

Default MVP rule:

**If a category requires specialized compliance that GuzoMarket has not implemented,
do not launch that category.**

---

## 17. Housing Safety & Fairness

Housing content requires category-specific policy and legal review.

The system should support:

- Reporting discriminatory or unlawful housing language
- Moderation of prohibited discriminatory content
- Clear location privacy
- Avoidance of sensitive-profile targeting features unless legally reviewed

Do not infer protected characteristics for ranking or moderation.

---

## 18. Jobs Safety & Fairness

Job postings should prohibit:

- Fraudulent employers
- Upfront-payment scams
- Misleading compensation
- Unlawful discriminatory requirements
- Requests for sensitive credentials through unsafe channels
- Pyramid/financial schemes presented as ordinary employment

Job moderation should have category-specific report reasons.

---

## 19. Services Safety

Service listings may require additional scrutiny when involving:

- Childcare
- Transportation
- Legal/financial services
- Home access
- Health-adjacent services

GuzoMarket should avoid implying professional licensing verification unless it actually
performs that verification.

---

## 20. Location Privacy

Consumer listings should generally expose:

```text
City
Neighborhood
Approximate area
```

not precise residential address.

Internal database may retain:

```text
latitude
longitude
postal code
normalized location
```

for search/ranking, while public DTOs intentionally reduce precision.

---

## 21. Exact Address Rules

Exact public addresses may be appropriate for:

- Verified businesses
- Public venues
- Events
- Certain commercial listings

Exact residential address should not be public by default.

The UI must distinguish:

```text
Public display location
Internal search/geocoded location
```

---

## 22. Browser Geolocation

Precise browser geolocation:

- Requires explicit browser/user permission
- Must have a clear product purpose
- Must not be silently published
- Should be transformed into appropriate marketplace/location context

Declining geolocation must not block normal browsing.

---

## 23. Contact Privacy

Private by default:

- User email
- User phone
- Residential address

Preferred buyer/seller communication:

```text
GuzoMarket in-app messaging
```

Business public contact details may be exposed only when intentionally configured as public.

---

## 24. Messaging Safety

Messaging must support:

- Block user
- Report message/conversation
- Contextual listing/business/job reference
- Rate limits
- Attachment validation
- Spam controls
- Suspicious-link handling

Future controls may include:

- Link warnings
- Scam-language nudges
- Automated spam classification
- Message request limits

---

## 25. Messaging Safety Guidance

Contextual guidance may warn users to:

- Keep communication in GuzoMarket when possible
- Be cautious with deposits/prepayments
- Verify high-value items in person where appropriate
- Avoid sharing passwords or authentication codes
- Be cautious with suspicious external links
- Report pressure, threats, or suspicious behavior

Safety copy should be practical rather than alarmist.

---

## 26. Blocking

Blocking must be enforced server-side.

A blocked relationship should prevent supported interaction according to policy, including
new direct messages.

The blocked user should not receive a notification saying who blocked them.

Moderators may still access relevant records for abuse investigation.

---

## 27. Reporting Entry Points

Report controls should be available from relevant surfaces:

```text
Listing detail
Public profile
Business detail
Event detail
Community post
Conversation/message
```

The report action should be discoverable but not visually dominate normal interactions.

---

## 28. User-Facing Report Reasons

Recommended simplified taxonomy:

```text
Scam or fraud
Spam
Prohibited item/service
Misleading information
Harassment or threats
Counterfeit
Discrimination
Duplicate content
Something else
```

Context-specific categories may add:

```text
Housing discrimination
Job scam
Business impersonation
Unsafe message/link
```

---

## 29. Report Submission

Report input:

```text
subjectType
subjectId
reason
optional description
```

Rules:

- Validate target.
- Rate limit reports.
- Prevent obvious duplicate spam.
- Preserve reporter privacy from reported user.
- Return neutral confirmation.
- Do not reveal moderator identity/notes.

---

## 30. Report Priority

Internal priority:

```text
LOW
NORMAL
HIGH
URGENT
```

Possible urgency signals:

- Credible threat
- Exploitation
- Immediate physical safety concern
- Widespread scam campaign
- Account compromise
- High-volume malicious activity

Priority affects queue ordering, not guilt determination.

---

## 31. Moderation Workflow

```text
Report / automated signal
        ↓
OPEN
        ↓
TRIAGED
        ↓
UNDER_REVIEW
        ↓
RESOLVED or DISMISSED
```

Moderators should see:

- Subject content
- Report reason
- Reporter-provided context
- Relevant account/content history
- Previous moderation actions
- Allowed enforcement actions
- Audit history

---

## 32. Content Moderation States

Approved backend moderation states:

```text
NOT_REVIEWED
AUTO_CLEARED
NEEDS_REVIEW
UNDER_REVIEW
APPROVED
REJECTED
REMOVED
```

Content lifecycle status and moderation state are related but not identical.

---

## 33. Enforcement Ladder

Potential enforcement:

```text
No action
Content correction request
Warning
Content rejection
Content removal
Temporary posting restriction
Temporary messaging restriction
Account suspension
Business suspension
Permanent account removal
```

Not every violation should use every step.

Severe abuse may skip lower levels.

---

## 34. Enforcement Factors

Moderators may consider:

- Severity
- Credibility
- User intent where knowable
- Harm/risk
- Repeat history
- Scale
- Evasion
- Account compromise possibility
- Legal requirements
- Available evidence

Protected/sensitive characteristics must not be used improperly in enforcement decisions.

---

## 35. Moderator Notes

Moderator notes are internal.

They must:

- Be factual
- Avoid unnecessary sensitive information
- Avoid insults/speculation
- Identify relevant policy/reason
- Be retained according to moderation policy

They must never be exposed in public APIs.

---

## 36. Appeals

A future/launch-appropriate appeal flow should support high-impact actions such as:

- Listing rejection/removal
- Business suspension
- Account suspension

Appeal record concept:

```text
id
userId
targetType
targetId
moderationActionId
reason
status
reviewedByUserId
reviewedAt
resolutionNotes
createdAt
```

Suggested statuses:

```text
SUBMITTED
UNDER_REVIEW
UPHELD
OVERTURNED
CLOSED
```

If appeals are not fully automated in MVP, support must still have a documented path for
reviewing disputed enforcement.

---

## 37. Moderator Permissions

Moderators should have only the capabilities needed for review/enforcement.

Potential moderator permissions:

- View moderation queue
- View relevant reports
- Review content
- Warn
- Reject/remove
- Suspend within defined scope
- Restore where authorized
- Add internal notes

Moderators should not automatically have access to:

- Production secrets
- Database administration
- Billing configuration
- Arbitrary user password/session data

---

## 38. Admin Permissions

Admin capabilities may include:

- User management
- Category/location administration
- Moderator management
- Business verification
- Escalated enforcement
- Audit review

Super Admin capabilities should be extremely limited and assigned only when necessary.

---

## 39. Privileged Action Confirmation

High-impact actions should require:

- Explicit action selection
- Reason
- Confirmation
- Audit record

Examples:

- Permanent removal
- Account suspension
- Verification revocation
- Role changes
- Business ownership changes

Avoid one-click destructive admin actions.

---

## 40. Audit Requirements

Audit events include:

- Role granted/revoked
- User suspended/restored
- Verification granted/revoked
- Listing removed/restored
- Business suspended/restored
- Report resolved/dismissed
- Category/location administrative changes
- Sensitive privacy/security operations

Audit log should record:

```text
actor
action
target
timestamp
safe metadata
```

Audit logs should be append-only during normal operations.

---

## 41. Security Logging

Operational security logs may include:

- Repeated failed login attempts
- Password reset requests
- Verification changes
- Suspicious upload failures
- Rate-limit triggers
- Authorization failures
- Admin access failures
- Background security-job failures

Do not log plaintext credentials, authentication tokens, or unnecessary private content.

---

## 42. Rate Limiting

Required abuse-sensitive rate limits:

```text
Registration
Login
Password reset
Verification resend
Listing creation
Listing publishing
Messaging
Report submission
Upload authorization
Community posting
Admin sensitive actions
```

Production rate-limit storage should be shared across application instances.

---

## 43. Spam Controls

Potential spam controls:

- Per-account posting limits
- Per-account messaging limits
- Duplicate content detection
- Link/domain heuristics
- New-account restrictions
- Progressive trust limits
- Temporary cooldowns
- Report-driven review

Controls should be configurable rather than hard-coded throughout UI logic.

---

## 44. Upload Security

Uploads must validate:

- File signature
- MIME type
- Size
- Dimensions where relevant
- Ownership/context
- Safe storage key
- Content type
- Attachment count

Do not allow arbitrary executable content.

Do not trust filename extensions.

Strip sensitive image metadata where appropriate.

---

## 45. Link Security

User-submitted links:

- Validate scheme
- Reject script/data schemes where unsafe
- Sanitize rendered content
- Consider warnings for suspicious/external links
- Use safe external-link attributes
- Rate limit malicious-link posting

Repeated malicious links may trigger account review.

---

## 46. XSS & Content Rendering

Default:

```text
User content = plain text
```

If rich text is later introduced:

- Use strict allowlist sanitization
- Sanitize server-side
- Reject scripts/events/unsafe embeds
- Test stored and reflected XSS cases

---

## 47. CSRF

Cookie-authenticated mutations require appropriate CSRF/same-origin protection.

Sensitive operations must never be performed through GET requests.

---

## 48. Authorization / IDOR Protection

Every object operation must verify both:

```text
authenticated identity
permission for the specific object
```

Never assume that possession of a listing ID, conversation ID, report ID, or business ID
grants access.

Test cross-user access explicitly.

---

## 49. Secrets & Infrastructure

Secrets must:

- Stay outside source control
- Use environment/secret management
- Be separated by environment
- Be rotated when compromised
- Use least-privilege provider credentials

Production database/storage credentials must not be exposed to browsers.

---

## 50. Dependency Security

Implementation process should include:

- Lockfiles
- Dependency updates
- Vulnerability scanning
- Review of critical auth/upload/payment dependencies
- Removal of unused packages
- Avoidance of unmaintained security-critical packages

---

## 51. Business Trust Signals

Business pages may display only supported trust signals:

```text
Business Verified
Review rating
Review count
Joined/created date where useful
Public contact information
Location
```

Do not create fake trust through decorative badges.

---

## 52. Review Integrity

When reviews launch:

Prohibit:

- Self-review
- Purchased/fabricated reviews
- Coordinated manipulation
- Threats in exchange for review changes
- Review spam

Provide:

- Report review
- Business response
- Moderation
- Auditability

---

## 53. Featured Content Integrity

Featured content must not be confused with:

- Verification
- Safety certification
- Organic popularity

If paid:

```text
Featured
Sponsored
Promoted
```

should be used according to the final monetization design and applicable disclosure rules.

---

## 54. Child/Teen Considerations

The current source documents do not define a child/teen marketplace strategy.

Before allowing minors to create accounts or transact, GuzoMarket requires a dedicated
age, privacy, safety, legal, and moderation design.

Until then, implementation should avoid silently assuming that unrestricted minor
participation is approved.

---

## 55. Sensitive Personal Data

Avoid collecting sensitive personal data unless required by an approved feature.

Identity/business verification data should be:

- Minimized
- Access-controlled
- Encrypted in transit and at rest through provider/infrastructure controls
- Retained only as long as justified
- Excluded from general analytics/logging

---

## 56. Data Retention Principles

A detailed legal retention schedule is not defined by the current source documents.

Product architecture should nevertheless support separate retention treatment for:

```text
Account data
Listings/content
Messages
Reports
Moderation actions
Audit logs
Security logs
Verification data
Uploads
```

Do not implement permanent retention by accident.

Final retention periods require legal/privacy review before production launch.

---

## 57. Account Deletion

Account deletion should:

- Be available through account settings/support flow
- Require authentication
- Clearly explain material consequences
- Revoke active sessions
- Remove/anonymize public profile as policy requires
- Preserve records that must remain for security, fraud, moderation, or legal reasons
- Avoid leaving active public listings accidentally

Deletion is not equivalent to immediate physical deletion of every database record.

---

## 58. Data Export / Privacy Requests

The current product documents do not define jurisdiction-specific privacy-request workflows.

Before production expansion, GuzoMarket should define operational handling for applicable:

- Access requests
- Correction requests
- Deletion requests
- Data export
- Privacy inquiries

Implementation should keep data sufficiently structured to support these processes.

---

## 59. Security Incident Categories

Operational incident handling should recognize:

```text
Account takeover campaign
Credential exposure
Unauthorized admin access
Database exposure
Storage exposure
Malicious upload campaign
Spam/scam campaign
Messaging abuse campaign
Provider compromise
Data integrity incident
Service availability attack
```

---

## 60. Incident Response Process

High-level process:

```text
Detect
→ Triage
→ Contain
→ Investigate
→ Remediate
→ Recover
→ Notify/escalate where required
→ Post-incident review
```

For each material incident, record:

- Timeline
- Systems affected
- Data affected
- Root cause
- Containment
- Remediation
- Follow-up actions

Legal notification obligations require jurisdiction-specific review.

---

## 61. Emergency Moderation Controls

Authorized admins should be able to:

- Suspend an abusive account
- Remove high-risk content
- Disable a compromised business
- Restrict posting/messaging where supported
- Disable a category if a systemic issue emerges

Emergency actions must still create audit records.

---

## 62. Abuse Evasion

Repeated attempts to evade enforcement may justify escalation.

Signals:

- Recreated accounts
- Reposted removed content
- Reused contact details
- Reused suspicious images
- Repeated malicious links

Evasion signals should be handled carefully to avoid false linkage between unrelated users.

---

## 63. AI Moderation Boundary

AI may later assist with:

- Listing quality suggestions
- Spam detection
- Duplicate detection
- Suspicious-link classification
- Risk prioritization
- Moderator summaries

AI must not be treated as an unquestionable source of truth.

---

## 64. High-Impact AI Decisions

AI should not autonomously make irreversible high-impact decisions such as:

- Permanent account removal
- Identity fraud determination
- Serious criminal accusation
- Permanent business removal

without an approved policy, confidence controls, and appropriate human review.

---

## 65. AI Explainability & Audit

If AI influences moderation:

Record enough information to understand:

```text
model/service version
input category/signals
output classification/score
decision threshold
human action
timestamp
```

Do not store unnecessary raw sensitive content merely for AI auditing.

---

## 66. AI Privacy

Do not send unnecessary private data to AI providers.

Before using third-party AI for messages, identity data, reports, or sensitive content,
define:

- Data sent
- Provider retention
- Training/use policy
- Access controls
- User disclosure where required
- Deletion/retention behavior

---

## 67. Trust Copy Guidelines

Preferred:

```text
Verified profiles
Business Verified
Privacy & Safety
Report this listing
Block user
Keep conversations in GuzoMarket
```

Avoid:

```text
100% safe
Guaranteed seller
Secure transaction
Fraud-free
Every user verified
```

unless a future product genuinely supports the claim.

---

## 68. User Safety Center

Help architecture should include:

```text
/help/safety
```

Recommended content:

- Marketplace scam awareness
- Meeting/exchange guidance
- Payment/deposit caution
- Messaging safety
- Account security
- Reporting/blocking instructions
- Housing/job scam guidance
- Business verification explanation

---

## 69. Marketplace Transaction Boundary

MVP facilitates discovery and communication.

MVP does **not** provide:

- Buyer-to-seller payment processing
- Escrow
- Delivery fulfillment
- Transaction guarantee

Safety language and UI must reflect this boundary.

---

## 70. Security Testing Requirements

Before production:

- Authentication tests
- Authorization/IDOR tests
- CSRF review
- XSS tests
- Upload bypass tests
- Rate-limit tests
- Session revocation tests
- Admin permission tests
- Report/moderation tests
- Block bypass tests
- Public DTO privacy tests
- Dependency/security scan
- Secret exposure scan

---

## 71. Abuse Testing Scenarios

Test:

1. User attempts to edit another seller's listing.
2. User attempts to read another user's conversation.
3. Blocked user attempts to send a message.
4. Suspended user attempts to post.
5. User repeatedly submits duplicate reports.
6. User uploads disguised executable content.
7. User posts malicious URL.
8. User attempts to publish exact private address unintentionally.
9. Moderator performs unauthorized admin-only action.
10. Removed listing is reposted.
11. Public API attempts to expose internal moderation fields.
12. Business staff attempts owner-only operation.

---

## 72. Launch Trust & Safety Minimum

Before public MVP launch, GuzoMarket must have:

```text
Email verification
Secure authentication
Listing reporting
User blocking
Message reporting
Rate limiting
Listing moderation states
Moderator queue
Content removal
User suspension
Audit logs
Private location handling
Upload validation
Prohibited-content policy
Safety help page
Admin permission separation
Incident-response ownership
```

---

## 73. Phase 1.5 Trust & Safety

Recommended:

```text
Phone verification
Seller ratings
Business reviews
Saved-search abuse controls
Improved spam detection
Map/location privacy refinement
More detailed moderation analytics
Appeal workflow
```

---

## 74. Phase 2+ Trust & Safety

Potential:

```text
Identity verification
Advanced fraud detection
AI-assisted moderation
Community-group moderation
Reputation systems
Business compliance workflows
Payment fraud controls if payments launch
Native-app abuse controls
```

---

## 75. Acceptance Criteria

Trust & Safety foundation is complete when:

- Public/private location behavior is enforced server-side.
- Private contact details are excluded from public DTOs.
- Report and block controls work end-to-end.
- Moderators have a functioning queue.
- Enforcement actions are permission-checked.
- High-impact admin/moderation actions are audited.
- Suspended users cannot bypass restrictions.
- Upload and link validation are enforced.
- Rate limits cover high-abuse endpoints.
- Verification badges represent specific verified facts.
- Safety copy avoids transaction guarantees.
- Prohibited-content rules are available to users.
- Security tests cover cross-user access.
- Incident ownership/process is documented.
- AI is not used for unreviewed irreversible high-impact moderation.

---

## 76. Decisions Locked by This Document

Unless superseded later:

1. GuzoMarket does not claim that transactions are guaranteed safe.
2. Precise residential location is private by default.
3. Private email/phone are not public profile fields by default.
4. Verification badges describe only the verified fact.
5. Reporting and blocking are MVP requirements.
6. Moderation and lifecycle status are separate concepts.
7. High-impact privileged actions are audited.
8. Rules-based risk signals may prioritize review but are not proof.
9. Restricted categories requiring unimplemented compliance do not launch by default.
10. AI may assist moderation later but does not autonomously make irreversible high-impact
    decisions without approved safeguards.
11. Buyer-to-seller payments, escrow, and delivery remain outside MVP.
12. Final legal retention periods and jurisdiction-specific policy details require dedicated
    legal/privacy review before production launch.

---

## 77. Next Deliverable

After approval of this Security & Trust/Safety Specification, create:

**GuzoMarket Page-by-Page UX & Functional Specification v1.0**

That document should turn the approved sitemap and design system into exact implementation
requirements for each major screen:

- Homepage
- Search results
- Listing detail
- Post listing flow
- Authentication
- Public profile
- Account/profile
- My Listings
- Saved
- Messaging
- Notifications
- Jobs
- Businesses
- Events
- Community
- Admin/moderation

For every screen it should define:

```text
Purpose
Route
Access
Desktop layout
Mobile layout
Components
Data requirements
Primary/secondary actions
Loading state
Empty state
Error state
Permissions
Analytics
SEO
Acceptance criteria
```

---

**End of GuzoMarket Security & Trust/Safety Specification v1.0**
