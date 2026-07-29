/* AeroAdi Labs — shared shell: nav, footer, search, theme, progress store */

const store = {
  get(k, d){ try{ const v = localStorage.getItem("aeroadi:"+k); return v===null? d : JSON.parse(v);}catch(e){return d} },
  set(k, v){ try{ localStorage.setItem("aeroadi:"+k, JSON.stringify(v)); }catch(e){} }
};

/* ---------- theme ---------- */
(function(){
  const t = store.get("theme","dark");
  document.documentElement.setAttribute("data-theme", t);
})();
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme")==="light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", cur);
  store.set("theme", cur);
}

/* ---------- helpers ---------- */
const fmt = n => n==null ? "—" : n.toLocaleString("en-US");
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function param(name){ return new URLSearchParams(location.search).get(name); }
function byslug(list, s){ return list.find(x => x.slug===s); }
function pips(n){ return "●".repeat(n) + "○".repeat(4-n); }
const DIFF_NAMES = ["","Beginner","Intermediate","Advanced","Expert"];
function statusChip(a){
  const map = {in_service:["s-ok","In service"], retired:["s-off","Retired"], destroyed:["s-off","Destroyed 2022"], prototype:["s-warn","Prototype"]};
  const m = map[a.status]||["s-off",a.status];
  return `<span class="tag"><span class="status-dot ${m[0]}"></span>${m[1]}</span>`;
}

