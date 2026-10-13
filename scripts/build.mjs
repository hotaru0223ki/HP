import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const basePath = process.env.SITE_BASE_PATH || '/';
if (!/^\/(?:[A-Za-z0-9._~-]+\/)*$/.test(basePath) || basePath.split('/').some(part => part === '.' || part === '..')) throw new Error('SITE_BASE_PATHは / または /repository/ の形式です');
const activities = [
  { id: 'tomoshibi', number: '01', category: '組織運営・ものづくり教育' },
  { id: 'hanabi', number: '02', category: 'ロボット競技・アウトリーチ' },
  { id: 'sony', number: '03', category: 'MESHの事業開発' }
];
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function inline(value) {
  return escape(value).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

async function content(id, expected) {
  const source = await readFile(path.join(root, 'content/site', `${id}.md`), 'utf8');
  if (/TODO|要確認|確認質問|主要度|公開前要確認|<\/?[a-z]/i.test(source)) throw new Error(`${id}: 私的メモ・仮文言・生HTMLは生成できません`);
  const title = source.match(/^# (.+)$/m)?.[1];
  if (!title) throw new Error(`${id}: タイトルがありません`);
  const chunks = source.split(/^## (.+)\r?\n/gm);
  const sections = new Map();
  for (let i = 1; i < chunks.length; i += 2) {
    if (sections.has(chunks[i])) throw new Error(`${id}: 項目が重複しています`);
    sections.set(chunks[i], chunks[i + 1].trim());
  }
  if (sections.size !== expected.length || expected.some(name => !sections.get(name))) throw new Error(`${id}: 項目名・本文を確認してください（${expected.join(' / ')}）`);
  return { title, sections };
}

function paragraphs(source) {
  return source.split(/\n\s*\n/).map(value => `<p>${inline(value.replaceAll('\n', ''))}</p>`).join('\n');
}

function linkList(source, className) {
  const links = source.split('\n').map(line => {
    const match = line.match(/^- \[([^\]]+)\]\(([^\s)]+)\)$/);
    if (!match) throw new Error(`リンクの記法が不正です: ${line}`);
    const [, label, href] = match;
    const url = new URL(href);
    if (!['https:', 'mailto:'].includes(url.protocol)) throw new Error(`使用できないURL: ${href}`);
    return `<li><a href="${escape(href)}"><span>${escape(label)}</span><span class="arrow" aria-hidden="true">${url.protocol === 'mailto:' ? '→' : '↗'}</span></a></li>`;
  });
  return `<ul class="${className}">${links.join('\n')}</ul>`;
}

await mkdir(path.join(output, 'assets'), { recursive: true });
const intro = await content('intro', ['自己紹介', '活動概要']);
const drafts = await Promise.all(activities.map(activity => content(activity.id, ['見出し', '概要', '本人の担当', '活動の記録', '参照', '関連リンク'])));
const contact = await content('contact', ['説明', '連絡先']);
if (intro.title !== '𠮷田尚翔') throw new Error('本人指定の氏名表記を確認してください');
const descriptions = intro.sections.get('活動概要').split('\n');
if (descriptions.length !== 3) throw new Error('活動概要は指定順の3行です');
const activityIndex = activities.map((activity, index) => `<li><a class="index-card" href="./${activity.id}.html"><span class="index-number">${activity.number}</span><span class="index-title">${escape(drafts[index].title)}</span><span class="index-description">${escape(descriptions[index])}</span><span class="index-action">活動を読む <span aria-hidden="true">→</span></span></a></li>`).join('\n');
const introHTML = `<section id="intro" class="intro" tabindex="-1" aria-labelledby="intro-title">
  <p class="eyebrow"><span lang="en">00 / INTRODUCTION</span>自己紹介</p>
  <div class="intro-grid">
    <div class="intro-text"><h1 id="intro-title">${escape(intro.title)}</h1><div class="intro-copy">${paragraphs(intro.sections.get('自己紹介'))}</div><a class="text-action" href="#activity-index">3つの活動を見る <span aria-hidden="true">↓</span></a></div>
    <figure class="intro-figure"><img src="./assets/intro-index.svg" width="440" height="280" alt="教育・ロボット・事業開発の3つの活動領域を示す図。"><figcaption>教育・ロボット・事業開発</figcaption></figure>
  </div>
  <div class="activity-index" id="activity-index" tabindex="-1"><h2 class="index-heading">活動の目次<span lang="en">SELECTED ACTIVITIES</span></h2><ol class="index-list">${activityIndex}</ol></div>
</section>`;
const activitiesHTML = activities.map((activity, index) => {
  const draft = drafts[index];
  const roleSummary = draft.sections.get('本人の担当').split('。')[0] + '。';
  return `<section id="${activity.id}" class="activity" tabindex="-1" aria-labelledby="${activity.id}-title">
    <div class="section-label"><span class="section-number" aria-hidden="true">${activity.number}</span><h2 id="${activity.id}-title">${escape(draft.title)}</h2><p class="section-category">${escape(activity.category)}</p></div>
    <div class="activity-body"><h3 class="activity-headline">${escape(draft.sections.get('見出し'))}</h3>${paragraphs(draft.sections.get('概要'))}<div class="summary-role"><h3>私の担当</h3>${paragraphs(roleSummary)}</div><a class="detail-action" href="./${activity.id}.html">担当・活動の記録を読む <span aria-hidden="true">→</span></a></div>
  </section>`;
}).join('\n');
const contactHTML = `<section id="contact" class="contact" tabindex="-1" aria-labelledby="contact-title"><div class="section-label"><span class="section-number" aria-hidden="true">04</span><h2 id="contact-title">${escape(contact.title)}</h2><p class="section-category" lang="en">CONTACT</p></div><div class="contact-body">${paragraphs(contact.sections.get('説明'))}${linkList(contact.sections.get('連絡先'), 'contact-links')}</div></section>`;
const template = await readFile(path.join(root, 'src/index.html'), 'utf8');
function renderPage(id, title, description, body) {
  const home = id === 'home' ? '' : './index.html';
  const navigation = [
    { label: '自己紹介', section: 'intro', number: '00' },
    { label: '活動', section: 'activity-index', number: '01–03' },
    { label: 'コンタクト', section: 'contact', number: '04' }
  ].map(item => `<a href="${home}#${item.section}"${id === 'home' ? ` data-section="${item.section}"${item.section === 'intro' ? ' aria-current="location"' : ''}` : ''}><span class="nav-index">${item.number}</span>${item.label}</a>`).join('\n');
  const values = { TITLE: escape(title), DESCRIPTION: escape(description), PAGE: id, HOME: home, NAVIGATION: navigation, CONTENT: body };
  const html = template.replace(/\{\{([A-Z]+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`未処理の項目: ${key}`);
    return values[key];
  });
  if (/\{\{/.test(html)) throw new Error('テンプレートに未処理の項目があります');
  return html;
}
await writeFile(path.join(output, 'index.html'), renderPage('home', '𠮷田尚翔｜ポートフォリオ', '𠮷田尚翔のポートフォリオ。NPO法人燈、FRC Team Hanabi、Sonyとの事業開発の共創における活動と担当を紹介します。', introHTML + activitiesHTML + contactHTML));
for (const [index, activity] of activities.entries()) {
  const draft = drafts[index];
  const previous = index > 0 ? `<a href="./${activities[index - 1].id}.html"><span class="pagination-label">前の活動</span><span>← ${escape(drafts[index - 1].title)}</span></a>` : '<a href="./index.html#activity-index"><span class="pagination-label">活動の一覧</span><span>← TOPの活動へ</span></a>';
  const next = index < 2 ? `<a href="./${activities[index + 1].id}.html"><span class="pagination-label">次の活動</span><span>${escape(drafts[index + 1].title)} →</span></a>` : '<a href="./index.html#contact"><span class="pagination-label">コンタクト</span><span>連絡先へ →</span></a>';
  const body = `<nav class="breadcrumb" aria-label="現在地"><a href="./index.html#activity-index">TOP / 活動</a><span aria-hidden="true">/</span><span aria-current="page">${escape(draft.title)}</span></nav>
    <header class="project-hero"><span class="project-number" aria-hidden="true">${activity.number}</span><div><p class="eyebrow">${escape(activity.category)}</p><h1>${escape(draft.title)}</h1><p class="project-headline">${escape(draft.sections.get('見出し'))}</p></div></header>
    <div class="project-layout"><aside class="project-aside"><nav class="project-toc" aria-label="この活動の目次"><p>この活動について</p><a href="#overview">概要</a><a href="#role">私の担当</a><a href="#record">活動の記録</a><a href="#references">公開資料</a></nav><a class="return-link" href="./index.html#${activity.id}">← TOPのこの活動へ戻る</a></aside>
    <div class="project-prose"><section id="overview" tabindex="-1"><h2>概要</h2>${paragraphs(draft.sections.get('概要'))}</section><section id="role" tabindex="-1"><h2>私の担当</h2>${paragraphs(draft.sections.get('本人の担当'))}</section><section id="record" tabindex="-1"><h2>活動の記録</h2>${paragraphs(draft.sections.get('活動の記録'))}</section><section id="references" tabindex="-1" class="reference-block"><h2>公開資料を読む</h2>${linkList(draft.sections.get('参照'), 'reference-list')}${linkList(draft.sections.get('関連リンク'), 'reference-list secondary-links')}</section></div></div>
    <nav class="project-pagination" aria-label="活動の続き">${previous}${next}</nav>`;
  await writeFile(path.join(output, `${activity.id}.html`), renderPage(activity.id, `${draft.title}｜𠮷田尚翔`, draft.sections.get('概要').replaceAll('\n', ''), body));
}
const notFound = await readFile(path.join(root, 'src/404.html'), 'utf8');
await writeFile(path.join(output, '404.html'), notFound.replace('{{BASE_PATH}}', basePath));
for (const asset of ['styles.css', 'navigation.js', 'intro-index.svg']) await copyFile(path.join(root, 'src/assets', asset), path.join(output, 'assets', asset));
await writeFile(path.join(output, '.nojekyll'), '');
console.log('Build complete: TOP + 3活動詳細 + 404、共通アセット、.nojekyll');
