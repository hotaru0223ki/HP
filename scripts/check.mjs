import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, 'dist');
const files = ['index.html', 'tomoshibi.html', 'hanabi.html', 'sony.html'];
const documents = new Map(await Promise.all(files.map(async filename => [filename, await readFile(path.join(directory,filename),'utf8')])));
const inventory = await readFile(path.join(root,'docs/CONTENT_INVENTORY.md'),'utf8');
const emails = ['naoto.yoshida@tmsb.or.jp','naoto3071@gmail.com'];
const ids = html => [...html.matchAll(/ id="([^"]+)"/g)].map(match=>match[1]);
for (const [filename, html] of documents) {
  assert.equal((html.match(/<h1(?: |>|\n)/g)||[]).length,1, `${filename}: h1`);
  assert(html.includes('<html lang="ja">'));
  assert(html.includes('𠮷田尚翔'));
  assert(!/TODO|要確認|主要度|公開前要確認|\{\{/.test(html), `${filename}: 未確認メモを除外`);
  assert.equal(new Set(ids(html)).size,ids(html).length, `${filename}: ID重複なし`);
  assert(html.includes('class="floating-top"') && html.includes('aria-label="TOPへ戻る"'));
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href=match[1].replaceAll('&amp;','&');
    if (href.startsWith('https:')) { assert(inventory.includes(href),`台帳の参照先: ${href}`); continue; }
    if (href.startsWith('mailto:')) { assert(emails.includes(href.slice(7))); continue; }
    assert(!href.startsWith('/') && !href.includes('..'), `${filename}: リポジトリ配下で使える相対URL`);
    const [destination,hash]=href.split('#');
    const target=destination.replace(/^\.\//,'')||filename;
    await access(path.join(directory,target));
    if(hash) { assert(documents.has(target), `${target}: ページが生成済み`); assert(ids(documents.get(target)).includes(hash), `${target}#${hash}: 戻り先が存在`); }
  }
}
const home=documents.get('index.html');
assert.deepEqual([...home.matchAll(/<section id="([^"]+)"/g)].map(match=>match[1]),['intro','tomoshibi','hanabi','sony','contact'],'TOPの読順');
assert.equal((home.match(/<img /g)||[]).length,1,'トップ画像1点');
assert(home.includes('width="440" height="280" alt='));
assert.deepEqual([...home.matchAll(/href="mailto:([^"]+)"/g)].map(match=>match[1]),emails,'メールは指定2件');
assert.deepEqual([...home.matchAll(/class="index-card" href="\.\/([^"]+)"/g)].map(match=>match[1]),['tomoshibi.html','hanabi.html','sony.html'],'ページ遷移の順序');
for(const id of ['tomoshibi','hanabi','sony']) {
  const detail=documents.get(`${id}.html`);
  assert.deepEqual([...detail.matchAll(/<section id="([^"]+)"/g)].map(match=>match[1]),['overview','role','record','references']);
  assert(detail.includes(`class="return-link" href="./index.html#${id}"`));
  assert(detail.includes('aria-label="現在地"') && detail.includes('aria-current="page"'));
}
assert.deepEqual((await readdir(directory)).sort(),['.nojekyll','404.html','assets',...files].sort(),'原稿と内部資料を配信しない');
for(const filename of ['scripts/build.mjs','scripts/check.mjs','scripts/preview.mjs','src/assets/navigation.js']) {
 const result=spawnSync(process.execPath,['--check',path.join(root,filename)],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
}
const notFound=await readFile(path.join(directory,'404.html'),'utf8');assert(notFound.includes('noindex')&&notFound.includes('自己紹介へ戻る'));
console.log('Checks passed: TOP + 3詳細、全相互リンク・アンカー・戻り先・2mailto・内容・画像・配信範囲・JS構文');
