/**
* @license ap-scroll-top.js v0.2
* Updated: 05.01.2016
* jQuery plugin for embedding a "Scroll to Top" element to website, with position fixed
* Copyright (c) 2015 armin pfaeffle
* Released under the MIT license
* http://armin-pfaeffle.de/licenses/mit
*/


;(function($) {

    var cssPrefix = 'apst-';
	var eventNamespace = 'apst';
    var triggerEventPrefix = 'apst';
    var _instance;

	/**
	 * Makes the first character of str uppercase and returns that string.
	 */
	function ucfirst(str) {
		str += ''; // ensure that str is a string
		var c = str[0].toUpperCase();
		return c + str.substr(1);
	}

	/**
	 * Adds ucfirst() method to String class. Makes the first character
	 * of str uppercase and returns that string.
	 */
	if (!String.prototype.ucfirst) {
		String.prototype.ucfirst = function() {
			return ucfirst(this);
		};
	}



	/**
	 * Constructor for ApScrollTop plugin.
	 */
	function ApScrollTop(options) {
		this.settings = $.extend(true, {}, ApScrollTop.defaultSettings, options);
		this._init();
        _instance = this;
	}

    /**
     *
     */
    ApScrollTop.prototype = {

		/**
		 *
		 */
		_init: function() {
			var self = this;

            this._addScrollTopElement();
			this._registerScrollEvent();
            this._updateCssClasses();
            this._updatePosition();
            this._updateScrollElementVisibility();

            this._trigger('init');
        },

        /**
         *
         */
        _addScrollTopElement: function() {
            var self = this;

            if (typeof this.settings.customButton == 'function') {
                this._scrollTopWrapper = this.settings.customButton(this.settings);
            } else {
                this._scrollTopWrapper = $('<div></div>', { class: cssPrefix + 'wrapper' });
                this._scrollTopButton = $('<div></div>', { class: cssPrefix + 'button' });
                this._scrollTopWrapper.append(this._scrollTopButton);
            }
            this._scrollTopWrapper.data('visible', false);
            $('body').append(this._scrollTopWrapper);

            // Assign button click
            var button = this._getButton();
            button.on('click.' + eventNamespace, function() {
                self.scrollTo();
            });
        },

        /**
         *
         */
        _getButton: function() {
            var button = this._scrollTopWrapper.find('.' + cssPrefix + 'button');
            if (button.length == 0) {
                button = this._scrollTopWrapper;
            }
            return button;
        },

        /**
         *
         */
        _registerScrollEvent: function() {
            var self = this;

            $(document).ready(function() {
                $(window).scroll(function(evt) {
                    self._updateScrollElementVisibility();
                });
            });
        },

        /**
         *
         */
        _updateScrollElementVisibility: function() {
            var self = this;
            if (this.settings.enabled && this._isVisible() && !this._scrollTopWrapper.data('visible')) {
                this._scrollTopWrapper.stop(true, false).fadeIn(this.settings.visibilityFadeSpeed, function() {
                    self._updateCssClasses();
                    self._trigger('toggle', { visible: true });
                });
                this._scrollTopWrapper.data('visible', true);
            }
            else if ((!this._isVisible() && this._scrollTopWrapper.data('visible')) || !this.settings.enabled) {
                this._scrollTopWrapper.stop(true, false).fadeOut(this.settings.visibilityFadeSpeed, function() {
                    self._updateCssClasses();
                    self._trigger('toggle', { visible: false });
                });
                this._scrollTopWrapper.data('visible', false);
            }
        },

        /**
         *
         */
        _isVisible: function() {
            var currentYPos = $(window).scrollTop();
            if (typeof this.settings.visibilityTrigger == 'function') {
                return this.settings.visibilityTrigger(currentYPos);
            }
            else {
                var visibilityBorder = parseInt(this.settings.visibilityTrigger);
                return (currentYPos >= visibilityBorder);
            }
        },

        /**
         *
         */
        _updateCssClasses: function() {
            if (this.settings.enabled) {
                this._scrollTopWrapper.addClass(cssPrefix + 'enabled');
                this._scrollTopWrapper.removeClass(cssPrefix + 'disabled');
            }
            else {
                this._scrollTopWrapper.addClass(cssPrefix + 'disabled');
                this._scrollTopWrapper.removeClass(cssPrefix + 'enabled');
            }

            if (this._scrollTopWrapper.data('visible')) {
                this._scrollTopWrapper.addClass(cssPrefix + 'visible');
                this._scrollTopWrapper.removeClass(cssPrefix + 'hidden');
            }
            else {
                this._scrollTopWrapper.addClass(cssPrefix + 'hidden');
                this._scrollTopWrapper.removeClass(cssPrefix + 'visible');
            }

            if (typeof this.settings.theme == 'string' || this.settings.theme.length > 0) {
                var themeClass = cssPrefix + 'theme-' + this.settings.theme;
                if (!this._scrollTopWrapper.hasClass(themeClass)) {
                    this._scrollTopWrapper.addClass(themeClass);
                }
            }

            this._trigger('cssClassesUpdated');
        },

        /**
         *
         */
        _updatePosition: function() {
            var validPositions = ['top', 'bottom', 'left', 'center', 'right'];
            if (typeof this.settings.position == 'string') {
                var positions = this.settings.position.split(' ')
                for (index in positions) {
                    var cssClass = positions[index].trim();
                    if (validPositions.indexOf(cssClass) > -1) {
                        this._scrollTopWrapper.addClass(cssPrefix + positions[index]);
                    }
                }

                this._trigger('positionUpdated');
            }
        },

		/**
		 *
		 */
		_trigger: function(eventType, args) {
			var optionName = 'on' + eventType.ucfirst(),
				f = this.settings[optionName];
			if (typeof f == 'function') {
				f.apply($(this), args);
			}
			eventType = triggerEventPrefix + eventType.ucfirst();
			$(this).trigger(eventType, args);
		},

		/**
		 *
		 */
		_triggerHandler: function(eventType, args) {
			var optionName = 'on' + eventType.ucfirst(),
				f = this.settings[optionName],
				callbackResult = undefined,
				result;
			if (typeof f == 'function') {
				callbackResult = f.apply($(this), args);
			}
			eventType = triggerEventPrefix + eventType.ucfirst();
			result = ((result = $(this).triggerHandler(eventType, args)) !== undefined ? result : callbackResult);
			return result;
		},

        /**
         *
         */
        enable: function() {
            if (!this.settings.enabled) {
                this.settings.enabled = true;
                this._updateCssClasses();
                this._updateScrollElementVisibility();

                this._trigger('enabled');
            }
        },

        /**
         *
         */
        disable: function() {
            if (this.settings.enabled) {
                this.settings.enabled = false;
                this._updateCssClasses();
                this._updateScrollElementVisibility();

                this._trigger('disabled');
            }
        },

        /**
         *
         */
        scrollTo: function(position, speed) {
            var self = this;

            // Setup position & speed
            position = (position != undefined ? position : 0);
            speed = (speed ? speed : this.settings.scrollSpeed);

            // Call trigger and check if position and speed must be updated
            var result = this._triggerHandler('beforeScrollTo', { position: position, speed: speed });
            if (typeof result == 'number') {
                position = parseInt(result);
            }
            else if (typeof result == 'object') {
                if (result.position) {
                    position = parseInt(result.position);
                }
                if (result.speed) {
                    speed = parseInt(result.speed);
                }
            }

            $('html, body').animate(
                  { scrollTop: position }
                , speed
                , function() {
                    self._trigger('scrolledTo', { position: position });
                });
        },

		/**
		 *
		 */
		option: function(key, value) {
			if (!key) {
				// Return copy of current settings
				return $.extend({}, this.settings);
			}
			else {
				var options;
				if (typeof key == 'string') {
					if (arguments.length === 1) {
						// Return specific value of settings
						return (this.settings[key] !== undefined ? this.settings[key] : null);
					}
					options = {};
					options[key] = value;
				}
				else {
					options = key;
				}
				this._setOptions(options);
			}
		},

		/**
		 *
		 */
		_setOptions: function(options) {
			for (key in options) {
				var value = options[key];

				// Disable/modify plugin before we apply new settings
                if (key == 'position') {
                    this._scrollTopWrapper.removeClass(
                          cssPrefix + 'top '
                        + cssPrefix + 'bottom '
                        + cssPrefix + 'left '
                        + cssPrefix + 'center '
                        + cssPrefix + 'right'
                    );
                }

                if (key == 'theme') {
                    var themeClass = cssPrefix + 'theme-' + this.settings.theme;
                    if (this._scrollTopWrapper.hasClass(themeClass)) {
                        this._scrollTopWrapper.removeClass(themeClass);
                    }
                }

				// Apply option
				this.settings[key] = value;

				// Disable/modify plugin before we apply new settings
                if (['enabled', 'visibilityTrigger', 'theme'].indexOf(key) > -1) {
                    this._updateCssClasses();
                }

                if (['enabled', 'visibilityTrigger'].indexOf(key) > -1) {
                    this._updateScrollElementVisibility();
                }

                if (['position'].indexOf(key) > -1) {
                    this._updatePosition();
                }
			}
		},

        /**
         *
         */
        destroy: function() {
            this._trigger('destroy');
            this._getButton().off('click.' + eventNamespace);
            this._scrollTopWrapper.remove();
        }
    };

    /**
     *
     */
    $.apScrollTop = function( options ) {
        if (!_instance) {
            new ApScrollTop(options);
        }

        if (typeof options === 'string') {
            var method, result;
            var params = Array.prototype.slice.call(arguments, 1);

            // Ignore private methods
            if ((typeof (method = _instance[options]) === 'function') && (options.charAt(0) !== '_')) {
                result = method.apply(_instance, params);
                if (result !== undefined) {
                    return result;
                }
                else {
                    return $(_instance);
                }
            }
        }

        return $(_instance);
    };

    /**
     * Default settings for ApScrollTop plugin.
     */
    ApScrollTop.defaultSettings = {
          enabled: true
        , visibilityTrigger: 100            // px | function
        , visibilityFadeSpeed: 150          // in ms
        , scrollSpeed: 250                  // in ms
        , position: 'right bottom'
        , customButton: undefined           // must be a callback that returns a jquery element
        , theme: 'default'
    };

}(jQuery));
