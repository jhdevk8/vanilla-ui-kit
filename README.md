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

## 로컬에서 확인하는 법

데모 페이지(`docs/*.html`)는 ES 모듈(`type="module"`)로 컴포넌트를 불러오기 때문에
`file://`로 직접 열면 브라우저 CORS 정책에 막혀 import가 실패합니다. 아래 방법 중
하나로 로컬 정적 서버를 통해 열어주세요.

**방법 1. VS Code Live Server 확장 프로그램**

VS Code에 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
확장을 설치한 뒤, 프로젝트 루트에서 `docs/modal-demo.html` 파일을 열고
우클릭 → "Open with Live Server"를 선택합니다.

**방법 2. Python 내장 서버**

```bash
python3 -m http.server 8000
```

실행 후 브라우저에서 아래 주소로 접속합니다.

```
http://localhost:8000/docs/modal-demo.html
http://localhost:8000/docs/accordion-demo.html
http://localhost:8000/docs/tabs-demo.html
http://localhost:8000/docs/dropdown-demo.html
```

## 진행 상황

- [x] 8/1 컴포넌트 목록/API 설계
- [x] 8/2 공통 기반 구조 & 유틸 (Component.js, dom.js, a11y.js, tokens.css)
- [x] 8/3 Modal 구현
- [x] 8/4 Accordion 구현
- [x] 8/5 Tabs 구현
- [x] 8/6 Dropdown 구현
