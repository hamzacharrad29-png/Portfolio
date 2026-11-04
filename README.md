# Hamza Charrad — Data & Analytics Portfolio

A static HTML/CSS/JavaScript version of my Django portfolio, ready to host for free on **GitHub Pages**.
The design, content, and interactions are the same as the Django site. It doesn't need Python, Django, or a database.

## Features

- Responsive layout (desktop, tablet, mobile) with light/dark theme (remembered per visitor)
- Sticky navigation with active-section highlighting and an accessible mobile menu
- Project search and category filters; skill tags that jump to matching projects
- Skills filter by category, with local SVG technology marks
- Live public GitHub repositories (falls back to featured repositories if the GitHub API is unavailable)
- French and English CV: in-page PDF preview on desktop, opens in a new tab on phones, direct download everywhere
- Credential preview dialog, career timeline, workflow panel
- Working contact form (delivered by email through FormSubmit; see below)
- Self-hosted fonts (no Google Fonts request), favicon, 404 page, SEO meta tags

## Project structure

```
portfolio/
├── index.html                 # The whole portfolio (single page)
├── 404.html                   # Self-contained "page not found" page
├── robots.txt
├── .nojekyll                  # Tells GitHub Pages not to run Jekyll (branch deploys)
├── .gitignore
├── README.md
├── assets/
│   ├── css/
│   │   ├── fonts.css          # @font-face rules for the self-hosted fonts
│   │   └── style.css          # All site styles
│   ├── js/
│   │   └── main.js            # All interactions (vanilla JavaScript)
│   ├── fonts/                 # DM Sans, Space Grotesk, Instrument Serif (woff2)
│   ├── images/
│   │   ├── profile/           # Portrait (WebP + JPG fallback)
│   │   └── projects/          # Project screenshots (WebP + PNG fallback)
│   ├── icons/
│   │   ├── favicon.svg
│   │   ├── apple-touch-icon.png
│   │   └── tech/              # Technology logos used in the Skills section
│   └── cv/                    # CV_Hamza_Charrad_FR.pdf, CV_Hamza_Charrad_EN.pdf
└── .github/
    └── workflows/
        └── deploy.yml         # Automatic GitHub Pages deployment from "main"
```

All paths are **relative** (`assets/...`), so the site works both at
`https://username.github.io/` and under a repository subpath such as
`https://username.github.io/repository-name/`.

## Preview locally

Any static file server works. With Python installed:

```bash
cd portfolio
python -m http.server 8000
```

Open <http://localhost:8000/>. Opening `index.html` by double-clicking also works, but the
contact form and GitHub section need a real `http://` address to behave exactly as online.

## Publish on GitHub Pages

### 1. Create the repository

1. Sign in to GitHub as **hamzacharrad29-png** and click **New repository**.
2. Choose a name, for example `portfolio`, and set it to **Public**. GitHub Pages on a free account needs a public repository.
3. Do **not** add a README, .gitignore or license, because the project already has them. Click **Create repository**.

> **Tip:** If you name the repository exactly `hamzacharrad29-png.github.io`, the site will be
> published at the root address `https://hamzacharrad29-png.github.io/` instead of a subpath.

### 2. Upload the files

**Option A — Git command line (recommended).** Run this from inside the `portfolio` folder:

```bash
git init
git add .
git commit -m "Static portfolio for GitHub Pages"
git branch -M main
git remote add origin https://github.com/hamzacharrad29-png/portfolio.git
git push -u origin main
```

(Replace `portfolio` in the URL with your repository name.)

