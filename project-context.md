# MCYJ GitHub Pages crawl discovery

## 2026-10-23

- Scope: host-root crawl discovery for independently maintained app Project Pages.
- Existing personal website and historical project files remain in place.
- Host-root robots.txt will advertise a sitemap index of verified, indexable released-app sites; unpublished and coming-soon properties are excluded.
- No external SEO code, account integration, tracking, training-crawler policy, or scheduled task is introduced.

## Implementation

- Added host-root robots.txt and sitemap-index.xml with exactly 34 currently verified public original-app sites.
- The root HTML, existing portfolio, CNAME and historical projects are unchanged.
- Project-level robots files remain compatibility hints; Google reads robots only from the host root.
- Sitemap index does not invent lastmod values; each child sitemap owns its editorial dates.
