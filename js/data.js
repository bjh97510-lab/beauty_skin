/* Spec Direct — 원료·DDS·제품 데이터베이스
 *
 * 원료(INGREDIENTS)의 분자량·기능성 고시 농도는 공개 문헌/식약처 고시 기준 값입니다.
 * 제품(PRODUCTS)은 분석 로직 시연용 [샘플] 데이터이며 실존 브랜드가 아닙니다.
 * 실제 제품 데이터는 제조사 공개 자료·성적서 기반으로 PRODUCTS 형식에 맞춰 교체하세요.
 */
window.SD = window.SD || {};

/* evidence: established(임상 근거 확립) | moderate(근거 일부) | limited(외용 근거 미흡) | concept(마케팅 컨셉 원료)
 * minPpm: 유효 농도 하한 (ppm, 1% = 10,000 ppm)
 * optimalPh: 해당 원료가 안정·활성을 갖는 pH 범위 (없으면 null)
 */
SD.INGREDIENTS = {
  niacinamide: {
    ko: '나이아신아마이드', inci: 'Niacinamide', mw: 122.12, minPpm: 20000,
    evidence: 'established', roles: ['미백', '장벽', '피지'], optimalPh: [5.0, 7.0],
    note: '식약처 미백 기능성 고시 원료 (2~5%).',
    aliases: ['나이아신아마이드', '니아신아마이드', 'niacinamide', 'nicotinamide'],
  },
  l_ascorbic: {
    ko: 'L-아스코빅애씨드 (순수 비타민C)', inci: 'Ascorbic Acid', mw: 176.12, minPpm: 100000,
    evidence: 'established', roles: ['미백', '항산화', '주름'], optimalPh: [2.5, 3.5],
    note: 'pH 3.5 이하에서 비이온화 상태로 각질층 투과 (Pinnell, 2001). 유효 10~20%.',
    aliases: ['아스코빅애씨드', '아스코르빈산', 'ascorbic acid', 'l-ascorbic acid'],
  },
  ascorbyl_glucoside: {
    ko: '아스코빌글루코사이드', inci: 'Ascorbyl Glucoside', mw: 338.27, minPpm: 20000,
    evidence: 'established', roles: ['미백'], optimalPh: [5.0, 7.0],
    note: '식약처 미백 기능성 고시 원료 (2%).',
    aliases: ['아스코빌글루코사이드', 'ascorbyl glucoside'],
  },
  retinol: {
    ko: '레티놀', inci: 'Retinol', mw: 286.45, minPpm: 750,
    evidence: 'established', roles: ['주름', '탄력'], optimalPh: [5.0, 6.5],
    note: '식약처 주름개선 기능성 고시 2,500 IU/g (≈ 750 ppm).',
    aliases: ['레티놀', 'retinol'],
  },
  bakuchiol: {
    ko: '바쿠치올', inci: 'Bakuchiol', mw: 256.38, minPpm: 5000,
    evidence: 'moderate', roles: ['주름'], optimalPh: null,
    note: '0.5% 레티놀 유사 효과 RCT 1건 (Dhaliwal, 2019). 근거 규모 제한적.',
    aliases: ['바쿠치올', 'bakuchiol'],
  },
  adenosine: {
    ko: '아데노신', inci: 'Adenosine', mw: 267.24, minPpm: 400,
    evidence: 'established', roles: ['주름'], optimalPh: null,
    note: '식약처 주름개선 기능성 고시 원료 (0.04%).',
    aliases: ['아데노신', 'adenosine'],
  },
  arbutin: {
    ko: '알부틴', inci: 'Arbutin', mw: 272.25, minPpm: 20000,
    evidence: 'established', roles: ['미백'], optimalPh: null,
    note: '식약처 미백 기능성 고시 원료 (2~5%).',
    aliases: ['알파-알부틴', '알부틴', 'alpha-arbutin', 'arbutin'],
  },
  tranexamic: {
    ko: '트라넥사믹애씨드', inci: 'Tranexamic Acid', mw: 157.21, minPpm: 20000,
    evidence: 'moderate', roles: ['미백'], optimalPh: null,
    note: '외용 2~3% 기미 개선 연구 다수, 대규모 RCT는 제한적.',
    aliases: ['트라넥사믹애씨드', 'tranexamic acid'],
  },
  azelaic: {
    ko: '아젤라익애씨드', inci: 'Azelaic Acid', mw: 188.22, minPpm: 100000,
    evidence: 'established', roles: ['트러블', '미백', '홍조'], optimalPh: [4.0, 5.0],
    note: '임상 근거는 10~20% 기준. 저농도(<10%) 화장품은 근거 약함.',
    aliases: ['아젤라익애씨드', 'azelaic acid'],
  },
  salicylic: {
    ko: '살리실릭애씨드 (BHA)', inci: 'Salicylic Acid', mw: 138.12, minPpm: 5000,
    evidence: 'established', roles: ['트러블', '각질', '모공'], optimalPh: [3.0, 4.0],
    note: '국내 사용한도: 씻어내는 제품 2%, 그 외 0.5%. 지용성으로 모공 침투.',
    aliases: ['살리실릭애씨드', 'salicylic acid'],
  },
  glycolic: {
    ko: '글라이콜릭애씨드 (AHA)', inci: 'Glycolic Acid', mw: 76.05, minPpm: 40000,
    evidence: 'established', roles: ['각질', '주름'], optimalPh: [3.0, 4.0],
    note: 'AHA 중 최저 분자량. 유리산(free acid) 비율은 pH(pKa 3.83)에 좌우.',
    aliases: ['글라이콜릭애씨드', 'glycolic acid'],
  },
  panthenol: {
    ko: '판테놀', inci: 'Panthenol', mw: 205.25, minPpm: 10000,
    evidence: 'established', roles: ['장벽', '진정', '보습'], optimalPh: [4.0, 7.0],
    note: '1~5%에서 경피수분손실(TEWL) 감소 근거.',
    aliases: ['판테놀', 'd-판테놀', 'panthenol', 'dexpanthenol'],
  },
  ceramide_np: {
    ko: '세라마이드엔피', inci: 'Ceramide NP', mw: 583.97, minPpm: 1000,
    evidence: 'moderate', roles: ['장벽'], optimalPh: null,
    note: '각질층 지질 보충이 목적인 원료 — 표피 작용이 정상 기전.',
    aliases: ['세라마이드엔피', '세라마이드np', '세라마이드3', 'ceramide np', 'ceramide 3'],
  },
  cholesterol: {
    ko: '콜레스테롤', inci: 'Cholesterol', mw: 386.65, minPpm: 1000,
    evidence: 'moderate', roles: ['장벽'], optimalPh: null,
    note: '세라마이드:콜레스테롤:지방산 3:1:1 몰비 재현 시 장벽 회복 근거.',
    aliases: ['콜레스테롤', 'cholesterol'],
  },
  squalane: {
    ko: '스쿠알란', inci: 'Squalane', mw: 422.81, minPpm: 10000,
    evidence: 'established', roles: ['보습', '장벽'], optimalPh: null,
    note: '피지 유사 에몰리언트. 폐색 보습.',
    aliases: ['스쿠알란', 'squalane'],
  },
  glycerin: {
    ko: '글리세린', inci: 'Glycerin', mw: 92.09, minPpm: 30000,
    evidence: 'established', roles: ['보습'], optimalPh: null,
    note: '가장 근거가 확실한 휴멕턴트. 3% 이상에서 각질층 수분 증가.',
    aliases: ['글리세린', 'glycerin', 'glycerol'],
  },
  hyaluronate_hmw: {
    ko: '소듐하이알루로네이트 (고분자)', inci: 'Sodium Hyaluronate', mw: 1000000, minPpm: 1000,
    evidence: 'established', roles: ['보습'], optimalPh: null,
    note: '표면 수분막 형성. 분자량상 각질층 투과 불가.',
    aliases: ['소듐하이알루로네이트', '히알루론산', '하이알루로닉애씨드', 'sodium hyaluronate', 'hyaluronic acid'],
  },
  hydrolyzed_ha: {
    ko: '하이드롤라이즈드하이알루로닉애씨드 (저분자)', inci: 'Hydrolyzed Hyaluronic Acid', mw: 5000, minPpm: 500,
    evidence: 'moderate', roles: ['보습'], optimalPh: null,
    note: '고분자 대비 각질층 상부 침투 개선. 여전히 500 Da 초과.',
    aliases: ['하이드롤라이즈드하이알루로닉애씨드', 'hydrolyzed hyaluronic acid'],
  },
  polyglutamic: {
    ko: '폴리글루타믹애씨드', inci: 'Polyglutamic Acid', mw: 1000000, minPpm: 1000,
    evidence: 'moderate', roles: ['보습'], optimalPh: null,
    note: '고분자 필름형 휴멕턴트. 표면 보습 전용.',
    aliases: ['폴리글루타믹애씨드', 'polyglutamic acid'],
  },
  beta_glucan: {
    ko: '베타-글루칸', inci: 'Beta-Glucan', mw: 100000, minPpm: 1000,
    evidence: 'moderate', roles: ['보습', '진정'], optimalPh: null,
    note: '표피 보습·진정. 고분자.',
    aliases: ['베타-글루칸', '베타글루칸', 'beta-glucan'],
  },
  madecassoside: {
    ko: '마데카소사이드 (병풀)', inci: 'Madecassoside', mw: 975.12, minPpm: 1000,
    evidence: 'moderate', roles: ['진정', '장벽', '홍조'], optimalPh: null,
    note: '표피 염증 완화·장벽 회복 근거. 500 Da 초과로 표피 국소 작용.',
    aliases: ['마데카소사이드', 'madecassoside'],
  },
  allantoin: {
    ko: '알란토인', inci: 'Allantoin', mw: 158.12, minPpm: 1000,
    evidence: 'established', roles: ['진정'], optimalPh: null,
    note: '0.1~2% 진정·각질 연화.',
    aliases: ['알란토인', 'allantoin'],
  },
  tocopherol: {
    ko: '토코페롤 (비타민E)', inci: 'Tocopherol', mw: 430.71, minPpm: 5000,
    evidence: 'established', roles: ['항산화'], optimalPh: null,
    note: 'L-아스코빅애씨드와 병용 시 광보호 상승 (C+E+페룰릭).',
    aliases: ['토코페롤', 'tocopherol'],
  },
  ferulic: {
    ko: '페룰릭애씨드', inci: 'Ferulic Acid', mw: 194.18, minPpm: 5000,
    evidence: 'moderate', roles: ['항산화'], optimalPh: [3.0, 4.0],
    note: '비타민C/E 안정화 (0.5%).',
    aliases: ['페룰릭애씨드', 'ferulic acid'],
  },
  collagen: {
    ko: '수용성콜라겐', inci: 'Soluble Collagen', mw: 300000, minPpm: 1000,
    evidence: 'moderate', roles: ['보습'], optimalPh: null,
    note: '삼중나선 단백질. 피부 표면 보습막 — 진피 콜라겐 보충 불가.',
    aliases: ['수용성콜라겐', '콜라겐', 'soluble collagen', 'collagen'],
  },
  hydrolyzed_collagen: {
    ko: '하이드롤라이즈드콜라겐', inci: 'Hydrolyzed Collagen', mw: 3000, minPpm: 1000,
    evidence: 'moderate', roles: ['보습'], optimalPh: null,
    note: '가수분해 펩타이드 혼합물 (1,000~5,000 Da). 표피 보습.',
    aliases: ['하이드롤라이즈드콜라겐', 'hydrolyzed collagen'],
  },
  pdrn_salmon: {
    ko: 'PDRN (연어 유래 소듐디엔에이)', inci: 'Sodium DNA', mw: 500000, minPpm: 1000,
    evidence: 'limited', roles: ['재생'], optimalPh: null,
    note: 'A2A 수용체 기전·재생 근거는 주사제 기준. 외용 도포 시 고분자로 진피 도달 근거 미흡.',
    aliases: ['소듐디엔에이', 'sodium dna', 'pdrn', '피디알엔'],
  },
  pdrn_plant: {
    ko: '식물성 PDRN', inci: 'Plant-derived DNA (비표준 명칭)', mw: 500000, minPpm: 1000,
    evidence: 'concept', roles: ['보습', '항산화'], optimalPh: null,
    note: '인체 A2A 수용체 작용 기전 및 임상 근거 없음 → 단순 보습/항산화로 재분류.',
    aliases: ['식물성pdrn', 'plant pdrn', '녹차pdrn', '인삼pdrn', '병풀pdrn'],
  },
  plant_exosome: {
    ko: '식물 유래 엑소좀', inci: 'Plant-derived Exosome (비표준 명칭)', mw: null, size: '30~150 nm 소포체', minPpm: 1000,
    evidence: 'concept', roles: ['보습'], optimalPh: null,
    note: '표준화된 함량·순도 정의 및 외용 재생 임상 근거 없음.',
    aliases: ['엑소좀', 'exosome'],
  },
  egf: {
    ko: 'sh-올리고펩타이드-1 (EGF)', inci: 'sh-Oligopeptide-1', mw: 6045, minPpm: 1,
    evidence: 'limited', roles: ['재생'], optimalPh: null,
    note: '53개 아미노산 단백질. 정상 피부 외용 투과 근거 미흡.',
    aliases: ['sh-올리고펩타이드-1', '에스에이치-올리고펩타이드-1', 'sh-oligopeptide-1', 'egf'],
  },
};

