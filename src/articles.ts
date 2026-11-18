import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ask, message, save } from '@tauri-apps/plugin-dialog';
import { readDir, readFile, readTextFile, writeFile, writeTextFile, mkdir, remove, exists } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { $, S, urls, dirty, Esc, Status, Dirty, ToWebp } from './common';
import { ZipBuild, ZipRead } from './zip';

type Article = {
    id: string; date: string; title: string; author: string; body: string; desc: string;
    thumb: string; legacy: boolean; legacyThumb?: string;
    cards: Record<string, Card>;   // リンクカードの情報(URL → タイトルなど)。記事のHTMLに一緒に書き込む
};

let articles: Article[] = [];
let cur: Article | null = null;

const SITE = 'https://www.creative-staff.com';
const SITE_NAME = 'CreativeStaff';
const TW_ACCOUNT = '@creative_staff';

const ImgRe = /!\[(?:\\.|[^\]\\])*\]\(([^)\s]+)\)/g;
const Images = (md: string) => [...md.matchAll(ImgRe)].map(m => m[1]).filter(s => !/^(https?:|\/)/.test(s));
const Thumb = (a: Article) => { const t = a.thumb || Images(a.body)[0] || ''; return t ? `${a.id}/${t}` : ''; };
const Sorted = () => articles.slice().sort((a, b) => b.date.localeCompare(a.date));

// 記事: 一覧画面 / 編集画面の切り替え
export function ShowView(v: 'list' | 'edit')
{
    $('#v-list').hidden = v !== 'list';
    $('#v-edit').hidden = v !== 'edit';
    window.scrollTo(0, 0);
}

// 画像1枚だけの段落を、中央揃えの <figure> + キャプションにする
// ---------------------------------------------------------------- リンクカード(URLだけの行)
// Twitter・YouTube・ニコニコ動画以外のURLだけの行は、リンクカード(タイトル・説明・画像つき)になる。
// カードの中身は、エディターで一度だけ外部のサービス(Microlink)から取得して、記事のHTMLに書き込む。
// なので公開ページは外部のサービスを呼ばない。取得できなかったURLは、URLだけのカードになる。
type Card = { title: string; desc: string; image: string; site: string };

function MakeCard(url: string, c?: Card): HTMLElement
{
    const part = (cls: string, text: string) =>
    {
        const el = document.createElement('span');
        el.className = `link-card__${cls}`;
        el.textContent = text;
        return el;
    };
    let host = '';
    try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { }

    const a = document.createElement('a');
    a.className = 'link-card';
    a.href = url;
    if (c?.image && /^https?:\/\//.test(c.image))
    {
        const wrap = document.createElement('span');
        wrap.className = 'link-card__img';
        const img = document.createElement('img');
        img.src = c.image;
        img.alt = '';
        img.loading = 'lazy';
        wrap.append(img);
        a.append(wrap);
    }
    const body = document.createElement('span');
    body.className = 'link-card__body';
    body.append(part('title', c?.title || url));
    if (c?.desc) body.append(part('desc', c.desc));
    body.append(part('site', c?.site || host));
    a.append(body);
    return a;
}

const cardPending = new Set<string>();
const cardFailed = new Set<string>();
let cardTimer = 0;

async function FetchCard(url: string): Promise<Card | null>
{
    const res = await fetch('https://api.microlink.io/?url=' + encodeURIComponent(url));
    if (!res.ok) return null;
    const j = await res.json();
    const d = j?.data;
    if (j?.status !== 'success' || !d) return null;
    const title = String(d.title ?? '').trim();
    const desc = String(d.description ?? '').trim().slice(0, 200);
    if (!title && !desc) return null;
    return { title, desc, image: d.image?.url ?? d.logo?.url ?? '', site: String(d.publisher ?? '').trim() };
}

// 入力が止まってから、情報のないカードのURLだけを取得する(打っている途中のURLで呼ばないため)
function ScheduleCards()
{
    clearTimeout(cardTimer);
    cardTimer = window.setTimeout(FetchCards, 800);
}

async function FetchCards()
{
    const a = cur;
    if (!a || a.legacy) return;
    const todo = new Set([...document.querySelectorAll('#p_text a.link-card')]
        .map(el => el.getAttribute('href') ?? '')
        .filter(u => u && !a.cards[u] && !cardPending.has(u) && !cardFailed.has(u)));
    if (todo.size === 0) return;
    Status('リンク先の情報を取得しています…');
    let failed = 0;
    for (const u of todo)
    {
        cardPending.add(u);
        try
        {
            const c = await FetchCard(u);
            if (c) { a.cards[u] = c; Dirty(); } else { cardFailed.add(u); failed++; }
        }
        catch { cardFailed.add(u); failed++; }
        cardPending.delete(u);
    }
    if (failed) Status(`リンク先の情報を取得できなかったURLがあります(URLだけのカードで表示します)`);
    if (cur === a) Preview();
}

// ---------------------------------------------------------------- 埋め込み(URLだけの行)
// 本文に Twitter / YouTube / ニコニコ動画のURLだけの行を書くと、埋め込みになる(公開ページもプレビューも同じ)。
type Embed = { kind: 'twitter' | 'video'; label: string; html: string };

function ParseEmbed(url: string): Embed | null
{
    const video = (label: string, src: string): Embed => ({
        kind: 'video', label,
        html: `<iframe src="${src}" title="${label}" loading="lazy" allowfullscreen ` +
              `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`
    });
    let m: RegExpMatchArray | null;

    // Twitter / X(x.com も twitter.com に直して埋め込む)
    if ((m = url.match(/^https?:\/\/(?:www\.|mobile\.)?(?:twitter|x)\.com\/(\w+)\/status\/(\d+)/)))
    {
        const u = `https://twitter.com/${m[1]}/status/${m[2]}`;
        return { kind: 'twitter', label: 'Twitter', html: `<blockquote class="twitter-tweet" data-lang="ja"><a href="${u}">${u}</a></blockquote>` };
    }
    // YouTube(watch?v= / youtu.be / shorts / embed)
    if ((m = url.match(/^https?:\/\/(?:www\.|m\.)?youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/)([\w-]{11})/)) ||
        (m = url.match(/^https?:\/\/youtu\.be\/([\w-]{11})/)))
        return video('YouTube', `https://www.youtube-nocookie.com/embed/${m[1]}`);
    // ニコニコ動画
    if ((m = url.match(/^https?:\/\/(?:www\.)?nicovideo\.jp\/watch\/((?:sm|nm|so)?\d+)/)) ||
        (m = url.match(/^https?:\/\/nico\.ms\/((?:sm|nm|so)\d+)/)))
        return video('ニコニコ動画', `https://embed.nicovideo.jp/watch/${m[1]}`);
    return null;
}

