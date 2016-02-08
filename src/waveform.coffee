###
    requestAnimFrame shim
  copy the one from paul irish
###
window.requestAnimFrame = do ->
  window.requestAnimationFrame or window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame or window.oRequestAnimationFrame or window.msRequestAnimationFrame or (callback) ->
    window.setTimeout callback, 1000 / 30
    return

#    start of waveform class
class Waveform extends Observable

  constructor: (options) ->
# initiate observable
    super()

    # @redraw = __bind(@redraw, this)
    @container = options.container
    @canvas = options.canvas

    @data = options.data or []
    @wavesCollection = @data

    @outerColor = options.outerColor or 'transparent'
    @reflection = options.reflection || 0
    @interpolate = true

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

    #is in focus
    @isFocus = false

    # kick-start the process
    @initialize()

    return

# initialize the whole process
  initialize: () ->
# set the colors
    @setColors()

    # update height
    @updateHeight()

    # bind the event handler
#    @bindEventHandlers()

    # update the process
    @update()

    # draw the waveform
    @redraw()

    # bind event for container redraw
    @bindContainerResize()

    @fireEvent('ready')

    return



  bindContainerResize: () ->
    window.addEventListener("resize", ()=>
      console.log("resive event occured", @container.clientWidth, "outer is #{@outerColor}")
      @clear()
      @width = @container.clientWidth
      @canvas = null;
      @context = null;
      $(@container).empty()

      # create a new canvas
      @canvas = @createCanvas(@container, @width, @container.clientHeight)
      @context = @canvas.getContext('2d')

      @update()
      @redraw()
    )
    return


  setColors: () ->

#
#@todo - style this appropriately
#
#    @setColor('wave-focus', '#00171F')
#    @setGradient('wave', ['#0042A5', 0, '#002B6D', 1])
#    @setColor('wave-active', "#0042A5")
#    @setGradient('wave-selected', ['#993016', 0, '#973C15', 1])
#
#    @setGradient('gutter', ['#6B6B6B', 0, '#c9c9c9', 1])
#    @setGradient('gutter-active', ['#FF3704', 0, '#FF8F63', 1])
#    @setGradient('gutter-selected', ['#9A371E', 0, '#CE9E8A', 1])
#    @setColor('reflection', '#e40615')
#    @setColor('reflection-active', '#fff')

#        => ORIGINAL COLORS SETTINGS <=
    @setColor('wave-focus', '#333333')
    @setGradient('wave', ['#666666', 0, '#868686', 1])
    @setGradient('wave-active', ['#FF3300', 0, '#FF5100', 1])
    @setGradient('wave-selected', ['#993016', 0, '#973C15', 1])
    @setGradient('gutter', ['#6B6B6B', 0, '#c9c9c9', 1])
    @setGradient('gutter-active', ['#FF3704', 0, '#FF8F63', 1])
    @setGradient('gutter-selected', ['#9A371E', 0, '#CE9E8A', 1])
    @setColor('reflection', '#999999')
    @setColor('reflection-active', '#FFC0A0')

    return

  # set the color
  setColor: (name, color) ->
    @colors[name] = color

# check this also
  setGradient: (name, colors) ->
    # calculate the waveoffset correctly -> for now, use
    @iRefelection = 0.3
#    @iRefelection = 0
    @waveOffset = Math.round(@height - (@height * @iRefelection))

    gradient = @context.createLinearGradient(0, @waveOffset, 0, 0)
    i = 0

    while i < colors.length
      gradient.addColorStop colors[i + 1], colors[i]
      i += 2
    @colors[name] = gradient
    return


  updateHeight: () ->
    @waveOffset = Math.round(@height - (@height * @reflection))
    @reflectionHeight = Math.round(@height - @waveOffset)
    @waveHeight = @height - @reflectionHeight
    return


  redraw: () ->
    requestAnimationFrame (@render)
#    @render()
    return


  # this will draw the waveform really
  render: () =>
    d = undefined
    i = undefined
    j = undefined
    len = undefined
    ref = undefined
    results = undefined
    t = undefined
    @clear()


    i = 0
    #ref = @data
    # use pushed block instead
    ref = @wavesCollection


    t = @width / @data.length

    # this should be reconsidered
    xPos = 0 # start from farthest left
    yPos = @waveOffset


    # clear the entire canvas for redraw
    @context.clearRect xPos, yPos, @width, @height

    results = []
    j = 0
    len = ref.length
    while j < len
      # start customization from here
      d = ref[j]
      dNext = ref[j + 1]

      ###
      Draw the wave here
      ###
      if @selected > 0 and (@selected <= j and j < @active) or (@selected > j and j >= @active)
        @context.fillStyle = @colors['wave-selected']
      else if @active > j
        @context.fillStyle = @colors['wave-active']
      else
        @context.fillStyle = @colors['wave-focus']
      @context.fillRect xPos, yPos, @waveWidth, d


      ###
      draw the gutter
      ###
      # if is hovered
      if @selected > 0 and (@selected <= j and j < @active) or (@selected > j and j >= @active)
        @context.fillStyle = @colors['gutter-selected']
      else if @active > j
        @context.fillStyle = @colors['gutter-active']
      else
        @context.fillStyle = @colors['gutter']
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
          @context.fillStyle = @colors['reflection-active']
        else
          @context.fillStyle = @colors['reflection']

        # draw reflection
        @context.fillRect xPos, yPos, @waveWidth, reflectionHeight


      results.push i++

      #increment the x-axis position
      xPos += @waveWidth + @iGutterWidth

      j++
    results


  clear: () ->
    @context.fillStyle = @outerColor
    @context.clearRect(0, 0, @width, @height)
    @context.fillRect(0, 0, @width, @height)


  ###
   Data related ideas here
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
    newData = new Array
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


#make a way to call this independently
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


  update: () ->
    if @interpolate == false
      @setDataCropped @data
    else
      @setDataInterpolated @data

    # split the data into waves collection
    @wavesCollection = @putDataIntoWaveBlock @data

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

  oldfireEvent: (name) ->
    if !@events[name]
      return
    args = [].splice.call(arguments, 0)
    args[0] = this
    @events[name].e.forEach (event) ->
      event.apply null, args
      return
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
#		@skipTo()   # check from here
    @isDragging = false
    return

  onMouseOver: (e) =>
    aPos = @getMouseClickPosition(e)
    x = aPos[0]

    waveClicked = @getWaveClicked(x)
    mousePosTrackTime = @getMousePosTrackTime(x)
    @fireEvent 'hover', mousePosTrackTime, waveClicked


    if @isDragging == true
      @selected = -1
      @clickPercent = x / @width
      @active = @calcPercent()
    else
      @selected = waveClicked
    @redraw()
    return

  ###
    this is to simulate play
###
  playProgress: (perct) ->
    iActive = Math.round((perct / 100 ) * @wavesCollection.length)
    @active = iActive
    @redraw()
    return

# this is relative to the waves collection
  calcPercent: ->
    Math.round @clickPercent * @width / (@waveWidth + @iGutterWidth)

  onMouseDown: (e) =>
    @isDragging = true
    aPos = @getMouseClickPosition(e)
    x = aPos[0]
    @clickPercent = x / @width

    # this will fire the percentage clicked on the waveform
    @fireEvent 'click', (@clickPercent * 100)
    @active = @calcPercent()

    @redraw()
    return

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

# - remove this
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

#`export default Waveform`