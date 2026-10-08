import Component from '../../core/Component.js';
import { trapFocus } from '../../utils/a11y.js';

/**
 * Modal 컴포넌트
 * 사용법: new Modal('#myModal', { closeOnEsc: true, onOpen: () => {} })
 *
 * 마크업 규약: el 자체가 오버레이(배경)이며, 내부의 .modal-content가 실제 다이얼로그 박스.
 * 오버레이(el)를 직접 클릭하면 닫히고, .modal-content 내부 클릭은 닫히지 않음.
 */
export default class Modal extends Component {
  static eventNamespace = 'modal';
  // 여러 모달이 동시에 열려도 마지막 모달이 닫힐 때만 스크롤을 풀어주기 위한 공유 카운터
  static _scrollLockCount = 0;

  static defaultOptions = {
    closeOnOverlayClick: true,
    closeOnEsc: true,
    onOpen: null,
    onClose: null,
  };

  constructor(el, userOptions = {}) {
    super(el, userOptions);
    this._releaseFocusTrap = null;
    this._previouslyFocusedEl = null;
    this._isOpen = false;
    this._handleKeydown = this._handleKeydown.bind(this);
    this._handleOverlayClick = this._handleOverlayClick.bind(this);
  }

  open() {
    if (this._isOpen) return;
    this._isOpen = true;

    this._previouslyFocusedEl = document.activeElement;
    this.el.classList.add('is-open');
    this._lockScroll();
    this._releaseFocusTrap = trapFocus(this.el);

    if (this.options.closeOnEsc) {
      document.addEventListener('keydown', this._handleKeydown);
    }
    if (this.options.closeOnOverlayClick) {
      this.el.addEventListener('click', this._handleOverlayClick);
    }

    this.emit('open');
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;

    this.el.classList.remove('is-open');
    this._unlockScroll();

    if (this._releaseFocusTrap) {
      this._releaseFocusTrap();
      this._releaseFocusTrap = null;
    }

    document.removeEventListener('keydown', this._handleKeydown);
    this.el.removeEventListener('click', this._handleOverlayClick);

    if (this._previouslyFocusedEl) {
      this._previouslyFocusedEl.focus();
      this._previouslyFocusedEl = null;
    }

    this.emit('close');
  }

  toggle() {
    this._isOpen ? this.close() : this.open();
  }

  _handleKeydown(e) {
    if (e.key === 'Escape') this.close();
  }

  _handleOverlayClick(e) {
    if (e.target.closest('.modal-content')) return;
    this.close();
  }

  _lockScroll() {
    if (Modal._scrollLockCount === 0) {
      document.body.style.overflow = 'hidden';
    }
    Modal._scrollLockCount++;
  }

  _unlockScroll() {
    Modal._scrollLockCount = Math.max(0, Modal._scrollLockCount - 1);
    if (Modal._scrollLockCount === 0) {
      document.body.style.overflow = '';
    }
  }

  destroy() {
    if (this._isOpen) this.close();
    super.destroy();
  }
}
