/**
 * @namespace Simples.OO
 * Can I Simples.OO.exend( Simples.fn.init, myObj, addMethods );
 **/
Simples.OO = {
	useFnBind : function(){
		if (!Function.prototype.bind) {
			/**
			 * @extend Function
			 * @description a means to enclose context onto an object so it can be executed later
			 * @param {Object} context the context to use when executing the function later
			 **/
			Function.prototype.bind = function(context) {

				var that = this;

				return function() {
					return that.apply(context, arguments);
				};
			};
		}
		Simples.OO.useFnBind = Simples.noop;
	},
	/**
	 * @description used to create pseudo classical class inheritance
	 * @param {Object} superClass native javascript object to be merged
	 * @param {Object} subClass native javascript object to be merged	
	 * @param {Object|Array} addMethods native javascript object to merge functions onto the prototype object for the subClass
	 **/
	extend: function(superClass, subClass, addMethods) {
		var F = function() {};

		F.prototype = superClass.prototype;
		subClass = (typeof subClass === FUNC) ? subClass: function() {
			this.constructor.apply(this, arguments);
			return this;
		};

		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;

		subClass.prototype.superclass = superClass.prototype;

		if (superClass.prototype.constructor == Object.prototype.constructor) {
			superClass.prototype.constructor = superClass;
		}

		Simples.merge(subClass.prototype, addMethods);
	},
	/**
	 * @description used to create a new instance of your current object
	 * @param {Object} object native javascript object to merge functions onto the prototype object for the subClass
	 **/
	clone: function(object) {
		function F() {}
		F.prototype = object;
		return new F;
	},
	/**
	 * @description used to an exact copy of your current object
	 * @param {Object} object native javascript object to
	 **/
	copy: function(object) {
		var newObj = {};
		for (var name in obj) {
			if (toString.call(obj[name]) === ObjectClass) {
				newObj[name] = Simples.OO.copy(obj[name]);
			} else {
				newObj[name] = obj[name];
			}
		}
		return newObj;
	},
	Interface: (function(undefined) {
		/**
		 * @name Interface
		 * @constructor
		 **/
		function Interface(name
		/* methods */
		) {
			if (arguments.length < 2) {
				throw new Error("Interface constructor called with " + arguments.length + "arguments, but expected at least 2.");
			}
			/**
			 * @property
			 * @type String
			 * @description name of the Interface
			 **/
			this.name = name;
			/**
			 * @property
			 * @type Array
			 * @description methods detecting
			 **/
			this.methods = [];

			return this.addMethodNames(slice.call(arguments, 1));
		}

		Interface.prototype = {
			addMethodNames: function() {
				var i = 0,
				len = arguments.length;
				while (i < len) {
					if (typeof arguments[i] !== 'string') {
						throw new Error("Interface constructor," + this.name + " expects method names to be passed in as a string.");
					}
					this.methods.push(arguments[i++]);
				}
				return this;
			},
			testImplementation: function(object) {
				var len = this.methods.length;
				while (len) {
					var method = this.methods[--len];
					if (! (object[method] && typeof object[method] === FUNC)) {
						throw new Error("object does not implement this " + this.name + " interface. Method " + method + " was not found.");
					}
				}
			}
		};

		// Static class method.
		/**
		 * @function
		 * @description used to detect whether an object conforms to the interface
		 * @throws {Error} When not enough arguments are provided
		 * @throws {Error} When the arguments are one object and one or more instances of Interface
		 * @throws {Error} When a method is missing from the interface
		 * @param {Class} object class to detect complied with interface
		 * @param {Interface} iface Interfaces to use to detect compliance
		 **/
		Interface.ensureImplements = function(object
		/* interfaces */
		) {

			if (arguments.length < 2) {
				throw new Error("Function Interface.ensureImplements called with " + arguments.length + "arguments, but expected at least 2.");
			}

			for (var i = 1, len = arguments.length; i < len; i++) {
				var _interface = arguments[i];

				if (_interface.constructor !== Interface) {

					throw new Error("Function Interface.ensureImplements expects arguments two and above to be instances of Interface.");
				}

				_interface.testImplementation(object);
			}
		};

		return Interface;

	})()
};

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// from http://ejohn.org/blog/simple-javascript-inheritance/
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();