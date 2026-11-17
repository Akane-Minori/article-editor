import { ask, message } from '@tauri-apps/plugin-dialog';
import { readFile, readTextFile, writeFile, writeTextFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { $, S, urls, Esc, Dirty, ToWebp } from './common';

// about/ 配下のデータ(年表・行事・ロードマップ・協賛提携)を編集する部分

// ---------------------------------------------------------------- 年表 (about/json/history.json)
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

// 年表を描く(公開ページの about/js/history.js と同じ見た目)
// 左右は年が変わってもリセットせず、通して交互にする
function HRender(list: Hist[], box: HTMLElement)
{
    if (list.length === 0) { box.innerHTML = '<p class="tl-empty">まだ項目がありません</p>'; return; }
    let html = '', year = '', n = 0;
    for (const e of list)
    {
        const y = e.date.slice(0, 4);
        if (y !== year) { year = y; html += `<div class="tl-year"><span>${Esc(y)}</span></div>`; }
        html += `<div class="tl-item ${n++ % 2 === 0 ? 'l' : 'r'}"><div class="tl-card">` +
                `<span class="tl-date">${Esc(HDate.test(e.date) ? HLabel(e.date) : e.date)}</span>${HText(e.text)}</div></div>`;
    }
    box.innerHTML = html;
}

export async function HLoad()
{
    hist = []; hcur = null;
    try
    {
        const path = await join(S.root, 'about', 'json', 'history.json');
        if (await exists(path)) hist = JSON.parse(await readTextFile(path));
    }
    catch (e) { await message('about/json/history.json を読めませんでした: ' + e, { kind: 'error' }); }
    $('#hform').disabled = true;
    HList(); HPreview();
}

export async function HSave(): Promise<boolean>
{
    const bad = hist.find(h => !HDate.test(h.date) || !h.text.trim());
    if (bad)
    {
        await message('日付の形式が違う項目、または内容が空の項目があります。\n日付は 2022-04-06 / 2022-04 / 2022 のどれかで入れてください。', { kind: 'warning' });
        return false;
    }
    try
    {
        await mkdir(await join(S.root, 'about', 'json'), { recursive: true });
        await writeTextFile(await join(S.root, 'about', 'json', 'history.json'), JSON.stringify(HSorted(), null, 2));
        return true;
    }
    catch (e) { await message('年表を保存できませんでした: ' + e, { kind: 'error' }); return false; }
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


// ---------------------------------------------------------------- 行事 (about/json/events.json)
// 並び順がそのままページの表示順になる
type Evt = { title: string; text: string };
let evts: Evt[] = [];
let ecur: Evt | null = null;

export async function ELoad()
{
    evts = []; ecur = null;
    try
    {
        const path = await join(S.root, 'about', 'json', 'events.json');
        if (await exists(path))
        {
            const json = JSON.parse(await readTextFile(path));
            evts = json.map((j: any) => ({ title: j.title || '', text: j.text || '' }));
        }
    }
    catch (e) { await message('about/json/events.json を読めませんでした: ' + e, { kind: 'error' }); }
    $('#eform').disabled = true;
    EList(); EPreview();
}

export async function ESave(): Promise<boolean>
{
    if (evts.some(v => !v.title.trim()))
    {
        await message('タイトルが空の項目があります。入力するか、削除してください。', { kind: 'warning' });
        return false;
    }
    try
    {
        await mkdir(await join(S.root, 'about', 'json'), { recursive: true });
        const json = evts.map(v => ({ title: v.title.trim(), text: v.text }));
        await writeTextFile(await join(S.root, 'about', 'json', 'events.json'), JSON.stringify(json, null, 2));
        return true;
    }
    catch (e) { await message('行事を保存できませんでした: ' + e, { kind: 'error' }); return false; }
}

function EList()
{
    $('#elist').replaceChildren(...evts.map(v =>
    {
        const b = document.createElement('button');
        b.className = 'item' + (v === ecur ? ' now' : '');
        b.innerHTML = '<small></small><span></span>';
        b.children[0].textContent = v.text.split('\n')[0] || '(本文なし)';
        b.children[1].textContent = v.title || '(タイトルなし)';
        b.onclick = () => ESelect(v);
        return b;
    }));
}

// 公開ページの about/js/about.js と同じ内容(見た目はカード)
function EPreview()
{
    const box = $('#ep') as HTMLElement;
    box.innerHTML = evts.length
        ? evts.map(v => `<li><h2>${Esc(v.title || '(タイトルなし)')}</h2><p>${HText(v.text)}</p></li>`).join('')
        : '<li><p>まだ項目がありません</p></li>';
}

function ESelect(v: Evt)
{
    ecur = v;
    $('#eform').disabled = false;
    $('#etitle').value = v.title;
    $('#etext').value = v.text;
    EList();
}

function ENew()
{
    const v: Evt = { title: '', text: '' };
    evts.push(v);
    Dirty();
    ESelect(v); EPreview();
    $('#etitle').focus();
}

$('#etitle').oninput = (e: any) => { if (!ecur) return; ecur.title = e.target.value; Dirty(); EList(); EPreview(); };
$('#etext').oninput  = (e: any) => { if (!ecur) return; ecur.text  = e.target.value; Dirty(); EList(); EPreview(); };

// 選択範囲を [文字](https://) にする
$('#elink').onclick = () =>
{
    const t = $('#etext');
    if (!ecur) return;
    const s = t.selectionStart;
    const sel = t.value.slice(s, t.selectionEnd) || 'リンク文字';
    t.setRangeText(`[${sel}](https://)`, s, t.selectionEnd, 'end');
    t.focus();
    t.dispatchEvent(new Event('input'));
};

// 並び順を入れ替える(上のものほどページの上に出る)
function EMove(d: number)
{
    if (!ecur) return;
    const i = evts.indexOf(ecur), j = i + d;
    if (j < 0 || j >= evts.length) return;
    [evts[i], evts[j]] = [evts[j], evts[i]];
    Dirty(); EList(); EPreview();
}
$('#eup').onclick = () => EMove(-1);
$('#edown').onclick = () => EMove(1);

$('#edel').onclick = async () =>
{
    if (!ecur || !(await ask('この項目を削除します。', { kind: 'warning' }))) return;
    evts = evts.filter(v => v !== ecur);
    ecur = null;
    $('#eform').disabled = true;
    $('#etitle').value = $('#etext').value = '';
    EList(); EPreview();
    Dirty();
};


// ---------------------------------------------------------------- ロードマップ (about/json/roadmap.json)
type Road = { month: number; text: string };
let road: Road[] = [];
let rcur: Road | null = null;
const MONTH_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];   // 年度順(4月始まり)
const RSorted = () => road.slice().sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month));