/* 전성분 내 DDS 단서 (OCR 스캔용) — 레시틴은 리포좀 '가능성'일 뿐 확정 아님 */
SD.DDS_HINTS = [
  { dds: 'spicule', aliases: ['하이드롤라이즈드스폰지', 'hydrolyzed sponge', '스피큘', 'spicule'] },
  { dds: 'liposome', aliases: ['하이드로제네이티드레시틴', 'hydrogenated lecithin', '레시틴', 'lecithin'] },
];

SD.DDS = {
  liposome: {
    ko: '리포좀 (Liposome)', size: '50~200 nm',
    mechanism: '인지질 이중막 소포체가 각질층 지질과 융합하며 내포 성분을 각질층 하부로 방출. 수용성·지용성 동시 탑재 가능.',
    limit: '진피 직접 전달 근거는 제한적. 대부분 각질층·표피 상부에 체류. 고분자(>500 Da) 성분을 진피로 운반한다는 근거 없음.',
  },
  niosome: {
    ko: '나이오솜 (Niosome)', size: '100~300 nm',
    mechanism: '비이온 계면활성제 이중막 소포체. 리포좀 대비 산화 안정성이 높고 원가가 낮음.',
    limit: '침투 증진 효과는 리포좀과 유사한 수준. 각질층 체류형.',
  },
  spicule: {
    ko: '스피큘 (Spicule)', size: '길이 100~300 µm 실리카 침상체',
    mechanism: '해면 유래 실리카 미세침이 각질층에 물리적 미세 채널을 형성해 일시적으로 투과 경로를 만듦.',
    limit: '장벽 손상·민감 피부 자극 위험. 채널은 수 시간 내 회복. 진피 도달 보장 아님.',
  },
  nanoemulsion: {
    ko: '나노에멀전 (Nanoemulsion)', size: '20~200 nm 유화입자',
    mechanism: '미세 유화입자로 비표면적을 키워 지용성 성분의 각질층 분배계수를 높임.',
    limit: '침투 증가폭은 성분·처방 의존. 입자 자체가 진피로 이동하지 않음.',
  },
  encapsulation: {
    ko: '마이크로캡슐 (Encapsulation)', size: '1~50 µm',
    mechanism: '불안정 성분(레티놀·비타민C 등)을 캡슐에 봉입해 산화를 늦추고 서방형으로 방출.',
    limit: '목적은 안정화·자극 완화이며 침투 증진 기술이 아님.',
  },
};

