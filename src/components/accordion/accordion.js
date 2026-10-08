import Component from '../../core/Component.js';
import { qs, qsa } from '../../utils/dom.js';
import { getNavigationIndex } from '../../utils/a11y.js';

/**
 * Accordion 컴포넌트
 * 사용법: new Accordion('#myAccordion', { multiple: false, defaultOpen: 0 })
 *
 * 마크업 규약:
 * <div id="myAccordion" class="accordion">
 *   <div class="accordion-item">
 *     <button class="accordion-trigger" aria-expanded="false" aria-controls="panel-1" id="trigger-1">질문</button>
 *     <div class="accordion-panel" id="panel-1" aria-labelledby="trigger-1" hidden>내용</div>
 *   </div>
 * </div>
 */
export default class Accordion extends Component {
  static eventNamespace = 'accordion';

  static defaultOptions = {
    multiple: false,
    defaultOpen: null,
    onToggle: null,
  };

  constructor(el, userOptions = {}) {
    super(el, userOptions);

    this._items = qsa(':scope > .accordion-item', this.el);
    this._triggers = this._items.map((item) => qs('.accordion-trigger', item));
    this._panels = this._items.map((item) => qs('.accordion-panel', item));
    this._transitionCleanups = new Map();

    this._init();
  }

  _init() {
    this._triggers.forEach((trigger, index) => {
      this._on(trigger, 'click', () => this.toggle(index));
      this._on(trigger, 'keydown', (e) => this._handleKeydown(e, index));
    });

    const { defaultOpen } = this.options;
    if (defaultOpen !== null && defaultOpen !== undefined) {
      const indexes = Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
      indexes.forEach((index) => this.open(index, { silent: true, animate: false }));
    }
  }

  _handleKeydown(e, index) {
    const nextIndex = getNavigationIndex(e.key, index, this._triggers.length, {
      prevKey: 'ArrowUp',
      nextKey: 'ArrowDown',
    });
    if (nextIndex === null) return;

    e.preventDefault();
    this._triggers[nextIndex].focus();
  }

  open(index, { silent = false, animate = true } = {}) {
    const trigger = this._triggers[index];
    const panel = this._panels[index];
    if (!trigger || !panel) return;
    if (trigger.getAttribute('aria-expanded') === 'true') return;

    if (!this.options.multiple) {
      this._triggers.forEach((t, i) => {
        if (i !== index && t.getAttribute('aria-expanded') === 'true') {
          this.close(i, { silent, animate });
        }
      });
    }

    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;

    if (animate) {
      this._animateOpen(panel);
    } else {
      this._clearPendingTransition(panel);
      panel.style.height = 'auto';
    }

    if (!silent) {
      this.emit('toggle', { index, isOpen: true });
    }
  }

  close(index, { silent = false, animate = true } = {}) {
    const trigger = this._triggers[index];
    const panel = this._panels[index];
    if (!trigger || !panel) return;
    if (trigger.getAttribute('aria-expanded') !== 'true') return;

    trigger.setAttribute('aria-expanded', 'false');

    if (animate) {
      this._animateClose(panel);
    } else {
      this._clearPendingTransition(panel);
      panel.style.height = '';
      panel.hidden = true;
    }

    if (!silent) {
      this.emit('toggle', { index, isOpen: false });
    }
  }

  toggle(index) {
    const trigger = this._triggers[index];
    if (!trigger) return;
    if (trigger.getAttribute('aria-expanded') === 'true') {
      this.close(index);
    } else {
      this.open(index);
    }
  }

  _hasTransition(panel) {
    return parseFloat(getComputedStyle(panel).transitionDuration) > 0;
  }

  _clearPendingTransition(panel) {
    const cleanup = this._transitionCleanups.get(panel);
    if (cleanup) {
      cleanup();
      this._transitionCleanups.delete(panel);
    }
  }

  _animateOpen(panel) {
    this._clearPendingTransition(panel);

    if (!this._hasTransition(panel)) {
      panel.style.height = 'auto';
      return;
    }

    panel.style.height = '0px';
    // eslint-disable-next-line no-unused-expressions
    panel.offsetHeight; // 강제 리플로우 — 0px가 실제로 적용된 후 트랜지션이 시작되도록 함
    const targetHeight = panel.scrollHeight;
    panel.style.height = `${targetHeight}px`;

    const handleEnd = (e) => {
      if (e.target !== panel || e.propertyName !== 'height') return;
      panel.style.height = 'auto';
      // Map 항목만 지우면 리스너가 패널에 남아 다음 열기/닫기 때 다시 실행되므로 리스너까지 해제
      this._clearPendingTransition(panel);
    };
    panel.addEventListener('transitionend', handleEnd);
    this._transitionCleanups.set(panel, () => panel.removeEventListener('transitionend', handleEnd));
  }

  _animateClose(panel) {
    this._clearPendingTransition(panel);

    if (!this._hasTransition(panel)) {
      panel.style.height = '';
      panel.hidden = true;
      return;
    }

    const currentHeight = panel.scrollHeight;
    panel.style.height = `${currentHeight}px`;
    // eslint-disable-next-line no-unused-expressions
    panel.offsetHeight; // 강제 리플로우 — auto/명시값에서 시작 높이가 적용된 후 0px로 전환되도록 함
    panel.style.height = '0px';

    const handleEnd = (e) => {
      if (e.target !== panel || e.propertyName !== 'height') return;
      panel.hidden = true;
      panel.style.height = '';
      this._clearPendingTransition(panel);
    };
    panel.addEventListener('transitionend', handleEnd);
    this._transitionCleanups.set(panel, () => panel.removeEventListener('transitionend', handleEnd));
  }

  destroy() {
    this._panels.forEach((panel) => this._clearPendingTransition(panel));
    super.destroy();
  }
}
