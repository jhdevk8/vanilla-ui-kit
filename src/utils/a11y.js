const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 포커스 트랩 — Modal 등에서 Tab 이동이 컨테이너 밖으로 나가지 않도록 고정
 * @param {Element} container
 * @returns {() => void} cleanup 함수
 */
export function trapFocus(container) {
  const focusable = [...container.querySelectorAll(FOCUSABLE_SELECTOR)];
  if (focusable.length === 0) return () => {};

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', handleKeydown);
  first.focus();

  return () => container.removeEventListener('keydown', handleKeydown);
}

// 스크린리더 전용 텍스트 요소 생성 (필요시 사용)
export function createSrOnly(text) {
  const el = document.createElement('span');
  el.textContent = text;
  el.style.cssText =
    'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
  return el;
}
