import Component from '../../core/Component.js';

/**
 * Carousel 컴포넌트
 * 사용법: new Carousel('#myCarousel', { autoplay: false, interval: 3000, loop: true, startIndex: 0, onChange })
 *
 * 마크업 규약:
 * <div id="myCarousel" class="carousel">
 *   <div class="carousel-track">
 *     <div class="carousel-slide">슬라이드 1</div>
 *   </div>
 *   <button class="carousel-prev" aria-label="이전 슬라이드">‹</button>
 *   <button class="carousel-next" aria-label="다음 슬라이드">›</button>
 *   <div class="carousel-indicators">
 *     <button class="carousel-dot" aria-label="1번째 슬라이드로 이동"></button>
 *   </div>
 * </div>
 *
 * .carousel-indicators가 없거나 .carousel-dot 개수가 슬라이드 개수와 다르면
 * 슬라이드 개수만큼 dot을 동적으로 생성한다.
 *
 * 스와이프: 마우스(포인터)/터치 드래그 거리가 50px를 넘으면 방향에 따라 next()/prev()를 호출한다.
 * 자동재생: hover 중이거나 드래그 중일 때는 일시 정지하고, 벗어나면 재개한다.
 */
export default class Carousel extends Component {
  static eventNamespace = 'carousel';

  static SWIPE_THRESHOLD = 50;

  static defaultOptions = {
    autoplay: false,
    interval: 3000,
    loop: true,
    startIndex: 0,
    onChange: null,
  };

  constructor(el, userOptions = {}) {
    super(el, userOptions);

    this._track = this.el.querySelector(':scope > .carousel-track');
    this._slides = [...this._track.querySelectorAll(':scope > .carousel-slide')];
    this._prevBtn = this.el.querySelector(':scope > .carousel-prev');
    this._nextBtn = this.el.querySelector(':scope > .carousel-next');
    this._indicatorsEl = this.el.querySelector(':scope > .carousel-indicators');

    this._currentIndex = 0;
    this._timerId = null;
    this._isPlaying = false;
    this._isHovering = false;
    this._isDragging = false;
    this._dragStartX = null;
    this._dragCurrentX = null;

    this._buildIndicators();
    this._init();
  }

  _buildIndicators() {
    if (!this._indicatorsEl) {
      this._indicatorsEl = document.createElement('div');
      this._indicatorsEl.className = 'carousel-indicators';
      this.el.appendChild(this._indicatorsEl);
    }

    const existingDots = [...this._indicatorsEl.querySelectorAll(':scope > .carousel-dot')];
    if (existingDots.length !== this._slides.length) {
      this._indicatorsEl.innerHTML = '';
      this._slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `${index + 1}번째 슬라이드로 이동`);
        this._indicatorsEl.appendChild(dot);
      });
    }

    this._dots = [...this._indicatorsEl.querySelectorAll(':scope > .carousel-dot')];
  }

  _init() {
    this._on(this._prevBtn, 'click', () => this.prev());
    this._on(this._nextBtn, 'click', () => this.next());
    this._dots.forEach((dot, index) => {
      this._on(dot, 'click', () => this.goTo(index));
    });

    this._on(this.el, 'mouseenter', () => this._handleHoverStart());
    this._on(this.el, 'mouseleave', () => this._handleHoverEnd());

    this._on(this._track, 'touchstart', (e) => this._handleDragStart(e.touches[0].clientX));
    this._on(this._track, 'touchmove', (e) => this._handleDragMove(e.touches[0].clientX));
    this._on(this._track, 'touchend', () => this._handleDragEnd());

    this._on(this._track, 'pointerdown', (e) => this._handlePointerDown(e));
    this._on(this._track, 'pointermove', (e) => this._handleDragMove(e.clientX));
    this._on(this._track, 'pointerup', (e) => this._handlePointerUp(e));
    this._on(this._track, 'pointercancel', (e) => this._handlePointerUp(e));

    this.goTo(this.options.startIndex, { silent: true });

    if (this.options.autoplay) {
      this.play();
    }
  }

  goTo(index, { silent = false } = {}) {
    const count = this._slides.length;
    if (count === 0) return;

    const targetIndex = this.options.loop
      ? ((index % count) + count) % count
      : Math.max(0, Math.min(index, count - 1));

    this._currentIndex = targetIndex;
    this._render();

    if (!silent) {
      this.emit('change', { index: this._currentIndex });
    }
  }

  next() {
    const count = this._slides.length;
    if (count === 0) return;
    if (!this.options.loop && this._currentIndex >= count - 1) return;
    this.goTo(this._currentIndex + 1);
  }

  prev() {
    const count = this._slides.length;
    if (count === 0) return;
    if (!this.options.loop && this._currentIndex <= 0) return;
    this.goTo(this._currentIndex - 1);
  }

  // immediate: 정지 상태에서 재생할 때 interval을 기다리지 않고 바로 다음 슬라이드로 넘김
  play({ immediate = false } = {}) {
    const wasPlaying = this._isPlaying;
    this._isPlaying = true;
    if (immediate && !wasPlaying) this.next();
    this._startTimer();
  }

  pause() {
    this._isPlaying = false;
    this._stopTimer();
  }

  _render() {
    this._track.style.transform = `translateX(-${this._currentIndex * 100}%)`;

    this._dots.forEach((dot, index) => {
      const isActive = index === this._currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', String(isActive));
    });

    if (!this.options.loop) {
      this._prevBtn.disabled = this._currentIndex === 0;
      this._nextBtn.disabled = this._currentIndex === this._slides.length - 1;
    } else {
      this._prevBtn.disabled = false;
      this._nextBtn.disabled = false;
    }
  }

  _startTimer() {
    this._stopTimer();
    if (!this._isPlaying || this._isHovering || this._isDragging) return;
    this._timerId = setInterval(() => this.next(), this.options.interval);
  }

  _stopTimer() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  _handleHoverStart() {
    this._isHovering = true;
    this._stopTimer();
  }

  _handleHoverEnd() {
    this._isHovering = false;
    this._startTimer();
  }

  _handlePointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this._track.setPointerCapture?.(e.pointerId);
    this._handleDragStart(e.clientX);
  }

  _handlePointerUp(e) {
    this._track.releasePointerCapture?.(e.pointerId);
    this._handleDragEnd();
  }

  _handleDragStart(clientX) {
    this._isDragging = true;
    this._dragStartX = clientX;
    this._dragCurrentX = clientX;
    this._stopTimer();
  }

  _handleDragMove(clientX) {
    if (!this._isDragging) return;
    this._dragCurrentX = clientX;
  }

  _handleDragEnd() {
    if (!this._isDragging) return;
    const deltaX = this._dragCurrentX - this._dragStartX;

    this._isDragging = false;
    this._dragStartX = null;
    this._dragCurrentX = null;

    if (Math.abs(deltaX) > Carousel.SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        this.next();
      } else {
        this.prev();
      }
    }

    if (!this._isHovering) this._startTimer();
  }

  destroy() {
    this._stopTimer();
    super.destroy();
  }
}