/* simple stylized side-profile silhouettes by family (viewBox 0 0 200 60) */
const SILS = {
  wide:  `<path d="M8 38 Q30 30 60 29 L150 29 Q178 30 192 36 L188 40 Q160 44 60 43 Q28 42 8 38 Z M60 29 L74 12 Q78 8 84 9 L96 12 L96 29 M120 43 L150 43 L170 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="70" cy="46" r="3" fill="currentColor"/><circle cx="130" cy="46" r="3" fill="currentColor"/>`,
  narrow:`<path d="M12 36 Q40 30 70 30 L150 30 Q176 31 190 36 L186 40 Q158 43 70 42 Q36 41 12 36 Z M100 42 L128 42 L152 33 M96 30 L104 16 L112 30" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="70" cy="45" r="3" fill="currentColor"/><circle cx="130" cy="45" r="3" fill="currentColor"/>`,
  delta: `<path d="M10 40 L120 24 L192 36 L120 42 Z M120 24 L140 10 L150 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  prop:  `<path d="M16 34 Q50 28 90 29 L160 31 Q180 33 188 36 L184 40 Q150 42 90 41 Q46 40 16 34 Z M150 41 L166 30 M20 34 L20 22 M20 28 L20 44" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="90" cy="44" r="3" fill="currentColor"/>`
};
function silhouette(a, h){
  return `<svg class="silhouette" viewBox="0 0 200 60" height="${h||60}" role="img" aria-label="Stylized side profile, ${esc(a.role||'aircraft')}">${SILS[a.sil]||SILS.narrow}</svg>`;
}

/* ---------- XP / progress ---------- */
function addXP(n, reason){
  const xp = store.get("xp",0)+n; store.set("xp",xp);
  const today = new Date().toDateString();
  const st = store.get("streak",{count:0,last:null});
  if(st.last !== today){
    const yest = new Date(Date.now()-86400000).toDateString();
    st.count = (st.last===yest) ? st.count+1 : 1;
    st.last = today; store.set("streak",st);
  }
  toast(`+${n} XP · ${reason}`);
}
function rank(){
  const xp = store.get("xp",0);
  const ranks=[["Student Pilot",0],["Private Pilot",150],["Commercial Pilot",400],["Airline Captain",900],["Test Pilot",1800]];
  let r=ranks[0]; for(const x of ranks){ if(xp>=x[1]) r=x; }
  return {name:r[0], xp};
}
function toast(msg){
  let t=document.querySelector(".toast");
  if(!t){ t=document.createElement("div"); t.className="toast"; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add("show");
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"),2600);
}

/* ---------- compare tray ---------- */
function addToCompare(slug){
  let tray = store.get("compareTray",[]);
  if(!tray.includes(slug)){ tray.push(slug); if(tray.length>3) tray=tray.slice(-3); store.set("compareTray",tray); }
  toast(`Added to compare (${tray.length}) — open the Compare page`);
}

/* ---------- shell render ---------- */
const NAV_LINKS = [
  ["Learn","learn.html"],["Aircraft","aircraft.html"],["Airports","airports.html"],
  ["Compare","compare.html"],["Quizzes","quizzes.html"],["Timeline","timeline.html"],["Glossary","glossary.html"]
];
function renderShell(active){
  const here = p => (p===active ? 'aria-current="page"' : "");
  const logoSvg = `<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M2 20 L14 20 L21 13" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 13 L24 10 L23.2 14.2 Z" fill="var(--accent)"/></svg>`;
  document.getElementById("shell-nav").innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="nav"><div class="nav-inner">
    <a class="logo" href="index.html">${logoSvg}<span>AeroAdi <span class="labs">Labs</span></span></a>
    <nav class="nav-links" aria-label="Primary">
      ${NAV_LINKS.map(l=>`<a href="${l[1]}" ${here(l[1])}>${l[0]}</a>`).join("")}
    </nav>
    <div class="nav-actions">
      <button class="icon-btn" onclick="openSearch()" aria-label="Search (press slash)" title="Search  ( / )">⌕</button>
      <button class="icon-btn" onclick="toggleTheme()" aria-label="Toggle light and dark theme">◐</button>
      <a class="icon-btn" href="profile.html" aria-label="Your profile" style="text-decoration:none">◎</a>
    </div>
  </div></div>
  <nav class="tabbar" aria-label="Mobile">
    <a href="index.html" ${here("index.html")}><span class="t-ico">⌂</span>Home</a>
    <a href="learn.html" ${here("learn.html")}><span class="t-ico">◈</span>Learn</a>
    <a href="aircraft.html" ${here("aircraft.html")}><span class="t-ico">✈</span>Aircraft</a>
    <a href="quizzes.html" ${here("quizzes.html")}><span class="t-ico">▣</span>Quizzes</a>
    <a href="profile.html" ${here("profile.html")}><span class="t-ico">◎</span>Profile</a>
  </nav>`;

  const f = document.getElementById("shell-footer");
  if(f) f.innerHTML = `
  <footer class="footer"><div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="logo" href="index.html" style="margin-bottom:10px">${logoSvg}<span>AeroAdi <span class="labs">Labs</span></span></a>
        <p style="max-width:320px">An interactive aviation learning platform. Built by a student, for anyone who looks up when a plane flies over.</p>
      </div>
      <div><div class="foot-head">Explore</div><a href="aircraft.html">Aircraft</a><a href="airports.html">Airports</a><a href="compare.html">Compare</a><a href="timeline.html">Timeline</a></div>
      <div><div class="foot-head">Learn</div><a href="learn.html">Lessons</a><a href="quizzes.html">Quizzes</a><a href="glossary.html">Glossary</a></div>
      <div><div class="foot-head">About</div><a href="about.html">Mission & sources</a><a href="profile.html">Your progress</a></div>
    </div>
    <hr class="hr" style="margin:32px 0 20px">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <span class="muted-3">© ${new Date().getFullYear()} AeroAdi Labs · Founded & built by <a href="../" style="color:inherit;text-decoration:underline;text-underline-offset:3px">Adithya Shivaprasad</a> · Educational use · Specs are typical published values</span>
      <span class="data-s">DISCOVER AVIATION. INTERACTIVELY.</span>
    </div>
  </div></footer>`;

  // search overlay
  const ov = document.createElement("div");
  ov.className="overlay"; ov.id="searchOverlay";
  ov.innerHTML = `<div class="palette" role="dialog" aria-label="Search">
    <input id="searchInput" type="text" placeholder="Search aircraft, airports, lessons, terms…" autocomplete="off" role="combobox" aria-expanded="true">
    <div class="results" id="searchResults"></div></div>`;
  ov.addEventListener("click", e=>{ if(e.target===ov) closeSearch(); });
  document.body.appendChild(ov);
  document.getElementById("searchInput").addEventListener("input", e=>runSearch(e.target.value));
  document.addEventListener("keydown", e=>{
    if(e.key==="/" && !/input|textarea|select/i.test(document.activeElement.tagName)){ e.preventDefault(); openSearch(); }
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==="k"){ e.preventDefault(); openSearch(); }
    if(e.key==="Escape") closeSearch();
  });
}

