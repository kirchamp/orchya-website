# Orchya Tech Limited — Website

Static site for [orchya.co.uk](https://www.orchya.co.uk), built with plain HTML/CSS/JS (no framework, no build step, no backend, no database). Hosted free on GitHub Pages.

## Structure

```
index.html         Home
services.html       7 service lines (project consulting, tech people consulting,
                    human capital consulting, digital & AI transformation,
                    product development, training & certification, events)
about.html          Company story, brand meaning, director, company details
contact.html        Contact form (Formspree) + direct details
privacy.html        Privacy policy
404.html            Custom not-found page
assets/css/style.css
assets/js/main.js
assets/img/         favicon.svg, mark.svg (logo)
assets/fonts/       Barlow Condensed (self-hosted, OFL license — see Design below)
CNAME               Custom domain for GitHub Pages
robots.txt, sitemap.xml
.well-known/security.txt   Security contact (RFC 9116)
```

## Design

The layout is inspired by the *mechanics* of F1's live-timing UI (formula1.com/en/timing/f1-live-lite) — a stacked utility/nav/live-data-strip header, diagonal stripe texture, bold condensed uppercase type, pill buttons, a single sparing accent color, and dense divider-row data panels. None of Formula 1's actual assets are used: no F1 logo, no FIA/team branding, no photography, and not their licensed typeface. Headings use **Barlow Condensed** (weights 600/700/800), an open-source (SIL Open Font License) Google Font, self-hosted under `assets/fonts/` so the site makes zero third-party requests. The header's "London Time" readout is a genuine live clock (`Intl`/`Date`, updated client-side every second), not a decorative fake.

## Local preview

No build tools needed. From this folder:

```bash
python -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080`.

## 1. Deploy to GitHub Pages

1. Push this repo to `kirchamp/orchya-website` (see git commands below).
2. On GitHub: **Settings → Pages**
   - Source: `Deploy from a branch`
   - Branch: `main` / `(root)`
3. Under **Custom domain**, enter `www.orchya.co.uk` and save (this writes/reads the `CNAME` file already in this repo).
4. Tick **Enforce HTTPS** once GitHub issues the certificate (can take up to ~24h after DNS is live).

## 2. DNS — point orchya.co.uk at GitHub Pages

You asked for extra DDoS/WAF protection, so the recommended path is **Cloudflare in front of GitHub Pages**, not GitHub Pages alone.

### Option A — Cloudflare (recommended, free tier)

1. Create a free account at cloudflare.com and "Add a site" → `orchya.co.uk`.
2. Cloudflare will scan existing DNS records, then give you **two nameservers** (e.g. `xxx.ns.cloudflare.com`).
3. Log into your domain registrar (wherever you registered orchya.co.uk) and replace the nameservers with the two Cloudflare gives you. This step is at your registrar — I can't do it for you.
4. Back in Cloudflare, add these DNS records (orange-clouded = proxied, which is what gives you DDoS/WAF protection):

   | Type  | Name | Content                  | Proxy    |
   |-------|------|---------------------------|----------|
   | A     | @    | 185.199.108.153            | Proxied  |
   | A     | @    | 185.199.109.153            | Proxied  |
   | A     | @    | 185.199.110.153            | Proxied  |
   | A     | @    | 185.199.111.153            | Proxied  |
   | CNAME | www  | kirchamp.github.io         | Proxied  |

5. **SSL/TLS** tab → set mode to **Full** (not Flexible — Flexible causes redirect loops with GitHub Pages).
6. **SSL/TLS → Edge Certificates**: turn on **Always Use HTTPS** and **Automatic HTTPS Rewrites**.
7. **Security → WAF**: the free Cloudflare Managed Ruleset is on by default — leave it on. Turn on **Bot Fight Mode** (Security → Bots) for basic bot/scraper mitigation.
8. **Rules → Transform Rules → Modify Response Header** (or a Cloudflare Worker if you want more control) — add:
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: geolocation=(), camera=(), microphone=()`

   These are the headers GitHub Pages itself can't set — Cloudflare is what makes the "no clickjacking / no MIME-sniffing / no DDoS" story actually hold at the network edge, not just in the HTML.
9. If you're ever actively under attack: **Security → Settings → Security Level → Under Attack Mode** — this puts a JS challenge in front of every visitor until things calm down.

### Option B — GitHub Pages only, no Cloudflare

At your registrar, set:

| Type  | Name | Content |
|-------|------|---------|
| A     | @    | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 |
| CNAME | www  | kirchamp.github.io |

GitHub Pages forces HTTPS and sits behind GitHub's own infrastructure (which absorbs a lot of DDoS traffic at the platform level), but you won't get a configurable WAF or custom security headers this way.

## 3. Turn on the contact form (Formspree)

The form in `contact.html` posts to `https://formspree.io/f/YOUR_FORM_ID` — that's a placeholder, it won't send anything yet.

1. Go to formspree.io and create a free account yourself (I can't create accounts on your behalf).
2. Create a new form, set the delivery email to `kiran@orchya.co.uk`.
3. Copy the form ID Formspree gives you (looks like `xayzabcd`).
4. In `contact.html`, replace `YOUR_FORM_ID` in the `<form action="...">` line with your real ID.
5. Formspree's free tier includes basic spam filtering; the form also has a honeypot field (`_gotcha`) built in for extra bot protection.

## 4. Recommended GitHub repo security settings

On `kirchamp/orchya-website` → **Settings**:

- **Settings → General → Danger Zone**: leave repo public (required for free GitHub Pages) but be mindful not to commit secrets — there are none in this codebase.
- **Security → Code security**: enable **Dependabot alerts** and **Secret scanning** (free on public repos).
- **Settings → Branches**: add a branch protection rule on `main` if you plan to have collaborators — require pull request review before merging.
- On your GitHub **account** (not repo) settings, enable **two-factor authentication** — this matters more than any repo setting for preventing someone from hijacking the site via your account.

## Security notes — what this actually protects against, honestly

- **No backend, no database** — this site can't be SQL-injected, and there's no server process to compromise. That single decision removes most of the attack surface a "hacked website" usually implies.
- **Strict CSP** (`script-src 'self'`, no inline scripts/styles, no third-party origins besides Formspree) is set via `<meta>` tag on every page — this blocks most XSS injection vectors even if someone found a way to inject markup.
- **DDoS**: a fully static site on GitHub Pages already resists most volumetric attacks because there's no expensive server-side work per request. Cloudflare (Option A) adds an actual WAF, bot mitigation, and an "Under Attack Mode" panic button in front of it.
- No system is "unhackable" — what this setup does is remove the categories of vulnerability that apply to dynamic sites (SQLi, server RCE, session hijacking) and mitigate the rest (XSS via CSP, DDoS via Cloudflare, clickjacking via `X-Frame-Options`/`frame-ancestors`).

## Updating the site

Edit the HTML/CSS files directly, then:

```bash
git add -A
git commit -m "Update site content"
git push
```

GitHub Pages redeploys automatically within a minute or two of a push to `main`.
