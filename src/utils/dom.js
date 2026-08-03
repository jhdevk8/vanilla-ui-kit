// 셀렉터 단축 함수
export const qs = (selector, ctx = document) => ctx.querySelector(selector);
export const qsa = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

/**
 * 이벤트 위임 — 동적으로 생성/제거되는 요소에도 대응 가능
 * @param {Element} root - 이벤트를 감지할 상위 요소
 * @param {string} eventType - 'click', 'keydown' 등
 * @param {string} selector - 위임 대상 셀렉터
 * @param {(e: Event, target: Element) => void} handler
 */
export function delegate(root, eventType, selector, handler) {
  const listener = (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  };
  root.addEventListener(eventType, listener);
  return () => root.removeEventListener(eventType, listener); // cleanup 함수 반환
}

// 여러 클래스를 조건부로 합치는 유틸 (className 조합용)
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}
