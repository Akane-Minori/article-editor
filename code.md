Project Path: cs-article-editor

Source Tree:

```txt
cs-article-editor
├── README.md
├── index.html
├── package.json
├── pnpm-lock.yaml
├── src
│   ├── about-pages.ts
│   ├── articles.ts
│   ├── common.ts
│   ├── editor.ts
│   ├── styles.css
│   └── vite-env.d.ts
├── src-tauri
│   ├── Cargo.lock
│   ├── Cargo.toml
│   ├── build.rs
│   ├── capabilities
│   │   └── default.json
│   ├── gen
│   ├── icons
│   │   ├── 128x128.png
│   │   ├── 128x128@2x.png
│   │   ├── 32x32.png
│   │   ├── Square107x107Logo.png
│   │   ├── Square142x142Logo.png
│   │   ├── Square150x150Logo.png
│   │   ├── Square284x284Logo.png
│   │   ├── Square30x30Logo.png
│   │   ├── Square310x310Logo.png
│   │   ├── Square44x44Logo.png
│   │   ├── Square71x71Logo.png
│   │   ├── Square89x89Logo.png
│   │   ├── StoreLogo.png
│   │   ├── icon.icns
│   │   ├── icon.ico
│   │   └── icon.png
│   ├── src
│   │   ├── lib.rs
│   │   └── main.rs
│   └── tauri.conf.json
├── tsconfig.json
└── vite.config.ts

```

`README.md`:

```md
# Tauri + Vanilla TS

This template should help get you started developing with Tauri in vanilla HTML, CSS and Typescript.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

```
`index.html`:

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>サイトエディター</title>
</head>
<body>
    <header class="header">
        <div class="header__inner">
            <div class="seg">
                <button id="tab-art" class="main" type="button">記事</button>
                <button id="tab-site" type="button">サイト設定</button>
            </div>
            <span id="status">最初にサイトのフォルダを選んでください</span>
            <button id="open" class="btn" type="button">サイトのフォルダを選ぶ</button>
            <button id="save" class="btn btn--primary" type="button" disabled>保存 (Ctrl+S)</button>
        </div>
    </header>

    <main id="main">
        <!-- ================= 記事(一覧 → 編集+プレビュー) ================= -->
        <section id="w-art">
            <div id="v-list">
                <div class="toolbar">
                    <h2>記事</h2>
                    <button id="new" class="btn btn--primary newbtn" type="button" disabled>新しい記事</button>
                </div>
                <nav id="list" class="list"></nav>
                <nav id="pager" class="pager" aria-label="ページ送り" hidden></nav>
            </div>

            <div id="v-edit" hidden>
                <div class="edit-bar">
                    <button id="back" class="btn" type="button">← 一覧に戻る</button>
                </div>
                <div class="edit-grid">
                    <fieldset id="form" class="pane form" disabled>
                        <label>日付<input type="date" id="date"></label>
                        <label>タイトル<input type="text" id="title"></label>
                        <label>作者<input type="text" id="author" list="authors" autocomplete="off" placeholder="名前を入力(過去の作者が候補に出ます)"></label>
                        <datalist id="authors"></datalist>
                        <label>サムネイル
                            <select id="thumb"><option value="">自動(最初の画像)</option></select>
                        </label>
                        <label>説明文(空なら本文から自動)
                            <textarea id="desc" rows="3"></textarea>
                        </label>

                        <div id="tools" class="tools">
                            <button type="button" class="btn btn--sm" data-f="h">見出し</button>
                            <button type="button" class="btn btn--sm" data-f="b">太字</button>
                            <button type="button" class="btn btn--sm" data-f="red">赤字</button>
                            <button type="button" class="btn btn--sm" data-f="big">大きい文字</button>
                            <button type="button" class="btn btn--sm" data-f="ul">リスト</button>
                            <button type="button" class="btn btn--sm" data-f="q">引用</button>
                            <button type="button" class="btn btn--sm" data-f="hr">区切り線</button>
                            <button type="button" class="btn btn--sm" data-f="a">リンク</button>
                            <button type="button" class="btn btn--sm" data-f="embed">埋め込み</button>
                        </div>

                        <label>本文(マークダウン)<textarea id="body"></textarea></label>
                        <div class="row">
                            <button id="addimg" class="btn" type="button">画像を挿入</button>
                            <button id="del" class="btn btn--danger" type="button">この記事を削除</button>
                            <input type="file" id="file" accept="image/*" multiple hidden>
                        </div>
                    </fieldset>

                    <section id="preview" class="pane preview">
                        <div class="card">
                            <h1 id="p_title"></h1>
                            <p id="p_date"></p>
                            <div id="p_text"></div>
                        </div>
                    </section>
                </div>
            </div>
        </section>

        <!-- ================= サイト設定(1画面: 一覧 → 入力 → プレビューを縦に積む) ================= -->
        <section id="w-site" hidden>
            <div class="seg seg--light subtabs">
                <button id="tab-hist" class="main" type="button">年表</button>
                <button id="tab-evt" type="button">行事</button>
                <button id="tab-road" type="button">ロードマップ</button>
                <button id="tab-spon" type="button">協賛・提携</button>
            </div>

            <!-- 年表 (about/history/history.json) -->
            <div id="p-hist" class="site-pane">
                <div class="site-left">
                <div class="toolbar">
                    <h2>年表</h2>
                    <button id="hnew" class="btn btn--primary newbtn" type="button" disabled>新しい項目</button>
                </div>
                <nav id="hlist" class="list list--compact"></nav>
                <fieldset id="hform" class="pane form" disabled>
                    <label>日付(2022-04-06 / 2022-04 / 2022 のどれか)
                        <input type="text" id="hdate" placeholder="2022-04-06">
                    </label>
                    <div class="tools">
                        <button type="button" class="btn btn--sm" id="hlink">リンク</button>
                    </div>
                    <label>内容<textarea id="htext" rows="6"></textarea></label>
                    <div class="row">
                        <button id="hdel" class="btn btn--danger" type="button">この項目を削除</button>
                    </div>
                </fieldset>
                </div>
                <section id="hpreview" class="pane preview">
                    <div class="hwrap"><div id="hp" class="tl"></div></div>
                </section>
            </div>

            <!-- 行事 (about/events.json) -->
            <div id="p-evt" class="site-pane" hidden>
                <div class="site-left">
                <div class="toolbar">
                    <h2>行事</h2>
                    <button id="enew" class="btn btn--primary newbtn" type="button" disabled>新しい項目</button>
                </div>
                <nav id="elist" class="list list--compact"></nav>
                <fieldset id="eform" class="pane form" disabled>
                    <label>タイトル<input type="text" id="etitle"></label>
                    <div class="tools">
                        <button type="button" class="btn btn--sm" id="elink">リンク</button>
                    </div>
                    <label>本文(改行できます)<textarea id="etext" rows="5"></textarea></label>
                    <div class="row">
                        <button id="eup" class="btn" type="button">↑ 上へ</button>
                        <button id="edown" class="btn" type="button">↓ 下へ</button>
                        <button id="edel" class="btn btn--danger" type="button">この項目を削除</button>
                    </div>
                </fieldset>
                </div>
                <section id="epreview" class="pane preview">
                    <ul id="ep" class="ev-list"></ul>
                </section>
            </div>

            <!-- ロードマップ (about/roadmap.json) -->
            <div id="p-road" class="site-pane" hidden>
                <div class="site-left">
                <div class="toolbar">
                    <h2>ロードマップ</h2>
                    <button id="rnew" class="btn btn--primary newbtn" type="button" disabled>新しい項目</button>
                </div>
                <nav id="rlist" class="list list--compact"></nav>
                <fieldset id="rform" class="pane form" disabled>
                    <label>月<select id="rmonth"></select></label>
                    <label>内容<textarea id="rtext" rows="3"></textarea></label>
                    <div class="row">
                        <button id="rdel" class="btn btn--danger" type="button">この項目を削除</button>
                    </div>
                </fieldset>
                </div>
                <section id="rpreview" class="pane preview">
                    <div class="rm-wrap"><div id="rp" class="rm"></div></div>
                </section>
            </div>

            <!-- 協賛・提携 (about/sponsors.json) -->
            <div id="p-spon" class="site-pane" hidden>
                <div class="site-left">
                <div class="toolbar">
                    <h2>協賛・提携</h2>
                    <button id="snew" class="btn btn--primary newbtn" type="button" disabled>新しい項目</button>
                </div>
                <nav id="slist" class="list list--compact"></nav>
                <fieldset id="sform" class="pane form" disabled>
                    <label>名前<input type="text" id="sname"></label>
                    <label>一言説明(空でもOK)<textarea id="sdesc" rows="3"></textarea></label>
                    <label>リンク先URL(空でもOK)<input type="text" id="surl" placeholder="https://"></label>
                    <div class="row">
                        <button id="slogo" class="btn" type="button">ロゴを選ぶ</button>
                        <button id="slogo-del" class="btn" type="button">ロゴを外す</button>
                        <span id="slogo-name" class="hint"></span>
                        <input type="file" id="sfile" accept="image/*" hidden>
                    </div>
                    <div class="row">
                        <button id="sup" class="btn" type="button">↑ 上へ</button>
                        <button id="sdown" class="btn" type="button">↓ 下へ</button>
                        <button id="sdel" class="btn btn--danger" type="button">この項目を削除</button>
                    </div>
                </fieldset>
                </div>
                <section id="spreview" class="pane preview">
                    <div id="sp"></div>
                </section>
            </div>
        </section>
    </main>

    <script type="module" src="/src/editor.ts"></script>
</body>
</html>

```
`package.json`:

```json
{
  "name": "article-editor",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-dialog": "~2.8.4",
    "@tauri-apps/plugin-fs": "~2.7.1",
    "@tauri-apps/plugin-opener": "^2",
    "dompurify": "^3.4.17",
    "marked": "^18.1.3"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2",
    "typescript": "~6.0.3",
    "vite": "^8.0.16"
  }
}

```
`pnpm-lock.yaml`:

```yaml
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:

  .:
    dependencies:
      '@tauri-apps/api':
        specifier: ^2
        version: 2.12.4
      '@tauri-apps/plugin-dialog':
        specifier: ~2.8.4
        version: 2.8.4
      '@tauri-apps/plugin-fs':
        specifier: ~2.7.1
        version: 2.7.1
      '@tauri-apps/plugin-opener':
        specifier: ^2
        version: 2.7.2
      dompurify:
        specifier: ^3.4.17
        version: 3.4.17
      marked:
        specifier: ^18.1.3
        version: 18.1.3
    devDependencies:
      '@tauri-apps/cli':
        specifier: ^2
        version: 2.12.4
      typescript:
        specifier: ~6.0.3
        version: 6.0.3
      vite:
        specifier: ^8.0.16
        version: 8.3.5

