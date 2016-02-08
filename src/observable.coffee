# OBSERVABLE
###*
# Register an observer.
#
# @param {*}        event     The event name.
# @param {function} observer  The observer function.
###

###*
# Observable interface.
#
# @interface
# @constructor
# @property {Object} observers
###

class Observable
  constructor: () ->
    @observers = {}
    return

  observe: (event, observer) ->
    if !@observers[event]
      @observers[event] = []
    @observers[event].push observer
    this

  ###*
  # Remove observer(s).
  # If the observer parameter is not provided, all observers for the given event will be removed.
  #
  # @param {*}         event     The event name.
  # @param {function=} observer  The observer function.
  ###

  ignore: (event, observer) ->
    index = -1
    # Remove all observers
    if 1 == arguments.length
      delete @observers[event]
      return this
    # Remove one observer
    if @observers[event]
      index = @observers[event].indexOf(observer)
      if -1 != index
        @observers[event][index] = null
    # Can't splice it out, that messes up notify()
    this

  ###*
  # @param {*} event
  # @param {*} data
  ###

  notify: (event, data) ->
    observers = @observers[event]
    if !observers
      return this
    i = 0
    while i < observers.length
      if null != observers[i]
        observers[i] data
      ++i
    i = 0
    while i < observers.length
      if null == observers[i]
        observers.splice i, 1
      ++i
    if 0 == observers.length
      delete @observers[event]
    this
