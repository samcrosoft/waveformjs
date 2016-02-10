/**
 * waveformjs - A library to build soundcloud like waveforms
 * @version v1.0.1
 * @link https://github.com/samcrosoft/waveformjs
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * observant - Lightweight event observer for node
 * @version v1.0.0
 * @link https://github.com/samcrosoft/observant
 * @license MIT
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require, exports, module);
  } else {
    root.Observant = factory();
  }
}(this, function(require, exports, module) {

/**
 * Created by Adebola on 08/02/2016.
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Observant = (function () {
    function Observant() {
        _classCallCheck(this, Observant);

        this.observers = {};
    }

    //export default Observant;

    _createClass(Observant, [{
        key: "observe",
        value: function observe(event, observer) {
            if (!this.observers[event]) {
                this.observers[event] = [];
            }
            this.observers[event].push(observer);
            return this;
        }
    }, {
        key: "ignore",
        value: function ignore(event, observer) {
            var index = -1;
            if (1 == arguments.length) {
                delete this.observers[event];
                return this;
            }

            if (this.observers[event]) {
                index = this.observers[event].indexOf(observer);
                if (-1 != index) {
                    this.observers[event][index] = null;
                }
            }

            return this;
        }
    }, {
        key: "notify",
        value: function notify(event, data) {
            var observers = this.observers[event];
            if (!observers) {
                return this;
            }
            var i = 0;
            while (i < observers.length) {
                if (null != observers[i]) {
                    // make the call to the observer here
                    observers[i](data);
                }
                ++i;
            }

            i = 0;
            while (i < observers.length) {
                if (null == observers[i]) {
                    observers.splice(i, 1);
                }
                ++i;
            }
            // clear out the observers at this stage
            if (observers.length < 1) {
                delete this.observers[event];
            }
        }
    }]);

    return Observant;
})();
return Observant;

}));

},{}],2:[function(require,module,exports){
(function (global){
var Observant, Waveform,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

Observant = require('observant');


/*
    requestAnimFrame shim
  copy the one from paul irish
 */

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
    window.setTimeout(callback, 1000 / 30);
  };
})();

