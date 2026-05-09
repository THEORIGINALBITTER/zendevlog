'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'manifest.json');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const SITE = 'https://zenpostapp.denisbitter.de';

function readManifest() {
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
  return JSON.parse(raw);
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function toIsoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function latestDate(posts) {
  const dates = posts
    .map((p) => toIsoDate(p.date))
    .filter(Boolean)
    .sort();
  return dates.length ? dates[dates.length - 1] : new Date().toISOString().slice(0, 10);
}

function urlNode({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ].filter(Boolean).join('\n');
}

function buildSitemap(manifest) {
  const posts = Array.isArray(manifest.posts) ? manifest.posts : [];
  const last = latestDate(posts);

  const staticPages = [
    { loc: `${SITE}/`, lastmod: last, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE}/about`, lastmod: last, changefreq: 'monthly', priority: '0.7' },
  ];

  const tags = unique(posts.flatMap((p) => Array.isArray(p.tags) ? p.tags : []));
  const categoryPages = tags.map((tag) => ({
    loc: `${SITE}/category/${encodeURIComponent(tag)}`,
    lastmod: last,
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const postPages = posts
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .map((post) => ({
      loc: `${SITE}/post/${encodeURIComponent(post.slug)}`,
      lastmod: toIsoDate(post.date) || last,
      changefreq: 'monthly',
      priority: '0.8',
    }));

  const all = [...staticPages, ...categoryPages, ...postPages];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...all.map(urlNode),
    '</urlset>',
    '',
  ].join('\n');
}

function main() {
  const manifest = readManifest();
  const xml = buildSitemap(manifest);
  fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
  const count = (manifest.posts || []).length;
  console.log(`Sitemap generated: ${SITEMAP_PATH} (${count} posts)`);
}

main();