function RenderBody(md: string, cards: Record<string, Card> = {}): HTMLElement
{
    const box = document.createElement('div');
    // 独自タグ(赤字・大きい文字・太字)は消さずに残す
    // 画像のキャプションは ![1行目⏎2行目](画像) のように、[ ] の中で改行して複数行にできる。
    // marked は [ ] 内の改行を消してしまうので、先に \n(バックスラッシュとn)に置き換えておく
    md = md.replace(/!\[((?:\\.|[^\]\\])*)\]\(([^)\s]+)\)/g, (_m, alt: string, src: string) => `![${alt.replace(/\s*\r?\n\s*/g, '\\n')}](${src})`);
    const html = marked.parse(md, { breaks: true, async: false }) as string;
    box.innerHTML = DOMPurify.sanitize(html, { ADD_TAGS: ['red', 'bold', 'big-font'] });
    box.querySelectorAll('p').forEach(p =>
    {
        const img = p.querySelector(':scope > img');
        if (!img || p.children.length !== 1 || (p.textContent ?? '').trim() !== '') return;
        const fig = document.createElement('figure');
        fig.append(img);
        const alt = (img as HTMLImageElement).alt;
        if (alt)
        {
            // 上で置き換えた改行(\n)で、行に分ける
            const lines = alt.split('\\n');
            const cap = document.createElement('figcaption');
            lines.forEach((line, i) => { if (i) cap.append(document.createElement('br')); cap.append(line); });
            (img as HTMLImageElement).alt = lines.join(' ');
            fig.append(cap);
        }
        p.replaceWith(fig);
    });
    // URLだけの段落 → 埋め込み
    box.querySelectorAll('p').forEach(p =>
    {
        const a = p.querySelector(':scope > a');
        const url = a?.getAttribute('href') ?? '';
        if (!a || p.children.length !== 1 || (p.textContent ?? '').trim() !== url) return;
        const e = ParseEmbed(url);
        if (!e)
        {
            if (/^https?:\/\/\S+\.\S+$/.test(url)) p.replaceWith(MakeCard(url, cards[url]));   // ほかのURL → リンクカード
            return;
        }
        const div = document.createElement('div');
        div.className = `embed embed--${e.kind}`;
        div.dataset.url = url;
        div.innerHTML = e.html;
        p.replaceWith(div);
    });
    // 見出し(##・###)に番号付きの id を付ける(目次のリンク先)
    const heads = [...box.querySelectorAll<HTMLElement>('h2, h3')];
    heads.forEach((h, i) => { h.id = `sec-${i + 1}`; });
    // [目次] だけの段落 → 目次(見出しがなければ何も出さない)
    box.querySelectorAll('p').forEach(p =>
    {
        if (p.children.length !== 0 || (p.textContent ?? '').trim() !== '[目次]') return;
        if (heads.length === 0) { p.remove(); return; }
        const nav = document.createElement('nav');
        nav.className = 'toc';
        nav.innerHTML = '<div class="toc-title">目次</div><ul>' +
            heads.map(h => `<li class="toc-${h.tagName.toLowerCase()}"><a class="toc-link" href="#${h.id}">${Esc(h.textContent ?? '')}</a></li>`).join('') + '</ul>';
        p.replaceWith(nav);
    });
    box.querySelectorAll('a:not(.toc-link)').forEach((a: any) => { a.target = '_blank'; a.rel = 'noopener'; });
    return box;
}