$('#rmonth').replaceChildren(...MONTH_ORDER.map(m => new Option(`${m}月`, String(m))));

// 横一本の棒に吹き出しを置く(公開ページの about/js/about.js と同じ見た目)
function RRender(list: Road[], box: HTMLElement)
{
    let n = 0;
    const html = MONTH_ORDER.map((m, i) =>
    {
        const items = list.filter(e => e.month === m && e.text.trim());
        if (items.length === 0) return '';
        const side = n++ % 2 === 0 ? 'up' : 'down';
        const col = i < 2 ? 's' : i > 9 ? 'e' : 'c';
        return `<div class="rm-dot ${side}" style="--i:${i + 1}"></div>` +
               `<div class="rm-ev ${side} ${col}" style="--i:${i + 1}"><small>${m}月</small>` +
               items.map(e => Esc(e.text).replace(/\n/g, '<br>')).join('<br>') + `</div>`;
    }).join('');
    box.innerHTML = html || '<p class="rm-empty">まだ項目がありません</p>';
}

export async function RLoad()
{
    road = []; rcur = null;
    try
    {
        const path = await join(S.root, 'about', 'json', 'roadmap.json');
        if (await exists(path)) road = JSON.parse(await readTextFile(path));
    }
    catch (e) { await message('about/json/roadmap.json を読めませんでした: ' + e, { kind: 'error' }); }
    $('#rform').disabled = true;
    RList(); RPreview();
}

export async function RSave(): Promise<boolean>
{
    if (road.some(r => !r.text.trim()))
    {
        await message('内容が空の項目があります。入力するか、削除してください。', { kind: 'warning' });
        return false;
    }
    try
    {
        await mkdir(await join(S.root, 'about', 'json'), { recursive: true });
        await writeTextFile(await join(S.root, 'about', 'json', 'roadmap.json'), JSON.stringify(RSorted(), null, 2));
        return true;
    }
    catch (e) { await message('ロードマップを保存できませんでした: ' + e, { kind: 'error' }); return false; }
}

