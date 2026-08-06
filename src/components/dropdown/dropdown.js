import Component from '../../core/Component.js';

/**
 * Dropdown 컴포넌트
 * 사용법: new Dropdown('#myDropdown', { options: [{ value, label }], placeholder, onSelect })
 *
 * 마크업 규약:
 * <div id="myDropdown" class="dropdown">
 *   <button class="dropdown-trigger" aria-haspopup="listbox" aria-expanded="false" id="dropdown-btn">선택하세요</button>
 *   <ul class="dropdown-list" role="listbox" aria-labelledby="dropdown-btn" hidden>
 *     <li class="dropdown-option" role="option" data-value="a" id="option-0">옵션 A</li>
 *   </ul>
 * </div>
 *
 * 포커스는 트리거 버튼에 유지되고(APG의 collapsible listbox 패턴), 열려있는 동안
 * aria-activedescendant로 하이라이트된 옵션을 가리킨다.
 * 키보드: 트리거에서 Enter/Space/ArrowDown(열기), 열린 상태에서 ArrowDown/ArrowUp(순환 이동),
 * Home/End(처음/끝), Enter/Space(선택+닫기), Escape(닫기)
 */
export default class Dropdown extends Component {
  static eventNamespace = 'dropdown';

  constructor(el, userOptions = {}) {
    const defaultOptions = {
      options: null,
      placeholder: null,
      onSelect: null,
    };
    super(el, defaultOptions, userOptions);

    this._trigger = this.el.querySelector(':scope > .dropdown-trigger');
    this._list = this.el.querySelector(':scope > .dropdown-list');
    this._placeholder = this.options.placeholder || this._trigger.textContent.trim();

    this._isOpen = false;
    this._highlightedIndex = -1;
    this._selectedIndex = -1;

    this._handleDocumentClick = this._handleDocumentClick.bind(this);

    this._init();
  }

  _init() {
    if (Array.isArray(this.options.options) && this.options.options.length > 0) {
      this._renderOptions(this.options.options);
    }

    this._options = [...this._list.querySelectorAll(':scope > .dropdown-option')];

    const presetIndex = this._options.findIndex(
      (option) => option.getAttribute('aria-selected') === 'true'
    );
    if (presetIndex !== -1) {
      this._applySelection(presetIndex, { silent: true });
    } else {
      this._trigger.textContent = this._placeholder;
    }

    this._on(this._trigger, 'click', () => this.toggle());
    this._on(this._trigger, 'keydown', (e) => this._handleTriggerKeydown(e));
    this._on(this._list, 'click', (e) => this._handleListClick(e));
    this._on(document, 'click', this._handleDocumentClick);
  }

  _renderOptions(options) {
    this._list.innerHTML = '';
    const prefix = this.el.id ? `${this.el.id}-option` : 'dropdown-option';

    options.forEach(({ value, label }, index) => {
      const li = document.createElement('li');
      li.className = 'dropdown-option';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.dataset.value = value;
      li.id = `${prefix}-${index}`;
      li.textContent = label;
      this._list.appendChild(li);
    });
  }

  open() {
    if (this._isOpen || this._options.length === 0) return;
    this._isOpen = true;

    this._trigger.setAttribute('aria-expanded', 'true');
    this._list.hidden = false;

    const startIndex = this._selectedIndex !== -1 ? this._selectedIndex : 0;
    this._highlight(startIndex);

    this.emit('open');
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;

    this._trigger.setAttribute('aria-expanded', 'false');
    this._trigger.removeAttribute('aria-activedescendant');
    this._list.hidden = true;

    if (this._highlightedIndex !== -1) {
      this._options[this._highlightedIndex]?.classList.remove('is-highlighted');
    }
    this._highlightedIndex = -1;

    this.emit('close');
  }

  toggle() {
    this._isOpen ? this.close() : this.open();
  }

  select(value) {
    const index = this._options.findIndex((option) => option.dataset.value === String(value));
    if (index === -1) return;
    this._applySelection(index);
    this.close();
  }

  _applySelection(index, { silent = false } = {}) {
    const option = this._options[index];
    if (!option) return;

    this._options.forEach((opt, i) => {
      opt.setAttribute('aria-selected', String(i === index));
    });

    this._selectedIndex = index;
    this._trigger.textContent = option.textContent;

    if (!silent) {
      this.emit('select', { value: option.dataset.value, label: option.textContent });
    }
  }

  _highlight(index) {
    if (this._highlightedIndex !== -1) {
      this._options[this._highlightedIndex]?.classList.remove('is-highlighted');
    }

    const option = this._options[index];
    if (!option) return;

    option.classList.add('is-highlighted');
    option.scrollIntoView({ block: 'nearest' });
    this._highlightedIndex = index;
    this._trigger.setAttribute('aria-activedescendant', option.id);
  }

  _handleTriggerKeydown(e) {
    const count = this._options.length;
    if (count === 0) return;

    if (!this._isOpen) {
      if (['Enter', ' ', 'Spacebar', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        this.open();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._highlight((this._highlightedIndex + 1) % count);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._highlight((this._highlightedIndex - 1 + count) % count);
        break;
      case 'Home':
        e.preventDefault();
        this._highlight(0);
        break;
      case 'End':
        e.preventDefault();
        this._highlight(count - 1);
        break;
      case 'Enter':
      case ' ':
      case 'Spacebar':
        e.preventDefault();
        if (this._highlightedIndex !== -1) {
          this._applySelection(this._highlightedIndex);
        }
        this.close();
        this._trigger.focus();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        this._trigger.focus();
        break;
      case 'Tab':
        this.close();
        break;
      default:
        break;
    }
  }

  _handleListClick(e) {
    const option = e.target.closest('.dropdown-option');
    if (!option || !this._list.contains(option)) return;

    const index = this._options.indexOf(option);
    if (index === -1) return;

    this._applySelection(index);
    this.close();
    this._trigger.focus();
  }

  _handleDocumentClick(e) {
    if (!this.el.contains(e.target)) {
      this.close();
    }
  }

  destroy() {
    if (this._isOpen) this.close();
    super.destroy();
  }
}