// 説明文の自動生成: 本文の最初の約100文字(画像のキャプションは除く)
function AutoDesc(md: string): string
{
    const box = RenderBody(md);
    box.querySelectorAll('figure, .embed, .toc, .link-card').forEach(f => f.remove());
    box.querySelectorAll('br').forEach(b => b.replaceWith(' '));
    return (box.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 100);
}

// 記事1本分のHTMLを作る(本文は表示用HTMLと、編集用のmdの両方を入れる)
function BuildHtml(a: Article): string
{
    const [y, m, d] = a.date.split('-').map(Number);
    const md = a.body.replace(/<\//g, '<\\/');
    // アイキャッチは、選んだサムネイル(自動なら最初の画像)。記事と同じフォルダの画像を指す
    const eye = a.thumb || Images(a.body)[0] || '';
    const body = RenderBody(a.body, a.cards);
    // カードの情報は、この記事で使っているURLの分だけ書き込む
    const meta: Record<string, Card> = {};
    body.querySelectorAll('a.link-card').forEach(el => { const u = el.getAttribute('href') ?? ''; if (a.cards[u]) meta[u] = a.cards[u]; });
    const metaScript = Object.keys(meta).length
        ? `\n<script type="application/json" id="link-meta">${JSON.stringify(meta).replace(/</g, '\\u003c')}<\/script>` : '';
    // ツイートの埋め込みがある記事だけ、Twitter の埋め込み用スクリプトを読み込む
    const twitterScript = body.querySelector('.embed--twitter') ? '\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"><\/script>' : '';
    const eyeHtml = eye ? `<img class="eyecatch" src="${Esc(eye)}" alt="">` : '';

    // meta / OGP
    const desc = a.desc.trim() || AutoDesc(a.body);
    const url = `${SITE}/articles/${a.id}/article.html`;
    const img = eye ? `${SITE}/articles/${a.id}/${eye}` : '';
    const metaHtml = `<!-- OGP -->
<meta name="description" content="${Esc(desc)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:locale" content="ja_JP" />
<meta property="og:title" content="${Esc(a.title)} | ${SITE_NAME}" />
<meta property="og:description" content="${Esc(desc)}" />
<meta property="og:url" content="${url}" />
${img ? `<meta property="og:image" content="${Esc(img)}" />\n` : ''}<meta name="twitter:card" content="${img ? 'summary_large_image' : 'summary'}" />
<meta name="twitter:site" content="${TW_ACCOUNT}" />
<meta property="article:published_time" content="${a.date}" />
<link rel="canonical" href="${url}" />`;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${Esc(a.title)}</title>
<link rel="icon" href="../../cgls/favicon.ico" />
<link rel="stylesheet" href="../article.css">
<link rel="stylesheet" href="../../css/main.css" />
<link rel="stylesheet" href="../../css/toppage.css" />
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://code.jquery.com/jquery-3.7.1.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"><\/script>
${metaHtml}
</head>
<body>
<div id="header"></div>

<div id="content-main">
    <article class="Article">
        ${eyeHtml}
        <h1>${Esc(a.title)}</h1>
        <p class="date">${y}年${m}月${d}日${a.author ? ` / 執筆: <a href="../list.html?author=${Esc(encodeURIComponent(a.author))}">${Esc(a.author)}</a>` : ''}</p>

        <div class="Honbun">
${body.innerHTML}
        </div>
    </article>
</div>

<div id="footer"></div>

<script type="text/markdown" id="source-md">${md}<\/script>${metaScript}
<script src="../../js/main.js" charset="utf-8"><\/script>
<script src="../../js/cre_navigation.js" charset="utf-8"><\/script>${twitterScript}
</body>
</html>
`;
}

// ---------------------------------------------------------------- フォルダ操作
async function EnsureDir()
{
    if (!(await exists(S.art))) await mkdir(S.art, { recursive: true });
}

export const ArticleCount = () => articles.length;

// 記事を読み込む。読めなければ false(フォルダの状態は変えない)
export async function ALoad(path: string): Promise<boolean>
{
    const artDir = await join(path, 'articles');
    const list: Article[] = [];
    try
    {
        const jsonPath = await join(artDir, 'articles.json');
        if (await exists(jsonPath))
        {
            const json = JSON.parse(await readTextFile(jsonPath));
            for (const j of json)
            {
                const a: Article = {
                    id: j.id, date: j.date || '', title: j.title || '', author: j.author || '', body: '', desc: '',
                    thumb: '', legacy: false, legacyThumb: j.thumbnail || '', cards: {}
                };
                try
                {
                    const text = await readTextFile(await join(artDir, j.id, 'article.html'));
                    const doc = new DOMParser().parseFromString(text, 'text/html');
                    try { a.cards = JSON.parse(doc.getElementById('link-meta')?.textContent ?? '{}'); } catch { }
                    const src = doc.getElementById('source-md');
                    if (src) a.body = (src.textContent ?? '').replace(/<\\\//g, '</');
                    else a.legacy = true;
                    // 説明文を復元(自動生成と同じ内容なら「空=自動」に戻す)
                    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
                    a.desc = metaDesc && metaDesc !== AutoDesc(a.body) ? metaDesc : '';
                }
                catch { a.legacy = true; }  // 変換前の記事(フォルダ形式など)
                const first = Images(a.body)[0] || '';
                const t = (j.thumbnail || '').startsWith(j.id + '/') ? j.thumbnail.slice(j.id.length + 1) : '';
                a.thumb = t && t !== first ? t : '';
                list.push(a);
            }
        }
    }
    catch (e) { await message('articles.json を読めませんでした: ' + e, { kind: 'error' }); return false; }


    S.root = path; S.art = artDir; articles = list; cur = null;
    $('#form').disabled = true;
    artPage = 1;
    RenderList(); Preview(); RenderAuthors();
    return true;
}

export async function ASave(): Promise<boolean>
{
    try
    {
        await EnsureDir();
        for (const a of articles)
        {
            if (a.legacy) continue;  // 変換前の記事はそのまま触らない
            await mkdir(await join(S.art, a.id), { recursive: true });
            await writeTextFile(await join(S.art, a.id, 'article.html'), BuildHtml(a));
        }
        const json = Sorted().map(a => ({
            id: a.id, date: a.date, title: a.title, ...(a.author ? { author: a.author } : {}),
            thumbnail: a.legacy ? (a.legacyThumb ?? '') : Thumb(a)
        }));
        await writeTextFile(await join(S.art, 'articles.json'), JSON.stringify(json, null, 2));
        return true;
    }
    catch (e) { await message('保存できませんでした: ' + e, { kind: 'error' }); return false; }
}
// ---------------------------------------------------------------- 記事一覧
// 作者の入力候補(これまでに使った作者名)
function RenderAuthors()
{
    const names = [...new Set(articles.map(a => a.author).filter(Boolean))].sort((x, y) => x.localeCompare(y, 'ja'));
    $('#authors').replaceChildren(...names.map(n => { const o = document.createElement('option'); o.value = n; return o; }));
}

// ページ送り(記事一覧だけ。1ページの件数はここで変える)
const ART_PER_PAGE = 24;
let artPage = 1;

// 表示する番号の並び。例: [1, '…', 4, 5, 6, '…', 20]
function PageItems(page: number, pages: number): (number | '…')[]
{
    const nums = [...new Set([1, pages, page - 1, page, page + 1])].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);
    const out: (number | '…')[] = [];
    let prev = 0;
    for (const n of nums) { if (n - prev > 1) out.push('…'); out.push(n); prev = n; }
    return out;
}

function RenderPager(total: number)
{
    const box = $('#pager') as HTMLElement;
    const pages = Math.max(1, Math.ceil(total / ART_PER_PAGE));
    box.replaceChildren();
    box.hidden = pages <= 1;
    if (pages <= 1) return;

    const btn = (label: string, disabled: boolean, go: number, current = false) =>
    {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pager__btn';
        b.textContent = label;
        b.disabled = disabled;
        if (current) b.setAttribute('aria-current', 'page');
        else if (!disabled) b.onclick = () => { artPage = go; RenderList(); $('#v-list').scrollTop = 0; };
        return b;
    };
    box.append(btn('‹', artPage === 1, artPage - 1));
    for (const it of PageItems(artPage, pages))
    {
        if (it === '…')
        {
            const gap = document.createElement('span');
            gap.className = 'pager__gap';
            gap.textContent = '…';
            box.append(gap);
        }
        else box.append(btn(String(it), false, it, it === artPage));
    }
    box.append(btn('›', artPage === pages, artPage + 1));
}

function RenderList()
{
    const all = Sorted();
    artPage = Math.min(Math.max(1, artPage), Math.max(1, Math.ceil(all.length / ART_PER_PAGE)));
    RenderPager(all.length);
    $('#list').replaceChildren(...all.slice((artPage - 1) * ART_PER_PAGE, artPage * ART_PER_PAGE).map(a =>
    {
        const b = document.createElement('button');
        b.className = 'item item--thumb' + (a === cur ? ' now' : '');
        b.innerHTML = '<img class="item__img" alt=""><div class="item__txt"><small></small><span></span></div>';
        const txt = b.querySelector('.item__txt') as HTMLElement;
        txt.children[0].textContent = a.date + (a.author ? '  ' + a.author : '');
        txt.children[1].textContent = (a.title || '(無題)') + (a.legacy ? ' [変換前]' : '');
        const rel = a.legacy ? (a.legacyThumb ?? '') : Thumb(a);
        ResolveThumb(b.querySelector('.item__img') as HTMLImageElement, rel);
        b.onclick = () => Select(a);
        return b;
    }));
}

// 一覧用のサムネ: articles/ からの相対パス(例: 20261115_9xav/1.webp)を読む。無ければ空の枠のまま
async function ResolveThumb(img: HTMLImageElement, rel: string)
{
    if (!S.art || !rel) return;
    const key = 'thumb/' + rel;
    let url = urls.get(key);
    if (!url)
    {
        try
        {
            const bytes = await readFile(await join(S.art, ...rel.split('/')));
            url = URL.createObjectURL(new Blob([bytes], { type: 'image/webp' }));
            urls.set(key, url);
        }
        catch { return; }
    }
    img.src = url;
}

function Select(a: Article)
{
    cur = a;
    if (a.legacy)
    {
        $('#form').disabled = true;
        RenderList(); Preview();
        Status('この記事は変換前です。変換用ツールで変換してください');
        return;
    }
    $('#form').disabled = false;
    $('#date').value = a.date;
    $('#title').value = a.title;
    $('#author').value = a.author;
    $('#desc').value = a.desc;
    $('#body').value = a.body;
    RenderThumbs();
    RenderDescHint();
    RenderList(); Preview();
    ShowView('edit');
}

function RenderThumbs()
{
    if (!cur) return;
    const sel = $('#thumb');
    const imgs = [...new Set(Images(cur.body))];
    sel.replaceChildren(new Option('自動(最初の画像)', ''), ...imgs.map(s => new Option(s, s)));
    if (cur.thumb && !imgs.includes(cur.thumb)) cur.thumb = '';
    sel.value = cur.thumb;
}

// 説明文が空のとき、自動生成される内容を薄い文字で見せる
function RenderDescHint()
{
    $('#desc').placeholder = cur ? AutoDesc(cur.body) : '';
}

function ArtNew()
{
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    // id は記事フォルダ名。作ったあとは変えない
    const id = date.replace(/-/g, '') + '_' + Math.random().toString(36).slice(2, 6);
    let last = ''; try { last = localStorage.getItem('cs-last-author') ?? ''; } catch { }  // 前回の作者を初期値にする
    const a: Article = { id, date, title: '', author: last, body: '', desc: '', thumb: '', legacy: false, cards: {} };
    articles.push(a);
    artPage = 1;   // 新しい記事は日付が新しいので、1ページ目に出る
    Dirty();
    Select(a);
    $('#title').focus();
}

$('#del').onclick = async () =>
{
    if (!cur || !(await ask('この記事のフォルダごと削除します(画像も消えます)。', { kind: 'warning' }))) return;
    const id = cur.id;
    articles = articles.filter(a => a !== cur);
    cur = null;
    $('#form').disabled = true;
    try
    {
        const dir = await join(S.art, id);
        if (await exists(dir)) await remove(dir, { recursive: true });
    } catch {}
    RenderList(); Preview();
    ShowView('list');
    if (await ASave()) { dirty.delete('art'); Status('記事を保存しました'); }   // 削除は、すぐ保存する
};

$('#date').oninput  = (e: any) => { if (!cur) return; cur.date  = e.target.value; Dirty(); RenderList(); Preview(); };
$('#title').oninput = (e: any) => { if (!cur) return; cur.title = e.target.value; Dirty(); RenderList(); Preview(); };
$('#thumb').onchange = (e: any) => { if (!cur) return; cur.thumb = e.target.value; Dirty(); };
$('#author').oninput = (e: any) =>
{
    if (!cur) return;
    cur.author = e.target.value.trim();
    try { localStorage.setItem('cs-last-author', cur.author); } catch { }
    Dirty(); RenderList(); Preview(); RenderAuthors();
};
$('#desc').oninput  = (e: any) => { if (!cur) return; cur.desc  = e.target.value; Dirty(); };
$('#body').oninput  = (e: any) => { if (!cur) return; cur.body  = e.target.value; Dirty(); RenderThumbs(); RenderDescHint(); Preview(); };

// ---------------------------------------------------------------- 書式ツールバー
// 選択範囲を前後の文字で囲む(選択がなければ仮の文字を入れて選択状態にする)
function Wrap(before: string, after: string, placeholder: string)
{
    const t = $('#body');
    const s = t.selectionStart;
    const sel = t.value.slice(s, t.selectionEnd) || placeholder;
    t.setRangeText(before + sel + after, s, t.selectionEnd, 'end');
    t.setSelectionRange(s + before.length, s + before.length + sel.length);
    t.focus();
    t.dispatchEvent(new Event('input'));
}

// 選択している行の先頭に記号を付ける(見出し・リスト・引用)
function LinePrefix(prefix: string)
{
    const t = $('#body');
    const start = t.selectionStart === 0 ? 0 : t.value.lastIndexOf('\n', t.selectionStart - 1) + 1;
    const nl = t.value.indexOf('\n', t.selectionEnd);
    const end = nl < 0 ? t.value.length : nl;
    const text = t.value.slice(start, end).split('\n').map((l: string) => prefix + l).join('\n');
    t.setRangeText(text, start, end, 'end');
    t.focus();
    t.dispatchEvent(new Event('input'));
}

// 区切り線・目次などは前後に空行が要るので、空行ごと入れる
function InsertBlock(text: string)
{
    const t = $('#body');
    t.setRangeText(`\n\n${text}\n\n`, t.selectionStart, t.selectionEnd, 'end');
    t.focus();
    t.dispatchEvent(new Event('input'));
}
const InsertHr = () => InsertBlock('---');

// 埋め込み: URLだけの行を入れる(選択中のURLがあればそれを使う)。入れたあと、カーソルはURLの末尾に置く
function InsertEmbed()
{
    const t = $('#body');
    const s = t.selectionStart;
    const sel = t.value.slice(s, t.selectionEnd).trim();
    const url = /^https?:\/\/\S+$/.test(sel) ? sel : 'https://';
    t.setRangeText(`\n\n${url}\n\n`, s, t.selectionEnd, 'end');
    t.setSelectionRange(s + 2 + url.length, s + 2 + url.length);
    t.focus();
    t.dispatchEvent(new Event('input'));
}

$('#tools').addEventListener('click', (e: Event) =>
{
    const b = (e.target as HTMLElement).closest('button');
    if (!b || !cur || cur.legacy) return;
    switch (b.dataset.f)
    {
        case 'h':   LinePrefix('## '); break;
        case 'b':   Wrap('**', '**', '太字'); break;
        case 'red': Wrap('<red>', '</red>', '赤字'); break;
        case 'big': Wrap('<big-font>', '</big-font>', '大きい文字'); break;
        case 'ul':  LinePrefix('- '); break;
        case 'q':   LinePrefix('> '); break;
        case 'hr':  InsertHr(); break;
        case 'a':   Wrap('[', '](https://)', 'リンク文字'); break;
        case 'embed': InsertEmbed(); break;
        case 'toc': InsertBlock('[目次]'); break;
    }
});

// ---------------------------------------------------------------- プレビュー
// 目次のリンクは、プレビューの中で該当の見出しまでスクロールする
$('#p_text').addEventListener('click', (e: Event) =>
{
    const a = (e.target as HTMLElement).closest('a.toc-link');
    if (!a) return;
    e.preventDefault();
    document.getElementById((a.getAttribute('href') ?? '').slice(1))?.scrollIntoView({ behavior: 'smooth' });
});

// 埋め込みは、入力のたびに作り直すと動画やツイートが読み込み直しになる。
// そこで、同じURLの埋め込みは前回の要素をそのまま使い回す(動かさなければ再読み込みされない)
const embedCache = new Map<string, HTMLElement>();

function Reconcile(target: HTMLElement, fresh: HTMLElement)
{
    const used = new Map<string, HTMLElement>();
    const count = new Map<string, number>();
    const holders = new Map<Node, HTMLElement>();   // 目印 → 使い回す前回の要素
    const newTweets: HTMLElement[] = [];
    fresh.querySelectorAll<HTMLElement>('.embed').forEach(el =>
    {
        const n = (count.get(el.dataset.url ?? '') ?? 0) + 1;
        count.set(el.dataset.url ?? '', n);
        const key = `${el.dataset.url}#${n}`;      // 同じURLを2回貼ってもそれぞれ別に扱う
        const old = embedCache.get(key);
        if (old)
        {
            const mark = document.createComment(key);   // 前回の要素は動かさず、目印だけ置く
            el.replaceWith(mark);
            holders.set(mark, old);
        }
        else if (el.classList.contains('embed--twitter')) newTweets.push(el);
        used.set(key, old ?? el);
    });
    embedCache.clear();
    used.forEach((el, key) => embedCache.set(key, el));

    // 使い回す埋め込み以外を消してから、順番に差し込む(埋め込みは動かさない)
    const keep = new Set<Node>(used.values());
    [...target.childNodes].forEach(n => { if (!keep.has(n)) n.remove(); });
    let ref: ChildNode | null = target.firstChild;
    for (const n of [...fresh.childNodes])
    {
        const node: Node = holders.get(n) ?? n;
        if (node === ref) ref = ref.nextSibling;
        else target.insertBefore(node, ref);
    }
    newTweets.forEach(LoadTweet);
}

