# GuzoMarket — AI Feature Specification v1.0

**Project:** GuzoMarket
**Version:** 1.0
**Status:** Implementation baseline
**Initial market:** Washington, DC / Maryland / Northern Virginia (DMV)

## 1. Purpose

This specification defines where AI may add useful capabilities to GuzoMarket, where it
must remain assistive rather than authoritative, and how AI features should be introduced
without weakening marketplace trust, privacy, reliability, cost control, or maintainability.

AI is not required for the core marketplace to function. Browse, deterministic search,
listing creation, saving, messaging, reporting, moderation, and administration must
continue to work when an AI provider is unavailable.

## 2. Core Principles

1. AI assists; it does not impersonate certainty.
2. Users remain responsible for listings and communications they publish.
3. High-impact moderation remains policy-driven and human-accountable.
4. AI output is untrusted input until validated.
5. Send only the minimum necessary data to model providers.
6. Every AI feature has a non-AI fallback.
7. Control latency, rate limits, and cost.
8. AI features must solve a specific product problem.
9. Generated content is editable before publication.
10. Provider-specific logic stays behind an application abstraction.

## 3. Rollout

**MVP:** No launch-critical dependency on generative AI.

**Phase 1.5:** Listing writing, title/description improvement, category suggestion,
structured attribute extraction, natural-language search parsing, moderator summaries,
and carefully evaluated spam/scam/duplicate assistance.

**Phase 2+:** Photo-assisted posting, semantic search, business writing assistance,
advanced fraud assistance, multilingual assistance, community moderation assistance,
and semantic recommendations.

## 4. Architecture

Recommended flow:

```text
UI
→ Server Action / API
→ Feature-specific AI Service
→ AI Gateway / Provider Adapter
→ Configured Model Provider
```

Conceptual provider interface:

```text
generateText()
generateStructuredOutput()
classify()
analyzeImage() [when enabled]
embed() [when enabled]
```

Feature services:

```text
ListingAIService
SearchAIService
ModerationAIService
BusinessAIService
```

Each service minimizes inputs, selects the approved model/task, validates outputs, applies
timeouts and rate limits, records safe metrics, enforces feature flags, and returns an
application DTO.

## 5. Configuration & Feature Flags

Central configuration should include feature status, provider, model identifier, prompt
version, timeout, maximum input/output, rate limit, budget threshold, and fallback behavior.

Example flags:

```text
AI_LISTING_WRITER
AI_CATEGORY_SUGGESTION
AI_ATTRIBUTE_EXTRACTION
AI_SEARCH_PARSE
AI_MODERATION_SUMMARY
AI_SPAM_RISK
AI_IMAGE_ASSIST
```

A single feature must be disableable without disabling GuzoMarket.

## 6. Listing Writing Assistant

Entry point: `/post/details`.

Potential controls:

```text
Help me write this
Improve title
Improve description
Make this clearer
```

Use only relevant listing fields. Do not automatically include private email/phone,
security data, moderation history, private messages, or exact residential address.

Structured response may include:

```text
suggestedTitle
suggestedDescription
suggestedCategoryId
suggestedAttributes
warnings
```

The seller can Accept, Edit, Reject, Regenerate within limits, or continue without AI.
AI never silently overwrites or publishes content.

AI must not invent material facts such as condition, model, mileage, dimensions, warranty,
ownership history, availability, address, price, licensing, or credentials.

## 7. Category & Attribute Assistance

Category suggestion may use title, description, and later approved image analysis.

Output:

```text
categoryId
confidence
alternativeCategoryIds
```

IDs must come from an active category allowlist supplied by the application.

Attribute extraction may convert seller text into category-defined fields. Every result is
validated against `CategoryAttributeDefinition` and remains visible/editable before publish.

## 8. Photo-Assisted Posting

**Phase 2+.**

Possible uses:

- Suggest category/item type
- Suggest visible attributes
- Draft title/description from visible facts
- Detect low-quality photos
- Assist duplicate-image detection

Image AI must not claim authenticity, working condition, ownership, accident history, or
other facts not reasonably established by an image.

## 9. Natural-Language Search

Example input:

```text
cheap used toyota under 10k near arlington
```

AI may parse it into a validated intent:

```text
query = toyota
category = cars
priceMax = 10000
condition = used
location = Arlington, VA
```

Flow:

```text
Natural-language input
→ AI parser
→ validated SearchIntent DTO
→ standard search service
→ results
```

Conceptual DTO:

```text
query
categoryId
locationId
radius
priceMin
priceMax
condition
sort
domainSpecificFilters
confidence
```

Users should see interpreted filters and be able to remove them. Unknown values are
dropped. If AI parsing fails, use the original text as a normal keyword search.

## 10. Semantic Search & Recommendations

**Phase 2+.**

Embeddings may supplement PostgreSQL search for semantic matching and similar listings.
Structured filters and keyword search remain important.

Recommendations must not infer or target sensitive characteristics. Use appropriate
marketplace context such as current listing, query, category, approximate location, and
saved categories subject to privacy policy.

## 11. Trust & Safety AI

