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

/**
 * 방향키 내비게이션 — 키 입력에 따라 이동할 인덱스를 계산한다.
 * 이전/다음 키는 양 끝에서 반대쪽 끝으로 순환하고, Home/End는 처음/마지막으로 이동한다.
 * Accordion(↑↓), Tabs(←→), Dropdown(↑↓)이 공통으로 사용한다.
 * @param {string} key - KeyboardEvent.key
 * @param {number} currentIndex - 현재 인덱스 (-1이면 선택된 항목 없음)
 * @param {number} count - 전체 항목 수
 * @param {{ prevKey: string, nextKey: string }} keys - 이전/다음으로 이동할 키
 * @returns {number | null} 이동할 인덱스. 처리하지 않는 키이거나 항목이 없으면 null
 */
export function getNavigationIndex(key, currentIndex, count, { prevKey, nextKey }) {
  if (count === 0) return null;

  switch (key) {
    case nextKey:
      return (currentIndex + 1) % count;
    case prevKey:
      return (currentIndex - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

// 스크린리더 전용 텍스트 요소 생성 (필요시 사용)
export function createSrOnly(text) {
  const el = document.createElement('span');
  el.textContent = text;
  el.style.cssText =
    'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
  return el;
}
