# Vanilla UI Kit

프레임워크 없이 순수 JavaScript(ES Modules)와 CSS만으로 만든 UI 컴포넌트 라이브러리입니다.
React/Vue 같은 프레임워크에 기대지 않고도 접근성(WAI-ARIA)을 지키는 인터랙티브 컴포넌트를
어떻게 설계하고 구현하는지 정리하기 위해 시작한 포트폴리오 프로젝트입니다.

DOM 조작, 포커스 트랩, 키보드 내비게이션 같은 기본기를 직접 구현해보고, 이후 다른 프레임워크로
같은 컴포넌트를 옮길 때 기준으로 삼을 수 있는 레퍼런스를 만드는 것이 목표입니다.

## Live Demo

<!-- TODO: GitHub Pages 배포 후 실제 URL로 교체 -->
🔗 [https://\<github-username\>.github.io/vanilla-ui-kit/](https://github.com/)

## 기술 스택

- **JavaScript (ES2020+, ES Modules)** — 프레임워크/빌드 도구 없이 브라우저 네이티브 모듈 사용
- **CSS3** — CSS Custom Properties(디자인 토큰) 기반 스타일링
- **HTML5 / WAI-ARIA** — 시맨틱 마크업 및 접근성 속성
- 별도 런타임/번들러 없음 (정적 파일 그대로 서빙 가능)

## 컴포넌트

| 컴포넌트 | 기능 요약 |
| --- | --- |
| **Modal** | 오버레이 다이얼로그, 포커스 트랩, ESC/오버레이 클릭으로 닫기, 스크롤 잠금 |
| **Accordion** | 아코디언 패널 열기/닫기, 단일/다중 확장 모드 |
| **Tabs** | 탭 전환, 방향키 기반 roving tabindex 내비게이션 |
| **Dropdown** | 커스텀 셀렉트, 방향키 하이라이트 이동, 옵션 선택 |
| **Carousel** | 슬라이드 전환, 이전/다음 컨트롤, 인디케이터 |
| **Toast** | body에 마운트되는 알림 컨테이너, 자동 소멸(auto-dismiss) |

## 사용법 (Modal 예시)

```html
<link rel="stylesheet" href="src/styles/tokens.css" />
<link rel="stylesheet" href="src/components/modal/modal.css" />

<!-- 루트 요소(#myModal) 자체가 오버레이, 내부 .modal-content가 실제 다이얼로그 박스 -->
<div id="myModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="myModalTitle">
  <div class="modal-content">
    <h2 id="myModalTitle">제목</h2>
    <p>모달 내용</p>
    <button type="button" id="closeBtn">닫기</button>
  </div>
</div>
```

```js
import Modal from './src/components/modal/modal.js';

const modal = new Modal('#myModal', {
  closeOnEsc: true,
  closeOnOverlayClick: true,
  onOpen: () => console.log('모달 열림'),
  onClose: () => console.log('모달 닫힘'),
});

document.querySelector('#openBtn').addEventListener('click', () => modal.open());
document.querySelector('#closeBtn').addEventListener('click', () => modal.close());

// 커스텀 이벤트로도 구독 가능
document.querySelector('#myModal').addEventListener('modal:open', (e) => {
  console.log('modal:open 이벤트 발생');
});
```

## 설계 원칙

- **공통 베이스 클래스 상속** — 모든 컴포넌트는 `src/core/Component.js`의 `Component`를 상속합니다.
  옵션 병합, 리스너 등록/추적, `destroy()` 시 일괄 해제 로직을 베이스 클래스에서 공통으로 처리합니다.
- **커스텀 이벤트 + 콜백 옵션 동시 지원** — 상태 변화는 `emit('open')` 호출 한 번으로
  `컴포넌트명:동사` 형태의 `CustomEvent`(예: `modal:open`)를 발행함과 동시에, 옵션으로 전달한
  `onOpen` 같은 콜백도 함께 호출합니다. 이벤트 위임과 직접 콜백 등록 양쪽 스타일을 모두 지원하기 위함입니다.
- **WAI-ARIA 패턴 준수** — 역할(`role`), 상태 속성(`aria-expanded`, `aria-modal` 등), 포커스 트랩,
  방향키 기반 roving tabindex 등 각 컴포넌트에 해당하는 W3C ARIA Authoring Practices 패턴을 따릅니다.

## 로컬에서 확인하는 법

데모 페이지(`docs/*.html`, `index.html`)는 ES 모듈(`type="module"`)로 컴포넌트를 불러오기 때문에
`file://`로 직접 열면 브라우저 CORS 정책에 막혀 import가 실패합니다. 아래 방법 중 하나로 로컬
정적 서버를 통해 열어주세요.

**방법 1. VS Code Live Server 확장 프로그램**

VS Code에 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
확장을 설치한 뒤, 프로젝트 루트에서 `index.html` 또는 `docs/modal-demo.html` 파일을 열고
우클릭 → "Open with Live Server"를 선택합니다.

**방법 2. Python 내장 서버**

```bash
python3 -m http.server 8000
```

실행 후 브라우저에서 아래 주소로 접속합니다.

```
http://localhost:8000/index.html
http://localhost:8000/docs/modal-demo.html
http://localhost:8000/docs/accordion-demo.html
http://localhost:8000/docs/tabs-demo.html
http://localhost:8000/docs/dropdown-demo.html
http://localhost:8000/docs/carousel-demo.html
http://localhost:8000/docs/toast-demo.html
```

## 스크린샷

<!-- TODO: 컴포넌트 스크린샷/GIF 추가 -->

| Modal | Dropdown | Toast |
| --- | --- | --- |
| _(스크린샷 예정)_ | _(스크린샷 예정)_ | _(스크린샷 예정)_ |

## 폴더 구조

```
vanilla-ui-kit/
├── index.html              # 컴포넌트 통합 문서 페이지 (GitHub Pages 첫 화면)
├── src/
│   ├── components/         # 컴포넌트별 폴더 (js + css)
│   │   ├── modal/
│   │   ├── accordion/
│   │   ├── tabs/
│   │   ├── dropdown/
│   │   ├── carousel/
│   │   └── toast/
│   ├── core/
│   │   └── Component.js    # 모든 컴포넌트의 베이스 클래스
│   ├── utils/
│   │   ├── dom.js          # qs, qsa, delegate, cx
│   │   └── a11y.js         # trapFocus 등 접근성 헬퍼
│   └── styles/
│       └── tokens.css      # 디자인 토큰 (CSS 변수)
└── docs/                    # 컴포넌트별 개별 데모 페이지
```

## 진행 상황

- [x] 8/1 컴포넌트 목록/API 설계
- [x] 8/2 공통 기반 구조 & 유틸 (Component.js, dom.js, a11y.js, tokens.css)
- [x] 8/3 Modal 구현
- [x] 8/4 Accordion 구현
- [x] 8/5 Tabs 구현
- [x] 8/6 Dropdown 구현
- [x] 8/10 통합 문서 페이지 (index.html)
- [ ] GitHub Pages 배포
