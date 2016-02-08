/**
 * vue-tooltip - A plugin to implement tooltip using Vue.js
 * @version v0.1.0
 * @link https://github.com/samcrosoft/vue-tooltip
 * @license MIT
 */

/**
 * Register an observer.
 *
 * @param {*}        event     The event name.
 * @param {function} observer  The observer function.
 */

/**
 * Observable interface.
 *
 * @interface
 * @constructor
 * @property {Object} observers
 */
var Observable;

Observable = (function() {
  function Observable() {
    this.observers = {};
    return;
  }

  Observable.prototype.observe = function(event, observer) {
    if (!this.observers[event]) {
      this.observers[event] = [];
    }
    this.observers[event].push(observer);
    return this;
  };


  /**
   * Remove observer(s).
   * If the observer parameter is not provided, all observers for the given event will be removed.
   *
   * @param {*}         event     The event name.
   * @param {function=} observer  The observer function.
   */

  Observable.prototype.ignore = function(event, observer) {
    var index;
    index = -1;
    if (1 === arguments.length) {
      delete this.observers[event];
      return this;
    }
    if (this.observers[event]) {
      index = this.observers[event].indexOf(observer);
      if (-1 !== index) {
        this.observers[event][index] = null;
      }
    }
    return this;
  };


  /**
   * @param {*} event
   * @param {*} data
   */

  Observable.prototype.notify = function(event, data) {
    var i, observers;
    observers = this.observers[event];
    if (!observers) {
      return this;
    }
    i = 0;
    while (i < observers.length) {
      if (null !== observers[i]) {
        observers[i](data);
      }
      ++i;
    }
    i = 0;
    while (i < observers.length) {
      if (null === observers[i]) {
        observers.splice(i, 1);
      }
      ++i;
    }
    if (0 === observers.length) {
      delete this.observers[event];
    }
    return this;
  };

  return Observable;

})();


/*
    requestAnimFrame shim
  copy the one from paul irish
 */
var Waveform,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
    window.setTimeout(callback, 1000 / 30);
  };
})();