// ツイートは Twitter 公式のスクリプトで描く(初回に1度だけ読み込む)
function LoadTweet(el: HTMLElement)
{
    const w = (window as any).twttr;
    if (w?.widgets) { w.widgets.load(el); return; }
    if (document.getElementById('twitter-widgets')) return;   // 読み込み中。終わると、いまある分を全部描く
    const sc = document.createElement('script');
    sc.id = 'twitter-widgets';
    sc.async = true;
    sc.src = 'https://platform.twitter.com/widgets.js';
    document.head.append(sc);
}

export function Preview()
{
    const a = cur && !cur.legacy ? cur : null;
    $('#p_date').textContent = a ? a.date + (a.author ? ` / 執筆: ${a.author}` : '') : '';
    $('#p_title').textContent = a?.title ?? '';
    Reconcile($('#p_text'), RenderBody(a?.body ?? '', a?.cards));
    ScheduleCards();
    if (a) $('#p_text').querySelectorAll('img').forEach((img: HTMLImageElement) => ResolveImage(img, a.id));
}

// 画像は選んだフォルダから直接読む
async function ResolveImage(img: HTMLImageElement, id: string)
{
    const src = img.getAttribute('src') ?? '';
    if (!S.root || /^(https?:|\/|blob:)/.test(src)) return;
    const key = id + '/' + src;
    let url = urls.get(key);
    if (!url)
    {
        try
        {
            const bytes = await readFile(await join(S.art, id, src));
            url = URL.createObjectURL(new Blob([bytes], { type: 'image/webp' }));
            urls.set(key, url);
        }
        catch { return; }
    }
    img.src = url;
}