Waveform = (function(superClass) {
  extend(Waveform, superClass);

  Waveform.DEFAULT_MAX_OPACITY = 1;

  Waveform.DEFAULT_MIN_OPACITY = 0.2;


  /*
  create color constants
   */

  Waveform.WAVE_FOCUS = 'wave-focus';

  Waveform.WAVE = 'wave';

  Waveform.WAVE_ACTIVE = 'wave-active';

  Waveform.WAVE_SELECTED = 'wave-selected';

  Waveform.GUTTER = 'gutter';

  Waveform.GUTTER_ACTIVE = 'gutter-active';

  Waveform.GUTTER_SELECTED = 'gutter-selected';

  Waveform.REFLECTION = 'reflection';

  Waveform.REFLECTION_ACTIVE = 'reflection-active';


  /*
  create events constants
   */

  Waveform.EVENT_READY = "ready";

  Waveform.EVENT_CLICK = "click";

  Waveform.EVENT_HOVER = "hover";

  Waveform.EVENT_RESIZED = "hover";

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
    this.interpolate = options.interpolate || true;
    this.bindResize = options.bindResize || false;
    this.fadeOpacity = options.fadeOpacity || Waveform.DEFAULT_MAX_OPACITY;
    if (isNaN(this.fadeOpacity)) {
      throw new Error('Fade Opacity Can Only Be A Number');
    } else if (this.fadeOpacity < Waveform.DEFAULT_MIN_OPACITY || this.fadeOpacity > Waveform.DEFAULT_MAX_OPACITY) {
      throw new Error("Fade Opacity Can Only Be A Number Between " + Waveform.DEFAULT_MIN_OPACITY + " and " + Waveform.DEFAULT_MAX_OPACITY);
    }

    /*
      Cater for data interpolation right here
     */
    if (options.interpolate === false) {
      this.interpolate = false;
    }
    if (!this.canvas) {
      if (this.container) {
        this.canvas = this.createCanvas(this.container, options.width || this.container.clientWidth, options.height || this.container.clientHeight);
      } else {
        throw new Error('Either canvas or container option must be passed');
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
    this.hasStartedPlaying = null;
    this.isFocus = false;
    this.initialize();
    return;
  }

  Waveform.prototype.initialize = function() {
    this.updateHeight();
    this.setColors();
    this.bindEventHandlers();
    this.cache();
    this.redraw();
    if (this.bindResize === true) {
      this.bindContainerResize();
    }
    this.fireEvent(Waveform.EVENT_READY);
  };


  /*
    this will make sure the container is bound to resize event
   */

  Waveform.prototype.bindContainerResize = function() {
    window.addEventListener("resize", (function(_this) {
      return function() {
        var iContWidth;
        iContWidth = _this.container.clientWidth;
        _this.update({
          width: iContWidth
        });
        _this.redraw();
        return _this.notify(Waveform.EVENT_RESIZED, iContWidth);
      };
    })(this));
  };


  /*
    this method will set the colors to the main colors
   */

  Waveform.prototype.setColors = function() {
    this.setColor(Waveform.WAVE_FOCUS, '#333333');
    this.setGradient(Waveform.WAVE, ['#666666', 0, '#868686', 1]);
    this.setGradient(Waveform.WAVE_ACTIVE, ['#FF3300', 0, '#FF5100', 1]);
    this.setGradient(Waveform.WAVE_SELECTED, ['#993016', 0, '#973C15', 1]);
    this.setGradient(Waveform.GUTTER, ['#6B6B6B', 0, '#c9c9c9', 1]);
    this.setGradient(Waveform.GUTTER_ACTIVE, ['#FF3704', 0, '#FF8F63', 1]);
    this.setGradient(Waveform.GUTTER_SELECTED, ['#9A371E', 0, '#CE9E8A', 1]);
    this.setColor(Waveform.REFLECTION, '#999999');
    this.setColor(Waveform.REFLECTION_ACTIVE, '#FFC0A0');
  };

  Waveform.prototype.setColor = function(name, color) {
    return this.colors[name] = color;
  };

  Waveform.prototype.setGradient = function(name, colors) {
    var gradient, i;
    gradient = this.context.createLinearGradient(0, this.waveOffset, 0, 0);
    i = 0;
    while (i < colors.length) {
      gradient.addColorStop(colors[i + 1], colors[i]);
      i += 2;
    }
    this.colors[name] = gradient;
  };


  /*
   This will draw the waveform
   */

  Waveform.prototype.redraw = function() {
    requestAnimationFrame(this.render);
  };

  Waveform.prototype.render = function() {
    var d, dNext, gutterX, i, j, len, ref, reflectionHeight, results, t, xPos, yPos;
    i = 0;
    ref = this.wavesCollection;
    t = this.width / this.data.length;
    xPos = 0;
    yPos = this.waveOffset;
    this.clear();
    j = 0;
    len = ref.length;
    results = [];
    while (j < len) {
      d = ref[j];
      dNext = ref[j + 1];

      /*
      Draw the wave here
       */
      if (this.selected > 0 && (this.selected <= j && j < this.active) || (this.selected > j && j >= this.active)) {
        this.context.fillStyle = this.colors[Waveform.WAVE_SELECTED];
      } else if (this.active > j) {
        this.context.fillStyle = this.colors[Waveform.WAVE_ACTIVE];
      } else {
        this.context.fillStyle = this.colors[Waveform.WAVE_FOCUS];
      }
      this.context.fillRect(xPos, yPos, this.waveWidth, d);

      /*
      draw the gutter
       */
      if (this.selected > 0 && (this.selected <= j && j < this.active) || (this.selected > j && j >= this.active)) {
        this.context.fillStyle = this.colors[Waveform.GUTTER_SELECTED];
      } else if (this.active > j) {
        this.context.fillStyle = this.colors[Waveform.GUTTER_ACTIVE];
      } else {
        this.context.fillStyle = this.colors[Waveform.GUTTER];
      }
      gutterX = Math.max(d, dNext);
      this.context.fillRect(xPos + this.waveWidth, yPos, this.iGutterWidth, gutterX);

      /*
       draw the reflection
       */
      if (this.reflection > 0) {
        reflectionHeight = Math.abs(d) / (1 - this.reflection) * this.reflection;
        if (this.active > i) {
          this.context.fillStyle = this.colors[Waveform.REFLECTION_ACTIVE];
        } else {
          this.context.fillStyle = this.colors[Waveform.REFLECTION];
        }
        this.context.fillRect(xPos, yPos, this.waveWidth, reflectionHeight);
      }
      xPos += this.waveWidth + this.iGutterWidth;
      results.push(j++);
    }
    return results;
  };

  Waveform.prototype.clear = function() {
    this.context.fillStyle = this.outerColor;
    this.context.clearRect(0, 0, this.width, this.height);
    return this.context.fillRect(0, 0, this.width, this.height);
  };


  /*
   Data related codes
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
    newData = [];
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

  Waveform.prototype.cache = function() {
    if (this.interpolate === false) {
      this.setDataCropped(this.data);
    } else {
      this.setDataInterpolated(this.data);
    }
    this.wavesCollection = this.putDataIntoWaveBlock(this.data);
  };


  /*
    Data update details here
   */

  Waveform.prototype.update = function(options) {
    if (options) {
      if (options.gutterWidth) {
        this.gutterWidth = options.gutterWidth;
      }
      if (options.waveWidth) {
        this.waveWidth = options.waveWidth;
      }
      if (options.width) {
        this.width = options.width;
        this.canvas.width = this.width;
      }
      if (options.height) {
        this.height = options.height;
        this.canvas.height = this.height;
      }
      if (options.reflection === 0 || options.reflection) {
        this.reflection = options.reflection;
      }
      if (options.interpolate) {
        this.interpolate = this.options.interpolate;
      }

      /*
        Re-calculate the wave block formations once one of the following is altered
       */
      if (options.gutterWidth || options.waveWidth || options.width || options.height || options.reflection || options.interpolate || options.reflection === 0) {
        this.cache();
      }
      if (options.height || options.reflection || options.reflection === 0) {
        this.updateHeight();
      }
    }
    this.redraw();
  };

  Waveform.prototype.updateHeight = function() {
    this.waveOffset = Math.round(this.height - (this.height * this.reflection));
    this.reflectionHeight = Math.round(this.height - this.waveOffset);
    this.waveHeight = this.height - this.reflectionHeight;
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

  Waveform.prototype.bindEventHandlers = function() {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseOver);
    this.canvas.addEventListener('mouseout', this.onMouseOut);
    return this.canvas.addEventListener('mouseup', this.onMouseUp);
  };

  Waveform.prototype.onMouseOut = function(e) {
    this.selected = -1;
    this.redrawWithAlpha(1);
  };

  Waveform.prototype.onMouseUp = function(e) {
    this.isDragging = false;
  };

  Waveform.prototype.isPausedAfterPlaying = function() {
    return this.hasStartedPlaying === true && this.isPaused() === true;
  };

  Waveform.prototype.redrawWithAlpha = function(iAlpha) {
    if (iAlpha == null) {
      iAlpha = Waveform.DEFAULT_MAX_OPACITY;
    }
    if (iAlpha !== this.fadeOpacity) {
      this.context.globalAlpha = iAlpha;
      return this.redraw();
    }
  };

  Waveform.prototype.onMouseOver = function(e) {
    var aPos, mousePosTrackTime, waveClicked, x;
    if (this.isPausedAfterPlaying()) {
      this.redrawWithAlpha(this.fadeOpacity);
      return true;
    }
    aPos = this.getMouseClickPosition(e);
    x = aPos[0];
    waveClicked = this.getWaveClicked(x);
    mousePosTrackTime = this.getMousePosTrackTime(x);
    this.fireEvent(Waveform.EVENT_HOVER, mousePosTrackTime, waveClicked);
    if (this.isDragging === true) {
      this.selected = -1;
      this.clickPercent = x / this.width;
      this.active = this.calcPercent();
    } else {
      this.selected = waveClicked;
    }
    this.context.globalAlpha = 1;
    this.redraw();
  };

  Waveform.prototype.onMouseDown = function(e) {
    var aPos, x;
    this.isDragging = true;
    aPos = this.getMouseClickPosition(e);
    x = aPos[0];
    this.clickPercent = x / this.width;
    this.fireEvent(Waveform.EVENT_CLICK, this.clickPercent * 100);
    this.active = this.calcPercent();
    this.redraw();
  };


  /*
    this is to simulate play
   */

  Waveform.prototype.setPlaying = function(val) {
    if (val == null) {
      val = true;
    }
    this.isPlaying = val;
  };

  Waveform.prototype.setPaused = function() {
    this.setPlaying(false);
  };

  Waveform.prototype.isPaused = function() {
    return this.active > 0 && this.isPlaying === false;
  };

  Waveform.prototype.play = function(perct) {
    this.playProgress(perct);
  };

  Waveform.prototype.pause = function() {
    this.setPaused();
    console.log("is paused is ", this.isPaused());
  };

  Waveform.prototype.playProgress = function(perct) {
    var iActive;
    if (this.hasStartedPlaying === null) {
      this.hasStartedPlaying = true;
    }
    if (this.isPlaying === false) {
      this.setPlaying(true);
    }
    iActive = Math.round((perct / 100) * this.wavesCollection.length);
    this.active = iActive;
    this.redraw();
  };

  Waveform.prototype.calcPercent = function() {
    return Math.round(this.clickPercent * this.width / (this.waveWidth + this.iGutterWidth));
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

})(Observant);

module.exports = Waveform;

global.window.Waveform = Waveform;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"observant":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvb2JzZXJ2YW50L2Rpc3Qvb2JzZXJ2YW50LmpzIiwic3JjXFxzcmNcXHdhdmVmb3JtLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pHQSxJQUFBLG1CQUFBO0VBQUE7Ozs7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSOzs7QUFDWjs7Ozs7QUFJQSxNQUFNLENBQUMsZ0JBQVAsR0FBNkIsQ0FBQSxTQUFBO1NBQzNCLE1BQU0sQ0FBQyxxQkFBUCxJQUFnQyxNQUFNLENBQUMsMkJBQXZDLElBQXNFLE1BQU0sQ0FBQyx3QkFBN0UsSUFBeUcsTUFBTSxDQUFDLHNCQUFoSCxJQUEwSSxNQUFNLENBQUMsdUJBQWpKLElBQTRLLFNBQUMsUUFBRDtJQUMxSyxNQUFN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QixDQUFDLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLFlBQWYsQ0FBcEM7RUFEVzs7cUJBSWIsY0FBQSxHQUFnQixTQUFDLENBQUQ7QUFDZCxRQUFBO0lBQUEsV0FBQSxHQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQSxHQUFJLENBQUMsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsWUFBZixDQUFmO0lBQ2QsZUFBQSxHQUFrQixJQUFDLENBQUE7SUFDbkIsT0FBQSxHQUFVO0lBQ1YsSUFBRyxXQUFBLEdBQWMsZUFBZSxDQUFDLE1BQWpDO01BQ0UsT0FBQSxHQUFVLGVBQWUsQ0FBQyxPQUQ1QjtLQUFBLE1BRUssSUFBRyxXQUFBLEdBQWMsQ0FBakI7TUFDSCxPQUFBLEdBQVUsRUFEUDtLQUFBLE1BQUE7TUFHSCxPQUFBLEdBQVUsWUFIUDs7V0FLTDtFQVhjOztxQkFhaEIsb0JBQUEsR0FBc0IsU0FBQyxDQUFEO0FBQ3BCLFFBQUE7SUFBQSxpQkFBQSxHQUFvQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxlQUFlLENBQUMsTUFBaEMsR0FBeUMsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBaEI7SUFDN0QsT0FBQSxHQUFVO0lBQ1YsSUFBRyxpQkFBQSxHQUFvQixJQUFDLENBQUEsV0FBeEI7TUFDRSxPQUFBLEdBQVUsSUFBQyxDQUFBLFlBRGI7S0FBQSxNQUVLLElBQUcsaUJBQUEsR0FBb0IsQ0FBdkI7TUFDSCxPQUFBLEdBQVUsRUFEUDtLQUFBLE1BQUE7TUFHSCxPQUFBLEdBQVUsa0JBSFA7O1dBSUw7RUFUb0I7Ozs7R0E5aUJEOztBQTJqQnZCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOztBQUVqQixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQWQsR0FBeUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBvYnNlcnZhbnQgLSBMaWdodHdlaWdodCBldmVudCBvYnNlcnZlciBmb3Igbm9kZVxuICogQHZlcnNpb24gdjEuMC4wXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vc2FtY3Jvc29mdC9vYnNlcnZhbnRcbiAqIEBsaWNlbnNlIE1JVFxuICovXG5cbihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5PYnNlcnZhbnQgPSBmYWN0b3J5KCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24ocmVxdWlyZSwgZXhwb3J0cywgbW9kdWxlKSB7XG5cbi8qKlxyXG4gKiBDcmVhdGVkIGJ5IEFkZWJvbGEgb24gMDgvMDIvMjAxNi5cclxuICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgT2JzZXJ2YW50ID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBPYnNlcnZhbnQoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBPYnNlcnZhbnQpO1xuXG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzID0ge307XG4gICAgfVxuXG4gICAgLy9leHBvcnQgZGVmYXVsdCBPYnNlcnZhbnQ7XG5cbiAgICBfY3JlYXRlQ2xhc3MoT2JzZXJ2YW50LCBbe1xuICAgICAgICBrZXk6IFwib2JzZXJ2ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb2JzZXJ2ZShldmVudCwgb2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vYnNlcnZlcnNbZXZlbnRdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnNbZXZlbnRdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyc1tldmVudF0ucHVzaChvYnNlcnZlcik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImlnbm9yZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaWdub3JlKGV2ZW50LCBvYnNlcnZlcikge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gLTE7XG4gICAgICAgICAgICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMub2JzZXJ2ZXJzW2V2ZW50XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXJzW2V2ZW50XSkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gdGhpcy5vYnNlcnZlcnNbZXZlbnRdLmluZGV4T2Yob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgICAgIGlmICgtMSAhPSBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9ic2VydmVyc1tldmVudF1baW5kZXhdID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwibm90aWZ5XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBub3RpZnkoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcnMgPSB0aGlzLm9ic2VydmVyc1tldmVudF07XG4gICAgICAgICAgICBpZiAoIW9ic2VydmVycykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGkgPCBvYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgIT0gb2JzZXJ2ZXJzW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1ha2UgdGhlIGNhbGwgdG8gdGhlIG9ic2VydmVyIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXJzW2ldKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICArK2k7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGkgPCBvYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gb2JzZXJ2ZXJzW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICsraTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNsZWFyIG91dCB0aGUgb2JzZXJ2ZXJzIGF0IHRoaXMgc3RhZ2VcbiAgICAgICAgICAgIGlmIChvYnNlcnZlcnMubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm9ic2VydmVyc1tldmVudF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gT2JzZXJ2YW50O1xufSkoKTtcbnJldHVybiBPYnNlcnZhbnQ7XG5cbn0pKTtcbiIsIk9ic2VydmFudCA9IHJlcXVpcmUoJ29ic2VydmFudCcpXHJcbiMjI1xyXG4gICAgcmVxdWVzdEFuaW1GcmFtZSBzaGltXHJcbiAgY29weSB0aGUgb25lIGZyb20gcGF1bCBpcmlzaFxyXG4jIyNcclxud2luZG93LnJlcXVlc3RBbmltRnJhbWUgPSBkbyAtPlxyXG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgb3Igd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSBvciB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIG9yIHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIG9yIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSBvciAoY2FsbGJhY2spIC0+XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCBjYWxsYmFjaywgMTAwMCAvIDMwXHJcbiAgICByZXR1cm5cclxuXHJcbiMgICAgc3RhcnQgb2Ygd2F2ZWZvcm0gY2xhc3NcclxuY2xhc3MgV2F2ZWZvcm0gZXh0ZW5kcyBPYnNlcnZhbnRcclxuXHJcbiAgIyBvcGFjaXR5IHNldHRpbmdzXHJcbiAgV2F2ZWZvcm0uREVGQVVMVF9NQVhfT1BBQ0lUWSA9IDFcclxuICBXYXZlZm9ybS5ERUZBVUxUX01JTl9PUEFDSVRZID0gMC4yXHJcblxyXG4gICMjI1xyXG4gIGNyZWF0ZSBjb2xvciBjb25zdGFudHNcclxuICAjIyNcclxuICBXYXZlZm9ybS5XQVZFX0ZPQ1VTID0gJ3dhdmUtZm9jdXMnXHJcbiAgV2F2ZWZvcm0uV0FWRSA9ICd3YXZlJ1xyXG4gIFdhdmVmb3JtLldBVkVfQUNUSVZFID0gJ3dhdmUtYWN0aXZlJ1xyXG4gIFdhdmVmb3JtLldBVkVfU0VMRUNURUQgPSAnd2F2ZS1zZWxlY3RlZCdcclxuICBXYXZlZm9ybS5HVVRURVIgPSAnZ3V0dGVyJ1xyXG4gIFdhdmVmb3JtLkdVVFRFUl9BQ1RJVkUgPSAnZ3V0dGVyLWFjdGl2ZSdcclxuICBXYXZlZm9ybS5HVVRURVJfU0VMRUNURUQgPSAnZ3V0dGVyLXNlbGVjdGVkJ1xyXG4gIFdhdmVmb3JtLlJFRkxFQ1RJT04gPSAncmVmbGVjdGlvbidcclxuICBXYXZlZm9ybS5SRUZMRUNUSU9OX0FDVElWRSA9ICdyZWZsZWN0aW9uLWFjdGl2ZSdcclxuXHJcbiAgIyMjXHJcbiAgY3JlYXRlIGV2ZW50cyBjb25zdGFudHNcclxuICAjIyNcclxuICBXYXZlZm9ybS5FVkVOVF9SRUFEWSA9IFwicmVhZHlcIlxyXG4gIFdhdmVmb3JtLkVWRU5UX0NMSUNLID0gXCJjbGlja1wiXHJcbiAgV2F2ZWZvcm0uRVZFTlRfSE9WRVIgPSBcImhvdmVyXCJcclxuICBXYXZlZm9ybS5FVkVOVF9SRVNJWkVEID0gXCJob3ZlclwiXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cclxuIyBpbml0aWF0ZSBvYnNlcnZhYmxlXHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgQGNvbnRhaW5lciA9IG9wdGlvbnMuY29udGFpbmVyXHJcbiAgICBAY2FudmFzID0gb3B0aW9ucy5jYW52YXNcclxuXHJcbiAgICBAZGF0YSA9IG9wdGlvbnMuZGF0YSBvciBbXVxyXG4gICAgQHdhdmVzQ29sbGVjdGlvbiA9IEBkYXRhXHJcblxyXG4gICAgQG91dGVyQ29sb3IgPSBvcHRpb25zLm91dGVyQ29sb3Igb3IgJ3RyYW5zcGFyZW50J1xyXG4gICAgQHJlZmxlY3Rpb24gPSBvcHRpb25zLnJlZmxlY3Rpb24gb3IgMFxyXG4gICAgQGludGVycG9sYXRlID0gb3B0aW9ucy5pbnRlcnBvbGF0ZSBvciB0cnVlXHJcbiAgICBAYmluZFJlc2l6ZSA9IG9wdGlvbnMuYmluZFJlc2l6ZSBvciBmYWxzZVxyXG4gICAgQGZhZGVPcGFjaXR5ID0gb3B0aW9ucy5mYWRlT3BhY2l0eSBvciBXYXZlZm9ybS5ERUZBVUxUX01BWF9PUEFDSVRZXHJcblxyXG4gICAgaWYoaXNOYU4oQGZhZGVPcGFjaXR5KSlcclxuICAgICAgdGhyb3cgbmV3IEVycm9yICdGYWRlIE9wYWNpdHkgQ2FuIE9ubHkgQmUgQSBOdW1iZXInXHJcbiAgICBlbHNlIGlmIEBmYWRlT3BhY2l0eSA8IFdhdmVmb3JtLkRFRkFVTFRfTUlOX09QQUNJVFkgb3IgQGZhZGVPcGFjaXR5ID4gV2F2ZWZvcm0uREVGQVVMVF9NQVhfT1BBQ0lUWVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJGYWRlIE9wYWNpdHkgQ2FuIE9ubHkgQmUgQSBOdW1iZXIgQmV0d2VlbiAje1dhdmVmb3JtLkRFRkFVTFRfTUlOX09QQUNJVFl9IGFuZCAje1dhdmVmb3JtLkRFRkFVTFRfTUFYX09QQUNJVFl9XCJcclxuXHJcbiAgICAjIyNcclxuICAgICAgQ2F0ZXIgZm9yIGRhdGEgaW50ZXJwb2xhdGlvbiByaWdodCBoZXJlXHJcbiAgICAjIyNcclxuICAgIGlmIG9wdGlvbnMuaW50ZXJwb2xhdGUgPT0gZmFsc2VcclxuICAgICAgQGludGVycG9sYXRlID0gZmFsc2VcclxuICAgIGlmIG5vdCBAY2FudmFzXHJcbiAgICAgIGlmIEBjb250YWluZXJcclxuICAgICAgICBAY2FudmFzID0gQGNyZWF0ZUNhbnZhcyhAY29udGFpbmVyLCBvcHRpb25zLndpZHRoIG9yIEBjb250YWluZXIuY2xpZW50V2lkdGgsXHJcbiAgICAgICAgICBvcHRpb25zLmhlaWdodCBvciBAY29udGFpbmVyLmNsaWVudEhlaWdodClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciAnRWl0aGVyIGNhbnZhcyBvciBjb250YWluZXIgb3B0aW9uIG11c3QgYmUgcGFzc2VkJ1xyXG5cclxuICAgICMgYWRkIHRoaXMgZm9yIHJlYWwgaW4gcHJvZHVjdGlvbiB0byBzdXBwb3J0IElFXHJcbiAgICAjIEBwYXRjaENhbnZhc0ZvcklFIEBjYW52YXNcclxuXHJcbiAgICBAY29udGV4dCA9IEBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgQHdpZHRoID0gcGFyc2VJbnQoQGNvbnRleHQuY2FudmFzLndpZHRoLCAxMClcclxuICAgIEBoZWlnaHQgPSBwYXJzZUludChAY29udGV4dC5jYW52YXMuaGVpZ2h0LCAxMClcclxuXHJcblxyXG4gICAgI2N1c3RvbSBUYWxrXHJcbiAgICBAd2F2ZVdpZHRoID0gMlxyXG4gICAgQGlHdXR0ZXJXaWR0aCA9IDFcclxuICAgIEBjb2xvcnMgPSB7fVxyXG4gICAgIyBob2xkcyBldmVudHNcclxuICAgIEBldmVudHMgPSB7fVxyXG5cclxuICAgICNhY3RpdmUgPSBoaWdobGlnaHRlZCBzZWN0aW9uIG9mIHRyYWNrXHJcbiAgICBAYWN0aXZlID0gLTFcclxuXHJcbiAgICAjc2xlY3RlZCA9IGRpbW1lciBoaWdobGlnaHRlZCBzZWxlY3Rpb25zXHJcbiAgICBAc2VsZWN0ZWQgPSAtMVxyXG5cclxuICAgICNtb3VzZSBkcmFnZ2luZ1xyXG4gICAgQGlzRHJhZ2dpbmcgPSBmYWxzZVxyXG5cclxuICAgICNpcyBwbGF5aW5nXHJcbiAgICBAaXNQbGF5aW5nID0gZmFsc2VcclxuICAgIEBoYXNTdGFydGVkUGxheWluZyA9IG51bGxcclxuXHJcbiAgICAjaXMgaW4gZm9jdXNcclxuICAgIEBpc0ZvY3VzID0gZmFsc2VcclxuXHJcbiAgICAjIGtpY2stc3RhcnQgdGhlIHByb2Nlc3NcclxuICAgIEBpbml0aWFsaXplKClcclxuXHJcbiAgICByZXR1cm5cclxuXHJcbiMgaW5pdGlhbGl6ZSB0aGUgd2hvbGUgcHJvY2Vzc1xyXG4gIGluaXRpYWxpemU6ICgpIC0+XHJcbiMgdXBkYXRlIGhlaWdodFxyXG4gICAgQHVwZGF0ZUhlaWdodCgpXHJcblxyXG4gICAgIyBzZXQgdGhlIGNvbG9yc1xyXG4gICAgQHNldENvbG9ycygpXHJcblxyXG5cclxuICAgICMgYmluZCB0aGUgZXZlbnQgaGFuZGxlclxyXG4gICAgQGJpbmRFdmVudEhhbmRsZXJzKClcclxuXHJcbiAgICAjIENhY2hlIHRoZSB3YXZlZm9ybSBkYXRhXHJcbiAgICBAY2FjaGUoKVxyXG5cclxuICAgICMgZHJhdyB0aGUgd2F2ZWZvcm1cclxuICAgIEByZWRyYXcoKVxyXG5cclxuICAgICMgYmluZCBldmVudCBmb3IgY29udGFpbmVyIHJlZHJhd1xyXG4gICAgaWYgQGJpbmRSZXNpemUgaXMgb24gdGhlbiBAYmluZENvbnRhaW5lclJlc2l6ZSgpXHJcblxyXG4gICAgQGZpcmVFdmVudChXYXZlZm9ybS5FVkVOVF9SRUFEWSlcclxuXHJcbiAgICByZXR1cm5cclxuXHJcblxyXG5cclxuICAjIyNcclxuICAgIHRoaXMgd2lsbCBtYWtlIHN1cmUgdGhlIGNvbnRhaW5lciBpcyBib3VuZCB0byByZXNpemUgZXZlbnRcclxuICAjIyNcclxuICBiaW5kQ29udGFpbmVyUmVzaXplOiAoKSAtPlxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCk9PlxyXG4gICAgICBpQ29udFdpZHRoID0gQGNvbnRhaW5lci5jbGllbnRXaWR0aFxyXG4gICAgICBAdXBkYXRlKHdpZHRoOiBpQ29udFdpZHRoKVxyXG4gICAgICBAcmVkcmF3KClcclxuICAgICAgQG5vdGlmeShXYXZlZm9ybS5FVkVOVF9SRVNJWkVELCBpQ29udFdpZHRoKVxyXG4gICAgKVxyXG4gICAgcmV0dXJuXHJcblxyXG5cclxuICAjIyNcclxuICAgIHRoaXMgbWV0aG9kIHdpbGwgc2V0IHRoZSBjb2xvcnMgdG8gdGhlIG1haW4gY29sb3JzXHJcbiAgIyMjXHJcbiAgc2V0Q29sb3JzOiAoKSAtPlxyXG4gICAgQHNldENvbG9yKFdhdmVmb3JtLldBVkVfRk9DVVMsICcjMzMzMzMzJylcclxuICAgIEBzZXRHcmFkaWVudChXYXZlZm9ybS5XQVZFLCBbJyM2NjY2NjYnLCAwLCAnIzg2ODY4NicsIDFdKVxyXG4gICAgQHNldEdyYWRpZW50KFdhdmVmb3JtLldBVkVfQUNUSVZFLCBbJyNGRjMzMDAnLCAwLCAnI0ZGNTEwMCcsIDFdKVxyXG4gICAgQHNldEdyYWRpZW50KFdhdmVmb3JtLldBVkVfU0VMRUNURUQsIFsnIzk5MzAxNicsIDAsICcjOTczQzE1JywgMV0pXHJcbiAgICBAc2V0R3JhZGllbnQoV2F2ZWZvcm0uR1VUVEVSLCBbJyM2QjZCNkInLCAwLCAnI2M5YzljOScsIDFdKVxyXG4gICAgQHNldEdyYWRpZW50KFdhdmVmb3JtLkdVVFRFUl9BQ1RJVkUsIFsnI0ZGMzcwNCcsIDAsICcjRkY4RjYzJywgMV0pXHJcbiAgICBAc2V0R3JhZGllbnQoV2F2ZWZvcm0uR1VUVEVSX1NFTEVDVEVELCBbJyM5QTM3MUUnLCAwLCAnI0NFOUU4QScsIDFdKVxyXG4gICAgQHNldENvbG9yKFdhdmVmb3JtLlJFRkxFQ1RJT04sICcjOTk5OTk5JylcclxuICAgIEBzZXRDb2xvcihXYXZlZm9ybS5SRUZMRUNUSU9OX0FDVElWRSwgJyNGRkMwQTAnKVxyXG5cclxuICAgIHJldHVyblxyXG5cclxuICBzZXRDb2xvcjogKG5hbWUsIGNvbG9yKSAtPlxyXG4gICAgQGNvbG9yc1tuYW1lXSA9IGNvbG9yXHJcblxyXG4gIHNldEdyYWRpZW50OiAobmFtZSwgY29sb3JzKSAtPlxyXG4gICAgZ3JhZGllbnQgPSBAY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCBAd2F2ZU9mZnNldCwgMCwgMClcclxuICAgIGkgPSAwXHJcblxyXG4gICAgd2hpbGUgaSA8IGNvbG9ycy5sZW5ndGhcclxuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wIGNvbG9yc1tpICsgMV0sIGNvbG9yc1tpXVxyXG4gICAgICBpICs9IDJcclxuICAgIEBjb2xvcnNbbmFtZV0gPSBncmFkaWVudFxyXG4gICAgcmV0dXJuXHJcblxyXG5cclxuXHJcblxyXG5cclxuICAjIyNcclxuICAgVGhpcyB3aWxsIGRyYXcgdGhlIHdhdmVmb3JtXHJcbiAgIyMjXHJcbiAgcmVkcmF3OiAoKSAtPlxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIChAcmVuZGVyKVxyXG4gICAgcmV0dXJuXHJcblxyXG5cclxuIyB0aGlzIHdpbGwgZHJhdyB0aGUgd2F2ZWZvcm0gcmVhbGx5XHJcbiAgcmVuZGVyOiAoKSA9PlxyXG4gICAgaSA9IDBcclxuICAgIHJlZiA9IEB3YXZlc0NvbGxlY3Rpb25cclxuXHJcblxyXG4gICAgdCA9IEB3aWR0aCAvIEBkYXRhLmxlbmd0aFxyXG5cclxuICAgICMgdGhpcyBzaG91bGQgYmUgcmVjb25zaWRlcmVkXHJcbiAgICB4UG9zID0gMCAjIHN0YXJ0IGZyb20gZmFydGhlc3QgbGVmdFxyXG4gICAgeVBvcyA9IEB3YXZlT2Zmc2V0XHJcblxyXG5cclxuICAgICMgY2xlYXIgdGhlIGVudGlyZSBjYW52YXMgZm9yIHJlZHJhd1xyXG4gICAgQGNsZWFyKClcclxuXHJcbiAgICBqID0gMFxyXG4gICAgbGVuID0gcmVmLmxlbmd0aFxyXG4gICAgd2hpbGUgaiA8IGxlblxyXG4gICAgICBkID0gcmVmW2pdXHJcbiAgICAgIGROZXh0ID0gcmVmW2ogKyAxXVxyXG5cclxuICAgICAgIyMjXHJcbiAgICAgIERyYXcgdGhlIHdhdmUgaGVyZVxyXG4gICAgICAjIyNcclxuICAgICAgaWYgQHNlbGVjdGVkID4gMCBhbmQgKEBzZWxlY3RlZCA8PSBqIGFuZCBqIDwgQGFjdGl2ZSkgb3IgKEBzZWxlY3RlZCA+IGogYW5kIGogPj0gQGFjdGl2ZSlcclxuICAgICAgICBAY29udGV4dC5maWxsU3R5bGUgPSBAY29sb3JzW1dhdmVmb3JtLldBVkVfU0VMRUNURURdXHJcbiAgICAgIGVsc2UgaWYgQGFjdGl2ZSA+IGpcclxuICAgICAgICBAY29udGV4dC5maWxsU3R5bGUgPSBAY29sb3JzW1dhdmVmb3JtLldBVkVfQUNUSVZFXVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgQGNvbnRleHQuZmlsbFN0eWxlID0gQGNvbG9yc1tXYXZlZm9ybS5XQVZFX0ZPQ1VTXVxyXG4gICAgICBAY29udGV4dC5maWxsUmVjdCB4UG9zLCB5UG9zLCBAd2F2ZVdpZHRoLCBkXHJcblxyXG5cclxuICAgICAgIyMjXHJcbiAgICAgIGRyYXcgdGhlIGd1dHRlclxyXG4gICAgICAjIyNcclxuICAgICAgIyBpZiBpcyBob3ZlcmVkXHJcbiAgICAgIGlmIEBzZWxlY3RlZCA+IDAgYW5kIChAc2VsZWN0ZWQgPD0gaiBhbmQgaiA8IEBhY3RpdmUpIG9yIChAc2VsZWN0ZWQgPiBqIGFuZCBqID49IEBhY3RpdmUpXHJcbiAgICAgICAgQGNvbnRleHQuZmlsbFN0eWxlID0gQGNvbG9yc1tXYXZlZm9ybS5HVVRURVJfU0VMRUNURURdXHJcbiAgICAgIGVsc2UgaWYgQGFjdGl2ZSA+IGpcclxuICAgICAgICBAY29udGV4dC5maWxsU3R5bGUgPSBAY29sb3JzW1dhdmVmb3JtLkdVVFRFUl9BQ1RJVkVdXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBAY29udGV4dC5maWxsU3R5bGUgPSBAY29sb3JzW1dhdmVmb3JtLkdVVFRFUl1cclxuICAgICAgIyBzbWFsbGVzdCB3YXZlIGJldHdlZW4gYnV0dGVyIGlzIGd1dHRlcnMgaGVpZ2h0XHJcbiAgICAgICMgbm90ZTogTWF0aC5tYXggYmVjYXVzZSB3YXZlIHZhbHVlcyBhcmUgbmVnYXRpdmVcclxuICAgICAgZ3V0dGVyWCA9IE1hdGgubWF4IGQsIGROZXh0XHJcbiAgICAgIEBjb250ZXh0LmZpbGxSZWN0KHhQb3MgKyBAd2F2ZVdpZHRoLCB5UG9zLCBAaUd1dHRlcldpZHRoLCBndXR0ZXJYKVxyXG5cclxuXHJcbiAgICAgICMjI1xyXG4gICAgICAgZHJhdyB0aGUgcmVmbGVjdGlvblxyXG4gICAgICAjIyNcclxuICAgICAgIyByZWZsZWN0aW9uIHdhdmVcclxuICAgICAgaWYgQHJlZmxlY3Rpb24gPiAwXHJcbiAgICAgICAgcmVmbGVjdGlvbkhlaWdodCA9IE1hdGguYWJzKGQpIC8gKDEgLSAoQHJlZmxlY3Rpb24pKSAqIEByZWZsZWN0aW9uXHJcbiAgICAgICAgaWYgQGFjdGl2ZSA+IGlcclxuICAgICAgICAgIEBjb250ZXh0LmZpbGxTdHlsZSA9IEBjb2xvcnNbV2F2ZWZvcm0uUkVGTEVDVElPTl9BQ1RJVkVdXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgQGNvbnRleHQuZmlsbFN0eWxlID0gQGNvbG9yc1tXYXZlZm9ybS5SRUZMRUNUSU9OXVxyXG5cclxuICAgICAgICAjIGRyYXcgcmVmbGVjdGlvblxyXG4gICAgICAgIEBjb250ZXh0LmZpbGxSZWN0IHhQb3MsIHlQb3MsIEB3YXZlV2lkdGgsIHJlZmxlY3Rpb25IZWlnaHRcclxuXHJcbiAgICAgICNpbmNyZW1lbnQgdGhlIHgtYXhpcyBwb3NpdGlvblxyXG4gICAgICB4UG9zICs9IEB3YXZlV2lkdGggKyBAaUd1dHRlcldpZHRoXHJcblxyXG4gICAgICBqKytcclxuXHJcblxyXG4gIGNsZWFyOiAoKSAtPlxyXG4gICAgQGNvbnRleHQuZmlsbFN0eWxlID0gQG91dGVyQ29sb3JcclxuICAgIEBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBAd2lkdGgsIEBoZWlnaHQpXHJcbiAgICBAY29udGV4dC5maWxsUmVjdCgwLCAwLCBAd2lkdGgsIEBoZWlnaHQpXHJcblxyXG5cclxuICAjIyNcclxuICAgRGF0YSByZWxhdGVkIGNvZGVzXHJcbiAgIyMjXHJcblxyXG4gIHNldERhdGE6IChkYXRhKSAtPlxyXG4gICAgQGRhdGEgPSBkYXRhXHJcblxyXG4gIGdldERhdGE6ICgpIC0+XHJcbiAgICBAZGF0YVxyXG5cclxuICBzZXREYXRhSW50ZXJwb2xhdGVkOiAoZGF0YSkgLT5cclxuICAgIEBzZXREYXRhIEBpbnRlcnBvbGF0ZUFycmF5KGRhdGEsIEB3aWR0aClcclxuXHJcbiAgc2V0RGF0YUNyb3BwZWQ6IChkYXRhKSAtPlxyXG4gICAgQHNldERhdGEgQGV4cGFuZEFycmF5KGRhdGEsIEB3aWR0aClcclxuXHJcbiAgbGluZWFySW50ZXJwb2xhdGU6IChiZWZvcmUsIGFmdGVyLCBhdFBvaW50KSAtPlxyXG4gICAgYmVmb3JlICsgKGFmdGVyIC0gYmVmb3JlKSAqIGF0UG9pbnQ7XHJcblxyXG4gIGV4cGFuZEFycmF5OiAoZGF0YSwgbGltaXQsIGRlZmF1bHRWYWx1ZSkgLT5cclxuICAgIGkgPSB1bmRlZmluZWRcclxuICAgIGogPSB1bmRlZmluZWRcclxuICAgIG5ld0RhdGEgPSB1bmRlZmluZWRcclxuICAgIHJlZiA9IHVuZGVmaW5lZFxyXG4gICAgaWYgZGVmYXVsdFZhbHVlID09IG51bGxcclxuICAgICAgZGVmYXVsdFZhbHVlID0gMC4wXHJcbiAgICBuZXdEYXRhID0gW11cclxuXHJcbiAgICBpZiBkYXRhLmxlbmd0aCA+IGxpbWl0XHJcbiAgICAgIG5ld0RhdGEgPSBkYXRhLnNsaWNlKGRhdGEubGVuZ3RoIC0gbGltaXQsIGRhdGEubGVuZ3RoKVxyXG4gICAgZWxzZVxyXG4gICAgICBpID0gaiA9IDBcclxuICAgICAgcmVmID0gbGltaXQgLSAxXHJcbiAgICAgIHdoaWxlIChpZiAwIDw9IHJlZiB0aGVuIGogPD0gcmVmIGVsc2UgaiA+PSByZWYpXHJcbiAgICAgICAgbmV3RGF0YVtpXSA9IGRhdGFbaV0gb3IgZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgaSA9IChpZiAwIDw9IHJlZiB0aGVuICsraiBlbHNlIC0tailcclxuICAgIG5ld0RhdGFcclxuXHJcblxyXG4gIGludGVycG9sYXRlQXJyYXk6IChkYXRhLCBmaXRDb3VudCkgLT5cclxuICAgIGFmdGVyID0gdW5kZWZpbmVkXHJcbiAgICBhdFBvaW50ID0gdW5kZWZpbmVkXHJcbiAgICBiZWZvcmUgPSB1bmRlZmluZWRcclxuICAgIGkgPSB1bmRlZmluZWRcclxuICAgIG5ld0RhdGEgPSB1bmRlZmluZWRcclxuICAgIHNwcmluZ0ZhY3RvciA9IHVuZGVmaW5lZFxyXG4gICAgdG1wID0gdW5kZWZpbmVkXHJcbiAgICBuZXdEYXRhID0gW11cclxuICAgIHNwcmluZ0ZhY3RvciA9IG5ldyBOdW1iZXIoKGRhdGEubGVuZ3RoIC0gMSkgLyAoZml0Q291bnQgLSAxKSlcclxuICAgIG5ld0RhdGFbMF0gPSBkYXRhWzBdXHJcbiAgICBpID0gMVxyXG4gICAgd2hpbGUgaSA8IGZpdENvdW50IC0gMVxyXG4gICAgICB0bXAgPSBpICogc3ByaW5nRmFjdG9yXHJcbiAgICAgIGJlZm9yZSA9IG5ldyBOdW1iZXIoTWF0aC5mbG9vcih0bXApKS50b0ZpeGVkKClcclxuICAgICAgYWZ0ZXIgPSBuZXcgTnVtYmVyKE1hdGguY2VpbCh0bXApKS50b0ZpeGVkKClcclxuICAgICAgYXRQb2ludCA9IHRtcCAtIGJlZm9yZVxyXG4gICAgICBuZXdEYXRhW2ldID0gQGxpbmVhckludGVycG9sYXRlKGRhdGFbYmVmb3JlXSwgZGF0YVthZnRlcl0sIGF0UG9pbnQpXHJcbiAgICAgIGkrK1xyXG4gICAgbmV3RGF0YVtmaXRDb3VudCAtIDFdID0gZGF0YVtkYXRhLmxlbmd0aCAtIDFdXHJcbiAgICBuZXdEYXRhXHJcblxyXG5cclxuICBwdXREYXRhSW50b1dhdmVCbG9jazogKCkgLT5cclxuICAgIGlXYXZlQmxvY2sgPSBAd2F2ZVdpZHRoICsgQGlHdXR0ZXJXaWR0aFxyXG4gICAgZGF0YSA9IEBnZXREYXRhKClcclxuICAgIG5ld0RhdGFCbG9ja3MgPSBbXVxyXG4gICAgaVdhdmVDb3VudCA9IE1hdGguY2VpbCBkYXRhLmxlbmd0aCAvIGlXYXZlQmxvY2tcclxuICAgIGkgPSAwXHJcblxyXG4gICAgd2hpbGUgaSA8IGlXYXZlQ291bnRcclxuICAgICAgc3VtID0gMFxyXG4gICAgICBqID0gMFxyXG4gICAgICB3aGlsZSBqIDwgaVdhdmVCbG9ja1xyXG4gICAgICAgIGtleSA9IChpICogaVdhdmVCbG9jaykgKyBqXHJcbiAgICAgICAgc3VtICs9IGRhdGFba2V5XVxyXG4gICAgICAgIGorK1xyXG5cclxuICAgICAgZkF2ZXJhZ2UgPSAoc3VtIC8gaVdhdmVCbG9jayApXHJcbiAgICAgIGZBYnNWYWx1ZSA9IGZBdmVyYWdlICogQHdhdmVIZWlnaHRcclxuICAgICAgIyBwdXNoIGl0IGludG8gdGhlIG5ldyBibG9ja1xyXG4gICAgICBmV2F2ZVBvaW50ID0gTWF0aC5mbG9vcigtTWF0aC5hYnMoZkFic1ZhbHVlKSlcclxuICAgICAgbmV3RGF0YUJsb2Nrcy5wdXNoIGZXYXZlUG9pbnRcclxuXHJcbiAgICAgICNcdFx0XHRuZXdEYXRhQmxvY2tzLnB1c2ggTWF0aC5hYnMgZkF2ZXJhZ2VcclxuICAgICAgaSsrXHJcbiAgICAjIC4uLlxyXG5cclxuICAgIG5ld0RhdGFCbG9ja3NcclxuXHJcblxyXG4gIGNhY2hlOiAoKSAtPlxyXG4gICAgaWYgQGludGVycG9sYXRlID09IGZhbHNlXHJcbiAgICAgIEBzZXREYXRhQ3JvcHBlZCBAZGF0YVxyXG4gICAgZWxzZVxyXG4gICAgICBAc2V0RGF0YUludGVycG9sYXRlZCBAZGF0YVxyXG5cclxuICAgICMgc3BsaXQgdGhlIGRhdGEgaW50byB3YXZlcyBjb2xsZWN0aW9uXHJcbiAgICBAd2F2ZXNDb2xsZWN0aW9uID0gQHB1dERhdGFJbnRvV2F2ZUJsb2NrIEBkYXRhXHJcblxyXG4gICAgcmV0dXJuXHJcblxyXG5cclxuICAjIyNcclxuICAgIERhdGEgdXBkYXRlIGRldGFpbHMgaGVyZVxyXG4gICMjI1xyXG4gIHVwZGF0ZTogKG9wdGlvbnMpIC0+XHJcbiAgICBpZiBvcHRpb25zXHJcbiAgICAgIGlmIG9wdGlvbnMuZ3V0dGVyV2lkdGhcclxuICAgICAgICBAZ3V0dGVyV2lkdGggPSBvcHRpb25zLmd1dHRlcldpZHRoXHJcbiAgICAgIGlmIG9wdGlvbnMud2F2ZVdpZHRoXHJcbiAgICAgICAgQHdhdmVXaWR0aCA9IG9wdGlvbnMud2F2ZVdpZHRoXHJcbiAgICAgIGlmIG9wdGlvbnMud2lkdGhcclxuICAgICAgICBAd2lkdGggPSBvcHRpb25zLndpZHRoXHJcbiAgICAgICAgQGNhbnZhcy53aWR0aCA9IEB3aWR0aFxyXG4gICAgICBpZiBvcHRpb25zLmhlaWdodFxyXG4gICAgICAgIEBoZWlnaHQgPSBvcHRpb25zLmhlaWdodFxyXG4gICAgICAgIEBjYW52YXMuaGVpZ2h0ID0gQGhlaWdodFxyXG4gICAgICBpZiBvcHRpb25zLnJlZmxlY3Rpb24gPT0gMCBvciBvcHRpb25zLnJlZmxlY3Rpb25cclxuICAgICAgICBAcmVmbGVjdGlvbiA9IG9wdGlvbnMucmVmbGVjdGlvblxyXG4gICAgICBpZiBvcHRpb25zLmludGVycG9sYXRlXHJcbiAgICAgICAgQGludGVycG9sYXRlID0gQG9wdGlvbnMuaW50ZXJwb2xhdGVcclxuICAgICAgIyMjXHJcbiAgICAgICAgUmUtY2FsY3VsYXRlIHRoZSB3YXZlIGJsb2NrIGZvcm1hdGlvbnMgb25jZSBvbmUgb2YgdGhlIGZvbGxvd2luZyBpcyBhbHRlcmVkXHJcbiAgICAgICMjI1xyXG4gICAgICBpZiBvcHRpb25zLmd1dHRlcldpZHRoIG9yIG9wdGlvbnMud2F2ZVdpZHRoIG9yIG9wdGlvbnMud2lkdGggb3Igb3B0aW9ucy5oZWlnaHQgb3Igb3B0aW9ucy5yZWZsZWN0aW9uIG9yIG9wdGlvbnMuaW50ZXJwb2xhdGUgb3Igb3B0aW9ucy5yZWZsZWN0aW9uID09IDBcclxuICAgICAgICBAY2FjaGUoKVxyXG4gICAgICBpZiBvcHRpb25zLmhlaWdodCBvciBvcHRpb25zLnJlZmxlY3Rpb24gb3Igb3B0aW9ucy5yZWZsZWN0aW9uID09IDBcclxuICAgICAgICBAdXBkYXRlSGVpZ2h0KClcclxuXHJcbiAgICAjcmVkcmF3IHRoZSB3YXZlZm9ybVxyXG4gICAgQHJlZHJhdygpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdXBkYXRlSGVpZ2h0OiAoKSAtPlxyXG4gICAgQHdhdmVPZmZzZXQgPSBNYXRoLnJvdW5kKEBoZWlnaHQgLSAoQGhlaWdodCAqIEByZWZsZWN0aW9uKSlcclxuICAgIEByZWZsZWN0aW9uSGVpZ2h0ID0gTWF0aC5yb3VuZChAaGVpZ2h0IC0gQHdhdmVPZmZzZXQpXHJcbiAgICBAd2F2ZUhlaWdodCA9IEBoZWlnaHQgLSBAcmVmbGVjdGlvbkhlaWdodFxyXG4gICAgcmV0dXJuXHJcblxyXG4jIHBhdGNoQ2FudmFzRm9ySUUgPSAoY2FudmFzKSAtPlxyXG4jIFx0b2xkR2V0Q29udGV4dCA9IHVuZGVmaW5lZFxyXG4jIFx0aWYgdHlwZW9mIHdpbmRvdy5HX3ZtbENhbnZhc01hbmFnZXIgIT0gJ3VuZGVmaW5lZCdcclxuIyBcdFx0Y2FudmFzID0gd2luZG93Lkdfdm1sQ2FudmFzTWFuYWdlci5pbml0RWxlbWVudChjYW52YXMpXHJcbiMgXHRcdG9sZEdldENvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dFxyXG4jIFx0XHRyZXR1cm5cclxuIyBcdFx0XHRjYW52YXMuZ2V0Q29udGV4dCA9IChhKSAtPlxyXG4jIFx0XHRcdFx0Y3R4ID0gdW5kZWZpbmVkXHJcbiMgXHRcdFx0XHRjdHggPSBvbGRHZXRDb250ZXh0LmFwcGx5KGNhbnZhcywgYXJndW1lbnRzKVxyXG4jIFx0XHRcdFx0Y2FudmFzLmdldENvbnRleHQgPSBvbGRHZXRDb250ZXh0XHJcbiMgXHRcdFx0XHRjdHhcclxuIyBcdHJldHVyblxyXG5cclxuICBjcmVhdGVDYW52YXM6IChjb250YWluZXIsIHdpZHRoLCBoZWlnaHQpIC0+XHJcbiAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiY2FudmFzXCJcclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCBjYW52YXNcclxuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoXHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0XHJcbiAgICByZXR1cm4gY2FudmFzXHJcblxyXG5cclxuICAjIyNcclxuICAgIEV2ZW50cyByZWxhdGVkXHJcbiMjI1xyXG4gIGdldE1vdXNlQ2xpY2tQb3NpdGlvbjogKGV2dCktPlxyXG4gICAgY2FudmFzID0gQGNhbnZhc1xyXG4gICAgcmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gICAgIyAge1xyXG4gICAgIyAgeDogZXZ0LmNsaWVudFggLSAocmVjdC5sZWZ0KVxyXG4gICAgIyAgeTogZXZ0LmNsaWVudFkgLSAocmVjdC50b3ApXHJcbiAgICAjICB9XHJcbiAgICB4ID0gTWF0aC5yb3VuZCgoZXZ0LmNsaWVudFggLSByZWN0LmxlZnQpIC8gKHJlY3QucmlnaHQgLSByZWN0LmxlZnQpICogY2FudmFzLndpZHRoKVxyXG4gICAgeSA9IE1hdGgucm91bmQoKGV2dC5jbGllbnRZIC0gcmVjdC50b3ApIC8gKHJlY3QuYm90dG9tIC0gcmVjdC50b3ApICogY2FudmFzLmhlaWdodClcclxuICAgIHJldHVybiBbeCwgeV1cclxuXHJcbiAgY2FsY1BlcmNlbnQ6IC0+XHJcbiAgICBNYXRoLnJvdW5kIEBjbGlja1BlcmNlbnQgKiBAd2lkdGggLyAoQHdhdmVXaWR0aCArIEBpR3V0dGVyV2lkdGgpXHJcblxyXG4jIG5ldyBmaXJlIGV2ZW50IHRvIHVzZSBvYnNlcnZhYmxlc1xyXG4gIGZpcmVFdmVudDogKG5hbWUsIGRhdGEuLi4pIC0+XHJcbiAgICBAbm90aWZ5KG5hbWUsIGRhdGEpXHJcbiAgICByZXR1cm5cclxuXHJcbiMgYmluZCB0aGUgZXZlbnQgaGFuZGxlcnNcclxuICBiaW5kRXZlbnRIYW5kbGVyczogKCkgLT5cclxuICAgIEBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgQG9uTW91c2VEb3duKVxyXG4gICAgQGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBAb25Nb3VzZU92ZXIpXHJcbiAgICBAY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgQG9uTW91c2VPdXQpXHJcbiAgICBAY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBAb25Nb3VzZVVwKVxyXG5cclxuXHJcbiAgb25Nb3VzZU91dDogKGUpID0+XHJcbiAgICBAc2VsZWN0ZWQgPSAtMVxyXG4gICAgQHJlZHJhd1dpdGhBbHBoYSgxKSAjIHJlZHJhdyBiYWNrIHRvIGZ1bGwgb3BhY2l0eVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIG9uTW91c2VVcDogKGUpID0+XHJcbiAgICBAaXNEcmFnZ2luZyA9IGZhbHNlXHJcbiAgICByZXR1cm5cclxuXHJcblxyXG4jIHRoaXMgd2lsbCBiZSB0cnVlIGlmIHRoZSB3YXZlZm9ybSBoYXMgYmVlbiBwYXVzZWQgYWZ0ZXIgaXQgaGFzIHN0YXJ0ZWQgcGxheWluZ1xyXG4gIGlzUGF1c2VkQWZ0ZXJQbGF5aW5nOiAoKSAtPlxyXG4gICAgcmV0dXJuIEBoYXNTdGFydGVkUGxheWluZyBpcyBvbiBhbmQgQGlzUGF1c2VkKCkgaXMgb25cclxuXHJcbiAgIyByZWRyYXcgdGhlIGNhbnZhcyB3aXRoIGFscGhhXHJcbiAgcmVkcmF3V2l0aEFscGhhOiAoaUFscGhhID0gV2F2ZWZvcm0uREVGQVVMVF9NQVhfT1BBQ0lUWSkgLT5cclxuICAgICMgaWYgdGhlIGFscGhhIGhhcyBjaGFuZ2VkLCB0aGVuIHJlZHJhd1xyXG4gICAgaWYgaUFscGhhIGlzbnQgQGZhZGVPcGFjaXR5XHJcbiAgICAgIEBjb250ZXh0Lmdsb2JhbEFscGhhID0gaUFscGhhXHJcbiAgICAgIEByZWRyYXcoKVxyXG5cclxuICBvbk1vdXNlT3ZlcjogKGUpID0+XHJcbiMgZG8gbm90IHBlcmZvcm0gaG92ZXIgYW5pbWF0aW9uIGlmIHdhdmVmb3JtIGlzIHBhdXNlZFxyXG4gICAgaWYgQGlzUGF1c2VkQWZ0ZXJQbGF5aW5nKClcclxuICAgICAgQHJlZHJhd1dpdGhBbHBoYShAZmFkZU9wYWNpdHkpICMgcmVkcmF3IHdpdGggZmFkZWQgb3BhY2l0eVxyXG4gICAgICByZXR1cm4gb25cclxuXHJcbiAgICBhUG9zID0gQGdldE1vdXNlQ2xpY2tQb3NpdGlvbihlKVxyXG4gICAgeCA9IGFQb3NbMF1cclxuXHJcbiAgICB3YXZlQ2xpY2tlZCA9IEBnZXRXYXZlQ2xpY2tlZCh4KVxyXG4gICAgbW91c2VQb3NUcmFja1RpbWUgPSBAZ2V0TW91c2VQb3NUcmFja1RpbWUoeClcclxuICAgIEBmaXJlRXZlbnQgV2F2ZWZvcm0uRVZFTlRfSE9WRVIsIG1vdXNlUG9zVHJhY2tUaW1lLCB3YXZlQ2xpY2tlZFxyXG5cclxuXHJcbiAgICBpZiBAaXNEcmFnZ2luZyA9PSB0cnVlXHJcbiAgICAgIEBzZWxlY3RlZCA9IC0xXHJcbiAgICAgIEBjbGlja1BlcmNlbnQgPSB4IC8gQHdpZHRoXHJcbiAgICAgIEBhY3RpdmUgPSBAY2FsY1BlcmNlbnQoKVxyXG4gICAgZWxzZVxyXG4gICAgICBAc2VsZWN0ZWQgPSB3YXZlQ2xpY2tlZFxyXG5cclxuICAgIEBjb250ZXh0Lmdsb2JhbEFscGhhID0gMVxyXG4gICAgQHJlZHJhdygpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgb25Nb3VzZURvd246IChlKSA9PlxyXG4gICAgQGlzRHJhZ2dpbmcgPSB0cnVlXHJcbiAgICBhUG9zID0gQGdldE1vdXNlQ2xpY2tQb3NpdGlvbihlKVxyXG4gICAgeCA9IGFQb3NbMF1cclxuICAgIEBjbGlja1BlcmNlbnQgPSB4IC8gQHdpZHRoXHJcblxyXG4gICAgIyB0aGlzIHdpbGwgZmlyZSB0aGUgcGVyY2VudGFnZSBjbGlja2VkIG9uIHRoZSB3YXZlZm9ybVxyXG4gICAgQGZpcmVFdmVudCBXYXZlZm9ybS5FVkVOVF9DTElDSywgKEBjbGlja1BlcmNlbnQgKiAxMDApXHJcbiAgICBAYWN0aXZlID0gQGNhbGNQZXJjZW50KClcclxuXHJcbiAgICBAcmVkcmF3KClcclxuICAgIHJldHVyblxyXG5cclxuICAjIyNcclxuICAgIHRoaXMgaXMgdG8gc2ltdWxhdGUgcGxheVxyXG4jIyNcclxuICBzZXRQbGF5aW5nOiAodmFsID0gb24pIC0+XHJcbiAgICBAaXNQbGF5aW5nID0gdmFsXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc2V0UGF1c2VkOiAoKSAtPlxyXG4gICAgQHNldFBsYXlpbmcgb2ZmXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaXNQYXVzZWQ6ICgpIC0+XHJcbiAgICBAYWN0aXZlID4gMCBhbmQgQGlzUGxheWluZyBpcyBvZmZcclxuXHJcbiMgYW4gYWxpYXMgdG8gcGxheSBwcm9ncmVzc1xyXG4gIHBsYXk6IChwZXJjdCkgLT5cclxuICAgIEBwbGF5UHJvZ3Jlc3MocGVyY3QpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcGF1c2U6ICgpIC0+XHJcbiAgICBAc2V0UGF1c2VkKClcclxuICAgIGNvbnNvbGUubG9nIFwiaXMgcGF1c2VkIGlzIFwiLCBAaXNQYXVzZWQoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHBsYXlQcm9ncmVzczogKHBlcmN0KSAtPlxyXG4jIGluZGljYXRlIHRoYXQgaXQgaGFzIHN0YXJ0ZWQgcGxheWluZ1xyXG4gICAgaWYgQGhhc1N0YXJ0ZWRQbGF5aW5nIGlzIG51bGxcclxuICAgICAgQGhhc1N0YXJ0ZWRQbGF5aW5nID0gb25cclxuXHJcbiAgICAjIHNldCBwbGF5aW5nIHRvIHRydWVcclxuICAgIGlmIEBpc1BsYXlpbmcgaXMgb2ZmXHJcbiAgICAgIEBzZXRQbGF5aW5nIG9uXHJcblxyXG4gICAgaUFjdGl2ZSA9IE1hdGgucm91bmQoKHBlcmN0IC8gMTAwICkgKiBAd2F2ZXNDb2xsZWN0aW9uLmxlbmd0aClcclxuICAgIEBhY3RpdmUgPSBpQWN0aXZlXHJcbiAgICBAcmVkcmF3KClcclxuICAgIHJldHVyblxyXG5cclxuIyB0aGlzIGlzIHJlbGF0aXZlIHRvIHRoZSB3YXZlcyBjb2xsZWN0aW9uXHJcbiAgY2FsY1BlcmNlbnQ6IC0+XHJcbiAgICBNYXRoLnJvdW5kIEBjbGlja1BlcmNlbnQgKiBAd2lkdGggLyAoQHdhdmVXaWR0aCArIEBpR3V0dGVyV2lkdGgpXHJcblxyXG5cclxuICBnZXRXYXZlQ2xpY2tlZDogKHgpIC0+XHJcbiAgICB3YXZlQ2xpY2tlZCA9IE1hdGgucm91bmQoeCAvIChAd2F2ZVdpZHRoICsgQGlHdXR0ZXJXaWR0aCkpXHJcbiAgICB3YXZlc0NvbGxlY3Rpb24gPSBAd2F2ZXNDb2xsZWN0aW9uXHJcbiAgICBmUmV0dXJuID0gMFxyXG4gICAgaWYgd2F2ZUNsaWNrZWQgPiB3YXZlc0NvbGxlY3Rpb24ubGVuZ3RoXHJcbiAgICAgIGZSZXR1cm4gPSB3YXZlc0NvbGxlY3Rpb24ubGVuZ3RoXHJcbiAgICBlbHNlIGlmIHdhdmVDbGlja2VkIDwgMFxyXG4gICAgICBmUmV0dXJuID0gMFxyXG4gICAgZWxzZVxyXG4gICAgICBmUmV0dXJuID0gd2F2ZUNsaWNrZWRcclxuXHJcbiAgICBmUmV0dXJuXHJcblxyXG4gIGdldE1vdXNlUG9zVHJhY2tUaW1lOiAoeCkgLT5cclxuICAgIG1vdXNlUG9zVHJhY2tUaW1lID0gQHRyYWNrTGVuZ3RoIC8gQHdhdmVzQ29sbGVjdGlvbi5sZW5ndGggKiBAZ2V0V2F2ZUNsaWNrZWQoeClcclxuICAgIGZSZXR1cm4gPSAwXHJcbiAgICBpZiBtb3VzZVBvc1RyYWNrVGltZSA+IEB0cmFja0xlbmd0aFxyXG4gICAgICBmUmV0dXJuID0gQHRyYWNrTGVuZ3RoXHJcbiAgICBlbHNlIGlmIG1vdXNlUG9zVHJhY2tUaW1lIDwgMFxyXG4gICAgICBmUmV0dXJuID0gMFxyXG4gICAgZWxzZVxyXG4gICAgICBmUmV0dXJuID0gbW91c2VQb3NUcmFja1RpbWVcclxuICAgIGZSZXR1cm5cclxuXHJcblxyXG4jaWYgdHlwZW9mIG1vZHVsZSBpcyBcIm9iamVjdFwiIGFuZCBtb2R1bGUuZXhwb3J0cyB0aGVuIGBleHBvcnQgZGVmYXVsdCBXYXZlZm9ybWBcclxubW9kdWxlLmV4cG9ydHMgPSBXYXZlZm9ybVxyXG4jIGV4cG9ydCB3YXZlZm9ybSB0byB3aW5kb3dcclxuZ2xvYmFsLndpbmRvdy5XYXZlZm9ybSA9IFdhdmVmb3JtIl19
