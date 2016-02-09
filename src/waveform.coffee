Observant = require('observant')
###
    requestAnimFrame shim
  copy the one from paul irish
###
window.requestAnimFrame = do ->
  window.requestAnimationFrame or window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame or window.oRequestAnimationFrame or window.msRequestAnimationFrame or (callback) ->
    window.setTimeout callback, 1000 / 30
    return

#    start of waveform class
class Waveform extends Observant

  ###
  create color constants
  ###
  Waveform.WAVE_FOCUS = 'wave-focus'
  Waveform.WAVE = 'wave'
  Waveform.WAVE_ACTIVE = 'wave-active'
  Waveform.WAVE_SELECTED = 'wave-selected'
  Waveform.GUTTER = 'gutter'
  Waveform.GUTTER_ACTIVE = 'gutter-active'
  Waveform.GUTTER_SELECTED = 'gutter-selected'
  Waveform.REFLECTION = 'reflection'
  Waveform.REFLECTION_ACTIVE = 'reflection-active'

  ###
  create events constants
  ###
  Waveform.EVENT_READY = "ready"
  Waveform.EVENT_CLICK = "click"
  Waveform.EVENT_HOVER = "hover"
  Waveform.EVENT_RESIZED = "hover"

  constructor: (options) ->
# initiate observable
    super()

    @container = options.container
    @canvas = options.canvas

    @data = options.data or []
    @wavesCollection = @data

    @outerColor = options.outerColor or 'transparent'
    @reflection = options.reflection or 0
    @interpolate = options.interpolate or true
    @bindResize  = options.bindResize or false

    ###
      Cater for data interpolation right here
    ###
    if options.interpolate == false
      @interpolate = false
    if not @canvas
      if @container
        @canvas = @createCanvas(@container, options.width or @container.clientWidth,
          options.height or @container.clientHeight)
      else
        throw 'Either canvas or container option must be passed'

    # add this for real in production to support IE
    # @patchCanvasForIE @canvas

    @context = @canvas.getContext('2d')
    @width = parseInt(@context.canvas.width, 10)
    @height = parseInt(@context.canvas.height, 10)


    #custom Talk
    @waveWidth = 2
    @iGutterWidth = 1
    @colors = {}
    # holds events
    @events = {}

    #active = highlighted section of track
    @active = -1

    #slected = dimmer highlighted selections
    @selected = -1

    #mouse dragging
    @isDragging = false

    #is playing
    @isPlaying = false
    @hasStartedPlaying = null

    #is in focus
    @isFocus = false

    # kick-start the process
    @initialize()

    return

  # initialize the whole process
  initialize: () ->
    # update height
    @updateHeight()

    # set the colors
    @setColors()


    # bind the event handler
    @bindEventHandlers()

    # Cache the waveform data
    @cache()

    # draw the waveform
    @redraw()

    # bind event for container redraw
    if @bindResize is on then @bindContainerResize()

    @fireEvent(Waveform.EVENT_READY)

    return



  ###
    this will make sure the container is bound to resize event
  ###
  bindContainerResize: () ->
    window.addEventListener("resize", ()=>
      iContWidth = @container.clientWidth
      @update(width:iContWidth )
      @redraw()
      @notify(Waveform.EVENT_RESIZED, iContWidth)
    )
    return


  ###
    this method will set the colors to the main colors
  ###
  setColors: () ->
    @setColor(Waveform.WAVE_FOCUS, '#333333')
    @setGradient(Waveform.WAVE, ['#666666', 0, '#868686', 1])
    @setGradient(Waveform.WAVE_ACTIVE, ['#FF3300', 0, '#FF5100', 1])
    @setGradient(Waveform.WAVE_SELECTED, ['#993016', 0, '#973C15', 1])
    @setGradient(Waveform.GUTTER, ['#6B6B6B', 0, '#c9c9c9', 1])
    @setGradient(Waveform.GUTTER_ACTIVE, ['#FF3704', 0, '#FF8F63', 1])
    @setGradient(Waveform.GUTTER_SELECTED, ['#9A371E', 0, '#CE9E8A', 1])
    @setColor(Waveform.REFLECTION, '#999999')
    @setColor(Waveform.REFLECTION_ACTIVE, '#FFC0A0')

    return

  setColor: (name, color) ->
    @colors[name] = color

  setGradient: (name, colors) ->
    gradient = @context.createLinearGradient(0, @waveOffset, 0, 0)
    i = 0

    while i < colors.length
      gradient.addColorStop colors[i + 1], colors[i]
      i += 2
    @colors[name] = gradient
    return





  ###
   This will draw the waveform
  ###
  redraw: () ->
    requestAnimationFrame (@render)
    return


