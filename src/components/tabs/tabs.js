import Component from '../../core/Component.js';

/**
 * Tabs 컴포넌트
 * 사용법: new Tabs('#myTabs', { activeIndex: 0 })
 *
 * 마크업 규약:
 * <div id="myTabs" class="tabs">
 *   <div class="tabs-list" role="tablist">
 *     <button class="tabs-tab" role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">탭 1</button>
 *     <button class="tabs-tab" role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">탭 2</button>
 *   </div>
 *   <div class="tabs-panel" role="tabpanel" id="panel-1" aria-labelledby="tab-1">내용 1</div>
 *   <div class="tabs-panel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>내용 2</div>
 * </div>
 *
 * 키보드: ArrowRight/ArrowLeft(자동 활성화 + 순환), Home/End
 */
export default class Tabs extends Component {
  static eventNamespace = 'tabs';

  constructor(el, userOptions = {}) {
    const defaultOptions = {
      activeIndex: 0,
      onChange: null,
    };
    super(el, defaultOptions, userOptions);

    this._tabs = [...this.el.querySelectorAll(':scope > .tabs-list > .tabs-tab')];
    this._panels = [...this.el.querySelectorAll(':scope > .tabs-panel')];
    this._activeIndex = null;

    this._init();
  }

  _init() {
    this._tabs.forEach((tab, index) => {
      this._on(tab, 'click', () => this.select(index));
      this._on(tab, 'keydown', (e) => this._handleKeydown(e, index));
    });

    this.select(this.options.activeIndex, { silent: true });
  }

  _handleKeydown(e, index) {
    const count = this._tabs.length;
    let nextIndex = null;

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % count;
        break;
      case 'ArrowLeft':
        nextIndex = (index - 1 + count) % count;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = count - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    this._tabs[nextIndex].focus();
    this.select(nextIndex);
  }

  select(index, { silent = false } = {}) {
    const tab = this._tabs[index];
    const panel = this._panels[index];
    if (!tab || !panel) return;
    if (this._activeIndex === index) return;

    this._tabs.forEach((t, i) => {
      const isSelected = i === index;
      t.setAttribute('aria-selected', String(isSelected));
      t.tabIndex = isSelected ? 0 : -1;
    });

    this._panels.forEach((p, i) => {
      p.hidden = i !== index;
    });

    this._activeIndex = index;

    if (!silent) {
      this.emit('change', { index });
    }
  }
}
