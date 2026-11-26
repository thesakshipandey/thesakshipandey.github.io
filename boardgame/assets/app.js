/* The Game Shelf: front end. Plain JS, no build step. Data + accounts: Supabase. */
(() => {
  'use strict';
  const CFG = Object.assign({ SUPABASE_URL: '', SUPABASE_ANON_KEY: '', JOBS_URL: '', GOOGLE_CLIENT_ID: '', TITLE: 'The Game Shelf', SITE_URL: '' }, window.SHELF_CONFIG || {});
  const SITE_URL = CFG.SITE_URL || (location.origin + location.pathname);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = (n) => n == null || n === '' || isNaN(n) ? '—' : '₹' + Math.round(+n).toLocaleString('en-IN');
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const sum = (a) => a.reduce((s, x) => s + (+x || 0), 0);
  const avg = (a) => a.length ? sum(a) / a.length : 0;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const bggBadge = () => `<a class="bggbadge" href="https://boardgamegeek.com" target="_blank" rel="noopener" title="Powered by BoardGameGeek"><img src="assets/powered-by-bgg.svg" alt="Powered by BGG"></a>`;

  const sb = CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY && window.supabase
    ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: 'shelf-auth' } })
    : null;

  const CATS = ['Boards', 'Cards', 'Duels', 'Solo'];
  const OWNEDISH = ['Owned', 'DIY'];
  const PRIORITY = ['Really want', 'Normal', 'Maybe'];
  const PRIORITY_ORDER = { 'Really want': 0, 'Normal': 1, 'Maybe': 2 };
  const PAGE = 60;

  // Curated "type of game" tags, matched against genre + sheet tags + BGG mechanics/categories.
  const TYPES = [
    ['Cooperative', g => /cooperative/.test(g.hayTags)],
    ['Strategy', g => /strategy|eurogame|civilization|wargame|economic/.test(g.hayTags) || (g.weight || 0) >= 2.5],
    ['Tile Placement', g => /tile (placement|drafting|laying)/.test(g.hayTags)],
    ['Party', g => /party/.test(g.hayTags)],
    ['Engine Building', g => /engine building|tableau/.test(g.hayTags)],
    ['Deck Building', g => /deck building|deck bag/.test(g.hayTags)],
    ['Trick Taking', g => /trick taking/.test(g.hayTags)],
    ['War Game', g => /wargame|war game|\bwars\b|tactical (card )?combat|\bfighting\b/.test(g.hayTags)],
    ['Economic', g => /econom|trading|stock holding|market|merger/.test(g.hayTags)],
    ['Social Deduction', g => /social deduction|hidden roles/.test(g.hayTags)],
    ['Bluffing', g => /bluff/.test(g.hayTags)],
    ['Deduction', g => /deduction|hidden information|memory/.test(g.hayTags)],
    ['Worker Placement', g => /worker placement/.test(g.hayTags)],
    ['Area Control', g => /area (control|majority)/.test(g.hayTags)],
    ['Set Collection', g => /set collection/.test(g.hayTags)],
    ['Drafting', g => /drafting/.test(g.hayTags)],
    ['Hand Management', g => /hand management/.test(g.hayTags)],
    ['Push Your Luck', g => /push your luck/.test(g.hayTags)],
    ['Negotiation', g => /negotiation/.test(g.hayTags)],
    ['Racing', g => /racing|\brace\b/.test(g.hayTags)],
    ['Abstract', g => /abstract/.test(g.hayTags)],
    ['Family', g => /family/.test(g.hayTags)],
    ['Adventure', g => /adventure|dungeon|exploration/.test(g.hayTags)],
    ['Campaign', g => /campaign|legacy/.test(g.hayTags)],
    ['Team-Based', g => /team/.test(g.hayTags)],
    ['Dice', g => /dice/.test(g.hayTags)],
    ['Climbing / Shedding', g => /climbing|shedding/.test(g.hayTags)],
    ['Take That', g => /take that/.test(g.hayTags)],
    ['Asymmetric', g => /asymmetric|variable player powers/.test(g.hayTags)],
    ['Word / Trivia', g => /\bword\b|trivia/.test(g.hayTags)],
    ['Political', g => /politic|voting/.test(g.hayTags)],
    ['Real-Time', g => /real time/.test(g.hayTags)],
    ['Solo', g => g.minP === 1],
    ['Two-Player', g => g.maxP === 2 || /two player/.test(g.hayTags)]
  ];

  const S = {
    catalog: null, games: [], byName: {}, byId: {}, art: new Set(),
    session: null, me: null, items: {},
    f: { q: '', players: null, cats: new Set(), types: new Set(), time: '', weight: '', mine: '', sort: 'name' },
    mode: localStorage.getItem('shelf_mode') || 'grid', shown: PAGE, wishTab: 'buy', shelfTab: 'all'
  };
  const authed = () => !!(S.me && S.me.username);
  const isAdmin = () => !!(S.me && S.me.is_admin);

  /* ------------------------------------------------------------ catalogue */
  async function loadCatalog(fresh) {
    const cached = !fresh && localStorage.getItem('shelf_catalog_v2');
    if (cached) { try { setCatalog(JSON.parse(cached), true); } catch (e) {} }
    try {
      if (!sb) throw new Error('no database configured');
      const { data, error } = await sb.rpc('catalog');
      if (error) throw error;
      setCatalog(data);
      try { localStorage.setItem('shelf_catalog_v2', JSON.stringify(data)); } catch (e) {}
    } catch (e) {
      console.warn('[shelf] catalogue:', e.message || e);
      if (S.catalog && !S.catalog.snapshot) return;
      const res = await fetch('data/snapshot.json', { cache: 'no-cache' });
      setCatalog(await res.json());
    }
  }

  function loadArt() {
    return fetch('art/index.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : []).then(ids => {
      S.art = new Set(ids.map(String));
      if (S.games.length) { S.games.forEach(g => g.art = artFor(g)); renderAll(); }
    }).catch(() => {});
  }
  const artFor = (g) => g.bggId && S.art.has(String(g.bggId)) ? `art/${g.bggId}.webp` : (g.image || g.thumb || '');

  function setCatalog(cat, fromCache) {
    S.catalog = cat;
    S.games = cat.games.map(enrich);
    S.byName = Object.fromEntries(S.games.map(g => [g.name, g]));
    S.byId = Object.fromEntries(S.games.map(g => [g.id, g]));
    $('#genreList').innerHTML = [...new Set(S.games.map(g => g.genre))].filter(Boolean).sort().map(x => `<option value="${esc(x)}">`).join('');
    const when = cat.pricesUpdated || cat.built;
    $('#dataStamp').textContent = (cat.snapshot ? 'Offline copy · prices from ' : 'India prices updated ') + (when ? new Date(when).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');
    renderAll();
    openFromHash();
  }

  function enrich(g) {
    g.id = g.id != null ? g.id : g.name;
    ['minP', 'maxP', 'minT', 'maxT', 'age'].forEach(k => g[k] = g[k] == null ? null : +g[k]);
    g.cats = new Set([g.category, ...(g.alsoIn || [])].filter(c => CATS.includes(c)));
    if (g.maxP === 2) g.cats.add('Duels');
    if (g.minP === 1) g.cats.add('Solo');
    if ((g.bggCategories || []).includes('Card Game')) g.cats.add('Cards');
    g.hayTags = norm([g.genre, ...(g.tags || []), ...(g.mechanics || []), ...(g.bggCategories || [])].join(' | '));
    g.hay = norm([g.name, g.genre, ...(g.tags || []), ...(g.mechanics || []), ...(g.designers || []), ...(g.bggCategories || [])].join(' '));
    g.nameKey = norm(g.name);
    g.types = TYPES.filter(([, fn]) => fn(g)).map(([n]) => n);
    g.cx = complexity(g.weight);
    (g.offers || []).forEach(o => { o.variant = isVariant(g.name, o.listing); });
    const inStock = (g.offers || []).filter(o => /in stock/i.test(o.status || '') && o.price);
    g.best = inStock.filter(o => !o.variant).sort((a, b) => a.price - b.price)[0] || null;
    g.store = storeFor(g.buyLink);
    g.art = artFor(g);
    g.players = g.minP ? (g.minP === g.maxP || !g.maxP ? String(g.minP) : `${g.minP}–${g.maxP}`) : '';
    g.time = g.minT ? (g.minT === g.maxT || !g.maxT ? `${g.minT}` : `${g.minT}–${g.maxT}`) : '';
    return g;
  }

  const VARIANT_WORDS = ['mini', 'travel', 'expansion', 'promo', 'sleeve', 'sleeves', 'duel', 'duo', 'junior', 'kids', 'pocket', 'roll', 'write', 'insert', 'organizer', 'playmat', 'deluxe', 'big box', 'collector', 'dice game', 'card game', 'pack', 'upgrade'];
  function isVariant(name, listing) {
    const n = ' ' + norm(name) + ' ', l = ' ' + norm(listing) + ' ';
    return VARIANT_WORDS.some(w => l.includes(' ' + w + ' ') && !n.includes(' ' + w + ' '));
  }
  function complexity(w) {
    if (!w) return 'Unrated';
    if (w < 1.75) return 'Light';
    if (w < 2.5) return 'Medium Light';
    if (w < 3.25) return 'Medium';
    return 'Heavy';
  }
  function host(u) { try { return new URL(u).hostname.replace(/^www\.|^shop\./, ''); } catch (e) { return ''; } }
  function storeFor(link) {
    const h = host(link);
    if (!h) return '';
    const s = (S.catalog && S.catalog.stores || []).find(x => host(x.url) === h);
    if (s) return s.name;
    return { 'amzn.in': 'Amazon', 'amazon.in': 'Amazon', 'flipkart.com': 'Flipkart', 'zepto.com': 'Zepto', 'hamleys.in': 'Hamleys' }[h] || h;
  }

  /* ------------------------------------------------------------ personal state */
  const my = (g) => S.items[g.id] || {};
  const statusOf = (g) => my(g).status || '';
  const isOwned = (g) => OWNEDISH.includes(statusOf(g));
  const onWay = (g) => statusOf(g) === 'On the way';
  const onShelf = (g) => isOwned(g) || onWay(g);
  const onBuyList = (g) => !!my(g).interest && !onShelf(g);
  const onWishlist = (g) => !onShelf(g) && (statusOf(g) === 'Wishlist' || !!my(g).interest);
  const bestPrice = (g) => (g.best && g.best.price) || g.price || null;

  /* ------------------------------------------------------------ filtering */
  function matches(g, skip) {
    const f = S.f;
    if (f.q) { const words = norm(f.q).split(' '); if (!words.every(w => g.hay.includes(w))) return false; }
    if (f.players && !(g.minP != null && g.maxP != null && g.minP <= f.players && f.players <= g.maxP)) return false;
    if (skip !== 'cats' && f.cats.size && ![...f.cats].some(c => g.cats.has(c))) return false;
    if (skip !== 'types' && f.types.size && ![...f.types].every(t => g.types.includes(t))) return false;
    if (f.time) { const t = g.maxT || g.minT; if (f.time === '999') { if (!(t > 90)) return false; } else if (!(t && t <= +f.time)) return false; }
    if (f.weight && g.cx !== f.weight) return false;
    if (f.mine && authed()) {
      if (f.mine === 'owned' && !onShelf(g)) return false;
      if (f.mine === 'notowned' && onShelf(g)) return false;
      if (f.mine === 'wish' && !onWishlist(g)) return false;
    }
    return true;
  }
  function sorted(list) {
    const by = {
      name: (a, b) => a.name.localeCompare(b.name),
      rank: (a, b) => (a.bggRank || 1e9) - (b.bggRank || 1e9),
      rating: (a, b) => (b.bggRating || 0) - (a.bggRating || 0),
      weight: (a, b) => (a.weight || 9) - (b.weight || 9),
      weightd: (a, b) => (b.weight || 0) - (a.weight || 0),
      price: (a, b) => (bestPrice(a) || 1e9) - (bestPrice(b) || 1e9),
      new: (a, b) => (+b.id || 0) - (+a.id || 0)
    }[S.f.sort] || ((a, b) => a.name.localeCompare(b.name));
    // Owned games float to the top when someone searches by player count: "what can we play tonight".
    return list.slice().sort((a, b) => (authed() && S.f.players ? (onShelf(b) - onShelf(a)) : 0) || by(a, b));
  }
  const filtersActive = () => { const f = S.f; return !!(f.q || f.players || f.cats.size || f.types.size || f.time || f.weight || f.mine); };

  /* ------------------------------------------------------------ shared bits */
  function initials(n) { return n.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
  function phStyle(g) {
    let h = 0; for (const c of g.name) h = (h * 31 + c.charCodeAt(0)) % 360;
    return `background:radial-gradient(160px 120px at 30% 20%,hsl(${h} 35% 34% / .9),transparent 70%),linear-gradient(135deg,hsl(${(h + 30) % 360} 22% 20%),hsl(${(h + 60) % 360} 18% 11%))`;
  }
  function artHTML(g, big) {
    const src = big ? (g.image || g.art) : g.art;
    const ph = `<div class="ph" style="${phStyle(g)}">${esc(initials(g.name))}</div>`;
    if (!src) return ph;
    // Big view: the webp copy shows instantly, the full-size original swaps in once loaded.
    const swap = big && g.image && g.art && g.art !== g.image ? ` data-full="${esc(g.image)}"` : '';
    const first = big && swap ? g.art : src;
    return `<img src="${esc(first)}"${swap} alt="${esc(g.name)} box art" loading="${big ? 'eager' : 'lazy'}" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.outerHTML=this.dataset.ph||''" data-ph="${esc(ph)}">`;
  }
  function statusPill(g) {
    if (!authed()) return '';
    const st = statusOf(g), m = my(g);
    if (isOwned(g)) return `<span class="pill">${st === 'DIY' ? 'DIY' : 'Owned'}</span>`;
    if (onWay(g)) return '<span class="pill way">On the way</span>';
    if (m.interest) return `<span class="pill want">${esc(m.interest)}</span>`;
    if (st === 'Wishlist') return '<span class="pill wish">Wishlist</span>';
    return '';
  }
  const heartBtn = (g) => authed() ? `<span class="heart-btn ${onWishlist(g) ? 'on' : ''} ${onShelf(g) ? 'own' : ''}" role="button" tabindex="0" data-heart="${esc(g.id)}" title="${onShelf(g) ? 'On your shelf' : onWishlist(g) ? 'Remove from wishlist' : 'Add to wishlist'}">${onShelf(g) ? '✓' : '♥'}</span>` : '';

  function cardHTML(g) {
    const m = my(g);
    const ed = onShelf(g) && m.edition && !/^standard/i.test(m.edition) ? `<span class="pill ed">${esc(m.edition.replace(g.name + ': ', '').slice(0, 26))}</span>` : '';
    const rank = g.bggRank ? `<span class="pill right">#${g.bggRank}</span>` : '';
    const price = g.best ? `<b>${inr(g.best.price)}</b><span class="muted">${esc(g.best.store)}</span>`
      : g.price ? `<b>${inr(g.price)}</b><span class="muted">${esc(g.store || 'list price')}</span>` : '<span class="muted">No price yet</span>';
    return `<article class="game ${isOwned(g) ? 'owned' : onWay(g) ? 'onway' : ''}" data-g="${esc(g.name)}" tabindex="0">
      <div class="art">${artHTML(g)}${statusPill(g)}${ed}${rank}${heartBtn(g)}</div>
      <div class="gbody">
        <div class="cats">${[...g.cats].map(c => `<span class="cat ${c}">${c}</span>`).join('')}</div>
        <h3 class="gname">${esc(g.name)}${g.year ? `<small>${g.year}</small>` : ''}</h3>
        <div class="meta"><span title="Players">👥 <b>${g.players || '?'}</b></span>${g.time ? `<span title="Minutes">⏱ <b>${g.time}′</b></span>` : ''}<span title="BGG weight /5">⚖ <b>${g.weight ? (+g.weight).toFixed(1) : '–'}</b></span>${g.bggRating ? `<span title="BGG rating">★ <b>${(+g.bggRating).toFixed(1)}</b></span>` : ''}${authed() && m.rating ? `<span class="mine-r" title="My rating">♥ <b>${m.rating}</b></span>` : ''}</div>
        <div class="meta genre">${esc(g.genre || '')}</div>
        <div class="gprice">${price}</div>
      </div></article>`;
  }
  function rowHTML(g) {
    return `<div class="lrow ${isOwned(g) ? 'owned' : onWay(g) ? 'onway' : ''}" data-g="${esc(g.name)}" tabindex="0">
      <div class="lart">${artHTML(g)}</div>
      <div class="lname"><b>${esc(g.name)}</b><span class="muted">${esc(g.genre || '')}${g.year ? ' · ' + g.year : ''}</span></div>
      <div class="lcell">👥 ${g.players || '?'}</div><div class="lcell">⏱ ${g.time ? g.time + '′' : '–'}</div>
      <div class="lcell">⚖ ${g.weight ? (+g.weight).toFixed(1) : '–'}</div><div class="lcell">${g.bggRank ? '#' + g.bggRank : ''}</div>
      <div class="lcell">${statusPill(g)}</div><div class="lprice">${g.best ? inr(g.best.price) : g.price ? inr(g.price) : '—'}</div>
      <div class="lcell">${heartBtn(g)}</div></div>`;
  }

  function tile(v, k, cls = '', attrs = '') { return `<div class="tile ${cls}" ${attrs}><div class="v">${v}</div><div class="k">${k}</div></div>`; }
  function empty(icon, title, text, action) {
    return `<div class="empty-state"><div class="es-icon">${icon}</div><h3>${title}</h3><p>${text}</p>${action || ''}</div>`;
  }

  /* ------------------------------------------------------------ home */
  const SC = { picks: [], i: 0, timer: null, key: '' };
  function renderShowcase() {
    const el = $('#showcase');
    const picks = S.games.filter(g => g.art && g.bggRank).sort((a, b) => a.bggRank - b.bggRank).slice(0, 10);
    el.classList.toggle('gone', !picks.length);
    const key = picks.map(g => g.name + g.art).join('|') + (authed() ? picks.map(g => +onShelf(g)).join('') : '');
    if (SC.key === key) return;
    SC.key = key; SC.picks = picks; SC.i = Math.min(SC.i, Math.max(0, picks.length - 1));
    el.innerHTML = `<div class="sc-stage">${picks.map((g, i) => `<button class="sc-card" data-sc="${i}" aria-label="${esc(g.name)}">
        <span class="sc-glow"></span><span class="sc-rank">BGG #${g.bggRank}${authed() && onShelf(g) ? ' · <em>on your shelf</em>' : ''}</span>
        <span class="sc-genre">${esc(g.genre || '')}</span>
        <span class="sc-meta">${g.players ? `<span>${g.players} players</span>` : ''}${g.bggRating ? `<span>★ ${(+g.bggRating).toFixed(1)}</span>` : ''}${g.best ? `<span>${inr(g.best.price)}</span>` : ''}</span>
        <span class="sc-name">${esc(g.name)}</span>
        <img src="${esc(g.art)}" alt="" referrerpolicy="no-referrer" loading="lazy" draggable="false"></button>`).join('')}</div>
      ${picks.length > 1 ? `<button class="sc-nav prev" data-scnav="-1" aria-label="Previous">‹</button><button class="sc-nav next" data-scnav="1" aria-label="Next">›</button>
      <div class="sc-dots">${picks.map((_, i) => `<button data-scdot="${i}" aria-label="Show ${i + 1}"></button>`).join('')}</div>` : ''}`;
    placeShowcase(); startShowcase();
  }
  function placeShowcase() {
    const n = SC.picks.length;
    $$('#showcase .sc-card').forEach(c => {
      const i = +c.dataset.sc;
      let d = (i - SC.i + n) % n; if (d > n / 2) d -= n;
      c.className = 'sc-card ' + (d === 0 ? 'c0' : d === -1 ? 'c1' : d === 1 ? 'c2' : d < 0 ? 'cl' : 'cr');
      c.tabIndex = d === 0 ? 0 : -1;
    });
    $$('#showcase [data-scdot]').forEach(b => b.classList.toggle('on', +b.dataset.scdot === SC.i));
  }
  function moveShowcase(step) { const n = SC.picks.length; if (n < 2) return; SC.i = (SC.i + step + n) % n; placeShowcase(); }
  function startShowcase() {
    clearInterval(SC.timer);
    if (SC.picks.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) SC.timer = setInterval(() => { if (!document.hidden) moveShowcase(1); }, 5000);
  }
  function wireShowcase() {
    const el = $('#showcase');
    el.addEventListener('mouseenter', () => clearInterval(SC.timer));
    el.addEventListener('mouseleave', startShowcase);
    el.addEventListener('click', e => {
      const nav = e.target.closest('[data-scnav]'), dot = e.target.closest('[data-scdot]'), card = e.target.closest('.sc-card');
      if (nav) { moveShowcase(+nav.dataset.scnav); return; }
      if (dot) { SC.i = +dot.dataset.scdot; placeShowcase(); return; }
      if (!card || SC.swiped) return;
      if (card.classList.contains('c0')) openGame(SC.picks[+card.dataset.sc].name);
      else { SC.i = +card.dataset.sc; placeShowcase(); }
    });
    let x0 = null;
    el.addEventListener('pointerdown', e => { x0 = e.clientX; SC.swiped = false; });
    el.addEventListener('pointerup', e => {
      if (x0 == null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { SC.swiped = true; moveShowcase(dx < 0 ? 1 : -1); startShowcase(); setTimeout(() => SC.swiped = false, 50); }
    });
    el.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') moveShowcase(-1); if (e.key === 'ArrowRight') moveShowcase(1); });
  }

  function renderHome() {
    const all = S.games, el = $('#miniSummary');
    if (authed()) {
      $('#heroEyebrow').textContent = `Welcome back, ${(S.me.display_name || '').split(' ')[0] || '@' + S.me.username}`;
      $('#heroTitle').innerHTML = 'What are we<br>playing tonight?';
    } else {
      $('#heroEyebrow').textContent = 'Board · Card · Duel games';
      $('#heroTitle').innerHTML = 'Every game we play,<br>own, or want next';
    }
    if (!all.length) { el.innerHTML = ''; return; }
    const t = (v, k, cls = '', nav = 'summary') => `<button class="mini ${cls}" data-nav="${nav}"><b>${v}</b><span>${k}</span></button>`;
    let html = t(all.length, 'games', '', 'games') + ['Boards', 'Cards', 'Duels'].map(c => t(all.filter(g => g.category === c).length, c.toLowerCase(), '', 'games')).join('');
    html += authed()
      ? t(all.filter(isOwned).length, 'on my shelf', 'green', 'shelf') + t(all.filter(onWay).length, 'on the way', 'amber', 'shelf') + t(all.filter(onBuyList).length, 'to buy', 'red', 'wishlist')
      : t(all.filter(g => g.best).length, 'in stock in India', '', 'games');
    el.innerHTML = html + `<a class="mini-more" href="#summary" data-nav="summary">Full summary →</a>`;

    const row = (title, sub, list, more) => list.length ? `<section class="hrow"><div class="hrow-head"><div><h2>${title}</h2><p class="muted">${sub}</p></div>${more || ''}</div>
      <div class="hscroll">${list.map(cardHTML).join('')}</div></section>` : '';
    let rows = '';
    if (authed()) {
      const buys = all.filter(onBuyList).sort((a, b) => (PRIORITY_ORDER[my(a).interest] ?? 9) - (PRIORITY_ORDER[my(b).interest] ?? 9)).slice(0, 12);
      rows += row('Next on your buy list', 'Highest priority first, with the best in-stock price', buys, '<a class="btn sm" href="#wishlist" data-nav="wishlist">Open wishlist</a>');
      const fav = S.me.favourite_count;
      if (fav) rows += row(`On your shelf for ${fav}`, `Owned games that play at ${fav}`, all.filter(g => isOwned(g) && g.minP <= fav && fav <= g.maxP).sort((a, b) => (my(b).rating || 0) - (my(a).rating || 0)).slice(0, 12));
    }
    rows += row('Recently added', 'The newest games in the catalogue', all.slice().sort((a, b) => (+b.id || 0) - (+a.id || 0)).slice(0, 12), '<a class="btn sm" href="#games" data-nav="games" data-sort="new">See all</a>');
    rows += row('Quick to learn, quick to play', 'Light games under 30 minutes', all.filter(g => g.weight && g.weight < 1.8 && (g.maxT || g.minT) && (g.maxT || g.minT) <= 30 && g.art).sort((a, b) => (b.bggRating || 0) - (a.bggRating || 0)).slice(0, 12));
    $('#homeRows').innerHTML = rows;
  }

  /* ------------------------------------------------------------ games page */
  function renderChips() {
    const base = S.games.filter(g => matches(g, 'cats'));
    $('#catChips').innerHTML = CATS.map(c => `<button class="chip catchip ${S.f.cats.has(c) ? 'on' : ''}" data-v="${c}">${c}<span class="n">${base.filter(g => g.cats.has(c)).length}</span></button>`).join('');
    const tbase = S.games.filter(g => matches(g, 'types'));
    $('#typesCount').textContent = S.f.types.size ? S.f.types.size + ' selected' : '';
    $('#typeChips').innerHTML = TYPES.map(([t]) => [t, tbase.filter(g => g.types.includes(t)).length])
      .filter(([t]) => S.f.types.has(t) || S.games.some(g => g.types.includes(t)))
      .map(([t, n]) => `<button class="chip ${S.f.types.has(t) ? 'on' : ''} ${n === 0 && !S.f.types.has(t) ? 'dim' : ''}" data-t="${esc(t)}">${esc(t)}<span class="n">${n}</span></button>`).join('');
  }
  function renderGrid() {
    const list = sorted(S.games.filter(g => matches(g)));
    const owned = authed() ? list.filter(onShelf).length : 0;
    $('#resultCount').textContent = `${list.length} game${list.length === 1 ? '' : 's'}` + (S.f.players ? ` for ${S.f.players} player${S.f.players > 1 ? 's' : ''}` : '') + (authed() && filtersActive() ? ` · ${owned} on your shelf` : '');
    $('#clearAll').hidden = !filtersActive();
    const grid = $('#grid');
    grid.className = S.mode === 'list' ? 'list' : 'grid';
    $$('#viewMode button').forEach(b => b.classList.toggle('on', b.dataset.mode === S.mode));
    const page = list.slice(0, S.shown);
    grid.innerHTML = list.length ? (S.mode === 'list' ? page.map(rowHTML) : page.map(cardHTML)).join('')
      : empty('🎲', 'No games match', 'Try fewer filters or a different player count.', '<button class="btn" id="clearAll2">Clear filters</button>');
    $('#moreBtn').hidden = list.length <= S.shown;
    $('#moreBtn').textContent = `Show more (${list.length - S.shown} left)`;
  }

  /* ------------------------------------------------------------ summary */
  function bars(rows, max, attr) {
    return `<div class="bars">${rows.map(r => `<div class="bar" ${attr(r)}><span class="lbl" title="${esc(r.label)}">${esc(r.label)}</span>
      <span class="track"><span class="fill own" style="width:${(r.own || 0) / max * 100}%"></span><span class="fill" style="width:${(r.n - (r.own || 0)) / max * 100}%"></span></span>
      <span class="num">${r.n}</span></div>`).join('')}</div>`;
  }
  function renderSummary() {
    const list = S.games, a = authed();
    const own = (g) => a && onShelf(g);
    const avgW = avg(list.map(g => g.weight).filter(Boolean));
    const catTile = (c) => {
      if (c === 'Solo') return tile(list.filter(g => g.cats.has(c)).length, 'Solo-able');
      const extra = list.filter(g => g.category !== c && g.cats.has(c)).length;
      return tile(list.filter(g => g.category === c).length, c + (extra ? ` <span class="also">+${extra} also</span>` : ''));
    };
    let html = `<div class="sum-section"><h2 class="sec-title">The catalogue</h2><div class="tiles">
      ${tile(list.length, 'Total games')}${CATS.map(catTile).join('')}
      ${tile(avgW ? avgW.toFixed(2) : '–', 'Avg BGG weight /5')}${tile(Math.max(0, ...list.map(g => g.maxP || 0)), 'Largest group')}
      ${tile(list.filter(g => g.best).length, 'In stock in India')}</div></div>`;
    if (a) {
      const owned = list.filter(isOwned), way = list.filter(onWay), shelf = [...owned, ...way];
      const buy = list.filter(onBuyList), wish = list.filter(onWishlist);
      const paid = shelf.filter(g => my(g).price_paid != null);
      const spent = sum(paid.map(g => my(g).price_paid));
      const saved = sum(paid.filter(g => g.price).map(g => g.price - my(g).price_paid));
      const ratings = shelf.map(g => my(g).rating).filter(x => x != null);
      const plays = sum(list.map(g => my(g).plays));
      const orig = shelf.filter(g => my(g).authenticity === 'VERIFIED ORIGINAL').length;
      const fake = shelf.filter(g => my(g).authenticity === 'SUSPECTED COUNTERFEIT').length;
      const topRated = shelf.filter(g => my(g).rating).sort((x, y) => my(y).rating - my(x).rating).slice(0, 6);
      const mostPlayed = shelf.filter(g => my(g).plays).sort((x, y) => my(y).plays - my(x).plays).slice(0, 6);
      const unplayed = owned.filter(g => !my(g).plays).length;
      const li = (g, v) => `<li data-g="${esc(g.name)}"><b>${esc(g.name)}</b><span class="muted">${v}</span></li>`;
      html += `<div class="sum-section"><h2 class="sec-title">My collection <span class="muted">· only you can see this</span></h2><div class="tiles">
        ${tile(owned.length, 'Owned', 'green', 'data-nav="shelf"')}${tile(way.length, 'On the way', 'amber', 'data-nav="shelf"')}
        ${tile(buy.length, 'On buy list', 'red', 'data-nav="wishlist"')}${tile(wish.length, 'On wishlist', '', 'data-nav="wishlist"')}
        ${tile(inr(spent), 'Spent so far')}${tile(inr(saved), 'Saved vs list price', 'green')}
        ${tile(inr(sum(buy.map(bestPrice))), 'Buy list at best price', 'red')}${tile(ratings.length ? avg(ratings).toFixed(1) : '–', 'My average rating')}
        ${tile(plays, 'Plays logged')}${tile(`${orig} / ${fake}`, 'Original / counterfeit')}${tile(unplayed, 'Owned, never played')}
        ${tile(shelf.length ? Math.round(sum(shelf.map(g => g.weight || 0)) / shelf.filter(g => g.weight).length * 100) / 100 || '–' : '–', 'Shelf avg weight')}
      </div>
      <div class="panels">
        <div class="panel"><h3>My top rated</h3><ul class="toplist">${topRated.map(g => li(g, my(g).rating + '/10')).join('') || '<li class="muted">Rate games from their page.</li>'}</ul></div>
        <div class="panel"><h3>Most played</h3><ul class="toplist">${mostPlayed.map(g => li(g, my(g).plays + ' plays')).join('') || '<li class="muted">Log plays from a game\'s page.</li>'}</ul></div>
        <div class="panel"><h3>Next buys</h3><ul class="toplist">${buy.sort((x, y) => (PRIORITY_ORDER[my(x).interest] ?? 9) - (PRIORITY_ORDER[my(y).interest] ?? 9)).slice(0, 6).map(g => li(g, `${my(g).interest} · ${inr(bestPrice(g))}`)).join('') || '<li class="muted">Set a priority on any game.</li>'}</ul></div>
      </div></div>`;
    }
    const pc = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(n => { const m = list.filter(g => g.minP != null && g.minP <= n && n <= g.maxP); return { n, all: m.length, own: m.filter(own).length }; });
    const pmax = Math.max(1, ...pc.map(x => x.all));
    const pcHTML = `<div class="pcount">${pc.map(x => `<div class="pcol" data-p="${x.n}" title="${x.all} games for ${x.n}${a ? `, ${x.own} on your shelf` : ''}">
      <div class="stack" style="height:${x.all / pmax * 100}%"><i class="own" style="flex:${x.own}"></i><i style="flex:${x.all - x.own}"></i></div><span>${x.n}</span></div>`).join('')}</div>
      ${a ? '<div class="legend"><span><i class="own"></i>on your shelf</span><span><i></i>not owned</span></div>' : ''}`;
    const rowsFor = (labels, test) => labels.map(l => { const m = list.filter(g => test(g, l)); return { label: l, n: m.length, own: m.filter(own).length }; }).filter(r => r.n);
    const typeRows = rowsFor(TYPES.map(t => t[0]), (g, t) => g.types.includes(t)).sort((x, y) => y.n - x.n).slice(0, 10);
    const cxRows = rowsFor(['Light', 'Medium Light', 'Medium', 'Heavy', 'Unrated'], (g, c) => g.cx === c);
    const band = (g) => { const t = g.maxT || g.minT; return !t ? '' : t <= 20 ? 'Quick (≤20)' : t <= 45 ? 'Short (21–45)' : t <= 90 ? 'Medium (46–90)' : 'Long (90+)'; };
    const timeRows = rowsFor(['Quick (≤20)', 'Short (21–45)', 'Medium (46–90)', 'Long (90+)'], (g, b) => band(g) === b);
    const timeVal = { 'Quick (≤20)': '20', 'Short (21–45)': '45', 'Medium (46–90)': '90', 'Long (90+)': '999' };
    const genreMap = {};
    list.forEach(g => { if (g.genre) { const r = genreMap[g.genre] = genreMap[g.genre] || { label: g.genre, n: 0, own: 0 }; r.n++; if (own(g)) r.own++; } });
    const genreRows = Object.values(genreMap).sort((x, y) => y.n - x.n).slice(0, 10);
    const top = list.filter(g => g.bggRank).sort((x, y) => x.bggRank - y.bggRank).slice(0, 8);
    const maxOf = (rows) => Math.max(1, ...rows.map(r => r.n));
    html += `<div class="sum-section"><h2 class="sec-title">Breakdown</h2><div class="panels">
        <div class="panel"><h3>Player count</h3>${pcHTML}</div>
        <div class="panel"><h3>Types</h3>${bars(typeRows, maxOf(typeRows), r => `data-t="${esc(r.label)}"`)}</div>
        <div class="panel"><h3>Complexity</h3>${bars(cxRows, maxOf(cxRows), r => `data-w="${esc(r.label)}"`)}</div>
        <div class="panel"><h3>Playtime</h3>${bars(timeRows, maxOf(timeRows), r => `data-time="${timeVal[r.label]}"`)}</div>
        <div class="panel"><h3>Genres</h3>${bars(genreRows, maxOf(genreRows), r => `data-q="${esc(r.label)}"`)}</div>
        <div class="panel"><h3>Top on BGG</h3><ul class="toplist">${top.map(g => `<li data-g="${esc(g.name)}"><b>${esc(g.name)}</b><span class="muted">#${g.bggRank} · ★${(+g.bggRating).toFixed(1)}</span></li>`).join('') || '<li class="muted">No BGG ranks yet</li>'}</ul></div>
      </div></div>`;
    if (!a && sb) html += `<div class="cta card"><div><h3>Track your own collection</h3><p class="muted">Free account: owned games, prices paid, ratings, plays and a priority buy list.</p></div><button class="btn primary" data-auth="signup">Create an account</button></div>`;
    $('#summary').innerHTML = html;
  }

  /* ------------------------------------------------------------ wishlist */
  function renderWishlist() {
    if (!authed()) return;
    const list = S.games.filter(onWishlist);
    const buy = list.filter(g => my(g).interest).sort((a, b) => (PRIORITY_ORDER[my(a).interest] ?? 9) - (PRIORITY_ORDER[my(b).interest] ?? 9) || (Date.parse(my(a).interest_since) || 9e15) - (Date.parse(my(b).interest_since) || 9e15));
    const someday = list.filter(g => !my(g).interest).sort((a, b) => a.name.localeCompare(b.name));
    $('#wishTotals').innerHTML = PRIORITY.map(p => { const m = buy.filter(g => my(g).interest === p); return tile(m.length, `${p} · ${inr(sum(m.map(bestPrice)))}`, p === 'Really want' ? 'red' : ''); }).join('')
      + tile(inr(sum(buy.map(bestPrice))), 'Buy list at best India price') + tile(someday.length, 'Someday (no priority)');
    $$('#wishTabs button').forEach(b => b.classList.toggle('on', b.dataset.wt === S.wishTab));
    const rows = S.wishTab === 'buy' ? buy : S.wishTab === 'someday' ? someday : [...buy, ...someday];
    if (!rows.length) {
      $('#wishList').innerHTML = S.wishTab === 'buy'
        ? empty('🛒', 'Your buy list is empty', 'Open any game and set a priority (Really want, Normal or Maybe). It shows up here with the best price in India.', '<button class="btn primary" data-nav="games">Browse games</button>')
        : empty('♡', 'Nothing here yet', 'Tap the heart on any game card to add it to your wishlist.', '<button class="btn primary" data-nav="games">Browse games</button>');
      return;
    }
    let run = 0;
    $('#wishList').innerHTML = `<div class="table-wrap"><table class="data"><thead><tr><th></th><th>Game</th><th>Priority</th><th>Players</th><th class="num">List ₹</th><th class="num">Best in India</th><th>Where</th><th class="num">Running total</th><th></th></tr></thead><tbody>
      ${rows.map(g => { const m = my(g); run += +bestPrice(g) || 0;
        return `<tr class="clickable" data-g="${esc(g.name)}"><td class="thumb">${artHTML(g)}</td>
        <td><b>${esc(g.name)}</b><div class="muted small">${esc(g.genre || '')}${m.interest_since ? ' · added ' + fmtDate(m.interest_since) : ''}</div></td>
        <td><select class="inline" data-set="interest" data-id="${esc(g.id)}" aria-label="Priority for ${esc(g.name)}">${['', ...PRIORITY].map(p => `<option value="${p}" ${p === (m.interest || '') ? 'selected' : ''}>${p || 'Someday'}</option>`).join('')}</select></td>
        <td>${g.players || '?'}</td><td class="num">${inr(g.price)}</td><td class="num"><b>${g.best ? inr(g.best.price) : '—'}</b></td>
        <td>${g.best ? `<a href="${esc(g.best.url)}" target="_blank" rel="noopener">${esc(g.best.store)} ↗</a>` : g.buyLink ? `<a href="${esc(g.buyLink)}" target="_blank" rel="noopener">${esc(g.store)} ↗</a>` : '<span class="muted">—</span>'}</td>
        <td class="num muted">${inr(run)}</td>
        <td class="actions"><button class="btn xs" data-quick="Owned" data-id="${esc(g.id)}" title="I bought it">Bought</button><button class="icon-btn" data-quick="remove" data-id="${esc(g.id)}" title="Remove from wishlist" aria-label="Remove">✕</button></td></tr>`; }).join('')}
      </tbody></table></div>`;
  }

  /* ------------------------------------------------------------ shelf */
  const authTag = (a) => a === 'VERIFIED ORIGINAL' ? '<span class="auth-tag orig">Original</span>' : a === 'SUSPECTED COUNTERFEIT' ? '<span class="auth-tag fake">Counterfeit</span>' : a === 'UNKNOWN' ? '<span class="auth-tag">Unknown</span>' : '<span class="muted">—</span>';
  function shelfRows() {
    let list = S.games.filter(onShelf);
    if (S.shelfTab !== 'all') list = list.filter(g => statusOf(g) === S.shelfTab);
    const q = norm($('#shelfQ').value);
    if (q) list = list.filter(g => q.split(' ').every(w => g.hay.includes(w)));
    const k = $('#shelfSort').value;
    const by = { name: (a, b) => a.name.localeCompare(b.name), rating: (a, b) => (my(b).rating || 0) - (my(a).rating || 0),
      plays: (a, b) => (my(b).plays || 0) - (my(a).plays || 0), paid: (a, b) => (my(b).price_paid || 0) - (my(a).price_paid || 0),
      recent: (a, b) => (Date.parse(my(b).updated_at) || 0) - (Date.parse(my(a).updated_at) || 0) }[k];
    return list.sort(by);
  }
  function renderShelf() {
    if (!authed()) return;
    const all = S.games.filter(onShelf);
    const paid = all.filter(g => my(g).price_paid != null);
    const spent = sum(paid.map(g => my(g).price_paid));
    const saved = sum(paid.filter(g => g.price).map(g => g.price - my(g).price_paid));
    $('#shelfTotals').innerHTML = tile(all.filter(isOwned).length, 'Owned', 'green') + tile(all.filter(onWay).length, 'On the way', 'amber')
      + tile(inr(spent), 'Spent') + tile(inr(saved), 'Saved vs list', 'green') + tile(sum(all.map(g => my(g).plays)), 'Plays')
      + tile(`${all.filter(g => my(g).authenticity === 'VERIFIED ORIGINAL').length} / ${all.filter(g => my(g).authenticity === 'SUSPECTED COUNTERFEIT').length}`, 'Original / counterfeit');
    $$('#shelfTabs button').forEach(b => b.classList.toggle('on', b.dataset.st === S.shelfTab));
    const list = shelfRows();
    if (!all.length) {
      $('#shelfList').innerHTML = empty('📦', 'Your shelf is empty', 'Open a game and set its status to Owned, On the way or DIY. Add what you paid, the edition and your rating.', '<button class="btn primary" data-nav="games">Find a game</button>');
      return;
    }
    $('#shelfList').innerHTML = list.length ? `<div class="table-wrap"><table class="data"><thead><tr><th></th><th>Game</th><th>Status</th><th>Edition</th><th>Copy</th><th class="num">Paid</th><th class="num">List</th><th class="num">Saved</th><th class="num">Rating</th><th class="num">Plays</th></tr></thead><tbody>
      ${list.map(g => { const m = my(g); const sv = m.price_paid != null && g.price ? g.price - m.price_paid : null;
        return `<tr class="clickable" data-g="${esc(g.name)}"><td class="thumb">${artHTML(g)}</td><td><b>${esc(g.name)}</b><div class="muted small">${g.players ? g.players + ' players' : ''}${g.time ? ' · ' + g.time + ' min' : ''}</div></td>
        <td><span class="st-dot ${statusOf(g) === 'On the way' ? 'way' : ''}">${esc(statusOf(g))}</span></td><td>${esc((m.edition || '').replace(g.name + ': ', '')) || '<span class="muted">Standard</span>'}</td><td>${authTag(m.authenticity)}</td>
        <td class="num">${inr(m.price_paid)}</td><td class="num muted">${inr(g.price)}</td><td class="num ${sv > 0 ? 'save-pos' : sv < 0 ? 'save-neg' : ''}">${sv == null ? '—' : inr(sv)}</td>
        <td class="num">${m.rating != null ? `<b>${m.rating}</b>/10` : '—'}</td>
        <td class="num"><span class="plays"><button class="icon-btn" data-plays="-1" data-id="${esc(g.id)}" aria-label="One less play">−</button><b>${m.plays || 0}</b><button class="icon-btn" data-plays="1" data-id="${esc(g.id)}" aria-label="Log a play">+</button></span></td></tr>`; }).join('')}
      </tbody></table></div>` : empty('🔎', 'No matches', 'Nothing on your shelf matches that filter.');
  }
  function exportShelf() {
    const rows = [['Game', 'Status', 'Priority', 'Edition', 'Authenticity', 'Price paid', 'List price', 'Rating', 'Plays', 'Notes', 'BGG']];
    S.games.filter(g => S.items[g.id]).forEach(g => { const m = my(g); rows.push([g.name, m.status || '', m.interest || '', m.edition || '', m.authenticity || '', m.price_paid ?? '', g.price ?? '', m.rating ?? '', m.plays || 0, m.notes || '', g.bggLink || '']); });
    const csv = rows.map(r => r.map(c => /[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `game-shelf-${S.me.username}.csv` });
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ------------------------------------------------------------ game detail */
  function openGame(name) {
    const g = S.byName[name];
    if (!g) return;
    const d = $('#detail');
    const q = encodeURIComponent(g.name.replace(/\(.*?\)/g, '').trim());
    const storeLinks = (S.catalog.stores || []).map(s => `<a href="${esc(s.search ? s.search.replace('{q}', q) : s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join('');
    const priced = (g.fakes || []).slice().sort((a, b) => (a.price || 1e9) - (b.price || 1e9));
    const fakeRows = priced.map(f => {
      const st = f.status ? `<span class="st" title="${esc(f.note || '')}">${esc(f.status === 'catalogue' ? 'Catalogue price' : f.status)}</span>` : `<span class="st ${f.inStock ? 'in' : ''}">${f.inStock ? 'In stock' : 'Out of stock'}</span>`;
      const inner = `<span><b>${esc(f.store)}</b><br><span class="st">${esc(f.listing || '')}${f.note && f.store === 'Funkky' ? ' · ' + esc(f.note.replace('Funkky catalogue ', '')) : ''}</span></span>${st}<b>${inr(f.price)}</b>`;
      return f.url ? `<a class="offer fake" href="${esc(f.url)}" target="_blank" rel="noopener nofollow">${inner}</a>` : `<div class="offer fake">${inner}</div>`;
    }).join('');
    const pricedStores = new Set(priced.map(f => norm(f.store)));
    const fakeLinks = (S.catalog.counterfeit || []).filter(s => !pricedStores.has(norm(s.name)) && (s.url || s.search))
      .map(s => `<a href="${esc((s.search || s.url).replace('{q}', q))}" target="_blank" rel="noopener nofollow">Search ${esc(s.name)}</a>`).join('');
    const xs = g.extras || [];
    const xLink = (x) => {
      const buy = x.buy || (x.type === 'Accessory' ? 'https://www.amazon.in/s?k=' + encodeURIComponent(g.name + ' ' + x.name) : '');
      const bgg = x.bgg || 'https://boardgamegeek.com/geeksearch.php?action=search&objecttype=' + (x.type === 'Expansion' ? 'boardgameexpansion' : 'boardgame') + '&q=' + encodeURIComponent(x.name);
      return `<div class="xrow"><span class="xname">${esc(x.name.replace(g.name + ': ', ''))}${x.note ? `<small>${esc(x.note)}</small>` : ''}</span>
        <span class="xlinks">${x.price ? `<b>${inr(x.price)}</b>` : ''}${buy ? `<a href="${esc(buy)}" target="_blank" rel="noopener">${esc(x.store || (x.type === 'Accessory' ? 'Find on Amazon' : 'Buy'))} ↗</a>` : ''}
        ${x.type !== 'Accessory' || x.bgg ? `<a href="${esc(bgg)}" target="_blank" rel="noopener">BGG ↗</a>` : ''}</span></div>`;
    };
    const xsec = (type, title, hint) => { const list = xs.filter(x => x.type === type); return list.length ? `<div class="dsec"><h3>${title} <span class="count">${list.length}</span></h3>${hint ? `<p class="muted small">${hint}</p>` : ''}<div class="xlist">${list.map(xLink).join('')}</div></div>` : ''; };
    const ordered = (g.offers || []).slice().sort((a, b) => (a === g.best ? -1 : b === g.best ? 1 : 0) || (a.variant - b.variant) || ((a.price || 1e9) - (b.price || 1e9)));
    const offers = ordered.map(o => `<a class="offer ${o === g.best ? 'best' : ''}" href="${esc(o.url)}" target="_blank" rel="noopener">
      <span><b>${esc(o.store)}</b>${o === g.best ? ' <span class="st in">· best price</span>' : ''}<br><span class="st">${esc(o.listing)}${o.variant ? ' · <i>different edition / variant</i>' : ''}</span></span>
      <span class="st ${/in stock/i.test(o.status) ? 'in' : ''}">${esc(o.status || '')}</span><b>${inr(o.price)}</b></a>`).join('');
    const sheetLink = g.buyLink ? `<a class="offer" href="${esc(g.buyLink)}" target="_blank" rel="noopener"><span><b>${esc(g.store || 'Saved link')}</b><br><span class="st">Saved store link</span></span><span class="st">list price</span><b>${inr(g.price)}</b></a>` : '';
    const fact = (k, v) => v ? `<div class="fact"><div class="k">${k}</div><div class="v">${v}</div></div>` : '';
    const typeKeys = new Set(g.types.map(norm)), seen = new Set();
    const tags = [...(g.tags || []), ...(g.mechanics || [])].filter(t => { const k = norm(t); if (typeKeys.has(k) || seen.has(k)) return false; seen.add(k); return true; });
    d.innerHTML = `<button class="close" aria-label="Close">✕</button>
      <div class="dwrap">
        <div class="dart"><div class="dimg">${artHTML(g, true)}</div>
          <div class="cats">${[...g.cats].map(c => `<span class="cat ${c}">${c}</span>`).join('')}</div>
          ${quickHTML(g)}
          ${g.bggLink ? `<a href="${esc(g.bggLink)}" target="_blank" rel="noopener" class="btn ghost block">BoardGameGeek ↗</a>` : ''}
          <button class="btn ghost block" data-share="${esc(g.name)}">Share link</button>
        </div>
        <div class="dmain">
          <h2>${esc(g.name)}</h2>
          <div class="muted">${esc(g.genre || '')}${g.year ? ' · ' + g.year : ''}${g.designers && g.designers.length ? ' · by ' + esc(g.designers.slice(0, 3).join(', ')) : ''}</div>
          <div class="facts">
            ${fact('Players', g.players)}${fact('Best at', g.bestPlayers)}${fact('Time', g.time ? g.time + ' min' : '')}
            ${fact('Age', g.age ? g.age + '+' : '')}${fact('Weight', g.weight ? (+g.weight).toFixed(2) + ' · ' + g.cx : '')}
            ${fact('BGG rating', g.bggRating ? (+g.bggRating).toFixed(2) : '')}${fact('BGG rank', g.bggRank ? '#' + g.bggRank : '')}
          </div>
          <div class="taglist">${g.types.map(t => `<button class="chip on" data-t="${esc(t)}">${esc(t)}</button>`).join('')}${tags.map(t => `<button class="chip" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div>
          ${g.description ? `<div class="desc">${esc(g.description)}${g.descriptionCut ? '…' : ''}</div>` : ''}
          ${g.bggId ? `<div class="bggcredit">${bggBadge()}<span>Game details, art and ratings from <a href="${esc(g.bggLink)}" target="_blank" rel="noopener">BoardGameGeek</a>${g.descriptionCut ? ` · <a href="${esc(g.bggLink)}" target="_blank" rel="noopener">full description ↗</a>` : ''}</span></div>` : ''}
          ${mineHTML(g)}
          <div class="dsec"><h3>Buy in India</h3>
            <div class="offers">${offers}${sheetLink}${!offers && !sheetLink ? '<div class="muted">No live listing found. Try the stores below.</div>' : ''}</div></div>
          ${xsec('Expansion', 'Expansions', 'These need the base game. Standalone spin-offs have their own cards.')}
          ${xsec('Edition', 'Editions', 'Mark which one you own under My copy → Edition.')}
          ${xsec('Accessory', 'Accessories & upgrades', '')}
          <div class="dsec"><h3>Search the stores</h3>
            <div class="storelinks"><a class="bgf" href="https://www.bgfindertool.com/" target="_blank" rel="noopener" data-copy="${esc(g.name)}">Compare on BGFinder ↗</a>${storeLinks}</div></div>
          ${fakeRows || fakeLinks ? `<div class="dsec"><details class="fakebox"${fakeRows ? ' open' : ''}><summary>Counterfeit / budget copies${priced.some(f => f.price) ? ` · from ${inr(Math.min(...priced.filter(f => f.price).map(f => f.price)))}` : ''}</summary>
            <p>These sellers mostly stock unlicensed copies. They're cheaper, but the components are often worse and the designers aren't paid.</p>
            ${fakeRows ? `<div class="offers">${fakeRows}</div>` : ''}${fakeLinks ? `<div class="storelinks" style="margin-top:8px">${fakeLinks}</div>` : ''}</details></div>` : ''}
        </div>
      </div>`;
    d.querySelector('.close').onclick = () => d.close();
    const full = d.querySelector('img[data-full]');
    if (full) { const im = new Image(); im.referrerPolicy = 'no-referrer'; im.onload = () => { full.src = im.src; }; im.src = full.dataset.full; }
    wireMine(d, g);
    if (!d.open) d.showModal();
    d.querySelector('.dwrap').scrollTop = 0;
    // A history entry per opened game, so the phone's Back button closes the popup.
    const h = '#game=' + encodeURIComponent(g.name);
    if (location.hash === h) {} else if (location.hash.startsWith('#game=')) history.replaceState(null, '', h); else history.pushState({ game: g.name }, '', h);
  }

  function quickHTML(g) {
    if (!authed()) return sb ? `<button class="btn primary block" data-auth="signin">Sign in to track this game</button>` : '';
    const st = statusOf(g);
    const b = (v, label) => `<button class="qbtn ${st === v ? 'on' : ''}" data-qs="${v}" data-id="${esc(g.id)}">${label}</button>`;
    return `<div class="quick" role="group" aria-label="My status">${b('Owned', '✓ Owned')}${b('On the way', '🚚 On the way')}${b('Wishlist', '♥ Wishlist')}${b('DIY', '✂ DIY')}</div>`;
  }

  function mineHTML(g) {
    if (!authed()) return sb ? `<div class="dsec signin-nudge"><b>Track this game</b><span>Sign in to mark it owned, record what you paid, rate it and add it to your buy list.</span><button class="btn sm" data-auth="signup">Create a free account</button></div>` : '';
    const m = my(g);
    const opt = (list, v) => list.map(x => `<option value="${esc(x[0])}" ${x[0] === (v || '') ? 'selected' : ''}>${esc(x[1])}</option>`).join('');
    const r = +m.rating || 0;
    const edId = 'ed-' + String(g.id).replace(/\W/g, '');
    return `<div class="dsec"><h3>My copy <span class="muted save-state" aria-live="polite"></span></h3>
      <form class="mine" data-id="${esc(g.id)}">
        <label>Status<select name="status">${opt([['', 'Not on my shelf'], ['Wishlist', 'Wishlist'], ['On the way', 'On the way'], ['Owned', 'Owned'], ['DIY', 'DIY']], m.status)}</select></label>
        <label>Buy priority<select name="interest">${opt([['', '—'], ...PRIORITY.map(p => [p, p])], m.interest)}</select></label>
        <label>Authenticity<select name="authenticity">${opt([['', '—'], ['VERIFIED ORIGINAL', 'Verified original'], ['SUSPECTED COUNTERFEIT', 'Suspected counterfeit'], ['UNKNOWN', 'Unknown']], m.authenticity)}</select></label>
        <label>Edition<input name="edition" list="${edId}" placeholder="Standard" maxlength="80" value="${esc(m.edition || '')}">
          <datalist id="${edId}"><option value="Standard / retail">${(g.extras || []).filter(x => x.type === 'Edition').map(x => `<option value="${esc(x.name)}">`).join('')}<option value="Kickstarter / deluxe"><option value="Limited edition"></datalist></label>
        <label>Price paid ₹<input name="price_paid" type="number" min="0" inputmode="numeric" value="${m.price_paid == null ? '' : m.price_paid}"></label>
        <label>Bought on<input name="acquired_on" type="date" value="${esc(m.acquired_on || '')}"></label>
        <label>Times played<span class="plays big"><button type="button" class="icon-btn" data-step-plays="-1" aria-label="One less">−</button><input name="plays" type="number" min="0" value="${m.plays || 0}"><button type="button" class="icon-btn" data-step-plays="1" aria-label="One more">+</button></span></label>
        <label class="rate">My rating<div class="stars" data-r="${r}">${Array.from({ length: 10 }, (_, i) => `<button type="button" data-v="${i + 1}" class="${i < r ? 'on' : ''}" aria-label="${i + 1} out of 10">★</button>`).join('')}<span class="rv">${r ? r + '/10' : ''}</span></div><input name="rating" type="hidden" value="${m.rating == null ? '' : m.rating}"></label>
        <label class="wide">Notes<textarea name="notes" maxlength="1000" placeholder="House rules, who you play with, what to buy next…">${esc(m.notes || '')}</textarea></label>
      </form></div>`;
  }

  /* ------------------------------------------------------------ saving personal data */
  const FIELDS = ['status', 'interest', 'authenticity', 'price_paid', 'rating', 'plays', 'notes', 'edition', 'acquired_on'];
  const saveQueue = {};
  async function saveMine(id, fields, opts = {}) {
    if (!authed()) { openAuth('signin'); return; }
    const before = Object.assign({}, S.items[id] || {});
    const next = Object.assign({}, before, fields);
    if (fields.interest && !next.status) next.status = 'Wishlist';
    if ('status' in fields && OWNEDISH.concat('On the way').includes(fields.status)) next.interest = null;
    const emptyRow = !next.status && !next.interest && FIELDS.filter(k => !['status', 'interest', 'plays'].includes(k)).every(k => next[k] == null || next[k] === '') && !next.plays;
    S.items[id] = emptyRow ? undefined : next;
    if (emptyRow) delete S.items[id];
    renderAll(true);
    const stEl = $('#detail[open] .save-state');
    if (stEl) stEl.textContent = '· saving…';
    try {
      if (emptyRow) {
        const { error } = await sb.from('user_games').delete().eq('game_id', id);
        if (error) throw error;
      } else {
        const row = { user_id: S.session.user.id, game_id: id };
        FIELDS.forEach(k => { if (k in next) row[k] = next[k] === '' ? null : next[k]; });
        const { data, error } = await sb.from('user_games').upsert(row, { onConflict: 'user_id,game_id' }).select().single();
        if (error) throw error;
        S.items[id] = data;
      }
      if (stEl) stEl.textContent = '· saved ✓';
      if (opts.toast) toast(opts.toast);
      renderAll(true);
    } catch (e) {
      if (before && Object.keys(before).length) S.items[id] = before; else delete S.items[id];
      if (stEl) stEl.textContent = '· not saved';
      toast('Not saved: ' + (e.message || e), true);
      renderAll(true);
    }
  }
  function queueSave(id, name, value) {
    const q = saveQueue[id] = saveQueue[id] || { fields: {} };
    q.fields[name] = value;
    clearTimeout(q.t);
    q.t = setTimeout(() => { const f = q.fields; delete saveQueue[id]; saveMine(id, f); }, 500);
  }
  function wireMine(root, g) {
    const form = root.querySelector('form.mine');
    if (!form) return;
    const val = (el) => el.type === 'number' ? (el.value === '' ? null : +el.value) : (el.value || null);
    form.addEventListener('change', e => { const el = e.target; if (el.name) queueSave(g.id, el.name, val(el)); });
    form.addEventListener('input', e => { const el = e.target; if (el.name === 'notes' || el.name === 'edition') queueSave(g.id, el.name, val(el)); });
    form.querySelectorAll('[data-step-plays]').forEach(b => b.addEventListener('click', () => {
      const inp = form.elements.plays; inp.value = Math.max(0, (+inp.value || 0) + +b.dataset.stepPlays); queueSave(g.id, 'plays', +inp.value);
    }));
    form.querySelectorAll('.stars button').forEach(b => b.addEventListener('click', () => {
      const v = +b.dataset.v, cur = +form.elements.rating.value || 0, nv = cur === v ? null : v;
      form.elements.rating.value = nv == null ? '' : nv;
      form.querySelectorAll('.stars button').forEach(x => x.classList.toggle('on', +x.dataset.v <= (nv || 0)));
      form.querySelector('.rv').textContent = nv ? nv + '/10' : '';
      queueSave(g.id, 'rating', nv);
    }));
  }
  function setQuickStatus(id, st) {
    const cur = (S.items[id] || {}).status;
    const g = S.byId[id];
    const nv = cur === st ? null : st;
    saveMine(id, { status: nv }, { toast: nv ? `${g.name}: ${nv}` : `${g.name} removed from your ${cur === 'Wishlist' ? 'wishlist' : 'shelf'}` });
    if ($('#detail').open) setTimeout(() => openGame(g.name), 0);
  }

  /* ------------------------------------------------------------ account */
  function renderAccount() {
    if (!authed()) return;
    const me = S.me, u = S.session.user;
    const provider = (u.app_metadata && u.app_metadata.provider) || 'email';
    const hasPw = (u.identities || []).some(i => i.provider === 'email') || provider === 'email';
    $('#accProfile').innerHTML = `<h2>Profile</h2>
      <div class="acc-id"><span class="avatar xl">${avatarHTML()}</span><div><b>${esc(me.display_name || '')}</b><span class="muted">@${esc(me.username)}</span><span class="muted small">Member since ${fmtDate(me.created_at)}</span></div></div>
      <form id="accForm" class="stack-form">
        <label>Display name<input name="name" required minlength="2" maxlength="40" value="${esc(me.display_name || '')}"></label>
        <label>Username<span class="uname"><span>@</span><input name="username" required pattern="[a-z0-9_]{3,20}" maxlength="20" value="${esc(me.username)}"></span><small class="hint" id="accHint"></small></label>
        <label>Usual number of players <span class="opt">optional</span><input name="fav" type="number" min="1" max="20" value="${me.favourite_count || ''}"></label>
        <div class="form-actions"><button class="btn primary" type="submit">Save profile</button><span class="muted" id="accMsg"></span></div>
      </form>`;
    $('#accSecurity').innerHTML = `<h2>Sign-in &amp; security</h2>
      <dl class="kv"><dt>Email</dt><dd>${esc(u.email)}</dd><dt>Signed in with</dt><dd>${provider === 'google' ? 'Google' : 'Email and password'}${(u.identities || []).length > 1 ? ' (+ ' + (u.identities.length - 1) + ' more)' : ''}</dd><dt>Last sign-in</dt><dd>${fmtDate(u.last_sign_in_at)}</dd></dl>
      ${hasPw ? `<form id="pwChange" class="stack-form"><label>New password<input name="password" type="password" minlength="8" autocomplete="new-password" required></label><div class="form-actions"><button class="btn" type="submit">Change password</button><span class="muted" id="pwcMsg"></span></div></form>`
        : '<p class="muted">You sign in with Google, so there is no password to manage here.</p>'}
      <form id="emailChange" class="stack-form"><label>Change email<input name="email" type="email" autocomplete="email" placeholder="new@example.com" required></label><div class="form-actions"><button class="btn" type="submit">Send confirmation</button><span class="muted" id="emcMsg"></span></div></form>
      <div class="danger"><button class="btn" id="exportAll">Download my data (CSV)</button><button class="btn" id="signoutAll">Sign out on all devices</button></div>`;
    if (isAdmin()) {
      $('#accAdmin').innerHTML = `<h2>Owner tools</h2>
        <div class="form-actions wrap"><button class="btn" id="jobRefresh">↻ Refresh prices &amp; BGG data</button><button class="btn" id="jobMirror">⇄ Copy my data to the Google Sheet</button><a class="btn" href="#add" data-nav="add">＋ Add a game</a></div>
        <p class="muted small" id="jobMsg">These also run automatically every night at 4 am.</p>
        <h3 class="sub">Members</h3><div id="members" class="muted">Loading…</div>`;
      sb.rpc('admin_members').then(({ data, error }) => {
        $('#members').innerHTML = error ? esc(error.message) : `<div class="table-wrap"><table class="data compact"><thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Joined</th><th>Last seen</th><th class="num">Owned</th><th class="num">Wishlist</th><th>Via</th></tr></thead><tbody>
          ${data.map(m => `<tr><td>${esc(m.display_name || '')}</td><td>${m.username ? '@' + esc(m.username) : '<span class="muted">not finished</span>'}</td><td>${esc(m.email)}</td><td>${fmtDate(m.joined)}</td><td>${fmtDate(m.last_seen)}</td><td class="num">${m.owned}</td><td class="num">${m.wishlist}</td><td>${esc(m.provider || '')}</td></tr>`).join('')}</tbody></table></div>`;
      });
    }
  }
  async function jobs(action, payload = {}) {
    if (!CFG.JOBS_URL) throw new Error('Jobs URL not configured');
    const res = await fetch(CFG.JOBS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action, token: S.session && S.session.access_token }, payload)) });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error);
    return j.data;
  }

  /* ------------------------------------------------------------ add a game (owner) */
  let addDetails = null;
  async function addSearch() {
    const q = $('#addQ').value.trim();
    if (!q) return;
    $('#addResults').innerHTML = '<div class="muted">Searching BoardGameGeek and the Indian stores…</div>';
    try {
      const hits = await jobs('bggSearch', { q });
      if (hits.length === 1 && /^BGG #/.test(hits[0].name)) { addPick(hits[0].id); return; }
      $('#addResults').innerHTML = hits.length ? hits.map(h => {
        const exists = S.games.find(g => String(g.bggId) === String(h.id) || g.nameKey === norm(h.name));
        return `<button class="add-hit ${exists ? 'exists' : ''}" data-id="${esc(h.id)}"><b>${esc(h.name)}</b><small>${h.year ? esc(String(h.year)) + ' · ' : ''}BGG #${esc(h.id)}</small>
          ${h.inIndia ? '<span class="india">● Sold in India</span>' : ''}${exists ? '<small>Already in the catalogue</small>' : ''}</button>`;
      }).join('') : '<div class="muted">No matches. Try another spelling or paste the BGG link.</div><button class="btn" id="manualAdd" style="margin-top:8px">Fill in by hand</button>';
    } catch (e) { $('#addResults').innerHTML = `<div class="muted">${esc(e.message)}</div><button class="btn" id="manualAdd" style="margin-top:8px">Fill in by hand</button>`; }
  }
  async function addPick(id) {
    $('#addMsg').textContent = '';
    $('#addResults').innerHTML = '<div class="muted">Fetching details from BoardGameGeek…</div>';
    try {
      const d = await jobs('bggDetails', { id });
      addDetails = d;
      const f = $('#addForm'), s = d.suggest || {};
      const set = (n, v) => { if (f.elements[n]) f.elements[n].value = v == null ? '' : v; };
      set('name', d.name); set('category', s.category); set('alsoIn', s.alsoIn); set('minP', d.minP); set('maxP', d.maxP);
      set('minT', d.minT); set('maxT', d.maxT); set('age', d.age); set('weight', d.weight); set('genre', s.genre);
      set('tags', s.tags); set('status', ''); set('interest', ''); set('price', s.price); set('buyLink', s.buyLink); set('bggId', d.id);
      $('#addPreview').innerHTML = `${d.image || d.thumb ? `<img src="${esc(d.image || d.thumb)}" alt="" referrerpolicy="no-referrer">` : ''}
        <div><b>${esc(d.name)}</b> <span class="muted">${esc(String(d.year || ''))}</span><br>
        <span class="muted">★ ${d.rating || '–'} · rank #${d.rank || '–'} · weight ${d.weight || '–'}</span><br>
        <span class="muted">${(d.offers || []).length ? `${d.offers.length} Indian listing(s). The cheapest in-stock one is filled in below.` : 'No Indian store listing found on BGFinder.'}</span></div>`;
      f.hidden = false; $('#addResults').innerHTML = '';
      f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) { $('#addResults').innerHTML = `<div class="muted">${esc(e.message)}</div>`; }
  }
  async function addSave(ev) {
    ev.preventDefault();
    const f = ev.target, v = Object.fromEntries(new FormData(f).entries());
    const n = (x) => x === '' || x == null || isNaN(+x) ? null : +x;
    const btn = f.querySelector('button[type=submit]');
    btn.disabled = true; $('#addMsg').textContent = 'Saving…';
    try {
      const bggId = String(v.bggId || '').replace(/\D/g, '') || null;
      const { data: game, error } = await sb.from('games').insert({
        name: v.name.trim(), category: v.category, also_in: String(v.alsoIn || '').split(/[,/]/).map(s => s.trim()).filter(s => ['Boards', 'Cards', 'Duels'].includes(s)),
        min_players: n(v.minP), max_players: n(v.maxP), min_time: n(v.minT), max_time: n(v.maxT), age: n(v.age), weight: n(v.weight),
        genre: v.genre || null, tags: String(v.tags || '').split(',').map(s => s.trim()).filter(Boolean),
        list_price: n(v.price), buy_link: v.buyLink || null, bgg_id: bggId ? +bggId : null }).select().single();
      if (error) throw new Error(/duplicate/.test(error.message) ? v.name + ' is already in the catalogue' : error.message);
      const d = addDetails && String(addDetails.id) === bggId ? addDetails : null;
      if (d) {
        await sb.from('bgg').upsert({ bgg_id: +d.id, name: d.name, year: d.year, image: d.image, thumb: d.thumb, rating: d.rating, rank: d.rank, weight: d.weight,
          best_players: d.bestPlayers, mechanics: d.mechanics, categories: d.categories, designers: d.designers, description: d.description, source: 'bgg' }, { onConflict: 'bgg_id' });
      }
      if (v.status || v.interest) await sb.from('user_games').upsert({ user_id: S.session.user.id, game_id: game.id, status: v.status || null, interest: v.interest || null }, { onConflict: 'user_id,game_id' });
      toast(`Added ${game.name} ✓`);
      f.reset(); f.hidden = true; addDetails = null; $('#addQ').value = ''; $('#addMsg').textContent = '';
      await Promise.all([loadCatalog(true), loadItems()]);
      renderAll();
    } catch (e) { $('#addMsg').textContent = e.message; }
    btn.disabled = false;
  }

  /* ------------------------------------------------------------ auth */
  let authMode = 'signin';
  function openAuth(mode) {
    if (!sb) { toast('Accounts are not set up yet', true); return; }
    authMode = mode || 'signin';
    const d = $('#auth'), f = $('#authForm');
    d.classList.toggle('signup', authMode === 'signup');
    $$('#authTabs button').forEach(b => b.classList.toggle('on', b.dataset.am === authMode));
    $('#authTitle').textContent = authMode === 'signup' ? 'Create your account' : 'Welcome back';
    $('#authLede').textContent = authMode === 'signup' ? 'Free and private. We\'ll email you a link to confirm your address.' : 'Sign in to see your shelf and wishlist.';
    $('#authSubmit').textContent = authMode === 'signup' ? 'Create account' : 'Sign in';
    f.elements.password.autocomplete = authMode === 'signup' ? 'new-password' : 'current-password';
    $$('#authForm .su input').forEach(i => { i.required = authMode === 'signup'; });
    $('#authMsg').textContent = ''; $('#authMsg').className = 'auth-msg';
    $('#authDone').hidden = true; $('.auth-main').hidden = false;
    if (!d.open) d.showModal();
    renderGoogleButton();
    setTimeout(() => (authMode === 'signup' ? f.elements.name : f.elements.email).focus(), 30);
  }
  function authMsg(text, ok) { const el = $('#authMsg'); el.textContent = text; el.className = 'auth-msg' + (ok ? ' ok' : ''); }
  function friendly(e) {
    const m = String(e && e.message || e);
    if (/invalid login credentials/i.test(m)) return 'That email and password don\'t match. Try again or reset your password.';
    if (/email not confirmed/i.test(m)) return 'Please confirm your email first. We can send the link again.';
    if (/already registered|already been registered/i.test(m)) return 'An account with this email already exists. Sign in instead.';
    if (/rate limit|too many/i.test(m)) return 'Too many attempts. Please wait a minute and try again.';
    if (/password/i.test(m) && /least|short|weak/i.test(m)) return 'Choose a stronger password: at least 8 characters.';
    return m;
  }
  function showDone(icon, title, html) {
    $('.auth-main').hidden = true;
    const el = $('#authDone');
    el.innerHTML = `<div class="done-icon">${icon}</div><h2>${title}</h2>${html}`;
    el.hidden = false;
  }
  async function submitAuth(e) {
    e.preventDefault();
    const f = e.target, v = Object.fromEntries(new FormData(f).entries());
    const btn = $('#authSubmit');
    if (authMode === 'signup') {
      v.username = String(v.username || '').trim().toLowerCase();
      if (!f.reportValidity()) return;
      if (!(await usernameFree(v.username))) { authMsg('That username is taken. Try another.'); return; }
    } else if (!v.email || !v.password) { f.reportValidity(); return; }
    btn.disabled = true; authMsg(authMode === 'signup' ? 'Creating your account…' : 'Signing in…', true);
    try {
      if (authMode === 'signup') {
        const { data, error } = await sb.auth.signUp({ email: v.email.trim(), password: v.password,
          options: { emailRedirectTo: SITE_URL, data: { display_name: v.name.trim(), username: v.username } } });
        if (error) throw error;
        if (data.user && data.user.identities && data.user.identities.length === 0) throw new Error('already registered');
        if (!data.session) {
          showDone('📬', 'Check your inbox', `<p>We sent a confirmation link to <b>${esc(v.email)}</b>. Click it to activate your account. You'll then get a welcome email with your details.</p>
            <p class="muted small">Can't find it? Check spam or promotions. The link is valid for 24 hours.</p>
            <div class="form-actions"><button class="btn" id="resendBtn" data-email="${esc(v.email)}">Send the link again</button><button class="btn ghost" data-close>Close</button></div><p class="auth-msg" id="resendMsg"></p>`);
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: v.email.trim(), password: v.password });
        if (error) throw error;
        $('#auth').close();
      }
    } catch (err) {
      authMsg(friendly(err));
      if (/confirm/i.test(err.message || '')) authMsg('Please confirm your email first. Check your inbox, or use "Forgot password?" to get a new link.');
    }
    btn.disabled = false;
  }
  async function forgot() {
    const email = $('#authForm').elements.email.value.trim();
    if (!email) { authMsg('Type your email above first, then press "Forgot password?" again.'); $('#authForm').elements.email.focus(); return; }
    authMsg('Sending…', true);
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL });
    if (error) { authMsg(friendly(error)); return; }
    showDone('🔑', 'Check your inbox', `<p>If an account exists for <b>${esc(email)}</b>, a link to choose a new password is on its way. It is valid for 1 hour.</p><div class="form-actions"><button class="btn ghost" data-close>Close</button></div>`);
  }
  let unameTimer;
  async function usernameFree(name) {
    if (!/^[a-z0-9_]{3,20}$/.test(name)) return false;
    const { data, error } = await sb.rpc('username_available', { name });
    return !error && data === true;
  }
  function watchUsername(input, hint, current) {
    input.addEventListener('input', () => {
      input.value = input.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      clearTimeout(unameTimer);
      const v = input.value;
      if (!v || v === current) { hint.textContent = ''; return; }
      if (!/^[a-z0-9_]{3,20}$/.test(v)) { hint.textContent = '3–20 letters, numbers or _'; hint.className = 'hint bad'; return; }
      hint.textContent = 'Checking…'; hint.className = 'hint';
      unameTimer = setTimeout(async () => { const ok = await usernameFree(v); if (input.value === v) { hint.textContent = ok ? '✓ Available' : '✕ Taken'; hint.className = 'hint ' + (ok ? 'good' : 'bad'); } }, 350);
    });
  }
  function pwMeter(input) {
    const bar = input.closest('label').querySelector('.meter i');
    if (!bar) return;
    input.addEventListener('input', () => {
      const v = input.value; let s = 0;
      if (v.length >= 8) s++; if (v.length >= 12) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
      bar.style.width = Math.min(100, s * 20) + '%'; bar.dataset.s = s;
    });
  }

  /* Google: its own button on this page, then the ID token goes straight to Supabase.
     Google then names this site (or "The Game Shelf") instead of the database's address. */
  let gsiReady = false;
  async function initGoogleButton() {
    if (!sb || !CFG.GOOGLE_CLIENT_ID) return;
    const wait = (n) => new Promise(r => { const t = setInterval(() => { if (window.google && google.accounts && google.accounts.id) { clearInterval(t); r(true); } else if (--n <= 0) { clearInterval(t); r(false); } }, 200); });
    if (!(await wait(40))) return;   // GIS blocked or offline: the redirect button stays
    const raw = Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
    const hashed = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))), b => b.toString(16).padStart(2, '0')).join('');
    google.accounts.id.initialize({
      client_id: CFG.GOOGLE_CLIENT_ID, nonce: hashed, ux_mode: 'popup', context: 'signin', itp_support: true, use_fedcm_for_button: true,
      callback: async (resp) => {
        authMsg('Signing in…', true);
        const { error } = await sb.auth.signInWithIdToken({ provider: 'google', token: resp.credential, nonce: raw });
        if (error) { authMsg(friendly(error)); return; }
        if ($('#auth').open) $('#auth').close();
      }
    });
    gsiReady = true;
    renderGoogleButton();
  }
  function renderGoogleButton() {
    if (!gsiReady) return;
    const el = $('#gsiBtn');
    const w = Math.max(240, Math.min(400, (el.parentElement.clientWidth || 360)));
    el.innerHTML = '';
    google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', shape: 'pill', text: authMode === 'signup' ? 'signup_with' : 'continue_with', width: w, logo_alignment: 'center' });
    $('#googleBtn').hidden = true;
  }

  async function onSession(session) {
    S.session = session;
    if (!session) {
      S.me = null; S.items = {}; applyAuthUI(); renderAll();
      if (pendingView && pendingView !== 'add') openAuth('signin');
      return;
    }
    const { data: me, error } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
    if (error) { console.warn(error); toast('Could not load your profile: ' + error.message, true); return; }
    S.me = me;
    if (!me.username) { applyAuthUI(); showProfileSetup(); return; }
    await loadItems();
    applyAuthUI();
    renderAll();
    sb.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', me.id).then(() => {});
    if (pendingView) { go(pendingView); pendingView = null; }
    openFromHash();
  }
  async function loadItems() {
    if (!S.session) return;
    const { data, error } = await sb.from('user_games').select('*');
    if (error) { toast('Could not load your shelf: ' + error.message, true); return; }
    S.items = Object.fromEntries(data.map(r => [r.game_id, r]));
  }
  function avatarHTML() {
    const pic = S.me && S.me.avatar_url;
    const name = (S.me && (S.me.display_name || S.me.username)) || (S.session && S.session.user.email) || '?';
    return pic ? `<img src="${esc(pic)}" alt="" referrerpolicy="no-referrer">` : esc(name.trim()[0] || '?').toUpperCase();
  }
  function applyAuthUI() {
    const a = authed();
    document.body.classList.toggle('authed', a);
    document.body.classList.toggle('admin', a && isAdmin());
    $('#signinBtn').hidden = !!S.session;
    $('#userChip').hidden = !S.session;
    if (!S.session) return;
    const full = (S.me && S.me.display_name) || S.session.user.email;
    $('#userAvatar').innerHTML = avatarHTML(); $('#umAvatar').innerHTML = avatarHTML();
    $('#userName').textContent = full.split(' ')[0];
    $('#umName').textContent = full;
    $('#umHandle').textContent = S.me && S.me.username ? '@' + S.me.username : S.session.user.email;
    $('#umRole').hidden = !isAdmin();
  }
  function showProfileSetup() {
    const d = $('#profileDlg'), f = $('#profileForm'), u = S.session.user;
    f.elements.name.value = (S.me && S.me.display_name) || '';
    f.elements.username.value = (u.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
    f.elements.username.dispatchEvent(new Event('input'));
    $('#profEmail').textContent = 'Signed in as ' + u.email;
    $('#profMsg').textContent = '';
    if ($('#auth').open) $('#auth').close();
    if (!d.open) d.showModal();
  }
  async function submitProfile(e) {
    e.preventDefault();
    const f = e.target, btn = f.querySelector('button[type=submit]');
    f.elements.username.value = f.elements.username.value.trim().toLowerCase();
    if (!f.reportValidity()) return;
    btn.disabled = true; $('#profMsg').textContent = 'Creating your shelf…'; $('#profMsg').className = 'auth-msg ok';
    const { error } = await sb.from('profiles').update({ display_name: f.elements.name.value.trim(), username: f.elements.username.value, favourite_count: +f.elements.fav.value || null }).eq('id', S.session.user.id);
    btn.disabled = false;
    if (error) { $('#profMsg').textContent = /duplicate|unique/i.test(error.message) ? 'That username is taken. Try another.' : error.message; $('#profMsg').className = 'auth-msg'; return; }
    $('#profileDlg').close();
    toast('Welcome to The Game Shelf 🎲 Check your inbox for your welcome email.');
    await onSession(S.session);
  }
  async function signOut(scope) {
    await sb.auth.signOut(scope ? { scope } : undefined);
    toast('Signed out');
    if (['wishlist', 'shelf', 'add', 'account'].includes(location.hash.slice(1))) go('home');
  }

  /* ------------------------------------------------------------ routing + events */
  const VIEWS = ['home', 'games', 'summary', 'wishlist', 'shelf', 'account', 'add'];
  let pendingView = null;
  function go(view) {
    if (view === 'buy') view = 'wishlist';
    if (!VIEWS.includes(view)) view = 'home';
    if (['wishlist', 'shelf', 'account'].includes(view) && !authed()) { if (sb && !S.session) openAuth('signin'); pendingView = view; view = 'home'; }
    if (view === 'add' && !isAdmin()) { pendingView = 'add'; view = 'home'; }
    $$('.view').forEach(v => v.hidden = v.id !== 'view-' + view);
    $$('#tabs a').forEach(a => a.classList.toggle('active', a.dataset.nav === view));
    renderView(view);
    if (location.hash.slice(1) !== view && !location.hash.startsWith('#game=')) history.replaceState(null, '', '#' + view);
    window.scrollTo({ top: 0 });
  }
  const currentView = () => { const v = $$('.view').find(x => !x.hidden); return v ? v.id.slice(5) : 'home'; };
  function renderView(v) {
    if (v === 'wishlist') renderWishlist();
    if (v === 'shelf') renderShelf();
    if (v === 'account') renderAccount();
  }
  function renderAll(keepDetail) {
    if (!S.games.length) return;
    renderShowcase(); renderHome(); renderChips(); renderGrid(); renderSummary();
    renderView(currentView());
    $('#navWish').textContent = authed() ? (S.games.filter(onBuyList).length || '') : '';
    $('#navShelf').textContent = authed() ? (S.games.filter(onShelf).length || '') : '';
    if (!keepDetail && $('#detail').open) { const m = location.hash.match(/^#game=(.*)$/); if (m) openGame(decodeURIComponent(m[1])); }
  }
  function openFromHash() {
    const m = location.hash.match(/^#game=(.*)$/);
    if (m && S.byName[decodeURIComponent(m[1])]) openGame(decodeURIComponent(m[1]));
  }
  function toast(msg, err) {
    const t = $('#toast');
    t.textContent = msg; t.className = 'toast' + (err ? ' err' : ''); t.hidden = false;
    clearTimeout(t._t); t._t = setTimeout(() => t.hidden = true, 3600);
  }
  function toggleUserMenu(open) {
    const menu = $('#userMenu'), btn = $('#userBtn');
    const show = open == null ? menu.hidden : open;
    menu.hidden = !show; btn.setAttribute('aria-expanded', String(show));
  }
  function resetFilters() {
    Object.assign(S.f, { q: '', players: null, time: '', weight: '', mine: '' }); S.f.cats.clear(); S.f.types.clear();
    ['#q', '#players', '#timeSel', '#weightSel', '#mineSel'].forEach(s => $(s).value = '');
    S.shown = PAGE; renderAll();
  }

  function wire() {
    let qt;
    const refilter = () => { S.shown = PAGE; renderAll(); };
    $('#q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { S.f.q = e.target.value; refilter(); }, 120); });
    $('#players').addEventListener('input', e => { S.f.players = +e.target.value || null; refilter(); });
    $$('[data-step]').forEach(b => b.addEventListener('click', () => { const n = Math.min(30, Math.max(0, (S.f.players || 0) + +b.dataset.step)); S.f.players = n || null; $('#players').value = n || ''; refilter(); }));
    $('#timeSel').onchange = e => { S.f.time = e.target.value; refilter(); };
    $('#weightSel').onchange = e => { S.f.weight = e.target.value; refilter(); };
    $('#mineSel').onchange = e => { S.f.mine = e.target.value; refilter(); };
    $('#sortSel').onchange = e => { S.f.sort = e.target.value; refilter(); };
    $('#clearAll').onclick = resetFilters;
    const phone = matchMedia('(max-width: 640px)');
    const fitTypes = () => { $('#typesBox').open = !phone.matches; };
    fitTypes(); phone.addEventListener('change', fitTypes);
    $('#moreBtn').onclick = () => { S.shown += PAGE * 2; renderGrid(); };
    new IntersectionObserver(es => { if (es[0].isIntersecting && !$('#moreBtn').hidden && !$('#view-games').hidden) { S.shown += PAGE; renderGrid(); } }, { rootMargin: '600px' }).observe($('#moreBtn'));
    $$('#viewMode button').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; localStorage.setItem('shelf_mode', S.mode); renderGrid(); });
    $$('#wishTabs button').forEach(b => b.onclick = () => { S.wishTab = b.dataset.wt; renderWishlist(); });
    $$('#shelfTabs button').forEach(b => b.onclick = () => { S.shelfTab = b.dataset.st; renderShelf(); });
    $('#shelfQ').addEventListener('input', () => renderShelf());
    $('#shelfSort').onchange = () => renderShelf();
    $('#exportShelf').onclick = exportShelf;

    document.addEventListener('change', e => {
      const el = e.target.closest('select[data-set]');
      if (el) saveMine(+el.dataset.id || el.dataset.id, { [el.dataset.set]: el.value || null });
    });
    document.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-g][tabindex], [data-heart]')) { e.preventDefault(); e.target.click(); }
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); go('games'); $('#q').focus(); }
      if (e.key === 'Escape') toggleUserMenu(false);
    });

    document.addEventListener('click', async e => {
      const el = e.target.closest('[data-auth],[data-close],[data-heart],[data-quick],[data-qs],[data-plays],[data-share],[data-v],[data-t],[data-g],[data-p],[data-w],[data-q],[data-time],[data-nav],[data-copy],[data-id],#manualAdd,#clearAll2,#resendBtn,#exportAll,#signoutAll,#jobRefresh,#jobMirror');
      if (!el) return;
      const inDetail = !!el.closest('#detail');
      const idOf = (x) => { const v = x.dataset.id || x.dataset.heart; return S.byId[v] ? v : +v; };
      if (el.dataset.auth) { e.preventDefault(); toggleUserMenu(false); openAuth(el.dataset.auth); return; }
      if (el.hasAttribute('data-close')) { el.closest('dialog').close(); return; }
      if (el.dataset.heart) { e.stopPropagation(); const id = idOf(el); const g = S.byId[id]; if (onShelf(g)) { openGame(g.name); return; } saveMine(id, onWishlist(g) ? { status: null, interest: null } : { status: 'Wishlist' }, { toast: onWishlist(g) ? `Removed ${g.name} from your wishlist` : `♥ ${g.name} added to your wishlist` }); return; }
      if (el.dataset.qs) { setQuickStatus(idOf(el), el.dataset.qs); return; }
      if (el.dataset.quick) { e.stopPropagation(); const id = idOf(el), g = S.byId[id]; if (el.dataset.quick === 'remove') saveMine(id, { status: null, interest: null }, { toast: `Removed ${g.name}` }); else saveMine(id, { status: el.dataset.quick, interest: null }, { toast: `🎉 ${g.name} moved to your shelf` }); return; }
      if (el.dataset.plays) { e.stopPropagation(); const id = idOf(el); saveMine(id, { plays: Math.max(0, ((S.items[id] || {}).plays || 0) + +el.dataset.plays) }); return; }
      if (el.dataset.share) { const url = SITE_URL + '#game=' + encodeURIComponent(el.dataset.share); if (navigator.share) navigator.share({ title: el.dataset.share, url }).catch(() => {}); else navigator.clipboard.writeText(url).then(() => toast('Link copied')); return; }
      if (el.matches('a[data-copy]')) { navigator.clipboard && navigator.clipboard.writeText(el.dataset.copy).then(() => toast('Name copied. Paste it into BGFinder\'s search.')).catch(() => {}); return; }
      if (el.id === 'clearAll2') { resetFilters(); return; }
      if (el.id === 'resendBtn') { const { error } = await sb.auth.resend({ type: 'signup', email: el.dataset.email, options: { emailRedirectTo: SITE_URL } }); $('#resendMsg').textContent = error ? friendly(error) : 'Sent again ✓'; $('#resendMsg').className = 'auth-msg' + (error ? '' : ' ok'); return; }
      if (el.id === 'exportAll') { exportShelf(); return; }
      if (el.id === 'signoutAll') { signOut('global'); return; }
      if (el.id === 'jobRefresh' || el.id === 'jobMirror') {
        el.disabled = true; $('#jobMsg').textContent = el.id === 'jobRefresh' ? 'Refreshing prices and BGG data. This takes a minute or two…' : 'Copying to the sheet…';
        try { const r = await jobs(el.id === 'jobRefresh' ? 'refresh' : 'mirror'); $('#jobMsg').textContent = 'Done ✓' + (r && r.rows ? ` (${r.rows} rows)` : ''); if (el.id === 'jobRefresh') loadCatalog(true); }
        catch (err) { $('#jobMsg').textContent = err.message; }
        el.disabled = false; return;
      }
      if (el.dataset.nav) { e.preventDefault(); toggleUserMenu(false); if (el.dataset.sort) { S.f.sort = el.dataset.sort; $('#sortSel').value = el.dataset.sort; } if (inDetail) { $('#detail')._nav = true; $('#detail').close(); } go(el.dataset.nav); return; }
      if (el.id === 'manualAdd') { addDetails = null; $('#addForm').reset(); $('#addForm').elements.name.value = $('#addQ').value; $('#addForm').hidden = false; $('#addPreview').innerHTML = ''; return; }
      if (el.classList.contains('add-hit')) { addPick(el.dataset.id); return; }
      if (el.classList.contains('catchip')) { const c = el.dataset.v; S.f.cats.has(c) ? S.f.cats.delete(c) : S.f.cats.add(c); S.shown = PAGE; renderAll(); return; }
      if (el.closest('.stars') || el.closest('form.mine')) return;
      const toGames = () => { if (inDetail) { $('#detail')._nav = true; $('#detail').close(); } go('games'); };
      if (el.dataset.t) { if (inDetail) S.f.types = new Set([el.dataset.t]); else S.f.types.has(el.dataset.t) ? S.f.types.delete(el.dataset.t) : S.f.types.add(el.dataset.t); S.shown = PAGE; toGames(); renderAll(); return; }
      if (el.dataset.p) { S.f.players = +el.dataset.p; $('#players').value = el.dataset.p; toGames(); renderAll(); return; }
      if (el.dataset.w) { S.f.weight = el.dataset.w; $('#weightSel').value = S.f.weight; toGames(); renderAll(); return; }
      if (el.dataset.time) { S.f.time = el.dataset.time; $('#timeSel').value = S.f.time; toGames(); renderAll(); return; }
      if (el.dataset.q) { S.f.q = el.dataset.q; $('#q').value = el.dataset.q; toGames(); renderAll(); return; }
      if (el.dataset.g && !el.closest('select') && !e.target.closest('a,select,button.icon-btn,.btn')) openGame(el.dataset.g);
    });

    const d = $('#detail');
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
    d.addEventListener('close', () => {
      const nav = d._nav; d._nav = false;
      if (!location.hash.startsWith('#game=')) return;
      if (!nav && history.state && history.state.game) history.back();   // X, Esc, backdrop: undo the game's history entry
      else history.replaceState(null, '', '#' + currentView());
    });
    ['#auth', '#pwDlg'].forEach(s => $(s).addEventListener('click', e => { if (e.target === $(s)) $(s).close(); }));
    window.addEventListener('hashchange', () => {
      const h = location.hash.slice(1);
      if (h.startsWith('game=')) { openFromHash(); return; }
      if ($('#detail').open) $('#detail').close();
      if ((VIEWS.includes(h) || h === 'buy') && h !== currentView()) go(h);
    });

    $('#signout').onclick = () => { toggleUserMenu(false); signOut(); };
    $('#userBtn').onclick = (e) => { e.stopPropagation(); toggleUserMenu(); };
    document.addEventListener('click', e => { if (!e.target.closest('#userChip') || e.target.closest('.um-links a')) toggleUserMenu(false); });
    wireShowcase();
    $('#homeSearch').addEventListener('submit', e => {
      e.preventDefault();
      S.f.q = $('#hq').value.trim(); S.f.players = +$('#hp').value || null;
      $('#q').value = S.f.q; $('#players').value = S.f.players || ''; S.shown = PAGE;
      renderAll(); go('games');
    });
    $$('[data-hstep]').forEach(b => b.addEventListener('click', () => { const n = Math.min(30, Math.max(0, (+$('#hp').value || 0) + +b.dataset.hstep)); $('#hp').value = n || ''; }));
    $('#year').textContent = new Date().getFullYear();
    const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // auth dialogs
    $$('#authTabs button').forEach(b => b.onclick = () => openAuth(b.dataset.am));
    $('#authForm').addEventListener('submit', submitAuth);
    $('#forgotBtn').onclick = forgot;
    initGoogleButton();
    $('#googleBtn').onclick = async () => {
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: SITE_URL, queryParams: { prompt: 'select_account' } } });
      if (error) authMsg(friendly(error));
    };
    $('.peek').onclick = (e) => { const i = $('#authForm').elements.password; i.type = i.type === 'password' ? 'text' : 'password'; e.target.textContent = i.type === 'password' ? 'Show' : 'Hide'; };
    pwMeter($('#authForm').elements.password);
    watchUsername($('#authForm').elements.username, $('#unameHint'));
    watchUsername($('#profileForm').elements.username, $('#profHint'));
    $('#profileForm').addEventListener('submit', submitProfile);
    $('#profLater').onclick = () => { $('#profileDlg').close(); signOut(); };
    $('#profileDlg').addEventListener('cancel', e => e.preventDefault());
    $('#pwForm').addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target;
      if (f.elements.password.value !== f.elements.password2.value) { $('#pwMsg').textContent = 'The two passwords don\'t match.'; return; }
      const { error } = await sb.auth.updateUser({ password: f.elements.password.value });
      if (error) { $('#pwMsg').textContent = friendly(error); return; }
      $('#pwDlg').close(); toast('Password updated ✓');
    });
    // account page forms (rendered later)
    document.addEventListener('submit', async e => {
      const f = e.target;
      if (f.id === 'accForm') {
        e.preventDefault();
        f.elements.username.value = f.elements.username.value.trim().toLowerCase();
        if (!f.reportValidity()) return;
        const { error } = await sb.from('profiles').update({ display_name: f.elements.name.value.trim(), username: f.elements.username.value, favourite_count: +f.elements.fav.value || null }).eq('id', S.me.id);
        $('#accMsg').textContent = error ? (/duplicate|unique/i.test(error.message) ? 'That username is taken.' : error.message) : 'Saved ✓';
        if (!error) { S.me = Object.assign(S.me, { display_name: f.elements.name.value.trim(), username: f.elements.username.value, favourite_count: +f.elements.fav.value || null }); applyAuthUI(); renderHome(); }
      }
      if (f.id === 'pwChange') {
        e.preventDefault();
        const { error } = await sb.auth.updateUser({ password: f.elements.password.value });
        $('#pwcMsg').textContent = error ? friendly(error) : 'Password changed ✓'; if (!error) f.reset();
      }
      if (f.id === 'emailChange') {
        e.preventDefault();
        const { error } = await sb.auth.updateUser({ email: f.elements.email.value.trim() }, { emailRedirectTo: SITE_URL + '#account' });
        $('#emcMsg').textContent = error ? friendly(error) : 'Check both inboxes to confirm the change.';
      }
    });
    document.addEventListener('focusin', e => { if (e.target.name === 'username' && e.target.closest('#accForm') && !e.target._w) { e.target._w = 1; watchUsername(e.target, $('#accHint'), S.me.username); } });

    $('#addGo').onclick = addSearch;
    $('#addQ').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSearch(); } });
    $('#addForm').addEventListener('submit', addSave);
    $('#addCancel').onclick = () => { $('#addForm').hidden = true; addDetails = null; };
  }

  /* ------------------------------------------------------------ boot */
  document.title = CFG.TITLE;
  $('#brandTitle').textContent = CFG.TITLE;
  $('#grid').innerHTML = Array.from({ length: 8 }, () => '<div class="skeleton"></div>').join('');
  const safe = (name, fn) => { try { return fn(); } catch (e) { console.error('[shelf] ' + name + ' failed:', e); } };
  // Auth redirects come back as ?code=… (PKCE) or #error=…; route only after those are handled.
  const hash0 = location.hash.slice(1);
  const authError = /error_description=/.test(hash0) ? decodeURIComponent((hash0.match(/error_description=([^&]+)/) || [])[1] || '').replace(/\+/g, ' ') : '';
  if (authError) history.replaceState(null, '', location.pathname + '#home');
  const h = authError ? 'home' : hash0;
  safe('wire', wire);
  pendingView = ['wishlist', 'shelf', 'account', 'add', 'buy'].includes(h) ? (h === 'buy' ? 'wishlist' : h) : null;
  safe('route', () => go(['games', 'summary'].includes(h) ? h : 'home'));
  if (h.startsWith('game=')) history.replaceState(null, '', '#' + h);
  safe('catalog', () => loadCatalog().catch(e => { console.error(e); toast('Could not load games. Refresh the page.', true); }));
  safe('art', loadArt);
  if (authError) setTimeout(() => toast(authError, true), 300);
  if (sb) {
    applyAuthUI();
    sb.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') { setTimeout(() => $('#pwDlg').showModal(), 200); }
      if (event === 'SIGNED_IN' && /[?&]code=/.test(location.search)) {
        history.replaceState(null, '', location.pathname + location.hash);
        if ($('#auth').open) $('#auth').close();
      }
      if (['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
        const changed = (S.session && S.session.user.id) !== (session && session.user.id) || event === 'USER_UPDATED' || event === 'INITIAL_SESSION';
        if (changed) setTimeout(() => onSession(session), 0); else S.session = session;
      } else if (event === 'TOKEN_REFRESHED') S.session = session;
    });
  } else {
    $('#signinBtn').hidden = true;
  }
})();
