import './styles.css';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { open, ask, message } from '@tauri-apps/plugin-dialog';
import { readDir, readFile, readTextFile, writeFile, writeTextFile, mkdir, remove, exists } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

type Article = {
    id: string; date: string; title: string; author: string; body: string; desc: string;
    thumb: string; legacy: boolean; legacyThumb?: string;
};

const $ = (s: string) => document.querySelector(s) as any;
let root = '', art = '';
let articles: Article[] = [];
let cur: Article | null = null;
let mode: 'art' | 'hist' = 'art';
const urls = new Map<string, string>();

const SITE = 'https://www.creative-staff.com';
const SITE_NAME = 'CreativeStaff';
const TW_ACCOUNT = '@creative_staff';

const ImgRe = /!\[[^\]]*\]\(([^)\s]+)\)/g;
const Images = (md: string) => [...md.matchAll(ImgRe)].map(m => m[1]).filter(s => !/^(https?:|\/)/.test(s));
const Thumb = (a: Article) => { const t = a.thumb || Images(a.body)[0] || ''; return t ? `${a.id}/${t}` : ''; };
const Sorted = () => articles.slice().sort((a, b) => b.date.localeCompare(a.date));
const Esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]);

function Status(msg: string) { $('#status').textContent = msg; }
function Dirty(v = true) { if (v) Status('未保存の変更があります'); }

// 画像1枚だけの段落を、中央揃えの <figure> + キャプションにする
function RenderBody(md: string): HTMLElement
{
    const box = document.createElement('div');
    // 独自タグ(赤字・大きい文字・太字)は消さずに残す
    const html = marked.parse(md, { breaks: true, async: false }) as string;
    box.innerHTML = DOMPurify.sanitize(html, { ADD_TAGS: ['red', 'bold', 'big-font'] });
    box.querySelectorAll('p').forEach(p =>
    {
        const img = p.querySelector(':scope > img');
        if (!img || p.children.length !== 1 || (p.textContent ?? '').trim() !== '') return;
        const fig = document.createElement('figure');
        fig.append(img);
        if ((img as HTMLImageElement).alt)
        {
            const cap = document.createElement('figcaption');
            cap.textContent = (img as HTMLImageElement).alt;
            fig.append(cap);
        }
        p.replaceWith(fig);
    });
    box.querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
    return box;
}

// 説明文の自動生成: 本文の最初の約100文字(画像のキャプションは除く)
function AutoDesc(md: string): string
{
    const box = RenderBody(md);
    box.querySelectorAll('figure').forEach(f => f.remove());
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
${RenderBody(a.body).innerHTML}
        </div>
    </article>
</div>

<div id="footer"></div>

<script type="text/markdown" id="source-md">${md}<\/script>
<script src="../../js/main.js" charset="utf-8"><\/script>
<script src="../../js/cre_navigation.js" charset="utf-8"><\/script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- フォルダ操作
async function EnsureDir()
{
    if (!(await exists(art))) await mkdir(art, { recursive: true });
}

async function LoadFolder(path: string, remember = true): Promise<boolean>
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
                    thumb: '', legacy: false, legacyThumb: j.thumbnail || ''
                };
                try
                {
                    const text = await readTextFile(await join(artDir, j.id, 'article.html'));
                    const doc = new DOMParser().parseFromString(text, 'text/html');
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

    root = path; art = artDir; articles = list; cur = null;
    if (remember) localStorage.setItem('root', path);
    $('#new').disabled = $('#save').disabled = false;
    $('#open').hidden = true;  // フォルダを選んだら、選ぶボタンは消す
    $('#form').disabled = true;
    RenderList(); Preview(); RenderAuthors();
    await HLoad();
    Status(`${articles.length} 件の記事を読み込みました (${path})`);
    return true;
}

$('#open').onclick = async () =>
{
    const path = await open({ directory: true, recursive: true });
    if (typeof path === 'string') await LoadFolder(path);
};

async function Save()
{
    if (!root) return;
    if (mode === 'hist') { await HSave(); return; }
    try
    {
        await EnsureDir();
        for (const a of articles)
        {
            if (a.legacy) continue;  // 変換前の記事はそのまま触らない
            await mkdir(await join(art, a.id), { recursive: true });
            await writeTextFile(await join(art, a.id, 'article.html'), BuildHtml(a));
        }
        const json = Sorted().map(a => ({
            id: a.id, date: a.date, title: a.title, ...(a.author ? { author: a.author } : {}),
            thumbnail: a.legacy ? (a.legacyThumb ?? '') : Thumb(a)
        }));
        await writeTextFile(await join(art, 'articles.json'), JSON.stringify(json, null, 2));
        Status('保存しました');
    }
    catch (e) { await message('保存できませんでした: ' + e, { kind: 'error' }); }
}
$('#save').onclick = Save;
window.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); Save(); } });