Waveform = (function(superClass) {
  extend(Waveform, superClass);

  function Waveform(options) {
    this.onMouseDown = bind(this.onMouseDown, this);
    this.onMouseOver = bind(this.onMouseOver, this);
    this.onMouseUp = bind(this.onMouseUp, this);
    this.onMouseOut = bind(this.onMouseOut, this);
    this.render = bind(this.render, this);
    Waveform.__super__.constructor.call(this);
    this.container = options.container;
    this.canvas = options.canvas;
    this.data = options.data || [];
    this.wavesCollection = this.data;
    this.outerColor = options.outerColor || 'transparent';
    this.reflection = options.reflection || 0;
    this.interpolate = true;
    if (options.interpolate === false) {
      this.interpolate = false;
    }
    if (!this.canvas) {
      if (this.container) {
        this.canvas = this.createCanvas(this.container, options.width || this.container.clientWidth, options.height || this.container.clientHeight);
      } else {
        throw 'Either canvas or container option must be passed';
      }
    }
    this.context = this.canvas.getContext('2d');
    this.width = parseInt(this.context.canvas.width, 10);
    this.height = parseInt(this.context.canvas.height, 10);
    this.waveWidth = 2;
    this.iGutterWidth = 1;
    this.colors = {};
    this.events = {};
    this.active = -1;
    this.selected = -1;
    this.isDragging = false;
    this.isPlaying = false;
    this.isFocus = false;
    this.initialize();
    return;
  }

  Waveform.prototype.initialize = function() {
    this.setColors();
    this.updateHeight();
    this.update();
    this.redraw();
    this.bindContainerResize();
    this.fireEvent('ready');
  };

  Waveform.prototype.bindContainerResize = function() {
    window.addEventListener("resize", (function(_this) {
      return function() {
        console.log("resive event occured", _this.container.clientWidth, "outer is " + _this.outerColor);
        _this.clear();
        _this.width = _this.container.clientWidth;
        _this.canvas = null;
        _this.context = null;
        $(_this.container).empty();
        _this.canvas = _this.createCanvas(_this.container, _this.width, _this.container.clientHeight);
        _this.context = _this.canvas.getContext('2d');
        _this.update();
        return _this.redraw();
      };
    })(this));
  };

  Waveform.prototype.setColors = function() {
    this.setColor('wave-focus', '#333333');
    this.setGradient('wave', ['#666666', 0, '#868686', 1]);
    this.setGradient('wave-active', ['#FF3300', 0, '#FF5100', 1]);
    this.setGradient('wave-selected', ['#993016', 0, '#973C15', 1]);
    this.setGradient('gutter', ['#6B6B6B', 0, '#c9c9c9', 1]);
    this.setGradient('gutter-active', ['#FF3704', 0, '#FF8F63', 1]);
    this.setGradient('gutter-selected', ['#9A371E', 0, '#CE9E8A', 1]);
    this.setColor('reflection', '#999999');
    this.setColor('reflection-active', '#FFC0A0');
  };

  Waveform.prototype.setColor = function(name, color) {
    return this.colors[name] = color;
  };

  Waveform.prototype.setGradient = function(name, colors) {
    var gradient, i;
    this.iRefelection = 0.3;
    this.waveOffset = Math.round(this.height - (this.height * this.iRefelection));
    gradient = this.context.createLinearGradient(0, this.waveOffset, 0, 0);
    i = 0;
    while (i < colors.length) {
      gradient.addColorStop(colors[i + 1], colors[i]);
      i += 2;
    }
    this.colors[name] = gradient;
  };

  Waveform.prototype.updateHeight = function() {
    this.waveOffset = Math.round(this.height - (this.height * this.reflection));
    this.reflectionHeight = Math.round(this.height - this.waveOffset);
    this.waveHeight = this.height - this.reflectionHeight;
  };

  Waveform.prototype.redraw = function() {
    requestAnimationFrame(this.render);
  };

  Waveform.prototype.render = function() {
    var d, dNext, gutterX, i, j, len, ref, reflectionHeight, results, t, xPos, yPos;
    d = void 0;
    i = void 0;
    j = void 0;
    len = void 0;
    ref = void 0;
    results = void 0;
    t = void 0;
    this.clear();
    i = 0;
    ref = this.wavesCollection;
    t = this.width / this.data.length;
    xPos = 0;
    yPos = this.waveOffset;
    this.context.clearRect(xPos, yPos, this.width, this.height);
    results = [];
    j = 0;
    len = ref.length;
    while (j < len) {
      d = ref[j];
      dNext = ref[j + 1];

      /*
      Draw the wave here
       */
      if (this.selected > 0 && (this.selected <= j && j < this.active) || (this.selected > j && j >= this.active)) {
        this.context.fillStyle = this.colors['wave-selected'];
      } else if (this.active > j) {
        this.context.fillStyle = this.colors['wave-active'];
      } else {
        this.context.fillStyle = this.colors['wave-focus'];
      }
      this.context.fillRect(xPos, yPos, this.waveWidth, d);

      /*
      draw the gutter
       */
      if (this.selected > 0 && (this.selected <= j && j < this.active) || (this.selected > j && j >= this.active)) {
        this.context.fillStyle = this.colors['gutter-selected'];
      } else if (this.active > j) {
        this.context.fillStyle = this.colors['gutter-active'];
      } else {
        this.context.fillStyle = this.colors['gutter'];
      }
      gutterX = Math.max(d, dNext);
      this.context.fillRect(xPos + this.waveWidth, yPos, this.iGutterWidth, gutterX);

      /*
       draw the reflection
       */
      if (this.reflection > 0) {
        reflectionHeight = Math.abs(d) / (1 - this.reflection) * this.reflection;
        if (this.active > i) {
          this.context.fillStyle = this.colors['reflection-active'];
        } else {
          this.context.fillStyle = this.colors['reflection'];
        }
        this.context.fillRect(xPos, yPos, this.waveWidth, reflectionHeight);
      }
      results.push(i++);
      xPos += this.waveWidth + this.iGutterWidth;
      j++;
    }
    return results;
  };

  Waveform.prototype.clear = function() {
    this.context.fillStyle = this.outerColor;
    this.context.clearRect(0, 0, this.width, this.height);
    return this.context.fillRect(0, 0, this.width, this.height);
  };


  /*
   Data related ideas here
   */

  Waveform.prototype.setData = function(data) {
    return this.data = data;
  };

  Waveform.prototype.getData = function() {
    return this.data;
  };

  Waveform.prototype.setDataInterpolated = function(data) {
    return this.setData(this.interpolateArray(data, this.width));
  };

  Waveform.prototype.setDataCropped = function(data) {
    return this.setData(this.expandArray(data, this.width));
  };

  Waveform.prototype.linearInterpolate = function(before, after, atPoint) {
    return before + (after - before) * atPoint;
  };

  Waveform.prototype.expandArray = function(data, limit, defaultValue) {
    var i, j, newData, ref;
    i = void 0;
    j = void 0;
    newData = void 0;
    ref = void 0;
    if (defaultValue === null) {
      defaultValue = 0.0;
    }
    newData = [];
    if (data.length > limit) {
      newData = data.slice(data.length - limit, data.length);
    } else {
      i = j = 0;
      ref = limit - 1;
      while ((0 <= ref ? j <= ref : j >= ref)) {
        newData[i] = data[i] || defaultValue;
        i = (0 <= ref ? ++j : --j);
      }
    }
    return newData;
  };

  Waveform.prototype.interpolateArray = function(data, fitCount) {
    var after, atPoint, before, i, newData, springFactor, tmp;
    after = void 0;
    atPoint = void 0;
    before = void 0;
    i = void 0;
    newData = void 0;
    springFactor = void 0;
    tmp = void 0;
    newData = new Array;
    springFactor = new Number((data.length - 1) / (fitCount - 1));
    newData[0] = data[0];
    i = 1;
    while (i < fitCount - 1) {
      tmp = i * springFactor;
      before = new Number(Math.floor(tmp)).toFixed();
      after = new Number(Math.ceil(tmp)).toFixed();
      atPoint = tmp - before;
      newData[i] = this.linearInterpolate(data[before], data[after], atPoint);
      i++;
    }
    newData[fitCount - 1] = data[data.length - 1];
    return newData;
  };

  Waveform.prototype.putDataIntoWaveBlock = function() {
    var data, fAbsValue, fAverage, fWavePoint, i, iWaveBlock, iWaveCount, j, key, newDataBlocks, sum;
    iWaveBlock = this.waveWidth + this.iGutterWidth;
    data = this.getData();
    newDataBlocks = [];
    iWaveCount = Math.ceil(data.length / iWaveBlock);
    i = 0;
    while (i < iWaveCount) {
      sum = 0;
      j = 0;
      while (j < iWaveBlock) {
        key = (i * iWaveBlock) + j;
        sum += data[key];
        j++;
      }
      fAverage = sum / iWaveBlock;
      fAbsValue = fAverage * this.waveHeight;
      fWavePoint = Math.floor(-Math.abs(fAbsValue));
      newDataBlocks.push(fWavePoint);
      i++;
    }
    return newDataBlocks;
  };

  Waveform.prototype.update = function() {
    if (this.interpolate === false) {
      this.setDataCropped(this.data);
    } else {
      this.setDataInterpolated(this.data);
    }
    this.wavesCollection = this.putDataIntoWaveBlock(this.data);
  };

  Waveform.prototype.createCanvas = function(container, width, height) {
    var canvas;
    canvas = document.createElement("canvas");
    container.appendChild(canvas);
    canvas.width = width;
    canvas.height = height;
    return canvas;
  };


  /*
    Events related
   */

  Waveform.prototype.getMouseClickPosition = function(evt) {
    var canvas, rect, x, y;
    canvas = this.canvas;
    rect = canvas.getBoundingClientRect();
    x = Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
    y = Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
    return [x, y];
  };

  Waveform.prototype.calcPercent = function() {
    return Math.round(this.clickPercent * this.width / (this.waveWidth + this.iGutterWidth));
  };

  Waveform.prototype.fireEvent = function() {
    var data, name;
    name = arguments[0], data = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    this.notify(name, data);
  };

  Waveform.prototype.oldfireEvent = function(name) {
    var args;
    if (!this.events[name]) {
      return;
    }
    args = [].splice.call(arguments, 0);
    args[0] = this;
    this.events[name].e.forEach(function(event) {
      event.apply(null, args);
    });
  };

  Waveform.prototype.bindEventHandlers = function() {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseOver);
    this.canvas.addEventListener('mouseout', this.onMouseOut);
    return this.canvas.addEventListener('mouseup', this.onMouseUp);
  };

  Waveform.prototype.onMouseOut = function(e) {
    this.selected = -1;
    this.redraw();
  };

  Waveform.prototype.onMouseUp = function(e) {
    this.isDragging = false;
  };

  Waveform.prototype.onMouseOver = function(e) {
    var aPos, mousePosTrackTime, waveClicked, x;
    aPos = this.getMouseClickPosition(e);
    x = aPos[0];
    waveClicked = this.getWaveClicked(x);
    mousePosTrackTime = this.getMousePosTrackTime(x);
    this.fireEvent('hover', mousePosTrackTime, waveClicked);
    if (this.isDragging === true) {
      this.selected = -1;
      this.clickPercent = x / this.width;
      this.active = this.calcPercent();
    } else {
      this.selected = waveClicked;
    }
    this.redraw();
  };


  /*
    this is to simulate play
   */

  Waveform.prototype.playProgress = function(perct) {
    var iActive;
    iActive = Math.round((perct / 100) * this.wavesCollection.length);
    this.active = iActive;
    this.redraw();
  };

  Waveform.prototype.calcPercent = function() {
    return Math.round(this.clickPercent * this.width / (this.waveWidth + this.iGutterWidth));
  };

  Waveform.prototype.onMouseDown = function(e) {
    var aPos, x;
    this.isDragging = true;
    aPos = this.getMouseClickPosition(e);
    x = aPos[0];
    this.clickPercent = x / this.width;
    this.fireEvent('click', this.clickPercent * 100);
    this.active = this.calcPercent();
    this.redraw();
  };

  Waveform.prototype.getWaveClicked = function(x) {
    var fReturn, waveClicked, wavesCollection;
    waveClicked = Math.round(x / (this.waveWidth + this.iGutterWidth));
    wavesCollection = this.wavesCollection;
    fReturn = 0;
    if (waveClicked > wavesCollection.length) {
      fReturn = wavesCollection.length;
    } else if (waveClicked < 0) {
      fReturn = 0;
    } else {
      fReturn = waveClicked;
    }
    return fReturn;
  };

  Waveform.prototype.getMousePosTrackTime = function(x) {
    var fReturn, mousePosTrackTime;
    mousePosTrackTime = this.trackLength / this.wavesCollection.length * this.getWaveClicked(x);
    fReturn = 0;
    if (mousePosTrackTime > this.trackLength) {
      fReturn = this.trackLength;
    } else if (mousePosTrackTime < 0) {
      fReturn = 0;
    } else {
      fReturn = mousePosTrackTime;
    }
    return fReturn;
  };

  return Waveform;

})(Observable);