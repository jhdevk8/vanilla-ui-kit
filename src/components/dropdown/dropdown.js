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
 * options 배열이 주어지면 <ul> 안의 <li>들을 동적으로 생성한다. 주어지지 않으면
 * 마크업에 이미 존재하는 <li class="dropdown-option">들을 그대로 사용한다.
 *
 * 키보드: 트리거에 포커스를 유지한 채 aria-activedescendant로 하이라이트를 알린다
 * (W3C APG의 "Collapsible Dropdown Listbox" 패턴).
 * - 닫힌 상태: Enter/Space/ArrowDown → 열기 + 첫 옵션(또는 선택된 옵션) 하이라이트
 * - 열린 상태: ArrowDown/ArrowUp(순환), Home/End, Enter/Space(선택+닫기+포커스 복귀), Escape(닫기+포커스 복귀)
 */
export default class Dropdown extends Component {
  static eventNamespace = 'dropdown';

  static defaultOptions = {
    options: null,
    placeholder: '선택하세요',
    onSelect: null,
  };

  constructor(el, userOptions = {}) {
    super(el, userOptions);

    this._trigger = this.el.querySelector(':scope > .dropdown-trigger');
    this._list = this.el.querySelector(':scope > .dropdown-list');

    this._isOpen = false;
    this._highlightedIndex = -1;
    this._selectedValue = null;

    this._handleDocumentClick = this._handleDocumentClick.bind(this);

    this._buildOptions();
    this._init();
  }

  _buildOptions() {
    const { options } = this.options;

    if (Array.isArray(options) && options.length > 0) {
      this._list.innerHTML = '';
      options.forEach((option, index) => {
        const li = document.createElement('li');
        li.className = 'dropdown-option';
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.dataset.value = option.value;
        li.id = `${this.el.id || 'dropdown'}-option-${index}`;
        li.textContent = option.label;
        this._list.appendChild(li);
      });
    }

    this._options = [...this._list.querySelectorAll(':scope > .dropdown-option')].map(
      (optionEl, index) => {
        if (!optionEl.id) {
          optionEl.id = `${this.el.id || 'dropdown'}-option-${index}`;
        }
        return {
          el: optionEl,
          value: optionEl.dataset.value,
          label: optionEl.textContent.trim(),
        };
      }
    );
  }

  _init() {
    this._on(this._trigger, 'click', () => this.toggle());
    this._on(this._trigger, 'keydown', (e) => this._handleTriggerKeydown(e));
    this._on(this._list, 'click', (e) => this._handleOptionClick(e));
    this._on(document, 'click', this._handleDocumentClick);

    this._trigger.setAttribute('aria-expanded', 'false');
    this._list.hidden = true;

    const preselected = this._options.find(
      (option) => option.el.getAttribute('aria-selected') === 'true'
    );
    this._options.forEach((option) =>
      option.el.setAttribute('aria-selected', String(option === preselected))
    );

    if (preselected) {
      this._selectedValue = preselected.value;
      this._trigger.textContent = preselected.label;
    } else {
      this._trigger.textContent = this.options.placeholder;
    }
  }

  open() {
    if (this._isOpen) return;
    this._isOpen = true;

    this._trigger.setAttribute('aria-expanded', 'true');
    this._list.hidden = false;

    const selectedIndex = this._options.findIndex((option) => option.value === this._selectedValue);
    this._setHighlight(selectedIndex >= 0 ? selectedIndex : 0);

    this.emit('open');
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;

    this._trigger.setAttribute('aria-expanded', 'false');
    this._list.hidden = true;
    this._clearHighlight();
    this._trigger.removeAttribute('aria-activedescendant');

    this.emit('close');
  }

  toggle() {
    this._isOpen ? this.close() : this.open();
  }

  select(value) {
    const option = this._options.find((o) => o.value === value);
    if (!option) return;

    this._options.forEach((o) => o.el.setAttribute('aria-selected', String(o === option)));
    this._selectedValue = option.value;
    this._trigger.textContent = option.label;

    this.close();
    this._trigger.focus();

    this.emit('select', { value: option.value, label: option.label });
  }

  _handleTriggerKeydown(e) {
    if (!this._isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.open();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._moveHighlight(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._moveHighlight(-1);
        break;
      case 'Home':
        e.preventDefault();
        this._setHighlight(0);
        break;
      case 'End':
        e.preventDefault();
        this._setHighlight(this._options.length - 1);
        break;
      case 'Enter':
      case ' ':
      case 'Spacebar':
        e.preventDefault();
        this._selectHighlighted();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        this._trigger.focus();
        break;
      default:
        break;
    }
  }

  _handleOptionClick(e) {
    const optionEl = e.target.closest('.dropdown-option');
    if (!optionEl || !this._list.contains(optionEl)) return;
    this.select(optionEl.dataset.value);
  }

  _handleDocumentClick(e) {
    if (!this._isOpen) return;
    if (this.el.contains(e.target)) return;
    this.close();
  }

  _setHighlight(index) {
    if (index < 0 || index >= this._options.length) return;
    this._clearHighlight();

    this._highlightedIndex = index;
    const option = this._options[index];
    option.el.classList.add('is-highlighted');
    this._trigger.setAttribute('aria-activedescendant', option.el.id);
    option.el.scrollIntoView({ block: 'nearest' });
  }

  _clearHighlight() {
    const current = this._options[this._highlightedIndex];
    if (current) current.el.classList.remove('is-highlighted');
    this._highlightedIndex = -1;
  }

  _moveHighlight(delta) {
    const count = this._options.length;
    if (count === 0) return;
    const nextIndex = (this._highlightedIndex + delta + count) % count;
    this._setHighlight(nextIndex);
  }

  _selectHighlighted() {
    const option = this._options[this._highlightedIndex];
    if (!option) return;
    this.select(option.value);
  }

  destroy() {
    if (this._isOpen) this.close();
    super.destroy();
  }
}