/* ---------- search ---------- */
function searchIndex(){
  const idx=[];
  AIRCRAFT.forEach(a=>idx.push({t:a.name, s:a.role, k:(a.maker+" "+a.country+" "+a.cat).toLowerCase(), u:"aircraft-detail.html?id="+a.slug, g:"Aircraft", i:"✈"}));
  AIRPORTS.forEach(p=>idx.push({t:p.name, s:p.iata+" · "+p.icao, k:(p.city+" "+p.country+" "+p.iata+" "+p.icao).toLowerCase(), u:"airport-detail.html?id="+p.icao, g:"Airports", i:"◉"}));
  LESSONS.forEach(l=>idx.push({t:l.title, s:"Lesson · "+l.mins+" min", k:l.wp.toLowerCase(), u:"lesson.html?id="+l.slug, g:"Lessons", i:"◈"}));
  QUIZZES.forEach(q=>idx.push({t:q.title, s:"Quiz · "+DIFF_NAMES[q.diff], k:q.cat.toLowerCase(), u:"quiz.html?id="+q.slug, g:"Quizzes", i:"▣"}));
  GLOSSARY.forEach(g=>idx.push({t:g.t, s:g.d.slice(0,60)+"…", k:"", u:"glossary.html#"+encodeURIComponent(g.t), g:"Glossary", i:"❝"}));
  return idx;
}
let _idx=null;
function runSearch(q){
  _idx = _idx || searchIndex();
  const el = document.getElementById("searchResults");
  q = q.trim().toLowerCase();
  let res;
  if(!q){
    res = _idx.filter(r=>r.g==="Aircraft").slice(0,4).concat(_idx.filter(r=>r.g==="Lessons").slice(0,3));
    el.innerHTML = `<div class="res-group">Try exploring</div>` + res.map(resRow).join("");
    return;
  }
  const score = r=>{
    const t=r.t.toLowerCase(), s=(r.s||"").toLowerCase();
    if(s.includes(q.toUpperCase().toLowerCase()) && q.length===3 && r.g==="Airports") return 0; // code match
    if(t.startsWith(q)) return 1;
    if(t.includes(q)) return 2;
    if(s.includes(q)||r.k.includes(q)) return 3;
    return 99;
  };
  res = _idx.map(r=>[score(r),r]).filter(x=>x[0]<99).sort((a,b)=>a[0]-b[0]).slice(0,10).map(x=>x[1]);
  if(!res.length){ el.innerHTML = `<div class="res-group">No results</div><div style="padding:8px 16px 16px" class="muted">Waypoint not found. Try an aircraft name, airport code, or term.</div>`; return; }
  let html="", lastG="";
  res.forEach(r=>{ if(r.g!==lastG){ html+=`<div class="res-group">${r.g}</div>`; lastG=r.g; } html+=resRow(r); });
  el.innerHTML=html;
}
function resRow(r){ return `<a class="res" href="${r.u}"><span class="ri">${r.i}</span><span>${esc(r.t)}</span><span class="rs">${esc(r.s||"")}</span></a>`; }
function openSearch(){ document.getElementById("searchOverlay").classList.add("open"); const i=document.getElementById("searchInput"); i.value=""; runSearch(""); setTimeout(()=>i.focus(),30); }
function closeSearch(){ document.getElementById("searchOverlay").classList.remove("open"); }

