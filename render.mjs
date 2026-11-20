// Renders entry.png: a one-page "front page" summing up Friday 20 November 2026.
// Node standard library only. Drives headless Chrome (or Edge) to screenshot an HTML page.
//
//   node render.mjs                 -> entry.png (1024x1024)
//   node render.mjs --thumb         -> also thumb.png (300x300) for legibility checks

import { writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const W = 1024, H = 1024;

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chrome) throw new Error('No Chrome/Edge found for rendering');

const story = (icon, label, sub = '', cls = '') => `
  <div class="story ${cls}">
    <div class="ico">${icon}</div>
    <div class="txt">
      <div class="lbl">${label}</div>
      ${sub ? `<div class="sub">${sub}</div>` : ''}
    </div>
  </div>`;

const lead = `
<div class="lead">
  <div class="leadArt">
    ${globeSVG()}
    <div class="leadTag">BEIJING · THE BIG STORY</div>
  </div>
  <div class="leadCopy">
    <h1>Three-way summit<br>rewrites the rules</h1>
    <p class="deck">Trump, Xi Jinping and Putin agree in China to further weaken the international systems that constrain the superpowers.</p>
    <div class="leadNotes">
      <span><b>▸</b> Trump says little to reporters afterward</span>
      <span><b>▸</b> Allies fear a world of deals, not rules</span>
    </div>
  </div>
</div>`;