# this will draw the waveform really
  render: () =>


    i = 0
    ref = @wavesCollection


    t = @width / @data.length

    # this should be reconsidered
    xPos = 0 # start from farthest left
    yPos = @waveOffset


    # clear the entire canvas for redraw
    @clear()

    j = 0
    len = ref.length
    while j < len
      d = ref[j]
      dNext = ref[j + 1]

      ###
      Draw the wave here
      ###
      if @selected > 0 and (@selected <= j and j < @active) or (@selected > j and j >= @active)
        @context.fillStyle = @colors[Waveform.WAVE_SELECTED]
      else if @active > j
        @context.fillStyle = @colors[Waveform.WAVE_ACTIVE]
      else
        @context.fillStyle = @colors[Waveform.WAVE_FOCUS]
      @context.fillRect xPos, yPos, @waveWidth, d


      ###
      draw the gutter
      ###
      # if is hovered
      if @selected > 0 and (@selected <= j and j < @active) or (@selected > j and j >= @active)
        @context.fillStyle = @colors[Waveform.GUTTER_SELECTED]
      else if @active > j
        @context.fillStyle = @colors[Waveform.GUTTER_ACTIVE]
      else
        @context.fillStyle = @colors[Waveform.GUTTER]
      # smallest wave between butter is gutters height
      # note: Math.max because wave values are negative
      gutterX = Math.max d, dNext
      @context.fillRect(xPos + @waveWidth, yPos, @iGutterWidth, gutterX)


      ###
       draw the reflection
      ###
      # reflection wave
      if @reflection > 0
        reflectionHeight = Math.abs(d) / (1 - (@reflection)) * @reflection
        if @active > i
          @context.fillStyle = @colors[Waveform.REFLECTION_ACTIVE]
        else
          @context.fillStyle = @colors[Waveform.REFLECTION]

        # draw reflection
        @context.fillRect xPos, yPos, @waveWidth, reflectionHeight

      #increment the x-axis position
      xPos += @waveWidth + @iGutterWidth

      j++


  clear: () ->
    @context.fillStyle = @outerColor
    @context.clearRect(0, 0, @width, @height)
    @context.fillRect(0, 0, @width, @height)


  ###
   Data related codes
  ###

  setData: (data) ->
    @data = data

  getData: () ->
    @data

  setDataInterpolated: (data) ->
    @setData @interpolateArray(data, @width)

  setDataCropped: (data) ->
    @setData @expandArray(data, @width)

  linearInterpolate: (before, after, atPoint) ->
    before + (after - before) * atPoint;

  expandArray: (data, limit, defaultValue) ->
    i = undefined
    j = undefined
    newData = undefined
    ref = undefined
    if defaultValue == null
      defaultValue = 0.0
    newData = []

    if data.length > limit
      newData = data.slice(data.length - limit, data.length)
    else
      i = j = 0
      ref = limit - 1
      while (if 0 <= ref then j <= ref else j >= ref)
        newData[i] = data[i] or defaultValue
        i = (if 0 <= ref then ++j else --j)
    newData


  interpolateArray: (data, fitCount) ->
    after = undefined
    atPoint = undefined
    before = undefined
    i = undefined
    newData = undefined
    springFactor = undefined
    tmp = undefined
    newData = []
    springFactor = new Number((data.length - 1) / (fitCount - 1))
    newData[0] = data[0]
    i = 1
    while i < fitCount - 1
      tmp = i * springFactor
      before = new Number(Math.floor(tmp)).toFixed()
      after = new Number(Math.ceil(tmp)).toFixed()
      atPoint = tmp - before
      newData[i] = @linearInterpolate(data[before], data[after], atPoint)
      i++
    newData[fitCount - 1] = data[data.length - 1]
    newData


  putDataIntoWaveBlock: () ->
    iWaveBlock = @waveWidth + @iGutterWidth
    data = @getData()
    newDataBlocks = []
    iWaveCount = Math.ceil data.length / iWaveBlock
    i = 0

    while i < iWaveCount
      sum = 0
      j = 0
      while j < iWaveBlock
        key = (i * iWaveBlock) + j
        sum += data[key]
        j++

      fAverage = (sum / iWaveBlock )
      fAbsValue = fAverage * @waveHeight
      # push it into the new block
      fWavePoint = Math.floor(-Math.abs(fAbsValue))
      newDataBlocks.push fWavePoint

      #			newDataBlocks.push Math.abs fAverage
      i++
    # ...

    newDataBlocks


  cache: () ->
    if @interpolate == false
      @setDataCropped @data
    else
      @setDataInterpolated @data

    # split the data into waves collection
    @wavesCollection = @putDataIntoWaveBlock @data

    return


  ###
    Data update details here
  ###
  update: (options) ->
    if options
      if options.gutterWidth
        @gutterWidth = options.gutterWidth
      if options.waveWidth
        @waveWidth = options.waveWidth
      if options.width
        @width = options.width
        @canvas.width = @width
      if options.height
        @height = options.height
        @canvas.height = @height
      if options.reflection == 0 or options.reflection
        @reflection = options.reflection
      if options.interpolate
        @interpolate = @options.interpolate
      ###
        Re-calculate the wave block formations once one of the following is altered
      ###
      if options.gutterWidth or options.waveWidth or options.width or options.height or options.reflection or options.interpolate or options.reflection == 0
        @cache()
      if options.height or options.reflection or options.reflection == 0
        @updateHeight()

    #redraw the waveform
    @redraw()
    return

  updateHeight: () ->
    @waveOffset = Math.round(@height - (@height * @reflection))
    @reflectionHeight = Math.round(@height - @waveOffset)
    @waveHeight = @height - @reflectionHeight
    return