function RList()
{
    $('#rlist').replaceChildren(...RSorted().map(r =>
    {
        const b = document.createElement('button');
        b.className = 'item' + (r === rcur ? ' now' : '');
        b.innerHTML = '<small></small><span></span>';
        b.children[0].textContent = `${r.month}月`;
        b.children[1].textContent = r.text.split('\n')[0] || '(内容なし)';
        b.onclick = () => RSelect(r);
        return b;
    }));
}

function RPreview() { RRender(RSorted(), $('#rp')); }

function RSelect(r: Road)
{
    rcur = r;
    $('#rform').disabled = false;
    $('#rmonth').value = String(r.month);
    $('#rtext').value = r.text;
    RList();
}

function RNew()
{
    const r: Road = { month: new Date().getMonth() + 1, text: '' };
    road.push(r);
    Dirty();
    RSelect(r); RPreview();
    $('#rtext').focus();
}

$('#rmonth').onchange = (e: any) => { if (!rcur) return; rcur.month = Number(e.target.value); Dirty(); RList(); RPreview(); };
$('#rtext').oninput = (e: any) => { if (!rcur) return; rcur.text = e.target.value; Dirty(); RList(); RPreview(); };

$('#rdel').onclick = async () =>
{
    if (!rcur || !(await ask('この項目を削除します。', { kind: 'warning' }))) return;
    road = road.filter(r => r !== rcur);
    rcur = null;
    $('#rform').disabled = true;
    $('#rtext').value = '';
    RList(); RPreview();
    Dirty();
};


// ---------------------------------------------------------------- 協賛・提携 (about/json/sponsors.json)
// 協賛と提携は区別しない。並び順がそのままページの表示順になる
type Spon = { name: string; desc: string; url: string; logo: string };
let spon: Spon[] = [];
let scur: Spon | null = null;

export async function SLoad()
{
    spon = []; scur = null;
    try
    {
        const path = await join(S.root, 'about', 'json', 'sponsors.json');
        if (await exists(path))
        {
            const json = JSON.parse(await readTextFile(path));
            spon = json.map((j: any) => ({ name: j.name || '', desc: j.desc || '', url: j.url || '', logo: j.logo || '' }));
        }
    }
    catch (e) { await message('about/json/sponsors.json を読めませんでした: ' + e, { kind: 'error' }); }
    $('#sform').disabled = true;
    SList(); SPreview();
}

