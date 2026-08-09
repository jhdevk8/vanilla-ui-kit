import Component from '../../core/Component.js';

/**
 * Toast 컴포넌트
 * 다른 컴포넌트와 달리 기존 DOM 요소에 붙는 게 아니라, 스스로
 * <div class="toast-container toast-container--{position}">를 만들어 body에 삽입하고
 * 이를 this.el로 사용하는 "매니저" 패턴이다 (emit()이 이 컨테이너에서 이벤트를 발행함).
 *
 * 사용법:
 *   const toast = new Toast({ position: 'top-right', duration: 3000 });
 *   toast.show('저장되었습니다', { type: 'success' });
 *   const id = toast.show('처리 중...', { type: 'info', duration: 0 }); // duration 0 → 수동 dismiss 전까지 유지
 *   toast.dismiss(id);
 */
export default class Toast extends Component {
  static eventNamespace = 'toast';

  constructor(userOptions = {}) {
    const defaultOptions = {
      position: 'top-right',
      duration: 3000,
      maxVisible: 3,
    };
    const options = { ...defaultOptions, ...userOptions };

    const container = document.createElement('div');
    container.className = `toast-container toast-container--${options.position}`;
    document.body.appendChild(container);

    super(container, defaultOptions, userOptions);

    this._idSeq = 0;
    this._visible = new Map(); // id -> { el, timerId }
    this._queue = [];
    this._timers = new Set();
  }

  /**
   * 토스트를 표시한다. 현재 보이는 개수가 maxVisible을 넘으면 큐에 대기시킨다.
   * @returns {string} 생성된 토스트의 고유 id (dismiss()에 사용)
   */
  show(message, itemOptions = {}) {
    const id = `toast-${++this._idSeq}`;
    const type = itemOptions.type || 'info';
    const duration =
      itemOptions.duration !== undefined ? itemOptions.duration : this.options.duration;

    const item = { id, message, type, duration };

    if (this._visible.size >= this.options.maxVisible) {
      this._queue.push(item);
    } else {
      this._renderToast(item);
    }

    return id;
  }

  /**
   * 특정 토스트를 사라짐 애니메이션 후 DOM에서 제거한다.
   * 아직 큐에 대기 중인 토스트라면 큐에서만 제거한다.
   */
  dismiss(id) {
    const visible = this._visible.get(id);
    if (visible) {
      this._removeVisible(id, visible);
      return;
    }

    const queueIndex = this._queue.findIndex((item) => item.id === id);
    if (queueIndex !== -1) {
      this._queue.splice(queueIndex, 1);
    }
  }

  /**
   * 화면에 보이는 토스트와 대기 큐를 전부 제거한다 (애니메이션 없이 즉시).
   */
  clear() {
    this._queue = [];

    [...this._visible.entries()].forEach(([id, { el, timerId }]) => {
      this._clearTimer(timerId);
      el.remove();
      this._visible.delete(id);
      this.emit('dismiss', { id });
    });
  }

  destroy() {
    this._timers.forEach((timerId) => clearTimeout(timerId));
    this._timers.clear();
    this._visible.clear();
    this._queue = [];
    this.el.remove();
    super.destroy();
  }

  _renderToast({ id, message, type, duration }) {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', 'status');
    el.dataset.toastId = id;

    const messageEl = document.createElement('span');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    el.appendChild(messageEl);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', '닫기');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.dismiss(id));
    el.appendChild(closeBtn);

    this.el.appendChild(el);

    // 삽입 직후 바로 클래스를 주면 트랜지션이 시작되지 않으므로 다음 프레임까지 대기
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('is-visible'));
    });

    let timerId = null;
    if (duration > 0) {
      timerId = this._setTimer(() => this.dismiss(id), duration);
    }

    this._visible.set(id, { el, timerId });

    this.emit('show', { id });
  }

  _removeVisible(id, { el, timerId }) {
    this._clearTimer(timerId);
    this._visible.delete(id);

    el.classList.remove('is-visible');
    el.classList.add('is-leaving');

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', onTransitionEnd);
      el.remove();
      this.emit('dismiss', { id });
      this._processQueue();
    };

    const onTransitionEnd = (e) => {
      if (e.target !== el) return;
      finish();
    };

    const hasTransition = parseFloat(getComputedStyle(el).transitionDuration) > 0;
    if (hasTransition) {
      el.addEventListener('transitionend', onTransitionEnd);
      this._setTimer(finish, 300); // 트랜지션이 걸리지 않는 경우를 대비한 폴백
    } else {
      finish();
    }
  }

  _processQueue() {
    if (this._queue.length === 0) return;
    if (this._visible.size >= this.options.maxVisible) return;
    this._renderToast(this._queue.shift());
  }

  _setTimer(fn, delay) {
    const timerId = setTimeout(() => {
      this._timers.delete(timerId);
      fn();
    }, delay);
    this._timers.add(timerId);
    return timerId;
  }

  _clearTimer(timerId) {
    if (timerId == null) return;
    clearTimeout(timerId);
    this._timers.delete(timerId);
  }
}