// ---------------------------------------------------------------- 記事一覧
// 作者の入力候補(これまでに使った作者名)
function RenderAuthors()
{
    const names = [...new Set(articles.map(a => a.author).filter(Boolean))].sort((x, y) => x.localeCompare(y, 'ja'));
    $('#authors').replaceChildren(...names.map(n => { const o = document.createElement('option'); o.value = n; return o; }));
}

function RenderList()
{
    $('#list').replaceChildren(...Sorted().map(a =>
    {
        const b = document.createElement('button');
        b.className = 'item' + (a === cur ? ' now' : '');
        b.innerHTML = '<small></small><span></span>';
        b.children[0].textContent = a.date + (a.author ? '  ' + a.author : '');
        b.children[1].textContent = (a.title || '(無題)') + (a.legacy ? ' [変換前]' : '');
        b.onclick = () => Select(a);
        return b;
    }));
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

$('#new').onclick = () =>
{
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    // id は記事フォルダ名。作ったあとは変えない
    const id = date.replace(/-/g, '') + '_' + Math.random().toString(36).slice(2, 6);
    let last = ''; try { last = localStorage.getItem('cs-last-author') ?? ''; } catch { }  // 前回の作者を初期値にする
    const a: Article = { id, date, title: '', author: last, body: '', desc: '', thumb: '', legacy: false };
    articles.push(a);
    Dirty();
    Select(a);
    $('#title').focus();
};

$('#del').onclick = async () =>
{
    if (!cur || !(await ask('この記事のフォルダごと削除します(画像も消えます)。', { kind: 'warning' }))) return;
    const id = cur.id;
    articles = articles.filter(a => a !== cur);
    cur = null;
    $('#form').disabled = true;
    try
    {
        const dir = await join(art, id);
        if (await exists(dir)) await remove(dir, { recursive: true });
    } catch {}
    RenderList(); Preview();
    await Save();
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

// 区切り線は前後に空行がないと見出し扱いになるので、空行ごと入れる
function InsertHr()
{
    const t = $('#body');
    t.setRangeText('\n\n---\n\n', t.selectionStart, t.selectionEnd, 'end');
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
    }
});

// ---------------------------------------------------------------- プレビュー
function Preview()
{
    const a = cur && !cur.legacy ? cur : null;
    $('#p_date').textContent = a ? a.date + (a.author ? ` / 執筆: ${a.author}` : '') : '';
    $('#p_title').textContent = a?.title ?? '';
    const box = RenderBody(a?.body ?? '');
    $('#p_text').replaceChildren(...box.childNodes);
    if (a) $('#p_text').querySelectorAll('img').forEach((img: HTMLImageElement) => ResolveImage(img, a.id));
}

// 画像は選んだフォルダから直接読む
async function ResolveImage(img: HTMLImageElement, id: string)
{
    const src = img.getAttribute('src') ?? '';
    if (!root || /^(https?:|\/|blob:)/.test(src)) return;
    const key = id + '/' + src;
    let url = urls.get(key);
    if (!url)
    {
        try
        {
            const bytes = await readFile(await join(art, id, src));
            url = URL.createObjectURL(new Blob([bytes], { type: 'image/webp' }));
            urls.set(key, url);
        }
        catch { return; }
    }
    img.src = url;
}

// ---------------------------------------------------------------- 画像の取り込み
// 画像の大きさそのものを縮めて webp にする(幅の上限と画質はここで調整)
const MAX_WIDTH = 960, QUALITY = 0.8;
async function ToWebp(file: File): Promise<Blob | null>
{
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bmp.width);
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise(r => c.toBlob(r, 'image/webp', QUALITY));
}

async function AddImages(files: File[])
{
    if (!root || !cur || cur.legacy) { await message('フォルダを選び、記事を選んでから入れてください'); return; }

    // 画像は articles/<記事id>/<番号>.webp に保存
    const dir = await join(art, cur.id);
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


// ---------------------------------------------------------------- 年表 (about/history/history.json)
type Hist = { date: string; text: string };
let hist: Hist[] = [];
let hcur: Hist | null = null;
const HDate = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const HSorted = () => hist.slice().sort((a, b) => a.date.localeCompare(b.date));

// 2022-04-06 → 2022年4月6日 / 2022-04 → 2022年4月 / 2022 → 2022年
function HLabel(d: string): string
{
    const [y, m, day] = d.split('-');
    return `${y}年` + (m ? `${Number(m)}月` : '') + (day ? `${Number(day)}日` : '');
}

// 本文: 改行はそのまま、[文字](https://…) はリンクにする
function HText(s: string): string
{
    return Esc(s)
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, '<br>');
}

