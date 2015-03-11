(function (exports) {
  'use strict';

  var isTouchscreen = (function () {
    return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
  })();

  var mixin = function (el, css) {
    Object.keys(css).forEach(function (prop) {
      el.style[prop] = css[prop];
    });
  };

  var imageUrls = [
    'http://i.imgur.com/cPsUm9U.jpg',
    'http://i.imgur.com/tZnIuhd.jpg',
    'http://i.imgur.com/eoSCkZm.jpg',
    'http://i.imgur.com/wq81DIh.jpg',
    'http://i.imgur.com/zaJiSoT.jpg'
  ];

  var imageStyles = {
    maxWidth: '100%',
    transform: 'translateZ(0)',
    webkitTransform: 'translateZ(0)',
  };

  var containerStyles = {
    height: '340px',
    width: '100%',
    maxWidth: '600px',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  };

  var start = (isTouchscreen) ? 'touchstart' : 'mousedown';
  var end = (isTouchscreen) ? 'touchend' : 'mouseup';
  var move = (isTouchscreen) ? 'touchmove' : 'mousemove';

  var AdUnit = function (parentEl) {

    this.container = document.createElement('div');
    mixin(this.container, containerStyles);

    this.images = imageUrls.map(this.createImage.bind(this));

    parentEl.appendChild(this.container);

    this.container.addEventListener(start, this.startDrag.bind(this));

    this.onDragHandler = this.onDrag.bind(this);
    this.stopDragHandler = this.stopDrag.bind(this);
    this.drawHandler = this.draw.bind(this);

    this.offset = 0;
    this.last = 0;
    this.index = 0;
    this.width = this.container.offsetWidth;
  };

  var returnFalse = function (e) {
    e.preventDefault();
    return false;
  };

  AdUnit.prototype.createImage = function (imageUrl) {
    var img = document.createElement('img'); 
    mixin(img, imageStyles);
    this.container.appendChild(img);

    img.setAttribute('src', imageUrl);

    img.addEventListener('dragstart', returnFalse);
    return img;
  }

  AdUnit.prototype.startDrag = function (e) {
    this.startX = (typeof e.screenX !== 'undefined') ? e.screenX : e.targetTouches[0].screenX;
    this.startTime = new Date();
    document.addEventListener(move, this.onDragHandler);
    document.addEventListener(end, this.stopDragHandler);
    this.tick();
    return false;
  };

  AdUnit.prototype.stopDrag = function () {
  console.log('stopDrag');
    document.removeEventListener(move, this.onDragHandler);
    document.removeEventListener(end, this.stopDragHandler);

    this.running = false;
    var elapsedTime = new Date() - this.startTime;

    var bool = (this.offset >= 0 ? 1 : -1);
    var wrap = this.index - bool < 0 || this.index - bool >= this.images.length;
    if(!wrap && elapsedTime < 500 && Math.abs(this.offset) > 10) {
      this.index -= bool;
      this.last += bool * 100;
      this.offset = 0;
      this.resetFrame();
    }
    else {
      this.offset = 0;
      this.resetFrame();
    }
  };

  AdUnit.prototype.onDrag = function (e) {
    var newX = e.screenX || e.targetTouches[0].screenX;
    this.offset = (newX - this.startX) / this.width * 100;
  };

  AdUnit.prototype.tick = function () {
    if (!this.running) {
      this.running = true;
      requestAnimationFrame(this.drawHandler);
    }
  };

  AdUnit.prototype.draw = function () {
    var transform = 'translateX(' + (this.last + this.offset) + '%) translateZ(0)';
    this.images.forEach(function (img) {
      img.style.transform = transform;
      img.style.webkitTransform = transform;
    });
    if(this.running) {
      requestAnimationFrame(this.drawHandler);
    }
  };

  var clearTransition = function (e) {
    var el = e.target;
    el.style.transition = '';
    el.style.webkitTransition = '';
    el.removeEventListener('transitionend', clearTransition);
    el.removeEventListener('webkittransitionend', clearTransition);
  };

  var stopRunning = function () {
    this.running = false;
  };

  AdUnit.prototype.resetFrame = function () {
    this.images.forEach(function (img) {
      img.style.transition = 'all 300ms ease-out';
      img.style.webkitTransition = 'all 300ms ease-out';
      img.addEventListener('transitionend', clearTransition);
      img.addEventListener('webkittransitionend', clearTransition);
    });
    this.tick();
    requestAnimationFrame(stopRunning.bind(this));
  };

  exports.AdUnit = AdUnit;

})(this);