/* aircraft card used across pages */
function aircraftCard(a){
  return `<a class="card hoverable" href="aircraft-detail.html?id=${a.slug}">
    <span class="eyebrow">${esc(a.maker)}</span>
    <div style="margin:6px 0 4px">${silhouette(a,54)}</div>
    <div class="title-s">${esc(a.name)}</div>
    <div class="body-s" style="margin-top:2px">${esc(a.role)}</div>
    <div class="stat-row">
      <span class="st"><span class="data-s">CRUISE</span><span class="data-m">${fmt(a.cruise)} km/h</span></span>
      <span class="st"><span class="data-s">RANGE</span><span class="data-m">${fmt(a.range)} km</span></span>
    </div></a>`;
}

/* ============================================================
   Parametric silhouette generator v1
   Draws a unique side profile from each aircraft's own data:
   engine count/mount, tail type, wing position, deck, kind.
   Hand-drawn heroes (747 hump, A380, Concorde, SR-71, Spitfire,
   B-2 flying wing) override the generator.
   ============================================================ */
function paraSil(a){
  const p = a.p || inferP(a);
  const S=[];
  /* proportions from the aircraft's real dimensions */
  const L=a.len||35, H=a.hgt||12, SP=a.span||35;
  const th = p.k==="fighter"?7 : Math.max(7.5, Math.min(16, 6+ (a.mtow||60000)**0.5/48 + H/4));
  const noseX=16, tailX=Math.round(120+Math.min(66,L*0.82)), cy=34;
  const top=cy-th/2, bot=cy+th/2;
  if(p.k==="wing"){ /* flying wing */
    return `<path d="M14 40 L96 22 Q110 19 124 22 L188 38 L124 34 Q100 30 60 38 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`;
  }
  if(p.k==="fighter"){
    const sx=(0.82+ (a.len||16)/70).toFixed(3), sy=(0.86+ (a.span||11)/70).toFixed(3);
    const can = p.can? `<path d="M70 31 L86 27 L88 31 Z" fill="currentColor"/>`:"";
    return `<g transform="translate(100 30) scale(${sx} ${sy}) translate(-100 -30)"><path d="M8 36 L40 33 Q120 ${p.delta?26:28} 168 24 L188 20 L170 34 Q120 40 40 39 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M100 33 L146 ${p.delta?24:27} L150 33 Z" fill="currentColor" opacity=".85"/>
      ${can}
      <path d="M148 25 Q158 17 166 21 L160 26 Z" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="M8 36 L26 22 L34 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></g>`;
  }
  /* fuselage */
  const deckUp = p.d==="hump"? `M${noseX+22} ${top} Q${noseX+30} ${top-7} ${noseX+62} ${top-6} L${noseX+78} ${top}`
               : p.d==="d"? `M${noseX+8} ${top} L${noseX+8} ${top-6} Q100 ${top-9} ${tailX-26} ${top-6} L${tailX-24} ${top}` : "";
  S.push(`<path d="M${noseX} ${cy} Q${noseX+6} ${top} ${noseX+26} ${top} L${tailX-30} ${top} Q${tailX-8} ${top+1} ${tailX} ${cy-8} L${tailX-2} ${cy-4} Q${tailX-16} ${bot} ${tailX-40} ${bot} L${noseX+22} ${bot} Q${noseX+4} ${bot-1} ${noseX} ${cy} Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`);
  if(deckUp) S.push(`<path d="${deckUp}" fill="none" stroke="currentColor" stroke-width="2"/>`);
  /* cockpit tick */
  S.push(`<path d="M${noseX+7} ${top+2} L${noseX+16} ${top+1}" stroke="currentColor" stroke-width="2"/>`);
  /* tail */
  const finTop = p.t==="t"? 8 : 11;
  S.push(`<path d="M${tailX-30} ${top} L${tailX-16} ${finTop} L${tailX-2} ${finTop} L${tailX-4} ${cy-8}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`);
  S.push( p.t==="t" ? `<path d="M${tailX-22} ${finTop} L${tailX+6} ${finTop-2}" stroke="currentColor" stroke-width="2.4"/>`
                    : `<path d="M${tailX-26} ${cy-6} L${tailX+4} ${cy-11}" stroke="currentColor" stroke-width="2.2"/>`);
  /* wing (side view blade + fairing) */
  const wy = p.w==="high"? top+1 : p.w==="mid"? cy : bot-2;
  const wdir = p.w==="high"? -1 : 1;
  const wx0 = Math.round(noseX + (tailX-noseX)*0.42), wl = Math.round(20+SP*0.34);
  S.push(`<path d="M${wx0} ${wy} L${wx0+wl} ${wy+8*wdir} L${wx0+wl+6} ${wy+6*wdir}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`);
  /* engines */
  const pods = p.e>=8?4 : p.e>=6?3 : p.e>=4?2 : 1;
  if(p.k==="prop"){
    if(p.m==="nose"){
      S.push(`<path d="M${noseX-2} ${cy-9} L${noseX-2} ${cy+9}" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="${noseX+2}" cy="${cy}" r="2.4" fill="currentColor"/>`);
    } else {
      for(let i=0;i<Math.min(pods,2);i++){ const ex=Math.round(wx0-6-i*26);
        S.push(`<path d="M${ex} ${wy+3*wdir} l0 ${8*wdir}" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M${ex} ${wy+(wdir>0?14:-14)} l0 ${wdir>0?6:-6} M${ex} ${wy} l0 ${wdir>0?-5:5}" stroke="currentColor" stroke-width="1.6"/>`);}
    }
  } else if(p.m==="tail"){
    S.push(`<rect x="${tailX-46}" y="${top-7}" width="20" height="7" rx="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/>`);
    if(p.e===3) S.push(`<path d="M${tailX-30} ${finTop} L${tailX-2} ${finTop}" stroke="currentColor" stroke-width="4" opacity=".7"/>`);
  } else if(p.m==="mix"){ /* trijet: wing pods + fin engine */
    S.push(`<rect x="78" y="${bot+2}" width="24" height="8" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/>`);
    S.push(`<rect x="${tailX-26}" y="${finTop-1}" width="18" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/>`);
  } else if(p.m==="buried"){
    S.push(`<path d="M84 ${wy} h18" stroke="currentColor" stroke-width="4" opacity=".6"/>`);
  } else { /* wing-mounted jets */
    const pw=Math.max(16,Math.min(24, 12+(a.mtow||60000)/40000));
    for(let i=0;i<pods;i++){ const ex=Math.round(wx0-14-i*(pw+5)+pods*4);
      S.push(`<rect x="${ex}" y="${p.w==="high"? top+7 : bot+2}" width="${pw}" height="8" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/>`);}
  }
  /* gear hint */
  S.push(`<circle cx="${Math.round(noseX+18)}" cy="${bot+11}" r="2.6" fill="currentColor"/><circle cx="${Math.round(wx0+wl*0.5)}" cy="${bot+11}" r="2.6" fill="currentColor"/>`);
  return S.join("");
}
function inferP(a){
  const e = parseInt((a.engines||"2").match(/^(\d+)/)?.[1]||"2");
  const prop = /piston|turboprop|radial/i.test(a.engines||"");
  const fighter = /fighter/i.test(a.role||"");
  return {k:fighter?"fighter":prop?"prop":"jet", e, m: e===1&&prop?"nose":"wing",
    t:"conv", w:/high/i.test(a.wing||"")?"high":"low"};
}
/* custom hand-drawn heroes override */
const SIL_CUSTOM = {
  "boeing-747-8":SILS.wide, "airbus-a380":(SILS.wide+`<path d="M28 26 Q70 20 150 22" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".7"/>`),
  "concorde":SILS.delta, "lockheed-sr-71":(`<path d="M8 38 L60 30 Q120 20 150 18 L192 14 L160 34 Q100 42 40 41 Z M150 18 L158 8 L164 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><ellipse cx="108" cy="31" rx="16" ry="4" fill="none" stroke="currentColor" stroke-width="1.6"/>`),
  "supermarine-spitfire":SILS.prop
};
/* upgrade the shared silhouette() to use the generator */
silhouette = function(a,h){
  const inner = SIL_CUSTOM[a.slug] || (a.p||!SILS[a.sil]? paraSil(a) : SILS[a.sil]);
  return `<svg class="silhouette" viewBox="0 0 200 60" height="${h||60}" role="img" aria-label="Side profile, ${esc(a.role||'aircraft')}">${inner}</svg>`;
};

