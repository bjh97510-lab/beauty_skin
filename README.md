# Spec Direct

과장 광고 없는 제형 데이터 기반 화장품 분석 웹앱. 빌드 없이 `index.html`을 브라우저로 열면 실행됩니다.

## 구조

| 파일 | 역할 |
|---|---|
| `js/data.js` | 원료 DB(분자량·유효 농도·근거 등급·최적 pH), DDS, 성분 충돌 규칙, 피부 상태 가중치, 제품 DB |
| `js/engine.js` | 검증 로직 — 500 Da 룰, 컨셉 원료 재분류, PPM 미달(≤10 ppm), pH 적합성, 팩트체크, Spec Score, 필터, 루틴 매칭, 전성분 파싱 |
| `js/app.js` | 화면 (대시보드 · 제품 리포트 · 정밀 필터 · 루틴 매칭 · OCR 스캔), 해시 라우팅 |
| `css/styles.css` | Clean Lab 스타일 (Navy `#0A192F` / Mint `#00F2FE` / `#F8F9FA`) |

## 데이터 교체

`SD.PRODUCTS`의 제품은 로직 시연용 **가상 샘플**입니다. 실제 제품은 제조사 공개 자료·성적서로 확인한 값으로 같은 형식에 맞춰 넣으세요.

```js
{ id, brand, name, category: 'toner'|'serum'|'cream', ph: [min, max], emulsion, dds: ['liposome', ...],
  actives: [{ id: 'niacinamide', ppm: 50000 }],
  claims:  [{ text, ingredient, type: 'dermis'|'regeneration'|'concentration'|'activation'|'function', claimedPpm? }] }
```

마케팅 문구 판정과 Spec Score는 이 값들에서 자동으로 계산됩니다.

## 링크

- `#/product/p04`: 제품 리포트
- `#/search?q=PDRN`: 검색
- `#/routine?c=pigment,wrinkle`: 루틴 바로 생성 (dehydration, barrier, pigment, wrinkle, acne, sensitive)

OCR은 첫 실행 때 tesseract.js(kor+eng)를 CDN에서 받아오므로 인터넷 연결이 필요합니다.