// ---------------------------------------------------------------- 画像の取り込み
async function AddImages(files: File[])
{
    if (!S.root || !cur || cur.legacy) { await message('フォルダを選び、記事を選んでから入れてください'); return; }

    // 画像は articles/<記事id>/<番号>.webp に保存
    const dir = await join(S.art, cur.id);
    await mkdir(dir, { recursive: true });
    let n = 0;
    for (const e of await readDir(dir))
    {
        const m = e.name.match(/^(\d+)\.webp$/);
        if (m) n = Math.max(n, parseInt(m[1]));
    }

    let text = '';
    for (const f of files)
    {
        if (!f.type.startsWith('image/')) continue;
        const blob = await ToWebp(f);
        if (!blob) continue;
        const name = `${++n}.webp`;
        await writeFile(await join(dir, name), new Uint8Array(await blob.arrayBuffer()));
        text += `\n\n![](${name})\n\n`;
    }
    if (!text) return;

    // 挿入後は、最後の画像のキャプション欄 ![ここ](…) にカーソルを置く
    const t = $('#body');
    t.setRangeText(text, t.selectionStart, t.selectionEnd, 'end');
    const i = t.value.lastIndexOf('![](', t.selectionStart) + 2;
    t.setSelectionRange(i, i);
    t.focus();
    t.dispatchEvent(new Event('input'));
    Status('画像を保存しました(記事の保存も忘れずに)');
}

