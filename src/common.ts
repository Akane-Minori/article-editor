// 共通部品: どのファイルからも使う小さな道具と、いま開いているフォルダの状態
export type Mode = 'art' | 'hist' | 'evt' | 'road' | 'spon';

export const $ = (s: string) => document.querySelector(s) as any;
export const S = { root: '', art: '', mode: 'art' as Mode };   // 選んだサイトのフォルダ / その articles / いま開いているタブ
export const urls = new Map<string, string>();                  // 画像の表示用URLの置き場
export const dirty = new Set<Mode>();                           // 未保存のタブ

export const MODE_NAME: Record<Mode, string> = { art: '記事', hist: '年表', evt: '行事', road: 'ロードマップ', spon: '協賛・提携' };

export const Esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]);

export function Status(msg: string) { $('#status').textContent = msg; }
export function Dirty()
{
    dirty.add(S.mode);
    Status('未保存の変更があります(' + [...dirty].map(m => MODE_NAME[m]).join('・') + ')');
}

// 画像の大きさそのものを縮めて webp にする(幅の上限と画質はここで調整)
const MAX_WIDTH = 960, QUALITY = 0.8;
export async function ToWebp(file: File): Promise<Blob | null>
{
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bmp.width);
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise(r => c.toBlob(r, 'image/webp', QUALITY));
}
