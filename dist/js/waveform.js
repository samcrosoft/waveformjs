
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require, exports, module);
  } else {
    root.Waveform = factory();
  }
}(this, function(require, exports, module) {

/**
 * waveformjs - A library to build soundcloud like waveforms
 * @version v1.0.0
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

  /*
  create color constants
   */
  extend(Waveform, superClass);

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
    this.redraw();
  };

  Waveform.prototype.onMouseUp = function(e) {
    this.isDragging = false;
  };

  Waveform.prototype.onMouseOver = function(e) {
    var aPos, mousePosTrackTime, waveClicked, x;
    if (this.hasStartedPlaying === true && this.isPaused() === true) {
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


},{"observant":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvb2JzZXJ2YW50L2Rpc3Qvb2JzZXJ2YW50LmpzIiwic3JjXFx3YXZlZm9ybS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQSxJQUFBLG1CQUFBO0VBQUE7Ozs7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSOzs7QUFDWjs7Ozs7QUFJQSxNQUFNLENBQUMsZ0JBQVAsR0FBNkIsQ0FBQSxTQUFBO1NBQzNCLE1BQU0sQ0FBQyxxQkFBUCxJQUFnQyxNQUFNLENBQUMsMkJBQXZDLElBQXNFLE1BQU0sQ0FBQyx3QkFBN0UsSUFBeUcsTUFBTSxDQUFDLHNCQUFoSCxJQUEwSSxNQUFNLENBQUMsdUJBQWpKLElBQTRLLFNBQUMsUUFBRDtJQUMxSyxNQUFNLENBQUMs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ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogb2JzZXJ2YW50IC0gTGlnaHR3ZWlnaHQgZXZlbnQgb2JzZXJ2ZXIgZm9yIG5vZGVcbiAqIEB2ZXJzaW9uIHYxLjAuMFxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL3NhbWNyb3NvZnQvb2JzZXJ2YW50XG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuXG4oZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuT2JzZXJ2YW50ID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuXG4vKipcclxuICogQ3JlYXRlZCBieSBBZGVib2xhIG9uIDA4LzAyLzIwMTYuXHJcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIE9ic2VydmFudCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gT2JzZXJ2YW50KCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgT2JzZXJ2YW50KTtcblxuICAgICAgICB0aGlzLm9ic2VydmVycyA9IHt9O1xuICAgIH1cblxuICAgIC8vZXhwb3J0IGRlZmF1bHQgT2JzZXJ2YW50O1xuXG4gICAgX2NyZWF0ZUNsYXNzKE9ic2VydmFudCwgW3tcbiAgICAgICAga2V5OiBcIm9ic2VydmVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9ic2VydmUoZXZlbnQsIG9ic2VydmVyKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMub2JzZXJ2ZXJzW2V2ZW50XSkge1xuICAgICAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzW2V2ZW50XSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnNbZXZlbnRdLnB1c2gob2JzZXJ2ZXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJpZ25vcmVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlnbm9yZShldmVudCwgb2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IC0xO1xuICAgICAgICAgICAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm9ic2VydmVyc1tldmVudF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9ic2VydmVyc1tldmVudF0pIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IHRoaXMub2JzZXJ2ZXJzW2V2ZW50XS5pbmRleE9mKG9ic2VydmVyKTtcbiAgICAgICAgICAgICAgICBpZiAoLTEgIT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnNbZXZlbnRdW2luZGV4XSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcIm5vdGlmeVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbm90aWZ5KGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXJzID0gdGhpcy5vYnNlcnZlcnNbZXZlbnRdO1xuICAgICAgICAgICAgaWYgKCFvYnNlcnZlcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChpIDwgb2JzZXJ2ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsICE9IG9ic2VydmVyc1tpXSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHRoZSBjYWxsIHRvIHRoZSBvYnNlcnZlciBoZXJlXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVyc1tpXShkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKytpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChpIDwgb2JzZXJ2ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IG9ic2VydmVyc1tpXSkge1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICArK2k7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjbGVhciBvdXQgdGhlIG9ic2VydmVycyBhdCB0aGlzIHN0YWdlXG4gICAgICAgICAgICBpZiAob2JzZXJ2ZXJzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5vYnNlcnZlcnNbZXZlbnRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIE9ic2VydmFudDtcbn0pKCk7XG5yZXR1cm4gT2JzZXJ2YW50O1xuXG59KSk7XG4iLCJPYnNlcnZhbnQgPSByZXF1aXJlKCdvYnNlcnZhbnQnKVxyXG4jIyNcclxuICAgIHJlcXVlc3RBbmltRnJhbWUgc2hpbVxyXG4gIGNvcHkgdGhlIG9uZSBmcm9tIHBhdWwgaXJpc2hcclxuIyMjXHJcbndpbmRvdy5yZXF1ZXN0QW5pbUZyYW1lID0gZG8gLT5cclxuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIG9yIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgb3Igd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSBvciB3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSBvciB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgb3IgKGNhbGxiYWNrKSAtPlxyXG4gICAgd2luZG93LnNldFRpbWVvdXQgY2FsbGJhY2ssIDEwMDAgLyAzMFxyXG4gICAgcmV0dXJuXHJcblxyXG4jICAgIHN0YXJ0IG9mIHdhdmVmb3JtIGNsYXNzXHJcbmNsYXNzIFdhdmVmb3JtIGV4dGVuZHMgT2JzZXJ2YW50XHJcblxyXG4gICMjI1xyXG4gIGNyZWF0ZSBjb2xvciBjb25zdGFudHNcclxuICAjIyNcclxuICBXYXZlZm9ybS5XQVZFX0ZPQ1VTID0gJ3dhdmUtZm9jdXMnXHJcbiAgV2F2ZWZvcm0uV0FWRSA9ICd3YXZlJ1xyXG4gIFdhdmVmb3JtLldBVkVfQUNUSVZFID0gJ3dhdmUtYWN0aXZlJ1xyXG4gIFdhdmVmb3JtLldBVkVfU0VMRUNURUQgPSAnd2F2ZS1zZWxlY3RlZCdcclxuICBXYXZlZm9ybS5HVVRURVIgPSAnZ3V0dGVyJ1xyXG4gIFdhdmVmb3JtLkdVVFRFUl9BQ1RJVkUgPSAnZ3V0dGVyLWFjdGl2ZSdcclxuICBXYXZlZm9ybS5HVVRURVJfU0VMRUNURUQgPSAnZ3V0dGVyLXNlbGVjdGVkJ1xyXG4gIFdhdmVmb3JtLlJFRkxFQ1RJT04gPSAncmVmbGVjdGlvbidcclxuICBXYXZlZm9ybS5SRUZMRUNUSU9OX0FDVElWRSA9ICdyZWZsZWN0aW9uLWFjdGl2ZSdcclxuXHJcbiAgIyMjXHJcbiAgY3JlYXRlIGV2ZW50cyBjb25zdGFudHNcclxuICAjIyNcclxuICBXYXZlZm9ybS5FVkVOVF9SRUFEWSA9IFwicmVhZHlcIlxyXG4gIFdhdmVmb3JtLkVWRU5UX0NMSUNLID0gXCJjbGlja1wiXHJcbiAgV2F2ZWZvcm0uRVZFTlRfSE9WRVIgPSBcImhvdmVyXCJcclxuICBXYXZlZm9ybS5FVkVOVF9SRVNJWkVEID0gXCJob3ZlclwiXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cclxuIyBpbml0aWF0ZSBvYnNlcnZhYmxlXHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgQGNvbnRhaW5lciA9IG9wdGlvbnMuY29udGFpbmVyXHJcbiAgICBAY2FudmFzID0gb3B0aW9ucy5jYW52YXNcclxuXHJcbiAgICBAZGF0YSA9IG9wdGlvbnMuZGF0YSBvciBbXVxyXG4gICAgQHdhdmVzQ29sbGVjdGlvbiA9IEBkYXRhXHJcblxyXG4gICAgQG91dGVyQ29sb3IgPSBvcHRpb25zLm91dGVyQ29sb3Igb3IgJ3RyYW5zcGFyZW50J1xyXG4gICAgQHJlZmxlY3Rpb24gPSBvcHRpb25zLnJlZmxlY3Rpb24gb3IgMFxyXG4gICAgQGludGVycG9sYXRlID0gb3B0aW9ucy5pbnRlcnBvbGF0ZSBvciB0cnVlXHJcbiAgICBAYmluZFJlc2l6ZSAgPSBvcHRpb25zLmJpbmRSZXNpemUgb3IgZmFsc2VcclxuXHJcbiAgICAjIyNcclxuICAgICAgQ2F0ZXIgZm9yIGRhdGEgaW50ZXJwb2xhdGlvbiByaWdodCBoZXJlXHJcbiAgICAjIyNcclxuICAgIGlmIG9wdGlvbnMuaW50ZXJwb2xhdGUgPT0gZmFsc2VcclxuICAgICAgQGludGVycG9sYXRlID0gZmFsc2VcclxuICAgIGlmIG5vdCBAY2FudmFzXHJcbiAgICAgIGlmIEBjb250YWluZXJcclxuICAgICAgICBAY2FudmFzID0gQGNyZWF0ZUNhbnZhcyhAY29udGFpbmVyLCBvcHRpb25zLndpZHRoIG9yIEBjb250YWluZXIuY2xpZW50V2lkdGgsXHJcbiAgICAgICAgICBvcHRpb25zLmhlaWdodCBvciBAY29udGFpbmVyLmNsaWVudEhlaWdodClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHRocm93ICdFaXRoZXIgY2FudmFzIG9yIGNvbnRhaW5lciBvcHRpb24gbXVzdCBiZSBwYXNzZWQnXHJcblxyXG4gICAgIyBhZGQgdGhpcyBmb3IgcmVhbCBpbiBwcm9kdWN0aW9uIHRvIHN1cHBvcnQgSUVcclxuICAgICMgQHBhdGNoQ2FudmFzRm9ySUUgQGNhbnZhc1xyXG5cclxuICAgIEBjb250ZXh0ID0gQGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICBAd2lkdGggPSBwYXJzZUludChAY29udGV4dC5jYW52YXMud2lkdGgsIDEwKVxyXG4gICAgQGhlaWdodCA9IHBhcnNlSW50KEBjb250ZXh0LmNhbnZhcy5oZWlnaHQsIDEwKVxyXG5cclxuXHJcbiAgICAjY3VzdG9tIFRhbGtcclxuICAgIEB3YXZlV2lkdGggPSAyXHJcbiAgICBAaUd1dHRlcldpZHRoID0gMVxyXG4gICAgQGNvbG9ycyA9IHt9XHJcbiAgICAjIGhvbGRzIGV2ZW50c1xyXG4gICAgQGV2ZW50cyA9IHt9XHJcblxyXG4gICAgI2FjdGl2ZSA9IGhpZ2hsaWdodGVkIHNlY3Rpb24gb2YgdHJhY2tcclxuICAgIEBhY3RpdmUgPSAtMVxyXG5cclxuICAgICNzbGVjdGVkID0gZGltbWVyIGhpZ2hsaWdodGVkIHNlbGVjdGlvbnNcclxuICAgIEBzZWxlY3RlZCA9IC0xXHJcblxyXG4gICAgI21vdXNlIGRyYWdnaW5nXHJcbiAgICBAaXNEcmFnZ2luZyA9IGZhbHNlXHJcblxyXG4gICAgI2lzIHBsYXlpbmdcclxuICAgIEBpc1BsYXlpbmcgPSBmYWxzZVxyXG4gICAgQGhhc1N0YXJ0ZWRQbGF5aW5nID0gbnVsbFxyXG5cclxuICAgICNpcyBpbiBmb2N1c1xyXG4gICAgQGlzRm9jdXMgPSBmYWxzZVxyXG5cclxuICAgICMga2ljay1zdGFydCB0aGUgcHJvY2Vzc1xyXG4gICAgQGluaXRpYWxpemUoKVxyXG5cclxuICAgIHJldHVyblxyXG5cclxuICAjIGluaXRpYWxpemUgdGhlIHdob2xlIHByb2Nlc3NcclxuICBpbml0aWFsaXplOiAoKSAtPlxyXG4gICAgIyB1cGRhdGUgaGVpZ2h0XHJcbiAgICBAdXBkYXRlSGVpZ2h0KClcclxuXHJcbiAgICAjIHNldCB0aGUgY29sb3JzXHJcbiAgICBAc2V0Q29sb3JzKClcclxuXHJcblxyXG4gICAgIyBiaW5kIHRoZSBldmVudCBoYW5kbGVyXHJcbiAgICBAYmluZEV2ZW50SGFuZGxlcnMoKVxyXG5cclxuICAgICMgQ2FjaGUgdGhlIHdhdmVmb3JtIGRhdGFcclxuICAgIEBjYWNoZSgpXHJcblxyXG4gICAgIyBkcmF3IHRoZSB3YXZlZm9ybVxyXG4gICAgQHJlZHJhdygpXHJcblxyXG4gICAgIyBiaW5kIGV2ZW50IGZvciBjb250YWluZXIgcmVkcmF3XHJcbiAgICBpZiBAYmluZFJlc2l6ZSBpcyBvbiB0aGVuIEBiaW5kQ29udGFpbmVyUmVzaXplKClcclxuXHJcbiAgICBAZmlyZUV2ZW50KFdhdmVmb3JtLkVWRU5UX1JFQURZKVxyXG5cclxuICAgIHJldHVyblxyXG5cclxuXHJcblxyXG4gICMjI1xyXG4gICAgdGhpcyB3aWxsIG1ha2Ugc3VyZSB0aGUgY29udGFpbmVyIGlzIGJvdW5kIHRvIHJlc2l6ZSBldmVudFxyXG4gICMjI1xyXG4gIGJpbmRDb250YWluZXJSZXNpemU6ICgpIC0+XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKT0+XHJcbiAgICAgIGlDb250V2lkdGggPSBAY29udGFpbmVyLmNsaWVudFdpZHRoXHJcbiAgICAgIEB1cGRhdGUod2lkdGg6aUNvbnRXaWR0aCApXHJcbiAgICAgIEByZWRyYXcoKVxyXG4gICAgICBAbm90aWZ5KFdhdmVmb3JtLkVWRU5UX1JFU0laRUQsIGlDb250V2lkdGgpXHJcbiAgICApXHJcbiAgICByZXR1cm5cclxuXHJcblxyXG4gICMjI1xyXG4gICAgdGhpcyBtZXRob2Qgd2lsbCBzZXQgdGhlIGNvbG9ycyB0byB0aGUgbWFpbiBjb2xvcnNcclxuICAjIyNcclxuICBzZXRDb2xvcnM6ICgpIC0+XHJcbiAgICBAc2V0Q29sb3IoV2F2ZWZvcm0uV0FWRV9GT0NVUywgJyMzMzMzMzMnKVxyXG4gICAgQHNldEdyYWRpZW50KFdhdmVmb3JtLldBVkUsIFsnIzY2NjY2NicsIDAsICcjODY4Njg2JywgMV0pXHJcbiAgICBAc2V0R3JhZGllbnQoV2F2ZWZvcm0uV0FWRV9BQ1RJVkUsIFsnI0ZGMzMwMCcsIDAsICcjRkY1MTAwJywgMV0pXHJcbiAgICBAc2V0R3JhZGllbnQoV2F2ZWZvcm0uV0FWRV9TRUxFQ1RFRCwgWycjOTkzMDE2JywgMCwgJyM5NzNDMTUnLCAxXSlcclxuICAgIEBzZXRHcmFkaWVudChXYXZlZm9ybS5HVVRURVIsIFsnIzZCNkI2QicsIDAsICcjYzljOWM5JywgMV0pXHJcbiAgICBAc2V0R3JhZGllbnQoV2F2ZWZvcm0uR1VUVEVSX0FDVElWRSwgWycjRkYzNzA0JywgMCwgJyNGRjhGNjMnLCAxXSlcclxuICAgIEBzZXRHcmFkaWVudChXYXZlZm9ybS5HVVRURVJfU0VMRUNURUQsIFsnIzlBMzcxRScsIDAsICcjQ0U5RThBJywgMV0pXHJcbiAgICBAc2V0Q29sb3IoV2F2ZWZvcm0uUkVGTEVDVElPTiwgJyM5OTk5OTknKVxyXG4gICAgQHNldENvbG9yKFdhdmVmb3JtLlJFRkxFQ1RJT05fQUNUSVZFLCAnI0ZGQzBBMCcpXHJcblxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNldENvbG9yOiAobmFtZSwgY29sb3IpIC0+XHJcbiAgICBAY29sb3JzW25hbWVdID0gY29sb3JcclxuXHJcbiAgc2V0R3JhZGllbnQ6IChuYW1lLCBjb2xvcnMpIC0+XHJcbiAgICBncmFkaWVudCA9IEBjb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIEB3YXZlT2Zmc2V0LCAwLCAwKVxyXG4gICAgaSA9IDBcclxuXHJcbiAgICB3aGlsZSBpIDwgY29sb3JzLmxlbmd0aFxyXG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AgY29sb3JzW2kgKyAxXSwgY29sb3JzW2ldXHJcbiAgICAgIGkgKz0gMlxyXG4gICAgQGNvbG9yc1tuYW1lXSA9IGdyYWRpZW50XHJcbiAgICByZXR1cm5cclxuXHJcblxyXG5cclxuXHJcblxyXG4gICMjI1xyXG4gICBUaGlzIHdpbGwgZHJhdyB0aGUgd2F2ZWZvcm1cclxuICAjIyNcclxuICByZWRyYXc6ICgpIC0+XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKEByZW5kZXIpXHJcbiAgICByZXR1cm5cclxuXHJcblxyXG4jIHRoaXMgd2lsbCBkcmF3IHRoZSB3YXZlZm9ybSByZWFsbHlcclxuICByZW5kZXI6ICgpID0+XHJcblxyXG5cclxuICAgIGkgPSAwXHJcbiAgICByZWYgPSBAd2F2ZXNDb2xsZWN0aW9uXHJcblxyXG5cclxuICAgIHQgPSBAd2lkdGggLyBAZGF0YS5sZW5ndGhcclxuXHJcbiAgICAjIHRoaXMgc2hvdWxkIGJlIHJlY29uc2lkZXJlZFxyXG4gICAgeFBvcyA9IDAgIyBzdGFydCBmcm9tIGZhcnRoZXN0IGxlZnRcclxuICAgIHlQb3MgPSBAd2F2ZU9mZnNldFxyXG5cclxuXHJcbiAgICAjIGNsZWFyIHRoZSBlbnRpcmUgY2FudmFzIGZvciByZWRyYXdcclxuICAgIEBjbGVhcigpXHJcblxyXG4gICAgaiA9IDBcclxuICAgIGxlbiA9IHJlZi5sZW5ndGhcclxuICAgIHdoaWxlIGogPCBsZW5cclxuICAgICAgZCA9IHJlZltqXVxyXG4gICAgICBkTmV4dCA9IHJlZltqICsgMV1cclxuXHJcbiAgICAgICMjI1xyXG4gICAgICBEcmF3IHRoZSB3YXZlIGhlcmVcclxuICAgICAgIyMjXHJcbiAgICAgIGlmIEBzZWxlY3RlZCA+IDAgYW5kIChAc2VsZWN0ZWQgPD0gaiBhbmQgaiA8IEBhY3RpdmUpIG9yIChAc2VsZWN0ZWQgPiBqIGFuZCBqID49IEBhY3RpdmUpXHJcbiAgICAgICAgQGNvbnRleHQuZmlsbFN0eWxlID0gQGNvbG9yc1tXYXZlZm9ybS5XQVZFX1NFTEVDVEVEXVxyXG4gICAgICBlbHNlIGlmIEBhY3RpdmUgPiBqXHJcbiAgICAgICAgQGNvbnRleHQuZmlsbFN0eWxlID0gQGNvbG9yc1tXYXZlZm9ybS5XQVZFX0FDVElWRV1cclxuICAgICAgZWxzZVxyXG4gICAgICAgIEBjb250ZXh0LmZpbGxTdHlsZSA9IEBjb2xvcnNbV2F2ZWZvcm0uV0FWRV9GT0NVU11cclxuICAgICAgQGNvbnRleHQuZmlsbFJlY3QgeFBvcywgeVBvcywgQHdhdmVXaWR0aCwgZFxyXG5cclxuXHJcbiAgICAgICMjI1xyXG4gICAgICBkcmF3IHRoZSBndXR0ZXJcclxuICAgICAgIyMjXHJcbiAgICAgICMgaWYgaXMgaG92ZXJlZFxyXG4gICAgICBpZiBAc2VsZWN0ZWQgPiAwIGFuZCAoQHNlbGVjdGVkIDw9IGogYW5kIGogPCBAYWN0aXZlKSBvciAoQHNlbGVjdGVkID4gaiBhbmQgaiA+PSBAYWN0aXZlKVxyXG4gICAgICAgIEBjb250ZXh0LmZpbGxTdHlsZSA9IEBjb2xvcnNbV2F2ZWZvcm0uR1VUVEVSX1NFTEVDVEVEXVxyXG4gICAgICBlbHNlIGlmIEBhY3RpdmUgPiBqXHJcbiAgICAgICAgQGNvbnRleHQuZmlsbFN0eWxlID0gQGNvbG9yc1tXYXZlZm9ybS5HVVRURVJfQUNUSVZFXVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgQGNvbnRleHQuZmlsbFN0eWxlID0gQGNvbG9yc1tXYXZlZm9ybS5HVVRURVJdXHJcbiAgICAgICMgc21hbGxlc3Qgd2F2ZSBiZXR3ZWVuIGJ1dHRlciBpcyBndXR0ZXJzIGhlaWdodFxyXG4gICAgICAjIG5vdGU6IE1hdGgubWF4IGJlY2F1c2Ugd2F2ZSB2YWx1ZXMgYXJlIG5lZ2F0aXZlXHJcbiAgICAgIGd1dHRlclggPSBNYXRoLm1heCBkLCBkTmV4dFxyXG4gICAgICBAY29udGV4dC5maWxsUmVjdCh4UG9zICsgQHdhdmVXaWR0aCwgeVBvcywgQGlHdXR0ZXJXaWR0aCwgZ3V0dGVyWClcclxuXHJcblxyXG4gICAgICAjIyNcclxuICAgICAgIGRyYXcgdGhlIHJlZmxlY3Rpb25cclxuICAgICAgIyMjXHJcbiAgICAgICMgcmVmbGVjdGlvbiB3YXZlXHJcbiAgICAgIGlmIEByZWZsZWN0aW9uID4gMFxyXG4gICAgICAgIHJlZmxlY3Rpb25IZWlnaHQgPSBNYXRoLmFicyhkKSAvICgxIC0gKEByZWZsZWN0aW9uKSkgKiBAcmVmbGVjdGlvblxyXG4gICAgICAgIGlmIEBhY3RpdmUgPiBpXHJcbiAgICAgICAgICBAY29udGV4dC5maWxsU3R5bGUgPSBAY29sb3JzW1dhdmVmb3JtLlJFRkxFQ1RJT05fQUNUSVZFXVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIEBjb250ZXh0LmZpbGxTdHlsZSA9IEBjb2xvcnNbV2F2ZWZvcm0uUkVGTEVDVElPTl1cclxuXHJcbiAgICAgICAgIyBkcmF3IHJlZmxlY3Rpb25cclxuICAgICAgICBAY29udGV4dC5maWxsUmVjdCB4UG9zLCB5UG9zLCBAd2F2ZVdpZHRoLCByZWZsZWN0aW9uSGVpZ2h0XHJcblxyXG4gICAgICAjaW5jcmVtZW50IHRoZSB4LWF4aXMgcG9zaXRpb25cclxuICAgICAgeFBvcyArPSBAd2F2ZVdpZHRoICsgQGlHdXR0ZXJXaWR0aFxyXG5cclxuICAgICAgaisrXHJcblxyXG5cclxuICBjbGVhcjogKCkgLT5cclxuICAgIEBjb250ZXh0LmZpbGxTdHlsZSA9IEBvdXRlckNvbG9yXHJcbiAgICBAY29udGV4dC5jbGVhclJlY3QoMCwgMCwgQHdpZHRoLCBAaGVpZ2h0KVxyXG4gICAgQGNvbnRleHQuZmlsbFJlY3QoMCwgMCwgQHdpZHRoLCBAaGVpZ2h0KVxyXG5cclxuXHJcbiAgIyMjXHJcbiAgIERhdGEgcmVsYXRlZCBjb2Rlc1xyXG4gICMjI1xyXG5cclxuICBzZXREYXRhOiAoZGF0YSkgLT5cclxuICAgIEBkYXRhID0gZGF0YVxyXG5cclxuICBnZXREYXRhOiAoKSAtPlxyXG4gICAgQGRhdGFcclxuXHJcbiAgc2V0RGF0YUludGVycG9sYXRlZDogKGRhdGEpIC0+XHJcbiAgICBAc2V0RGF0YSBAaW50ZXJwb2xhdGVBcnJheShkYXRhLCBAd2lkdGgpXHJcblxyXG4gIHNldERhdGFDcm9wcGVkOiAoZGF0YSkgLT5cclxuICAgIEBzZXREYXRhIEBleHBhbmRBcnJheShkYXRhLCBAd2lkdGgpXHJcblxyXG4gIGxpbmVhckludGVycG9sYXRlOiAoYmVmb3JlLCBhZnRlciwgYXRQb2ludCkgLT5cclxuICAgIGJlZm9yZSArIChhZnRlciAtIGJlZm9yZSkgKiBhdFBvaW50O1xyXG5cclxuICBleHBhbmRBcnJheTogKGRhdGEsIGxpbWl0LCBkZWZhdWx0VmFsdWUpIC0+XHJcbiAgICBpID0gdW5kZWZpbmVkXHJcbiAgICBqID0gdW5kZWZpbmVkXHJcbiAgICBuZXdEYXRhID0gdW5kZWZpbmVkXHJcbiAgICByZWYgPSB1bmRlZmluZWRcclxuICAgIGlmIGRlZmF1bHRWYWx1ZSA9PSBudWxsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZSA9IDAuMFxyXG4gICAgbmV3RGF0YSA9IFtdXHJcblxyXG4gICAgaWYgZGF0YS5sZW5ndGggPiBsaW1pdFxyXG4gICAgICBuZXdEYXRhID0gZGF0YS5zbGljZShkYXRhLmxlbmd0aCAtIGxpbWl0LCBkYXRhLmxlbmd0aClcclxuICAgIGVsc2VcclxuICAgICAgaSA9IGogPSAwXHJcbiAgICAgIHJlZiA9IGxpbWl0IC0gMVxyXG4gICAgICB3aGlsZSAoaWYgMCA8PSByZWYgdGhlbiBqIDw9IHJlZiBlbHNlIGogPj0gcmVmKVxyXG4gICAgICAgIG5ld0RhdGFbaV0gPSBkYXRhW2ldIG9yIGRlZmF1bHRWYWx1ZVxyXG4gICAgICAgIGkgPSAoaWYgMCA8PSByZWYgdGhlbiArK2ogZWxzZSAtLWopXHJcbiAgICBuZXdEYXRhXHJcblxyXG5cclxuICBpbnRlcnBvbGF0ZUFycmF5OiAoZGF0YSwgZml0Q291bnQpIC0+XHJcbiAgICBhZnRlciA9IHVuZGVmaW5lZFxyXG4gICAgYXRQb2ludCA9IHVuZGVmaW5lZFxyXG4gICAgYmVmb3JlID0gdW5kZWZpbmVkXHJcbiAgICBpID0gdW5kZWZpbmVkXHJcbiAgICBuZXdEYXRhID0gdW5kZWZpbmVkXHJcbiAgICBzcHJpbmdGYWN0b3IgPSB1bmRlZmluZWRcclxuICAgIHRtcCA9IHVuZGVmaW5lZFxyXG4gICAgbmV3RGF0YSA9IFtdXHJcbiAgICBzcHJpbmdGYWN0b3IgPSBuZXcgTnVtYmVyKChkYXRhLmxlbmd0aCAtIDEpIC8gKGZpdENvdW50IC0gMSkpXHJcbiAgICBuZXdEYXRhWzBdID0gZGF0YVswXVxyXG4gICAgaSA9IDFcclxuICAgIHdoaWxlIGkgPCBmaXRDb3VudCAtIDFcclxuICAgICAgdG1wID0gaSAqIHNwcmluZ0ZhY3RvclxyXG4gICAgICBiZWZvcmUgPSBuZXcgTnVtYmVyKE1hdGguZmxvb3IodG1wKSkudG9GaXhlZCgpXHJcbiAgICAgIGFmdGVyID0gbmV3IE51bWJlcihNYXRoLmNlaWwodG1wKSkudG9GaXhlZCgpXHJcbiAgICAgIGF0UG9pbnQgPSB0bXAgLSBiZWZvcmVcclxuICAgICAgbmV3RGF0YVtpXSA9IEBsaW5lYXJJbnRlcnBvbGF0ZShkYXRhW2JlZm9yZV0sIGRhdGFbYWZ0ZXJdLCBhdFBvaW50KVxyXG4gICAgICBpKytcclxuICAgIG5ld0RhdGFbZml0Q291bnQgLSAxXSA9IGRhdGFbZGF0YS5sZW5ndGggLSAxXVxyXG4gICAgbmV3RGF0YVxyXG5cclxuXHJcbiAgcHV0RGF0YUludG9XYXZlQmxvY2s6ICgpIC0+XHJcbiAgICBpV2F2ZUJsb2NrID0gQHdhdmVXaWR0aCArIEBpR3V0dGVyV2lkdGhcclxuICAgIGRhdGEgPSBAZ2V0RGF0YSgpXHJcbiAgICBuZXdEYXRhQmxvY2tzID0gW11cclxuICAgIGlXYXZlQ291bnQgPSBNYXRoLmNlaWwgZGF0YS5sZW5ndGggLyBpV2F2ZUJsb2NrXHJcbiAgICBpID0gMFxyXG5cclxuICAgIHdoaWxlIGkgPCBpV2F2ZUNvdW50XHJcbiAgICAgIHN1bSA9IDBcclxuICAgICAgaiA9IDBcclxuICAgICAgd2hpbGUgaiA8IGlXYXZlQmxvY2tcclxuICAgICAgICBrZXkgPSAoaSAqIGlXYXZlQmxvY2spICsgalxyXG4gICAgICAgIHN1bSArPSBkYXRhW2tleV1cclxuICAgICAgICBqKytcclxuXHJcbiAgICAgIGZBdmVyYWdlID0gKHN1bSAvIGlXYXZlQmxvY2sgKVxyXG4gICAgICBmQWJzVmFsdWUgPSBmQXZlcmFnZSAqIEB3YXZlSGVpZ2h0XHJcbiAgICAgICMgcHVzaCBpdCBpbnRvIHRoZSBuZXcgYmxvY2tcclxuICAgICAgZldhdmVQb2ludCA9IE1hdGguZmxvb3IoLU1hdGguYWJzKGZBYnNWYWx1ZSkpXHJcbiAgICAgIG5ld0RhdGFCbG9ja3MucHVzaCBmV2F2ZVBvaW50XHJcblxyXG4gICAgICAjXHRcdFx0bmV3RGF0YUJsb2Nrcy5wdXNoIE1hdGguYWJzIGZBdmVyYWdlXHJcbiAgICAgIGkrK1xyXG4gICAgIyAuLi5cclxuXHJcbiAgICBuZXdEYXRhQmxvY2tzXHJcblxyXG5cclxuICBjYWNoZTogKCkgLT5cclxuICAgIGlmIEBpbnRlcnBvbGF0ZSA9PSBmYWxzZVxyXG4gICAgICBAc2V0RGF0YUNyb3BwZWQgQGRhdGFcclxuICAgIGVsc2VcclxuICAgICAgQHNldERhdGFJbnRlcnBvbGF0ZWQgQGRhdGFcclxuXHJcbiAgICAjIHNwbGl0IHRoZSBkYXRhIGludG8gd2F2ZXMgY29sbGVjdGlvblxyXG4gICAgQHdhdmVzQ29sbGVjdGlvbiA9IEBwdXREYXRhSW50b1dhdmVCbG9jayBAZGF0YVxyXG5cclxuICAgIHJldHVyblxyXG5cclxuXHJcbiAgIyMjXHJcbiAgICBEYXRhIHVwZGF0ZSBkZXRhaWxzIGhlcmVcclxuICAjIyNcclxuICB1cGRhdGU6IChvcHRpb25zKSAtPlxyXG4gICAgaWYgb3B0aW9uc1xyXG4gICAgICBpZiBvcHRpb25zLmd1dHRlcldpZHRoXHJcbiAgICAgICAgQGd1dHRlcldpZHRoID0gb3B0aW9ucy5ndXR0ZXJXaWR0aFxyXG4gICAgICBpZiBvcHRpb25zLndhdmVXaWR0aFxyXG4gICAgICAgIEB3YXZlV2lkdGggPSBvcHRpb25zLndhdmVXaWR0aFxyXG4gICAgICBpZiBvcHRpb25zLndpZHRoXHJcbiAgICAgICAgQHdpZHRoID0gb3B0aW9ucy53aWR0aFxyXG4gICAgICAgIEBjYW52YXMud2lkdGggPSBAd2lkdGhcclxuICAgICAgaWYgb3B0aW9ucy5oZWlnaHRcclxuICAgICAgICBAaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHRcclxuICAgICAgICBAY2FudmFzLmhlaWdodCA9IEBoZWlnaHRcclxuICAgICAgaWYgb3B0aW9ucy5yZWZsZWN0aW9uID09IDAgb3Igb3B0aW9ucy5yZWZsZWN0aW9uXHJcbiAgICAgICAgQHJlZmxlY3Rpb24gPSBvcHRpb25zLnJlZmxlY3Rpb25cclxuICAgICAgaWYgb3B0aW9ucy5pbnRlcnBvbGF0ZVxyXG4gICAgICAgIEBpbnRlcnBvbGF0ZSA9IEBvcHRpb25zLmludGVycG9sYXRlXHJcbiAgICAgICMjI1xyXG4gICAgICAgIFJlLWNhbGN1bGF0ZSB0aGUgd2F2ZSBibG9jayBmb3JtYXRpb25zIG9uY2Ugb25lIG9mIHRoZSBmb2xsb3dpbmcgaXMgYWx0ZXJlZFxyXG4gICAgICAjIyNcclxuICAgICAgaWYgb3B0aW9ucy5ndXR0ZXJXaWR0aCBvciBvcHRpb25zLndhdmVXaWR0aCBvciBvcHRpb25zLndpZHRoIG9yIG9wdGlvbnMuaGVpZ2h0IG9yIG9wdGlvbnMucmVmbGVjdGlvbiBvciBvcHRpb25zLmludGVycG9sYXRlIG9yIG9wdGlvbnMucmVmbGVjdGlvbiA9PSAwXHJcbiAgICAgICAgQGNhY2hlKClcclxuICAgICAgaWYgb3B0aW9ucy5oZWlnaHQgb3Igb3B0aW9ucy5yZWZsZWN0aW9uIG9yIG9wdGlvbnMucmVmbGVjdGlvbiA9PSAwXHJcbiAgICAgICAgQHVwZGF0ZUhlaWdodCgpXHJcblxyXG4gICAgI3JlZHJhdyB0aGUgd2F2ZWZvcm1cclxuICAgIEByZWRyYXcoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHVwZGF0ZUhlaWdodDogKCkgLT5cclxuICAgIEB3YXZlT2Zmc2V0ID0gTWF0aC5yb3VuZChAaGVpZ2h0IC0gKEBoZWlnaHQgKiBAcmVmbGVjdGlvbikpXHJcbiAgICBAcmVmbGVjdGlvbkhlaWdodCA9IE1hdGgucm91bmQoQGhlaWdodCAtIEB3YXZlT2Zmc2V0KVxyXG4gICAgQHdhdmVIZWlnaHQgPSBAaGVpZ2h0IC0gQHJlZmxlY3Rpb25IZWlnaHRcclxuICAgIHJldHVyblxyXG5cclxuIyBwYXRjaENhbnZhc0ZvcklFID0gKGNhbnZhcykgLT5cclxuIyBcdG9sZEdldENvbnRleHQgPSB1bmRlZmluZWRcclxuIyBcdGlmIHR5cGVvZiB3aW5kb3cuR192bWxDYW52YXNNYW5hZ2VyICE9ICd1bmRlZmluZWQnXHJcbiMgXHRcdGNhbnZhcyA9IHdpbmRvdy5HX3ZtbENhbnZhc01hbmFnZXIuaW5pdEVsZW1lbnQoY2FudmFzKVxyXG4jIFx0XHRvbGRHZXRDb250ZXh0ID0gY2FudmFzLmdldENvbnRleHRcclxuIyBcdFx0cmV0dXJuXHJcbiMgXHRcdFx0Y2FudmFzLmdldENvbnRleHQgPSAoYSkgLT5cclxuIyBcdFx0XHRcdGN0eCA9IHVuZGVmaW5lZFxyXG4jIFx0XHRcdFx0Y3R4ID0gb2xkR2V0Q29udGV4dC5hcHBseShjYW52YXMsIGFyZ3VtZW50cylcclxuIyBcdFx0XHRcdGNhbnZhcy5nZXRDb250ZXh0ID0gb2xkR2V0Q29udGV4dFxyXG4jIFx0XHRcdFx0Y3R4XHJcbiMgXHRyZXR1cm5cclxuXHJcbiAgY3JlYXRlQ2FudmFzOiAoY29udGFpbmVyLCB3aWR0aCwgaGVpZ2h0KSAtPlxyXG4gICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcImNhbnZhc1wiXHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQgY2FudmFzXHJcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aFxyXG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodFxyXG4gICAgcmV0dXJuIGNhbnZhc1xyXG5cclxuXHJcbiAgIyMjXHJcbiAgICBFdmVudHMgcmVsYXRlZFxyXG4jIyNcclxuICBnZXRNb3VzZUNsaWNrUG9zaXRpb246IChldnQpLT5cclxuICAgIGNhbnZhcyA9IEBjYW52YXNcclxuICAgIHJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICAgICMgIHtcclxuICAgICMgIHg6IGV2dC5jbGllbnRYIC0gKHJlY3QubGVmdClcclxuICAgICMgIHk6IGV2dC5jbGllbnRZIC0gKHJlY3QudG9wKVxyXG4gICAgIyAgfVxyXG4gICAgeCA9IE1hdGgucm91bmQoKGV2dC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAvIChyZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0KSAqIGNhbnZhcy53aWR0aClcclxuICAgIHkgPSBNYXRoLnJvdW5kKChldnQuY2xpZW50WSAtIHJlY3QudG9wKSAvIChyZWN0LmJvdHRvbSAtIHJlY3QudG9wKSAqIGNhbnZhcy5oZWlnaHQpXHJcbiAgICByZXR1cm4gW3gsIHldXHJcblxyXG4gIGNhbGNQZXJjZW50OiAtPlxyXG4gICAgTWF0aC5yb3VuZCBAY2xpY2tQZXJjZW50ICogQHdpZHRoIC8gKEB3YXZlV2lkdGggKyBAaUd1dHRlcldpZHRoKVxyXG5cclxuICAjIG5ldyBmaXJlIGV2ZW50IHRvIHVzZSBvYnNlcnZhYmxlc1xyXG4gIGZpcmVFdmVudDogKG5hbWUsIGRhdGEuLi4pIC0+XHJcbiAgICBAbm90aWZ5KG5hbWUsIGRhdGEpXHJcbiAgICByZXR1cm5cclxuXHJcbiMgYmluZCB0aGUgZXZlbnQgaGFuZGxlcnNcclxuICBiaW5kRXZlbnRIYW5kbGVyczogKCkgLT5cclxuICAgIEBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgQG9uTW91c2VEb3duKVxyXG4gICAgQGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBAb25Nb3VzZU92ZXIpXHJcbiAgICBAY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgQG9uTW91c2VPdXQpXHJcbiAgICBAY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBAb25Nb3VzZVVwKVxyXG5cclxuXHJcbiAgb25Nb3VzZU91dDogKGUpID0+XHJcbiAgICBAc2VsZWN0ZWQgPSAtMVxyXG4gICAgQHJlZHJhdygpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgb25Nb3VzZVVwOiAoZSkgPT5cclxuICAgIEBpc0RyYWdnaW5nID0gZmFsc2VcclxuICAgIHJldHVyblxyXG5cclxuICBvbk1vdXNlT3ZlcjogKGUpID0+XHJcbiAgICAjIGRvIG5vdCBwZXJmb3JtIGhvdmVyIGFuaW1hdGlvbiBpZiB3YXZlZm9ybSBpcyBwYXVzZWRcclxuICAgIGlmIEBoYXNTdGFydGVkUGxheWluZyBpcyBvbiBhbmQgQGlzUGF1c2VkKCkgaXMgb25cclxuICAgICAgcmV0dXJuIG9uXHJcblxyXG4gICAgYVBvcyA9IEBnZXRNb3VzZUNsaWNrUG9zaXRpb24oZSlcclxuICAgIHggPSBhUG9zWzBdXHJcblxyXG4gICAgd2F2ZUNsaWNrZWQgPSBAZ2V0V2F2ZUNsaWNrZWQoeClcclxuICAgIG1vdXNlUG9zVHJhY2tUaW1lID0gQGdldE1vdXNlUG9zVHJhY2tUaW1lKHgpXHJcbiAgICBAZmlyZUV2ZW50IFdhdmVmb3JtLkVWRU5UX0hPVkVSLCBtb3VzZVBvc1RyYWNrVGltZSwgd2F2ZUNsaWNrZWRcclxuXHJcblxyXG4gICAgaWYgQGlzRHJhZ2dpbmcgPT0gdHJ1ZVxyXG4gICAgICBAc2VsZWN0ZWQgPSAtMVxyXG4gICAgICBAY2xpY2tQZXJjZW50ID0geCAvIEB3aWR0aFxyXG4gICAgICBAYWN0aXZlID0gQGNhbGNQZXJjZW50KClcclxuICAgIGVsc2VcclxuICAgICAgQHNlbGVjdGVkID0gd2F2ZUNsaWNrZWRcclxuICAgIEByZWRyYXcoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIG9uTW91c2VEb3duOiAoZSkgPT5cclxuICAgIEBpc0RyYWdnaW5nID0gdHJ1ZVxyXG4gICAgYVBvcyA9IEBnZXRNb3VzZUNsaWNrUG9zaXRpb24oZSlcclxuICAgIHggPSBhUG9zWzBdXHJcbiAgICBAY2xpY2tQZXJjZW50ID0geCAvIEB3aWR0aFxyXG5cclxuICAgICMgdGhpcyB3aWxsIGZpcmUgdGhlIHBlcmNlbnRhZ2UgY2xpY2tlZCBvbiB0aGUgd2F2ZWZvcm1cclxuICAgIEBmaXJlRXZlbnQgV2F2ZWZvcm0uRVZFTlRfQ0xJQ0ssIChAY2xpY2tQZXJjZW50ICogMTAwKVxyXG4gICAgQGFjdGl2ZSA9IEBjYWxjUGVyY2VudCgpXHJcblxyXG4gICAgQHJlZHJhdygpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgIyMjXHJcbiAgICB0aGlzIGlzIHRvIHNpbXVsYXRlIHBsYXlcclxuIyMjXHJcbiAgc2V0UGxheWluZyA6ICh2YWwgPSBvbikgLT5cclxuICAgIEBpc1BsYXlpbmcgPSB2YWxcclxuICAgIHJldHVyblxyXG5cclxuICBzZXRQYXVzZWQgOiAoKSAtPlxyXG4gICAgQHNldFBsYXlpbmcgb2ZmXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaXNQYXVzZWQgOiAoKSAtPlxyXG4gICAgQGFjdGl2ZSA+IDAgYW5kIEBpc1BsYXlpbmcgaXMgb2ZmXHJcblxyXG4gICMgYW4gYWxpYXMgdG8gcGxheSBwcm9ncmVzc1xyXG4gIHBsYXk6IChwZXJjdCkgLT5cclxuICAgIEBwbGF5UHJvZ3Jlc3MocGVyY3QpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcGF1c2U6ICgpIC0+XHJcbiAgICBAc2V0UGF1c2VkKClcclxuICAgIGNvbnNvbGUubG9nIFwiaXMgcGF1c2VkIGlzIFwiLCBAaXNQYXVzZWQoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHBsYXlQcm9ncmVzczogKHBlcmN0KSAtPlxyXG4gICAgIyBpbmRpY2F0ZSB0aGF0IGl0IGhhcyBzdGFydGVkIHBsYXlpbmdcclxuICAgIGlmIEBoYXNTdGFydGVkUGxheWluZyBpcyBudWxsXHJcbiAgICAgIEBoYXNTdGFydGVkUGxheWluZyA9IG9uXHJcblxyXG4gICAgIyBzZXQgcGxheWluZyB0byB0cnVlXHJcbiAgICBpZiBAaXNQbGF5aW5nIGlzIG9mZlxyXG4gICAgICBAc2V0UGxheWluZyBvblxyXG5cclxuICAgIGlBY3RpdmUgPSBNYXRoLnJvdW5kKChwZXJjdCAvIDEwMCApICogQHdhdmVzQ29sbGVjdGlvbi5sZW5ndGgpXHJcbiAgICBAYWN0aXZlID0gaUFjdGl2ZVxyXG4gICAgQHJlZHJhdygpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgIyB0aGlzIGlzIHJlbGF0aXZlIHRvIHRoZSB3YXZlcyBjb2xsZWN0aW9uXHJcbiAgY2FsY1BlcmNlbnQ6IC0+XHJcbiAgICBNYXRoLnJvdW5kIEBjbGlja1BlcmNlbnQgKiBAd2lkdGggLyAoQHdhdmVXaWR0aCArIEBpR3V0dGVyV2lkdGgpXHJcblxyXG5cclxuICBnZXRXYXZlQ2xpY2tlZDogKHgpIC0+XHJcbiAgICB3YXZlQ2xpY2tlZCA9IE1hdGgucm91bmQoeCAvIChAd2F2ZVdpZHRoICsgQGlHdXR0ZXJXaWR0aCkpXHJcbiAgICB3YXZlc0NvbGxlY3Rpb24gPSBAd2F2ZXNDb2xsZWN0aW9uXHJcbiAgICBmUmV0dXJuID0gMFxyXG4gICAgaWYgd2F2ZUNsaWNrZWQgPiB3YXZlc0NvbGxlY3Rpb24ubGVuZ3RoXHJcbiAgICAgIGZSZXR1cm4gPSB3YXZlc0NvbGxlY3Rpb24ubGVuZ3RoXHJcbiAgICBlbHNlIGlmIHdhdmVDbGlja2VkIDwgMFxyXG4gICAgICBmUmV0dXJuID0gMFxyXG4gICAgZWxzZVxyXG4gICAgICBmUmV0dXJuID0gd2F2ZUNsaWNrZWRcclxuXHJcbiAgICBmUmV0dXJuXHJcblxyXG4gIGdldE1vdXNlUG9zVHJhY2tUaW1lOiAoeCkgLT5cclxuICAgIG1vdXNlUG9zVHJhY2tUaW1lID0gQHRyYWNrTGVuZ3RoIC8gQHdhdmVzQ29sbGVjdGlvbi5sZW5ndGggKiBAZ2V0V2F2ZUNsaWNrZWQoeClcclxuICAgIGZSZXR1cm4gPSAwXHJcbiAgICBpZiBtb3VzZVBvc1RyYWNrVGltZSA+IEB0cmFja0xlbmd0aFxyXG4gICAgICBmUmV0dXJuID0gQHRyYWNrTGVuZ3RoXHJcbiAgICBlbHNlIGlmIG1vdXNlUG9zVHJhY2tUaW1lIDwgMFxyXG4gICAgICBmUmV0dXJuID0gMFxyXG4gICAgZWxzZVxyXG4gICAgICBmUmV0dXJuID0gbW91c2VQb3NUcmFja1RpbWVcclxuICAgIGZSZXR1cm5cclxuXHJcblxyXG4jaWYgdHlwZW9mIG1vZHVsZSBpcyBcIm9iamVjdFwiIGFuZCBtb2R1bGUuZXhwb3J0cyB0aGVuIGBleHBvcnQgZGVmYXVsdCBXYXZlZm9ybWBcclxuI2BleHBvcnQgZGVmYXVsdCBXYXZlZm9ybWAiXX0=

return Waveform;

}));