# patchCanvasForIE = (canvas) ->
# 	oldGetContext = undefined
# 	if typeof window.G_vmlCanvasManager != 'undefined'
# 		canvas = window.G_vmlCanvasManager.initElement(canvas)
# 		oldGetContext = canvas.getContext
# 		return
# 			canvas.getContext = (a) ->
# 				ctx = undefined
# 				ctx = oldGetContext.apply(canvas, arguments)
# 				canvas.getContext = oldGetContext
# 				ctx
# 	return

  createCanvas: (container, width, height) ->
    canvas = document.createElement "canvas"
    container.appendChild canvas
    canvas.width = width
    canvas.height = height
    return canvas


  ###
    Events related
###
  getMouseClickPosition: (evt)->
    canvas = @canvas
    rect = canvas.getBoundingClientRect()
    #  {
    #  x: evt.clientX - (rect.left)
    #  y: evt.clientY - (rect.top)
    #  }
    x = Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width)
    y = Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
    return [x, y]

  calcPercent: ->
    Math.round @clickPercent * @width / (@waveWidth + @iGutterWidth)

  # new fire event to use observables
  fireEvent: (name, data...) ->
    @notify(name, data)
    return

# bind the event handlers
  bindEventHandlers: () ->
    @canvas.addEventListener('mousedown', @onMouseDown)
    @canvas.addEventListener('mousemove', @onMouseOver)
    @canvas.addEventListener('mouseout', @onMouseOut)
    @canvas.addEventListener('mouseup', @onMouseUp)


  onMouseOut: (e) =>
    @selected = -1
    @redraw()
    return

  onMouseUp: (e) =>
    @isDragging = false
    return

  onMouseOver: (e) =>
    # do not perform hover animation if waveform is paused
    if @hasStartedPlaying is on and @isPaused() is on
      return on

    aPos = @getMouseClickPosition(e)
    x = aPos[0]

    waveClicked = @getWaveClicked(x)
    mousePosTrackTime = @getMousePosTrackTime(x)
    @fireEvent Waveform.EVENT_HOVER, mousePosTrackTime, waveClicked


    if @isDragging == true
      @selected = -1
      @clickPercent = x / @width
      @active = @calcPercent()
    else
      @selected = waveClicked
    @redraw()
    return

  onMouseDown: (e) =>
    @isDragging = true
    aPos = @getMouseClickPosition(e)
    x = aPos[0]
    @clickPercent = x / @width

    # this will fire the percentage clicked on the waveform
    @fireEvent Waveform.EVENT_CLICK, (@clickPercent * 100)
    @active = @calcPercent()

    @redraw()
    return

  ###
    this is to simulate play
###
  setPlaying : (val = on) ->
    @isPlaying = val
    return

  setPaused : () ->
    @setPlaying off
    return

  isPaused : () ->
    @active > 0 and @isPlaying is off

  # an alias to play progress
  play: (perct) ->
    @playProgress(perct)
    return

  pause: () ->
    @setPaused()
    console.log "is paused is ", @isPaused()
    return

  playProgress: (perct) ->
    # indicate that it has started playing
    if @hasStartedPlaying is null
      @hasStartedPlaying = on

    # set playing to true
    if @isPlaying is off
      @setPlaying on

    iActive = Math.round((perct / 100 ) * @wavesCollection.length)
    @active = iActive
    @redraw()
    return

  # this is relative to the waves collection
  calcPercent: ->
    Math.round @clickPercent * @width / (@waveWidth + @iGutterWidth)


  getWaveClicked: (x) ->
    waveClicked = Math.round(x / (@waveWidth + @iGutterWidth))
    wavesCollection = @wavesCollection
    fReturn = 0
    if waveClicked > wavesCollection.length
      fReturn = wavesCollection.length
    else if waveClicked < 0
      fReturn = 0
    else
      fReturn = waveClicked

    fReturn

  getMousePosTrackTime: (x) ->
    mousePosTrackTime = @trackLength / @wavesCollection.length * @getWaveClicked(x)
    fReturn = 0
    if mousePosTrackTime > @trackLength
      fReturn = @trackLength
    else if mousePosTrackTime < 0
      fReturn = 0
    else
      fReturn = mousePosTrackTime
    fReturn


#if typeof module is "object" and module.exports then `export default Waveform`
#`export default Waveform`