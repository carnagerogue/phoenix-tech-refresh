# Technical Architecture

## Recommended stack

### Marketing website

- **Next.js** using the App Router
- **React**
- **TypeScript** with strict mode
- Modern CSS architecture using design tokens and reusable components
- Server-rendered / statically generated marketing pages where practical
- Accessible semantic HTML as the baseline

### Content management

Use a CMS that gives non-technical marketing staff control over service pages, industry pages, case studies, resources, leadership content, locations, and legal content without requiring code changes.

The final CMS should be selected after confirming:

- Internal editing preferences
- CRM / marketing automation platform
- Hosting preferences
- Portal/backend integration constraints
- Content approval workflow

The front end should not be tightly coupled to a CMS-specific presentation layer.

## Application boundaries

### 1. Marketing application

Public corporate website responsible for:

- Service and industry content
- SEO
- Resources
- Quote conversion
- Careers
- Compliance and sustainability content
- Public case studies

### 2. Client portal

Authenticated experience responsible for:

- Asset-level tracking
- Pickup / project status
- Certificates of destruction
- Batch certificates
- Recovered-value reporting
- Payment / buyback visibility where applicable
- ESG / impact reporting
- Pickup and service requests
- Document center
- Notifications
- Multi-site / multi-business-unit hierarchy

The portal should ideally act as a secure front-end/API layer on top of Phoenix Tech Refresh's existing asset-tracking / ERP data rather than creating a parallel source of truth.

### 3. Integration layer

Integrations may include:

- CRM
- Marketing automation
- ATS
- Analytics
- Client asset-tracking / ERP
- Identity provider / SAML SSO
- Transactional email

## Proposed source structure

```text
src/
  app/
    (marketing)/
    portal/
    api/
  components/
    ui/
    navigation/
    sections/
    forms/
    content/
    portal/
  lib/
    cms/
    analytics/
    seo/
    security/
    integrations/
  styles/
  types/
public/
  images/
  brand/
  documents/
docs/
```

This structure is directional and should be finalized when implementation begins.

## SEO requirements

- Semantic metadata per page
- Canonical URLs
- XML sitemap
- Robots configuration
- Breadcrumbs
- Structured data where appropriate:
  - Organization
  - LocalBusiness
  - Article / BlogPosting
  - BreadcrumbList
  - FAQPage where eligible
- Clean URL structure matching the approved information architecture
- Strong internal linking between resources, services, industries, compliance, and case studies

## Performance requirements

Target Core Web Vitals "Good" thresholds on primary landing pages:

- LCP < 2.5 seconds
- INP < 200 milliseconds
- CLS < 0.1

Engineering practices:

- Responsive image delivery
- CDN-backed assets
- Lazy loading below the fold
- Font optimization
- Minimal third-party JavaScript
- Route-level code splitting
- Server rendering / static generation where useful
- Performance budgets for marketing tags, chat, and trust widgets

## Accessibility

Target **WCAG 2.2 AA** for both marketing website and portal.

Required practices include:

- Keyboard-operable navigation and controls
- Visible focus treatment
- Correct landmarks and heading hierarchy
- Form labels and error associations
- Accessible modals / menus
- Color contrast compliance
- Reduced-motion support
- Meaningful image alt text
- Screen-reader-friendly tables and portal data views

## Security baseline

### Public site

- HTTPS/TLS only
- HSTS
- Content Security Policy
- Clickjacking protection
- Secure cookie configuration
- CSRF protection where applicable
- Form abuse / spam controls
- Dependency and framework patching
- Least-privilege integration credentials

### Portal

Additional requirements:

- Encryption in transit and at rest
- Strong authentication
- Optional enterprise SAML / SSO
- Role-based access control
- Tenant isolation
- Audit logging
- Rate limiting and brute-force protection
- Sensitive document access controls
- Session expiration and revocation
- Security review / penetration testing before production release

## Environments

- Development
- Staging
- Production

Staging must be separate from production and should support content review, responsive QA, accessibility testing, integration testing, and stakeholder acceptance before release.

## Deployment workflow

Recommended flow:

1. Feature branch
2. Pull request
3. Automated lint / type / test checks
4. Preview deployment
5. Review and approval
6. Merge to main
7. Production deployment through controlled release workflow

## Architectural principle

Do not let the marketing CMS, CRM, portal, or ERP become unnecessarily coupled. Phoenix Tech Refresh should be able to evolve each layer independently while keeping a consistent customer experience.