AI may assist with:

```text
Spam classification
Scam-signal detection
Duplicate content
Suspicious link classification
Report summarization
Policy-relevant classification
Queue prioritization
```

Conceptual internal output:

```text
classification
riskLevel
confidence
policySignals
summary
recommendedReviewPriority
```

AI output is an internal signal, not proof.

AI must not autonomously make irreversible high-impact decisions such as permanent account
removal, serious fraud/criminal determinations, identity fraud determinations, permanent
business removal, or permanent marketplace bans without a separately approved policy and
human-review design.

Reversible low-risk automation may later place content into `NEEDS_REVIEW`, hold suspicious
content, rate-limit repetitive behavior, or flag duplicates after evaluation.

## 12. Scam & Duplicate Assistance

Potential scam signals include suspicious payment language, off-platform pressure,
malicious URLs, duplicate text, unusual posting volume, repeated contact patterns, and
similarity to removed content.

Duplicate detection may combine normalized text similarity, image perceptual similarity,
structured attributes, embeddings, and contact-pattern signals.

Do not expose internal thresholds publicly.

## 13. Moderator AI Assistance

AI may summarize reports, relevant content, supplied history, and policy-relevant facts.

The admin UI should label this clearly as an **AI-assisted summary** and remind reviewers
to inspect source evidence.

AI may later provide a **Suggested review action**, but not a required action. Permission,
policy, lifecycle, and human accountability remain authoritative.

## 14. Business & Community AI

**Phase 2+.**

Businesses may receive writing help for About sections, service descriptions, and listing
copy, but AI must not invent licenses, certifications, awards, years in business, ratings,
verification status, hours, or addresses.

Community AI may assist with spam/duplicate detection, moderator summaries, and optional
writing assistance. GuzoMarket should not become an AI-generated local-content feed.

## 15. Translation

**Phase 2+.**

Potential translation assistance for listings, messages by user action, business
descriptions, and moderation review.

Original text remains accessible for high-impact moderation. Machine translation is not
treated as infallible.

## 16. Privacy

Before every model call, determine the minimum data needed.

Private message history should not be broadly sent to AI. Approved moderation use must be
limited to relevant context, purpose-controlled, access-controlled, and consistent with
provider retention policy.

Identity documents and sensitive verification evidence are excluded from general AI
features. Any future identity-related AI requires separate security/privacy review.

Before production use, document each provider's transmitted data, retention, training/use
policy, security controls, deletion behavior, and relevant processing settings.

## 17. User Disclosure & Control

Use clear labels such as:

```text
AI suggestion
Improve with AI
AI-assisted summary
```

For seller content, show:

```text
Review the suggestion and make sure the details are accurate before publishing.
```

Do not anthropomorphize AI as an independent authority.

## 18. Prompt Management

Prompts are versioned in code/configuration:

```text
listing_writer_v1
category_classifier_v1
search_parser_v1
moderation_summary_v1
```

Each defines purpose, input schema, output schema, model class, safety constraints,
input/output limits, and fallback.

Material prompt changes follow:

```text
Change → Test → Evaluate → Version → Deploy → Monitor
```

User-provided text is untrusted data and cannot override application policy.

## 19. Structured Output & Validation

Prefer structured outputs for machine-consumed AI features.

Every response is:

```text
Schema validated
Enum validated
ID validated
Range validated
Length validated
Policy/permission validated where relevant
```

Invalid output triggers fallback.

## 20. Rate Limits & Cost Controls

AI endpoints need dedicated limits by user, feature, and where appropriate IP/account trust.

Support:

- Input/token limits
- Output limits
- Lower-cost models for simple tasks
- Safe caching
- Daily/monthly budget monitoring
- Kill switches
- Timeouts
- Concurrency limits

Do not automatically use the largest model for every task.

Exact provider/model identifiers remain configurable and are selected at implementation
time based on current capabilities.

## 21. Latency & Failure UX

AI should not block unrelated form work. Preserve original content and show bounded pending
states.

On timeout:

```text
AI suggestion is unavailable right now.
You can continue without it.
```

Fallbacks:

```text
Listing writer → manual editing
Category AI → manual category selection
Search parser → keyword search
Moderator summary → source evidence
Image assist → normal photo upload
```

Malformed AI output is rejected, optionally retried once when appropriate, then falls back.

## 22. Caching

Possible safe candidates include repeated non-sensitive search-intent parsing, category
assistance, and embeddings for public listings.

Never allow personalized/sensitive AI cache entries to cross users. Cache keys include all
relevant context.

## 23. Observability

Operational metrics:

```text
Requests by feature
Success rate
Fallback rate
Timeout rate
Validation failure rate
Latency
Estimated cost
Provider errors
User acceptance/rejection where relevant
```

Do not broadly log raw sensitive prompts.

Product metrics should measure whether AI actually improves listing completion, search
quality, moderator efficiency, and related workflows.

## 24. Evaluation

Every AI feature requires an evaluation set before broad release.

Listing evaluation:

```text
Factual preservation
Clarity
Unsupported claims
Policy violations
Category correctness
Attribute correctness
```

