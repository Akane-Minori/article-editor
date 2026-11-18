// 無圧縮(store)だけの小さな ZIP 読み書き。外部ライブラリ不要。
// 画像(webp)はもともと圧縮済みなので、無圧縮でもサイズはほぼ変わらない。
export type ZipFile = { name: string; data: Uint8Array };

const CRC_TABLE = (() =>
{
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++)
    {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c >>> 0;
    }
    return t;
})();

function Crc32(d: Uint8Array): number
{
    let c = 0xffffffff;
    for (let i = 0; i < d.length; i++) c = CRC_TABLE[(c ^ d[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

export function ZipBuild(files: ZipFile[]): Uint8Array
{
    const enc = new TextEncoder();
    const parts: Uint8Array[] = [];
    const central: Uint8Array[] = [];
    let offset = 0;

    for (const f of files)
    {
        const name = enc.encode(f.name);
        const crc = Crc32(f.data);

        const lh = new DataView(new ArrayBuffer(30));
        lh.setUint32(0, 0x04034b50, true);
        lh.setUint16(4, 20, true);
        lh.setUint16(6, 0x0800, true);          // 名前は UTF-8
        lh.setUint16(8, 0, true);               // 無圧縮
        lh.setUint16(10, 0, true);
        lh.setUint16(12, 33, true);             // 1980-01-01
        lh.setUint32(14, crc, true);
        lh.setUint32(18, f.data.length, true);
        lh.setUint32(22, f.data.length, true);
        lh.setUint16(26, name.length, true);
        lh.setUint16(28, 0, true);
        parts.push(new Uint8Array(lh.buffer), name, f.data);

        const ch = new DataView(new ArrayBuffer(46));
        ch.setUint32(0, 0x02014b50, true);
        ch.setUint16(4, 20, true);
        ch.setUint16(6, 20, true);
        ch.setUint16(8, 0x0800, true);
        ch.setUint16(10, 0, true);
        ch.setUint16(12, 0, true);
        ch.setUint16(14, 33, true);
        ch.setUint32(16, crc, true);
        ch.setUint32(20, f.data.length, true);
        ch.setUint32(24, f.data.length, true);
        ch.setUint16(28, name.length, true);
        ch.setUint32(42, offset, true);
        central.push(new Uint8Array(ch.buffer), name);

        offset += 30 + name.length + f.data.length;
    }

    const cdSize = central.reduce((s, p) => s + p.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true);
    end.setUint32(16, offset, true);

    const all = [...parts, ...central, new Uint8Array(end.buffer)];
    const out = new Uint8Array(all.reduce((s, p) => s + p.length, 0));
    let pos = 0;
    for (const p of all) { out.set(p, pos); pos += p.length; }
    return out;
}

// このエディターが作った ZIP(無圧縮)だけ読める。圧縮された ZIP は例外にする
export function ZipRead(bytes: Uint8Array): ZipFile[]
{
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let eocd = -1;
    for (let i = bytes.length - 22; i >= 0; i--)
        if (v.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('ZIPファイルではありません');

    const count = v.getUint16(eocd + 10, true);
    let p = v.getUint32(eocd + 16, true);
    const dec = new TextDecoder();
    const out: ZipFile[] = [];

    for (let n = 0; n < count; n++)
    {
        if (v.getUint32(p, true) !== 0x02014b50) throw new Error('ZIPが壊れています');
        const method = v.getUint16(p + 10, true);
        const size = v.getUint32(p + 24, true);
        const nameLen = v.getUint16(p + 28, true);
        const extraLen = v.getUint16(p + 30, true);
        const commentLen = v.getUint16(p + 32, true);
        const local = v.getUint32(p + 42, true);
        const name = dec.decode(bytes.subarray(p + 46, p + 46 + nameLen));
        if (method !== 0) throw new Error('このエディターで書き出したZIPではありません(圧縮されています)');

        const dataStart = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
        if (!name.endsWith('/')) out.push({ name, data: bytes.slice(dataStart, dataStart + size) });
        p += 46 + nameLen + extraLen + commentLen;
    }
    return out;
}
