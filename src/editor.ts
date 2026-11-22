import './styles.css';
import { open } from '@tauri-apps/plugin-dialog';
import { $, S, dirty, MODE_NAME, Status, type Mode } from './common';
import { ALoad, ASave, ArticleCount, ShowView, Preview, ArtNew } from './articles';
import { HLoad, HSave, ELoad, ESave, RLoad, RSave, SLoad, SSave } from './about-pages';

// 起動・フォルダ選択・保存・タブ切り替え

// ---------------------------------------------------------------- タブごとの部品
const SITE_MODES: Mode[] = ['hist', 'evt', 'road', 'spon'];   // 記事とは別の「サイト設定」側
const SUBTAB_ID: Record<string, string> = { hist: '#tab-hist', evt: '#tab-evt', road: '#tab-road', spon: '#tab-spon' };
const PANE_ID: Record<string, string> = { hist: '#p-hist', evt: '#p-evt', road: '#p-road', spon: '#p-spon' };
let lastSite: Mode = 'hist';

// ---------------------------------------------------------------- フォルダ操作
async function LoadFolder(path: string, remember = true): Promise<boolean>
{
    const carry = !S.root && dirty.has('art');   // 未選択で編集していた記事を引き継ぐ
    if (!(await ALoad(path, !remember))) return false;   // 起動時の自動読み込み(remember=false)は、失敗しても警告しない
    dirty.clear();
    if (carry) dirty.add('art');
    $('#tab-site').hidden = false;
    if (remember) localStorage.setItem('root', path);
    document.querySelectorAll('.newbtn').forEach((b: any) => b.disabled = false);
    $('#save').disabled = false;
    $('#open').hidden = true;  // フォルダを選んだら、選ぶボタンは消す
    await HLoad();
    await ELoad();
    await RLoad();
    await SLoad();
    SetMode(S.mode);
    Status(`${ArticleCount()} 件の記事を読み込みました (${path})`);
    return true;
}

$('#open').onclick = async () =>
{
    const path = await open({ directory: true, recursive: true });
    if (typeof path === 'string') await LoadFolder(path);
};

// 保存は、未保存のタブ全部を一度に行う(失敗したタブは未保存のまま残す)
async function Save()
{
    if (!S.root) return;   // フォルダ未選択のときは保存できない(記事は「書き出し」でZIPにする)
    const saver: Record<Mode, () => Promise<boolean>> = { art: ASave, hist: HSave, evt: ESave, road: RSave, spon: SSave };
    const targets = [...dirty];
    if (targets.length === 0) { Status('未保存の変更はありません'); return; }
    const saved: Mode[] = [], failed: Mode[] = [];
    for (const m of targets) (await saver[m]() ? saved : failed).push(m);
    saved.forEach(m => dirty.delete(m));
    const names = (list: Mode[]) => list.map(m => MODE_NAME[m]).join('・');
    Status(failed.length
        ? `保存できなかった項目があります(未保存: ${names(failed)})` + (saved.length ? ` / 保存済み: ${names(saved)}` : '')
        : `${names(saved)}を保存しました`);
}
$('#save').onclick = Save;
window.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); Save(); } });

// ---------------------------------------------------------------- 「記事」と「サイト設定」の切り替え
function SetMode(m: Mode)
{
    S.mode = m;
    if (m !== 'art') lastSite = m;
    const isArt = m === 'art';
    $('#w-art').hidden = !isArt;
    $('#w-site').hidden = isArt;
    $('#tab-art').classList.toggle('main', isArt);
    $('#tab-site').classList.toggle('main', !isArt);
    for (const k of SITE_MODES)
    {
        $(PANE_ID[k]).hidden = k !== m;
        $(SUBTAB_ID[k]).classList.toggle('main', k === m);
    }
    if (isArt) ShowView(S.root ? 'list' : 'edit');
    window.scrollTo(0, 0);
}
$('#tab-art').onclick = () => SetMode('art');
$('#tab-site').onclick = () => SetMode(lastSite);
for (const k of SITE_MODES) $(SUBTAB_ID[k]).onclick = () => SetMode(k);

// ---------------------------------------------------------------- 起動
Preview();
SetMode('art');
// 前回のフォルダを自動で開く(開けなければ、フォルダなしで空の記事を開く)
function StartOffline() { if (!S.root) ArtNew(); }
const last = localStorage.getItem('root');
if (last) LoadFolder(last, false).then(ok => { if (!ok) StartOffline(); }).catch(StartOffline);
else StartOffline();
