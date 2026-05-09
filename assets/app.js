/* ═══════════════════════════════════════════════════════════
   ZenPost Blog — SPA Router + Renderer
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── Config ─────────────────────────────────────────────────
const MANIFEST_URL = '/manifest.json';
const POSTS_DIR    = '/posts/';
const SITE_ORIGIN  = 'https://zenpostapp.denisbitter.de';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/favicon-512x512.png`;
const BLOG_TITLE = 'ZenPost Blog';
const BLOG_OVERVIEW_TITLE = `${BLOG_TITLE} – Build, Learn, Ship`;

// ── State ──────────────────────────────────────────────────
let manifest = null;
let currentRoute = null;
let navigationRequestId = 0;

// ── Dropdown toggle ────────────────────────────────────────
function toggleNavDropdown(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('open');
}
// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
  }
});

// ── Marked config ──────────────────────────────────────────
if (typeof marked !== 'undefined') {
  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: true,
  });
}

// ═══════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════

function getRoute() {
  const path = window.location.pathname || '/';
  const hash = window.location.hash || '';
  if (path && path !== '/') return path;
  if (hash.startsWith('#/')) return hash.slice(1);
  return '/';
}

async function navigate(path, push = true) {
  const requestId = ++navigationRequestId;
  currentRoute = path;
  if (push) {
    window.history.pushState(null, '', path);
  }
  // Close any open dropdowns
  document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
  await render(path, requestId);
  if (requestId !== navigationRequestId) return;
  window.scrollTo({ top: 0, behavior: 'instant' });
  updateActiveNav(path);
}

window.navigate = navigate;

function updateActiveNav(path) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkPath = href;
    const isHome = (path === '/' || path === '') && (linkPath === '/' || linkPath === '');
    const isMatch = isHome || (linkPath !== '/' && path.startsWith(linkPath));
    link.classList.toggle('active', isMatch);
  });
  // Active state for Content dropdown trigger
  const contentTrigger = document.querySelector('#navDropdownContent .nav-dropdown-trigger');
  if (contentTrigger) {
    contentTrigger.classList.toggle('active', path.startsWith('/tag/') || path.startsWith('/category/') || path === '/devlog');
  }
}

// ═══════════════════════════════════════════════════════════
// MANIFEST
// ═══════════════════════════════════════════════════════════

async function loadManifest() {
  if (manifest) return manifest;
  try {
    const res = await fetch(MANIFEST_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error('manifest not found');
    manifest = await res.json();
    return manifest;
  } catch {
    manifest = { site: { title: BLOG_TITLE, subtitle: 'Build, Learn, Ship', author: 'Denis Bitter' }, posts: [] };
    return manifest;
  }
}

// ═══════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════

async function render(path, requestId = navigationRequestId) {
  const app = document.getElementById('app');
  if (!app) return;
  if (requestId !== navigationRequestId) return;

  // Home
  if (path === '/' || path === '') {
    await renderHome(app, undefined, requestId);
    return;
  }
  // Category filter (e.g. /category/devlog, /category/zenorbit)
  const categoryMatch = path.match(/^\/category\/(.+)$/);
  if (categoryMatch) {
    await renderHome(app, decodeURIComponent(categoryMatch[1]), requestId);
    return;
  }
  // Legacy tag filter (e.g. /tag/devlog, /tag/youtube, /tag/tutorial)
  const tagMatch = path.match(/^\/tag\/(.+)$/);
  if (tagMatch) {
    await renderHome(app, decodeURIComponent(tagMatch[1]), requestId);
    return;
  }
  // Legacy /devlog route
  if (path === '/devlog') {
    await renderHome(app, 'devlog', requestId);
    return;
  }
  // About
  if (path === '/about') {
    renderTemplate(app, 'tpl-about');
    document.title = `About | ${BLOG_TITLE}`;
    updateSeoMeta({
      title: document.title,
      description: 'Über den ZenPost Blog: Build, Learn, Ship mit praxisnahen Insights zu Produktentwicklung und Distribution.',
      image: DEFAULT_OG_IMAGE,
      type: 'website',
      canonicalPath: '/about',
      imageAlt: `${BLOG_TITLE} — About`,
      ld: {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: `About — ${BLOG_TITLE}`,
        url: `${SITE_ORIGIN}/about`,
        description: 'Über den ZenPost Blog: Build, Learn, Ship mit praxisnahen Insights zu Produktentwicklung und Distribution.',
      },
    });
    return;
  }
  // Post
  const postMatch = path.match(/^\/post\/(.+)$/);
  if (postMatch) {
    await renderPost(app, postMatch[1], requestId);
    return;
  }
  // Legacy direct slug route (e.g. /design-guide-denis-bitter)
  const directSlugMatch = path.match(/^\/([^/]+)$/);
  if (directSlugMatch) {
    const slug = directSlugMatch[1];
    const postExists = (manifest?.posts || []).some((p) => p.slug === slug);
    if (postExists) {
      await renderPost(app, slug, requestId);
      return;
    }
  }
  // 404
  renderTemplate(app, 'tpl-404');
  document.title = `404 | ${BLOG_TITLE}`;
  updateSeoMeta({
    title: document.title,
    description: `Diese Seite wurde nicht gefunden. Zurück zum ${BLOG_TITLE}.`,
    image: DEFAULT_OG_IMAGE,
    type: 'website',
    imageAlt: `${BLOG_TITLE} — 404`,
    ld: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `404 — ${BLOG_TITLE}`,
      url: `${SITE_ORIGIN}${window.location.pathname || '/'}`,
      description: `Diese Seite wurde nicht gefunden. Zurück zum ${BLOG_TITLE}.`,
    },
  });
}

function renderTemplate(container, tplId) {
  const tpl = document.getElementById(tplId);
  if (!tpl) return;
  container.innerHTML = '';
  container.appendChild(tpl.content.cloneNode(true));
}

// ═══════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════

async function renderHome(app, filterTag, requestId = navigationRequestId) {
  const data = await loadManifest();
  if (requestId !== navigationRequestId) return;
  const tpl  = document.getElementById('tpl-home');
  if (!tpl) return;
  const normalizedFilterTag = normalizeTag(filterTag);
  const activeFilterTag = normalizedFilterTag && normalizedFilterTag !== 'all' && normalizedFilterTag !== 'home'
    ? normalizedFilterTag
    : '';

  app.innerHTML = '';
  app.appendChild(tpl.content.cloneNode(true));
  stripTemplateLeakText(app);
  document.title = activeFilterTag
    ? `${titleCase(activeFilterTag)} | ${BLOG_TITLE}`
    : BLOG_OVERVIEW_TITLE;
  updateSeoMeta({
    title: document.title,
    description: activeFilterTag
      ? `Guides und Build-Posts zur Kategorie ${titleCase(activeFilterTag)} im ${BLOG_TITLE}.`
      : 'Build, Learn, Ship: Produktentwicklung, Distribution und Learnings aus echten Releases.',
    image: DEFAULT_OG_IMAGE,
    type: 'website',
    canonicalPath: activeFilterTag ? `/category/${encodeURIComponent(activeFilterTag)}` : '/',
    imageAlt: activeFilterTag
      ? `${BLOG_TITLE} Kategorie: ${titleCase(activeFilterTag)}`
      : `${BLOG_TITLE} — Home`,
    ld: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: BLOG_TITLE,
      url: `${SITE_ORIGIN}/`,
      description: activeFilterTag
        ? `Guides und Build-Posts zur Kategorie ${titleCase(activeFilterTag)} im ${BLOG_TITLE}.`
        : 'Build, Learn, Ship: Produktentwicklung, Distribution und Learnings aus echten Releases.',
      publisher: {
        '@type': 'Person',
        name: 'Denis Bitter',
      },
    },
  });

  const allPosts = [...(data.posts || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  let posts = [...allPosts];
  if (activeFilterTag) {
    posts = posts.filter((p) =>
      (p.tags || []).some((tag) => normalizeTag(tag) === activeFilterTag)
    );
  }
  // newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const weeklyBuild = document.getElementById('weeklyBuild');
  if (weeklyBuild) renderWeeklyBuild(weeklyBuild, allPosts);

  const grid = document.getElementById('postGrid');
  if (!grid) return;

  if (posts.length === 0) {
    const tagLabel = activeFilterTag ? `<span class="no-posts-tag">${activeFilterTag}</span>` : '';
    grid.innerHTML = `
      <div class="no-posts">
        <p class="no-posts-title">◆ Noch nichts hier${activeFilterTag ? ' unter ' + activeFilterTag : ''}.</p>
        <p class="no-posts-hint">Posts erscheinen hier sobald sie mit dem Tag ${tagLabel || '<em>devlog</em>'} veröffentlicht werden.</p>
      </div>`;
    return;
  }

  // Distribute: featured = first big post, left = odd-indexed, right = even-indexed tail
  const [featured, ...rest] = posts;
  const leftPosts  = rest.filter((_, i) => i % 2 === 0).slice(0, 4);
  const rightPosts = rest.filter((_, i) => i % 2 === 1).slice(0, 4);

  const colLeft  = makeEl('div', 'grid-col grid-col-left');
  const colMain  = makeEl('div', 'grid-col grid-col-main');
  const colRight = makeEl('div', 'grid-col grid-col-right');

  // Featured
  colMain.appendChild(makeFeaturedCard(featured));
  // Sidebar posts
  leftPosts.forEach(p  => colLeft.appendChild(makePostCard(p)));
  rightPosts.forEach(p => colRight.appendChild(makePostCard(p)));

  grid.appendChild(colLeft);
  grid.appendChild(colMain);
  grid.appendChild(colRight);
}

function stripTemplateLeakText(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const toRemove = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const value = String(node.nodeValue || '').trim();
    if (!value) continue;

    const looksLikeLeakedMarkup =
      value.includes('<section class="home-paths"') ||
      value.includes('<article class="path-card"') ||
      value.includes('<section class="ai-proof"');

    if (looksLikeLeakedMarkup) {
      toRemove.push(node);
    }
  }

  toRemove.forEach((node) => node.parentNode && node.parentNode.removeChild(node));
}

function renderWeeklyBuild(mount, posts) {
  if (!mount) return;
  if (!posts || posts.length === 0) {
    mount.innerHTML = '';
    return;
  }

  const latestBuilds = posts.slice(0, 3);
  const latestRelease = posts.find((p) => Array.isArray(p.tags) && p.tags.includes('release')) || posts[0];
  const nextStepSource = posts[0];
  const nextStepText = (nextStepSource?.subtitle || nextStepSource?.title || '').trim();

  mount.innerHTML = `
    <div class="weekly-build-head">
      <p class="weekly-build-kicker">Status diese Woche</p>
      <h2 class="weekly-build-title">Diese Woche gebaut</h2>
    </div>
    <div class="weekly-build-grid">
      <article class="weekly-card">
        <p class="weekly-label">Parallel Builds</p>
        <ul class="weekly-list">
          ${latestBuilds.map((post) => `
            <li><a href="/post/${escHtml(post.slug)}" onclick="navigate('/post/${escHtml(post.slug)}'); return false;">${escHtml(post.title)}</a></li>
          `).join('')}
        </ul>
      </article>
      <article class="weekly-card">
        <p class="weekly-label">Live Update</p>
        <p class="weekly-value"><a href="/post/${escHtml(latestRelease.slug)}" onclick="navigate('/post/${escHtml(latestRelease.slug)}'); return false;">${escHtml(latestRelease.title)}</a></p>
        <p class="weekly-meta">${formatDate(latestRelease.date)}</p>
      </article>
      <article class="weekly-card">
        <p class="weekly-label">Als Nächstes</p>
        <p class="weekly-value">${escHtml(nextStepText || 'Nächsten Build vorbereiten und dokumentieren.')}</p>
        <p class="weekly-meta">für DevCreator, private Einblicke und Brand-Ausbau</p>
      </article>
    </div>
  `;
}

function makeFeaturedCard(post) {
  const el = makeEl('div', 'post-featured');
  el.onclick = () => navigate('/post/' + post.slug);

  const coverHtml = post.coverImage
    ? `<div class="featured-cover"><img src="${escHtml(post.coverImage)}" alt="${escHtml(post.title)}" loading="lazy" /></div>`
    : buildZenPlaceholder(post, 'featured');

  const tag  = post.tags?.[0] || 'dev';
  const date = formatDate(post.date);
  const rt   = post.readingTime ? `· ${post.readingTime} min` : '';

  el.innerHTML = `
    ${coverHtml}
    <span class="featured-tag">${escHtml(tag)}</span>
    <h2 class="featured-title">${escHtml(post.title)}</h2>
    ${post.subtitle ? `<p class="featured-excerpt">${escHtml(post.subtitle)}</p>` : ''}
    <p class="featured-meta">Denis Bitter — ${date} ${rt}</p>
  `;
  return el;
}

function makePostCard(post) {
  const el  = makeEl('div', 'post-card');
  el.onclick = () => navigate('/post/' + post.slug);

  const tag  = post.tags?.[0] || 'dev';
  const date = formatDate(post.date);
  const rt   = post.readingTime ? `· ${post.readingTime} min` : '';

  const coverHtml = post.coverImage
    ? `<div class="card-cover"><img src="${escHtml(post.coverImage)}" alt="" loading="lazy" /></div>`
    : buildZenPlaceholder(post, 'card');
  const subtitleHtml = post.subtitle ? `<p class="post-subtitle">${escHtml(post.subtitle)}</p>` : '';

  el.innerHTML = `
    ${coverHtml}
    <span class="card-tag">${escHtml(tag)}</span>
    <p class="card-title">${escHtml(post.title)}</p>
    ${subtitleHtml}
    <p class="card-meta">
      <span>Denis Bitter</span>
      <span>— ${date}</span>
      ${rt ? `<span>${rt}</span>` : ''}
    </p>
  `;
  return el;
}

function buildZenPlaceholder(post, variant = 'card') {
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const word = (post.project || tags[0] || 'BUILD').toUpperCase();
  const focus = post.focus || 'Clarity';
  const status = post.status || 'Draft';

  return `
    <div class="${variant}-cover">
      <div class="${variant}-cover-placeholder zen-placeholder zen-placeholder--${variant}">
        <span class="zen-placeholder-word">${escHtml(word)}</span>
        <div class="zen-placeholder-meta">
          <span>STATUS ${escHtml(status)}</span>
          <span>FOCUS ${escHtml(focus)}</span>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════
// POST PAGE
// ═══════════════════════════════════════════════════════════

async function renderPost(app, slug, requestId = navigationRequestId) {
  const data = await loadManifest();
  if (requestId !== navigationRequestId) return;
  const meta = (data.posts || []).find(p => p.slug === slug);

  if (!meta) {
    renderTemplate(app, 'tpl-404');
    return;
  }

  // Fetch markdown
  let mdContent = '';
  let frontmatter = {};
  try {
    const res = await fetch(POSTS_DIR + slug + '.md?t=' + Date.now());
    if (!res.ok) throw new Error('not found');
    const raw = await res.text();
    const parsed = parseFrontmatter(raw);
    mdContent = parsed.body;
    frontmatter = parsed.data;
  } catch {
    mdContent = '_Inhalt nicht verfügbar._';
  }
  if (requestId !== navigationRequestId) return;

  // Clone template
  renderTemplate(app, 'tpl-post');

  // Fill in
  const post = { ...meta, ...frontmatter };
  const tag = post.tags?.[0] || 'dev';
  const rt  = post.readingTime
    ? `${post.readingTime} min read`
    : estimateReadTime(mdContent) + ' min read';

  setInner('postTag',      escHtml(tag.toUpperCase()));
  setInner('postTitle',    escHtml(post.title));
  setInner('postSubtitle', post.subtitle ? escHtml(post.subtitle) : '');
  setInner('postDate',     formatDate(post.date));
  setInner('postReadTime', rt);
  renderDevlogSnapshot(post);
  renderPostStrategy(post);

  // Cover image
  if (post.coverImage) {
    const coverEl = document.getElementById('postCover');
    const imgEl   = document.getElementById('postCoverImg');
    if (coverEl && imgEl) {
      imgEl.src = post.coverImage;
      imgEl.alt = post.title;
      coverEl.style.display = 'block';
    }
  }

  // Body
  const bodyEl = document.getElementById('postBody');
  if (bodyEl && typeof marked !== 'undefined') {
    bodyEl.innerHTML = marked.parse(mdContent);
    // Open external links in new tab
    bodyEl.querySelectorAll('a[href^="http"]').forEach(a => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
  } else if (bodyEl) {
    bodyEl.innerHTML = `<pre>${escHtml(mdContent)}</pre>`;
  }

  // Page title
  document.title = `${post.title} | ${BLOG_TITLE}`;
  const postDescription = buildPostDescription(post);
  updateSeoMeta({
    title: document.title,
    description: postDescription,
    image: post.coverImage || DEFAULT_OG_IMAGE,
    type: 'article',
    canonicalPath: `/post/${post.slug}`,
    imageAlt: post.title,
    ld: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: postDescription,
      image: post.coverImage ? [post.coverImage] : [DEFAULT_OG_IMAGE],
      datePublished: post.date || undefined,
      dateModified: post.date || undefined,
      author: {
        '@type': 'Person',
        name: 'Denis Bitter',
        url: 'https://denisbitter.de',
      },
      publisher: {
        '@type': 'Person',
        name: 'Denis Bitter',
        url: 'https://denisbitter.de',
      },
      mainEntityOfPage: `${SITE_ORIGIN}/post/${post.slug}`,
      keywords: Array.isArray(post.tags) ? post.tags.join(', ') : undefined,
    },
  });
  renderSocialSnippets(post);
  renderRequiredCrossLinks(post);
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function makeEl(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function setInner(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function updateSeoMeta({ title, description, image, type = 'website', canonicalPath, imageAlt, ld }) {
  const href = canonicalPath
    ? `${SITE_ORIGIN}${canonicalPath}`
    : `${SITE_ORIGIN}${window.location.pathname || '/'}`;
  const setContent = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null && value !== '') el.setAttribute('content', value);
  };
  const canonical = document.getElementById('metaCanonical');
  if (canonical) canonical.setAttribute('href', href);

  setContent('metaDescription', description);
  setContent('metaOgType', type);
  setContent('metaOgUrl', href);
  setContent('metaOgTitle', title);
  setContent('metaOgDescription', description);
  setContent('metaOgImage', image);
  setContent('metaOgImageAlt', imageAlt || title);
  setContent('metaTwitterTitle', title);
  setContent('metaTwitterDescription', description);
  setContent('metaTwitterImage', image);
  setContent('metaTwitterImageAlt', imageAlt || title);
  updateStructuredData(ld || {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: href,
  });
}

function updateStructuredData(payload) {
  const node = document.getElementById('ldJson');
  if (!node || !payload) return;
  node.textContent = JSON.stringify(payload, null, 2);
}

function titleCase(str) {
  return String(str || '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeTag(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function toMetaLength(value, max = 160) {
  const clean = normalizeWhitespace(value);
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max - 1);
  const safeBreak = sliced.lastIndexOf(' ');
  if (safeBreak > 80) return `${sliced.slice(0, safeBreak)}…`;
  return `${sliced}…`;
}

function buildPostDescription(post) {
  const explicit = normalizeWhitespace(post.description || '');
  if (explicit.length >= 140 && explicit.length <= 160) return explicit;

  const problem = normalizeWhitespace(post.problem || '');
  const result = normalizeWhitespace(post.result || post.outcome || '');
  const subtitle = normalizeWhitespace(post.subtitle || '');

  if (problem && result) {
    return toMetaLength(`${problem} Ergebnis: ${result}`, 160);
  }
  if (subtitle) {
    return toMetaLength(`${subtitle} Praxisnah erklärt im ${BLOG_TITLE}.`, 160);
  }
  return toMetaLength(`Build-Update zu ${post.title}: Problem, Lösung und nächster Schritt kompakt dokumentiert.`, 160);
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return dateStr; }
}

function estimateReadTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

function parseFrontmatter(raw) {
  const match = String(raw || '').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: String(raw || '').trim() };

  const [, block, body] = match;
  const data = {};

  block.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf(':');
    if (idx === -1) return;

    const key = trimmed.slice(0, idx).trim();
    const rawValue = trimmed.slice(idx + 1).trim();

    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      data[key] = rawValue
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      return;
    }

    data[key] = rawValue.replace(/^["']|["']$/g, '');
  });

  return { data, body: body.trim() };
}

function renderDevlogSnapshot(post) {
  const mount = document.getElementById('postDevlogMeta');
  if (!mount) return;

  const groups = [
    { label: 'Projekt', value: post.project },
    { label: 'Tag', value: post.day },
    { label: 'Status', value: post.status },
    { label: 'Fokus', value: post.focus },
    { label: 'Heute', value: post.today },
    { label: 'Blocker', value: post.blockers },
    { label: 'Nächste Schritte', value: post.next },
    { label: 'Stimmung', value: post.mood },
  ].filter((item) => item.value && (Array.isArray(item.value) ? item.value.length : String(item.value).trim()));

  if (groups.length === 0) {
    mount.style.display = 'none';
    mount.innerHTML = '';
    return;
  }

  mount.style.display = 'grid';
  mount.innerHTML = groups.map((item) => {
    const content = Array.isArray(item.value)
      ? `<ul class="devlog-card-list">${item.value.map((entry) => `<li>${escHtml(entry)}</li>`).join('')}</ul>`
      : `<p class="devlog-card-value">${escHtml(item.value)}</p>`;

    return `
      <section class="devlog-card">
        <p class="devlog-card-label">${escHtml(item.label)}</p>
        ${content}
      </section>
    `;
  }).join('');
}

function renderPostStrategy(post) {
  const mount = document.getElementById('postStrategy');
  if (!mount) return;

  const problem = post.problem || '';
  const result = post.result || post.outcome || '';
  const nextStep = post.next_step || post.nextStep || post.next || '';
  const cards = [
    { label: 'Problem', value: problem },
    { label: 'Ergebnis', value: result },
    { label: 'Nächster Schritt', value: nextStep },
  ].filter((item) => String(item.value || '').trim());

  if (cards.length === 0) {
    mount.style.display = 'none';
    mount.innerHTML = '';
    return;
  }

  mount.innerHTML = cards.map((item) => `
    <article class="strategy-card">
      <p class="strategy-label">${escHtml(item.label)}</p>
      <p class="strategy-value">${escHtml(item.value)}</p>
    </article>
  `).join('');
  mount.style.display = 'grid';
}

function renderRequiredCrossLinks(post) {
  const mount = document.querySelector('.post-footer-nav');
  if (!mount) return;

  const tags = Array.isArray(post.tags) ? post.tags.map((t) => String(t).toLowerCase()) : [];
  const productUrl = tags.includes('zenorbit')
    ? 'https://zenorbit.denisbitter.de/'
    : 'https://zenpost.denisbitter.de/';
  const productLabel = productUrl.includes('zenorbit') ? 'ZenOrbit' : 'ZenPost';

  mount.innerHTML = `
    <div class="post-footer-required-links">
      <a href="${productUrl}" target="_blank" rel="noopener noreferrer" class="back-link">→ ${productLabel} Produktseite</a>
      <a href="https://www.denisbitter.de/zenapp" target="_blank" rel="noopener noreferrer" class="back-link">→ Denis Bitter ZenApp</a>
      <a href="/" class="back-link" onclick="navigate('/'); return false;">← Alle Posts</a>
    </div>
  `;
}

function renderSocialSnippets(post) {
  const mount = document.getElementById('postSocialSnippets');
  if (!mount) return;

  const tag = (post.tags && post.tags[0]) ? `#${String(post.tags[0]).replace(/\s+/g, '')}` : '#devlog';
  const subtitle = post.subtitle || `Neuer Build im ${BLOG_TITLE}.`;
  const canonicalPostUrl = `${SITE_ORIGIN}/post/${post.slug}`;
  const linkedIn = `${post.title}\n\n${subtitle}\n\nProblem → Build → Ergebnis → Nächster Schritt.\n\nVoller Eintrag im ${BLOG_TITLE}: ${canonicalPostUrl}\n\n${tag} #zendev #buildinpublic`;
  const instagram = `${post.title}\n\n${subtitle}\n\nMehr Details im ${BLOG_TITLE} (Link in Bio / Story).\n\n${tag} #zendev #devcreator #buildinpublic`;

  mount.innerHTML = `
    <div class="snippet-head">
      <p class="snippet-kicker">Content Export</p>
      <h3 class="snippet-title">LinkedIn & Instagram Snippets</h3>
    </div>
    <div class="snippet-grid">
      <article class="snippet-card">
        <p class="snippet-label">LinkedIn</p>
        <textarea class="snippet-text" readonly>${escHtml(linkedIn)}</textarea>
        <button class="snippet-copy" data-snippet="${escHtml(linkedIn)}" onclick="copySnippet(this)">LinkedIn kopieren</button>
      </article>
      <article class="snippet-card">
        <p class="snippet-label">Instagram</p>
        <textarea class="snippet-text" readonly>${escHtml(instagram)}</textarea>
        <button class="snippet-copy" data-snippet="${escHtml(instagram)}" onclick="copySnippet(this)">Instagram kopieren</button>
      </article>
    </div>
  `;
  mount.style.display = 'block';
}

async function copySnippet(button) {
  if (!button) return;
  const raw = button.getAttribute('data-snippet') || '';
  const text = raw
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  try {
    await navigator.clipboard.writeText(text);
    const old = button.textContent;
    button.textContent = 'Kopiert';
    setTimeout(() => { button.textContent = old; }, 1400);
  } catch {
    button.textContent = 'Copy fehlgeschlagen';
  }
}

// ═══════════════════════════════════════════════════════════
// MOBILE NAV
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav    = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    // Close on nav click
    nav.addEventListener('click', (e) => {
      if (e.target.closest('.nav-link')) nav.classList.remove('open');
    });
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    const isInternalPath = href.startsWith('/') && !href.startsWith('//');
    if (!isInternalPath) return;

    if (link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    navigate(href);
  });
});

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════

// Hash-based navigation
window.addEventListener('popstate', () => {
  navigate(getRoute(), false);
});

// Initial render
(async () => {
  if (window.location.pathname === '/' && window.location.hash.startsWith('#/')) {
    const legacyPath = window.location.hash.slice(1);
    window.history.replaceState(null, '', legacyPath);
  }
  await loadManifest();
  await navigate(getRoute(), false);
})();

window.addEventListener('pageshow', () => {
  navigate(getRoute(), false);
});

// ═══════════════════════════════════════════════════════════
// NEWSLETTER
// ═══════════════════════════════════════════════════════════

async function subscribeNewsletter(e) {
  e.preventDefault();

  const emailEl  = document.getElementById('newsletterEmail');
  const msgEl    = document.getElementById('newsletterMsg');
  const submitEl = e.target.querySelector('.newsletter-submit');

  if (!emailEl || !msgEl) return;

  const email = emailEl.value.trim();
  if (!email) return;

  msgEl.textContent = '';
  msgEl.className   = 'newsletter-msg';
  if (submitEl) { submitEl.disabled = true; submitEl.textContent = '…'; }

  try {
    const res  = await fetch('https://denisbitter.de/stage01/api/newsletter-subscribe.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();

    if (data.success || data.already) {
      msgEl.textContent = data.message;
      msgEl.classList.add('success');
      if (data.success) emailEl.value = '';
    } else {
      msgEl.textContent = data.message || 'Etwas ist schiefgelaufen.';
      msgEl.classList.add('error');
    }
  } catch {
    msgEl.textContent = 'Verbindungsfehler. Bitte versuch es nochmal.';
    msgEl.classList.add('error');
  } finally {
    if (submitEl) { submitEl.disabled = false; submitEl.textContent = 'Anmelden'; }
  }
}
