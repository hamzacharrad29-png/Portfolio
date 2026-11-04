(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* Theme: remember the visitor's preference and mirror it to accessibility labels. */
  const themeButton = $('#theme-toggle');
  const root = document.documentElement;

  function applyTheme(theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = next;
    if (themeButton) {
      themeButton.setAttribute('aria-pressed', String(next === 'dark'));
      themeButton.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      themeButton.setAttribute('title', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    try { localStorage.setItem('portfolio-theme', next); } catch (_) {}
  }

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
    applyTheme(root.dataset.theme || 'light');
  }

  /* Small-screen navigation: button, Escape, outside click, and link selection. */
  const nav = $('#main-nav');
  const navButton = $('#nav-toggle');

  function setMenu(open) {
    if (!nav || !navButton) return;
    nav.classList.toggle('is-open', open);
    navButton.setAttribute('aria-expanded', String(open));
    navButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }

  if (nav && navButton) {
    navButton.addEventListener('click', () => setMenu(navButton.getAttribute('aria-expanded') !== 'true'));
    $$('a', nav).forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') setMenu(false);
    });
    document.addEventListener('click', event => {
      if (nav.classList.contains('is-open') && !nav.contains(event.target) && !navButton.contains(event.target)) {
        setMenu(false);
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) setMenu(false);
    }, { passive: true });
  }

  /* Mark the section currently in view in the primary navigation. */
  const sectionLinks = $$('.main-nav a[href^="#"]');
  const observedSections = sectionLinks
    .map(link => $(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-current', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-28% 0px -58% 0px', threshold: 0 });
    observedSections.forEach(section => observer.observe(section));
  }

  /* Back-to-top control. */
  const toTop = $('#to-top');
  if (toTop) {
    const updateToTop = () => toTop.classList.toggle('is-visible', window.scrollY > 620);
    window.addEventListener('scroll', updateToTop, { passive: true });
    updateToTop();
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* Project filters and search share a single filtering function. */
  const projectCards = $$('.project-card');
  const projectSearch = $('#project-search');
  const projectFilters = $$('[data-filter]');
  const noProjects = $('#no-projects');
  const projectStatus = $('#project-count-status');
  let activeProjectFilter = 'all';

  function updateProjectFilters() {
    const query = projectSearch ? projectSearch.value.trim().toLocaleLowerCase() : '';
    let visibleCount = 0;

    projectCards.forEach(card => {
      const matchesCategory = activeProjectFilter === 'all' || card.dataset.category === activeProjectFilter;
      const searchableText = `${card.dataset.search || ''} ${card.textContent || ''}`.toLocaleLowerCase();
      const matchesQuery = !query || searchableText.includes(query);
      const visible = matchesCategory && matchesQuery;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (noProjects) noProjects.hidden = visibleCount > 0 || projectCards.length === 0;
    if (projectStatus) projectStatus.textContent = `${visibleCount} project${visibleCount === 1 ? '' : 's'} shown`;
  }

  projectFilters.forEach(button => {
    button.addEventListener('click', () => {
      activeProjectFilter = button.dataset.filter || 'all';
      projectFilters.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateProjectFilters();
    });
  });
  if (projectSearch) projectSearch.addEventListener('input', updateProjectFilters);

  /* Skills can jump to projects and search by their exact technology label. */
  const skillTabs = $$('[data-skill-filter]');
  const skillCards = $$('.skill-card');
  skillTabs.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.skillFilter || 'all';
      skillTabs.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      skillCards.forEach(card => {
        card.hidden = !(category === 'all' || card.dataset.skillCat === category);
      });
    });
  });

  $$('.skill-tag[data-skill-query]').forEach(button => {
    button.addEventListener('click', () => {
      if (!projectSearch) return;
      projectSearch.value = button.dataset.skillQuery || '';
      activeProjectFilter = 'all';
      projectFilters.forEach(item => {
        const active = item.dataset.filter === 'all';
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateProjectFilters();
      const projectSection = $('#projects');
      if (projectSection) projectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      projectSearch.focus({ preventScroll: true });
    });
  });

  /* CV PDF preview. A direct download link remains available without JavaScript. */
  const cvDialog = $('#cv-modal');
  const cvFrame = $('#cv-frame');
  $$('[data-open-cv]').forEach(button => {
    button.addEventListener('click', () => {
      if (!cvDialog) return;
      const source = button.dataset.src;
      if (!source) return;
      const title = $('#cv-title');
      const download = $('#cv-download');
      const newTab = $('#cv-newtab');
      if (title) title.textContent = button.dataset.title || 'CV preview';
      if (download) download.href = source;
      if (newTab) newTab.href = source;
      // Phones/tablets and browsers without a built-in PDF viewer cannot show a
      // PDF inside an iframe, so open the file directly instead.
      const noInlinePdf = navigator.pdfViewerEnabled === false ||
        window.matchMedia('(max-width: 700px), (hover: none) and (pointer: coarse)').matches;
      if (noInlinePdf || typeof cvDialog.showModal !== 'function') {
        window.open(source, '_blank', 'noopener');
        return;
      }
      if (cvFrame && cvFrame.getAttribute('src') !== source) cvFrame.setAttribute('src', source);
      cvDialog.showModal();
    });
  });

  /* Certificate preview is only initialized when credentials exist. */
  const certDialog = $('#cert-modal');
  if (certDialog) {
    $$('[data-cert-open]').forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.certification-card');
        if (!card) return;
        const data = card.dataset;
        const title = $('#cert-title');
        const meta = $('#cert-meta');
        const description = $('#cert-desc');
        const image = $('#cert-img');
        const verify = $('#cert-verify');
        if (title) title.textContent = data.title || 'Credential';
        if (meta) meta.textContent = [data.issuer, data.date].filter(Boolean).join(' · ');
        if (description) description.textContent = data.desc || '';
        if (image) {
          if (data.img) {
            image.src = data.img;
            image.alt = data.title || 'Certificate';
            image.hidden = false;
          } else {
            image.hidden = true;
            image.removeAttribute('src');
          }
        }
        if (verify) {
          if (data.verify) {
            verify.href = data.verify;
            verify.hidden = false;
          } else {
            verify.hidden = true;
          }
        }
        if (typeof certDialog.showModal === 'function') certDialog.showModal();
      });
    });
  }

  /* Shared dialog close controls and click-outside behavior. */
  $$('dialog.preview-modal').forEach(dialog => {
    $$('[data-close]', dialog).forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  });

  /* Public GitHub repositories.
     The page ships with static repository cards, so visitors always see something.
     When the public GitHub API is reachable, those cards are replaced with live data.
     Responses are cached for the browser session because the unauthenticated API
     allows only 60 requests per hour per visitor IP. Content is rendered with
     textContent to keep API data safe. */
  const GH_CACHE_KEY = 'portfolio-gh-repos-v2';
  // Repositories that should never appear in the GitHub section (case-insensitive).
  const GH_HIDDEN_REPOS = ['portfolio'];
  const GH_CACHE_TTL = 30 * 60 * 1000;

  function readGitHubCache(user) {
    try {
      const cached = JSON.parse(sessionStorage.getItem(GH_CACHE_KEY) || 'null');
      if (cached && cached.user === user && Date.now() - cached.time < GH_CACHE_TTL && Array.isArray(cached.repos)) return cached.repos;
    } catch (_) {}
    return null;
  }

  function writeGitHubCache(user, repos) {
    try { sessionStorage.setItem(GH_CACHE_KEY, JSON.stringify({ user, time: Date.now(), repos })); } catch (_) {}
  }

  function renderRepositories(grid, repositories) {
    const fragment = document.createDocumentFragment();
    repositories.forEach(repo => {
      const link = document.createElement('a');
      link.className = 'github-card';
      link.href = repo.html_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      const top = document.createElement('div');
      top.className = 'github-card-top';
      const language = document.createElement('span');
      language.className = 'github-language';
      language.textContent = repo.language || 'Repository';
      const stars = document.createElement('span');
      stars.className = 'github-stars';
      stars.textContent = `★ ${repo.stargazers_count}`;
      top.append(language, stars);

      const title = document.createElement('strong');
      title.textContent = repo.name;
      title.title = repo.name;
      const description = document.createElement('p');
      description.textContent = repo.description || 'Open the repository to explore the source code.';
      link.append(top, title, description);
      fragment.append(link);
    });
    grid.replaceChildren(fragment);
  }

  async function loadGitHub() {
    const box = $('#github .github-panel');
    const grid = $('#gh-grid');
    const status = $('#gh-status');
    if (!box || !grid) return;

    const match = (box.dataset.githubUrl || '').match(/github\.com\/([A-Za-z0-9-]+)/i);
    if (!match) return;
    const user = match[1];

    let repositories = readGitHubCache(user);
    if (!repositories) {
      try {
        const controller = 'AbortController' in window ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), 8000) : null;
        const response = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`, {
          headers: { Accept: 'application/vnd.github+json' },
          signal: controller ? controller.signal : undefined
        });
        if (timer) clearTimeout(timer);
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
        repositories = (await response.json())
          .filter(repo => !repo.fork && !repo.archived && !GH_HIDDEN_REPOS.includes(String(repo.name).toLowerCase()))
          .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)))
          .slice(0, 4)
          .map(({ name, html_url, language, description, stargazers_count }) => ({ name, html_url, language, description, stargazers_count }));
        if (!repositories.length) throw new Error('No public repositories found');
        writeGitHubCache(user, repositories);
      } catch (error) {
        // Keep the static cards that ship with the page; nothing else to do.
        console.info('Showing featured repositories (live GitHub data unavailable):', error.message);
        return;
      }
    }

    renderRepositories(grid, repositories);
    if (status) status.textContent = 'A few recently active public repositories.';
  }

  /* Contact form.
     GitHub Pages cannot run server code, so messages are delivered by email through
     FormSubmit (https://formsubmit.co). Nothing is stored in a database. If the
     service cannot be reached, the visitor is offered a pre-filled email instead. */
  const contactForm = $('#contact-form');
  if (contactForm) {
    const formStatus = $('#form-status');
    const submitButton = $('.form-submit', contactForm);
    const submitLabel = submitButton ? submitButton.innerHTML : '';
    const fields = {
      name: $('#id_name'),
      email: $('#id_email'),
      message: $('#id_message')
    };

    const showStatus = (type, text, link) => {
      if (!formStatus) return;
      formStatus.className = `form-status is-${type}`;
      formStatus.textContent = text;
      if (link) {
        formStatus.append(' ');
        const anchor = document.createElement('a');
        anchor.href = link.href;
        anchor.textContent = link.label;
        formStatus.append(anchor);
      }
      formStatus.hidden = false;
    };

    const setFieldError = (input, message) => {
      if (!input) return;
      const error = document.getElementById(`error_${input.name}`);
      const wrapper = input.closest('.form-field');
      if (wrapper) wrapper.classList.toggle('has-error', Boolean(message));
      input.setAttribute('aria-invalid', String(Boolean(message)));
      if (error) {
        error.textContent = message || '';
        error.hidden = !message;
      }
    };

    const validate = () => {
      const errors = {};
      const name = fields.name.value.trim();
      const email = fields.email.value.trim();
      const message = fields.message.value.trim();
      if (!name) errors.name = 'Please enter your name.';
      if (!email) errors.email = 'Please enter your email address.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
      if (message.length < 10) errors.message = 'Please add a little more detail (at least 10 characters).';
      Object.entries(fields).forEach(([key, input]) => setFieldError(input, errors[key]));
      return errors;
    };

    // Real keystrokes/pastes prove a human is typing (bots fill fields programmatically).
    let humanTyped = false;
    contactForm.addEventListener('keydown', event => { if (event.isTrusted) humanTyped = true; });
    contactForm.addEventListener('paste', event => { if (event.isTrusted) humanTyped = true; });

    Object.values(fields).forEach(input => input && input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validate();
    }));

    const mailtoLink = () => {
      const to = contactForm.dataset.fallbackEmail || '';
      const subject = encodeURIComponent(`Portfolio enquiry from ${fields.name.value.trim()}`);
      const body = encodeURIComponent(`${fields.message.value.trim()}\n\n— ${fields.name.value.trim()} (${fields.email.value.trim()})`);
      return `mailto:${to}?subject=${subject}&body=${body}`;
    };

    contactForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (formStatus) formStatus.hidden = true;

      const errors = validate();
      const firstInvalid = Object.keys(errors).map(key => fields[key])[0];
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // Spam trap: real visitors never see this field. Bots that fill it get a
      // fake success so they learn nothing; humans are never blocked silently.
      const honeypot = contactForm.querySelector('[name="_honey"]');
      // Browser autofill can fill hidden fields; never treat a real typist as a bot.
      if (honeypot && honeypot.value && humanTyped) honeypot.value = '';
      if (honeypot && honeypot.value) {
        contactForm.reset();
        showStatus('success', 'Thanks — your message has been sent. I’ll get back to you soon.');
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
      }

      try {
        const payload = Object.fromEntries(new FormData(contactForm).entries());
        payload._replyto = payload.email;
        // Never leave the visitor waiting: give up after 20 seconds.
        const controller = 'AbortController' in window ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), 20000) : null;
        const response = await fetch(contactForm.dataset.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
          signal: controller ? controller.signal : undefined
        }).finally(() => { if (timer) clearTimeout(timer); });
        const result = await response.json().catch(() => ({}));
        const ok = response.ok && String(result.success) !== 'false';
        if (!ok) throw new Error(result.message || `Form service returned ${response.status}`);
        contactForm.reset();
        Object.values(fields).forEach(input => setFieldError(input, ''));
        showStatus('success', 'Thanks — your message has been sent. I’ll get back to you soon.');
      } catch (error) {
        console.warn('Contact form could not be delivered:', error);
        showStatus('error', 'Sorry, the message could not be sent right now.', { href: mailtoLink(), label: 'Send it by email instead ↗' });
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = submitLabel;
        }
      }
    });
  }

  /* Keep the footer year current. */
  $$('[data-current-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });

  updateProjectFilters();
  loadGitHub();
})();