**Option B — Upload in the browser.** On the empty repository page click **uploading an existing file**, then drag in
**the contents** of the `portfolio` folder (`index.html`, `404.html`, `assets`, …) and click **Commit changes**.
Folders whose names start with a dot (`.github`) are hidden on macOS and Windows and are often skipped by drag-and-drop. If that happens,
use **Deploy from a branch** in step 3 (it doesn't need the workflow file).

### 3. Turn on GitHub Pages

In the repository go to **Settings → Pages** (left sidebar, under "Code and automation"). Under **Build and deployment → Source**, pick one:

- **GitHub Actions** (recommended when `.github/workflows/deploy.yml` was uploaded).
  The included workflow runs automatically on every push to `main`. If you enabled Pages *after* your first push,
  open the **Actions** tab, choose **Deploy portfolio to GitHub Pages**, and click **Run workflow**.
- **Deploy from a branch**: choose **Branch: `main`** and **Folder: `/ (root)`**, then **Save**.

After a minute or two, the Pages settings show **"Your site is live at …"**. The **Actions** tab shows each deployment
with a green check when it succeeds.

### 4. Your public URL

| Repository name | Website address |
|---|---|
| `portfolio` (or any other name) | `https://hamzacharrad29-png.github.io/portfolio/` |
| `hamzacharrad29-png.github.io` | `https://hamzacharrad29-png.github.io/` |

The general format is `https://<github-username>.github.io/<repository-name>/` (all lowercase).

## Contact form — important one-time step

GitHub Pages only serves files; it can't run server code or store messages in a database. The Django
form saved messages in Django Admin. This version sends each message **by email** through
[FormSubmit](https://formsubmit.co), a free form-to-email service that needs no account.

1. After the site is live, open it and send yourself a test message through the form.
2. FormSubmit emails **hamzacharrad29@gmail.com** an activation link. Click **Activate Form**.
   Until you do this, messages are **not** delivered.
3. From then on, every message arrives in your inbox. Reply directly to answer the sender.

Optional: the activation email also gives you a random alias such as `a1b2c3d4…`. To keep your address out of the page source,
replace `hamzacharrad29@gmail.com` with that alias in the two FormSubmit URLs in `index.html` (`action="…"` and
`data-endpoint="…"` on the `<form id="contact-form">` element).

If FormSubmit is ever unreachable, the form tells the visitor and offers a pre-filled email to you instead, so no
message is silently lost. You can switch to another service, such as Formspree, Web3Forms or Getform, by changing the same two URLs.
The script sends JSON and accepts any service that answers with a 2xx status.

## Editing content

All content now lives directly in `index.html`. Django Admin is no longer used. Common edits:

| What | Where in `index.html` |
|---|---|
| Name, headline, intro | `<section id="hero">` |
| About text, location, education, languages | `<section id="about">` |
| Services and workflow steps | `<section id="services">` |
| Projects | `<article class="project-card">` blocks in `<section id="projects">` |
| Skills | `<article class="skill-card">` blocks in `<section id="skills">` |
| Experience | `<article class="experience-item">` blocks |
| Credentials | `<article class="certification-card">` blocks |
| Stats (3 projects / 16 skills / 1 internship) | `<section class="stats-section">`. Update these when you add projects or skills |
| Page title and description (SEO) | `<head>` |

**Add a project:** copy an existing `<article class="project-card">…</article>` block. Then:

- Update `data-category` (`bi`, `ml` or `dev`) and `data-search` (keywords).
- Update the title, texts, technology tags and GitHub link.
- Put the screenshot in `assets/images/projects/` and update both the `.webp` `<source>` and the `<img>` fallback, or use a single `<img>`.
- Update the "All" counter in the filter button and the Projects stat.

**Replace a CV:** overwrite the PDF in `assets/cv/` and keep the same file name.

**Social preview image (optional):** link previews need an absolute URL. Once you know your site address, add
`<meta property="og:image" content="https://hamzacharrad29-png.github.io/portfolio/assets/images/profile/hamza-charrad.jpg">`
inside `<head>`.

Every push to `main` redeploys the site automatically when GitHub Actions publishing is used.

## What changed compared with the Django version

**Converted**

- Django templates (`base.html` + `index.html`) were rendered with the real database content and turned into one static `index.html`.
- `{% static %}` and `/media/` URLs became relative `assets/...` paths.
- `{% url 'index' %}` links became in-page anchors that work under any repository subpath.
- The Django contact view (save to DB + SMTP) was replaced by FormSubmit email delivery with client-side validation.
- The `{% now "Y" %}` copyright year is now kept current by JavaScript.

**Bugs fixed**

- Project filters and search did not hide cards: `.project-card { display:flex }` overrode the `hidden` attribute. A global `[hidden]` rule fixes it.
- Horizontal scrolling on phones: long GitHub repository names stretched the GitHub panel about 70px wider than the screen.
- A stray literal `\n` in `style.css` silently disabled the mobile font sizes for project titles and descriptions.
- The typo "Pyhton" in the Euro-Cycles project meant the **Python** skill only found one of the two Python projects.
- CV preview on phones showed an empty frame, because mobile browsers can't render PDFs inside iframes. It now opens the PDF directly.
- The GitHub section was empty whenever the GitHub API rate limit was hit (60 requests per hour). It now shows featured repositories and caches API results.
- Location "tunisia" was capitalized. The project search field got an accessible label. Validator errors (empty heading, `<img>` without `src`, ARIA misuse) were fixed.

**Optimized**

- Fonts are self-hosted (no Google Fonts request; works offline and in regions where Google is blocked).
- The portrait was resized from 1179×2096 px (410 KB) to 900 px wide (72 KB WebP).
- Screenshots are served as WebP (about 70% smaller) with PNG fallbacks, and every image has explicit width/height.
- Unused legacy CSS was removed (old process grid, old CV panel, unused floating card).
- A favicon, Apple touch icon, theme-color meta tags and a self-contained 404 page were added.

**Removed (no longer needed for a static site):** `manage.py`, `config/`, `core/` (models, views, forms, migrations, admin),
`db.sqlite3`, `requirements.txt`, the `env/` and `.venv/` virtual environments, and `__pycache__/`.
Keep your original Django project if you ever want the admin panel back.