/* 성분 충돌 매트릭스 */
SD.CONFLICTS = [
  { a: 'l_ascorbic', b: 'retinol', level: 'high',
    reason: '최적 pH 불일치(L-AA pH ≤3.5 vs 레티놀 pH 5~6.5)로 한쪽 활성이 저하되고, 자극이 누적됨.',
    fix: '비타민C는 AM(자외선 방어 시너지), 레티놀은 PM으로 분리.' },
  { a: 'glycolic', b: 'retinol', level: 'high',
    reason: '각질 박리 + 레티노이드 동시 사용 시 장벽 손상·홍반 위험.',
    fix: '같은 날 사용 금지 또는 AHA는 주 2~3회 PM 단독.' },
  { a: 'salicylic', b: 'retinol', level: 'medium',
    reason: 'BHA 각질 용해와 레티노이드 자극 중첩.',
    fix: 'BHA는 AM 토너, 레티놀은 PM으로 분리.' },
  { a: 'glycolic', b: 'l_ascorbic', level: 'medium',
    reason: '저 pH 산 성분 중첩으로 따가움·장벽 부담 증가.',
    fix: '시간대 분리.' },
  { a: 'glycolic', b: 'salicylic', level: 'medium',
    reason: 'AHA + BHA 동시 각질 박리로 과박리 위험.',
    fix: '격일 사용 또는 한 가지만 선택.' },
  { a: 'azelaic', b: 'glycolic', level: 'medium',
    reason: '산 성분 중첩 자극.',
    fix: '시간대 분리.' },
  { a: 'l_ascorbic', b: 'niacinamide', level: 'info',
    reason: '"니코틴산 전환으로 홍조 유발"은 고온 장시간 조건의 실험 결과로, 실사용 조건에서 근거 약함.',
    fix: '동시 사용 가능 (팩트체크: 오래된 속설).' },
];

