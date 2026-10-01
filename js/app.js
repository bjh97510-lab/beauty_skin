/* Spec Direct — 화면 렌더링 & 라우팅 */
(function () {
  const { INGREDIENTS, DDS, CONFLICTS, CONDITIONS, CATEGORIES, PRODUCTS, engine: E } = SD;
  const $app = document.getElementById('app');

  /* ───────── utils ───────── */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PATHS = {
    home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
    filter: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3"/><path d="M7 15h10"/>',
    warn: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    back: '<path d="m15 6-6 6 6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  };
  const ico = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[n]}</svg>`;

  const STATUS = {
    PASS: { cls: 'pass', label: 'Pass', icon: 'check' },
    WARN: { cls: 'warn', label: 'Warn · 유효농도 미달', icon: 'warn' },
    UNDER: { cls: 'danger', label: 'PPM 미달 경고', icon: 'x' },
  };
  const VERDICT = {
    FALSE: { cls: 'danger', label: '과장·허위', icon: 'x' },
    WARN: { cls: 'warn', label: '부분 사실', icon: 'warn' },
    FACT: { cls: 'pass', label: '팩트', icon: 'check' },
  };
  const chip = (cls, text, icon) => `<span class="chip ${cls}">${icon ? ico(icon, 13) : ''}${esc(text)}</span>`;
  const phStr = (ph) => `pH ${ph[0].toFixed(1)}~${ph[1].toFixed(1)}`;
  const ddsShort = (id) => DDS[id].ko.split(' ')[0];

  /* ───────── shared components ───────── */
  function productCard(r) {
    const p = r.product;
    const under = r.actives.filter((a) => a.status === 'UNDER').length;
    const concept = r.actives.filter((a) => a.ing.evidence === 'concept').length;
    const flags = [];
    if (r.falseCount) flags.push(chip('danger', `과장 문구 ${r.falseCount}건`, 'bolt'));
    if (under) flags.push(chip('danger', `PPM 미달 ${under}`, 'x'));
    if (concept) flags.push(chip('warn', '컨셉 원료 포함', 'warn'));
    const partial = r.claims.filter((c) => c.verdict === 'WARN').length;
    if (partial) flags.push(chip('warn', `부분 사실 ${partial}건`, 'warn'));
    if (r.actives.some((a) => a.ing.evidence === 'limited') && !under) flags.push(chip('warn', '외용 근거 미흡 원료', 'info'));
    if (!flags.length) flags.push(chip('pass', '스펙 검증 통과', 'check'));
    return `
      <a class="card pcard" href="#/product/${p.id}">
        <div class="pcard-top">
          <div>
            <div class="brand">${esc(p.brand)}</div>
            <div class="name">${esc(p.name)}</div>
          </div>
          <div class="grade ${r.grade}">${r.grade}<small>${r.score}</small></div>
        </div>
        <div class="meta">
          ${chip('', CATEGORIES[p.category])}
          ${chip('navy', phStr(p.ph))}
          ${p.dds.length ? p.dds.map((d) => chip('info', ddsShort(d))).join('') : chip('', 'DDS 없음')}
        </div>
        <div class="xs muted">${r.actives.slice(0, 3).map((a) => `${esc(a.ing.ko.split(' (')[0])} <span class="num">${E.fmtNum(a.ppm)}</span>ppm`).join(' · ')}</div>
        <div class="flags">${flags.join('')}</div>
      </a>`;
  }

  function searchBar(q = '') {
    return `
      <form class="searchbar" id="search-form" role="search">
        <input id="search-input" type="search" value="${esc(q)}" placeholder="제품명, 브랜드, 성분명 (예: 나이아신아마이드, PDRN)" aria-label="검색어" />
        <button type="submit">${ico('search', 16)}검색</button>
      </form>`;
  }
  function bindSearch() {
    const f = document.getElementById('search-form');
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('search-input').value.trim();
      if (q) location.hash = `#/search?q=${encodeURIComponent(q)}`;
    });
  }

  /* ───────── 1. Dashboard ───────── */
  function renderHome() {
    const all = PRODUCTS.map(E.analyze);
    const falseClaims = all.reduce((s, r) => s + r.falseCount, 0);
    const totalClaims = all.reduce((s, r) => s + r.claims.length, 0);
    const under = all.reduce((s, r) => s + r.actives.filter((a) => a.status === 'UNDER').length, 0);
    const conceptProducts = all.filter((r) => r.hasConcept).length;
    const busted = [...all].sort((a, b) => b.falseCount - a.falseCount || a.score - b.score).slice(0, 3);
    const best = [...all].sort((a, b) => b.score - a.score).slice(0, 6);

    $app.innerHTML = `
      <section class="hero">
        <div class="eyebrow">Spec Direct · Formulation Fact Lab</div>
        <h1>과장 광고 없는<br />제형 데이터 기반 화장품 분석</h1>
        <p>농도(PPM) · pH · 분자량(Da) · DDS — 4가지 스펙으로 마케팅 문구를 검증합니다.</p>
        ${searchBar()}
      </section>

      <div class="quick">
        <a href="#/scan"><span class="qi">${ico('scan', 22)}</span><div><b>전성분 OCR 카메라 스캔</b><span>전성분 사진 → 컨셉 원료·분자량 자동 판독</span></div></a>
        <a href="#/filter"><span class="qi">${ico('filter', 22)}</span><div><b>스펙 기반 필터 검색</b><span>PPM · pH · DDS 수치 조건으로 스크리닝</span></div></a>
        <a href="#/routine"><span class="qi">${ico('layers', 22)}</span><div><b>맞춤형 루틴 매칭</b><span>성분 충돌 자동 검증 AM/PM 조합</span></div></a>
      </div>

      <div class="stats">
        <div class="stat"><div class="k">분석 제품</div><div class="v num">${all.length}<small>개</small></div></div>
        <div class="stat danger"><div class="k">과장 문구 적발</div><div class="v num">${falseClaims}<small>/ ${totalClaims}</small></div></div>
        <div class="stat danger"><div class="k">PPM 미달 성분</div><div class="v num">${under}<small>건</small></div></div>
        <div class="stat warn"><div class="k">컨셉 처방 제품</div><div class="v num">${conceptProducts}<small>개</small></div></div>
      </div>

      <div class="section-h"><h2>${ico('bolt', 16)} 팩트폭격 적발 TOP 3</h2><span class="xs muted">과장 문구 수 기준</span></div>
      <div class="plist">${busted.map(productCard).join('')}</div>

      <div class="section-h"><h2>${ico('flask', 16)} Spec Score 상위 제품</h2><a class="link-btn" href="#/filter">전체 필터 보기 →</a></div>
      <div class="plist">${best.map(productCard).join('')}</div>

      ${footer()}`;
    bindSearch();
  }

  function footer() {
    return `<p class="footer-note">원료 분자량·기능성 고시 농도는 공개 문헌 및 식약처 고시 기준입니다. 제품 데이터는 분석 로직 시연용 [샘플]이며 실존 브랜드가 아닙니다.</p>`;
  }

  /* ───────── Search ───────── */
  function renderSearch(q) {
    const results = E.search(q);
    $app.innerHTML = `
      <div class="page-h"><div class="eyebrow" style="color:var(--mint-ink)">Search</div><h1>"${esc(q)}" 검색 결과</h1></div>
      ${searchBar(q)}
      <div class="section-h"><h2>${results.length}개 제품</h2></div>
      ${results.length ? `<div class="plist">${results.map(productCard).join('')}</div>` : `<div class="card empty">${ico('search')}<p>일치하는 제품이 없습니다.<br/>성분명은 한글 INCI(예: 판테놀) 또는 영문(Panthenol)으로 검색해 보세요.</p></div>`}`;
    bindSearch();
  }

  /* ───────── 2. Product Spec Direct Report ───────── */
  const logPos = (v, min, max) => Math.max(0, Math.min(100, ((Math.log10(v) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 100));

  function renderProduct(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) { $app.innerHTML = `<div class="card empty"><p>제품을 찾을 수 없습니다.</p><a class="link-btn" href="#/">홈으로</a></div>`; return; }
    const r = E.analyze(p);
    const ringColor = { A: 'var(--mint)', B: '#34D399', C: '#FBBF24', D: '#F87171' }[r.grade];
    const C = 2 * Math.PI * 44;
    // 대표 유효성분 = 마케팅 메인 성분 (없으면 최고 함량)
    const top = r.actives.find((a) => a.id === p.claims[0]?.ingredient) || [...r.actives].sort((a, b) => b.ppm - a.ppm)[0];
    const passN = r.actives.filter((a) => a.status === 'PASS').length;

    $app.innerHTML = `
      <a class="back" href="javascript:history.back()">${ico('back', 16)} 뒤로</a>
      <section class="report-head">
        <div>
          <div class="brand">${esc(p.brand)}</div>
          <h1>${esc(p.name)}</h1>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <span class="chip">${CATEGORIES[p.category]}</span>
            <span class="chip">Spec Direct Report</span>
            ${r.falseCount ? `<span class="chip" style="background:var(--danger);color:#fff">${ico('bolt', 13)}과장 문구 ${r.falseCount}건 적발</span>` : ''}
          </div>
        </div>
        <div class="ring" role="img" aria-label="Spec Score ${r.score}점, 등급 ${r.grade}">
          <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#1D3557" stroke-width="8"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="${ringColor}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - r.score / 100)}"/></svg>
          <div class="lbl"><div><b class="num" style="color:${ringColor}">${r.score}</b><span>GRADE ${r.grade}</span></div></div>
        </div>
      </section>

      <div class="spec-tiles">
        <div class="tile"><div class="k"><i>①</i>유효성분 농도</div><div class="v num">${E.fmtNum(top.ppm)} ppm</div><div class="s">${esc(top.ing.ko.split(' (')[0])} (대표) · ${passN}/${r.actives.length} Pass</div></div>
        <div class="tile"><div class="k"><i>②</i>제형 pH</div><div class="v num">${p.ph[0].toFixed(1)}~${p.ph[1].toFixed(1)}</div><div class="s">${phLabel(p.ph)}</div></div>
        <div class="tile"><div class="k"><i>③</i>평균 분자량</div><div class="v num">${E.fmtMw(Math.round(r.avgMw))}</div><div class="s">함량 가중 평균 · ${r.avgMw > E.MW_LIMIT ? '500 Da 초과' : '500 Da 이하'}</div></div>
        <div class="tile"><div class="k"><i>④</i>DDS 기술</div><div class="v">${p.dds.length ? p.dds.map(ddsShort).join(', ') : '미적용'}</div><div class="s">${p.dds.length ? DDS[p.dds[0]].size : '원료 자체 투과성 의존'}</div></div>
      </div>

      ${accordion(1, '유효성분 실체 & PPM 농도', '성분명 · 함량(PPM/%) · 유효 농도 충족 여부', section1(r), statusBadges(r))}
      ${accordion(2, '제형학적 스펙', 'pH 범위 · 유화 타입 · 분자량(Da)', section2(r), [chip('navy', phStr(p.ph)), chip('', p.emulsion.split(' ')[0])].join(''))}
      ${accordion(3, 'DDS 침투 기술', '전달체 적용 여부 및 메커니즘', section3(r), p.dds.length ? p.dds.map((d) => chip('info', ddsShort(d))).join('') : chip('', '미적용'))}
      ${accordion(4, '마케팅 팩트폭격 (Fact Check)', '마케팅 문구 vs 제형학적 실체', section4(r), verdictBadges(r))}
      ${footer()}`;
  }

  function phLabel([lo, hi]) {
    if (hi <= 3.6) return '강산성 · 비타민C 활성 구간';
    if (hi <= 4.2) return '산성 · AHA/BHA 활성 구간';
    if (lo >= 4.5 && hi <= 5.6) return '약산성 · 피부 장벽 pH';
    if (lo >= 5.0 && hi <= 6.6) return '약산성~중성 근접';
    return '중성 구간';
  }

  function statusBadges(r) {
    const c = { PASS: 0, WARN: 0, UNDER: 0 };
    r.actives.forEach((a) => c[a.status]++);
    return Object.entries(c).filter(([, n]) => n).map(([k, n]) => chip(STATUS[k].cls, `${k === 'UNDER' ? 'PPM 미달' : STATUS[k].label.split(' ')[0]} ${n}`)).join('');
  }
  function verdictBadges(r) {
    const c = { FALSE: 0, WARN: 0, FACT: 0 };
    r.claims.forEach((x) => c[x.verdict]++);
    return Object.entries(c).filter(([, n]) => n).map(([k, n]) => chip(VERDICT[k].cls, `${VERDICT[k].label} ${n}`)).join('');
  }

  function accordion(n, title, sub, body, badges) {
    return `
      <details class="card acc" open>
        <summary>
          <span class="step">${n}</span>
          <div><div class="t">${title}</div><div class="st">${sub}</div></div>
          <span class="sum-badges">${badges || ''}</span>
          <span class="chev">${ico('chev')}</span>
        </summary>
        <div class="body">${body}</div>
      </details>`;
  }

  function section1(r) {
    const rows = r.actives.map((a) => {
      const st = STATUS[a.status];
      const ev = E.EVIDENCE[a.ing.evidence];
      return `
        <tr>
          <td class="ing-name"><b>${esc(a.ing.ko)}</b><span>${esc(a.ing.inci)}</span></td>
          <td class="r"><span class="num"><b>${E.fmtNum(a.ppm)}</b> ppm</span><div class="xs muted num">${E.fmtPpm(a.ppm).split('(')[1].replace(')', '')}</div>
            <div class="bar" title="로그 스케일 1~1,000,000 ppm · 세로선 = 유효 기준"><i class="${st.cls}" style="width:${logPos(Math.max(a.ppm, 1), 1, 1e6)}%"></i><em style="left:${logPos(a.ing.minPpm, 1, 1e6)}%"></em></div></td>
          <td class="r num small">≥ ${E.fmtNum(a.ing.minPpm)}</td>
          <td>${chip(st.cls, st.label, st.icon)}</td>
          <td>${a.reclassified ? chip('danger', '단순 보습/항산화 (재분류)') : chip(ev.tone, ev.ko)}<div class="xs muted" style="margin-top:4px">${esc(a.ing.note)}</div></td>
        </tr>`;
    }).join('');

    const under = r.actives.filter((a) => a.status === 'UNDER');
    const concept = r.actives.filter((a) => a.reclassified);
    const warn = r.actives.filter((a) => a.status === 'WARN');
    return `
      <div class="tbl-wrap"><table class="spec">
        <thead><tr><th>성분명</th><th class="r">함량 (PPM / %)</th><th class="r">유효 기준</th><th>판정</th><th>근거 등급</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="bar-legend"><span><i style="background:var(--pass)"></i>유효 농도 충족</span><span><i style="background:var(--warn)"></i>유효 기준 미달</span><span><i style="background:var(--danger)"></i>10 ppm 이하 (컨셉 처방)</span><span><i style="background:var(--navy);width:2px"></i>유효 기준선 (로그 스케일)</span></div>
      ${under.map((a) => `<div class="alert danger">${ico('x')}<div><b>[PPM 미달 경고]</b> ${esc(a.ing.ko)} ${E.fmtPpm(a.ppm)} — 10 ppm 이하는 전성분 표기용 컨셉 처방 수준으로 효능을 기대할 수 없습니다.</div></div>`).join('')}
      ${concept.map((a) => `<div class="alert warn">${ico('warn')}<div><b>등급 재분류</b> ${esc(a.ing.ko)} — 인체 작용 기전·임상 근거 미흡으로 '고효능 재생' 등급에서 제외, <b>단순 보습/항산화</b>로 분류합니다.</div></div>`).join('')}
      ${warn.map((a) => `<div class="alert warn">${ico('warn')}<div><b>유효 농도 미달</b> ${esc(a.ing.ko)} ${E.fmtPpm(a.ppm)} — 기준 ${E.fmtPpm(a.ing.minPpm)} 대비 ${Math.round((a.ppm / a.ing.minPpm) * 100)}% 수준.</div></div>`).join('')}`;
  }

  function section2(r) {
    const p = r.product;
    const x = (v) => (v / 14) * 100;
    const phRows = r.actives.filter((a) => a.ing.optimalPh).map((a) => {
      const [lo, hi] = a.ing.optimalPh;
      const tone = { fit: 'pass', partial: 'warn', mismatch: 'danger' }[a.phFit];
      const label = { fit: '최적 pH 충족', partial: '일부 겹침', mismatch: 'pH 불일치' }[a.phFit];
      return `<div class="ph-row"><span>${esc(a.ing.ko.split(' (')[0])} <span class="xs muted num">${lo}~${hi}</span></span>
        <div class="track"><span style="left:${x(lo)}%;width:${x(hi - lo)}%;background:var(--${tone})"></span><em style="left:${x(p.ph[0])}%;width:${Math.max(x(p.ph[1] - p.ph[0]), 0.8)}%"></em></div>
        ${chip(tone, label)}</div>`;
    }).join('');

    const mwItems = r.actives.map((a) => a.ing).filter((i) => i.mw != null);
    const noMw = r.actives.filter((a) => a.ing.mw == null);
    const MIN = 10, MAX = 1e6;
    const ticks = [100, 500, 1000, 10000, 100000, 1e6];

    return `
      <div class="kv">
        <div><div class="k">제형 pH 범위</div><div class="v num">${p.ph[0].toFixed(1)} ~ ${p.ph[1].toFixed(1)}</div><div class="xs muted">${phLabel(p.ph)}</div></div>
        <div><div class="k">유화 타입</div><div class="v">${esc(p.emulsion)}</div></div>
        <div><div class="k">유효성분 평균 분자량</div><div class="v num">${E.fmtMw(Math.round(r.avgMw))}</div><div class="xs muted">함량 가중 평균</div></div>
      </div>

      <div class="sub-h">${ico('flask', 15)} 제형 pH 스케일</div>
      <div class="ph-gauge">
        <div class="ph-scale"><div class="ph-range" style="left:${x(p.ph[0])}%;width:${Math.max(x(p.ph[1] - p.ph[0]), 1)}%" title="제형 ${phStr(p.ph)}"></div></div>
        <div class="ph-ticks">${[0, 2, 4, 6, 8, 10, 12, 14].map((t) => `<span>${t}</span>`).join('')}</div>
      </div>
      ${phRows ? `<div class="ph-rows">${phRows}</div><div class="xs muted" style="margin-top:6px">컬러 막대 = 원료 최적 pH · 테두리 박스 = 제형 pH</div>` : `<div class="xs muted">pH 의존성이 큰 유효성분 없음.</div>`}

      <div class="sub-h">${ico('flask', 15)} 유효성분 분자량 (로그 스케일 · 500 Da 룰)</div>
      <div class="mw-chart">
        ${mwItems.map((i) => `<div class="mw-row"><span>${esc(i.ko.split(' (')[0])}</span>
          <div class="mw-track"><i class="${i.mw > E.MW_LIMIT ? 'over' : ''}" style="width:${logPos(i.mw, MIN, MAX)}%"></i><span class="mw-line" style="left:${logPos(500, MIN, MAX)}%"></span></div>
          <span class="num small" style="text-align:right">${E.fmtMw(i.mw)}</span></div>`).join('')}
        <div class="mw-axis"><div></div><div>${ticks.map((t) => `<span style="left:${logPos(t, MIN, MAX)}%">${t >= 1e6 ? '1M' : t >= 1000 ? t / 1000 + 'k' : t}</span>`).join('')}</div><div></div></div>
      </div>
      ${noMw.map((a) => `<div class="alert info">${ico('info')}<div>${esc(a.ing.ko)} — ${esc(a.ing.size)}. 분자량 기준 적용 불가 (나노 소포체).</div></div>`).join('')}
      ${mwItems.filter((i) => i.mw > E.MW_LIMIT).length ? `<div class="alert warn">${ico('warn')}<div><b>500 Da 초과:</b> ${mwItems.filter((i) => i.mw > E.MW_LIMIT).map((i) => esc(i.ko.split(' (')[0])).join(', ')} → <b>진피 침투 불가 / 표피 단순 보습용</b>.</div></div>` : ''}`;
  }

  function section3(r) {
    const p = r.product;
    const big = r.actives.filter((a) => a.overMw);
    const cards = Object.entries(DDS).map(([k, d]) => {
      const on = p.dds.includes(k);
      return `<div class="dds ${on ? 'on' : 'off'}">
        <h4>${on ? ico('check', 16) : ico('x', 16)} ${esc(d.ko)}</h4>
        <div class="size">${esc(d.size)} · ${on ? '적용' : '미적용'}</div>
        ${on ? `<p><b>메커니즘</b> ${esc(d.mechanism)}</p><p class="lim"><b>한계</b> ${esc(d.limit)}</p>` : ''}
      </div>`;
    }).join('');
    let note = '';
    if (!p.dds.length) note = `<div class="alert info">${ico('info')}<div>DDS 미적용 — 유효성분의 침투는 원료 자체 분자량·pH·용해도에 의존합니다.</div></div>`;
    else if (big.length) note = `<div class="alert warn">${ico('warn')}<div>${p.dds.map(ddsShort).join('·')} 적용 제품이지만 ${big.map((a) => esc(a.ing.ko.split(' (')[0])).join(', ')}은(는) 500 Da 초과 — 전달체가 고분자를 진피까지 운반한다는 근거는 없습니다.</div></div>`;
    else note = `<div class="alert navy">${ico('check')}<div><b>합리적 조합</b> — 저분자 유효성분 + ${p.dds.map(ddsShort).join('·')} 조합으로 각질층 체류·안정성 개선을 기대할 수 있습니다.</div></div>`;
    return note + `<div class="dds-grid" style="margin-top:12px">${cards}</div>`;
  }

  function section4(r) {
    if (!r.claims.length) return '<p class="muted">등록된 마케팅 문구가 없습니다.</p>';
    return r.claims.map((c) => {
      const v = VERDICT[c.verdict];
      return `<div class="fact ${c.verdict}"><div class="fact-grid">
        <div class="claim"><div class="lab muted">${ico('bolt', 13)} 마케팅 문구</div><div class="quote">"${esc(c.text)}"</div></div>
        <div class="real"><div class="lab">${ico(v.icon, 13)} 제형학적 실체 · ${v.label}</div><ul>${c.reasons.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      </div></div>`;
    }).join('');
  }

  /* ───────── 3. Precision Filter Search ───────── */
  const PH_PRESETS = [
    { key: 'all', label: '전체', range: null },
    { key: 'vc', label: 'pH 3.0~3.5', sub: '비타민C 활성화', range: [3.0, 3.5] },
    { key: 'acid', label: 'pH 3.5~4.0', sub: 'AHA·BHA 활성', range: [3.5, 4.0] },
    { key: 'barrier', label: 'pH 5.0~5.5', sub: '약산성 장벽', range: [5.0, 5.5] },
    { key: 'custom', label: '직접 입력', range: null },
  ];
  const ING_PRESETS = [
    { id: 'niacinamide', minPpm: 20000 }, { id: 'panthenol', minPpm: 50000 },
    { id: 'l_ascorbic', minPpm: 100000 }, { id: 'retinol', minPpm: 750 }, { id: 'ceramide_np', minPpm: 5000 },
  ];
  const fState = { category: '', ingredients: [{ id: '', minPpm: '' }], phKey: 'all', phCustom: [4.5, 5.5], dds: [], excludeConcept: false };

  function renderFilter() {
    const ingOptions = Object.entries(INGREDIENTS).sort((a, b) => a[1].ko.localeCompare(b[1].ko, 'ko'))
      .map(([id, i]) => `<option value="${id}">${esc(i.ko)}</option>`).join('');
    $app.innerHTML = `
      <div class="page-h"><div class="eyebrow" style="color:var(--mint-ink)">Precision Filter</div><h1>정밀 데이터 필터</h1><p>숫자로 직접 조건을 지정해 제품을 스크리닝합니다.</p></div>
      <div class="filter-layout">
        <aside class="card panel">
          <div class="fgroup">
            <h3>${ico('flask', 15)} 성분 함량 (PPM)</h3>
            <div id="cond-rows"></div>
            <button class="link-btn" id="add-cond">${ico('plus', 13)} 조건 추가</button>
            <div class="presets">${ING_PRESETS.map((x, i) => `<button data-preset="${i}">${esc(INGREDIENTS[x.id].ko.split(' (')[0])} ≥ ${E.fmtNum(x.minPpm)}</button>`).join('')}</div>
          </div>
          <div class="fgroup">
            <h3>${ico('flask', 15)} 제형 pH</h3>
            <div class="chips-select" id="ph-chips">${PH_PRESETS.map((x) => `<button data-ph="${x.key}">${x.label}${x.sub ? `<small>${x.sub}</small>` : ''}</button>`).join('')}</div>
            <div class="ph-custom hidden" id="ph-custom">
              <input class="field num" type="number" step="0.1" min="0" max="14" id="ph-lo" value="${fState.phCustom[0]}" aria-label="pH 최소" /> ~
              <input class="field num" type="number" step="0.1" min="0" max="14" id="ph-hi" value="${fState.phCustom[1]}" aria-label="pH 최대" />
            </div>
          </div>
          <div class="fgroup">
            <h3>${ico('layers', 15)} DDS 기술 <span class="chip">하나라도 적용</span></h3>
            <div class="checks">${Object.entries(DDS).map(([k, d]) => `<label><input type="checkbox" value="${k}" ${fState.dds.includes(k) ? 'checked' : ''}/>${esc(d.ko.split(' ')[0])}</label>`).join('')}</div>
          </div>
          <div class="fgroup">
            <h3>제품 유형</h3>
            <select class="field" id="cat">${['', ...Object.keys(CATEGORIES)].map((k) => `<option value="${k}" ${fState.category === k ? 'selected' : ''}>${k ? CATEGORIES[k] : '전체'}</option>`).join('')}</select>
          </div>
          <div class="fgroup">
            <div class="toggle-row">
              <div class="txt"><b>헛소리 방지 모드</b><span>마케팅 컨셉 성분·PPM 미달 제품 제외</span></div>
              <label class="switch"><input type="checkbox" id="no-bs" ${fState.excludeConcept ? 'checked' : ''}/><span></span></label>
            </div>
          </div>
          <div class="fgroup"><button class="btn ghost" id="reset" style="width:100%">조건 초기화</button></div>
        </aside>
        <section><div class="result-h"><b id="result-count"></b><span class="xs muted">Spec Score 순</span></div><div id="results"></div></section>
      </div>`;

    const rowsEl = document.getElementById('cond-rows');
    const drawRows = () => {
      rowsEl.innerHTML = fState.ingredients.map((c, i) => `
        <div class="cond-row">
          <select data-i="${i}" data-f="id" aria-label="성분"><option value="">성분 선택</option>${ingOptions}</select>
          <div class="unit"><input class="num" data-i="${i}" data-f="minPpm" type="number" min="0" step="1000" placeholder="최소" value="${esc(c.minPpm)}" aria-label="최소 함량 ppm"/></div>
          <button class="icon-btn" data-del="${i}" aria-label="조건 삭제">${ico('x', 14)}</button>
        </div>`).join('');
      rowsEl.querySelectorAll('select').forEach((s) => { s.value = fState.ingredients[s.dataset.i].id; });
    };
    rowsEl.addEventListener('input', (e) => {
      const { i, f } = e.target.dataset;
      if (i == null) return;
      fState.ingredients[i][f] = e.target.value;
      if (f === 'id' && !fState.ingredients[i].minPpm && e.target.value) {
        fState.ingredients[i].minPpm = INGREDIENTS[e.target.value].minPpm;
        drawRows();
      }
      updateResults();
    });
    rowsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-del]');
      if (!b) return;
      fState.ingredients.splice(+b.dataset.del, 1);
      if (!fState.ingredients.length) fState.ingredients.push({ id: '', minPpm: '' });
      drawRows(); updateResults();
    });
    document.getElementById('add-cond').onclick = () => { fState.ingredients.push({ id: '', minPpm: '' }); drawRows(); };
    document.querySelectorAll('[data-preset]').forEach((b) => b.onclick = () => {
      const pr = ING_PRESETS[b.dataset.preset];
      const empty = fState.ingredients.findIndex((c) => !c.id);
      const existing = fState.ingredients.findIndex((c) => c.id === pr.id);
      const row = { id: pr.id, minPpm: pr.minPpm };
      if (existing >= 0) fState.ingredients[existing] = row;
      else if (empty >= 0) fState.ingredients[empty] = row;
      else fState.ingredients.push(row);
      drawRows(); updateResults();
    });

    const phChips = document.getElementById('ph-chips');
    const drawPh = () => {
      phChips.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.ph === fState.phKey));
      document.getElementById('ph-custom').classList.toggle('hidden', fState.phKey !== 'custom');
    };
    phChips.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; fState.phKey = b.dataset.ph; drawPh(); updateResults(); };
    ['ph-lo', 'ph-hi'].forEach((id, i) => document.getElementById(id).addEventListener('input', (e) => { fState.phCustom[i] = parseFloat(e.target.value); updateResults(); }));

    document.querySelectorAll('.checks input').forEach((c) => c.onchange = () => {
      fState.dds = [...document.querySelectorAll('.checks input:checked')].map((x) => x.value); updateResults();
    });
    document.getElementById('cat').onchange = (e) => { fState.category = e.target.value; updateResults(); };
    document.getElementById('no-bs').onchange = (e) => { fState.excludeConcept = e.target.checked; updateResults(); };
    document.getElementById('reset').onclick = () => {
      Object.assign(fState, { category: '', ingredients: [{ id: '', minPpm: '' }], phKey: 'all', dds: [], excludeConcept: false });
      renderFilter();
    };

    drawRows(); drawPh(); updateResults();
  }

  function updateResults() {
    let ph = null;
    if (fState.phKey === 'custom') {
      const [lo, hi] = fState.phCustom;
      if (!isNaN(lo) && !isNaN(hi)) ph = [Math.min(lo, hi), Math.max(lo, hi)];
    } else ph = PH_PRESETS.find((x) => x.key === fState.phKey).range;
    const list = E.filter({ category: fState.category, ingredients: fState.ingredients, ph, dds: fState.dds, excludeConcept: fState.excludeConcept });
    document.getElementById('result-count').textContent = `${list.length}개 제품 일치`;
    document.getElementById('results').innerHTML = list.length
      ? `<div class="plist">${list.map(productCard).join('')}</div>`
      : `<div class="card empty">${ico('filter')}<p>조건을 만족하는 제품이 없습니다.<br/>함량 기준을 낮추거나 pH 범위를 넓혀 보세요.</p></div>`;
  }

  /* ───────── 4. Custom Routine Match ───────── */
  const rState = { conditions: [], excludeConcept: true };

  function renderRoutine() {
    $app.innerHTML = `
      <div class="page-h"><div class="eyebrow" style="color:var(--mint-ink)">Custom Routine Match</div><h1>맞춤형 조합 추천</h1><p>피부 상태를 선택하면 성분 충돌을 자동 검증한 뒤, 유효 농도를 충족하는 제품으로 AM/PM 2~3단계 루틴을 구성합니다.</p></div>
      <div class="card pad">
        <div class="sub-h">피부 상태 (복수 선택)</div>
        <div class="chips-select" id="cond-chips">${Object.entries(CONDITIONS).map(([k, c]) => `<button data-c="${k}" class="${rState.conditions.includes(k) ? 'on' : ''}">${c.ko}<small>${c.desc}</small></button>`).join('')}</div>
        <div class="toggle-row" style="margin-top:16px">
          <div class="txt"><b>헛소리 방지 모드</b><span>컨셉 원료·PPM 미달 제품은 추천에서 제외</span></div>
          <label class="switch"><input type="checkbox" id="r-no-bs" ${rState.excludeConcept ? 'checked' : ''}/><span></span></label>
        </div>
      </div>
      <div id="routine-out"></div>`;
    document.getElementById('cond-chips').onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const k = b.dataset.c;
      rState.conditions = rState.conditions.includes(k) ? rState.conditions.filter((x) => x !== k) : [...rState.conditions, k];
      b.classList.toggle('on');
      drawRoutine();
    };
    document.getElementById('r-no-bs').onchange = (e) => { rState.excludeConcept = e.target.checked; drawRoutine(); };
    drawRoutine();
  }

  function drawRoutine() {
    const out = document.getElementById('routine-out');
    if (!rState.conditions.length) {
      out.innerHTML = `<div class="card empty" style="margin-top:14px">${ico('layers')}<p>피부 상태를 하나 이상 선택하세요.</p></div>${conflictTable()}`;
      return;
    }
    const res = E.routine(rState.conditions, { excludeConcept: rState.excludeConcept });
    const slotCard = (slot) => {
      const steps = res.slots[slot];
      return `<div class="card">
        <div class="slot-h">${ico(slot === 'AM' ? 'sun' : 'moon')} ${slot === 'AM' ? 'AM 루틴' : 'PM 루틴'}${chip(slot === 'AM' ? 'info' : 'navy', `${steps.length}단계`)}</div>
        <div class="steps">${steps.length ? steps.map((s, i) => {
          const p = s.r.product;
          return `<div class="rstep"><span class="n">${i + 1}</span><div>
            <div class="cat">${CATEGORIES[s.cat]}</div>
            <a class="pn" href="#/product/${p.id}">${esc(p.brand)} · ${esc(p.name)}</a>
            <div class="why">${chip(`grade-chip ${s.r.grade === 'A' ? 'navy' : s.r.grade === 'B' ? 'pass' : 'warn'}`, `Spec ${s.r.score}`)}${chip('', phStr(p.ph))}${p.dds.map((d) => chip('info', ddsShort(d))).join('')}</div>
            <div class="why">${s.matched.filter((m) => !m.avoid).map((m) => chip(m.status === 'PASS' ? 'pass' : 'warn', `${m.ing.ko.split(' (')[0]} ${E.fmtNum(m.ppm)}ppm`)).join('')}</div>
          </div></div>`;
        }).join('') : `<p class="muted small">조건에 맞는 제품이 없습니다. 헛소리 방지 모드를 끄거나 다른 피부 상태를 선택해 보세요.</p>`}</div>
      </div>`;
    };

    // 같은 시간대 내 잔여 충돌 최종 검증
    const residual = [];
    ['AM', 'PM'].forEach((slot) => {
      const ps = res.slots[slot].map((s) => s.r.product);
      for (let i = 0; i < ps.length; i++) for (let j = i; j < ps.length; j++)
        E.conflictsBetween(ps[i], ps[j]).filter((c) => c.level !== 'info').forEach((c) => residual.push({ slot, c }));
    });
    const seen = new Set();
    const logItems = res.log.filter((l) => {
      const key = `${l.type}|${l.slot || ''}|${l.conflict.a}|${l.conflict.b}|${l.product?.id || ''}`;
      if (seen.has(key)) return false; seen.add(key); return true;
    }).map((l) => {
      const nm = (id) => INGREDIENTS[id].ko.split(' (')[0];
      const pair = `${nm(l.conflict.a)} + ${nm(l.conflict.b)}`;
      if (l.type === 'skip') return `<div class="alert warn">${ico('warn')}<div><b>[${l.slot}] 후보 제외</b> ${esc(l.product.name)} — ${esc(l.with.name)}와 ${pair} 충돌. ${esc(l.conflict.reason)}</div></div>`;
      if (l.type === 'split') return `<div class="alert navy">${ico('check')}<div><b>AM/PM 분리로 해결</b> ${pair} — ${esc(l.conflict.fix)}</div></div>`;
      return `<div class="alert info">${ico('info')}<div><b>[${l.slot}] 동시 사용 가능</b> ${pair} — ${esc(l.conflict.reason)}</div></div>`;
    }).join('');

    out.innerHTML = `
      <div class="section-h"><h2>${ico('layers', 16)} 추천 루틴</h2><span class="xs muted">${rState.conditions.map((c) => CONDITIONS[c].ko).join(' + ')}</span></div>
      <div class="routine-cols">${slotCard('AM')}${slotCard('PM')}</div>
      <div class="section-h"><h2>${ico('flask', 16)} 성분 충돌 자동 검증</h2></div>
      <div class="log">
        ${residual.length
          ? residual.map((x) => `<div class="alert danger">${ico('x')}<div><b>[${x.slot}] 충돌 잔존</b> ${esc(x.c.reason)}</div></div>`).join('')
          : `<div class="alert navy">${ico('check')}<div><b>동일 시간대 충돌 0건</b> — 모든 단계 조합이 pH·자극 충돌 검증을 통과했습니다.</div></div>`}
        ${logItems}
      </div>
      ${conflictTable()}
      <p class="footer-note">추천은 [샘플] 제품 DB 기준입니다. 실존 제품 DB를 연결하면 동일 로직으로 시중 제품을 매칭합니다.</p>`;
  }

  function conflictTable() {
    const lv = { high: ['danger', '고위험'], medium: ['warn', '주의'], info: ['info', '속설'] };
    return `<details class="card acc" style="margin-top:16px"><summary><span class="step">!</span><div><div class="t">성분 충돌 매트릭스</div><div class="st">검증에 사용하는 충돌 규칙 ${CONFLICTS.length}건</div></div><span class="chev">${ico('chev')}</span></summary>
      <div class="body"><div class="tbl-wrap"><table class="spec"><thead><tr><th>조합</th><th>등급</th><th>이유</th><th>해결</th></tr></thead><tbody>
      ${CONFLICTS.map((c) => `<tr><td><b>${esc(INGREDIENTS[c.a].ko.split(' (')[0])}</b><br/>+ ${esc(INGREDIENTS[c.b].ko.split(' (')[0])}</td><td>${chip(lv[c.level][0], lv[c.level][1])}</td><td class="small">${esc(c.reason)}</td><td class="small">${esc(c.fix)}</td></tr>`).join('')}
      </tbody></table></div></div></details>`;
  }

  /* ───────── OCR Scan ───────── */
  const SAMPLE_INCI = '정제수, 글리세린, 부틸렌글라이콜, 나이아신아마이드, 1,2-헥산다이올, 판테놀, 소듐하이알루로네이트, 하이드롤라이즈드콜라겐, 세라마이드엔피, 하이드로제네이티드레시틴, 카보머, 트로메타민, 알란토인, 아데노신, 잔탄검, 다이소듐이디티에이, 녹차PDRN, 엑소좀';
  let tesseractLoading = null;
  const loadTesseract = () => tesseractLoading ||= new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    s.onload = () => res(window.Tesseract);
    s.onerror = () => { tesseractLoading = null; rej(new Error('OCR 엔진을 불러오지 못했습니다 (네트워크 확인).')); };
    document.head.appendChild(s);
  });

  function renderScan() {
    $app.innerHTML = `
      <div class="page-h"><div class="eyebrow" style="color:var(--mint-ink)">INCI OCR Scan</div><h1>전성분 OCR 스캔</h1><p>제품 뒷면 전성분 사진을 찍거나 텍스트를 붙여 넣으면 유효성분·컨셉 원료·분자량을 자동 판독합니다.</p></div>
      <div class="scan-layout">
        <div class="card pad">
          <div class="sub-h">${ico('scan', 15)} 1. 전성분 이미지</div>
          <label class="drop" id="drop">
            <input type="file" accept="image/*" capture="environment" id="file" class="hidden" />
            <div id="drop-inner">${ico('image')}<p style="margin:8px 0 0"><b>카메라 촬영 / 이미지 선택</b><br/><span class="xs muted">한글·영문 전성분 인식 (kor+eng)</span></p></div>
          </label>
          <div class="btn-row"><button class="btn primary" id="ocr-run" disabled>${ico('scan', 16)} OCR 실행</button></div>
          <div class="progress hidden" id="ocr-prog"><i></i></div>
          <div class="xs muted" id="ocr-status" style="margin-top:6px"></div>
        </div>
        <div class="card pad">
          <div class="sub-h">${ico('flask', 15)} 2. 전성분 텍스트 (수정 가능)</div>
          <textarea class="field" id="inci" placeholder="쉼표로 구분된 전성분을 붙여 넣으세요"></textarea>
          <div class="btn-row">
            <button class="btn primary" id="analyze">${ico('bolt', 16)} 성분 판독</button>
            <button class="btn ghost" id="sample">샘플 전성분</button>
          </div>
        </div>
      </div>
      <div id="scan-out"></div>`;

    let file = null;
    const fileEl = document.getElementById('file');
    fileEl.onchange = () => {
      file = fileEl.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      document.getElementById('drop-inner').innerHTML = `<img src="${url}" alt="선택한 전성분 이미지" />`;
      document.getElementById('ocr-run').disabled = false;
    };
    document.getElementById('ocr-run').onclick = async () => {
      if (!file) return;
      const prog = document.getElementById('ocr-prog'); const bar = prog.querySelector('i'); const st = document.getElementById('ocr-status');
      prog.classList.remove('hidden'); st.textContent = 'OCR 엔진 로딩 중…';
      try {
        const T = await loadTesseract();
        const { data } = await T.recognize(file, 'kor+eng', {
          logger: (m) => { if (m.progress != null) bar.style.width = `${Math.round(m.progress * 100)}%`; st.textContent = `${m.status} ${m.progress != null ? Math.round(m.progress * 100) + '%' : ''}`; },
        });
        const text = data.text.replace(/\n(?!\s*\n)/g, ' ').replace(/\s{2,}/g, ' ').trim();
        document.getElementById('inci').value = text;
        st.textContent = '인식 완료 — 오인식된 글자가 있으면 텍스트를 수정한 뒤 다시 판독하세요.';
        drawScan(text);
      } catch (err) {
        st.textContent = err.message || String(err);
      }
    };
    document.getElementById('sample').onclick = () => { document.getElementById('inci').value = SAMPLE_INCI; drawScan(SAMPLE_INCI); };
    document.getElementById('analyze').onclick = () => drawScan(document.getElementById('inci').value);
  }

  function drawScan(text) {
    const rows = E.parseInci(text);
    const out = document.getElementById('scan-out');
    if (!rows.length) { out.innerHTML = ''; return; }
    const matched = rows.filter((r) => r.match);
    const concept = matched.filter((r) => r.match.ing.evidence === 'concept');
    const over = matched.filter((r) => r.match.ing.mw > E.MW_LIMIT);
    const tail = matched.filter((r) => r.flags.some((f) => f.text.startsWith('말단')));
    const dds = rows.filter((r) => r.dds);

    out.innerHTML = `
      <div class="section-h"><h2>${ico('bolt', 16)} 판독 결과</h2><span class="xs muted num">전성분 ${rows.length}종 · 유효성분 ${matched.length}종</span></div>
      <div class="stats" style="margin-top:0">
        <div class="stat"><div class="k">인식 유효성분</div><div class="v num">${matched.length}</div></div>
        <div class="stat danger"><div class="k">컨셉 원료</div><div class="v num">${concept.length}</div></div>
        <div class="stat warn"><div class="k">500 Da 초과</div><div class="v num">${over.length}</div></div>
        <div class="stat"><div class="k">DDS 단서</div><div class="v num">${dds.length}</div></div>
      </div>
      ${tail.length ? `<div class="alert danger">${ico('x')}<div><b>[PPM 미달 의심]</b> ${tail.map((r) => esc(r.raw)).join(', ')} — 전성분 말단(하위 40%)에 표기된 컨셉 원료입니다. 광고 메인 성분이라면 10 ppm 이하 컨셉 처방일 가능성이 높습니다.</div></div>` : ''}
      <div class="alert info">${ico('info')}<div>전성분은 함량순 표기이나 <b>1% 이하 원료는 순서 무관</b>입니다. 정확한 PPM은 제조사 공개 자료로만 확인 가능하며, 여기서는 표기 순위·분자량·근거 등급으로 1차 스크리닝합니다.</div></div>
      <div class="card" style="margin-top:10px"><div class="tbl-wrap"><table class="spec">
        <thead><tr><th class="r">순위</th><th>표기 원료</th><th>판독</th><th class="r">분자량</th><th>근거 등급</th><th>플래그</th></tr></thead>
        <tbody>${rows.map((r) => {
          if (r.dds) return `<tr><td class="r num">${r.rank}</td><td>${esc(r.raw)}</td><td colspan="4">${chip('info', `DDS 단서 · ${r.dds.ko.split(' ')[0]} 가능성`)}</td></tr>`;
          if (!r.match) return `<tr style="color:var(--ink-3)"><td class="r num">${r.rank}</td><td>${esc(r.raw)}</td><td colspan="4" class="xs">베이스·기능성 부원료</td></tr>`;
          const ing = r.match.ing; const ev = E.EVIDENCE[ing.evidence];
          return `<tr><td class="r num">${r.rank}</td><td><b>${esc(r.raw)}</b></td><td class="ing-name"><b>${esc(ing.ko)}</b><span>${esc(ing.inci)}</span></td>
            <td class="r num small">${ing.mw == null ? '—' : E.fmtMw(ing.mw)}</td><td>${chip(ev.tone, ev.ko)}</td>
            <td><div class="why" style="display:flex;flex-wrap:wrap;gap:4px">${r.flags.map((f) => chip(f.tone, f.text)).join('') || chip('pass', '이상 없음', 'check')}</div></td></tr>`;
        }).join('')}</tbody>
      </table></div></div>`;
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ───────── Router ───────── */
  const NAV = [['home', 'home', '홈'], ['filter', 'filter', '정밀 필터'], ['routine', 'layers', '루틴 매칭'], ['scan', 'scan', 'OCR 스캔']];
  document.getElementById('logo-mark').innerHTML = ico('flask', 18);
  NAV.forEach(([k, icon, label]) => { document.querySelector(`[data-nav="${k}"]`).innerHTML = `${ico(icon, 18)}<span>${label}</span>`; });

  function route() {
    const [path, qs] = (location.hash.slice(1) || '/').split('?');
    const parts = path.split('/').filter(Boolean);
    const params = new URLSearchParams(qs || '');
    const view = parts[0] || 'home';
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === (['product', 'search'].includes(view) ? 'home' : view)));
    if (view === 'product') renderProduct(parts[1]);
    else if (view === 'search') renderSearch(params.get('q') || '');
    else if (view === 'filter') renderFilter();
    else if (view === 'routine') {
      const c = (params.get('c') || '').split(',').filter((k) => CONDITIONS[k]);
      if (c.length) rState.conditions = c;
      renderRoutine();
    }
    else if (view === 'scan') renderScan();
    else renderHome();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
