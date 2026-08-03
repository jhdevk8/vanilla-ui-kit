/**
 * 모든 UI 컴포넌트의 베이스 클래스
 * - 공통 옵션 병합
 * - 커스텀 이벤트 발행 (emit)
 * - 리스너 추적 및 destroy 시 일괄 해제
 */
export default class Component {
  constructor(el, defaultOptions = {}, userOptions = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!this.el) {
      throw new Error(`[Component] 요소를 찾을 수 없습니다: ${el}`);
    }
    this.options = { ...defaultOptions, ...userOptions };
    this._listeners = [];
  }

  /**
   * 리스너 등록 + 추적 (destroy 시 자동 해제)
   */
  _on(target, type, handler) {
    target.addEventListener(type, handler);
    this._listeners.push({ target, type, handler });
  }

  /**
   * 커스텀 이벤트 발행. 예: this.emit('open') → 'modal:open'
   * 컴포넌트명은 하위 클래스에서 static eventNamespace로 지정
   */
  emit(eventName, detail = {}) {
    const namespace = this.constructor.eventNamespace || 'component';
    this.el.dispatchEvent(
      new CustomEvent(`${namespace}:${eventName}`, { detail, bubbles: true })
    );
    // 콜백 옵션 방식도 함께 지원 (예: options.onOpen)
    const callbackName = `on${eventName[0].toUpperCase()}${eventName.slice(1)}`;
    if (typeof this.options[callbackName] === 'function') {
      this.options[callbackName](detail);
    }
  }

  destroy() {
    this._listeners.forEach(({ target, type, handler }) =>
      target.removeEventListener(type, handler)
    );
    this._listeners = [];
  }
}