/* 피부 상태 → 원료 가중치 (음수 = 회피) */
SD.CONDITIONS = {
  dehydration: { ko: '속건조', desc: '겉은 번들거리나 속당김', weights: { glycerin: 2, panthenol: 3, hyaluronate_hmw: 2, hydrolyzed_ha: 2, polyglutamic: 2, beta_glucan: 2, ceramide_np: 1, squalane: 1 } },
  barrier: { ko: '장벽 손상', desc: '따가움, 각질, TEWL 증가', weights: { ceramide_np: 3, cholesterol: 2, panthenol: 3, niacinamide: 2, madecassoside: 2, squalane: 2, allantoin: 1, glycolic: -4, salicylic: -3, l_ascorbic: -3, retinol: -3 } },
  pigment: { ko: '색소침착·톤', desc: '기미, 잡티, 트러블 자국', weights: { niacinamide: 3, tranexamic: 3, arbutin: 3, l_ascorbic: 3, ascorbyl_glucoside: 2, azelaic: 2 } },
  wrinkle: { ko: '주름·탄력', desc: '잔주름, 탄력 저하', weights: { retinol: 3, adenosine: 3, l_ascorbic: 2, bakuchiol: 2, niacinamide: 1, glycolic: 1 } },
  acne: { ko: '트러블·모공', desc: '좁쌀, 화농, 피지', weights: { salicylic: 3, azelaic: 3, niacinamide: 2, glycolic: 1, madecassoside: 1 } },
  sensitive: { ko: '민감·홍조', desc: '쉽게 붉어지고 화끈거림', weights: { madecassoside: 3, panthenol: 3, allantoin: 2, azelaic: 1, beta_glucan: 1, glycolic: -4, salicylic: -3, retinol: -3, l_ascorbic: -3 } },
};