/* ============================================================
   World airport search — lazy-loads the 9,789-airport tier on
   first search, merges into the palette.
   ============================================================ */
let _aptLoading=false;
function ensureAptSearch(cb){
  if(window.APT_SEARCH) return cb&&cb();
  if(_aptLoading) return; _aptLoading=true;
  const s=document.createElement("script");
  s.src="assets/apt-search.js"; s.onload=()=>{_idx=null; cb&&cb();};
  s.onerror=()=>{_aptLoading=false;};
  document.head.appendChild(s);
}
const CONTINENT_NAMES={AF:"Africa",AN:"Antarctica",AS:"Asia",EU:"Europe",NA:"North America",OC:"Oceania",SA:"South America"};
function countryName(cc){
  try{ return new Intl.DisplayNames(["en"],{type:"region"}).of(cc)||cc; }catch(e){ return cc; }
}
/* extend palette search with world airports */
const _runSearchCore = runSearch;
runSearch = function(q){
  _runSearchCore(q);
  q=(q||"").trim().toLowerCase();
  if(q.length<2) return;
  ensureAptSearch(()=>{ /* re-run once loaded */ if(document.getElementById("searchInput").value.trim().toLowerCase()===q) _worldResults(q); });
  if(window.APT_SEARCH) _worldResults(q);
};
function _worldResults(q){
  const el=document.getElementById("searchResults"); if(!el) return;
  const flag=new Set(AIRPORTS.map(a=>a.icao));
  const qq=q.toUpperCase();
  const hits=[];
  for(const a of APT_SEARCH){
    if(flag.has(a[0])) continue;
    let sc=99;
    if(a[1]===qq||a[0]===qq) sc=0;
    else if(a[2].toLowerCase().startsWith(q)||(a[3]||"").toLowerCase().startsWith(q)) sc=1;
    else if(q.length>=3 && (a[2].toLowerCase().includes(q)||(a[3]||"").toLowerCase().includes(q))) sc=2;
    if(sc<99) hits.push([sc,a]);
    if(hits.length>400) break;
  }
  hits.sort((x,y)=>x[0]-y[0]||(y[1][8]==="L")-(x[1][8]==="L"));
  const top=hits.slice(0,6).map(h=>h[1]);
  if(!top.length) return;
  el.insertAdjacentHTML("beforeend",
    `<div class="res-group">World airports · ${countryHint(top)}</div>`+
    top.map(a=>`<a class="res" href="airport-detail.html?id=${a[0]}&c=${a[4]}"><span class="ri">◉</span><span>${esc(a[2])}</span><span class="rs">${a[1]||a[0]} · ${a[4]}</span></a>`).join(""));
}
function countryHint(list){ const c=new Set(list.map(a=>a[4])); return c.size===1? countryName([...c][0]) : c.size+" countries"; }
