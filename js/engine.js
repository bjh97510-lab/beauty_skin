/* Spec Direct — 핵심 검증 로직 (과장 마케팅 스크리닝 · 스펙 스코어 · 필터 · 루틴 매칭) */
(function () {
  const { INGREDIENTS, DDS, CONFLICTS, CONDITIONS, PRODUCTS } = SD;

  const MW_LIMIT = 500;          // Da — 500 Da 룰
  const CONCEPT_PPM = 10;        // ppm 이하 = 컨셉 처방

  const EVIDENCE = {
    established: { ko: '임상 근거 확립', tone: 'pass' },
    moderate: { ko: '근거 일부', tone: 'info' },
    limited: { ko: '외용 근거 미흡', tone: 'warn' },
    concept: { ko: '마케팅 컨셉 원료', tone: 'danger' },
  };

  const fmtNum = (n) => Number(n).toLocaleString('ko-KR');
  const fmtPpm = (ppm) => {
    const pct = ppm / 10000;
    const pctStr = pct >= 1 ? pct.toFixed(pct % 1 ? 1 : 0) : pct >= 0.01 ? pct.toFixed(2).replace(/0$/, '') : pct.toFixed(4).replace(/0+$/, '');
    return `${fmtNum(ppm)} ppm (${pctStr}%)`;
  };
  const fmtMw = (mw) => (mw == null ? '—' : mw >= 10000 ? `${fmtNum(Math.round(mw / 1000))} kDa` : `${fmtNum(mw)} Da`);

  /* ── 원료 단위 판정 ── */
  function assessActive(active) {
    const ing = INGREDIENTS[active.id];
    let status = 'PASS';
    if (active.ppm <= CONCEPT_PPM) status = 'UNDER';
    else if (active.ppm < ing.minPpm) status = 'WARN';

    const overMw = ing.mw != null && ing.mw > MW_LIMIT;
    const reclassified = ing.evidence === 'concept';
    return {
      ...active, ing, status, overMw, reclassified,
      tier: reclassified ? '단순 보습/항산화 (재분류)' : ing.roles.join(' · '),
      penetration: ing.mw == null ? '소포체 — 분자량 기준 적용 불가' : overMw ? '진피 침투 불가 · 표피 단순 보습용' : '각질층 투과 가능 분자량',
    };
  }

  function phFit(product, ing) {
    if (!ing.optimalPh) return null;
    const [lo, hi] = ing.optimalPh;
    const [pLo, pHi] = product.ph;
    if (pHi < lo || pLo > hi) return 'mismatch';
    if (pLo >= lo && pHi <= hi) return 'fit';
    return 'partial';
  }

  /* ── 마케팅 문구 팩트체크 ── */
  function checkClaim(product, claim, assessed) {
    const a = assessed.find((x) => x.id === claim.ingredient);
    const ing = INGREDIENTS[claim.ingredient];
    const ddsNames = product.dds.map((d) => DDS[d].ko.split(' ')[0]);
    let verdict = 'FACT';
    const reasons = [];

    if (claim.type === 'dermis') {
      if (ing.mw == null || ing.mw > MW_LIMIT) {
        verdict = 'FALSE';
        reasons.push(`${ing.ko} 분자량 ${ing.mw == null ? ing.size : fmtMw(ing.mw)} — 500 Da 초과로 진피 침투 불가. 표피 단순 보습용.`);
        if (ddsNames.length) reasons.push(`${ddsNames.join('·')}은(는) 각질층 투과를 보조할 뿐, 고분자를 진피로 운반한다는 근거 없음.`);
      } else if (ing.evidence === 'established') {
        reasons.push(`분자량 ${fmtMw(ing.mw)}로 각질층 투과 가능하며 임상 근거 존재. 단, 진피 도달량은 농도·제형에 좌우.`);
      } else {
        verdict = 'WARN';
        reasons.push(`분자량 ${fmtMw(ing.mw)}로 투과는 가능하나 진피 작용 임상 근거는 제한적.`);
      }
    }

    if (claim.type === 'regeneration') {
      if (ing.evidence === 'concept') {
        verdict = 'FALSE';
        reasons.push('인체 작용 기전·임상 근거 미흡 → "고효능 재생" 등급 제외, 단순 보습/항산화로 재분류.');
      } else if (ing.evidence === 'limited') {
        verdict = 'WARN';
        reasons.push(`${ing.note}`);
      }
      if (ing.mw != null && ing.mw > MW_LIMIT) reasons.push(`분자량 ${fmtMw(ing.mw)} — 도포 시 진피 도달 불가.`);
      if (a && a.status === 'UNDER') { verdict = 'FALSE'; reasons.push(`실제 함량 ${fmtPpm(a.ppm)} — [PPM 미달] 컨셉 처방 수준.`); }
    }

    if (claim.type === 'concentration') {
      const actual = a ? a.ppm : 0;
      if (claim.claimedPpm && actual < claim.claimedPpm * 0.5) {
        verdict = 'FALSE';
        reasons.push(`표기 ${fmtPpm(claim.claimedPpm)} vs 실제 유효성분 ${fmtPpm(actual)}. 원료 희석액(수용액) 기준 표기로 추정.`);
      } else if (a && a.status === 'UNDER') {
        verdict = 'FALSE';
        reasons.push(`실제 ${fmtPpm(actual)} — 10 ppm 이하 [PPM 미달 경고].`);
      } else if (a && a.status === 'WARN') {
        verdict = 'WARN';
        reasons.push(`실제 ${fmtPpm(actual)} — 유효 기준 ${fmtPpm(ing.minPpm)} 미달.`);
      } else {
        reasons.push(`실제 ${fmtPpm(actual)} — 유효 기준 ${fmtPpm(ing.minPpm)} 충족.`);
      }
      if (ing.evidence === 'concept') { verdict = 'FALSE'; reasons.push('함량과 무관하게 효능 근거 없는 컨셉 원료.'); }
    }

    if (claim.type === 'activation') {
      const fit = phFit(product, ing);
      if (fit === 'mismatch') {
        verdict = 'FALSE';
        reasons.push(`제형 pH ${product.ph.join('~')} — ${ing.ko} 활성 pH ${ing.optimalPh.join('~')} 범위를 벗어남.`);
      } else if (fit === 'partial') {
        verdict = 'WARN';
        reasons.push(`제형 pH ${product.ph.join('~')} 일부만 활성 범위(${ing.optimalPh.join('~')})와 겹침.`);
      } else {
        reasons.push(`제형 pH ${product.ph.join('~')} — 활성 범위 ${ing.optimalPh.join('~')} 충족.`);
      }
      if (a && a.status !== 'PASS') { verdict = verdict === 'FALSE' ? 'FALSE' : 'WARN'; reasons.push(`함량 ${fmtPpm(a.ppm)} — 유효 기준 ${fmtPpm(ing.minPpm)} 미달.`); }
    }

    if (claim.type === 'function') {
      if (a && a.status === 'UNDER') { verdict = 'FALSE'; reasons.push(`함량 ${fmtPpm(a.ppm)} — 컨셉 처방.`); }
      else if (a && a.status === 'WARN') { verdict = 'WARN'; reasons.push(`함량 ${fmtPpm(a.ppm)} — 유효 기준 ${fmtPpm(ing.minPpm)} 미달로 기능 기대 어려움.`); }
      const fit = phFit(product, ing);
      if (fit === 'mismatch') { verdict = 'FALSE'; reasons.push(`제형 pH ${product.ph.join('~')}에서 ${ing.ko} 활성 저하 (최적 ${ing.optimalPh.join('~')}).`); }
      if (verdict === 'FACT' && a) reasons.push(`함량 ${fmtPpm(a.ppm)} — 유효 기준 충족.`);
    }

    return { ...claim, verdict, reasons };
  }

  /* ── 제품 종합 분석 ── */
  const cache = new Map();
  function analyze(product) {
    if (cache.has(product.id)) return cache.get(product.id);
    const actives = product.actives.map(assessActive).map((a) => ({ ...a, phFit: phFit(product, a.ing) }));
    const claims = product.claims.map((c) => checkClaim(product, c, actives));

    let score = 100;
    actives.forEach((a) => {
      if (a.status === 'UNDER') score -= 25;
      else if (a.status === 'WARN') score -= 10;
      if (a.ing.evidence === 'concept') score -= 20;
      else if (a.ing.evidence === 'limited') score -= 8;
      if (a.phFit === 'mismatch') score -= 12;
    });
    claims.forEach((c) => { if (c.verdict === 'FALSE') score -= 12; else if (c.verdict === 'WARN') score -= 5; });
    score = Math.max(0, Math.min(100, score));
    const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : 'D';

    const withMw = actives.filter((a) => a.ing.mw != null);
    const totalPpm = withMw.reduce((s, a) => s + a.ppm, 0) || 1;
    const avgMw = withMw.reduce((s, a) => s + a.ing.mw * a.ppm, 0) / totalPpm;

    const result = {
      product, actives, claims, score, grade, avgMw,
      hasConcept: actives.some((a) => a.ing.evidence === 'concept' || a.status === 'UNDER'),
      falseCount: claims.filter((c) => c.verdict === 'FALSE').length,
      warnCount: claims.filter((c) => c.verdict === 'WARN').length + actives.filter((a) => a.status !== 'PASS').length,
    };
    cache.set(product.id, result);
    return result;
  }

  /* ── 검색 ── */
  const norm = (s) => String(s).toLowerCase().replace(/[\s\-·()]/g, '');
  function search(q) {
    const n = norm(q);
    if (!n) return [];
    return PRODUCTS.filter((p) => {
      const hay = [p.brand, p.name, ...p.actives.flatMap((a) => [INGREDIENTS[a.id].ko, INGREDIENTS[a.id].inci, ...INGREDIENTS[a.id].aliases])].map(norm).join('|');
      return hay.includes(n);
    }).map(analyze);
  }

  /* ── 정밀 필터 ── */
  function filter(opts) {
    return PRODUCTS.map(analyze).filter((r) => {
      const p = r.product;
      if (opts.category && p.category !== opts.category) return false;
      for (const cond of opts.ingredients || []) {
        if (!cond.id) continue;
        const a = p.actives.find((x) => x.id === cond.id);
        if (!a || a.ppm < (Number(cond.minPpm) || 0)) return false;
      }
      if (opts.ph) {
        const [lo, hi] = opts.ph;
        if (p.ph[1] < lo || p.ph[0] > hi) return false;
      }
      if (opts.dds && opts.dds.length && !opts.dds.some((d) => p.dds.includes(d))) return false;
      if (opts.excludeConcept && r.hasConcept) return false;
      return true;
    }).sort((a, b) => b.score - a.score);
  }

  /* ── 성분 충돌 ── */
  function conflictsBetween(pA, pB) {
    const idsA = pA.actives.map((a) => a.id);
    const idsB = pB.actives.map((a) => a.id);
    return CONFLICTS.filter((c) =>
      (idsA.includes(c.a) && idsB.includes(c.b)) || (idsA.includes(c.b) && idsB.includes(c.a)) ||
      (pA === pB && idsA.includes(c.a) && idsA.includes(c.b)));
  }

  /* ── 루틴 매칭 ── */
  /* covered: 같은 시간대에 이미 채운 원료(0.3배) · otherSlot: 반대 시간대에서 채운 원료(0.5배) → 조합 다양성 확보 */
  function productFitScore(r, weights, slot, covered, otherSlot) {
    let raw = 0;
    const matched = [];
    r.actives.forEach((a) => {
      const w = weights[a.id];
      if (!w) return;
      if (w < 0) { raw += w; matched.push({ ...a, avoid: true }); return; }
      // 유효 농도 미달·pH 불일치 원료는 루틴 기여도 0 (팩트 기반 추천)
      const potency = a.phFit === 'mismatch' ? 0 : a.status === 'PASS' ? 1 : a.status === 'WARN' ? 0.3 : 0;
      const novelty = covered.has(a.id) ? 0.3 : otherSlot.has(a.id) ? 0.5 : 1;
      raw += w * potency * novelty;
      if (potency > 0) matched.push(a);
    });
    let s = raw;
    if (raw > 0) {
      const has = (id) => r.product.actives.some((a) => a.id === id) && weights[id] > 0;
      if (slot === 'AM' && has('l_ascorbic')) s += 2;   // 자외선 산화 스트레스 대응
      if (slot === 'PM' && has('retinol')) s += 3;      // 레티노이드는 야간 핵심
      if (slot === 'PM' && has('glycolic')) s += 1;
      if (r.product.dds.length) s += 0.5;
      if (r.actives.some((a) => a.phFit === 'mismatch')) s -= 1.5;
      s += r.score / 100;
    }
    return { raw, s, matched };
  }

  function timeSlotAllowed(r, slot) {
    const ids = r.product.actives.map((a) => a.id);
    if (slot === 'AM' && ids.includes('retinol')) return false;      // 광분해·광감작
    if (slot === 'AM' && ids.includes('glycolic')) return false;     // AHA 광감작 — PM
    if (slot === 'PM' && ids.includes('l_ascorbic')) return false;   // 비타민C — AM 광보호
    return true;
  }

  function routine(conditionIds, { excludeConcept = true } = {}) {
    const weights = {};
    conditionIds.forEach((cid) => Object.entries(CONDITIONS[cid].weights).forEach(([k, v]) => {
      weights[k] = v < 0 || (weights[k] ?? 0) < 0 ? Math.min(weights[k] ?? 0, v) : (weights[k] || 0) + v;
    }));

    const pool = PRODUCTS.map(analyze).filter((r) => !(excludeConcept && r.hasConcept));
    const log = [];
    const slots = {};

    const coveredBy = { AM: new Set(), PM: new Set() };
    ['AM', 'PM'].forEach((slot) => {
      const picked = [];
      const other = coveredBy[slot === 'AM' ? 'PM' : 'AM'];
      // 핵심 단계(세럼)부터 선택해 충돌 시 보조 단계가 양보하도록 함
      ['serum', 'toner', 'cream'].forEach((cat) => {
        const ranked = pool
          .filter((r) => r.product.category === cat && timeSlotAllowed(r, slot))
          .map((r) => ({ r, ...productFitScore(r, weights, slot, coveredBy[slot], other) }))
          .filter((x) => x.raw > 0.5 && !x.matched.some((m) => m.avoid))
          .sort((a, b) => b.s - a.s);
        for (const cand of ranked) {
          const clashes = picked.flatMap((p) => conflictsBetween(p.r.product, cand.r.product).filter((c) => c.level !== 'info').map((c) => ({ c, with: p.r.product })));
          if (clashes.length) {
            clashes.forEach(({ c, with: w }) => log.push({ slot, type: 'skip', product: cand.r.product, with: w, conflict: c }));
            continue;
          }
          picked.push({ ...cand, cat });
          cand.r.product.actives.forEach((a) => coveredBy[slot].add(a.id));
          break;
        }
      });
      const order = { toner: 0, serum: 1, cream: 2 };
      slots[slot] = picked.sort((a, b) => order[a.cat] - order[b.cat]);
    });

    // AM ↔ PM 분리로 해결된 충돌 + 동시 사용 가능(info) 확인
    const amIds = slots.AM.flatMap((x) => x.r.product.actives.map((a) => a.id));
    const pmIds = slots.PM.flatMap((x) => x.r.product.actives.map((a) => a.id));
    CONFLICTS.forEach((c) => {
      const split = (amIds.includes(c.a) && pmIds.includes(c.b) && !amIds.includes(c.b) && !pmIds.includes(c.a)) ||
                    (amIds.includes(c.b) && pmIds.includes(c.a) && !amIds.includes(c.a) && !pmIds.includes(c.b));
      if (split && c.level !== 'info') log.push({ type: 'split', conflict: c });
      ['AM', 'PM'].forEach((slot) => {
        const ids = slot === 'AM' ? amIds : pmIds;
        if (c.level === 'info' && ids.includes(c.a) && ids.includes(c.b)) log.push({ type: 'info', slot, conflict: c });
      });
    });

    return { weights, slots, log };
  }

  /* ── 전성분 텍스트 파싱 (OCR 결과) ── */
  function parseInci(text) {
    const tokens = String(text)
      .replace(/전성분\s*[:：]?/g, '')
      .split(/,(?!\d)|[，\n·•;]/)   // "1,2-헥산다이올"처럼 숫자 사이 쉼표는 분리하지 않음
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && t.length < 60);

    const aliasList = [];
    Object.entries(INGREDIENTS).forEach(([id, ing]) => ing.aliases.forEach((al) => aliasList.push({ id, al: norm(al), kind: 'ing' })));
    SD.DDS_HINTS.forEach((h) => h.aliases.forEach((al) => aliasList.push({ id: h.dds, al: norm(al), kind: 'dds' })));
    aliasList.sort((a, b) => b.al.length - a.al.length);   // 최장 일치 우선 (하이드롤라이즈드콜라겐 > 콜라겐)

    const total = tokens.length;
    return tokens.map((raw, i) => {
      const n = norm(raw);
      const hit = aliasList.find((x) => (x.al.length <= 3 ? n === x.al : n.includes(x.al)));
      const rank = i + 1;
      const row = { raw, rank, total, match: null, dds: null, flags: [] };
      if (!hit) return row;
      if (hit.kind === 'dds') { row.dds = DDS[hit.id]; return row; }
      const ing = INGREDIENTS[hit.id];
      row.match = { id: hit.id, ing };
      if (ing.mw != null && ing.mw > MW_LIMIT) row.flags.push({ tone: 'warn', text: '500 Da 초과 · 표피 보습용' });
      if (ing.evidence === 'concept') row.flags.push({ tone: 'danger', text: '컨셉 원료 → 보습/항산화 재분류' });
      if (ing.evidence === 'limited') row.flags.push({ tone: 'warn', text: '외용 근거 미흡' });
      if ((ing.evidence === 'concept' || ing.evidence === 'limited') && total >= 8 && rank > total * 0.6)
        row.flags.push({ tone: 'danger', text: '말단 표기 — PPM 미달 컨셉 처방 의심' });
      return row;
    });
  }

  /* 전성분 판독 요약 (라이브러리·비교용) */
  function summarizeInci(rows) {
    const matched = rows.filter((r) => r.match);
    return {
      total: rows.length,
      matched,
      concept: matched.filter((r) => r.match.ing.evidence === 'concept'),
      limited: matched.filter((r) => r.match.ing.evidence === 'limited'),
      overMw: matched.filter((r) => r.match.ing.mw != null && r.match.ing.mw > MW_LIMIT),
      tail: matched.filter((r) => r.flags.some((f) => f.text.startsWith('말단'))),
      dds: rows.filter((r) => r.dds),
      ids: [...new Set(matched.map((r) => r.match.id))],
    };
  }

  /* 원료 id 목록 간 충돌 (전성분 제품 비교용) */
  function conflictsAmong(idLists) {
    const found = [];
    CONFLICTS.forEach((c) => {
      const hasA = idLists.findIndex((ids) => ids.includes(c.a));
      const hasB = idLists.findIndex((ids) => ids.includes(c.b));
      if (hasA >= 0 && hasB >= 0) found.push(c);
    });
    return found;
  }

  SD.engine = { analyze, summarizeInci, conflictsAmong, search, filter, routine, conflictsBetween, parseInci, assessActive, phFit, fmtPpm, fmtMw, fmtNum, EVIDENCE, MW_LIMIT, CONCEPT_PPM };
})();