$('#addimg').onclick = () => $('#file').click();
$('#file').onchange = (e: any) => { AddImages([...e.target.files]); e.target.value = ''; };
$('#body').addEventListener('dragover', (e: Event) => e.preventDefault());
$('#body').addEventListener('drop', (e: DragEvent) =>
{
    if (e.dataTransfer?.files.length) { e.preventDefault(); AddImages([...e.dataTransfer.files]); }
});
$('#body').addEventListener('paste', (e: ClipboardEvent) =>
{
    const files = [...(e.clipboardData?.files ?? [])];
    if (files.length) { e.preventDefault(); AddImages(files); }
});



$('#new').onclick = ArtNew;
$('#back').onclick = () => ShowView('list');

// ---------------------------------------------------------------- 記事の書き出し / 取り込み(ZIP)
// 書き出し: 編集中の内容(未保存でも)と画像を、1つのZIPにする
$('#export').onclick = async () =>
{
    if (!cur || cur.legacy) return;
    const a = cur;
    try
    {
        const meta = { date: a.date, title: a.title, author: a.author, desc: a.desc, thumb: a.thumb, body: a.body, cards: a.cards };
        const files = [{ name: 'article.json', data: new TextEncoder().encode(JSON.stringify(meta, null, 2)) }];
        const dir = await join(S.art, a.id);
        if (await exists(dir))
            for (const e of await readDir(dir))
                if (e.isFile && /\.(webp|png|jpe?g|gif)$/i.test(e.name))
                    files.push({ name: 'img/' + e.name, data: await readFile(await join(dir, e.name)) });
        const path = await save({
            defaultPath: `${a.date}_${a.title || 'article'}.zip`.replace(/[\\/:*?"<>|]/g, '_'),
            filters: [{ name: '記事', extensions: ['zip'] }]
        });
        if (!path) return;
        await writeFile(path, ZipBuild(files));
        Status('記事を書き出しました');
    }
    catch (e) { await message('書き出せませんでした: ' + e, { kind: 'error' }); }
};

// 取り込み: 新しい記事として追加する。フォルダ名は、元の名前を使わず毎回つけ直す
$('#import').onclick = () => $('#zipfile').click();
$('#zipfile').onchange = async (e: any) =>
{
    const f: File | undefined = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (!S.root) { await message('先にサイトのフォルダを選んでください'); return; }
    try
    {
        const files = ZipRead(new Uint8Array(await f.arrayBuffer()));
        const j = files.find(x => x.name === 'article.json');
        if (!j) throw new Error('article.json がありません');
        const m = JSON.parse(new TextDecoder().decode(j.data));

        const p = (n: number) => String(n).padStart(2, '0');
        const t = new Date();
        const date = /^\d{4}-\d{2}-\d{2}$/.test(m.date) ? m.date : `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
        // 本文の日付からフォルダ名を作る(既存の記事と重ならないようにする)
        let id: string;
        do { id = date.replace(/-/g, '') + '_' + Math.random().toString(36).slice(2, 6); }
        while (articles.some(a => a.id === id));

        const dir = await join(S.art, id);
        await mkdir(dir, { recursive: true });
        for (const x of files)
        {
            const n = x.name.startsWith('img/') ? x.name.slice(4) : '';
            if (!/^[\w.-]+\.(webp|png|jpe?g|gif)$/i.test(n)) continue;   // 画像以外・パス付きは無視
            await writeFile(await join(dir, n), x.data);
        }
        const a: Article = {
            id, date, title: m.title || '', author: m.author || '', body: m.body || '',
            desc: m.desc || '', thumb: m.thumb || '', legacy: false, cards: m.cards || {}
        };
        articles.push(a);
        artPage = 1;
        Dirty();
        Select(a);
        Status('記事を取り込みました(保存を押すと記事が確定します)');
    }
    catch (err) { await message('取り込めませんでした: ' + err, { kind: 'error' }); }
};