export async function SSave(): Promise<boolean>
{
    if (spon.some(s => !s.name.trim()))
    {
        await message('名前が空の項目があります。入力するか、削除してください。', { kind: 'warning' });
        return false;
    }
    if (spon.some(s => s.url.trim() && !/^https?:\/\//.test(s.url.trim())))
    {
        await message('リンク先URLは https:// か http:// から始めてください(空でもOK)。', { kind: 'warning' });
        return false;
    }
    try
    {
        await mkdir(await join(S.root, 'about', 'json'), { recursive: true });
        const json = spon.map(s => ({ name: s.name.trim(), desc: s.desc.trim(), url: s.url.trim(), logo: s.logo }));
        await writeTextFile(await join(S.root, 'about', 'json', 'sponsors.json'), JSON.stringify(json, null, 2));
        return true;
    }
    catch (e) { await message('協賛・提携を保存できませんでした: ' + e, { kind: 'error' }); return false; }
}

function SList()
{
    $('#slist').replaceChildren(...spon.map(s =>
    {
        const b = document.createElement('button');
        b.className = 'item' + (s === scur ? ' now' : '');
        b.innerHTML = '<small></small><span></span>';
        b.children[0].textContent = s.logo ? 'ロゴあり' : 'ロゴなし';
        b.children[1].textContent = s.name || '(名前なし)';
        b.onclick = () => SSelect(s);
        return b;
    }));
}

// 公開ページの about/js/sponsors.js と同じ見た目(カードは常に1列)
function SRender(list: Spon[], box: HTMLElement)
{
    if (list.length === 0) { box.innerHTML = '<p class="sp-empty">まだ項目がありません</p>'; return; }
    const card = (s: Spon) =>
    {
        const logo = s.logo ? `<div class="sp-logo"><img data-logo="${Esc(s.logo)}" alt="${Esc(s.name)}"></div>` : '';
        const body = `<div class="sp-body"><span class="sp-name">${Esc(s.name || '(名前なし)')}</span>` +
                     (s.desc ? `<span class="sp-desc">${Esc(s.desc).replace(/\n/g, '<br>')}</span>` : '') + `</div>`;
        return `<div class="sp-card">${logo}${body}</div>`;
    };
    box.innerHTML = `<div class="sp-grid">${list.map(card).join('')}</div>`;
    box.querySelectorAll('img[data-logo]').forEach((img: any) => ResolveLogo(img, img.dataset.logo));
}

// ロゴは選んだフォルダの about/ からの相対パス(例: img/sponsor_xxxx.webp)
async function ResolveLogo(img: HTMLImageElement, logo: string)
{
    if (/^https?:\/\//.test(logo)) { img.src = logo; return; }
    if (!S.root) return;
    const key = 'about/' + logo;
    let url = urls.get(key);
    if (!url)
    {
        try
        {
            const bytes = await readFile(await join(S.root, 'about', ...logo.split('/')));
            url = URL.createObjectURL(new Blob([bytes], { type: 'image/webp' }));
            urls.set(key, url);
        }
        catch { return; }
    }
    img.src = url;
}

function SPreview() { SRender(spon, $('#sp')); }

function SFillLogo() { $('#slogo-name').textContent = scur?.logo ? scur.logo : 'ロゴなし'; }

function SSelect(s: Spon)
{
    scur = s;
    $('#sform').disabled = false;
    $('#sname').value = s.name;
    $('#sdesc').value = s.desc;
    $('#surl').value = s.url;
    SFillLogo();
    SList();
}

function SNew()
{
    const s: Spon = { name: '', desc: '', url: '', logo: '' };
    spon.push(s);
    Dirty();
    SSelect(s); SPreview();
    $('#sname').focus();
}

$('#sname').oninput = (e: any) => { if (!scur) return; scur.name = e.target.value; Dirty(); SList(); SPreview(); };
$('#sdesc').oninput = (e: any) => { if (!scur) return; scur.desc = e.target.value; Dirty(); SPreview(); };
$('#surl').oninput  = (e: any) => { if (!scur) return; scur.url  = e.target.value.trim(); Dirty(); };

$('#slogo').onclick = () => $('#sfile').click();
$('#sfile').onchange = async (e: any) =>
{
    const f: File | undefined = e.target.files[0];
    e.target.value = '';
    if (!f || !scur || !S.root) return;
    try
    {
        const blob = await ToWebp(f);
        if (!blob) return;
        const name = `sponsor_${Math.random().toString(36).slice(2, 8)}.webp`;
        const dir = await join(S.root, 'about', 'img');
        await mkdir(dir, { recursive: true });
        await writeFile(await join(dir, name), new Uint8Array(await blob.arrayBuffer()));
        scur.logo = `img/${name}`;
        SFillLogo(); SList(); SPreview(); Dirty();
    }
    catch (err) { await message('ロゴを取り込めませんでした: ' + err, { kind: 'error' }); }
};
$('#slogo-del').onclick = () =>
{
    if (!scur) return;
    scur.logo = '';
    SFillLogo(); SList(); SPreview(); Dirty();
};

// 一覧での並び順を入れ替える(上のものほどページの上に出る)
function SMove(d: number)
{
    if (!scur) return;
    const i = spon.indexOf(scur), j = i + d;
    if (j < 0 || j >= spon.length) return;
    [spon[i], spon[j]] = [spon[j], spon[i]];
    Dirty(); SList(); SPreview();
}
$('#sup').onclick = () => SMove(-1);
$('#sdown').onclick = () => SMove(1);

$('#sdel').onclick = async () =>
{
    if (!scur || !(await ask('この項目を削除します。', { kind: 'warning' }))) return;
    spon = spon.filter(s => s !== scur);
    scur = null;
    $('#sform').disabled = true;
    $('#sname').value = $('#sdesc').value = $('#surl').value = '';
    SList(); SPreview();
    Dirty();
};

$('#hnew').onclick = HNew;
$('#enew').onclick = ENew;
$('#rnew').onclick = RNew;
$('#snew').onclick = SNew;