// 年表を描く(公開ページの about/history.js と同じ見た目)
function HRender(list: Hist[], box: HTMLElement)
{
    if (list.length === 0) { box.innerHTML = '<p class="tl-empty">まだ項目がありません</p>'; return; }
    let html = '', year = '', n = 0;
    for (const e of list)
    {
        const y = e.date.slice(0, 4);
        if (y !== year) { year = y; n = 0; html += `<div class="tl-year"><span>${Esc(y)}</span></div>`; }
        html += `<div class="tl-item ${n++ % 2 === 0 ? 'l' : 'r'}"><div class="tl-card">` +
                `<span class="tl-date">${Esc(HDate.test(e.date) ? HLabel(e.date) : e.date)}</span>${HText(e.text)}</div></div>`;
    }
    box.innerHTML = html;
}

async function HLoad()
{
    hist = []; hcur = null;
    try
    {
        const path = await join(root, 'about', 'history', 'history.json');
        if (await exists(path)) hist = JSON.parse(await readTextFile(path));
    }
    catch (e) { await message('about/history/history.json を読めませんでした: ' + e, { kind: 'error' }); }
    $('#hform').disabled = true;
    HList(); HPreview();
}

async function HSave()
{
    const bad = hist.find(h => !HDate.test(h.date) || !h.text.trim());
    if (bad)
    {
        await message('日付の形式が違う項目、または内容が空の項目があります。\n日付は 2022-04-06 / 2022-04 / 2022 のどれかで入れてください。', { kind: 'warning' });
        return;
    }
    try
    {
        await mkdir(await join(root, 'about', 'history'), { recursive: true });
        await writeTextFile(await join(root, 'about', 'history', 'history.json'), JSON.stringify(HSorted(), null, 2));
        Status('年表を保存しました');
    }
    catch (e) { await message('年表を保存できませんでした: ' + e, { kind: 'error' }); }
}

function HList()
{
    $('#hlist').replaceChildren(...HSorted().map(h =>
    {
        const b = document.createElement('button');
        b.className = 'item' + (h === hcur ? ' now' : '');
        b.innerHTML = '<small></small><span></span>';
        b.children[0].textContent = HDate.test(h.date) ? HLabel(h.date) : (h.date || '(日付なし)');
        b.children[1].textContent = h.text.split('\n')[0] || '(内容なし)';
        b.onclick = () => HSelect(h);
        return b;
    }));
}

function HPreview() { HRender(HSorted(), $('#hp')); }

function HSelect(h: Hist)
{
    hcur = h;
    $('#hform').disabled = false;
    $('#hdate').value = h.date;
    $('#htext').value = h.text;
    HList();
}

function HNew()
{
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const h: Hist = { date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, text: '' };
    hist.push(h);
    Dirty();
    HSelect(h); HPreview();
    $('#htext').focus();
}

$('#hdate').oninput = (e: any) => { if (!hcur) return; hcur.date = e.target.value.trim(); Dirty(); HList(); HPreview(); };
$('#htext').oninput = (e: any) => { if (!hcur) return; hcur.text = e.target.value; Dirty(); HList(); HPreview(); };

$('#hdel').onclick = async () =>
{
    if (!hcur || !(await ask('この項目を削除します。', { kind: 'warning' }))) return;
    hist = hist.filter(h => h !== hcur);
    hcur = null;
    $('#hform').disabled = true;
    $('#hdate').value = $('#htext').value = '';
    HList(); HPreview();
    Dirty();
};

// 選択範囲を [文字](https://) にする
$('#hlink').onclick = () =>
{
    const t = $('#htext');
    if (!hcur) return;
    const s = t.selectionStart;
    const sel = t.value.slice(s, t.selectionEnd) || 'リンク文字';
    t.setRangeText(`[${sel}](https://)`, s, t.selectionEnd, 'end');
    t.focus();
    t.dispatchEvent(new Event('input'));
};

// 「新しい記事」ボタンは、年表タブでは「新しい項目」として働く
const ArtNew = $('#new').onclick;
$('#new').onclick = (e: any) => (mode === 'hist' ? HNew() : ArtNew(e));

// タブの切り替え(記事 / 年表)
function SetMode(m: 'art' | 'hist')
{
    mode = m;
    const art = m === 'art';
    for (const id of ['#list', '#form', '#preview']) $(id).hidden = !art;
    for (const id of ['#hlist', '#hform', '#hpreview']) $(id).hidden = art;
    $('#tab-art').classList.toggle('main', art);
    $('#tab-hist').classList.toggle('main', !art);
    $('#new').textContent = art ? '新しい記事' : '新しい項目';
}
$('#tab-art').onclick = () => SetMode('art');
$('#tab-hist').onclick = () => SetMode('hist');

// ---------------------------------------------------------------- 起動
Preview();
// 前回のフォルダを自動で開く(開けなければ何もしない)
const last = localStorage.getItem('root');
if (last) LoadFolder(last, false).catch(() => {});