packages:

  '@oxc-project/types@0.156.0':
    resolution: {integrity: sha512-1Duyg48TdJNdyhEB8Xn1L36bT9Pv6GUtlKjHxOys8xkaF/rQq3XJE+bAurSK/AgIz5mGFsb77cn9Pb20+WCScw==}

  '@rolldown/binding-android-arm-eabi@1.2.16':
    resolution: {integrity: sha512-ia3DwAs0OsMGS7+IConptSiyk9pEXkOx/AbJ2n/lAGxH3QkWQus1t8d7gnAT38FCU2sQu8lUbeR6AiZFv4JxaA==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm]
    os: [android]

  '@rolldown/binding-android-arm64@1.2.16':
    resolution: {integrity: sha512-kx5wBiMB6E7TEvpl2B9gjLU004BkvEm2Dr941BFjx/SontPwSzNuQUIoVKxHHoSjpFIfHMmcguyLOtyn0hObRg==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [android]

  '@rolldown/binding-darwin-arm64@1.2.16':
    resolution: {integrity: sha512-qslZrXnKJU4cUpjoAmtAo/KQM9e2IRMlmpig6Zpwj+8KWxW8v+nkAf9216Bsek9lOC1jvg2yCjygCFo2f83msQ==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [darwin]

  '@rolldown/binding-darwin-x64@1.2.16':
    resolution: {integrity: sha512-FdF+y48ND13eAyM2mQn+85kvAqNlvRWROy2rhgA463X/0Gv4vGtazZtfaF1mRBLscYvtOlh4QnLjOWiFzX69OQ==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [x64]
    os: [darwin]

  '@rolldown/binding-freebsd-x64@1.2.16':
    resolution: {integrity: sha512-ddjqFM5e95AgLbUPtKIS7V1KTVlA0RUgCVr5mn+/IEhsdy3pr+Vuj/HZ7nlMN2FyxIwUktOH1LEPIQXO1v9y1Q==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [x64]
    os: [freebsd]

  '@rolldown/binding-linux-arm-gnueabihf@1.2.16':
    resolution: {integrity: sha512-tHdKWbFkFBI687iim3LIyIvyL7j66VvQYkDPss5Stn/qyE2tWkR1YD0dXmXPFKKqT/o5ZEJVsaRsWS2meQwGOA==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm]
    os: [linux]

  '@rolldown/binding-linux-arm64-gnu@1.2.16':
    resolution: {integrity: sha512-FJiLGAblPBMlBEdbOqw6kW6QcXDWAf/oJu7gYs9ZJZwmg+K+/zjFLxPTIY9izJUzxzc24FHvmseyA0IvJSl17w==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  '@rolldown/binding-linux-arm64-musl@1.2.16':
    resolution: {integrity: sha512-hrJpblMsrQ58U9veWpbXzkhV5zStunds6HWLprqq1qauvgBr1E6P+24kLj6lSLI9vjRn/RYpjprhkHQPKGWpNg==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  '@rolldown/binding-linux-ppc64-gnu@1.2.16':
    resolution: {integrity: sha512-qJd/dC6j6CwLG9/s/RP2nb1RZ0GIgj7Ioj7x/SYa3RzjVrlzrmH0fhIOpfvqQDeIsdP0loi+kHaMhJzY1PBIaA==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [ppc64]
    os: [linux]
    libc: [glibc]

  '@rolldown/binding-linux-s390x-gnu@1.2.16':
    resolution: {integrity: sha512-Vx7Xg5uUJuNcujJjI70OICaH0EYj80BtOLZTSN7uOYg8QOLlyKnaG0IW7Fn/J0IpJsaKzmDKMhOQv1JBM9m9vg==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [s390x]
    os: [linux]
    libc: [glibc]

  '@rolldown/binding-linux-x64-gnu@1.2.16':
    resolution: {integrity: sha512-TNKhgE3uJTsTzatUSSYt0Kgo+Oa2uSlSjz4r1aEIea7HX6ULBym4fAlYUhG1i6pjNf2njfCUAfKwr6C3E9Xg1w==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  '@rolldown/binding-linux-x64-musl@1.2.16':
    resolution: {integrity: sha512-7chXdpjXZ8qG0+mIxECN3cT9kvhZ3/oZhMX6Pp876P7CDrIy8nJswva6Mq357JR7eYXfuskwZxMeV1SzoZdHrA==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [x64]
    os: [linux]
    libc: [musl]

  '@rolldown/binding-openharmony-arm64@1.2.16':
    resolution: {integrity: sha512-Kwjt+7uNTJK5/MDkGWGVO2KQPnj8yAV75dMpfwyHZrJSXWHrniOB0aUEWlVYf3H1hOqFLIStLdM5QXq6bnKmOQ==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [openharmony]

  '@rolldown/binding-win32-arm64-msvc@1.2.16':
    resolution: {integrity: sha512-/LH6WfjDRXXJz/p5xl4TmU+jpcnwcxbKEQBW/GZE0JHfN0lGIyTtsUEGaQ/q/GikkGJ2yLKe6pwm7AnEWO8pdw==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [win32]

  '@rolldown/binding-win32-x64-msvc@1.2.16':
    resolution: {integrity: sha512-1lv1KvX0Z871zfk7vw+dnXMMnHNyDwMzWG8Kv3HxDXMOhzCX4SHc7HK319fInP0i+0p9D8brkfzL7pJOaGl+tw==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [x64]
    os: [win32]

  '@rolldown/pluginutils@1.0.1':
    resolution: {integrity: sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==}

  '@tauri-apps/api@2.12.4':
    resolution: {integrity: sha512-pVmfis+4zT8H0Qhp3xPZx9Ju7kpzvA6rr/PSJPyuwfvucTQ8sVt61NYU9KMkK703UFlYadFmjKA4HhybOtN0gg==}

  '@tauri-apps/cli-darwin-arm64@2.12.4':
    resolution: {integrity: sha512-OxqKSckIkoJ6vX2AjifIJpTasFC0Hbdoo7gEiCmAjauABO3U8m2MRsLWe+QTiBwDx1mIrvgA+rvI7tvDnbnHVg==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [darwin]

  '@tauri-apps/cli-darwin-x64@2.12.4':
    resolution: {integrity: sha512-fz76/77wMMJOaaUN6n3CybRG0P/MTEjjqYk81mGPyhi9m6Ue5T+LWBnJP/AkPooNatBPI2vtulGqomyMJ44lCQ==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [darwin]

  '@tauri-apps/cli-linux-arm-gnueabihf@2.12.4':
    resolution: {integrity: sha512-K0w8Bof6Lt8QKLAYhRy0yy36ZH5iA/35VuSOvnxyjvCUZ+A3JKsUTlALviH/sVgAlisaPzzmeJSH8XOn4Q2HBA==}
    engines: {node: '>= 10'}
    cpu: [arm]
    os: [linux]

  '@tauri-apps/cli-linux-arm64-gnu@2.12.4':
    resolution: {integrity: sha512-j5rOnjmRUwWrm1oosf0zBYl4D+fqydgUROFCk0hvKZxvbTT8SOERes0QB7rBV/XWNy+kM6pCKzb3oSm2sRglzg==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  '@tauri-apps/cli-linux-arm64-musl@2.12.4':
    resolution: {integrity: sha512-aOue3Fy6Jb7+oWcfAVUsVHfeTybSCt2CZoU06aO4jv4d2Ks/KnaTPwMAK3CLEduGOvBLY1lbBBrIyomqLLH5Sg==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  '@tauri-apps/cli-linux-riscv64-gnu@2.12.4':
    resolution: {integrity: sha512-Fx6GShY/RvST+t6LMlTHAwd66+1tEaAAGrnU7cysVfaiRP1BKng5Vl6rVmO6rSLOA1Sp1dRzNYM4f0OWQGb7qA==}
    engines: {node: '>= 10'}
    cpu: [riscv64]
    os: [linux]
    libc: [glibc]

  '@tauri-apps/cli-linux-x64-gnu@2.12.4':
    resolution: {integrity: sha512-tNzZSa79Z1nRpHxEpQ38lsAFpKlFlYvoXzjTV+lRRn/zSf3wrdUC3wnLcq2XEadchPu4ttK0zivhYzr+XGD19Q==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  '@tauri-apps/cli-linux-x64-musl@2.12.4':
    resolution: {integrity: sha512-jmZ1pr0xEqUhuEusWtt9Yt+GF6lCnGHUmIL+KIknpbjK/XQ2qkhDBhaxK/JMHM2A8dAacVXCxXJk2EXpwhQUfA==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [linux]
    libc: [musl]

  '@tauri-apps/cli-win32-arm64-msvc@2.12.4':
    resolution: {integrity: sha512-fGo8pgEHZxdSYgZ/J98m1usJ7NHKmKbq7k6uT0x1rpOq6Bg2YVzzpaAblWk710f5LHYBJIL5QIFS5IrD+4gmTg==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [win32]

  '@tauri-apps/cli-win32-ia32-msvc@2.12.4':
    resolution: {integrity: sha512-ezl8sQIcjYsye3TUnTH5VcWmWzccZASlQm7hlZt0dYyj1XD0qpVW47u2xYVrIKui0F8uQv/7QGZixdWiClBsbg==}
    engines: {node: '>= 10'}
    cpu: [ia32]
    os: [win32]

  '@tauri-apps/cli-win32-x64-msvc@2.12.4':
    resolution: {integrity: sha512-DJhDeCqjLDNMWYFy7ZS8cfeAHX2RK0RbQMLiA3bMVVkXRDJ4NBYiHriGqsUhsr9iG41aTb+dJGkFPmPw1gWwVw==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [win32]

  '@tauri-apps/cli@2.12.4':
    resolution: {integrity: sha512-JI9bHfudSRJikGOrjbXEm6RjzzvmKuLc+JixB1NE8hNzQkNlCCIC3pTES3uypkR9lxHrsbxzcnSwhI2IxBQphw==}
    engines: {node: '>= 10'}
    hasBin: true

  '@tauri-apps/plugin-dialog@2.8.4':
    resolution: {integrity: sha512-+6ZOiXenOaxXwb8qCbBPdT2jX2cFPaVVHGIskrpmJLpmWj+qKRTD6X/z9x7hTdSQn7NedcoXCkWGej4a7dC4lw==}

  '@tauri-apps/plugin-fs@2.7.1':
    resolution: {integrity: sha512-4TBVjpi/q8PuNzjpkAc2iBGXMTLjOrAyfTiiOL8ORaJCZJRG3tjzmQ4sqs2CMG75FvLyRkOkERfP7AyY4iBNwQ==}

  '@tauri-apps/plugin-opener@2.7.2':
    resolution: {integrity: sha512-LyybP1VSzTMQiaFYcsbAse47KpivlyXdLZMQzGLEnkgQacGESnpjAfFoQ6h5sqWgAdZDH9szYjPzHMpv0Sz+TQ==}

  '@types/trusted-types@2.0.7':
    resolution: {integrity: sha512-ScaPdn1dQczgbl0QFTeTOmVHFULt394XJgOQNoyVhZ6r2vLnMLJfBPd53SB52T/3G36VI1/g2MZaX0cwDuXsfw==}

  detect-libc@2.1.2:
    resolution: {integrity: sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==}
    engines: {node: '>=8'}

  dompurify@3.4.17:
    resolution: {integrity: sha512-B/pSlYVHQ58kqISD/yDjuJ1yfzI34m1gF4lAod2bwSRhiN4K5Cl3H8Af7hqB2PmTL911tdEudnnXn5FnhRoz0w==}

  fdir@6.5.0:
    resolution: {integrity: sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==}
    engines: {node: '>=12.0.0'}
    peerDependencies:
      picomatch: ^3 || ^4
    peerDependenciesMeta:
      picomatch:
        optional: true

  fsevents@2.3.3:
    resolution: {integrity: sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==}
    engines: {node: ^8.16.0 || ^10.6.0 || >=11.0.0}
    os: [darwin]

  lightningcss-android-arm64@1.33.0:
    resolution: {integrity: sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [android]

  lightningcss-darwin-arm64@1.33.0:
    resolution: {integrity: sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [darwin]

  lightningcss-darwin-x64@1.33.0:
    resolution: {integrity: sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [darwin]

  lightningcss-freebsd-x64@1.33.0:
    resolution: {integrity: sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [freebsd]

  lightningcss-linux-arm-gnueabihf@1.33.0:
    resolution: {integrity: sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm]
    os: [linux]

  lightningcss-linux-arm64-gnu@1.33.0:
    resolution: {integrity: sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  lightningcss-linux-arm64-musl@1.33.0:
    resolution: {integrity: sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  lightningcss-linux-x64-gnu@1.33.0:
    resolution: {integrity: sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  lightningcss-linux-x64-musl@1.33.0:
    resolution: {integrity: sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [linux]
    libc: [musl]

  lightningcss-win32-arm64-msvc@1.33.0:
    resolution: {integrity: sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [win32]

  lightningcss-win32-x64-msvc@1.33.0:
    resolution: {integrity: sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [win32]

  lightningcss@1.33.0:
    resolution: {integrity: sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==}
    engines: {node: '>= 12.0.0'}

  marked@18.1.3:
    resolution: {integrity: sha512-9ChMH8EVVgjgID49nsL6IWxWk5c6GtAsq/xw7U1ggkjkU5AGuv68oLTVlFRtvcUYZtpbNyjyvGo3YDu0fGapiw==}
    engines: {node: '>= 20'}
    hasBin: true

  nanoid@3.3.20:
    resolution: {integrity: sha512-uKdg2G3GNCKQn9byYOpxbGqrT2fGO5KRt5J/8b3pok8rT6qxGWF6hxMyJiEYtAf+FVyYuD9hRaDqX5uPFYJ4ZQ==}
    engines: {node: ^10 || ^12 || ^13.7 || ^14 || >=15.0.1}
    hasBin: true

  picocolors@1.1.1:
    resolution: {integrity: sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==}

  picomatch@4.0.7:
    resolution: {integrity: sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==}
    engines: {node: '>=12'}

  postcss@8.5.32:
    resolution: {integrity: sha512-LJlKCCAUFKOuZxipUdYw1NzIITEsPcgyOG9LkvRJvuKj/bRzbuRY0ARXvL0pWGpsZvn8jku+LMep2eU0seHp8g==}
    engines: {node: ^10 || ^12 || >=14}

  rolldown@1.2.16:
    resolution: {integrity: sha512-bWvlMpFKiTfDKfnK7FC2MPgPeWCf/Kpwsq49ApdW+FQaBZb6O6dZ4MAPbPUjp7hYQrw/RobqCzn64BRrQecGHw==}
    engines: {node: ^20.19.0 || >=22.12.0}
    hasBin: true

  source-map-js@1.2.2:
    resolution: {integrity: sha512-KGj/8Y43x35aZVDtt+J4mK1hoLGHULMYfSkODJNQjNDC3oW1PqPoxMwo0pLUsWM/UEGzON/NxeHywEfNXNP3Vw==}
    engines: {node: '>=0.10.0'}

  tinyglobby@0.2.17:
    resolution: {integrity: sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==}
    engines: {node: '>=12.0.0'}

  typescript@6.0.3:
    resolution: {integrity: sha512-y2TvuxSZPDyQakkFRPZHKFm+KKVqIisdg9/CZwm9ftvKXLP8NRWj38/ODjNbr43SsoXqNuAisEf1GdCxqWcdBw==}
    engines: {node: '>=14.17'}
    hasBin: true

  vite@8.3.5:
    resolution: {integrity: sha512-z1YpjieJ9g0ebTmQpLBv/oq9E3F9EIlOe+7LahW8SrE3LTiG3udBRUXQOlYXP9b+IC2q2phHeVxj9xGlw34OEQ==}
    engines: {node: ^20.19.0 || >=22.12.0}
    hasBin: true
    peerDependencies:
      '@types/node': ^20.19.0 || >=22.12.0
      '@vitejs/devtools': ^0.7.1 || ^0.8.0
      esbuild: ^0.27.0 || ^0.28.0
      jiti: '>=1.21.0'
      less: ^4.0.0
      sass: ^1.70.0
      sass-embedded: ^1.70.0
      stylus: '>=0.54.8'
      sugarss: ^5.0.0
      terser: ^5.16.0
      tsx: ^4.8.1
      yaml: ^2.4.2
    peerDependenciesMeta:
      '@types/node':
        optional: true
      '@vitejs/devtools':
        optional: true
      esbuild:
        optional: true
      jiti:
        optional: true
      less:
        optional: true
      sass:
        optional: true
      sass-embedded:
        optional: true
      stylus:
        optional: true
      sugarss:
        optional: true
      terser:
        optional: true
      tsx:
        optional: true
      yaml:
        optional: true

snapshots:

  '@oxc-project/types@0.156.0': {}

  '@rolldown/binding-android-arm-eabi@1.2.16':
    optional: true

  '@rolldown/binding-android-arm64@1.2.16':
    optional: true

  '@rolldown/binding-darwin-arm64@1.2.16':
    optional: true

  '@rolldown/binding-darwin-x64@1.2.16':
    optional: true

  '@rolldown/binding-freebsd-x64@1.2.16':
    optional: true

  '@rolldown/binding-linux-arm-gnueabihf@1.2.16':
    optional: true

  '@rolldown/binding-linux-arm64-gnu@1.2.16':
    optional: true

  '@rolldown/binding-linux-arm64-musl@1.2.16':
    optional: true

  '@rolldown/binding-linux-ppc64-gnu@1.2.16':
    optional: true

  '@rolldown/binding-linux-s390x-gnu@1.2.16':
    optional: true

  '@rolldown/binding-linux-x64-gnu@1.2.16':
    optional: true

  '@rolldown/binding-linux-x64-musl@1.2.16':
    optional: true

  '@rolldown/binding-openharmony-arm64@1.2.16':
    optional: true

  '@rolldown/binding-win32-arm64-msvc@1.2.16':
    optional: true

  '@rolldown/binding-win32-x64-msvc@1.2.16':
    optional: true

  '@rolldown/pluginutils@1.0.1': {}

  '@tauri-apps/api@2.12.4': {}

  '@tauri-apps/cli-darwin-arm64@2.12.4':
    optional: true

  '@tauri-apps/cli-darwin-x64@2.12.4':
    optional: true

  '@tauri-apps/cli-linux-arm-gnueabihf@2.12.4':
    optional: true

  '@tauri-apps/cli-linux-arm64-gnu@2.12.4':
    optional: true

  '@tauri-apps/cli-linux-arm64-musl@2.12.4':
    optional: true

  '@tauri-apps/cli-linux-riscv64-gnu@2.12.4':
    optional: true

  '@tauri-apps/cli-linux-x64-gnu@2.12.4':
    optional: true

  '@tauri-apps/cli-linux-x64-musl@2.12.4':
    optional: true

  '@tauri-apps/cli-win32-arm64-msvc@2.12.4':
    optional: true

  '@tauri-apps/cli-win32-ia32-msvc@2.12.4':
    optional: true

  '@tauri-apps/cli-win32-x64-msvc@2.12.4':
    optional: true

  '@tauri-apps/cli@2.12.4':
    optionalDependencies:
      '@tauri-apps/cli-darwin-arm64': 2.12.4
      '@tauri-apps/cli-darwin-x64': 2.12.4
      '@tauri-apps/cli-linux-arm-gnueabihf': 2.12.4
      '@tauri-apps/cli-linux-arm64-gnu': 2.12.4
      '@tauri-apps/cli-linux-arm64-musl': 2.12.4
      '@tauri-apps/cli-linux-riscv64-gnu': 2.12.4
      '@tauri-apps/cli-linux-x64-gnu': 2.12.4
      '@tauri-apps/cli-linux-x64-musl': 2.12.4
      '@tauri-apps/cli-win32-arm64-msvc': 2.12.4
      '@tauri-apps/cli-win32-ia32-msvc': 2.12.4
      '@tauri-apps/cli-win32-x64-msvc': 2.12.4

  '@tauri-apps/plugin-dialog@2.8.4':
    dependencies:
      '@tauri-apps/api': 2.12.4

  '@tauri-apps/plugin-fs@2.7.1':
    dependencies:
      '@tauri-apps/api': 2.12.4

  '@tauri-apps/plugin-opener@2.7.2':
    dependencies:
      '@tauri-apps/api': 2.12.4

  '@types/trusted-types@2.0.7':
    optional: true

  detect-libc@2.1.2: {}

  dompurify@3.4.17:
    optionalDependencies:
      '@types/trusted-types': 2.0.7

  fdir@6.5.0(picomatch@4.0.7):
    optionalDependencies:
      picomatch: 4.0.7

  fsevents@2.3.3:
    optional: true

  lightningcss-android-arm64@1.33.0:
    optional: true

  lightningcss-darwin-arm64@1.33.0:
    optional: true

  lightningcss-darwin-x64@1.33.0:
    optional: true

  lightningcss-freebsd-x64@1.33.0:
    optional: true

  lightningcss-linux-arm-gnueabihf@1.33.0:
    optional: true

  lightningcss-linux-arm64-gnu@1.33.0:
    optional: true

  lightningcss-linux-arm64-musl@1.33.0:
    optional: true

  lightningcss-linux-x64-gnu@1.33.0:
    optional: true

  lightningcss-linux-x64-musl@1.33.0:
    optional: true

  lightningcss-win32-arm64-msvc@1.33.0:
    optional: true

  lightningcss-win32-x64-msvc@1.33.0:
    optional: true

  lightningcss@1.33.0:
    dependencies:
      detect-libc: 2.1.2
    optionalDependencies:
      lightningcss-android-arm64: 1.33.0
      lightningcss-darwin-arm64: 1.33.0
      lightningcss-darwin-x64: 1.33.0
      lightningcss-freebsd-x64: 1.33.0
      lightningcss-linux-arm-gnueabihf: 1.33.0
      lightningcss-linux-arm64-gnu: 1.33.0
      lightningcss-linux-arm64-musl: 1.33.0
      lightningcss-linux-x64-gnu: 1.33.0
      lightningcss-linux-x64-musl: 1.33.0
      lightningcss-win32-arm64-msvc: 1.33.0
      lightningcss-win32-x64-msvc: 1.33.0

  marked@18.1.3: {}

  nanoid@3.3.20: {}

  picocolors@1.1.1: {}

  picomatch@4.0.7: {}

  postcss@8.5.32:
    dependencies:
      nanoid: 3.3.20
      picocolors: 1.1.1
      source-map-js: 1.2.2

  rolldown@1.2.16:
    dependencies:
      '@oxc-project/types': 0.156.0
      '@rolldown/pluginutils': 1.0.1
    optionalDependencies:
      '@rolldown/binding-android-arm-eabi': 1.2.16
      '@rolldown/binding-android-arm64': 1.2.16
      '@rolldown/binding-darwin-arm64': 1.2.16
      '@rolldown/binding-darwin-x64': 1.2.16
      '@rolldown/binding-freebsd-x64': 1.2.16
      '@rolldown/binding-linux-arm-gnueabihf': 1.2.16
      '@rolldown/binding-linux-arm64-gnu': 1.2.16
      '@rolldown/binding-linux-arm64-musl': 1.2.16
      '@rolldown/binding-linux-ppc64-gnu': 1.2.16
      '@rolldown/binding-linux-s390x-gnu': 1.2.16
      '@rolldown/binding-linux-x64-gnu': 1.2.16
      '@rolldown/binding-linux-x64-musl': 1.2.16
      '@rolldown/binding-openharmony-arm64': 1.2.16
      '@rolldown/binding-win32-arm64-msvc': 1.2.16
      '@rolldown/binding-win32-x64-msvc': 1.2.16

  source-map-js@1.2.2: {}

  tinyglobby@0.2.17:
    dependencies:
      fdir: 6.5.0(picomatch@4.0.7)
      picomatch: 4.0.7

  typescript@6.0.3: {}

  vite@8.3.5:
    dependencies:
      lightningcss: 1.33.0
      picomatch: 4.0.7
      postcss: 8.5.32
      rolldown: 1.2.16
      tinyglobby: 0.2.17
    optionalDependencies:
      fsevents: 2.3.3

```
`src-tauri\Cargo.lock`:

```lock
# This file is automatically @generated by Cargo.
# It is not intended for manual editing.
version = 4

[[package]]
name = "adler2"
version = "2.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "320119579fcad9c21884f5c4861d16174d0e06250625266f50fe6898340abefa"

[[package]]
name = "aho-corasick"
version = "1.1.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c982642fa9e8606056828ee9a8505737230110bb1099153c79efe865c59d12ba"
dependencies = [
 "memchr",
]

[[package]]
name = "alloc-no-stdlib"
version = "3.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c2fb6cfd47bf496ff64095c20eaba0c201404ee38714d4142fcfa1dc334fcc7a"

[[package]]
name = "alloc-stdlib"
version = "0.3.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0b5c1865780388bfa186411ab5f247819487fc4864c6e9c3106611fa347586e1"
dependencies = [
 "alloc-no-stdlib",
]

[[package]]
name = "android_system_properties"
version = "0.1.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ae221649c9976a6f6c56ae1facf410f3ddb33cc661c4b7b61020a912d4237fbc"
dependencies = [
 "libc",
]

[[package]]
name = "anyhow"
version = "1.0.104"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "330a5ed07fa54e4702c9d6c4174f74427fc0ef6e214bbd677ae50a5099946470"

[[package]]
name = "article-editor"
version = "0.1.0"
dependencies = [
 "serde",
 "serde_json",
 "tauri",
 "tauri-build",
 "tauri-plugin-dialog",
 "tauri-plugin-fs",
 "tauri-plugin-opener",
]

[[package]]
name = "async-broadcast"
version = "0.7.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "435a87a52755b8f27fcf321ac4f04b2802e337c8c4872923137471ec39c37532"
dependencies = [
 "event-listener",
 "event-listener-strategy",
 "futures-core",
 "pin-project-lite",
]

[[package]]
name = "async-channel"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "924ed96dd52d1b75e9c1a3e6275715fd320f5f9439fb5a4a11fa51f4221158d2"
dependencies = [
 "concurrent-queue",
 "event-listener-strategy",
 "futures-core",
 "pin-project-lite",
]

[[package]]
name = "async-executor"
version = "1.14.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f426a31126c735126297bc5ea7a521263c9faff4f63ca415267ee625651c4f37"
dependencies = [
 "async-task",
 "concurrent-queue",
 "fastrand",
 "futures-lite",
 "pin-project-lite",
 "slab",
]

[[package]]
name = "async-io"
version = "2.6.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "456b8a8feb6f42d237746d4b3e9a178494627745c3c56c6ea55d92ba50d026fc"
dependencies = [
 "autocfg",
 "cfg-if",
 "concurrent-queue",
 "futures-io",
 "futures-lite",
 "parking",
 "polling",
 "rustix",
 "slab",
 "windows-sys 0.61.2",
]

[[package]]
name = "async-lock"
version = "3.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0876700b0d007ad25d5508865a4259c3af9af6d296bf663a0d586d0bc3369f6f"
dependencies = [
 "event-listener",
 "event-listener-strategy",
 "pin-project-lite",
]

[[package]]
name = "async-process"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fc50921ec0055cdd8a16de48773bfeec5c972598674347252c0399676be7da75"
dependencies = [
 "async-channel",
 "async-io",
 "async-lock",
 "async-signal",
 "async-task",
 "blocking",
 "cfg-if",
 "event-listener",
 "futures-lite",
 "rustix",
]

[[package]]
name = "async-recursion"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4f8abc12baad266b1c8cec146854c195b5864b4221d4b2ca7296a7ae82d9e451"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "async-signal"
version = "0.2.14"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "52b5aaafa020cf5053a01f2a60e8ff5dccf550f0f77ec54a4e47285ac2bab485"
dependencies = [
 "async-io",
 "async-lock",
 "atomic-waker",
 "cfg-if",
 "futures-core",
 "futures-io",
 "rustix",
 "signal-hook-registry",
 "slab",
 "windows-sys 0.61.2",
]

[[package]]
name = "async-task"
version = "4.7.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8b75356056920673b02621b35afd0f7dda9306d03c79a30f5c56c44cf256e3de"

[[package]]
name = "async-trait"
version = "0.1.92"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "82f6aeea286b8eb4dd3431a1be1b59d290ace00f5bfd8e2a159bc2a05e2c1667"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "atk"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "241b621213072e993be4f6f3a9e4b45f65b7e6faad43001be957184b7bb1824b"
dependencies = [
 "atk-sys",
 "glib",
 "libc",
]

[[package]]
name = "atk-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c5e48b684b0ca77d2bbadeef17424c2ea3c897d44d566a1617e7e8f30614d086"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "atomic-waker"
version = "1.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1505bd5d3d116872e7271a6d4e16d81d0c8570876c8de68093a09ac269d8aac0"

[[package]]
name = "autocfg"
version = "1.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f2032f911046de80f0a198e0901378627c33f59ea0ac00e363d481118bd70a53"

[[package]]
name = "base64"
version = "0.21.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9d297deb1925b89f2ccc13d7635fa0714f12c87adce1c75356b39ca9b7178567"

[[package]]
name = "base64"
version = "0.23.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ac07cdecf99051d9a5238b80f35af32cdeba5b336e55d957b318b50137e18da5"

[[package]]
name = "bit-set"
version = "0.8.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "08807e080ed7f9d5433fa9b275196cfc35414f66a0c79d864dc51a0d825231a3"
dependencies = [
 "bit-vec",
]

[[package]]
name = "bit-vec"
version = "0.8.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5e764a1d40d510daf35e07be9eb06e75770908c27d411ee6c92109c9840eaaf7"

[[package]]
name = "bitflags"
version = "1.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bef38d45163c2f1dde094a7dfd33ccf595c92905c8f8f4fdc18d06fb1037718a"

[[package]]
name = "bitflags"
version = "2.13.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3ded4057c258ba199e2d26386d3af3780957ecaee6c4ef4041c6b4b8b97c0b06"
dependencies = [
 "serde_core",
]

[[package]]
name = "block-buffer"
version = "0.10.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3078c7629b62d3f0439517fa394996acacc5cbc91c5a20d8c658e77abd503a71"
dependencies = [
 "generic-array",
]

[[package]]
name = "block2"
version = "0.6.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cdeb9d870516001442e364c5220d3574d2da8dc765554b4a617230d33fa58ef5"
dependencies = [
 "objc2",
]

[[package]]
name = "blocking"
version = "1.7.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a70e4329df6cb94385eed412ec92375c3cdd8a6e502493d1229b6414e4036dfa"
dependencies = [
 "async-channel",
 "async-task",
 "futures-io",
 "futures-lite",
 "piper",
]

[[package]]
name = "brotli"
version = "9.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "627b7cfb0578f0eafce087a90fcd40add1231900b69e4d4de2d456260a4f5d81"
dependencies = [
 "alloc-no-stdlib",
 "alloc-stdlib",
 "brotli-decompressor",
]

[[package]]
name = "brotli-decompressor"
version = "6.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "34c6783f42c21c952ad7112b354f0ba2f10760e9decea5b1b60523d6e270faaf"
dependencies = [
 "alloc-no-stdlib",
 "alloc-stdlib",
]

[[package]]
name = "bs58"
version = "0.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bf88ba1141d185c399bee5288d850d63b8369520c1eafc32a0430b5b6c287bf4"
dependencies = [
 "tinyvec",
]

[[package]]
name = "bumpalo"
version = "3.20.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "72f5acc6cb2ba439de613abc23857ec3d78374d8ed5ac84e9d11336e87da8649"

[[package]]
name = "bytemuck"
version = "1.25.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "95832e849adfb21180ccb6826a99da14e5d266ae5c2e668e1602cf234f153797"

[[package]]
name = "byteorder"
version = "1.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1fd0f2584146f6f2ef48085050886acf353beff7305ebd1ae69500e27c67f64b"

[[package]]
name = "bytes"
version = "1.12.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fc652a48c352aef3ea3aed32080501cf3ef6ed5da78602a020c991775b0aff04"
dependencies = [
 "serde",
]

[[package]]
name = "cairo-rs"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8ca26ef0159422fb77631dc9d17b102f253b876fe1586b03b803e63a309b4ee2"
dependencies = [
 "bitflags 2.13.2",
 "cairo-sys-rs",
 "glib",
 "libc",
 "once_cell",
 "thiserror 1.0.69",
]

[[package]]
name = "cairo-sys-rs"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "685c9fa8e590b8b3d678873528d83411db17242a73fccaed827770ea0fedda51"
dependencies = [
 "glib-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "camino"
version = "1.2.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bbbad30e4b4c14a39e3cc8aed085a12a327257c316619c93581e017bc52be591"
dependencies = [
 "serde_core",
]

[[package]]
name = "cargo-platform"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e35af189006b9c0f00a064685c727031e3ed2d8020f7ba284d78cc2671bd36ea"
dependencies = [
 "serde",
]

[[package]]
name = "cargo_metadata"
version = "0.19.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "dd5eb614ed4c27c5d706420e4320fbe3216ab31fa1c33cd8246ac36dae4479ba"
dependencies = [
 "camino",
 "cargo-platform",
 "semver",
 "serde",
 "serde_json",
 "thiserror 2.0.21",
]

[[package]]
name = "cargo_toml"
version = "1.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "82f4b26e751e711a5302649417f2da046dce6391b2ea30a4820f37462314f0b9"
dependencies = [
 "semver",
 "serde",
 "toml 1.2.0+spec-1.1.0",
]

[[package]]
name = "cc"
version = "1.11.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "375989decec1a0fa424442bed520fa12ede43a48475ce8c7417d2c69b32b5f6b"
dependencies = [
 "find-msvc-tools",
 "shlex",
]

[[package]]
name = "cesu8"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6d43a04d8753f35258c91f8ec639f792891f748a1edbd759cf1dcea3382ad83c"

[[package]]
name = "cfb"
version = "0.14.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a347dcabdae9c31b0825fd6a8bed285ec9c2acb89c47827126d52fa4f59cece3"
dependencies = [
 "fnv",
 "uuid",
 "web-time",
]

[[package]]
name = "cfg-expr"
version = "0.15.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d067ad48b8650848b989a59a86c6c36a995d02d2bf778d45c3c5d57bc2718f02"
dependencies = [
 "smallvec",
 "target-lexicon",
]

[[package]]
name = "cfg-if"
version = "1.0.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4e7648175b45a9a48536d676f68d918270699102aa8dab5496df06904c914600"

[[package]]
name = "chrono"
version = "0.4.45"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1aa79e62e7697b8e29b513a68abacf485adcd1fe8284a4316c5ae868e6633327"
dependencies = [
 "iana-time-zone",
 "num-traits",
 "serde",
 "windows-link",
]

[[package]]
name = "combine"
version = "4.6.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4356eba6976435498d05a311ee9fc486da3bc81c200d3f0d7dd9703b41913f92"
dependencies = [
 "bytes",
 "memchr",
]

[[package]]
name = "concurrent-queue"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4ca0197aee26d1ae37445ee532fefce43251d24cc7c166799f4d46817f1d3973"
dependencies = [
 "crossbeam-utils",
]

[[package]]
name = "cookie"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1a373e3602691c3cdea496d2f0ee5935151e6168fe87739483c463db1b2f2f87"
dependencies = [
 "time",
 "version_check",
]

[[package]]
name = "core-foundation"
version = "0.10.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b2a6cd9ae233e7f62ba4e9353e81a88df7fc8a5987b8d445b4d90c879bd156f6"
dependencies = [
 "core-foundation-sys",
 "libc",
]

[[package]]
name = "core-foundation-sys"
version = "0.8.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "773648b94d0e5d620f64f280777445740e61fe701025087ec8b57f45c791888b"

[[package]]
name = "core-graphics"
version = "0.25.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "064badf302c3194842cf2c5d61f56cc88e54a759313879cdf03abdd27d0c3b97"
dependencies = [
 "bitflags 2.13.2",
 "core-foundation",
 "core-graphics-types",
 "foreign-types",
 "libc",
]

[[package]]
name = "core-graphics-types"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3d44a101f213f6c4cdc1853d4b78aef6db6bdfa3468798cc1d9912f4735013eb"
dependencies = [
 "bitflags 2.13.2",
 "core-foundation",
 "libc",
]

[[package]]
name = "cpufeatures"
version = "0.2.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "59ed5838eebb26a2bb2e58f6d5b5316989ae9d08bab10e0e6d103e656d1b0280"
dependencies = [
 "libc",
]

[[package]]
name = "crc32fast"
version = "1.5.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5f97d3416d5337d15c4b0d78c8c91df922ca143f57ec20e2d1c188333047ef04"
dependencies = [
 "cfg-if",
]

[[package]]
name = "crossbeam-channel"
version = "0.5.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "98b0cc327b5bc766e7fda9c9260cc0fa81b43a8e240440422dff70788e3f9ef1"
dependencies = [
 "crossbeam-utils",
]

[[package]]
name = "crossbeam-utils"
version = "0.8.23"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a31eee39dddec8330830986fcd7625edb5a24ec90ea038215273bbc3adb08ac6"

[[package]]
name = "crypto-common"
version = "0.1.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "78c8292055d1c1df0cce5d180393dc8cce0abec0a7102adb6c7b1eef6016d60a"
dependencies = [
 "generic-array",
 "typenum",
]

[[package]]
name = "cssparser"
version = "0.37.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8c9cdaae01d5ed7882b04d795e7f752f46ff52d2fa3b50a20d28c464510bba98"
dependencies = [
 "cssparser-macros",
 "dtoa-short",
 "itoa",
 "phf",
 "smallvec",
]

[[package]]
name = "cssparser-macros"
version = "0.7.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d045de693cb712d0b22c6a64be5b953f67b3ce00ab5ad3dd5d8b441886ab8e1a"
dependencies = [
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "ctor"
version = "1.0.13"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "914a755b7c2d4af2bdcff7ce1739e2db9a1b81a9b07123d8015786ae03c0980d"

[[package]]
name = "darling"
version = "0.24.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ed17f5901b6630b993ca003def43f2f8ef4014fc13b047b57aad617ff32bc2ec"
dependencies = [
 "darling_core",
 "darling_macro",
]

[[package]]
name = "darling_core"
version = "0.24.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6837e2cf7485aaae18f86181d2f0e9a7ed297a025e220aeabf63fdebd3a2ddff"
dependencies = [
 "ident_case",
 "proc-macro2",
 "quote",
 "strsim",
 "syn 3.0.9",
]

[[package]]
name = "darling_macro"
version = "0.24.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2ac7135c3ef02b2f7833bbeb1be5ba7f966dcde8a87c6b87f65a778d71a02785"
dependencies = [
 "darling_core",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "dbus"
version = "0.9.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3ab69f03cc8c4340c9c8e315114e1658e6775a9b16a04357973aa21cec22b32e"
dependencies = [
 "libc",
 "libdbus-sys",
 "windows-sys 0.61.2",
]

[[package]]
name = "defmt"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e4a0795ac740cb54d7b3775c9c17345f6aaecf884c01733b39d6017738e0e3e1"
dependencies = [
 "bitflags 1.3.2",
 "defmt-macros",
]

[[package]]
name = "defmt-macros"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "840bb056bd99c495c9188198a258ab787c79f306d864db3e6e8451442d6d8366"
dependencies = [
 "defmt-parser",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "defmt-parser"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "71958f69fb2de856c5dd51ac9377e986ca1aa5919f931bf5395a807277f889a0"
dependencies = [
 "thiserror 2.0.21",
]

[[package]]
name = "deranged"
version = "0.5.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9e9de72ce2ad1f90dc62fa25f0f430ef85eb4b0d8fa0be4f30373bc40a21d28e"
dependencies = [
 "serde_core",
]

[[package]]
name = "derive_more"
version = "2.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d751e9e49156b02b44f9c1815bcb94b984cdcc4396ecc32521c739452808b134"
dependencies = [
 "derive_more-impl",
]

[[package]]
name = "derive_more-impl"
version = "2.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "799a97264921d8623a957f6c3b9011f3b5492f557bbb7a5a19b7fa6d06ba8dcb"
dependencies = [
 "proc-macro2",
 "quote",
 "rustc_version",
 "syn 2.0.119",
]

[[package]]
name = "digest"
version = "0.10.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9ed9a281f7bc9b7576e61468ba615a66a5c8cfdff42420a70aa82701a3b1e292"
dependencies = [
 "block-buffer",
 "crypto-common",
]

[[package]]
name = "dirs"
version = "7.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8d57d423b3c82e89b9a24ca3091fee61f456a26edbd28d26c65906f4bc1dcd8f"
dependencies = [
 "dirs-sys",
]

[[package]]
name = "dirs-sys"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e01a3366d27ee9890022452ee61b2b63a67e6f13f58900b651ff5665f0bb1fab"
dependencies = [
 "libc",
 "option-ext",
 "redox_users",
 "windows-sys 0.61.2",
]

[[package]]
name = "dispatch2"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1e0e367e4e7da84520dedcac1901e4da967309406d1e51017ae1abfb97adbd38"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "libc",
 "objc2",
]

[[package]]
name = "displaydoc"
version = "0.2.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c6232dd377dcc64799954cbd3a9bb882e9cdc1308ccd87b1c098f1fb2eaf82a8"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "dlopen2"
version = "0.8.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5e2c5bd4158e66d1e215c49b837e11d62f3267b30c92f1d171c4d3105e3dc4d4"
dependencies = [
 "dlopen2_derive",
 "libc",
 "once_cell",
 "winapi",
]

[[package]]
name = "dlopen2_derive"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0fbbb781877580993a8707ec48672673ec7b81eeba04cfd2310bd28c08e47c8f"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "dom_query"
version = "0.28.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fac5fca71e65e94cc718a6e2af65d6e0f9c6027751c2aa562fbb5087fda639bc"
dependencies = [
 "bit-set",
 "cssparser",
 "foldhash",
 "html5ever",
 "precomputed-hash",
 "selectors",
 "tendril",
]

[[package]]
name = "dpi"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d8b14ccef22fc6f5a8f4d7d768562a182c04ce9a3b3157b91390b52ddfdf1a76"
dependencies = [
 "serde",
]

[[package]]
name = "dtoa"
version = "1.0.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4c3cf4824e2d5f025c7b531afcb2325364084a16806f6d47fbc1f5fbd9960590"

[[package]]
name = "dtoa-short"
version = "0.3.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cd1511a7b6a56299bd043a9c167a6d2bfb37bf84a6dfceaba651168adfb43c87"
dependencies = [
 "dtoa",
]

[[package]]
name = "dunce"
version = "1.0.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "92773504d58c093f6de2459af4af33faa518c13451eb8f2b5698ed3d36e7c813"

[[package]]
name = "dyn-clone"
version = "1.0.20"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d0881ea181b1df73ff77ffaaf9c7544ecc11e82fba9b5f27b262a3c73a332555"

[[package]]
name = "embed-resource"
version = "3.0.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6168487b5e7eb2673e6efe1200b1848016e436a6ca0b8031bf04bd9d493a249f"
dependencies = [
 "cc",
 "memchr",
 "rustc_version",
 "toml 1.2.0+spec-1.1.0",
 "vswhom",
 "winreg",
]

[[package]]
name = "embed_plist"
version = "1.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4ef6b89e5b37196644d8796de5268852ff179b44e96276cf4290264843743bb7"

[[package]]
name = "endi"
version = "1.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "66b7e2430c6dff6a955451e2cfc438f09cea1965a9d6f87f7e3b90decc014099"

[[package]]
name = "enumflags2"
version = "0.7.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1027f7680c853e056ebcec683615fb6fbbc07dbaa13b4d5d9442b146ded4ecef"
dependencies = [
 "enumflags2_derive",
 "serde",
]

[[package]]
name = "enumflags2_derive"
version = "0.7.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67c78a4d8fdf9953a5c9d458f9efe940fd97a0cab0941c075a813ac594733827"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "equivalent"
version = "1.0.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "00d174d5400e5e8fd687ad1049e2f578285fa914201b1af7e8b112a4546bd826"

[[package]]
name = "erased-serde"
version = "0.4.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1e59b668157f32d3459d4bd634861a06ffa2503a461ca5f0916b9f0252605e66"
dependencies = [
 "serde",
 "serde_core",
 "typeid",
]

[[package]]
name = "errno"
version = "0.3.14"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "39cab71617ae0d63f51a36d69f866391735b51691dbda63cf6f96d042b63efeb"
dependencies = [
 "libc",
 "windows-sys 0.61.2",
]

[[package]]
name = "event-listener"
version = "5.4.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5a23add41df1562121a9393cb065eab5146a1242410f23a644851e90cfd669d2"
dependencies = [
 "parking",
 "pin-project-lite",
]

[[package]]
name = "event-listener-strategy"
version = "0.5.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8be9f3dfaaffdae2972880079a491a1a8bb7cbed0b8dd7a347f668b4150a3b93"
dependencies = [
 "event-listener",
 "pin-project-lite",
]

[[package]]
name = "fastrand"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "da7c62ceae207dd37ea5b845da6a0696c799f85e97da1ab5b7910be3c1c80223"

[[package]]
name = "fdeflate"
version = "0.3.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1e6853b52649d4ac5c0bd02320cddc5ba956bdb407c4b75a2c6b75bf51500f8c"
dependencies = [
 "simd-adler32",
]

[[package]]
name = "field-offset"
version = "0.3.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "38e2275cc4e4fc009b0669731a1e5ab7ebf11f469eaede2bab9309a5b4d6057f"
dependencies = [
 "memoffset",
 "rustc_version",
]

[[package]]
name = "find-msvc-tools"
version = "0.1.15"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1c66915cc5391097de7a2b0b972e8505aa33c0df401fd3a6811dbdb32881ba48"

[[package]]
name = "flate2"
version = "1.1.10"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e634e2e0ebac1ee034020da1ca582e17ffe4e0f5e985823721e168928136dcb"
dependencies = [
 "crc32fast",
 "miniz_oxide 0.9.1",
 "zlib-rs",
]

[[package]]
name = "fnv"
version = "1.0.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f9eec918d3f24069decb9af1554cad7c880e2da24a9afd88aca000531ab82c1"

[[package]]
name = "foldhash"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "77ce24cb58228fbb8aa041425bb1050850ac19177686ea6e0f41a70416f56fdb"

[[package]]
name = "foreign-types"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d737d9aa519fb7b749cbc3b962edcf310a8dd1f4b67c91c4f83975dbdd17d965"
dependencies = [
 "foreign-types-macros",
 "foreign-types-shared",
]

[[package]]
name = "foreign-types-macros"
version = "0.2.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ea5190182e6915eb873ddbc16e23b711b6eb1f9c00a0d0a3a91b5f6228475225"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "foreign-types-shared"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "aa9a19cbb55df58761df49b23516a86d432839add4af60fc256da840f66ed35b"

[[package]]
name = "form_urlencoded"
version = "1.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cb4cb245038516f5f85277875cdaa4f7d2c9a0fa0468de06ed190163b1581fcf"
dependencies = [
 "percent-encoding",
]

[[package]]
name = "futures-channel"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b1f9e3d69d39e4862ffed03ed071a76f9a13ba1d9109d355b0f0aa6b15e393c4"
dependencies = [
 "futures-core",
]

[[package]]
name = "futures-core"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "92d699e522242e69e3003b94ecc1f960f3a5e015aa7c5d7486e65ad01dd94f5e"

[[package]]
name = "futures-executor"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "031b47cf1a3c6cc8bc2fc76cd437f521619387907d469316e7c0bc278f1f5432"
dependencies = [
 "futures-core",
 "futures-task",
 "futures-util",
]

[[package]]
name = "futures-io"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "53c0fa8157de1303bfffdaa1cc2a673bfffb60102f76b0ef4441659124373fed"

[[package]]
name = "futures-lite"
version = "2.6.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f78e10609fe0e0b3f4157ffab1876319b5b0db102a2c60dc4626306dc46b44ad"
dependencies = [
 "fastrand",
 "futures-core",
 "futures-io",
 "parking",
 "pin-project-lite",
]

[[package]]
name = "futures-macro"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9fb9654ba8355388abeb8dcb4fc62f511300867002afc858860463bdd9fe0c44"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "futures-sink"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1944426bf7d03f1d14f708785e4b33efd750b36d48a157b836b3efc15ede8e1d"

[[package]]
name = "futures-task"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cd417de3d1d015fc3bfd2b1ea46dfc7bab72ef86f1cc7cc9c78e728b34a6d1fd"

[[package]]
name = "futures-util"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0d50a92467f8ba5dd6e3ee5d4bd04d73ab2e4e1c44474a0674821dfce14b79bc"
dependencies = [
 "futures-core",
 "futures-io",
 "futures-macro",
 "futures-sink",
 "futures-task",
 "memchr",
 "pin-project-lite",
 "slab",
]

[[package]]
name = "gdk"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d9f245958c627ac99d8e529166f9823fb3b838d1d41fd2b297af3075093c2691"
dependencies = [
 "cairo-rs",
 "gdk-pixbuf",
 "gdk-sys",
 "gio",
 "glib",
 "libc",
 "pango",
]

[[package]]
name = "gdk-pixbuf"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "50e1f5f1b0bfb830d6ccc8066d18db35c487b1b2b1e8589b5dfe9f07e8defaec"
dependencies = [
 "gdk-pixbuf-sys",
 "gio",
 "glib",
 "libc",
 "once_cell",
]

[[package]]
name = "gdk-pixbuf-sys"
version = "0.18.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f9839ea644ed9c97a34d129ad56d38a25e6756f99f3a88e15cd39c20629caf7"
dependencies = [
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "gdk-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5c2d13f38594ac1e66619e188c6d5a1adb98d11b2fcf7894fc416ad76aa2f3f7"
dependencies = [
 "cairo-sys-rs",
 "gdk-pixbuf-sys",
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "pango-sys",
 "pkg-config",
 "system-deps",
]

[[package]]
name = "gdkwayland-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "140071d506d223f7572b9f09b5e155afbd77428cd5cc7af8f2694c41d98dfe69"
dependencies = [
 "gdk-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "pkg-config",
 "system-deps",
]

[[package]]
name = "gdkx11"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3caa00e14351bebbc8183b3c36690327eb77c49abc2268dd4bd36b856db3fbfe"
dependencies = [
 "gdk",
 "gdkx11-sys",
 "gio",
 "glib",
 "libc",
 "x11",
]

[[package]]
name = "gdkx11-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e2e7445fe01ac26f11601db260dd8608fe172514eb63b3b5e261ea6b0f4428d"
dependencies = [
 "gdk-sys",
 "glib-sys",
 "libc",
 "system-deps",
 "x11",
]

[[package]]
name = "generic-array"
version = "0.14.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "85649ca51fd72272d7821adaf274ad91c288277713d9c18820d8499a7ff69e9a"
dependencies = [
 "typenum",
 "version_check",
]

[[package]]
name = "getrandom"
version = "0.3.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "899def5c37c4fd7b2664648c28120ecec138e4d395b459e5ca34f9cce2dd77fd"
dependencies = [
 "cfg-if",
 "libc",
 "r-efi 5.3.0",
 "wasip2",
]

[[package]]
name = "getrandom"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "300e883d756b2e4ec94e02791f39b04b522276138852cfc41d9fb7e904106099"
dependencies = [
 "cfg-if",
 "libc",
 "r-efi 6.0.0",
]

[[package]]
name = "gio"
version = "0.18.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d4fc8f532f87b79cbc51a79748f16a6828fb784be93145a322fa14d06d354c73"
dependencies = [
 "futures-channel",
 "futures-core",
 "futures-io",
 "futures-util",
 "gio-sys",
 "glib",
 "libc",
 "once_cell",
 "pin-project-lite",
 "smallvec",
 "thiserror 1.0.69",
]

[[package]]
name = "gio-sys"
version = "0.18.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "37566df850baf5e4cb0dfb78af2e4b9898d817ed9263d1090a2df958c64737d2"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
 "winapi",
]

[[package]]
name = "glib"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "233daaf6e83ae6a12a52055f568f9d7cf4671dabb78ff9560ab6da230ce00ee5"
dependencies = [
 "bitflags 2.13.2",
 "futures-channel",
 "futures-core",
 "futures-executor",
 "futures-task",
 "futures-util",
 "gio-sys",
 "glib-macros",
 "glib-sys",
 "gobject-sys",
 "libc",
 "memchr",
 "once_cell",
 "smallvec",
 "thiserror 1.0.69",
]

[[package]]
name = "glib-macros"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0bb0228f477c0900c880fd78c8759b95c7636dbd7842707f49e132378aa2acdc"
dependencies = [
 "heck 0.4.1",
 "proc-macro-crate 2.0.2",
 "proc-macro-error",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "glib-sys"
version = "0.18.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "063ce2eb6a8d0ea93d2bf8ba1957e78dbab6be1c2220dd3daca57d5a9d869898"
dependencies = [
 "libc",
 "system-deps",
]

[[package]]
name = "glob"
version = "0.3.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e4eba85ea1d0a966a983acd07deee566e67395d2d96b6fb39e62b5a833f1eb0b"

[[package]]
name = "gobject-sys"
version = "0.18.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0850127b514d1c4a4654ead6dedadb18198999985908e6ffe4436f53c785ce44"
dependencies = [
 "glib-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "gtk"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fd56fb197bfc42bd5d2751f4f017d44ff59fbb58140c6b49f9b3b2bdab08506a"
dependencies = [
 "atk",
 "cairo-rs",
 "field-offset",
 "futures-channel",
 "gdk",
 "gdk-pixbuf",
 "gio",
 "glib",
 "gtk-sys",
 "gtk3-macros",
 "libc",
 "pango",
 "pkg-config",
]

[[package]]
name = "gtk-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8f29a1c21c59553eb7dd40e918be54dccd60c52b049b75119d5d96ce6b624414"
dependencies = [
 "atk-sys",
 "cairo-sys-rs",
 "gdk-pixbuf-sys",
 "gdk-sys",
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "pango-sys",
 "system-deps",
]

[[package]]
name = "gtk3-macros"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "52ff3c5b21f14f0736fed6dcfc0bfb4225ebf5725f3c0209edeec181e4d73e9d"
dependencies = [
 "proc-macro-crate 1.3.1",
 "proc-macro-error",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "hashbrown"
version = "0.12.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8a9ee70c43aaf417c914396645a0fa852624801b24ebb7ae78fe8272889ac888"

[[package]]
name = "hashbrown"
version = "0.17.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ed5909b6e89a2db4456e54cd5f673791d7eca6732202bbf2a9cc504fe2f9b84a"

[[package]]
name = "heck"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "95505c38b4572b2d910cecb0281560f54b440a19336cbbcb27bf6ce6adc6f5a8"

[[package]]
name = "heck"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2304e00983f87ffb38b55b444b5e3b60a884b5d30c0fca7d82fe33449bbe55ea"

[[package]]
name = "hermit-abi"
version = "0.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e17592d60ebacc7d5e169f4663c5f84f9161cc90328abcfe8456f41e4dfcb284"

[[package]]
name = "hex"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7f24254aa9a54b5c858eaee2f5bccdb46aaf0e486a595ed5fd8f86ba55232a70"

[[package]]
name = "html5ever"
version = "0.39.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "46a1761807faccc9a19e86944bbf40610014066306f96edcdedc2fb714bcb7b8"
dependencies = [
 "log",
 "markup5ever",
]

[[package]]
name = "http"
version = "1.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "918d3568bebf352712bc2ef3d46a8bcf1a75b373be6539de198e9105cbbf9ce0"
dependencies = [
 "bytes",
 "itoa",
]

[[package]]
name = "http-body"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ca2a8f2913ee65f60facd6a5905613afaa448497a0230cc41ce022d93290bc2c"
dependencies = [
 "bytes",
 "http",
]

[[package]]
name = "http-body-util"
version = "0.1.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "23169fe34a5fbcdd3f3862e78fb9b6fccd5f02a6dc6f732547005d45631ce71c"
dependencies = [
 "bytes",
 "futures-core",
 "http",
 "http-body",
 "pin-project-lite",
]

[[package]]
name = "httparse"
version = "1.10.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6dbf3de79e51f3d586ab4cb9d5c3e2c14aa28ed23d180cf89b4df0454a69cc87"

[[package]]
name = "hyper"
version = "1.12.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2c3e324da4c95177d6291d4c8730197c0d1822f8a9766814a4a44fa5ab797c9c"
dependencies = [
 "atomic-waker",
 "bytes",
 "futures-core",
 "http",
 "http-body",
 "httparse",
 "itoa",
 "pin-project-lite",
 "smallvec",
 "tokio",
 "want",
]

[[package]]
name = "hyper-util"
version = "0.1.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ddc03d96684f9226b8a787cdb71488417b53ab5ea8fdb1dac946cb9431cc8bff"
dependencies = [
 "base64 0.23.1",
 "bytes",
 "futures-channel",
 "futures-util",
 "http",
 "http-body",
 "httparse",
 "hyper",
 "ipnet",
 "libc",
 "percent-encoding",
 "pin-project-lite",
 "socket2",
 "tokio",
 "tower-service",
 "tracing",
]

[[package]]
name = "iana-time-zone"
version = "0.1.65"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e31bc9ad994ba00e440a8aa5c9ef0ec67d5cb5e5cb0cc7f8b744a35b389cc470"
dependencies = [
 "android_system_properties",
 "core-foundation-sys",
 "iana-time-zone-haiku",
 "js-sys",
 "log",
 "wasm-bindgen",
 "windows-core",
]

[[package]]
name = "iana-time-zone-haiku"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f31827a206f56af32e590ba56d5d2d085f558508192593743f16b2306495269f"
dependencies = [
 "cc",
]

[[package]]
name = "ico"
version = "0.6.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d75e94d66081e4d8dcd098bd8dc5254800fea14a26389b298410158d834de167"
dependencies = [
 "byteorder",
 "png",
]

[[package]]
name = "icu_collections"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fe090a42a0d3140fed8c63263ed1fecc02422cb2f4bfe55cd8de2de1b8e105dd"
dependencies = [
 "displaydoc",
 "potential_utf",
 "utf8_iter",
 "yoke",
 "zerofrom",
 "zerovec",
]

[[package]]
name = "icu_locale_core"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "25d29b57c17c6528d0dc4c2141cfa2d08200465acb537a3909c8b9b8a4a984c0"
dependencies = [
 "displaydoc",
 "litemap",
 "tinystr",
 "writeable",
 "zerovec",
]

[[package]]
name = "icu_normalizer"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "404a3b8c486f205c87fe7f23ab6894d84a4ad76d6e4671ae1981ba7def87c599"
dependencies = [
 "icu_collections",
 "icu_normalizer_data",
 "icu_properties",
 "icu_provider",
 "smallvec",
 "zerovec",
]

[[package]]
name = "icu_normalizer_data"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "20f0088bfb7441f7a37fa0c9e20cb1e9cba1cac6b9ce8cd2a6dc44294f8e8cbc"

[[package]]
name = "icu_properties"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2ea83d991c56158f7cf898bf86436c1dfe7c07ee82fe88951f2695c9f37a379f"
dependencies = [
 "displaydoc",
 "icu_collections",
 "icu_locale_core",
 "icu_properties_data",
 "icu_provider",
 "zerotrie",
 "zerovec",
]

[[package]]
name = "icu_properties_data"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b98f29af82d02b163fe50161388350e743bb3107cc8e8c2f7314cb505faddfcf"

[[package]]
name = "icu_provider"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "413099315636c588ee8f011190b329b971a09a8fae9d157e01dcae8379468514"
dependencies = [
 "displaydoc",
 "icu_locale_core",
 "writeable",
 "yoke",
 "zerofrom",
 "zerotrie",
 "zerovec",
]

[[package]]
name = "ident_case"
version = "1.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b9e0384b61958566e926dc50660321d12159025e767c18e043daf26b70104c39"

[[package]]
name = "idna"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3b0875f23caa03898994f6ddc501886a45c7d3d62d04d2d90788d47be1b1e4de"
dependencies = [
 "idna_adapter",
 "smallvec",
 "utf8_iter",
]

[[package]]
name = "idna_adapter"
version = "1.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cb68373c0d6620ef8105e855e7745e18b0d00d3bdb07fb532e434244cdb9a714"
dependencies = [
 "icu_normalizer",
 "icu_properties",
]

[[package]]
name = "indexmap"
version = "1.9.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bd070e393353796e801d209ad339e89596eb4c8d430d18ede6a1cced8fafbd99"
dependencies = [
 "autocfg",
 "hashbrown 0.12.3",
 "serde",
]

[[package]]
name = "indexmap"
version = "2.14.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cc4e190f5d26ca7051642629da2c52fc03bde85a03197c99408dcd291734c855"
dependencies = [
 "equivalent",
 "hashbrown 0.17.1",
 "serde",
 "serde_core",
]

[[package]]
name = "infer"
version = "0.22.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f4200d433cbd5178df7797c9c2e75b348b728e39631cf14520d1e2fc424201f4"
dependencies = [
 "cfb",
]

[[package]]
name = "ipnet"
version = "2.12.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "791930b43c0d5973160d90a8f3894509f2b273430f5c5c73b668636d0287c5c0"

[[package]]
name = "is-docker"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "928bae27f42bc99b60d9ac7334e3a21d10ad8f1835a4e12ec3ec0464765ed1b3"
dependencies = [
 "once_cell",
]

[[package]]
name = "is-wsl"
version = "0.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "173609498df190136aa7dea1a91db051746d339e18476eed5ca40521f02d7aa5"
dependencies = [
 "is-docker",
 "once_cell",
]

[[package]]
name = "itoa"
version = "1.0.18"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8f42a60cbdf9a97f5d2305f08a87dc4e09308d1276d28c869c684d7777685682"

[[package]]
name = "javascriptcore-rs"
version = "1.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ca5671e9ffce8ffba57afc24070e906da7fc4b1ba66f2cabebf61bf2ea257fcc"
dependencies = [
 "bitflags 1.3.2",
 "glib",
 "javascriptcore-rs-sys",
]

[[package]]
name = "javascriptcore-rs-sys"
version = "1.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "af1be78d14ffa4b75b66df31840478fef72b51f8c2465d4ca7c194da9f7a5124"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "jiff"
version = "0.2.39"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3ac703058abac89e5c39b0b879dce2b6b14a4ba36600c7e7e3d0c60a6883ef3c"
dependencies = [
 "defmt",
 "jiff-core",
 "jiff-static",
 "jiff-tzdb-platform",
 "log",
 "portable-atomic",
 "portable-atomic-util",
 "serde_core",
 "windows-link",
]

[[package]]
name = "jiff-core"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "aee43309eb53bafb8c36d35d6e444769c8f8e6206a9fbf7546f5db9d7d4a0e93"
dependencies = [
 "defmt",
 "log",
]

[[package]]
name = "jiff-static"
version = "0.2.39"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6dc32470c67eb7d0e9ccb74303fa925313dc04cecb1aa048beaa6f391e36a93d"
dependencies = [
 "jiff-core",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "jiff-tzdb"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fa8377070c6bae868759445e5a77f66d84f0b72f3a054bfb00e6d038b8282da7"

[[package]]
name = "jiff-tzdb-platform"
version = "0.1.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "875a5a69ac2bab1a891711cf5eccbec1ce0341ea805560dcd90b7a2e925132e8"
dependencies = [
 "jiff-tzdb",
]

[[package]]
name = "jni"
version = "0.21.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1a87aa2bb7d2af34197c04845522473242e1aa17c12f4935d5856491a7fb8c97"
dependencies = [
 "cesu8",
 "cfg-if",
 "combine",
 "jni-sys 0.3.1",
 "log",
 "thiserror 1.0.69",
 "walkdir",
 "windows-sys 0.45.0",
]

[[package]]
name = "jni-sys"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "41a652e1f9b6e0275df1f15b32661cf0d4b78d4d87ddec5e0c3c20f097433258"
dependencies = [
 "jni-sys 0.4.1",
]

[[package]]
name = "jni-sys"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c6377a88cb3910bee9b0fa88d4f42e1d2da8e79915598f65fb0c7ee14c878af2"
dependencies = [
 "jni-sys-macros",
]

[[package]]
name = "jni-sys-macros"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "38c0b942f458fe50cdac086d2f946512305e5631e720728f2a61aabcd47a6264"
dependencies = [
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "js-sys"
version = "0.3.107"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8dc09d2154098bbf4ef54eab6b117a3c24cbbffe94046b16ee6d6d4510584d3a"
dependencies = [
 "cfg-if",
 "futures-util",
 "wasm-bindgen",
]

[[package]]
name = "json-patch"
version = "4.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7421438de105a0827e44fadd05377727847d717c80ce29a229f85fd04c427b72"
dependencies = [
 "jsonptr",
 "serde",
 "serde_json",
 "thiserror 2.0.21",
]

[[package]]
name = "jsonptr"
version = "0.7.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a5a3cc660ba5d72bce0b3bb295bf20847ccbb40fd423f3f05b61273672e561fe"
dependencies = [
 "serde",
 "serde_json",
]

[[package]]
name = "keyboard-types"
version = "0.8.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0fbe853b403ae61a04233030ae8a79d94975281ed9770a1f9e246732b534b28d"
dependencies = [
 "bitflags 2.13.2",
 "serde",
]

[[package]]
name = "libappindicator"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "03589b9607c868cc7ae54c0b2a22c8dc03dd41692d48f2d7df73615c6a95dc0a"
dependencies = [
 "glib",
 "gtk",
 "gtk-sys",
 "libappindicator-sys",
 "log",
]

[[package]]
name = "libappindicator-sys"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e9ec52138abedcc58dc17a7c6c0c00a2bdb4f3427c7f63fa97fd0d859155caf"
dependencies = [
 "gtk-sys",
 "libloading",
 "once_cell",
]

[[package]]
name = "libc"
version = "0.2.191"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "65cd87c9a6d60536580b316ad985726104730a5151c99845f2490428ef91240a"

[[package]]
name = "libdbus-sys"
version = "0.2.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "328c4789d42200f1eeec05bd86c9c13c7f091d2ba9a6ea35acdf51f31bc0f043"
dependencies = [
 "pkg-config",
]

[[package]]
name = "libloading"
version = "0.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b67380fd3b2fbe7527a606e18729d21c6f3951633d0500574c4dc22d2d638b9f"
dependencies = [
 "cfg-if",
 "winapi",
]

[[package]]
name = "libredox"
version = "0.1.25"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "61ff90caf6077a803a240f62fdbe88645a890bbca49ef8174c3cb0404362171d"
dependencies = [
 "libc",
]

[[package]]
name = "linux-raw-sys"
version = "0.12.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "32a66949e030da00e8c7d4434b251670a91556f4144941d37452769c25d58a53"

[[package]]
name = "litemap"
version = "0.8.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "47d9d19d1d6efa0109d2f65ff4c85cddd50bd572e5a00127ab10987290bcefae"

[[package]]
name = "lock_api"
version = "0.4.14"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "224399e74b87b5f3557511d98dff8b14089b3dadafcab6bb93eab67d3aace965"
dependencies = [
 "scopeguard",
]

[[package]]
name = "log"
version = "0.4.35"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5d15f86d12da44cd8d4ec3c73984537eb7f4cadcb9776a575a0a8a05ca11005c"

[[package]]
name = "markup5ever"
version = "0.39.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7122d987ec5f704ee56f6e5b41a7d93722e9aae27ae07cafa4036c4d3f9757de"
dependencies = [
 "log",
 "tendril",
 "web_atoms",
]

[[package]]
name = "memchr"
version = "2.8.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cf8baf1c55e62ffcace7a9f06f4bd9cd3f0c4beb022d3b367256b91b87513d98"

[[package]]
name = "memoffset"
version = "0.9.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "488016bfae457b036d996092f6cb448677611ce4449e970ceaf42695203f218a"
dependencies = [
 "autocfg",
]

[[package]]
name = "mime"
version = "0.3.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6877bb514081ee2a7ff5ef9de3281f14a4dd4bceac4c09388074a6b5df8a139a"

[[package]]
name = "miniz_oxide"
version = "0.8.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1fa76a2c86f704bdb222d66965fb3d63269ce38518b83cb0575fca855ebb6316"
dependencies = [
 "adler2",
 "simd-adler32",
]

[[package]]
name = "miniz_oxide"
version = "0.9.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b63fbc4a50860e98e7b2aa7804ded1db5cbc3aff9193adaff57a6931bf7c4b4c"
dependencies = [
 "adler2",
 "simd-adler32",
]

[[package]]
name = "mio"
version = "1.2.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1788edb87fdc09c7e26304471e2f5be8cdefb1b6930d6e3985fc02ff53bf86ee"
dependencies = [
 "libc",
 "wasi",
 "windows-sys 0.61.2",
]

[[package]]
name = "muda"
version = "0.20.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cca139e57da4383727f189e43e66e84fa372347027fc996f9f1a007ec0a37996"
dependencies = [
 "crossbeam-channel",
 "dpi",
 "gtk",
 "keyboard-types",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
 "once_cell",
 "png",
 "serde",
 "thiserror 2.0.21",
 "windows-sys 0.61.2",
]

[[package]]
name = "ndk"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c3f42e7bbe13d351b6bead8286a43aac9534b82bd3cc43e47037f012ebfd62d4"
dependencies = [
 "bitflags 2.13.2",
 "jni-sys 0.3.1",
 "log",
 "ndk-sys",
 "num_enum",
 "raw-window-handle",
 "thiserror 1.0.69",
]

[[package]]
name = "ndk-context"
version = "0.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "27b02d87554356db9e9a873add8782d4ea6e3e58ea071a9adb9a2e8ddb884a8b"

[[package]]
name = "ndk-sys"
version = "0.6.0+11769913"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ee6cda3051665f1fb8d9e08fc35c96d5a244fb1be711a03b71118828afc9a873"
dependencies = [
 "jni-sys 0.3.1",
]

[[package]]
name = "new_debug_unreachable"
version = "1.0.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "650eef8c711430f1a879fdd01d4745a7deea475becfb90269c06775983bbf086"

[[package]]
name = "num-conv"
version = "0.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "521739c6d2bac4aa25192232afe6841231376b2b26d4d9fae5ecf8ca5772e441"

[[package]]
name = "num-traits"
version = "0.2.19"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "071dfc062690e90b734c0b2273ce72ad0ffa95f0c74596bc250dcfd960262841"
dependencies = [
 "autocfg",
]

[[package]]
name = "num_enum"
version = "0.7.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5d0bca838442ec211fa11de3a8b0e0e8f3a4522575b5c4c06ed722e005036f26"
dependencies = [
 "num_enum_derive",
 "rustversion",
]

[[package]]
name = "num_enum_derive"
version = "0.7.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "680998035259dcfcafe653688bf2aa6d3e2dc05e98be6ab46afb089dc84f1df8"
dependencies = [
 "proc-macro-crate 3.5.0",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "objc2"
version = "0.6.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "08849bbd4767dfae9457696856ae1c84fe4e0281bbe4a7abff2d0e06fb7981f8"
dependencies = [
 "objc2-encode",
 "objc2-exception-helper",
]

[[package]]
name = "objc2-app-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d49e936b501e5c5bf01fda3a9452ff86dc3ea98ad5f283e1455153142d97518c"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "objc2",
 "objc2-core-foundation",
 "objc2-foundation",
 "objc2-quartz-core",
]

[[package]]
name = "objc2-cloud-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "73ad74d880bb43877038da939b7427bba67e9dd42004a18b809ba7d87cee241c"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-data"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0b402a653efbb5e82ce4df10683b6b28027616a2715e90009947d50b8dd298fa"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-foundation"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2a180dd8642fa45cdb7dd721cd4c11b1cadd4929ce112ebd8b9f5803cc79d536"
dependencies = [
 "bitflags 2.13.2",
 "dispatch2",
 "objc2",
]

[[package]]
name = "objc2-core-graphics"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e022c9d066895efa1345f8e33e584b9f958da2fd4cd116792e15e07e4720a807"
dependencies = [
 "bitflags 2.13.2",
 "dispatch2",
 "objc2",
 "objc2-core-foundation",
 "objc2-io-surface",
]

[[package]]
name = "objc2-core-image"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e5d563b38d2b97209f8e861173de434bd0214cf020e3423a52624cd1d989f006"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-location"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ca347214e24bc973fc025fd0d36ebb179ff30536ed1f80252706db19ee452009"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-text"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0cde0dfb48d25d2b4862161a4d5fcc0e3c24367869ad306b0c9ec0073bfed92d"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-core-foundation",
 "objc2-core-graphics",
]

[[package]]
name = "objc2-encode"
version = "4.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ef25abbcd74fb2609453eb695bd2f860d389e457f67dc17cafc8b8cbc89d0c33"

[[package]]
name = "objc2-exception-helper"
version = "0.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c7a1c5fbb72d7735b076bb47b578523aedc40f3c439bea6dfd595c089d79d98a"
dependencies = [
 "cc",
]

[[package]]
name = "objc2-foundation"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e3e0adef53c21f888deb4fa59fc59f7eb17404926ee8a6f59f5df0fd7f9f3272"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "libc",
 "objc2",
 "objc2-core-foundation",
]

[[package]]
name = "objc2-io-surface"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "180788110936d59bab6bd83b6060ffdfffb3b922ba1396b312ae795e1de9d81d"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-core-foundation",
]

[[package]]
name = "objc2-quartz-core"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "96c1358452b371bf9f104e21ec536d37a650eb10f7ee379fff67d2e08d537f1f"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-core-foundation",
 "objc2-foundation",
]

[[package]]
name = "objc2-ui-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d87d638e33c06f577498cbcc50491496a3ed4246998a7fbba7ccb98b1e7eab22"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "objc2",
 "objc2-cloud-kit",
 "objc2-core-data",
 "objc2-core-foundation",
 "objc2-core-graphics",
 "objc2-core-image",
 "objc2-core-location",
 "objc2-core-text",
 "objc2-foundation",
 "objc2-quartz-core",
 "objc2-user-notifications",
]

[[package]]
name = "objc2-user-notifications"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9df9128cbbfef73cda168416ccf7f837b62737d748333bfe9ab71c245d76613e"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-web-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b2e5aaab980c433cf470df9d7af96a7b46a9d892d521a2cbbb2f8a4c16751e7f"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
]

[[package]]
name = "once_cell"
version = "1.21.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9f7c3e4beb33f85d45ae3e3a1792185706c8e16d043238c593331cc7cd313b50"

[[package]]
name = "open"
version = "5.4.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8d8c8b8e725ad26404d6896eb2f064294a0a7b4f1d9120210d85544684c4ca95"
dependencies = [
 "dunce",
 "is-wsl",
 "libc",
]

[[package]]
name = "option-ext"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "04744f49eae99ab78e0d5c0b603ab218f515ea8cfe5a456d7629ad883a3b6e7d"

[[package]]
name = "ordered-stream"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9aa2b01e1d916879f73a53d01d1d6cee68adbb31d6d9177a8cfce093cced1d50"
dependencies = [
 "futures-core",
 "pin-project-lite",
]

[[package]]
name = "pango"
version = "0.18.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7ca27ec1eb0457ab26f3036ea52229edbdb74dee1edd29063f5b9b010e7ebee4"
dependencies = [
 "gio",
 "glib",
 "libc",
 "once_cell",
 "pango-sys",
]

[[package]]
name = "pango-sys"
version = "0.18.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "436737e391a843e5933d6d9aa102cb126d501e815b83601365a948a518555dc5"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "parking"
version = "2.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f38d5652c16fde515bb1ecef450ab0f6a219d619a7274976324d5e377f7dceba"

[[package]]
name = "parking_lot"
version = "0.12.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "93857453250e3077bd71ff98b6a65ea6621a19bb0f559a85248955ac12c45a1a"
dependencies = [
 "lock_api",
 "parking_lot_core",
]

[[package]]
name = "parking_lot_core"
version = "0.9.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2621685985a2ebf1c516881c026032ac7deafcda1a2c9b7850dc81e3dfcb64c1"
dependencies = [
 "cfg-if",
 "libc",
 "redox_syscall",
 "smallvec",
 "windows-link",
]

[[package]]
name = "percent-encoding"
version = "2.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9b4f627cb1b25917193a259e49bdad08f671f8d9708acfd5fe0a8c1455d87220"

[[package]]
name = "phf"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c1562dc717473dbaa4c1f85a36410e03c047b2e7df7f45ee938fbef64ae7fadf"
dependencies = [
 "phf_macros",
 "phf_shared",
 "serde",
]

[[package]]
name = "phf_codegen"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "49aa7f9d80421bca176ca8dbfebe668cc7a2684708594ec9f3c0db0805d5d6e1"
dependencies = [
 "phf_generator",
 "phf_shared",
]

[[package]]
name = "phf_generator"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "135ace3a761e564ec88c03a77317a7c6b80bb7f7135ef2544dbe054243b89737"
dependencies = [
 "fastrand",
 "phf_shared",
]

[[package]]
name = "phf_macros"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "812f032b54b1e759ccd5f8b6677695d5268c588701effba24601f6932f8269ef"
dependencies = [
 "phf_generator",
 "phf_shared",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "phf_shared"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e57fef6bc5981e38c2ce2d63bfa546861309f875b8a75f092d1d54ae2d64f266"
dependencies = [
 "siphasher",
]

[[package]]
name = "pin-project-lite"
version = "0.2.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a89322df9ebe1c1578d689c92318e070967d1042b512afbe49518723f4e6d5cd"

[[package]]
name = "piper"
version = "0.2.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c835479a4443ded371d6c535cbfd8d31ad92c5d23ae9770a61bc155e4992a3c1"
dependencies = [
 "atomic-waker",
 "fastrand",
 "futures-io",
]

[[package]]
name = "pkg-config"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f6b464fbc74e149a392436b17d523f769e057cb6877f6a5c4618bc6f11800548"

[[package]]
name = "plist"
version = "1.10.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "327a4cb2ad49dc48adfdc9da89e22c64d488b508c67a044d71ba729e4521a285"
dependencies = [
 "base64 0.23.1",
 "indexmap 2.14.2",
 "quick-xml",
 "serde",
 "time",
]

[[package]]
name = "png"
version = "0.18.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "60769b8b31b2a9f263dae2776c37b1b28ae246943cf719eb6946a1db05128a61"
dependencies = [
 "bitflags 2.13.2",
 "crc32fast",
 "fdeflate",
 "flate2",
 "miniz_oxide 0.8.9",
]

[[package]]
name = "polling"
version = "3.11.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5d0e4f59085d47d8241c88ead0f274e8a0cb551f3625263c05eb8dd897c34218"
dependencies = [
 "cfg-if",
 "concurrent-queue",
 "hermit-abi",
 "pin-project-lite",
 "rustix",
 "windows-sys 0.61.2",
]

[[package]]
name = "portable-atomic"
version = "1.15.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "05c8b63e8d9609db387f0324918f81d68fe27748f084ef092fb35954d0539a85"

[[package]]
name = "portable-atomic-util"
version = "0.2.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "10ab3eb7f3becc3a1cbc4f2c6f20267996cfc1a6467a873763411b136a122715"
dependencies = [
 "portable-atomic",
]

[[package]]
name = "potential_utf"
version = "0.1.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d83eb9bc6d8e5cf568e7a1101d60ee05e81ed50ea106026f3d18deeb046d7661"
dependencies = [
 "zerovec",
]

[[package]]
name = "powerfmt"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4a6394b9e965e73d0a289ee54f589087e2c676aedf60885baf52c76b771e4958"

[[package]]
name = "precomputed-hash"
version = "0.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "925383efa346730478fb4838dbe9137d2a47675ad789c546d150a6e1dd4ab31c"

[[package]]
name = "proc-macro-crate"
version = "1.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7f4c021e1093a56626774e81216a4ce732a735e5bad4868a03f3ed65ca0c3919"
dependencies = [
 "once_cell",
 "toml_edit 0.19.15",
]

[[package]]
name = "proc-macro-crate"
version = "2.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b00f26d3400549137f92511a46ac1cd8ce37cb5598a96d382381458b992a5d24"
dependencies = [
 "toml_datetime 0.6.3",
 "toml_edit 0.20.2",
]

[[package]]
name = "proc-macro-crate"
version = "3.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e67ba7e9b2b56446f1d419b1d807906278ffa1a658a8a5d8a39dcb1f5a78614f"
dependencies = [
 "toml_edit 0.25.18+spec-1.1.0",
]

[[package]]
name = "proc-macro-error"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "da25490ff9892aab3fcf7c36f08cfb902dd3e71ca0f9f9517bea02a73a5ce38c"
dependencies = [
 "proc-macro-error-attr",
 "proc-macro2",
 "quote",
 "syn 1.0.109",
 "version_check",
]

[[package]]
name = "proc-macro-error-attr"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a1be40180e52ecc98ad80b184934baf3d0d29f979574e439af5a55274b35f869"
dependencies = [
 "proc-macro2",
 "quote",
 "version_check",
]

[[package]]
name = "proc-macro2"
version = "1.0.107"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "985e7ec9bb745e6ce6535b544d84d6cd6f7ad8bd711c398938ae983b91a766d9"
dependencies = [
 "unicode-ident",
]

[[package]]
name = "quick-xml"
version = "0.42.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "41b1177fdf999d2321d3fb46ff47159d9c1fb9ad66a4879f8c50a0b504615e9b"
dependencies = [
 "memchr",
]

[[package]]
name = "quote"
version = "1.0.47"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1fbf4db142a473a8d80c26bbf18454ed458bf8d26c8219c331daecfdbd079001"
dependencies = [
 "proc-macro2",
]

[[package]]
name = "r-efi"
version = "5.3.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "69cdb34c158ceb288df11e18b4bd39de994f6657d83847bdffdbd7f346754b0f"

[[package]]
name = "r-efi"
version = "6.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f8dcc9c7d52a811697d2151c701e0d08956f92b0e24136cf4cf27b57a6a0d9bf"

[[package]]
name = "raw-window-handle"
version = "0.6.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "20675572f6f24e9e76ef639bc5552774ed45f1c30e2951e1e99c59888861c539"

[[package]]
name = "redox_syscall"
version = "0.5.18"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ed2bf2547551a7053d6fdfafda3f938979645c44812fbfcda098faae3f1a362d"
dependencies = [
 "bitflags 2.13.2",
]

[[package]]
name = "redox_users"
version = "0.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "60dc65c0ff1a7ae1294b0c67b9f14baf70b644404010370171787bfac1038fc0"
dependencies = [
 "libredox",
 "thiserror 2.0.21",
]

[[package]]
name = "ref-cast"
version = "1.0.27"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7e440fb4e4b4147295338efb76001ab9e4efc0e5839df2c47fc5ac2381d365c3"
dependencies = [
 "ref-cast-impl",
]

[[package]]
name = "ref-cast-impl"
version = "1.0.27"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "92ecd8964f8453721699a1ed72037b0db49ce2f5a5138486ee89bed6f67cdf3a"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "regex"
version = "1.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f020237b6c8eed93db2e2cb53c00c60a8e1bc73da7d073199a1180401450218d"
dependencies = [
 "aho-corasick",
 "memchr",
 "regex-automata",
 "regex-syntax",
]

[[package]]
name = "regex-automata"
version = "0.4.18"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ad8553b9b26413251cbf30e620595c7a41b3887f03da04579c0e6b0d6a06b4b2"
dependencies = [
 "aho-corasick",
 "memchr",
 "regex-syntax",
]

[[package]]
name = "regex-syntax"
version = "0.8.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d6f6ff9a378485b298a5286656da665ba74413d36db0979633275d2e708145d4"

[[package]]
name = "reqwest"
version = "0.13.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "16a1cfa75cc186dd73d5818e510e042e40927bccc9c236b061cea97e1eb08029"
dependencies = [
 "base64 0.23.1",
 "bytes",
 "futures-core",
 "futures-util",
 "http",
 "http-body",
 "http-body-util",
 "hyper",
 "hyper-util",
 "js-sys",
 "log",
 "percent-encoding",
 "pin-project-lite",
 "serde",
 "serde_json",
 "sync_wrapper",
 "tokio",
 "tokio-util",
 "tower",
 "tower-http",
 "tower-service",
 "url",
 "wasm-bindgen",
 "wasm-bindgen-futures",
 "wasm-streams",
 "web-sys",
]

[[package]]
name = "rfd"
version = "0.17.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "20dafead71c16a34e1ff357ddefc8afc11e7d51d6d2b9fbd07eaa48e3e540220"
dependencies = [
 "block2",
 "dispatch2",
 "glib-sys",
 "gobject-sys",
 "gtk-sys",
 "js-sys",
 "libc",
 "log",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
 "percent-encoding",
 "raw-window-handle",
 "wasm-bindgen",
 "wasm-bindgen-futures",
 "web-sys",
 "windows-sys 0.61.2",
]

[[package]]
name = "rustc-hash"
version = "2.1.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6b1e7f9a428571be2dc5bc0505c13fb6bf936822b894ec87abf8a08a4e51742d"

[[package]]
name = "rustc_version"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cfcb3a22ef46e85b45de6ee7e79d063319ebb6594faafcf1c225ea92ab6e9b92"
dependencies = [
 "semver",
]

[[package]]
name = "rustix"
version = "1.1.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e5e76742e5294153d4dde1207dbec5bdd81eef6fabdc0d2118babadabfd858aa"
dependencies = [
 "bitflags 2.13.2",
 "errno",
 "libc",
 "linux-raw-sys",
 "windows-sys 0.61.2",
]

[[package]]
name = "rustversion"
version = "1.0.23"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cf54715a573b99ac80df0bc206da022bcd442c974952c7b9720069370852e21f"

[[package]]
name = "same-file"
version = "1.0.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "93fc1dc3aaa9bfed95e02e6eadabb4baf7e3078b0bd1b4d7b6b0b68378900502"
dependencies = [
 "winapi-util",
]

[[package]]
name = "schemars"
version = "0.8.22"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3fbf2ae1b8bc8e02df939598064d22402220cd5bbcca1c76f7d6a310974d5615"
dependencies = [
 "dyn-clone",
 "indexmap 1.9.3",
 "schemars_derive",
 "serde",
 "serde_json",
 "url",
 "uuid",
]

[[package]]
name = "schemars"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4cd191f9397d57d581cddd31014772520aa448f65ef991055d7f61582c65165f"
dependencies = [
 "dyn-clone",
 "ref-cast",
 "serde",
 "serde_json",
]

[[package]]
name = "schemars"
version = "1.2.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ab508826f74a77ca9d5aba6ff19b522583ee3eaf28a19384ff3d0e5835fadf6e"
dependencies = [
 "dyn-clone",
 "ref-cast",
 "serde",
 "serde_json",
]

[[package]]
name = "schemars_derive"
version = "0.8.22"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "32e265784ad618884abaea0600a9adf15393368d840e0222d101a072f3f7534d"
dependencies = [
 "proc-macro2",
 "quote",
 "serde_derive_internals",
 "syn 2.0.119",
]

[[package]]
name = "scopeguard"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "94143f37725109f92c262ed2cf5e59bce7498c01bcc1502d7b9afe439a4e9f49"

[[package]]
name = "selectors"
version = "0.38.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8adfa1c298912827b8a28b223b3b874357397ae706e6190acd9bf28cee99114d"
dependencies = [
 "bitflags 2.13.2",
 "cssparser",
 "derive_more",
 "log",
 "new_debug_unreachable",
 "phf",
 "phf_codegen",
 "precomputed-hash",
 "rustc-hash",
 "servo_arc",
 "smallvec",
]

[[package]]
name = "semver"
version = "1.0.28"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8a7852d02fc848982e0c167ef163aaff9cd91dc640ba85e263cb1ce46fae51cd"
dependencies = [
 "serde",
 "serde_core",
]

[[package]]
name = "serde"
version = "1.0.229"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4148590afebada386688f18773da617792bf2ef03ffc1e4cbd2b1d45b023e0ba"
dependencies = [
 "serde_core",
 "serde_derive",
]

[[package]]
name = "serde-untagged"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f9faf48a4a2d2693be24c6289dbe26552776eb7737074e6722891fadbe6c5058"
dependencies = [
 "erased-serde",
 "serde",
 "serde_core",
 "typeid",
]

[[package]]
name = "serde_core"
version = "1.0.229"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67dca2c9c51e58a4791a4b1ed58308b39c64224d349a935ab5039aa360942a48"
dependencies = [
 "serde_derive",
]

[[package]]
name = "serde_derive"
version = "1.0.229"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e7a5d71263a5a7d47b41f6b3f06ba276f10cc18b0931f1799f710578e2309348"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "serde_derive_internals"
version = "0.29.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "18d26a20a969b9e3fdf2fc2d9f21eda6c40e2de84c9408bb5d3b05d499aae711"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "serde_json"
version = "1.0.154"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e7e9cc8b1b85264074fbcc02a88680c4096b1e47df8f739dceb03bf482f04bd6"
dependencies = [
 "itoa",
 "memchr",
 "serde",
 "serde_core",
 "zmij",
]

[[package]]
name = "serde_repr"
version = "0.1.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8d3b1629de253c70a0508c3899572da79ca359fdab27c7920ff00406df418906"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "serde_spanned"
version = "0.6.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bf41e0cfaf7226dca15e8197172c295a782857fcb97fad1808a166870dee75a3"
dependencies = [
 "serde",
]

[[package]]
name = "serde_spanned"
version = "1.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4e7523beb55eece201a2356bee0bbca0d1ab466c14c07703b2e0ee6d42cb0c2c"
dependencies = [
 "serde_core",
]

[[package]]
name = "serde_with"
version = "3.24.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "df9adc193c780ef8f159aee8b61e2d5801aaa555e6eb0947fe45530ec506296f"
dependencies = [
 "base64 0.23.1",
 "bs58",
 "chrono",
 "hex",
 "indexmap 1.9.3",
 "indexmap 2.14.2",
 "jiff",
 "schemars 0.9.0",
 "schemars 1.2.3",
 "serde_core",
 "serde_json",
 "serde_with_macros",
 "time",
]

[[package]]
name = "serde_with_macros"
version = "3.24.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3e17bbc68e28663bbbb90df47e058aa7eda4fb445b89fe70457bb94fbccf6e49"
dependencies = [
 "darling",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "serialize-to-javascript"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "04f3666a07a197cdb77cdf306c32be9b7f598d7060d50cfd4d5aa04bfd92f6c5"
dependencies = [
 "serde",
 "serde_json",
 "serialize-to-javascript-impl",
]

[[package]]
name = "serialize-to-javascript-impl"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "772ee033c0916d670af7860b6e1ef7d658a4629a6d0b4c8c3e67f09b3765b75d"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "servo_arc"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "170fb83ab34de17dc69aa7c67482b22218ddb85da56546f9bd6b929e32a05930"
dependencies = [
 "stable_deref_trait",
]

[[package]]
name = "sha2"
version = "0.10.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a7507d819769d01a365ab707794a4084392c824f54a7a6a7862f8c3d0892b283"
dependencies = [
 "cfg-if",
 "cpufeatures",
 "digest",
]

[[package]]
name = "shlex"
version = "2.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f8fadd59c855ef2080decdef8ff161eb6661b86933c9d82e5ba29dc602a55aba"

[[package]]
name = "signal-hook-registry"
version = "1.4.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c4db69cba1110affc0e9f7bcd48bbf87b3f4fc7c61fc9155afd4c469eb3d6c1b"
dependencies = [
 "errno",
 "libc",
]

[[package]]
name = "simd-adler32"
version = "0.3.10"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3a219298ac11a56ea9a6d2120044824d6f01aeb034955e7af7bc16858527deea"

[[package]]
name = "siphasher"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "33f4fe9184a62d842c9ef383018f3306d8ba224fd9d836f56d7288308847c256"

[[package]]
name = "slab"
version = "0.4.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0c790de23124f9ab44544d7ac05d60440adc586479ce501c1d6d7da3cd8c9cf5"

[[package]]
name = "smallvec"
version = "1.16.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d0d5d4b1981b8bbbb7aed204cae5726d683d5d6ac7e74ec54122ea28f315e7c8"

[[package]]
name = "socket2"
version = "0.6.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c3d1e2c7f27f8d4cb10542a02c49005dbd6e93095799d6f3be745fae9f8fedd4"
dependencies = [
 "libc",
 "windows-sys 0.61.2",
]

[[package]]
name = "softbuffer"
version = "0.4.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "aac18da81ebbf05109ab275b157c22a653bb3c12cf884450179942f81bcbf6c3"
dependencies = [
 "bytemuck",
 "js-sys",
 "ndk",
 "objc2",
 "objc2-core-foundation",
 "objc2-core-graphics",
 "objc2-foundation",
 "objc2-quartz-core",
 "raw-window-handle",
 "redox_syscall",
 "tracing",
 "wasm-bindgen",
 "web-sys",
 "windows-sys 0.61.2",
]

[[package]]
name = "soup3"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "471f924a40f31251afc77450e781cb26d55c0b650842efafc9c6cbd2f7cc4f9f"
dependencies = [
 "futures-channel",
 "gio",
 "glib",
 "libc",
 "soup3-sys",
]

[[package]]
name = "soup3-sys"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7ebe8950a680a12f24f15ebe1bf70db7af98ad242d9db43596ad3108aab86c27"
dependencies = [
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "stable_deref_trait"
version = "1.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6ce2be8dc25455e1f91df71bfa12ad37d7af1092ae736f3a6cd0e37bc7810596"

[[package]]
name = "static_vcruntime"
version = "3.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ff7589a1859b09232522bb9edf076ca7fcf14ded96685d3fa629db73023ffbb7"

[[package]]
name = "string_cache"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a18596f8c785a729f2819c0f6a7eae6ebeebdfffbfe4214ae6b087f690e31901"
dependencies = [
 "new_debug_unreachable",
 "parking_lot",
 "phf_shared",
 "precomputed-hash",
]

[[package]]
name = "string_cache_codegen"
version = "0.6.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "585635e46db231059f76c5849798146164652513eb9e8ab2685939dd90f29b69"
dependencies = [
 "phf_generator",
 "phf_shared",
 "proc-macro2",
 "quote",
]

[[package]]
name = "strsim"
version = "0.11.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7da8b5736845d9f2fcb837ea5d9e2628564b3b043a70948a3f0b778838c5fb4f"

[[package]]
name = "swift-rs"
version = "1.0.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cefd87076fd385308ee4aff597256c902f1fbb4d031de1558efc12f8ffefadd9"
dependencies = [
 "base64 0.21.7",
 "serde",
 "serde_json",
]

[[package]]
name = "syn"
version = "1.0.109"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "72b64191b275b66ffe2469e8af2c1cfe3bafa67b529ead792a6d0160888b4237"
dependencies = [
 "proc-macro2",
 "unicode-ident",
]

[[package]]
name = "syn"
version = "2.0.119"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "872831b642d1a07999a962a351ed35b955ea2cfc8f3862091e2a240a84f17297"
dependencies = [
 "proc-macro2",
 "quote",
 "unicode-ident",
]

[[package]]
name = "syn"
version = "3.0.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d78c8dee4c7bf0e14673097256fed6142ce9d3b85a408189d07482442145823b"
dependencies = [
 "proc-macro2",
 "quote",
 "unicode-ident",
]

[[package]]
name = "sync_wrapper"
version = "1.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0bf256ce5efdfa370213c1dabab5935a12e49f2c58d15e9eac2870d3b4f27263"
dependencies = [
 "futures-core",
]

[[package]]
name = "synstructure"
version = "0.14.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "901704edd0dfe137f1987838ee4f259e4e063c31371bdb423f7ae38ec6f77f02"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "system-deps"
version = "6.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a3e535eb8dded36d55ec13eddacd30dec501792ff23a0b1682c38601b8cf2349"
dependencies = [
 "cfg-expr",
 "heck 0.5.0",
 "pkg-config",
 "toml 0.8.2",
 "version-compare",
]

[[package]]
name = "tao"
version = "0.37.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d5777b06fe6435126ae8d816eba269e050e1e10d302cf5461e9c49eccabc3548"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "core-foundation",
 "core-graphics",
 "crossbeam-channel",
 "dbus",
 "dispatch2",
 "dlopen2",
 "dpi",
 "gdkwayland-sys",
 "gdkx11-sys",
 "gtk",
 "jni",
 "libc",
 "log",
 "ndk",
 "ndk-context",
 "ndk-sys",
 "objc2",
 "objc2-app-kit",
 "objc2-foundation",
 "objc2-ui-kit",
 "parking_lot",
 "percent-encoding",
 "raw-window-handle",
 "tao-macros",
 "unicode-segmentation",
 "url",
 "windows",
 "windows-core",
 "windows-version",
 "x11-dl",
]

[[package]]
name = "tao-macros"
version = "0.1.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5f7eeb6d99155545da6150a1795945f16ac9c178deb2a5f2e74d776107bd5849"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "target-lexicon"
version = "0.12.16"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "61c41af27dd6d1e27b1b16b489db798443478cef1f06a660c96db617ba5de3b1"

[[package]]
name = "tauri"
version = "2.12.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5fb0244332cfb9cee7e2a568bf5da29a36ed8fdbd717f6f47a66b6b7b358c072"
dependencies = [
 "anyhow",
 "bytes",
 "cookie",
 "dirs",
 "dunce",
 "embed_plist",
 "getrandom 0.3.4",
 "glob",
 "gtk",
 "heck 0.5.0",
 "http",
 "jni",
 "libc",
 "log",
 "mime",
 "muda",
 "objc2",
 "objc2-app-kit",
 "objc2-foundation",
 "objc2-ui-kit",
 "objc2-web-kit",
 "percent-encoding",
 "plist",
 "raw-window-handle",
 "reqwest",
 "serde",
 "serde_json",
 "serde_repr",
 "serialize-to-javascript",
 "swift-rs",
 "tauri-build",
 "tauri-macros",
 "tauri-runtime",
 "tauri-runtime-wry",
 "tauri-utils",
 "thiserror 2.0.21",
 "tokio",
 "tray-icon",
 "url",
 "webkit2gtk",
 "webview2-com",
 "window-vibrancy",
 "windows",
]

[[package]]
name = "tauri-build"
version = "2.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "adddb0e648752aaac5da9c3c3c6a68e1e87cab55e3b757b18a9441ef8c3ac614"
dependencies = [
 "anyhow",
 "cargo_toml",
 "dirs",
 "glob",
 "heck 0.5.0",
 "json-patch",
 "schemars 0.8.22",
 "semver",
 "serde",
 "serde_json",
 "static_vcruntime",
 "strsim",
 "tauri-utils",
 "tauri-winres",
 "walkdir",
]

[[package]]
name = "tauri-codegen"
version = "2.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fb37631cf71dab5e8ab55e1bdd701e18a52653d90b78e71d0e5598b1e0a61316"
dependencies = [
 "base64 0.23.1",
 "brotli",
 "ico",
 "json-patch",
 "plist",
 "png",
 "proc-macro2",
 "quote",
 "semver",
 "serde",
 "serde_json",
 "sha2",
 "syn 2.0.119",
 "tauri-utils",
 "thiserror 2.0.21",
 "time",
 "url",
 "uuid",
 "walkdir",
]

[[package]]
name = "tauri-macros"
version = "2.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0cc38db58854c10fb5f91a887ed8bf82d3239bb92b5d8db86eda09e96d9963d1"
dependencies = [
 "heck 0.5.0",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
 "tauri-codegen",
 "tauri-utils",
]

[[package]]
name = "tauri-plugin"
version = "2.7.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67fb21a77e8f94e8beb3325e583102488659365af0a3948b7ea244c5b779c291"
dependencies = [
 "anyhow",
 "glob",
 "plist",
 "schemars 0.8.22",
 "serde",
 "serde_json",
 "tauri-utils",
 "walkdir",
]

[[package]]
name = "tauri-plugin-dialog"
version = "2.8.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ce0fb9c2b6d34a9720627ed930ebc8af26f61e648695aecaeb03d5c33c5896f5"
dependencies = [
 "log",
 "raw-window-handle",
 "rfd",
 "serde",
 "serde_json",
 "tauri",
 "tauri-plugin",
 "tauri-plugin-fs",
 "thiserror 2.0.21",
 "url",
]

[[package]]
name = "tauri-plugin-fs"
version = "2.7.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5d58eb1d4984e535f47a642ffec09a2da6f5c18a12b5902d12126cb7626d628b"
dependencies = [
 "anyhow",
 "dunce",
 "glob",
 "log",
 "objc2-foundation",
 "percent-encoding",
 "schemars 0.8.22",
 "serde",
 "serde_json",
 "serde_repr",
 "tauri",
 "tauri-plugin",
 "tauri-utils",
 "thiserror 2.0.21",
 "toml 1.2.0+spec-1.1.0",
 "url",
]

[[package]]
name = "tauri-plugin-opener"
version = "2.7.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "53810be1b4fed22bb6ac3f4cab5a2b80d9391d1af436bda145607532bc0bb219"
dependencies = [
 "dunce",
 "glob",
 "objc2-app-kit",
 "objc2-foundation",
 "open",
 "schemars 0.8.22",
 "serde",
 "serde_json",
 "tauri",
 "tauri-plugin",
 "thiserror 2.0.21",
 "url",
 "windows",
 "zbus",
]

[[package]]
name = "tauri-runtime"
version = "2.12.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7c55766d99cea69055904d1735b93c2049302b2e09effd462120deb5581d78e9"
dependencies = [
 "cookie",
 "dpi",
 "gtk",
 "http",
 "jni",
 "objc2",
 "objc2-ui-kit",
 "objc2-web-kit",
 "raw-window-handle",
 "serde",
 "serde_json",
 "tauri-utils",
 "thiserror 2.0.21",
 "url",
 "webkit2gtk",
 "webview2-com",
 "windows",
]

[[package]]
name = "tauri-runtime-wry"
version = "2.12.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e1aa9d8b7a120f879f44fdc1053f7b7dbf416bf0bbc6a72b714dec46b782b52f"
dependencies = [
 "gtk",
 "http",
 "jni",
 "log",
 "objc2",
 "objc2-app-kit",
 "percent-encoding",
 "raw-window-handle",
 "softbuffer",
 "tao",
 "tauri-runtime",
 "tauri-utils",
 "url",
 "webkit2gtk",
 "webview2-com",
 "windows",
 "wry",
]

[[package]]
name = "tauri-utils"
version = "2.10.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "362ab21cd4cc713f2a02b1a9b5688198b1541cfb6907c4281e9190e0f0ef4aa3"
dependencies = [
 "anyhow",
 "brotli",
 "cargo_metadata",
 "ctor",
 "dom_query",
 "dunce",
 "glob",
 "http",
 "infer",
 "json-patch",
 "log",
 "memchr",
 "phf",
 "plist",
 "proc-macro2",
 "quote",
 "regex",
 "schemars 0.8.22",
 "semver",
 "serde",
 "serde-untagged",
 "serde_json",
 "serde_with",
 "swift-rs",
 "thiserror 2.0.21",
 "toml 1.2.0+spec-1.1.0",
 "url",
 "urlpattern",
 "uuid",
 "walkdir",
]

[[package]]
name = "tauri-winres"
version = "0.3.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c52bb6904475a6ca662f15ef787f18ade61d5740a1ee12c45d3b748efdb6f796"
dependencies = [
 "dunce",
 "embed-resource",
 "toml 1.2.0+spec-1.1.0",
]

[[package]]
name = "tempfile"
version = "3.27.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "32497e9a4c7b38532efcdebeef879707aa9f794296a4f0244f6f69e9bc8574bd"
dependencies = [
 "fastrand",
 "getrandom 0.4.3",
 "once_cell",
 "rustix",
 "windows-sys 0.61.2",
]

[[package]]
name = "tendril"
version = "0.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5fed54709c5b3a53d09bb1c113ea4f5ceafd1e772ddcb0030a82e1d56c087b08"
dependencies = [
 "new_debug_unreachable",
]

[[package]]
name = "thiserror"
version = "1.0.69"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b6aaf5339b578ea85b50e080feb250a3e8ae8cfcdff9a461c9ec2904bc923f52"
dependencies = [
 "thiserror-impl 1.0.69",
]

[[package]]
name = "thiserror"
version = "2.0.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "09e52cb86a36cede5cb101bf8908837b3e4c6e5e59fe7fd85c23fb56200d189e"
dependencies = [
 "thiserror-impl 2.0.21",
]

[[package]]
name = "thiserror-impl"
version = "1.0.69"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4fee6c4efc90059e10f81e6d42c60a18f76588c3d74cb83a0b242a2b6c7504c1"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "thiserror-impl"
version = "2.0.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fe5197923287db20a58125f0bc85c062f7f2c892de97b18c356f9efb14b28524"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "time"
version = "0.3.55"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cdb87b95ec50ddfa440816d227a17b2ccbdda963a316a727fda0fc4334f7d134"
dependencies = [
 "deranged",
 "num-conv",
 "powerfmt",
 "serde_core",
 "time-core",
 "time-macros",
]

[[package]]
name = "time-core"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9e1c906769ad99c88eaa54e728060edef082f8e358ff32030cb7c7d315e81109"

[[package]]
name = "time-macros"
version = "0.2.32"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7e689342a48d2ea927c87ea50cabf8594854bf940e9310208848d680d668ed85"
dependencies = [
 "num-conv",
 "time-core",
]

[[package]]
name = "tinystr"
version = "0.8.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "abc840c238154d58f9e86b2792261edfde565a17696e1cda1a449de27979801a"
dependencies = [
 "displaydoc",
 "zerovec",
]

[[package]]
name = "tinyvec"
version = "1.13.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fd3ca314f692efd6c868f8408f53fe444634a845f96c028b97d35f6a1f79f0ee"

[[package]]
name = "tokio"
version = "1.54.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b52fd3255258d26fac7264ab5a76b53c13367136dc011d3d6ad4f8ed070396a3"
dependencies = [
 "bytes",
 "libc",
 "mio",
 "pin-project-lite",
 "socket2",
 "windows-sys 0.61.2",
]

[[package]]
name = "tokio-util"
version = "0.7.20"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e464cf451ba96ebfc6f9b6542f17ee8b8956e33f1e40d9690624e59d7a7f8a4b"
dependencies = [
 "bytes",
 "futures-core",
 "futures-sink",
 "pin-project-lite",
 "tokio",
]

[[package]]
name = "toml"
version = "0.8.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "185d8ab0dfbb35cf1399a6344d8484209c088f75f8f68230da55d48d95d43e3d"
dependencies = [
 "serde",
 "serde_spanned 0.6.9",
 "toml_datetime 0.6.3",
 "toml_edit 0.20.2",
]

[[package]]
name = "toml"
version = "1.2.0+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c5ffcdf8f50436dbbfd675c1fe1b8e0854f42b7defea8584bdebe1aee900e561"
dependencies = [
 "indexmap 2.14.2",
 "serde_core",
 "serde_spanned 1.1.2",
 "toml_datetime 1.1.2+spec-1.1.0",
 "toml_parser",
 "toml_writer",
 "winnow 1.0.5",
]

[[package]]
name = "toml_datetime"
version = "0.6.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7cda73e2f1397b1262d6dfdcef8aafae14d1de7748d66822d3bfeeb6d03e5e4b"
dependencies = [
 "serde",
]

[[package]]
name = "toml_datetime"
version = "1.1.2+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2b86d767906c6c42421dcba507eb9d203e779497710a47782a224bb871653053"
dependencies = [
 "serde_core",
]

[[package]]
name = "toml_edit"
version = "0.19.15"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1b5bb770da30e5cbfde35a2d7b9b8a2c4b8ef89548a7a6aeab5c9a576e3e7421"
dependencies = [
 "indexmap 2.14.2",
 "toml_datetime 0.6.3",
 "winnow 0.5.40",
]

[[package]]
name = "toml_edit"
version = "0.20.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "396e4d48bbb2b7554c944bde63101b5ae446cff6ec4a24227428f15eb72ef338"
dependencies = [
 "indexmap 2.14.2",
 "serde",
 "serde_spanned 0.6.9",
 "toml_datetime 0.6.3",
 "winnow 0.5.40",
]

[[package]]
name = "toml_edit"
version = "0.25.18+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1ec6e78bd70db9420d8d212fa9dc97f116448a1ceff5d00eabb991d407e21396"
dependencies = [
 "indexmap 2.14.2",
 "toml_datetime 1.1.2+spec-1.1.0",
 "toml_parser",
 "winnow 1.0.5",
]

[[package]]
name = "toml_parser"
version = "1.1.5+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "baa693a8032d7e1cada7d0041e96126df243179ff061456783ac7f12bda4744c"
dependencies = [
 "winnow 1.0.5",
]

[[package]]
name = "toml_writer"
version = "1.2.0+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "009dbb7700f11c55ef83aebbe4c0e9cf1f1ac0844bd8d6f00dc38f302026e13a"

[[package]]
name = "tower"
version = "0.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ebe5ef63511595f1344e2d5cfa636d973292adc0eec1f0ad45fae9f0851ab1d4"
dependencies = [
 "futures-core",
 "futures-util",
 "pin-project-lite",
 "sync_wrapper",
 "tokio",
 "tower-layer",
 "tower-service",
]

[[package]]
name = "tower-http"
version = "0.6.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4cfcf7e2740e6fc6d4d688b4ef00650406bb94adf4731e43c096c3a19fe40840"
dependencies = [
 "bitflags 2.13.2",
 "bytes",
 "futures-util",
 "http",
 "http-body",
 "pin-project-lite",
 "tower",
 "tower-layer",
 "tower-service",
 "url",
]

[[package]]
name = "tower-layer"
version = "0.3.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "121c2a6cda46980bb0fcd1647ffaf6cd3fc79a013de288782836f6df9c48780e"

[[package]]
name = "tower-service"
version = "0.3.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8df9b6e13f2d32c91b9bd719c00d1958837bc7dec474d94952798cc8e69eeec3"

[[package]]
name = "tracing"
version = "0.1.44"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "63e71662fa4b2a2c3a26f570f037eb95bb1f85397f3cd8076caed2f026a6d100"
dependencies = [
 "pin-project-lite",
 "tracing-attributes",
 "tracing-core",
]

[[package]]
name = "tracing-attributes"
version = "0.1.31"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7490cfa5ec963746568740651ac6781f701c9c5ea257c58e057f3ba8cf69e8da"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "tracing-core"
version = "0.1.36"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "db97caf9d906fbde555dd62fa95ddba9eecfd14cb388e4f491a66d74cd5fb79a"
dependencies = [
 "once_cell",
]

[[package]]
name = "tray-icon"
version = "0.25.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b2b9c52859a94554803ccd4a24b98f74148ebc73b90676d783f3490b1bff9d72"
dependencies = [
 "crossbeam-channel",
 "dirs",
 "libappindicator",
 "muda",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-core-graphics",
 "objc2-foundation",
 "once_cell",
 "png",
 "serde",
 "thiserror 2.0.21",
 "windows-sys 0.61.2",
]

[[package]]
name = "try-lock"
version = "0.2.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e421abadd41a4225275504ea4d6566923418b7f05506fbc9c0fe86ba7396114b"

[[package]]
name = "typeid"
version = "1.0.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bc7d623258602320d5c55d1bc22793b57daff0ec7efc270ea7d55ce1d5f5471c"

[[package]]
name = "typenum"
version = "1.20.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b6f5e870be6c3b371b77fe0ee0bafb859fa4964b4404c27de1d380043c4dda20"

[[package]]
name = "uds_windows"
version = "1.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f2f6fb2847f6742cd76af783a2a2c49e9375d0a111c7bef6f71cd9e738c72d6e"
dependencies = [
 "memoffset",
 "tempfile",
 "windows-sys 0.61.2",
]

[[package]]
name = "unicode-ident"
version = "1.0.27"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a2c754d6c33795a1c324727428e5a7dedb5b06195f9890bdbcba760d3e246563"

[[package]]
name = "unicode-segmentation"
version = "1.13.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c6f5d3c3b1bf09027a88a6bc961fc00497d651009560b5463668dc81b0fa87a8"

[[package]]
name = "url"
version = "2.5.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ff67a8a4397373c3ef660812acab3268222035010ab8680ec4215f38ba3d0eed"
dependencies = [
 "form_urlencoded",
 "idna",
 "percent-encoding",
 "serde",
 "serde_derive",
]

[[package]]
name = "urlpattern"
version = "0.6.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "df16f50ef4cc145211879a3867ba757076b25dfee812040dcb0658bd9ae7904b"
dependencies = [
 "icu_properties",
 "regex",
 "serde",
 "url",
]

[[package]]
name = "utf8_iter"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "af3bd9d3e571c26fcce9d033b87ea5ab061b8d2ffe9b7a5675d810d68f03edf0"
dependencies = [
 "utf_types",
]

[[package]]
name = "utf_types"
version = "1.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3a3b425286980a367278453f3b6d28cdcb134b574e5a35824a6ff5eebad50bb6"

[[package]]
name = "uuid"
version = "1.29.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4a0e2d11620c50695fe12bbbfde96b3477fe606e7284c22d505c12ce51214514"
dependencies = [
 "getrandom 0.4.3",
 "js-sys",
 "serde_core",
 "wasm-bindgen",
]

[[package]]
name = "version-compare"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "03c2856837ef78f57382f06b2b8563a2f512f7185d732608fd9176cb3b8edf0e"

[[package]]
name = "version_check"
version = "0.9.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0b928f33d975fc6ad9f86c8f283853ad26bdd5b10b7f1542aa2fa15e2289105a"

[[package]]
name = "vswhom"
version = "0.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "be979b7f07507105799e854203b470ff7c78a1639e330a58f183b5fea574608b"
dependencies = [
 "libc",
 "vswhom-sys",
]

[[package]]
name = "vswhom-sys"
version = "0.1.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fb067e4cbd1ff067d1df46c9194b5de0e98efd2810bbc95c5d5e5f25a3231150"
dependencies = [
 "cc",
 "libc",
]

[[package]]
name = "walkdir"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "29790946404f91d9c5d06f9874efddea1dc06c5efe94541a7d6863108e3a5e4b"
dependencies = [
 "same-file",
 "winapi-util",
]

[[package]]
name = "want"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ec4cdd0dd910afe868b7ef477227d8d538b46b3075031afee8a9f2acb0a2ed0b"
dependencies = [
 "try-lock",
]

[[package]]
name = "wasi"
version = "0.11.1+wasi-snapshot-preview1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ccf3ec651a847eb01de73ccad15eb7d99f80485de043efb2f370cd654f4ea44b"

[[package]]
name = "wasip2"
version = "1.0.4+wasi-0.2.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b67efb37e106e55ce722a510d6b5f9c17f083e5fc79afc2badeb12cc313d9487"
dependencies = [
 "wit-bindgen",
]

[[package]]
name = "wasm-bindgen"
version = "0.2.130"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a0181c14ddd6c7b8b0b0132a5f1ea2f32be0d893cd3ea97b6e3b28886b8a3d1c"
dependencies = [
 "cfg-if",
 "rustversion",
 "wasm-bindgen-macro",
 "wasm-bindgen-shared",
]

[[package]]
name = "wasm-bindgen-futures"
version = "0.4.80"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5e14e0327cb5368ad60ccb22d04a9827a693c95a926d8d125e9fa39e0baec501"
dependencies = [
 "js-sys",
 "tokio",
 "wasm-bindgen",
]

[[package]]
name = "wasm-bindgen-macro"
version = "0.2.130"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e931a02a39abdbf66966fc35902b5ed58344750a70885bed4ebb3d8eaf28ed9"
dependencies = [
 "quote",
 "wasm-bindgen-macro-support",
]

[[package]]
name = "wasm-bindgen-macro-support"
version = "0.2.130"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2ca4b54280e455bd831e33a6b8e734baf432fe63fbc35c42ac14ce67a043a53a"
dependencies = [
 "bumpalo",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "wasm-bindgen-shared",
]

[[package]]
name = "wasm-bindgen-shared"
version = "0.2.130"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3b1f9c3798725016c6ee5f2f57869ec0831e8bbc0ab0310a86e787e97f41389e"
dependencies = [
 "unicode-ident",
]

[[package]]
name = "wasm-streams"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9d1ec4f6517c9e11ae630e200b2b65d193279042e28edd4a2cda233e46670bbb"
dependencies = [
 "futures-util",
 "js-sys",
 "wasm-bindgen",
 "wasm-bindgen-futures",
 "web-sys",
]

[[package]]
name = "web-sys"
version = "0.3.107"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d7d179596ff5ec0f6de4db64d54011bde6289cc49603d3a6e4ce3f329207ab88"
dependencies = [
 "js-sys",
 "wasm-bindgen",
]

[[package]]
name = "web-time"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5a6580f308b1fad9207618087a65c04e7a10bc77e02c8e84e9b00dd4b12fa0bb"
dependencies = [
 "js-sys",
 "wasm-bindgen",
]

[[package]]
name = "web_atoms"
version = "0.2.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ba8b815c1b593dc0baf78dd0f4fc8fdb2de53198fb1163738093e9a311c33fb3"
dependencies = [
 "phf",
 "phf_codegen",
 "string_cache",
 "string_cache_codegen",
]

[[package]]
name = "webkit2gtk"
version = "2.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a1027150013530fb2eaf806408df88461ae4815a45c541c8975e61d6f2fc4793"
dependencies = [
 "bitflags 1.3.2",
 "cairo-rs",
 "gdk",
 "gdk-sys",
 "gio",
 "gio-sys",
 "glib",
 "glib-sys",
 "gobject-sys",
 "gtk",
 "gtk-sys",
 "javascriptcore-rs",
 "libc",
 "once_cell",
 "soup3",
 "webkit2gtk-sys",
]

[[package]]
name = "webkit2gtk-sys"
version = "2.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "916a5f65c2ef0dfe12fff695960a2ec3d4565359fdbb2e9943c974e06c734ea5"
dependencies = [
 "bitflags 1.3.2",
 "cairo-sys-rs",
 "gdk-sys",
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "gtk-sys",
 "javascriptcore-rs-sys",
 "libc",
 "pkg-config",
 "soup3-sys",
 "system-deps",
]

[[package]]
name = "webview2-com"
version = "0.39.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f89fca7a704cee10dcb3654c1dbb8941d1783132f1917358af75bec37a7d7e6"
dependencies = [
 "webview2-com-macros",
 "webview2-com-sys",
 "windows",
 "windows-core",
]

[[package]]
name = "webview2-com-macros"
version = "0.8.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67a921c1b6914c367b2b823cd4cde6f96beec77d30a939c8199bb377cf9b9b54"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "webview2-com-sys"
version = "0.39.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b3a07132775117d6065853d9d1178157b8c90e228de47129d6bce2c7edebedfb"
dependencies = [
 "thiserror 2.0.21",
 "windows",
 "windows-core",
]

[[package]]
name = "winapi"
version = "0.3.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5c839a674fcd7a98952e593242ea400abe93992746761e38641405d28b00f419"
dependencies = [
 "winapi-i686-pc-windows-gnu",
 "winapi-x86_64-pc-windows-gnu",
]

[[package]]
name = "winapi-i686-pc-windows-gnu"
version = "0.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ac3b87c63620426dd9b991e5ce0329eff545bccbbb34f3be09ff6fb6ab51b7b6"

[[package]]
name = "winapi-util"
version = "0.1.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c2a7b1c03c876122aa43f3020e6c3c3ee5c05081c9a00739faf7503aeba10d22"
dependencies = [
 "windows-sys 0.61.2",
]

[[package]]
name = "winapi-x86_64-pc-windows-gnu"
version = "0.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "712e227841d057c1ee1cd2fb22fa7e5a5461ae8e48fa2ca79ec42cfc1931183f"

[[package]]
name = "window-vibrancy"
version = "0.8.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "111e51caca442cafd9bab396628ac4d814880eaea4e63dfd76a12e9f342b5580"
dependencies = [
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
 "objc2-quartz-core",
 "raw-window-handle",
 "windows-sys 0.61.2",
 "windows-version",
]

[[package]]
name = "windows"
version = "0.62.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "527fadee13e0c05939a6a05d5bd6eec6cd2e3dbd648b9f8e447c6518133d8580"
dependencies = [
 "windows-collections",
 "windows-core",
 "windows-future",
 "windows-numerics",
]

[[package]]
name = "windows-collections"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "23b2d95af1a8a14a3c7367e1ed4fc9c20e0a26e79551b1454d72583c97cc6610"
dependencies = [
 "windows-core",
]

[[package]]
name = "windows-core"
version = "0.62.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b8e83a14d34d0623b51dce9581199302a221863196a1dde71a7663a4c2be9deb"
dependencies = [
 "windows-implement",
 "windows-interface",
 "windows-link",
 "windows-result",
 "windows-strings",
]

[[package]]
name = "windows-future"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e1d6f90251fe18a279739e78025bd6ddc52a7e22f921070ccdc67dde84c605cb"
dependencies = [
 "windows-core",
 "windows-link",
 "windows-threading",
]

[[package]]
name = "windows-implement"
version = "0.60.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "053e2e040ab57b9dc951b72c264860db7eb3b0200ba345b4e4c3b14f67855ddf"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "windows-interface"
version = "0.59.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f316c4a2570ba26bbec722032c4099d8c8bc095efccdc15688708623367e358"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "windows-link"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f0805222e57f7521d6a62e36fa9163bc891acd422f971defe97d64e70d0a4fe5"

[[package]]
name = "windows-numerics"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e2e40844ac143cdb44aead537bbf727de9b044e107a0f1220392177d15b0f26"
dependencies = [
 "windows-core",
 "windows-link",
]

[[package]]
name = "windows-result"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7781fa89eaf60850ac3d2da7af8e5242a5ea78d1a11c49bf2910bb5a73853eb5"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-strings"
version = "0.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7837d08f69c77cf6b07689544538e017c1bfcf57e34b4c0ff58e6c2cd3b37091"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-sys"
version = "0.45.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "75283be5efb2831d37ea142365f009c02ec203cd29a3ebecbc093d52315b66d0"
dependencies = [
 "windows-targets",
]

[[package]]
name = "windows-sys"
version = "0.61.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ae137229bcbd6cdf0f7b80a31df61766145077ddf49416a728b02cb3921ff3fc"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-targets"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8e5180c00cd44c9b1c88adb3693291f1cd93605ded80c250a75d472756b4d071"
dependencies = [
 "windows_aarch64_gnullvm",
 "windows_aarch64_msvc",
 "windows_i686_gnu",
 "windows_i686_msvc",
 "windows_x86_64_gnu",
 "windows_x86_64_gnullvm",
 "windows_x86_64_msvc",
]

[[package]]
name = "windows-threading"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3949bd5b99cafdf1c7ca86b43ca564028dfe27d66958f2470940f73d86d75b37"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-version"
version = "0.1.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e4060a1da109b9d0326b7262c8e12c84df67cc0dbc9e33cf49e01ccc2eb63631"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows_aarch64_gnullvm"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "597a5118570b68bc08d8d59125332c54f1ba9d9adeedeef5b99b02ba2b0698f8"

[[package]]
name = "windows_aarch64_msvc"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e08e8864a60f06ef0d0ff4ba04124db8b0fb3be5776a5cd47641e942e58c4d43"

[[package]]
name = "windows_i686_gnu"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c61d927d8da41da96a81f029489353e68739737d3beca43145c8afec9a31a84f"

[[package]]
name = "windows_i686_msvc"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "44d840b6ec649f480a41c8d80f9c65108b92d89345dd94027bfe06ac444d1060"

[[package]]
name = "windows_x86_64_gnu"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8de912b8b8feb55c064867cf047dda097f92d51efad5b491dfb98f6bbb70cb36"

[[package]]
name = "windows_x86_64_gnullvm"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "26d41b46a36d453748aedef1486d5c7a85db22e56aff34643984ea85514e94a3"

[[package]]
name = "windows_x86_64_msvc"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9aec5da331524158c6d1a4ac0ab1541149c0b9505fde06423b02f5ef0106b9f0"

[[package]]
name = "winnow"
version = "0.5.40"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f593a95398737aeed53e489c785df13f3618e41dbcd6718c6addbf1395aa6876"
dependencies = [
 "memchr",
]

[[package]]
name = "winnow"
version = "1.0.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8c3b93199df0ab874cdf0c6a94f0a0dc3423fe41f1cafb62b8bd7b1deb277aef"
dependencies = [
 "memchr",
]

[[package]]
name = "winreg"
version = "0.56.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7d6f32a0ff4a9f6f01231eb2059cc85479330739333e0e58cadf03b6af2cca10"
dependencies = [
 "cfg-if",
 "windows-sys 0.61.2",
]

[[package]]
name = "wit-bindgen"
version = "0.57.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1ebf944e87a7c253233ad6766e082e3cd714b5d03812acc24c318f549614536e"

[[package]]
name = "writeable"
version = "0.6.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3ad82d2a33cdc9674dc7465672f271e096168fcdbe0f799d9e6db8c5892679dc"

[[package]]
name = "wry"
version = "0.57.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "759c50ddad0ef9913bb5496cb9d509a50433a3b78cb0238d61105526589cf0e9"
dependencies = [
 "base64 0.23.1",
 "block2",
 "cookie",
 "crossbeam-channel",
 "dirs",
 "dom_query",
 "dpi",
 "dunce",
 "gdkx11",
 "gtk",
 "http",
 "javascriptcore-rs",
 "jni",
 "libc",
 "ndk",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
 "objc2-ui-kit",
 "objc2-web-kit",
 "percent-encoding",
 "raw-window-handle",
 "sha2",
 "soup3",
 "tao-macros",
 "thiserror 2.0.21",
 "url",
 "webkit2gtk",
 "webkit2gtk-sys",
 "webview2-com",
 "windows",
 "windows-core",
 "windows-version",
 "x11-dl",
]

[[package]]
name = "x11"
version = "2.21.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "502da5464ccd04011667b11c435cb992822c2c0dbde1770c988480d312a0db2e"
dependencies = [
 "libc",
 "pkg-config",
]

[[package]]
name = "x11-dl"
version = "2.21.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "38735924fedd5314a6e548792904ed8c6de6636285cb9fec04d5b1db85c1516f"
dependencies = [
 "libc",
 "once_cell",
 "pkg-config",
]

[[package]]
name = "yoke"
version = "0.8.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "417ef3fcf6c300b7dbd25c85531a746931c02ad536f3cf4786ed1e88223340b3"
dependencies = [
 "stable_deref_trait",
 "yoke-derive",
 "zerofrom",
]

[[package]]
name = "yoke-derive"
version = "0.8.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ec8ebde2db3681e8c9980cc27822030e68752690ddfa9473e739aeb4dbde6d71"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "synstructure",
]

[[package]]
name = "zbus"
version = "5.19.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5db4be7c075cb421e4b7ee645541604239bd243ba7c357511f4ff3a74b555907"
dependencies = [
 "async-broadcast",
 "async-executor",
 "async-io",
 "async-lock",
 "async-process",
 "async-recursion",
 "async-task",
 "async-trait",
 "blocking",
 "enumflags2",
 "event-listener",
 "futures-core",
 "futures-lite",
 "hex",
 "libc",
 "ordered-stream",
 "rustix",
 "serde",
 "serde_repr",
 "tracing",
 "uds_windows",
 "uuid",
 "windows-sys 0.61.2",
 "winnow 1.0.5",
 "zbus_macros",
 "zbus_names",
 "zvariant",
]

[[package]]
name = "zbus_macros"
version = "5.19.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2990635d09ade6df1868f72f8cac69a876a90981e8bd3c40b1be413f8dc88f40"
dependencies = [
 "proc-macro-crate 3.5.0",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "zbus_names",
 "zvariant",
 "zvariant_utils",
]

[[package]]
name = "zbus_names"
version = "4.3.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "812a12be4ead7a59e18ea8f047d08add0066b73bc62fc1467066a2472ae088dd"
dependencies = [
 "serde",
 "winnow 1.0.5",
 "zvariant",
]

[[package]]
name = "zcheapstr"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "939f186d9ecebe044315a5cb6d6f78568bbc21152adc954d5a0c2f58bdbc9920"
dependencies = [
 "serde",
]

[[package]]
name = "zerofrom"
version = "0.1.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0ec05a11813ea801ff6d75110ad09cd0824ddba17dfe17128ea0d5f68e6c5272"
dependencies = [
 "zerofrom-derive",
]

[[package]]
name = "zerofrom-derive"
version = "0.1.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f75b4683f6c7f45248d4d64056a24298c6281e0993356d7d1b4a1a962ef10d4a"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "synstructure",
]

[[package]]
name = "zerotrie"
version = "0.2.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4ea269c3bd32f0a32c321907a2ae912ba6f4649bb0fc764a15627e99a7095a3f"
dependencies = [
 "displaydoc",
 "yoke",
 "zerofrom",
]

[[package]]
name = "zerovec"
version = "0.11.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f58a2799cfe9a1670c7ea8edbd52ef8edb93cb37a7f83bf31ba9e35d9dae6a40"
dependencies = [
 "yoke",
 "zerofrom",
 "zerovec-derive",
]

[[package]]
name = "zerovec-derive"
version = "0.11.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c3743ddbf47738d929cd1ae2e199d40d0162979dfe31aef8ae646d2bf00bf97a"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "zlib-rs"
version = "0.6.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b268e58e7c693d7c271f93ffc4ba3b380412554231c85bf61ca7af91042a4112"

[[package]]
name = "zmij"
version = "1.0.23"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "29666d0abbfad1e3dc4dcf6144730dd3a3ab225bbbdac83319345b1b44ccfc1b"

[[package]]
name = "zvariant"
version = "5.15.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "80bf6d6cd6a4b601acb64cfb8284cdc643fcfa75ef26ae3c46ec8aa4e8a1fbb7"
dependencies = [
 "endi",
 "enumflags2",
 "serde",
 "winnow 1.0.5",
 "zcheapstr",
 "zvariant_derive",
 "zvariant_utils",
]

[[package]]
name = "zvariant_derive"
version = "5.15.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ef2672456ba1cb54b5eaec136e63135b3c7495fb938e53b28a62e633496d486d"
dependencies = [
 "proc-macro-crate 3.5.0",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "zvariant_utils",
]

[[package]]
name = "zvariant_utils"
version = "4.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bad0294361a320b694a328460dc73add56c306150f5cb6bfafc44446120008a3"
dependencies = [
 "proc-macro2",
 "quote",
 "serde",
 "syn 3.0.9",
 "winnow 1.0.5",
]

```
`src-tauri\Cargo.toml`:

```toml
[package]
name = "article-editor"
version = "0.1.0"
description = "A Tauri App"
authors = ["you"]
edition = "2024"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[lib]
# The `_lib` suffix may seem redundant but it is necessary
# to make the lib name unique and wouldn't conflict with the bin name.
# This seems to be only an issue on Windows, see https://github.com/rust-lang/cargo/issues/8519
name = "article_editor_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"


# Read the optimization guideline for more details: https://tauri.app/concept/size/#cargo-configuration
[profile.release]
codegen-units = 1
lto = true
opt-level = 3
panic = "abort"
strip = true

```
`src-tauri\build.rs`:

```rs
fn main() {
    tauri_build::build()
}

```
`src-tauri\capabilities\default.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "記事エディター用の権限",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    "dialog:default",
    "fs:allow-exists",
    "fs:allow-mkdir",
    "fs:allow-read-dir",
    "fs:allow-read-file",
    "fs:allow-read-text-file",
    "fs:allow-write-file",
    "fs:allow-write-text-file",
    "fs:allow-remove"
  ]
}

```
`src-tauri\src\lib.rs`:

```rs
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

```
`src-tauri\src\main.rs`:

```rs
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    article_editor_lib::run()
}

```
`src-tauri\tauri.conf.json`:

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "article-editor",
  "version": "0.1.0",
  "identifier": "com.admin.article-editor",
  "build": {
    "beforeDevCommand": "pnpm dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "pnpm build",
    "frontendDist": "../dist"
  },
  "app": {
    "withGlobalTauri": true,
    "windows": [
      {
        "title": "article-editor",
        "width": 800,
        "height": 600
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}

```
`src\about-pages.ts`:

```ts
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

```
`src\articles.ts`:

```ts
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { readDir, readFile, readTextFile, writeFile, writeTextFile, mkdir, remove, exists } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { $, S, urls, dirty, Esc, Status, Dirty, ToWebp } from './common';

type Article = {
    id: string; date: string; title: string; author: string; body: string; desc: string;
    thumb: string; legacy: boolean; legacyThumb?: string;
};

let articles: Article[] = [];
let cur: Article | null = null;

const SITE = 'https://www.creative-staff.com';
const SITE_NAME = 'CreativeStaff';
const TW_ACCOUNT = '@creative_staff';

const ImgRe = /!\[[^\]]*\]\(([^)\s]+)\)/g;
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
// ---------------------------------------------------------------- 埋め込み(URLだけの行)
// 本文に Twitter / YouTube / ニコニコ動画のURLだけの行を書くと、公開ページでは埋め込みになる。
// エディターのプレビューは、軽くするため「サービス名+URL」の枠だけを出す。
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

// real=true のとき(公開ページ用)は埋め込みの実物、false のとき(プレビュー用)は枠だけ
function RenderBody(md: string, real = false): HTMLElement
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
    // URLだけの段落 → 埋め込み
    box.querySelectorAll('p').forEach(p =>
    {
        const a = p.querySelector(':scope > a');
        const url = a?.getAttribute('href') ?? '';
        if (!a || p.children.length !== 1 || (p.textContent ?? '').trim() !== url) return;
        const e = ParseEmbed(url);
        if (!e) return;
        const div = document.createElement('div');
        div.className = real ? `embed embed--${e.kind}` : 'embed embed--frame';
        div.innerHTML = real ? e.html : `<b>${e.label}</b><span>${Esc(url)}</span>`;
        p.replaceWith(div);
    });
    box.querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
    return box;
}

// 説明文の自動生成: 本文の最初の約100文字(画像のキャプションは除く)
function AutoDesc(md: string): string
{
    const box = RenderBody(md);
    box.querySelectorAll('figure, .embed').forEach(f => f.remove());
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
    const body = RenderBody(a.body, true);
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

<script type="text/markdown" id="source-md">${md}<\/script>
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
    const a: Article = { id, date, title: '', author: last, body: '', desc: '', thumb: '', legacy: false };
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

// 区切り線は前後に空行がないと見出し扱いになるので、空行ごと入れる
function InsertHr()
{
    const t = $('#body');
    t.setRangeText('\n\n---\n\n', t.selectionStart, t.selectionEnd, 'end');
    t.focus();
    t.dispatchEvent(new Event('input'));
}

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
    }
});

// ---------------------------------------------------------------- プレビュー
export function Preview()
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

```
`src\common.ts`:

```ts
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

```
`src\editor.ts`:

```ts
import './styles.css';
import { open } from '@tauri-apps/plugin-dialog';
import { $, S, dirty, MODE_NAME, Status, type Mode } from './common';
import { ALoad, ASave, ArticleCount, ShowView, Preview } from './articles';
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
    if (!(await ALoad(path))) return false;
    dirty.clear();
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
    if (!S.root) return;
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
    if (isArt) ShowView('list');
    window.scrollTo(0, 0);
}
$('#tab-art').onclick = () => SetMode('art');
$('#tab-site').onclick = () => SetMode(lastSite);
for (const k of SITE_MODES) $(SUBTAB_ID[k]).onclick = () => SetMode(k);

// ---------------------------------------------------------------- 起動
Preview();
SetMode('art');
// 前回のフォルダを自動で開く(開けなければ何もしない)
const last = localStorage.getItem('root');
if (last) LoadFolder(last, false).catch(() => {});

```
`src\styles.css`:

```css
/* サイトエディター: 見た目はゲームランチャーに合わせてある */
:root {
  --bg: #f5f7f9;
  --card-bg: #ffffff;
  --text: #333333;
  --text-muted: #6b6b6b;
  --border: #e1e5e9;
  --c-green: #1aff1a;
  --c-yellow: #ffd400;
  --c-blue: #19c8ff;
  --c-blue-hover: #5ad7ff;
  --c-blue-soft: #e6f7fe;
  --c-orange: #ff8a1f;
  --c-purple: #a855ff;
  --radius: 16px;
  --radius-sm: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --content-width: 1400px;
}

* { box-sizing: border-box; }
[hidden] { display: none !important; }

html, body { overscroll-behavior: none; }
img { -webkit-user-drag: none; }

html, body { height: 100%; }
body {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: "Meiryo", "Hiragino Kaku Gothic ProN", "MS PGothic", sans-serif;
}

/* ---- ヘッダー ---- */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #272727;
  color: #ffffff;
  user-select: none;
}
.header__inner {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 24px;
}
#status {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #bdbdbd;
  font-size: 0.82rem;
  text-align: right;
}

/* タブ(記事 / 年表 / ロードマップ / 協賛・提携) */
.seg {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  background: #3a3a3a;
}
.seg button {
  padding: 5px 16px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #dddddd;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}
.seg button:hover { background: #4a4a4a; }
.seg button.main { background: var(--c-blue); color: #ffffff; }

/* ---- ボタン ---- */
.btn {
  padding: 5px 16px;
  border: none;
  border-radius: 14px;
  background: #ffffff;
  color: var(--text);
  box-shadow: inset 0 0 0 2px var(--c-blue);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.btn:hover:not(:disabled) { background: var(--c-blue-soft); }
.btn:disabled { opacity: 0.5; cursor: default; }
.btn--primary { background: var(--c-blue); color: #ffffff; box-shadow: none; }
.btn--primary:hover:not(:disabled) { background: var(--c-blue-hover); }
.btn--danger { color: #d96500; box-shadow: inset 0 0 0 2px var(--c-orange); }
.btn--danger:hover:not(:disabled) { background: #fff4e8; }
.btn--sm { padding: 3px 12px; font-size: 0.78rem; }

/* ---- 全体 ---- */
#main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
#w-art, #w-site {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ---- 一覧画面 ---- */
#v-list { flex: 1; min-height: 0; overflow-y: auto; padding: 16px 20px 32px; }
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.toolbar h2 {
  margin: 0;
  padding-bottom: 4px;
  font-size: 1.25rem;
  border-bottom: 4px solid var(--c-blue);
}
.list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));   /* 一覧は2列 */
  gap: 8px;
}
@media (max-width: 900px) {
  .list { grid-template-columns: minmax(0, 1fr); }
}
.list--compact { max-height: 232px; overflow: auto; padding: 2px; }
.list .item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: 10px 18px;
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  box-shadow: var(--shadow);
  color: var(--text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.list .item:hover { background: var(--c-blue-soft); }
.list .item.now { box-shadow: inset 0 0 0 2px var(--c-blue), var(--shadow); }
.list .item small { color: var(--text-muted); font-size: 0.75rem; }
.list .item span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.95rem;
  font-weight: 700;
}

/* 記事一覧: 左にサムネ、右に日付とタイトル */
.list .item.item--thumb { flex-direction: row; align-items: center; gap: 12px; padding: 8px 12px; }
.item__img {
  flex: none;
  width: 96px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 6px;
  background: #e9edf0;
}
.item__txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.item__txt small { color: var(--text-muted); font-size: 0.75rem; }
.item__txt span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.95rem;
  font-weight: 700;
}

/* ---- ページ送り(記事一覧の下) ---- */
.pager { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 18px; }
.pager__btn {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border: 2px solid var(--border);
  border-radius: 17px;
  background: #ffffff;
  color: var(--text);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}
.pager__btn:hover:not(:disabled) { border-color: var(--c-blue); }
.pager__btn[aria-current="page"] { border-color: var(--c-blue); background: var(--c-blue); color: #ffffff; cursor: default; }
.pager__btn:disabled { opacity: 0.4; cursor: default; }
.pager__gap { display: inline-flex; align-items: center; color: var(--text-muted); }

/* ---- 編集画面(画面全体を使う。入力とプレビューは別々にスクロール) ---- */
#v-edit { flex: 1; min-height: 0; display: flex; flex-direction: column; }
#v-edit[hidden] { display: none; }
.edit-bar { flex: none; padding: 8px 16px; background: #fff; border-bottom: 1px solid #ccc; }
.edit-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
}
.edit-grid > .pane { min-height: 0; overflow-y: auto; }
@media (max-width: 900px) {
  .edit-grid { grid-template-columns: minmax(0, 1fr); grid-template-rows: repeat(2, minmax(0, 1fr)); }
}

.pane { padding: 16px 20px 24px; }
.form { background: #ffffff; border-right: 1px solid #ccc; }
.preview { background: #e9edf0; }

/* ---- サイト設定(2列: 左に一覧と入力、右にプレビュー。別々にスクロール) ---- */
.subtabs { flex: none; align-self: flex-start; margin: 8px 16px; }
.seg--light { background: #e3e8ec; }
.seg--light button { color: #555555; }
.seg--light button:hover { background: #d4dbe0; }
.seg--light button.main { background: var(--c-blue); color: #ffffff; }
.site-pane {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
}
.site-left {
  min-width: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px 24px;
  background: #ffffff;
  border-right: 1px solid #ccc;
}
.site-left > .toolbar { margin-bottom: 0; }
.site-left > .form { padding: 0; border-right: 0; }
.site-pane > .preview { min-height: 0; overflow: auto; }
@media (max-width: 900px) {
  .site-pane { grid-template-columns: minmax(0, 1fr); grid-template-rows: repeat(2, minmax(0, 1fr)); }
}

/* ---- 入力フォーム ---- */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  margin: 0;
  border: 0;
}
.form label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 700;
}
.form input:not([type="file"]),
.form select,
.form textarea {
  width: 100%;
  padding: 7px 14px;
  border: 2px solid var(--border);
  border-radius: 17px;
  background: #ffffff;
  color: var(--text);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 400;
}
.form textarea { border-radius: var(--radius-sm); line-height: 1.7; resize: vertical; }
.form input:focus, .form select:focus, .form textarea:focus { outline: none; border-color: var(--c-blue); }
#body { min-height: 360px; }
#htext { min-height: 200px; }
.tools { display: flex; flex-wrap: wrap; gap: 4px; }
.row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.hint { margin: 0; color: var(--text-muted); font-size: 0.78rem; line-height: 1.6; overflow-wrap: anywhere; }

/* ================= プレビュー ================= */
.preview { overflow: auto; }
.card {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  background: #fff;
  color: #222;
}


#p_title {
    margin: 0 0 12px;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.5;
    text-align: left;
}

#p_date {
    margin: 0 0 40px;
    font-size: 14px;
    color: #888;
}

#p_text {
    font-size: 17px;
    line-height: 2;
}

#p_text p {
    margin: 0 0 1.6em;
}

#p_text a {
    color: #1a7f6b;
    text-decoration: underline;
}

#p_text h2 {
    margin: 2.6em 0 1em;
    font-size: 24px;
    line-height: 1.5;
}

#p_text h3 {
    margin: 2em 0 .8em;
    font-size: 20px;
    line-height: 1.5;
}

#p_text ul,
#p_text ol {
    margin: 0 0 1.6em;
    padding-left: 1.6em;
}

#p_text blockquote {
    margin: 1.8em 0;
    padding: .2em 0 .2em 1.2em;
    border-left: 3px solid #ccc;
    color: #666;
}

#p_text hr {
    width: 60px;
    margin: 3em auto;
    border: 0;
    border-top: 2px solid #ccc;
}

#p_text figure {
    margin: 2em 0;
    text-align: center;
}

#p_text figure img {
    max-width: 100%;
    border-radius: 4px;
}

#p_text figcaption {
    margin-top: .6em;
    font-size: 13px;
    line-height: 1.6;
    color: #888;
}

/* ---------------- 独自タグ ---------------- */
red {
    color: #e0245e;
}

bold {
    font-weight: 700;
}

big-font {
    font-size: 200%;
    line-height: 1.4;
}




/* ---- 年表 ---- */
/* ---------------- 年表(ムサラボ風): 中央の線・年のバッジ・左右交互の吹き出し ----------------
   画面の幅ではなく「枠の幅」で切り替える(エディターの狭いプレビューでもスマホ表示になる) */
.hwrap {
    container-type: inline-size;
    padding: 16px 10px 28px;
    border-radius: 12px;
    background: #f5f7f9;
}
.tl {
    position: relative;
    max-width: 760px;
    margin: 0 auto;
    padding: 2px 0;
}
.tl::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 3px;
    margin-left: -1.5px;
    border-radius: 2px;
    background: linear-gradient(#00bfff, #1aff1a, #ffd400, #ff8a1f);
}
.tl-empty {
    position: relative;
    margin: 0;
    padding: 24px 0;
    color: #6b6b6b;
    text-align: center;
    background: #f5f7f9;
}

/* 年のバッジ */
.tl-year {
    position: relative;
    margin: 20px 0 6px;
    text-align: center;
}
.tl-year:first-child {
    margin-top: 8px;
}
.tl-year span {
    display: inline-block;
    padding: 1px 14px;
    border-radius: 8px;
    background: #00bfff;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.7;
    letter-spacing: .04em;
}

/* 出来事の吹き出し: 左右に交互に並べる */
.tl-item {
    position: relative;
    width: 50%;
    margin: 0 0 6px;
}
.tl-item.l { margin-right: auto; padding-right: 26px; }
.tl-item.r { margin-left: auto;  padding-left: 26px; }

.tl-card {
    position: relative;
    padding: 7px 12px;
    border: 1px solid #00bfff;
    border-radius: 8px;
    background: #fff;
    color: #555;
    font-size: 14px;
    line-height: 1.6;
    overflow-wrap: anywhere;
}
.tl-card::after {
    content: "";
    position: absolute;
    top: 11px;
    width: 9px;
    height: 9px;
    background: #fff;
    border: 1px solid #00bfff;
    transform: rotate(45deg);
}
.tl-item.l .tl-card::after { right: -6px; border-left: 0;  border-bottom: 0; }
.tl-item.r .tl-card::after { left: -6px;  border-right: 0; border-top: 0; }

.tl-date {
    display: block;
    color: #00bfff;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.5;
}
.tl-card a {
    color: #a855ff;
    text-decoration: none;
}
.tl-card a:hover {
    text-decoration: underline;
}

/* 枠が狭いとき: 線を左端に寄せ、吹き出しを全部右側に並べる */
@container (max-width: 640px) {
    .tl::before { left: 8px; }
    .tl-year { text-align: left; }
    .tl-year span { font-size: 15px; }
    .tl-item,
    .tl-item.l,
    .tl-item.r {
        width: 100%;
        margin-left: 0;
        margin-right: 0;
        padding: 0 0 0 24px;
    }
    .tl-item.l .tl-card::after,
    .tl-item.r .tl-card::after {
        right: auto;
        left: -6px;
        border: 1px solid #00bfff;
        border-right: 0;
        border-top: 0;
    }
}



/* ---- ロードマップ・協賛(公開サイトの about.css と同じ) ---- */
/* ---------------- 年間ロードマップ: 横一本の棒に、吹き出しで出来事を置く ---------------- */
.rm-wrap{
    margin-bottom: 48px;
    padding: 8px 0 12px;
}
.rm{
    position: relative;
    display: grid;
    grid-template-columns: repeat(12, 1fr);     /* 12か月ぶんの位置を決めるだけ(見えない) */
    grid-template-rows: auto 64px auto;
}
.rm::before{
    content: "";
    grid-column: 1 / -1;
    grid-row: 2;
    align-self: center;
    height: 10px;
    border-radius: 5px;
    background: #00bfff;
}
.rm-dot{
    grid-column: var(--i);
    grid-row: 2;
    position: relative;
    justify-self: center;
    align-self: center;
    z-index: 1;
    width: 22px;
    height: 22px;
    border: 4px solid #00bfff;
    border-radius: 50%;
    background: #fff;
}
.rm-dot::before{                                /* 吹き出しへのつなぎ線 */
    content: "";
    position: absolute;
    left: 50%;
    width: 3px;
    height: 32px;
    margin-left: -1.5px;
    background: #00bfff;
}
.rm-dot.up::before{ bottom: 100%; }
.rm-dot.down::before{ top: 100%; }
.rm-ev{
    grid-column: var(--i);
    width: max-content;
    max-width: 13em;
    padding: 10px 18px 12px;
    border: 2px solid #00bfff;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    color: #333;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.5;
    text-align: center;
    overflow-wrap: anywhere;
}
.rm-ev.up{ grid-row: 1; align-self: end; }
.rm-ev.down{ grid-row: 3; align-self: start; }
.rm-ev.c{ justify-self: center; }
.rm-ev.s{ justify-self: start; }
.rm-ev.e{ justify-self: end; }
.rm-ev small{
    display: block;
    color: #00a3d9;
    font-size: 14px;
    font-weight: 800;
}
.rm-empty{
    margin: 0;
    padding: 24px 0;
    color: #6b6b6b;
    text-align: center;
}

/* 狭い画面: 棒が縦になり、吹き出しが下へ並ぶ */
@media (max-width: 640px){
    .rm{
        display: block;
        padding-left: 18px;
        border-left: 8px solid #00bfff;
        border-radius: 4px;
    }
    .rm::before,
    .rm-dot{ display: none; }
    .rm-ev,
    .rm-ev.c,
    .rm-ev.s,
    .rm-ev.e{
        width: auto;
        max-width: none;
        margin-bottom: 14px;
        text-align: left;
    }
    .rm-ev:last-child{ margin-bottom: 0; }
}

/* ---------------- 協賛・提携ページ: 大きいカード(ロゴが上、文字が下。画面の広さによらず縦積み) ---------------- */
.sp-grid{
    display: grid;
    grid-template-columns: 1fr;                 /* 常に1列。カードは縦に積む */
    gap: 28px;
    margin-bottom: 40px;
}
.sp-card{
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    color: #333;
    text-decoration: none;
    transition: box-shadow 0.15s ease, transform 0.15s ease;
}
a.sp-card:hover{
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16);
    transform: translateY(-2px);
    text-decoration: none;
}
.sp-logo{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 220px;
    background: #f5f7f9;
}
.sp-logo img{
    width: auto;
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
}
.sp-body{
    flex: 1;
    min-width: 0;
    padding: 28px 32px 32px;
}
.sp-name{
    display: block;
    font-size: 28px;
    font-weight: 800;
    line-height: 1.4;
    overflow-wrap: anywhere;
}
.sp-desc{
    display: block;
    margin-top: 10px;
    color: #6b6b6b;
    font-size: 17px;
    line-height: 1.8;
    overflow-wrap: anywhere;
}
.sp-empty{
    margin: 0;
    padding: 24px 0;
    color: #6b6b6b;
    text-align: center;
}


.ev-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
}
.ev-list li {
    flex: 1 1 260px;
    padding: 12px 18px 14px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    color: #222;
}
.ev-list h2 {
    width: fit-content;
    margin: 0 auto 10px;
    border-bottom: 4px solid #00bfff;
    font-size: 20px;
    font-weight: 800;
    line-height: 1.4;
    text-align: center;
}
.ev-list p {
    margin: 0;
    font-size: 15px;
    line-height: 1.7;
}
.ev-list a { color: #a855ff; }


/* ---- 記事の埋め込み(プレビューでは枠だけ) ---- */
#p_text .embed { margin: 2em 0; }
#p_text .embed--frame {
    padding: 14px 18px;
    border: 2px dashed var(--c-blue);
    border-radius: 8px;
    background: var(--c-blue-soft);
    font-size: 14px;
    line-height: 1.6;
    text-align: center;
}
#p_text .embed--frame b { display: block; color: #00a3d9; }
#p_text .embed--frame span { overflow-wrap: anywhere; color: var(--text-muted); }

```
`src\vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```
`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}

```
`vite.config.ts`:

```ts
import { defineConfig } from "vite";
// @ts-expect-error type error without @types/node package
import process from "node:process";
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(() => ({

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));

```