# Vanilla JS UI Component Library

바닐라 JavaScript로 만드는 UI 컴포넌트 라이브러리 (포트폴리오 프로젝트)

## 폴더 구조

```
vanilla-ui-kit/
├── index.html
├── src/
│   ├── components/       # 컴포넌트별 폴더 (js + css)
│   │   ├── modal/
│   │   ├── tabs/
│   │   ├── accordion/
│   │   ├── tooltip/
│   │   └── dropdown/
│   ├── core/
│   │   └── Component.js  # 모든 컴포넌트의 베이스 클래스
│   ├── utils/
│   │   ├── dom.js         # qs, qsa, delegate, cx
│   │   └── a11y.js        # trapFocus 등 접근성 헬퍼
│   └── styles/
│       └── tokens.css     # 디자인 토큰 (CSS 변수)
└── docs/                   # 컴포넌트별 데모/문서 페이지
```

## 공통 API 컨벤션

- 생성: `new ComponentName(selector | element, options)`
- 메서드: 동사 원형 (`open`, `close`, `toggle`, `destroy`)
- 이벤트: `컴포넌트명:동사` 커스텀 이벤트 + `onXxx` 콜백 옵션 동시 지원
  ```js
  el.addEventListener('modal:open', (e) => {});
  new Modal(el, { onOpen: () => {} });
  ```

## 진행 상황

- [x] 8/1 컴포넌트 목록/API 설계
- [x] 8/2 공통 기반 구조 & 유틸 (Component.js, dom.js, a11y.js, tokens.css)
- [ ] 8/3 Modal 구현
- [ ] 8/4 Accordion 구현
- [ ] 8/5 Tabs 구현
- [ ] 8/6 Dropdown 구현