const weather = `
<div class="weather">
  <div class="wHead">
    <div class="wKick">WEATHER · EAST COAST</div>
    <div class="wTitle">Storm rides up the coast</div>
  </div>
  ${stormSVG()}
  <div class="wNotes">
    <div class="wNote"><b>FLORIDA</b><span>record flooding</span></div>
    <div class="wNote"><b>CAROLINAS</b><span>storm surge</span></div>
    <div class="wNote"><b>DC · BALTIMORE</b><span>on alert</span></div>
    <div class="wNote"><b>NORTHEAST</b><span>heading north</span></div>
  </div>
</div>`;

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; }
  body {
    background: #0a0c10;
    color: #f1ece1;
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    width: ${W}px; height: ${H}px;
    display: flex; flex-direction: column;
    background:
      radial-gradient(900px 420px at 12% -8%, rgba(224,65,58,.18), transparent 62%),
      radial-gradient(700px 360px at 96% 6%, rgba(79,179,201,.10), transparent 60%),
      #0a0c10;
  }

  header {
    padding: 16px 34px 9px;
    border-bottom: 3px solid #e0413a;
    position: relative;
  }
  .kicker {
    font-size: 12px; letter-spacing: 4px; text-transform: uppercase;
    color: #e8a33d; font-weight: 700;
  }
  .mastRow { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
  .date {
    font-family: Georgia, "Times New Roman", serif;
    font-weight: 700; font-size: 74px; line-height: 1;
    letter-spacing: -1.5px; color: #fbf7ee;
    margin-top: 4px; white-space: nowrap;
  }
  .date .dim { color: #8b8f96; }
  .stamp {
    text-align: right; font-size: 10px; letter-spacing: 1.6px;
    color: #8b8f96; line-height: 1.6; text-transform: uppercase;
    padding-bottom: 8px;
  }
  .stamp b { color: #f1ece1; }

  main { flex: 1; padding: 11px 34px 11px; display: flex; flex-direction: column; gap: 9px; }

  .card {
    background: linear-gradient(180deg, #151a21, #11151b);
    border: 1px solid #242c36;
    border-radius: 9px;
    padding: 8px 11px;
    overflow: hidden;
    display: flex; flex-direction: column;
  }
  .sec {
    font-size: 10.5px; font-weight: 800; letter-spacing: 2.2px;
    text-transform: uppercase; color: #e8a33d;
    display: flex; align-items: center; gap: 7px;
    margin-bottom: 5px; flex: 0 0 auto;
  }
  .sec::before { content: ""; width: 6px; height: 6px; border-radius: 2px; background: #e0413a; display: inline-block; }
  .sec.cool { color: #5fb9cc; }
  .sec.cool::before { background: #5fb9cc; }

  .story { display: flex; gap: 8px; padding: 3px 0; align-items: flex-start; min-width: 0; }
  .story + .story { border-top: 1px solid #1d242d; }
  .card > .story { flex: 1 1 0; align-items: center; padding: 1px 0; }
  .ico {
    flex: 0 0 21px; width: 21px; height: 21px; border-radius: 6px;
    background: #1e2630; display: flex; align-items: center; justify-content: center;
    font-size: 13px; line-height: 1; margin-top: 1px;
    font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif;
  }
  .txt { min-width: 0; }
  .lbl { font-size: 12.6px; font-weight: 700; line-height: 1.15; color: #f4efe6; }
  .sub { font-size: 9.6px; line-height: 1.2; color: #98a0aa; margin-top: 1px; }

  /* Lead */
  .lead {
    flex: 0 0 182px;
    display: grid; grid-template-columns: 300px 1fr; gap: 16px;
    background:
      radial-gradient(420px 200px at 0% 0%, rgba(224,65,58,.20), transparent 70%),
      linear-gradient(180deg, #171c24, #10141a);
    border: 1px solid #2a323d; border-radius: 9px; padding: 12px 16px 12px 12px;
    overflow: hidden;
  }
  .leadArt { position: relative; display: flex; align-items: center; justify-content: center; }
  .leadArt svg { width: 282px; height: 152px; display: block; }
  .leadTag {
    position: absolute; left: 8px; top: 2px;
    font-size: 9px; letter-spacing: 2px; font-weight: 800; color: #e0413a;
    background: #0d1015; padding: 3px 7px; border-radius: 3px; border: 1px solid #3a2320;
  }
  .leadCopy { display: flex; flex-direction: column; justify-content: center; min-width: 0; }
  .leadCopy h1 {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 34px; line-height: 1.02; font-weight: 700; color: #fdf9f0;
    letter-spacing: -.4px;
  }
  .deck { font-size: 12.4px; line-height: 1.32; color: #c8ccd2; margin-top: 7px; }
  .leadNotes { display: flex; gap: 18px; margin-top: 8px; flex-wrap: wrap; }
  .leadNotes span { font-size: 10px; color: #9aa1ab; letter-spacing: .2px; }
  .leadNotes b { color: #e8a33d; }

  /* Weather band */
  .weather {
    flex: 0 0 96px;
    display: grid; grid-template-columns: 190px 1fr 300px; gap: 10px;
    align-items: center;
    background: linear-gradient(90deg, #10222a, #0f1a22 60%, #11161d);
    border: 1px solid #1f3a44; border-radius: 9px; padding: 8px 12px;
    overflow: hidden;
  }
  .wKick { font-size: 9.5px; letter-spacing: 2px; font-weight: 800; color: #5fb9cc; }
  .wTitle { font-family: Georgia, serif; font-size: 19px; line-height: 1.05; margin-top: 3px; color: #eaf6f8; }
  .weather svg { width: 100%; height: 78px; display: block; }
  .wNotes { display: flex; flex-direction: column; gap: 3px; }
  .wNote { display: flex; align-items: baseline; gap: 6px; font-size: 9.4px; }
  .wNote b { color: #e8a33d; font-size: 9px; letter-spacing: 1px; min-width: 74px; }
  .wNote span { color: #a7b0b8; }

  .rows { display: flex; flex-direction: column; gap: 9px; flex: 1; min-height: 0; }
  .r1, .r2 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 9px; min-height: 0; }
  .r1 { flex: 0 0 220px; }
  .r2 { flex: 1; }
  .r2 .card { min-height: 0; }

  .markets .story { padding: 3px 0; }
  .tick {
    margin-top: auto; display: flex; align-items: baseline; gap: 8px;
    border-top: 1px solid #1d242d; padding-top: 5px;
  }
  .tick .big { font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #e0413a; line-height: 1; }
  .tick .sm { font-size: 8.6px; color: #8b929b; line-height: 1.2; }

  /* Bottom */
  .bottom {
    flex: 0 0 66px;
    display: grid; grid-template-columns: 1fr 300px; gap: 9px;
  }
  .odd { flex-direction: row; align-items: center; gap: 12px; }
  .odd .bigIcon { font-size: 30px; line-height: 1; font-family: "Segoe UI Emoji", sans-serif; }
  .odd .oddTxt h3 { font-family: Georgia, serif; font-size: 18px; color: #fdf9f0; }
  .odd .oddTxt p { font-size: 9.8px; color: #9aa1ab; margin-top: 2px; }
  .foot {
    display: flex; flex-direction: column; justify-content: center; align-items: flex-end;
    font-size: 9px; letter-spacing: 1.8px; color: #6f7680; text-transform: uppercase; line-height: 1.9;
  }
  .foot b { color: #e8a33d; }
</style></head>
<body>
<div class="page">
  <header>
    <div class="kicker">The world in one page · Friday edition</div>
    <div class="mastRow">
      <div class="date">20 NOVEMBER 2026</div>
      <div class="stamp">Vol. I · No. 20<br><b>World news digest</b><br>All regions · one day</div>
    </div>
  </header>

  <main>
    ${lead}
    ${weather}

    <div class="rows">
      <div class="r1">
        <div class="card">
          <div class="sec">Middle East · Iran</div>
          ${story('🕊️', 'Trump defers Iran decision', 'Next step pushed to the new year')}
          ${story('🏛️', 'Senate war-powers bid fails', 'Republicans block measure 51–48')}
          ${story('🪖', 'Iraqi forces deploy', 'Jurf al-Sakhar, against Kataib Hezbollah')}
          ${story('🎯', 'Mossad chief urged strikes', 'Pushed for renewed attacks')}
        </div>
        <div class="card">
          <div class="sec">Europe · Ukraine</div>
          ${story('🌉', 'Kyiv bridges struck', 'Overnight Russian strikes kill 8')}
          ${story('🚉', 'Lviv rail station hit', 'Two killed in the western city')}
          ${story('🏛️', 'Embassies damaged', 'Austrian and Dutch missions in Kyiv')}
          ${story('🚧', 'Estonia to close crossings', 'Five Russia checkpoints from 1 Dec')}
        </div>
        <div class="card">
          <div class="sec">United States</div>
          ${story('🗳️', "Democrats' midterm surge", 'Big wins shake the 2028 race')}
          ${story('🔌', 'Cyber chief ousted', 'Cairncross out after outages')}
          ${story('💵', 'Miller firms took $15M', "Trump adviser's companies")}
          ${story('🌲', 'Senate weakens green laws', 'Environmental rules eased')}
          ${story('⚖️', 'NYT libel suit proceeds', 'Judge lets Trump case go on')}
        </div>
      </div>

      <div class="r2">
        <div class="card">
          <div class="sec cool">Asia-Pacific</div>
          ${story('🇯🇵', '93% wary of China ties', 'Japanese poll')}
          ${story('🐟', 'Bluefin quota raised 25%', 'Catch limit lifted')}
          ${story('⛏️', 'Japan–Peru minerals deal', 'Critical minerals pact')}
          ${story('✈️', 'F-35B lands at Kochi', 'Precautionary landing')}
          ${story('❄️', 'Sapporo illuminations', 'Winter lights switch on')}
          ${story('🤼', 'Onosato tied for lead', 'Sumo yokozuna')}
        </div>
        <div class="card">
          <div class="sec cool">Climate · COP31</div>
          ${story('🌾', 'Iowa fury at lead blast', 'Army plan: 68 barrels')}
          ${story('🌍', 'Norway carbon deals', 'Indonesia and Morocco at COP31')}
          ${story('🌊', 'Record Florida flooding', 'Storm heads up the East Coast')}
        </div>
        <div class="card markets">
          <div class="sec cool">Markets · Tech</div>
          ${story('📉', 'Nikkei plunges 5.06%', "After Anthropic's Wall St debut")}
          ${story('🚕', 'Robotaxis expand', 'Guangzhou and Shenzhen')}
          ${story('🚁', 'Medical drones', 'China trials deliveries')}
          ${story('⛴️', 'Deep-sea mining leases', 'First US sale, off Samoa')}
          ${story('🛢️', 'Chevron surveys Greece', 'Oil and gas search begins')}
          <div class="tick"><div class="big">−5.06%</div><div class="sm">NIKKEI 225<br>Tokyo close</div></div>
        </div>
      </div>
    </div>

    <div class="bottom">
      <div class="card odd">
        <div class="bigIcon">🦶</div>
        <div class="oddTxt">
          <h3>Bigfoot files released</h3>
          <p>The US Forest Service opens decades of historic records on the search.</p>
        </div>
      </div>
      <div class="foot">
        <div><b>20 NOVEMBER 2026</b></div>
        <div>One day · every region</div>
      </div>
    </div>
  </main>
</div>
</body></html>`;

function globeSVG() {
  return `<svg viewBox="0 0 290 158" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gl" cx="38%" cy="32%" r="72%">
        <stop offset="0%" stop-color="#2b3d4c"/><stop offset="100%" stop-color="#0e141b"/>
      </radialGradient>
    </defs>
    <circle cx="145" cy="80" r="62" fill="url(#gl)" stroke="#3d4d5c" stroke-width="1.4"/>
    <g stroke="#33434f" stroke-width="1" fill="none" opacity=".85">
      <ellipse cx="145" cy="80" rx="62" ry="24"/>
      <ellipse cx="145" cy="80" rx="62" ry="46"/>
      <ellipse cx="145" cy="80" rx="24" ry="62"/>
      <ellipse cx="145" cy="80" rx="46" ry="62"/>
      <line x1="83" y1="80" x2="207" y2="80"/>
    </g>
    <path d="M100 62 q18 -16 34 -8 q10 5 4 16 q-8 14 4 20 q-14 10 -26 2 q-16 -10 -16 -30z" fill="#3f5a4a" opacity=".75"/>
    <path d="M168 54 q22 -6 30 8 q6 12 -8 16 q-16 4 -24 -4 q-6 -10 2 -20z" fill="#5a4a3f" opacity=".7"/>
    <circle cx="112" cy="58" r="8" fill="#e0413a" stroke="#ffd9d5" stroke-width="1.4"/>
    <circle cx="160" cy="52" r="8" fill="#e8a33d" stroke="#ffe9c7" stroke-width="1.4"/>
    <circle cx="183" cy="96" r="8" fill="#5fb9cc" stroke="#d4f2f7" stroke-width="1.4"/>
    <g font-family="Segoe UI, Arial" font-size="9.5" font-weight="700" fill="#e9e3d7">
      <text x="124" y="61">US</text>
      <text x="145" y="40">CHINA</text>
      <text x="193" y="99">RUSSIA</text>
    </g>
    <g stroke="#e8a33d" stroke-width="1.2" stroke-dasharray="3 3" opacity=".8">
      <line x1="120" y1="58" x2="153" y2="53"/>
      <line x1="168" y1="55" x2="179" y2="90"/>
    </g>
    <text x="145" y="150" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#8b929b">A deal among three, felt by all</text>
  </svg>`;
}

function stormSVG() {
  return `<svg viewBox="0 0 430 88" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="sea" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#12303a"/><stop offset="100%" stop-color="#0d1a20"/>
      </linearGradient>
      <marker id="arw" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
        <path d="M0 0 L7 3.5 L0 7 z" fill="#e8a33d"/>
      </marker>
    </defs>
    <rect x="0" y="0" width="430" height="88" rx="6" fill="url(#sea)"/>
    <path d="M30 78 L52 60 L70 52 L88 54 L104 44 L120 46 L132 34 L150 30 L166 22 L186 20
             L204 14 L224 16 L242 10 L262 14 L282 8 L302 14 L322 10 L342 16 L362 12 L382 18 L402 14"
          fill="none" stroke="#3a6b78" stroke-width="2" opacity=".9"/>
    <path d="M30 78 L52 60 L70 52 L88 54 L104 44 L120 46 L132 34 L150 30 L166 22 L186 20
             L204 14 L224 16 L242 10 L262 14 L282 8 L302 14 L322 10 L342 16 L362 12 L382 18 L402 14
             L402 88 L30 88 Z" fill="#0e1f26" opacity=".65"/>
    <g fill="#e8a33d">
      <circle cx="70" cy="52" r="3.2"/><circle cx="132" cy="34" r="3.2"/>
      <circle cx="204" cy="14" r="3.2"/><circle cx="302" cy="14" r="3.2"/>
    </g>
    <g font-family="Segoe UI, Arial" font-size="8.4" font-weight="700" fill="#cfe6ec" letter-spacing=".6">
      <text x="52" y="76">FL</text>
      <text x="118" y="26">CAROLINAS</text>
      <text x="186" y="9">DC · BALTIMORE</text>
      <text x="292" y="9">NORTHEAST</text>
    </g>
    <path d="M70 46 C120 40 150 34 200 26 C250 18 280 16 330 10" fill="none"
          stroke="#e8a33d" stroke-width="2.2" stroke-dasharray="6 5" marker-end="url(#arw)" opacity=".95"/>
    <g transform="translate(60,18)" opacity=".9">
      <path d="M0 8 a12 12 0 0 1 12 -12 a12 12 0 0 1 12 12" fill="none" stroke="#5fb9cc" stroke-width="2"/>
      <path d="M4 14 a8 8 0 0 1 8 -8 a8 8 0 0 1 8 8" fill="none" stroke="#5fb9cc" stroke-width="1.6"/>
      <circle cx="12" cy="16" r="2.4" fill="#5fb9cc"/>
    </g>
  </svg>`;
}

const pagePath = join(here, 'page.html');
writeFileSync(pagePath, html, 'utf8');

const outPng = join(here, 'entry.png');
const args = [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--force-device-scale-factor=1', '--default-background-color=00000000',
  `--screenshot=${outPng}`, `--window-size=${W},${H}`,
  `file:///${pagePath.replace(/\\/g, '/')}`,
];
const r = spawnSync(chrome, args, { stdio: 'inherit' });
if (r.status !== 0) throw new Error('Chrome render failed: ' + r.status);

if (process.argv.includes('--thumb')) {
  const thumb = join(here, 'thumb.png');
  const r2 = spawnSync(chrome, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--screenshot=${thumb}`, '--window-size=300,300',
    `file:///${pagePath.replace(/\\/g, '/')}`,
  ], { stdio: 'inherit' });
  if (r2.status !== 0) throw new Error('Thumb render failed');
}

console.log('rendered', outPng);