SD.CATEGORIES = { toner: '토너', serum: '세럼·앰플', cream: '크림' };

/* ───── [샘플] 제품 데이터 (가상 브랜드) ─────
 * claimType: dermis(진피 침투 주장) | regeneration(재생 주장) | concentration(함량 주장, claimedPpm) | activation(pH 활성 주장) | function(기능 주장)
 */
SD.PRODUCTS = [
  {
    id: 'p01', brand: 'AQUA LOGIC', name: 'Niacin 50 Barrier Serum', category: 'serum',
    ph: [5.2, 5.6], emulsion: '수용성 젤 (Aqueous Gel)', dds: ['niosome'],
    actives: [{ id: 'niacinamide', ppm: 50000 }, { id: 'panthenol', ppm: 20000 }, { id: 'ceramide_np', ppm: 2000 }, { id: 'glycerin', ppm: 50000 }],
    claims: [
      { text: '나이아신아마이드 5% 고함량', ingredient: 'niacinamide', type: 'concentration', claimedPpm: 50000 },
      { text: '나이오솜 공법으로 유효성분 깊숙이 전달', ingredient: 'niacinamide', type: 'dermis' },
    ],
  },
  {
    id: 'p02', brand: 'VITALAB', name: 'C20 Pure Ascorbic Ampoule', category: 'serum',
    ph: [3.0, 3.3], emulsion: '수용액 (Aqueous)', dds: [],
    actives: [{ id: 'l_ascorbic', ppm: 200000 }, { id: 'tocopherol', ppm: 10000 }, { id: 'ferulic', ppm: 5000 }],
    claims: [
      { text: 'pH 3.2 설계로 순수 비타민C 20% 활성', ingredient: 'l_ascorbic', type: 'activation' },
      { text: '순수 비타민C 20%', ingredient: 'l_ascorbic', type: 'concentration', claimedPpm: 200000 },
    ],
  },
  {
    id: 'p03', brand: 'GLOWRIX', name: 'Vita C Brightening Toner', category: 'toner',
    ph: [5.5, 6.0], emulsion: '수용액 (Aqueous)', dds: [],
    actives: [{ id: 'l_ascorbic', ppm: 5000 }, { id: 'glycerin', ppm: 30000 }],
    claims: [
      { text: '비타민C 즉각 활성으로 칙칙함 OUT', ingredient: 'l_ascorbic', type: 'activation' },
      { text: '비타민C 집중 미백 토너', ingredient: 'l_ascorbic', type: 'function' },
    ],
  },
  {
    id: 'p04', brand: 'DERMACODE', name: 'Collagen 90 Lifting Cream', category: 'cream',
    ph: [5.5, 6.0], emulsion: 'O/W (수중유형)', dds: ['liposome'],
    actives: [{ id: 'collagen', ppm: 9000 }, { id: 'hydrolyzed_collagen', ppm: 50 }, { id: 'squalane', ppm: 30000 }],
    claims: [
      { text: '콜라겐 90% 함유', ingredient: 'collagen', type: 'concentration', claimedPpm: 900000 },
      { text: '리포좀이 콜라겐을 진피층까지 직접 충전', ingredient: 'collagen', type: 'dermis' },
    ],
  },
  {
    id: 'p05', brand: 'GREENSEED', name: 'Plant PDRN Regen Ampoule', category: 'serum',
    ph: [5.3, 5.8], emulsion: '수용액 (Aqueous)', dds: [],
    actives: [{ id: 'pdrn_plant', ppm: 5 }, { id: 'hyaluronate_hmw', ppm: 1000 }, { id: 'glycerin', ppm: 40000 }],
    claims: [
      { text: '식물성 PDRN으로 고효능 피부 재생', ingredient: 'pdrn_plant', type: 'regeneration' },
      { text: '연어 PDRN을 대체하는 비건 재생 성분', ingredient: 'pdrn_plant', type: 'regeneration' },
    ],
  },
  {
    id: 'p06', brand: 'SALMONIQ', name: 'PDRN 1000 Repair Cream', category: 'cream',
    ph: [5.5, 6.0], emulsion: 'O/W (수중유형)', dds: ['liposome'],
    actives: [{ id: 'pdrn_salmon', ppm: 1000 }, { id: 'panthenol', ppm: 30000 }, { id: 'ceramide_np', ppm: 3000 }, { id: 'cholesterol', ppm: 1000 }],
    claims: [
      { text: 'PDRN이 A2A 수용체를 활성화해 손상 피부 재생', ingredient: 'pdrn_salmon', type: 'regeneration' },
      { text: '판테놀 3% 장벽 케어', ingredient: 'panthenol', type: 'concentration', claimedPpm: 30000 },
    ],
  },
  {
    id: 'p07', brand: 'RETINOVA', name: 'Retinol 0.1 Night Serum', category: 'serum',
    ph: [5.5, 6.0], emulsion: 'O/W (수중유형)', dds: ['encapsulation'],
    actives: [{ id: 'retinol', ppm: 1000 }, { id: 'squalane', ppm: 50000 }, { id: 'tocopherol', ppm: 5000 }],
    claims: [
      { text: '순수 레티놀 0.1%', ingredient: 'retinol', type: 'concentration', claimedPpm: 1000 },
      { text: '진피 콜라겐 생성 촉진', ingredient: 'retinol', type: 'dermis' },
    ],
  },
  {
    id: 'p08', brand: 'BARRIERX', name: 'Panthenol 10 Cica Cream', category: 'cream',
    ph: [5.0, 5.5], emulsion: 'W/O (유중수형)', dds: [],
    actives: [{ id: 'panthenol', ppm: 100000 }, { id: 'madecassoside', ppm: 1000 }, { id: 'ceramide_np', ppm: 5000 }, { id: 'cholesterol', ppm: 2000 }],
    claims: [
      { text: '판테놀 10% 고함량', ingredient: 'panthenol', type: 'concentration', claimedPpm: 100000 },
      { text: '병풀이 진피 속 손상까지 회복', ingredient: 'madecassoside', type: 'dermis' },
    ],
  },
  {
    id: 'p09', brand: 'SPICULAB', name: 'Spicule EGF Booster', category: 'serum',
    ph: [5.5, 6.0], emulsion: '수용액 (Aqueous)', dds: ['spicule'],
    actives: [{ id: 'egf', ppm: 1 }, { id: 'hydrolyzed_collagen', ppm: 3 }, { id: 'glycerin', ppm: 30000 }],
    claims: [
      { text: '스피큘이 EGF를 진피까지 전달해 피부 재생', ingredient: 'egf', type: 'regeneration' },
      { text: '마이크로 니들 효과로 콜라겐 진피 침투', ingredient: 'hydrolyzed_collagen', type: 'dermis' },
    ],
  },
  {
    id: 'p10', brand: 'CLEARFORM', name: 'BHA 0.5 Daily Pore Toner', category: 'toner',
    ph: [3.5, 4.0], emulsion: '수용액 (Aqueous)', dds: [],
    actives: [{ id: 'salicylic', ppm: 5000 }, { id: 'niacinamide', ppm: 20000 }, { id: 'allantoin', ppm: 1000 }],
    claims: [
      { text: 'BHA 0.5% 모공 각질 케어', ingredient: 'salicylic', type: 'concentration', claimedPpm: 5000 },
      { text: 'pH 3.8 저자극 산성 설계', ingredient: 'salicylic', type: 'activation' },
    ],
  },
  {
    id: 'p11', brand: 'HYDRAWELL', name: '8-Layer Hyaluronic Toner', category: 'toner',
    ph: [5.0, 5.5], emulsion: '수용액 (Aqueous)', dds: [],
    actives: [{ id: 'hyaluronate_hmw', ppm: 500 }, { id: 'hydrolyzed_ha', ppm: 200 }, { id: 'panthenol', ppm: 5000 }, { id: 'glycerin', ppm: 50000 }, { id: 'beta_glucan', ppm: 10000 }],
    claims: [
      { text: '8중 히알루론산이 진피 속까지 수분 충전', ingredient: 'hyaluronate_hmw', type: 'dermis' },
      { text: '판테놀 장벽 강화', ingredient: 'panthenol', type: 'function' },
    ],
  },
  {
    id: 'p12', brand: 'TONEUP LAB', name: 'Tranexamic 3 + Arbutin Serum', category: 'serum',
    ph: [5.5, 6.0], emulsion: '수용성 젤 (Aqueous Gel)', dds: ['nanoemulsion'],
    actives: [{ id: 'tranexamic', ppm: 30000 }, { id: 'arbutin', ppm: 20000 }, { id: 'niacinamide', ppm: 20000 }],
    claims: [
      { text: '미백 기능성 인증 (알부틴 2%)', ingredient: 'arbutin', type: 'concentration', claimedPpm: 20000 },
      { text: '트라넥사믹애씨드 3% 기미 집중', ingredient: 'tranexamic', type: 'concentration', claimedPpm: 30000 },
    ],
  },
  {
    id: 'p13', brand: 'EXOGEN', name: 'Rose Exosome Stem Cream', category: 'cream',
    ph: [5.5, 6.5], emulsion: 'O/W (수중유형)', dds: ['liposome'],
    actives: [{ id: 'plant_exosome', ppm: 10 }, { id: 'squalane', ppm: 30000 }, { id: 'glycerin', ppm: 40000 }],
    claims: [
      { text: '장미 엑소좀이 줄기세포처럼 피부 재생', ingredient: 'plant_exosome', type: 'regeneration' },
      { text: '엑소좀 10,000 ppm 고농축', ingredient: 'plant_exosome', type: 'concentration', claimedPpm: 10000 },
    ],
  },
  {
    id: 'p14', brand: 'ADENOFILL', name: 'Adenosine Wrinkle Cream', category: 'cream',
    ph: [5.5, 6.5], emulsion: 'W/O (유중수형)', dds: [],
    actives: [{ id: 'adenosine', ppm: 400 }, { id: 'polyglutamic', ppm: 1000 }, { id: 'squalane', ppm: 40000 }, { id: 'glycerin', ppm: 50000 }],
    claims: [
      { text: '주름개선 기능성 (아데노신 0.04%)', ingredient: 'adenosine', type: 'concentration', claimedPpm: 400 },
      { text: '폴리글루타믹애씨드 진피 보습', ingredient: 'polyglutamic', type: 'dermis' },
    ],
  },
  {
    id: 'p15', brand: 'AZELAB', name: 'Azelaic 10 Gel', category: 'serum',
    ph: [4.5, 5.0], emulsion: '수용성 젤 (Aqueous Gel)', dds: [],
    actives: [{ id: 'azelaic', ppm: 100000 }, { id: 'niacinamide', ppm: 20000 }, { id: 'allantoin', ppm: 2000 }],
    claims: [
      { text: '아젤라익애씨드 10% 트러블·홍조 케어', ingredient: 'azelaic', type: 'concentration', claimedPpm: 100000 },
    ],
  },
  {
    id: 'p16', brand: 'GLYCO SKIN', name: 'AHA 7 Resurfacing Toner', category: 'toner',
    ph: [3.5, 3.8], emulsion: '수용액 (Aqueous)', dds: [],
    actives: [{ id: 'glycolic', ppm: 70000 }, { id: 'panthenol', ppm: 10000 }],
    claims: [
      { text: '글라이콜릭애씨드 7% 각질 리셋', ingredient: 'glycolic', type: 'concentration', claimedPpm: 70000 },
      { text: '진피 콜라겐 리모델링', ingredient: 'glycolic', type: 'dermis' },
    ],
  },
  {
    id: 'p17', brand: 'CALMDOSE', name: 'Cica Allantoin Soothing Toner', category: 'toner',
    ph: [5.0, 5.5], emulsion: '수용액 (Aqueous)', dds: [],
    actives: [{ id: 'madecassoside', ppm: 1000 }, { id: 'allantoin', ppm: 3000 }, { id: 'panthenol', ppm: 20000 }, { id: 'beta_glucan', ppm: 20000 }],
    claims: [
      { text: '마데카소사이드 + 판테놀 2% 즉각 진정', ingredient: 'panthenol', type: 'concentration', claimedPpm: 20000 },
    ],
  },
  {
    id: 'p18', brand: 'LIPID LAB', name: 'Ceramide 3:1:1 Barrier Cream', category: 'cream',
    ph: [5.0, 5.5], emulsion: 'O/W (수중유형) 라멜라', dds: ['liposome'],
    actives: [{ id: 'ceramide_np', ppm: 10000 }, { id: 'cholesterol', ppm: 3300 }, { id: 'niacinamide', ppm: 20000 }, { id: 'squalane', ppm: 50000 }],
    claims: [
      { text: '세라마이드 1% 피부 지질 3:1:1 재현', ingredient: 'ceramide_np', type: 'concentration', claimedPpm: 10000 },
      { text: '리포좀 세라마이드가 진피까지 장벽 재건', ingredient: 'ceramide_np', type: 'dermis' },
    ],
  },
];
