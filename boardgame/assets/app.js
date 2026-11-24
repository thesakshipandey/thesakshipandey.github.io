/* The Game Shelf: front end. Plain JS, no build step. */
(() => {
  'use strict';
  const CFG = Object.assign({ API_URL: '', GOOGLE_CLIENT_ID: '', TITLE: 'The Game Shelf' }, window.SHELF_CONFIG || {});
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = (n) => n == null || n === '' || isNaN(n) ? '—' : '₹' + Math.round(+n).toLocaleString('en-IN');
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

  const CATS = ['Boards', 'Cards', 'Duels'];
  const OWNEDISH = ['Owned', 'DIY'];
  const INTEREST_ORDER = { 'Really want': 0, 'Normal': 1, 'Maybe': 2 };

  // Curated "type of game" tags. Each matches against genre + sheet tags + BGG mechanics/categories.
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

  // Search URLs per Indian store (matched on the store's domain in the GUIDE tab).
  const STORE_SEARCH = {
    'boardgamesindia.com': 'https://www.boardgamesindia.com/search?q={q}',
    'theboardroomindia.com': 'https://shop.theboardroomindia.com/search-products?q={q}',
    'owlsonboard.com': 'https://www.owlsonboard.com/collections/all?q={q}',
    'shufflegames.co.in': 'https://shufflegames.co.in/?s={q}&post_type=product',
    'hextasy.in': 'https://hextasy.in/?s={q}&post_type=product',
    'bigfriendlygames.com': 'https://bigfriendlygames.com/?s={q}&post_type=product',
    'tabletopuniverse.com': 'https://www.tabletopuniverse.com/search?q={q}',
    'gameistry.in': 'https://www.gameistry.in/search?q={q}',
    'bookswagon.com': 'https://www.bookswagon.com/search-books/{q}',
    'boardway.in': 'https://boardway.in/search?q={q}',
    'ccbgames.in': 'https://ccbgames.in/index.php?route=product/search&search={q}'
  };

  const S = {
    catalog: null, games: [], byName: {}, mine: null, token: null,
    f: { q: '', players: null, cats: new Set(), types: new Set(), time: '', weight: '', mine: '', sort: 'name' }
  };

  /* ------------------------------------------------------------ API */
  async function api(action, payload = {}) {
    if (!CFG.API_URL) throw new Error('API not configured yet (see README)');
    const res = await fetch(CFG.API_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action, idToken: S.token }, payload))
    });
    const j = await res.json();
    if (!j.ok) {
      if (/sign.?in/i.test(j.error)) signOut(true);
      throw new Error(j.error);
    }
    return j.data;
  }

  async function loadCatalog(fresh) {
    const cached = !fresh && localStorage.getItem('shelf_catalog');
    if (cached) { try { setCatalog(JSON.parse(cached), true); } catch (e) {} }
    try {
      if (!CFG.API_URL) throw new Error('no api');
      const res = await fetch(CFG.API_URL + '?action=catalog' + (fresh ? '&fresh=1' : ''));
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      setCatalog(j.data);
      try { localStorage.setItem('shelf_catalog', JSON.stringify(j.data)); } catch (e) {}
    } catch (e) {
      if (S.catalog && !S.catalog.snapshot && cached) return;
      const res = await fetch('data/snapshot.json', { cache: 'no-cache' });
      setCatalog(await res.json());
    }
  }

  function setCatalog(cat, fromCache) {
    S.catalog = cat;
    S.games = cat.games.map(enrich);
    S.byName = Object.fromEntries(S.games.map(g => [g.name, g]));
    $('#genreList').innerHTML = [...new Set([...(cat.genres || []).map(x => x.name), ...S.games.map(g => g.genre)])]
      .filter(Boolean).sort().map(x => `<option value="${esc(x)}">`).join('');
    const when = cat.built ? new Date(cat.built) : null;
    $('#dataStamp').textContent = (cat.snapshot ? 'Snapshot' : 'Live from the sheet') + (when ? ' · ' + when.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '') + (fromCache ? ' · refreshing…' : '');
    renderAll();
    openFromHash();
  }

  function enrich(g) {
    g.minP = g.minP == null ? null : +g.minP; g.maxP = g.maxP == null ? null : +g.maxP;
    g.cats = new Set([g.category, ...(g.alsoIn || [])].filter(c => CATS.includes(c)));
    if (g.maxP === 2) g.cats.add('Duels');
    if ((g.bggCategories || []).includes('Card Game')) g.cats.add('Cards');
    g.hayTags = norm([g.genre, ...(g.tags || []), ...(g.mechanics || []), ...(g.bggCategories || [])].join(' | '));
    g.hay = norm([g.name, g.genre, ...(g.tags || []), ...(g.mechanics || []), ...(g.designers || []), ...(g.bggCategories || [])].join(' '));
    g.nameKey = norm(g.name);
    g.types = TYPES.filter(([, fn]) => fn(g)).map(([n]) => n);
    g.cx = complexity(g.weight);
    // BGFinder files minis, duels, expansions etc. under the same BGG id: don't let them pose as the cheapest copy.
    (g.offers || []).forEach(o => { o.variant = isVariant(g.name, o.listing); });
    const inStock = (g.offers || []).filter(o => /in stock/i.test(o.status || '') && o.price);
    g.best = inStock.find(o => !o.variant) || null;
    g.store = storeFor(g.buyLink);
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
  function my(g) { return (S.mine && S.mine.items[g.name]) || {}; }
  function statusOf(g) { return S.mine ? (my(g).status || (S.mine.isAdmin ? 'Wishlist' : '')) : ''; }
  function isOwned(g) { return OWNEDISH.includes(statusOf(g)); }
  function onWay(g) { return statusOf(g) === 'On the way'; }
  function onBuyList(g) { const m = my(g); return !!m.interest && !isOwned(g) && !onWay(g); }

  /* ------------------------------------------------------------ filtering */
  function matches(g, skip) {
    const f = S.f;
    if (f.q) {
      const words = norm(f.q).split(' ');
      if (!words.every(w => g.hay.includes(w))) return false;
    }
    if (f.players && !(g.minP != null && g.maxP != null && g.minP <= f.players && f.players <= g.maxP)) return false;
    if (skip !== 'cats' && f.cats.size && ![...f.cats].some(c => g.cats.has(c))) return false;
    if (skip !== 'types' && f.types.size && ![...f.types].every(t => g.types.includes(t))) return false;
    if (f.time) {
      const t = g.maxT || g.minT;
      if (f.time === '999') { if (!(t > 90)) return false; }
      else if (!(t && t <= +f.time)) return false;
    }
    if (f.weight && g.cx !== f.weight) return false;
    if (f.mine && S.mine) {
      if (f.mine === 'owned' && !(isOwned(g) || onWay(g))) return false;
      if (f.mine === 'notowned' && (isOwned(g) || onWay(g))) return false;
      if (f.mine === 'wish' && !onBuyList(g)) return false;
    }
    return true;
  }

  function sorted(list) {
    const k = S.f.sort;
    const by = {
      name: (a, b) => a.name.localeCompare(b.name),
      rank: (a, b) => (a.bggRank || 1e9) - (b.bggRank || 1e9),
      rating: (a, b) => (b.bggRating || 0) - (a.bggRating || 0),
      weight: (a, b) => (a.weight || 9) - (b.weight || 9),
      weightd: (a, b) => (b.weight || 0) - (a.weight || 0),
      price: (a, b) => ((a.best && a.best.price) || a.price || 1e9) - ((b.best && b.best.price) || b.price || 1e9)
    }[k];
    // Owned games float to the top when someone searches by player count, so "what can we play tonight" is instant.
    return list.slice().sort((a, b) => (S.mine && S.f.players ? (isOwned(b) - isOwned(a)) : 0) || by(a, b));
  }

  function filtersActive() {
    const f = S.f;
    return !!(f.q || f.players || f.cats.size || f.types.size || f.time || f.weight || f.mine);
  }

  /* ------------------------------------------------------------ render: home */
  function renderAll() {
    renderChips();
    renderGrid();
    renderSummary();
    if (!$('#view-buy').hidden) renderBuy();
    if (!$('#view-shelf').hidden) renderShelf();
  }

  function renderChips() {
    const base = S.games.filter(g => matches(g, 'cats'));
    $('#catChips').innerHTML = CATS.map(c => {
      const n = base.filter(g => g.cats.has(c)).length;
      return `<button class="chip catchip ${S.f.cats.has(c) ? 'on' : ''}" data-v="${c}">${c}<span class="n">${n}</span></button>`;
    }).join('');
    const tbase = S.games.filter(g => matches(g, 'types'));
    const counts = TYPES.map(([t]) => [t, tbase.filter(g => g.types.includes(t)).length]);
    const total = S.games.length;
    $('#typeChips').innerHTML = counts
      .filter(([t, n]) => S.f.types.has(t) || S.games.some(g => g.types.includes(t)))
      .map(([t, n]) => `<button class="chip ${S.f.types.has(t) ? 'on' : ''} ${n === 0 && !S.f.types.has(t) ? 'dim' : ''}" data-t="${esc(t)}">${esc(t)}<span class="n">${n}</span></button>`)
      .join('');
    void total;
  }

  function artHTML(g, big) {
    const src = big ? (g.image || g.thumb) : (g.thumb || g.image);
    if (src) return `<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph',style:'${phStyle(g)}',textContent:'${esc(initials(g.name)).replace(/'/g, '')}'}))">`;
    return `<div class="ph" style="${phStyle(g)}">${esc(initials(g.name))}</div>`;
  }
  function initials(n) { return n.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
  function phStyle(g) {
    let h = 0; for (const c of g.name) h = (h * 31 + c.charCodeAt(0)) % 360;
    return `background:linear-gradient(135deg,hsl(${h} 55% 52%),hsl(${(h + 40) % 360} 60% 38%))`;
  }

  function cardHTML(g) {
    const owned = isOwned(g), way = onWay(g), want = S.mine && onBuyList(g);
    const st = statusOf(g);
    const pill = owned ? `<span class="pill">${st === 'DIY' ? 'DIY' : 'Owned'}</span>` : way ? '<span class="pill way">On the way</span>' : want ? `<span class="pill want">${esc(my(g).interest)}</span>` : '';
    const rank = g.bggRank ? `<span class="pill right">#${g.bggRank}</span>` : '';
    const players = g.minP ? (g.minP === g.maxP ? g.minP : `${g.minP}–${g.maxP}`) : '?';
    const time = g.minT ? (g.minT === g.maxT || !g.maxT ? g.minT : `${g.minT}–${g.maxT}`) + "'" : '';
    const price = g.best ? `<b>${inr(g.best.price)}</b><span class="muted">${esc(g.best.store)}</span>`
      : g.price ? `<b>${inr(g.price)}</b><span class="muted">${esc(g.store || 'list price')}</span>` : '<span class="muted">No price yet</span>';
    return `<button class="game ${owned ? 'owned' : way ? 'onway' : ''}" data-g="${esc(g.name)}">
      <div class="art">${artHTML(g)}${pill}${rank}</div>
      <div class="gbody">
        <div class="cats">${[...g.cats].map(c => `<span class="cat ${c}">${c}</span>`).join('')}</div>
        <div class="gname">${esc(g.name)}${g.year ? `<small>${g.year}</small>` : ''}</div>
        <div class="meta"><span>👥 <b>${players}</b></span>${time ? `<span>⏱ <b>${time}</b></span>` : ''}<span>⚖ <b>${g.weight ? (+g.weight).toFixed(1) : '–'}</b></span>${g.bggRating ? `<span>★ <b>${(+g.bggRating).toFixed(1)}</b></span>` : ''}</div>
        <div class="meta">${esc(g.genre || '')}</div>
        <div class="gprice">${price}</div>
      </div></button>`;
  }

  function renderGrid() {
    const list = sorted(S.games.filter(g => matches(g)));
    const ownedCount = S.mine ? list.filter(isOwned).length : 0;
    $('#resultCount').textContent = `${list.length} game${list.length === 1 ? '' : 's'}` +
      (S.f.players ? ` for ${S.f.players} player${S.f.players > 1 ? 's' : ''}` : '') +
      (S.mine && filtersActive() ? ` · ${ownedCount} owned` : '');
    $('#clearAll').hidden = !filtersActive();
    $('#grid').innerHTML = list.length ? list.map(cardHTML).join('')
      : '<div class="empty">No games match. Try fewer filters 🎲</div>';
  }

  function bars(rows, max, attr) {
    return `<div class="bars">${rows.map(r => `<div class="bar" ${attr(r)}><span class="lbl" title="${esc(r.label)}">${esc(r.label)}</span>
      <span class="track"><span class="fill own" style="width:${(r.own || 0) / max * 100}%"></span><span class="fill" style="width:${(r.n - (r.own || 0)) / max * 100}%"></span></span>
      <span class="num">${r.n}</span></div>`).join('')}</div>`;
  }

  function renderSummary() {
    const list = S.games.filter(g => matches(g));
    const authed = !!S.mine;
    const own = (g) => authed && (isOwned(g) || onWay(g));
    $('#summaryHint').textContent = filtersActive() ? `for the ${list.length} matching games` : 'whole collection';
    const avgW = avg(list.map(g => g.weight).filter(Boolean));
    const tiles = [
      ['Games', list.length],
      ...CATS.map(c => [c, list.filter(g => g.cats.has(c)).length]),
      ['Avg weight /5', avgW ? avgW.toFixed(2) : '–'],
      ['In stock in India', list.filter(g => g.best).length]
    ];
    let personal = '';
    if (authed) {
      const owned = list.filter(isOwned), way = list.filter(onWay);
      const wish = list.filter(g => !isOwned(g) && !onWay(g) && (statusOf(g) === 'Wishlist' || my(g).interest));
      const buy = list.filter(onBuyList);
      const spent = sum([...owned, ...way].map(g => my(g).pricePaid));
      const listP = sum([...owned, ...way].filter(g => my(g).pricePaid != null).map(g => g.price));
      const ratings = list.map(g => my(g).rating).filter(x => x != null && x !== '');
      personal = `<div class="tiles">
        <div class="tile green"><div class="v">${owned.length}</div><div class="k">Owned</div></div>
        <div class="tile amber"><div class="v">${way.length}</div><div class="k">On the way</div></div>
        <div class="tile"><div class="v">${wish.length}</div><div class="k">On wishlist</div></div>
        <div class="tile red"><div class="v">${buy.length}</div><div class="k">Buy list</div></div>
        <div class="tile"><div class="v">${inr(sum(wish.map(g => g.price)))}</div><div class="k">Wishlist cost</div></div>
        <div class="tile"><div class="v">${inr(spent)}</div><div class="k">Spent so far</div></div>
        <div class="tile green"><div class="v">${inr(listP - spent)}</div><div class="k">Saved vs list</div></div>
        <div class="tile"><div class="v">${ratings.length ? avg(ratings).toFixed(1) : '–'}</div><div class="k">My avg rating</div></div>
        <div class="tile"><div class="v">${sum(list.map(g => my(g).plays))}</div><div class="k">Plays logged</div></div>
      </div>`;
    }
    // player count
    const pc = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(n => {
      const m = list.filter(g => g.minP != null && g.minP <= n && n <= g.maxP);
      return { n, all: m.length, own: m.filter(own).length };
    });
    const pmax = Math.max(1, ...pc.map(x => x.all));
    const pcHTML = `<div class="pcount">${pc.map(x => `<div class="pcol" data-p="${x.n}" title="${x.all} games for ${x.n}${authed ? `, ${x.own} owned` : ''}">
      <div class="stack" style="height:${x.all / pmax * 100}%"><i class="own" style="flex:${x.own}"></i><i style="flex:${x.all - x.own}"></i></div><span>${x.n}</span></div>`).join('')}</div>
      ${authed ? '<div class="legend"><span><i class="own"></i>owned</span><span><i></i>not owned</span></div>' : ''}`;
    const typeRows = TYPES.map(([t]) => { const m = list.filter(g => g.types.includes(t)); return { label: t, n: m.length, own: m.filter(own).length }; })
      .filter(r => r.n).sort((a, b) => b.n - a.n).slice(0, 10);
    const cxRows = ['Light', 'Medium Light', 'Medium', 'Heavy', 'Unrated'].map(c => { const m = list.filter(g => g.cx === c); return { label: c, n: m.length, own: m.filter(own).length }; }).filter(r => r.n);
    const genreMap = {};
    list.forEach(g => { if (g.genre) { const r = genreMap[g.genre] = genreMap[g.genre] || { label: g.genre, n: 0, own: 0 }; r.n++; if (own(g)) r.own++; } });
    const genreRows = Object.values(genreMap).sort((a, b) => b.n - a.n).slice(0, 10);
    const top = list.filter(g => g.bggRank).sort((a, b) => a.bggRank - b.bggRank).slice(0, 6);
    const mineTop = authed ? list.filter(g => my(g).rating).sort((a, b) => my(b).rating - my(a).rating || (my(b).plays || 0) - (my(a).plays || 0)).slice(0, 6) : [];
    const maxOf = (rows) => Math.max(1, ...rows.map(r => r.n));
    $('#summary').innerHTML = `
      <div class="tiles">${tiles.map(([k, v]) => `<div class="tile"><div class="v">${v}</div><div class="k">${k}</div></div>`).join('')}</div>
      ${personal}
      <div class="panels">
        <div class="panel"><h3>Player count</h3>${pcHTML}</div>
        <div class="panel"><h3>Types</h3>${bars(typeRows, maxOf(typeRows), r => `data-t="${esc(r.label)}"`)}</div>
        <div class="panel"><h3>Complexity</h3>${bars(cxRows, maxOf(cxRows), r => `data-w="${esc(r.label)}"`)}</div>
        <div class="panel"><h3>Genres</h3>${bars(genreRows, maxOf(genreRows), r => `data-q="${esc(r.label)}"`)}</div>
        <div class="panel"><h3>Top on BGG</h3><ul class="toplist">${top.map(g => `<li data-g="${esc(g.name)}"><b>${esc(g.name)}</b><span class="muted">#${g.bggRank} · ★${(+g.bggRating).toFixed(1)}</span></li>`).join('') || '<li class="muted">No BGG ranks yet</li>'}</ul></div>
        ${authed ? `<div class="panel"><h3>My top rated</h3><ul class="toplist">${mineTop.map(g => `<li data-g="${esc(g.name)}"><b>${esc(g.name)}</b><span class="muted">${my(g).rating}/10 · ${my(g).plays || 0} plays</span></li>`).join('') || '<li class="muted">Rate games you own to see them here</li>'}</ul></div>` : ''}
      </div>`;
  }

  const sum = (a) => a.reduce((s, x) => s + (+x || 0), 0);
  const avg = (a) => a.length ? sum(a) / a.length : 0;

  /* ------------------------------------------------------------ detail modal */
  function openGame(name) {
    const g = S.byName[name];
    if (!g) return;
    const d = $('#detail');
    const q = encodeURIComponent(g.name.replace(/\(.*?\)/g, '').trim());
    const storeLinks = (S.catalog.stores || []).map(s => {
      const h = host(s.url);
      const pat = Object.keys(STORE_SEARCH).find(k => h.endsWith(k));
      return `<a href="${esc(pat ? STORE_SEARCH[pat].replace('{q}', q) : s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`;
    }).join('');
    const fakes = (S.catalog.counterfeit || []).map(s => `<a href="${esc((s.search || s.url).replace('{q}', q))}" target="_blank" rel="noopener nofollow">${esc(s.name)}</a>`).join('');
    const ordered = (g.offers || []).slice().sort((a, b) => (a === g.best ? -1 : b === g.best ? 1 : 0) || (a.variant - b.variant) || ((a.price || 1e9) - (b.price || 1e9)));
    const offers = ordered.map(o => `<a class="offer ${o === g.best ? 'best' : ''}" href="${esc(o.url)}" target="_blank" rel="noopener">
      <span><b>${esc(o.store)}</b>${o === g.best ? ' <span class="st in">· best price</span>' : ''}<br><span class="st">${esc(o.listing)}${o.variant ? ' · <i>different edition / variant</i>' : ''}</span></span>
      <span class="st ${/in stock/i.test(o.status) ? 'in' : ''}">${esc(o.status || '')}</span><b>${inr(o.price)}</b></a>`).join('');
    const sheetLink = g.buyLink ? `<a class="offer" href="${esc(g.buyLink)}" target="_blank" rel="noopener"><span><b>${esc(g.store || 'Saved link')}</b><br><span class="st">Link from the sheet</span></span><span class="st">list price</span><b>${inr(g.price)}</b></a>` : '';
    const fact = (k, v) => v ? `<div class="fact"><div class="k">${k}</div><div class="v">${v}</div></div>` : '';
    const players = g.minP ? (g.minP === g.maxP ? g.minP : `${g.minP}–${g.maxP}`) : '';
    const typeKeys = new Set(g.types.map(norm));
    const seenTag = new Set();
    const tags = [...(g.tags || []), ...(g.mechanics || [])].filter(t => { const k = norm(t); if (typeKeys.has(k) || seenTag.has(k)) return false; seenTag.add(k); return true; });
    d.innerHTML = `<button class="close" aria-label="Close">✕</button>
      <div class="dwrap">
        <div class="dart">${artHTML(g, true)}
          <div class="cats">${[...g.cats].map(c => `<span class="cat ${c}">${c}</span>`).join('')}</div>
          ${g.bggLink ? `<a href="${esc(g.bggLink)}" target="_blank" rel="noopener" class="btn ghost" style="text-align:center">BoardGameGeek ↗</a>` : ''}
        </div>
        <div class="dmain">
          <h2>${esc(g.name)}</h2>
          <div class="muted">${esc(g.genre || '')}${g.year ? ' · ' + g.year : ''}${g.designers && g.designers.length ? ' · by ' + esc(g.designers.slice(0, 3).join(', ')) : ''}</div>
          <div class="facts">
            ${fact('Players', players)}${fact('Best at', g.bestPlayers)}${fact('Time', g.minT ? (g.minT === g.maxT ? g.minT : g.minT + '–' + g.maxT) + ' min' : '')}
            ${fact('Age', g.age ? g.age + '+' : '')}${fact('Weight', g.weight ? (+g.weight).toFixed(2) + ' · ' + g.cx : '')}
            ${fact('BGG rating', g.bggRating ? (+g.bggRating).toFixed(2) : '')}${fact('BGG rank', g.bggRank ? '#' + g.bggRank : '')}
          </div>
          <div class="taglist">${g.types.map(t => `<button class="chip on" data-t="${esc(t)}">${esc(t)}</button>`).join('')}${tags.map(t => `<button class="chip" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div>
          ${g.description ? `<div class="desc">${esc(g.description)}</div>` : ''}
          ${mineHTML(g)}
          <div class="dsec"><h3>Buy in India</h3>
            <div class="offers">${offers}${sheetLink}${!offers && !sheetLink ? '<div class="muted">No live listing found. Try the stores below.</div>' : ''}</div>
          </div>
          <div class="dsec"><h3>Search the stores</h3>
            <div class="storelinks"><a class="bgf" href="https://www.bgfindertool.com/" target="_blank" rel="noopener" data-copy="${esc(g.name)}">Compare on BGFinder ↗</a>${storeLinks}</div>
          </div>
          ${fakes ? `<div class="dsec"><details class="fakebox"><summary>Counterfeit / budget copies</summary>
            <p>These sellers mostly stock unlicensed copies. They're cheaper, but the components are often worse and the designers aren't paid.</p>
            <div class="storelinks">${fakes}</div></details></div>` : ''}
        </div>
      </div>`;
    d.querySelector('.close').onclick = () => d.close();
    wireMine(d, g);
    if (!d.open) d.showModal();
    history.replaceState(null, '', '#game=' + encodeURIComponent(g.name));
  }

  function mineHTML(g) {
    if (!S.mine) {
      return CFG.GOOGLE_CLIENT_ID ? `<div class="dsec signin-nudge">Sign in to track this game: owned, price paid, rating, plays and buy list.</div>` : '';
    }
    const m = my(g), st = statusOf(g);
    const opt = (list, v) => list.map(x => `<option value="${esc(x[0])}" ${x[0] === (v || '') ? 'selected' : ''}>${esc(x[1])}</option>`).join('');
    const statuses = S.mine.isAdmin ? [['Wishlist', 'Wishlist'], ['On the way', 'On the way'], ['Owned', 'Owned'], ['DIY', 'DIY']]
      : [['', '—'], ['Wishlist', 'Wishlist'], ['On the way', 'On the way'], ['Owned', 'Owned'], ['DIY', 'DIY']];
    const r = +m.rating || 0;
    return `<div class="dsec"><h3>My copy ${S.mine.isAdmin ? '<span class="muted" style="text-transform:none;letter-spacing:0">· saves to your sheet</span>' : ''}</h3>
      <form class="mine" data-g="${esc(g.name)}">
        <label>Status<select name="status">${opt(statuses, st)}</select></label>
        <label>Buy interest<select name="interest">${opt([['', '—'], ['Really want', 'Really want'], ['Normal', 'Normal'], ['Maybe', 'Maybe']], m.interest)}</select></label>
        <label>Authenticity<select name="authenticity">${opt([['', '—'], ['VERIFIED ORIGINAL', 'Verified original'], ['SUSPECTED COUNTERFEIT', 'Suspected counterfeit'], ['UNKNOWN', 'Unknown']], m.authenticity)}</select></label>
        <label>Price paid ₹<input name="pricePaid" type="number" min="0" value="${m.pricePaid == null ? '' : m.pricePaid}"></label>
        <label>Times played<input name="plays" type="number" min="0" value="${m.plays == null ? '' : m.plays}"></label>
        <label>Rating /10<div class="stars" data-r="${r}">${Array.from({ length: 10 }, (_, i) => `<button type="button" data-v="${i + 1}" class="${i < r ? 'on' : ''}" aria-label="${i + 1}">★</button>`).join('')}</div><input name="rating" type="hidden" value="${m.rating == null ? '' : m.rating}"></label>
        ${S.mine.isAdmin ? '' : `<label class="wide">Notes / suggestions<textarea name="notes" maxlength="500">${esc(m.notes || '')}</textarea></label>`}
        <div class="row"><span class="muted save-state">Changes save automatically</span></div>
      </form></div>`;
  }

  function wireMine(root, g) {
    const form = root.querySelector('form.mine');
    if (!form) return;
    let timer, pending = {};
    const flush = async () => {
      const fields = pending; pending = {};
      const stEl = form.querySelector('.save-state');
      stEl.textContent = 'Saving…';
      const before = Object.assign({}, my(g));
      Object.assign(S.mine.items[g.name] = S.mine.items[g.name] || {}, fields);
      renderAll();
      try {
        const saved = await api('saveMine', { game: g.name, fields });
        S.mine.items[g.name] = Object.assign(S.mine.items[g.name] || {}, saved);
        stEl.textContent = 'Saved ✓';
        renderAll();
      } catch (e) {
        S.mine.items[g.name] = before;
        stEl.textContent = 'Not saved: ' + e.message;
        toast(e.message, true);
        renderAll();
      }
    };
    const queue = (name, value) => { pending[name] = value; clearTimeout(timer); timer = setTimeout(flush, 600); };
    form.addEventListener('change', (e) => {
      const el = e.target;
      if (!el.name) return;
      const v = el.type === 'number' ? (el.value === '' ? '' : +el.value) : el.value;
      queue(el.name, v);
    });
    form.querySelectorAll('.stars button').forEach(b => b.addEventListener('click', () => {
      const v = +b.dataset.v;
      const cur = +form.rating.value || 0;
      const nv = cur === v ? '' : v;
      form.rating.value = nv;
      form.querySelectorAll('.stars button').forEach(x => x.classList.toggle('on', +x.dataset.v <= (+nv || 0)));
      queue('rating', nv);
    }));
  }

  /* ------------------------------------------------------------ buy list + shelf */
  function sinceKey(s) { const t = Date.parse(s); return isNaN(t) ? 9e15 : t; }

  function renderBuy() {
    if (!S.mine) return;
    const list = S.games.filter(onBuyList).sort((a, b) =>
      (INTEREST_ORDER[my(a).interest] ?? 9) - (INTEREST_ORDER[my(b).interest] ?? 9) || sinceKey(my(a).since) - sinceKey(my(b).since));
    const groups = ['Really want', 'Normal', 'Maybe'];
    $('#buyTotals').innerHTML = groups.map(gname => {
      const m = list.filter(g => my(g).interest === gname);
      return `<div class="tile ${gname === 'Really want' ? 'red' : ''}"><div class="v">${m.length}</div><div class="k">${gname} · ${inr(sum(m.map(g => g.price)))}</div></div>`;
    }).join('') + `<div class="tile"><div class="v">${inr(sum(list.map(g => (g.best && g.best.price) || g.price)))}</div><div class="k">Total at best India price</div></div>`;
    let run = 0, i = 0;
    $('#buyList').innerHTML = list.length ? `<table><thead><tr><th>#</th><th>Game</th><th>Interest</th><th>Category</th><th class="num">List ₹</th><th class="num">Best India ₹</th><th>Where</th><th class="num">Running total</th></tr></thead><tbody>
      ${list.map(g => { run += +g.price || 0; i++; const m = my(g);
        return `<tr class="clickable" data-g="${esc(g.name)}"><td>${i}</td><td><b>${esc(g.name)}</b></td><td><span class="int ${esc(m.interest.split(' ')[0])}">${esc(m.interest)}</span></td>
        <td>${[...g.cats].join(', ')}</td><td class="num">${inr(g.price)}</td><td class="num">${g.best ? inr(g.best.price) : '—'}</td>
        <td>${g.best ? `<a href="${esc(g.best.url)}" target="_blank" rel="noopener">${esc(g.best.store)}</a>` : g.buyLink ? `<a href="${esc(g.buyLink)}" target="_blank" rel="noopener">${esc(g.store)}</a>` : ''}</td>
        <td class="num">${inr(run)}</td></tr>`; }).join('')}</tbody></table>`
      : '<div class="empty">Nothing on your buy list yet. Open any game and set <b>Buy interest</b>.</div>';
  }

  function renderShelf() {
    if (!S.mine) return;
    const list = S.games.filter(g => isOwned(g) || onWay(g)).sort((a, b) => a.name.localeCompare(b.name));
    const paid = list.filter(g => my(g).pricePaid != null && my(g).pricePaid !== '');
    const spent = sum(paid.map(g => my(g).pricePaid));
    const saved = sum(paid.map(g => (+g.price || 0) - (+my(g).pricePaid || 0)));
    const orig = list.filter(g => my(g).authenticity === 'VERIFIED ORIGINAL').length;
    const fake = list.filter(g => my(g).authenticity === 'SUSPECTED COUNTERFEIT').length;
    $('#shelfTotals').innerHTML = `
      <div class="tile green"><div class="v">${list.filter(isOwned).length}</div><div class="k">Owned</div></div>
      <div class="tile amber"><div class="v">${list.filter(onWay).length}</div><div class="k">On the way</div></div>
      <div class="tile"><div class="v">${inr(spent)}</div><div class="k">Spent</div></div>
      <div class="tile green"><div class="v">${inr(saved)}</div><div class="k">Saved vs list</div></div>
      <div class="tile"><div class="v">${orig} / ${fake}</div><div class="k">Original / counterfeit</div></div>
      <div class="tile"><div class="v">${sum(list.map(g => my(g).plays))}</div><div class="k">Plays</div></div>`;
    const authTag = (a) => a === 'VERIFIED ORIGINAL' ? '<span class="auth-tag orig">ORIGINAL</span>' : a === 'SUSPECTED COUNTERFEIT' ? '<span class="auth-tag fake">COUNTERFEIT</span>' : a ? `<span class="auth-tag">${esc(a)}</span>` : '';
    $('#shelfList').innerHTML = list.length ? `<table><thead><tr><th>Game</th><th>Status</th><th>Copy</th><th class="num">Paid ₹</th><th class="num">List ₹</th><th class="num">Saved ₹</th><th class="num">Rating</th><th class="num">Plays</th></tr></thead><tbody>
      ${list.map(g => { const m = my(g); const sv = m.pricePaid != null && m.pricePaid !== '' && g.price ? g.price - m.pricePaid : null;
        return `<tr class="clickable" data-g="${esc(g.name)}"><td><b>${esc(g.name)}</b></td><td>${esc(statusOf(g))}</td><td>${authTag(m.authenticity)}</td>
        <td class="num">${inr(m.pricePaid)}</td><td class="num">${inr(g.price)}</td><td class="num ${sv > 0 ? 'save-pos' : sv < 0 ? 'save-neg' : ''}">${sv == null ? '—' : inr(sv)}</td>
        <td class="num">${m.rating ? m.rating + '/10' : '—'}</td><td class="num">${m.plays || 0}</td></tr>`; }).join('')}</tbody></table>`
      : '<div class="empty">No owned games yet. Open a game and set its status to <b>Owned</b>.</div>';
  }

  /* ------------------------------------------------------------ add game (owner) */
  let addDetails = null;
  let pendingView = null;
  async function addSearch() {
    const q = $('#addQ').value.trim();
    if (!q) return;
    $('#addResults').innerHTML = '<div class="muted">Searching BoardGameGeek and the Indian stores…</div>';
    try {
      const hits = await api('bggSearch', { q });
      $('#addResults').innerHTML = hits.length ? hits.map(h => {
        const exists = S.games.find(g => g.bggId === h.id || g.nameKey === norm(h.name));
        return `<button class="add-hit ${exists ? 'exists' : ''}" data-id="${esc(h.id)}"><b>${esc(h.name)}</b><small>${h.year ? esc(String(h.year).replace('.0', '')) + ' · ' : ''}BGG #${esc(h.id)}</small>
          ${h.inIndia ? '<span class="india">● Sold in India</span>' : ''}${exists ? '<small>Already on the shelf</small>' : ''}</button>`;
      }).join('') : '<div class="muted">No matches. Try another spelling or paste the BGG link. You can also fill the form by hand.</div>' +
        '<button class="btn ghost" id="manualAdd" style="margin-top:8px">Fill in by hand</button>';
    } catch (e) { $('#addResults').innerHTML = `<div class="muted">${esc(e.message)}</div>`; }
  }

  async function addPick(id) {
    $('#addMsg').textContent = '';
    $('#addResults').innerHTML = '<div class="muted">Fetching details…</div>';
    try {
      const d = await api('bggDetails', { id });
      addDetails = d;
      const f = $('#addForm');
      const s = d.suggest || {};
      const set = (n, v) => { if (f[n]) f[n].value = v == null ? '' : v; };
      set('name', d.name); set('category', s.category); set('alsoIn', s.alsoIn); set('minP', d.minP); set('maxP', d.maxP);
      set('minT', d.minT); set('maxT', d.maxT); set('age', d.age); set('weight', d.weight); set('genre', s.genre);
      set('tags', s.tags); set('status', 'Wishlist'); set('interest', ''); set('price', s.price); set('buyLink', s.buyLink); set('bggId', d.id);
      $('#addPreview').innerHTML = `${d.thumb || d.image ? `<img src="${esc(d.thumb || d.image)}" alt="" referrerpolicy="no-referrer">` : ''}
        <div><b style="font:700 20px var(--display)">${esc(d.name)}</b> <span class="muted">${esc(String(d.year || '').replace('.0', ''))}</span><br>
        <span class="muted">★ ${d.rating || '–'} · rank #${d.rank || '–'} · weight ${d.weight || '–'}</span><br>
        <span class="muted">${(d.offers || []).length ? `${d.offers.length} Indian listing(s). The cheapest in-stock one is filled in below.` : 'No Indian store listing found on BGFinder.'}</span></div>`;
      f.hidden = false;
      $('#addResults').innerHTML = '';
      f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) { $('#addResults').innerHTML = `<div class="muted">${esc(e.message)}</div>`; }
  }

  async function addSave(ev) {
    ev.preventDefault();
    const f = ev.target;
    const g = Object.fromEntries(new FormData(f).entries());
    g.details = addDetails && String(addDetails.id) === String(g.bggId) ? addDetails : null;
    const btn = f.querySelector('button[type=submit]');
    btn.disabled = true; $('#addMsg').textContent = 'Saving to the sheet…';
    try {
      await api('addGame', { game: g });
      toast(`Added ${g.name} ✓`);
      f.reset(); f.hidden = true; addDetails = null; $('#addQ').value = ''; $('#addMsg').textContent = '';
      await loadCatalog(true);
      if (S.mine) S.mine = await api('me');
      renderAll();
    } catch (e) { $('#addMsg').textContent = e.message; }
    btn.disabled = false;
  }

  /* ------------------------------------------------------------ auth */
  function jwtPayload(t) { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { return {}; } }

  async function onCredential(resp) {
    S.token = resp.credential;
    sessionStorage.setItem('shelf_token', S.token);
    await loadMe();
  }

  async function loadMe() {
    try {
      S.mine = await api('me');
      document.body.classList.add('authed');
      document.body.classList.toggle('admin', !!S.mine.isAdmin);
      $('#signin').hidden = true;
      $('#userChip').hidden = false;
      $('#userName').innerHTML = esc((S.mine.name || S.mine.email).split(' ')[0]) + (S.mine.isAdmin ? '<span class="badge-admin">owner</span>' : '');
      renderAll();
      if (pendingView) { go(pendingView); pendingView = null; }
      const d = $('#detail');
      if (d.open) { const name = decodeURIComponent((location.hash.match(/game=(.*)/) || [])[1] || ''); if (name) openGame(name); }
    } catch (e) {
      toast(e.message, true);
      signOut(true);
    }
  }

  function signOut(silent) {
    S.token = null; S.mine = null;
    sessionStorage.removeItem('shelf_token');
    document.body.classList.remove('authed', 'admin');
    $('#signin').hidden = false; $('#userChip').hidden = true;
    if (window.google && google.accounts) google.accounts.id.disableAutoSelect();
    if (!silent) toast('Signed out');
    if (['#buy', '#shelf', '#add'].includes(location.hash)) go('home');
    renderAll();
  }

  function initAuth() {
    if (!CFG.GOOGLE_CLIENT_ID || !CFG.API_URL) return;
    const saved = sessionStorage.getItem('shelf_token');
    if (saved && (jwtPayload(saved).exp || 0) * 1000 > Date.now() + 60000) { S.token = saved; loadMe(); }
    const start = () => {
      google.accounts.id.initialize({ client_id: CFG.GOOGLE_CLIENT_ID, callback: onCredential, auto_select: true, cancel_on_tap_outside: true });
      google.accounts.id.renderButton($('#signin'), { theme: 'filled_black', size: 'medium', shape: 'pill', text: 'signin' });
      if (!S.token) google.accounts.id.prompt();
    };
    if (window.google && google.accounts) start();
    else window.addEventListener('load', () => window.google && google.accounts ? start() : null);
  }

  /* ------------------------------------------------------------ routing + events */
  function go(view) {
    if (['buy', 'shelf'].includes(view) && !S.mine) view = 'home';
    if (view === 'add' && !(S.mine && S.mine.isAdmin)) view = 'home';
    $$('.view').forEach(v => v.hidden = v.id !== 'view-' + view);
    $$('#tabs a').forEach(a => a.classList.toggle('active', a.dataset.nav === view));
    if (view === 'buy') renderBuy();
    if (view === 'shelf') renderShelf();
    if (location.hash.slice(1) !== view && !location.hash.startsWith('#game=')) history.replaceState(null, '', '#' + view);
    window.scrollTo({ top: 0 });
  }

  function openFromHash() {
    const m = location.hash.match(/^#game=(.*)$/);
    if (m && S.byName[decodeURIComponent(m[1])]) openGame(decodeURIComponent(m[1]));
  }

  function toast(msg, err) {
    const t = $('#toast');
    t.textContent = msg; t.className = 'toast' + (err ? ' err' : ''); t.hidden = false;
    clearTimeout(t._t); t._t = setTimeout(() => t.hidden = true, 3200);
  }

  function setTypeFilter(t) { S.f.types.has(t) ? S.f.types.delete(t) : S.f.types.add(t); }

  function wire() {
    let qt;
    $('#q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { S.f.q = e.target.value; renderAll(); }, 120); });
    $('#players').addEventListener('input', e => { S.f.players = +e.target.value || null; renderAll(); });
    $$('.step').forEach(b => b.addEventListener('click', () => {
      const cur = S.f.players || 0;
      const n = Math.min(30, Math.max(0, cur + +b.dataset.step));
      S.f.players = n || null; $('#players').value = n || ''; renderAll();
    }));
    $('#timeSel').onchange = e => { S.f.time = e.target.value; renderAll(); };
    $('#weightSel').onchange = e => { S.f.weight = e.target.value; renderAll(); };
    $('#mineSel').onchange = e => { S.f.mine = e.target.value; renderAll(); };
    $('#sortSel').onchange = e => { S.f.sort = e.target.value; renderAll(); };
    $('#clearAll').onclick = () => {
      Object.assign(S.f, { q: '', players: null, time: '', weight: '', mine: '' }); S.f.cats.clear(); S.f.types.clear();
      $('#q').value = ''; $('#players').value = ''; $('#timeSel').value = ''; $('#weightSel').value = ''; $('#mineSel').value = '';
      renderAll();
    };

    document.addEventListener('click', e => {
      const el = e.target.closest('[data-v],[data-t],[data-g],[data-p],[data-w],[data-q],[data-nav],[data-copy],[data-id],#manualAdd');
      if (!el) return;
      const inDetail = !!el.closest('#detail');
      if (el.matches('a[data-copy]')) {
        navigator.clipboard && navigator.clipboard.writeText(el.dataset.copy).then(() => toast('Name copied. Paste it into BGFinder\'s search.')).catch(() => {});
        return;
      }
      if (el.dataset.nav) { e.preventDefault(); go(el.dataset.nav); return; }
      if (el.id === 'manualAdd') { addDetails = null; $('#addForm').reset(); $('#addForm').name.value = $('#addQ').value; $('#addForm').hidden = false; $('#addPreview').innerHTML = ''; return; }
      if (el.classList.contains('add-hit')) { addPick(el.dataset.id); return; }
      if (el.classList.contains('catchip')) {
        const c = el.dataset.v; S.f.cats.has(c) ? S.f.cats.delete(c) : S.f.cats.add(c); renderAll(); return;
      }
      if (el.closest('.stars')) return;
      const toHome = () => { if (inDetail) $('#detail').close(); go('home'); $('#q').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
      if (el.dataset.t) { if (inDetail) S.f.types = new Set([el.dataset.t]); else setTypeFilter(el.dataset.t); toHome(); renderAll(); return; }
      if (el.dataset.p) { S.f.players = +el.dataset.p; $('#players').value = el.dataset.p; renderAll(); toHome(); return; }
      if (el.dataset.w) { S.f.weight = S.f.weight === el.dataset.w ? '' : el.dataset.w; $('#weightSel').value = S.f.weight; renderAll(); return; }
      if (el.dataset.q) { S.f.q = el.dataset.q; $('#q').value = el.dataset.q; toHome(); renderAll(); return; }
      if (el.dataset.g && !el.closest('form')) { openGame(el.dataset.g); }
    });

    const d = $('#detail');
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
    d.addEventListener('close', () => { if (location.hash.startsWith('#game=')) history.replaceState(null, '', '#home'); });
    window.addEventListener('hashchange', () => {
      const h = location.hash.slice(1);
      if (h.startsWith('game=')) openFromHash(); else if (['home', 'buy', 'shelf', 'add'].includes(h)) go(h);
    });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); go('home'); $('#q').focus(); }
    });

    $('#signout').onclick = () => signOut();
    $('#addGo').onclick = addSearch;
    $('#addQ').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSearch(); } });
    $('#addForm').addEventListener('submit', addSave);
    $('#addCancel').onclick = () => { $('#addForm').hidden = true; addDetails = null; };
    $('#refreshBtn').onclick = async (e) => {
      e.target.disabled = true; $('#refreshMsg').textContent = 'Refreshing. This can take a minute…';
      try { await api('refresh'); await loadCatalog(true); $('#refreshMsg').textContent = 'Done ✓'; }
      catch (err) { $('#refreshMsg').textContent = err.message; }
      e.target.disabled = false;
    };
  }

  /* ------------------------------------------------------------ boot */
  document.title = CFG.TITLE;
  $('#brandTitle').textContent = CFG.TITLE;
  $('#grid').innerHTML = Array.from({ length: 8 }, () => '<div class="skeleton"></div>').join('');
  wire();
  const h = location.hash.slice(1);
  pendingView = ['buy', 'shelf', 'add'].includes(h) ? h : null;
  go('home');
  if (h.startsWith('game=')) history.replaceState(null, '', '#' + h);
  loadCatalog();
  initAuth();
})();
