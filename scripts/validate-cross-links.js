'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');

const PRODUCT_LINK_RE = /https?:\/\/(?:zenpost|zenorbit)\.denisbitter\.de(?:\/[^\s)\]"']*)?/i;
const ZENAPP_LINK_RE = /https?:\/\/www\.denisbitter\.de\/zenapp(?:\/[^\s)\]"']*)?/i;

function stripFrontmatter(raw) {
  const match = String(raw).match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);
  return match ? match[1] : String(raw);
}

function main() {
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .sort();

  const failures = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const body = stripFrontmatter(raw);

    const hasProductLink = PRODUCT_LINK_RE.test(body);
    const hasZenAppLink = ZENAPP_LINK_RE.test(body);

    if (!hasProductLink || !hasZenAppLink) {
      failures.push({ file, hasProductLink, hasZenAppLink });
    }
  }

  if (failures.length > 0) {
    console.error('Cross-link validation failed. Missing required links in:');
    for (const failure of failures) {
      const missing = [];
      if (!failure.hasProductLink) missing.push('zenpost/zenorbit link');
      if (!failure.hasZenAppLink) missing.push('denisbitter zenapp link');
      console.error(`- ${failure.file}: missing ${missing.join(' + ')}`);
    }
    process.exit(1);
  }

  console.log(`Cross-link validation passed: ${files.length} posts checked.`);
}

main();