Search evaluation:

```text
Intent accuracy
Location accuracy
Price extraction
Category extraction
Filter precision
Fallback behavior
```

Moderation evaluation:

```text
Precision
Recall
False positives
False negatives
Policy alignment
Language/category variation
```

Material prompt/model changes require regression evaluation.

## 25. Security

AI endpoints require authentication/authorization where applicable, rate limiting, input
validation, output validation, CSRF protection where applicable, timeouts, and abuse
controls.

Provider keys stay server-side.

Protect against prompt spam, cost exhaustion, oversized inputs, repeated regeneration,
malicious content, attempts to reveal internal prompts, and attempts to turn product AI
endpoints into unrestricted general-purpose model access.

System-prompt secrecy is not a security boundary.

## 26. AI Operations Controls

Authorized operations staff should eventually see feature status, provider/model
configuration reference, volume, errors, estimated spend, and feature health.

Secrets never appear in admin UI.

Each AI feature requires a rapid kill switch. Normal deterministic functionality continues
when the feature is disabled.

## 27. Explicit Autonomous-AI Boundaries

Without a future approved specification, AI must not autonomously:

```text
Transfer money
Approve marketplace payments
Issue refunds
Transfer business ownership
Change staff roles
Grant Super Admin
Permanently ban users
Make criminal determinations
Verify identity
Publish exact private locations
Send private messages pretending to be the user
Accept legal terms for the user
Delete audit history
Override authorization
```

## 28. Recommended Phase 1.5 Order

1. **Listing title/description assistance** — clear value, low risk, human confirmation.
2. **Category suggestion** — improves organization with structured user-confirmed output.
3. **Attribute extraction** — reduces posting friction and improves search data.
4. **Search query interpretation** — improves discovery with deterministic fallback.
5. **Moderator report summaries** — reduces reading time while preserving human decisions.
6. **Spam/scam and duplicate assistance** — introduced later because evaluation and
   false-positive risks are higher.

## 29. Acceptance Criteria

### AI platform

- Calls are server-side.
- Provider logic is abstracted.
- Features are independently flaggable.
- Inputs are minimized.
- Structured outputs are validated.
- Timeouts/rate limits exist.
- Cost metrics are available.
- Deterministic fallbacks exist.
- Sensitive prompts are not broadly logged.
- Provider secrets stay server-side.
- Prompt versions are controlled.

### Listing assistant

- User explicitly requests assistance.
- Original content is preserved.
- Suggestion is editable.
- User decides whether to apply it.
- Material facts are not intentionally invented.
- Publishing still runs normal validation.
- AI failure does not block posting.

### Search AI

- Natural language becomes validated SearchIntent.
- Unknown filters are dropped.
- Interpreted filters are visible/removable.
- Standard search executes final query.
- Failure falls back to keyword search.

### Moderation AI

- Output is assistive/internal.
- Source evidence remains available.
- Human reviewer controls high-impact decisions.
- Evaluation includes false positives/negatives.
- AI cannot bypass permission/state rules.
- Feature can be independently disabled.

## 30. Locked Decisions

Unless superseded through controlled revision:

1. AI is not required for core marketplace operation.
2. Initial AI features prioritize seller and search assistance.
3. Generated listing content is never silently published.
4. Sellers review AI-assisted content.
5. AI output is validated as untrusted input.
6. Provider credentials remain server-side.
7. Provider logic is abstracted behind application services.
8. Every AI feature has a deterministic fallback.
9. Natural-language search produces validated structured intent before normal search.
10. Moderation AI is assistive and does not constitute proof.
11. Irreversible high-impact moderation remains human-accountable.
12. Private data is minimized before model calls.
13. Identity/verification documents are excluded from general AI workflows.
14. AI has dedicated rate limits and cost controls.
15. Prompts are versioned and evaluated.
16. Material model/provider changes require regression evaluation.
17. AI features can be independently disabled.
18. Exact model identifiers remain implementation configuration rather than permanent
    product assumptions.

## 31. Next Deliverable

The specification set now covers:

```text
Master PRD
Information Architecture & Sitemap
Database Schema & ER Specification
UI/UX Design System
API & Backend Specification
Security & Trust/Safety Specification
Page-by-Page UX & Functional Specification
Admin Dashboard Specification
AI Feature Specification
```

Next create **GuzoMarket Codex Master Instructions v1.0**, defining:

- Source-of-truth hierarchy
- Product constraints
- Technology stack
- Repository architecture
- Coding standards and naming
- Database and migration rules
- API/server-action rules
- Authentication and authorization
- UI/responsive/accessibility rules
- Security and Trust & Safety
- Testing
- Logging/analytics
- AI implementation boundaries
- Environment variables
- Seed data
- Definition of Done
- Ambiguity handling
- Prohibited implementation shortcuts
- Required verification before declaring work complete

Then create **GuzoMarket Sequential Codex Build Prompts v1.0** to break implementation into
controlled, dependency-aware stages.

---

**End of GuzoMarket AI Feature Specification v1.0**
