/**
 * @name merge
 * @description used to merge objects into one
 * @param {Object} target native javascript object to be merged
 * @param {Object|Array} obj native javascript object or array to be merged onto first
 **/
Simples.OO = {
    extend: function(superClass, subClass, addMethods) {
        var F = function() {};

        F.prototype = superClass.prototype;
        subClass.prototype = new F();
        subClass.prototype.constructor = ( typeof subClass === "function" ) ? subClass: function() {
            this.constructor.apply(this, arguments);
            return this;
        };

        subClass.prototype.superclass = superClass.prototype;

        if (superClass.prototype.constructor == Object.prototype.constructor) {
            superClass.prototype.constructor = superClass;
        }
        
		Simples.merge( subClass.prototype, addMethods );
        for (var key in addMethods) {
            if ( addMethods.hasOwnProperty( key ) ) {
                subClass.prototype[ key ] = addMethods[ key ];
            }
        }
    },
	clone: function(object) {
		function F() {}
	    F.prototype = object;
	    return new F;
	}
    copy: function(obj) {
        var newObj = {};
        for (var name in obj) {
            if (toString.call( obj[ name ] ) === ObjectClass) {
                newObj[ name ] = clone( obj[ name ] );
            } else {
                newObj[ name ] = obj[ name ];
            }
        }
        return newObj;
    }
};    

if( !Function.prototype.bind ){
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

(function(Simples){
	// Constructor.

	/**
	 * @name Interface
	 * @constructor
	 **/
	function Interface(name /* methods */ ) {
		if(arguments.length < 2) {
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

		return this.addMethodNames( slice.call( arguments, 1 ) );
	};

	Interface.prototype = {
		addMethodNames : function(){
			var len = arguments.length;
			for(var i = 0, len = arguments.length; i < len; i++) {
				if(typeof arguments[i] !== 'string') {
					throw new Error("Interface constructor expects method names to be " +
						"passed in as a string.");
				}
				this.methods.push( arguments[i] );
			}
			return this;
		},
		testImplementation : function( object ){
			var len = this.methods.length;
			while( len ){
				var method = this.methods[ --len ];
				if( !( object[method] && typeof object[method] === 'function' ) ){
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
	Interface.ensureImplements = function(object /* interfaces */) {

		if(arguments.length < 2) {
			throw new Error("Function Interface.ensureImplements called with " + arguments.length + "arguments, but expected at least 2.");
		}

		for(var i = 1, len = arguments.length; i < len; i++) {
			var _interface = arguments[i];

			if( _interface.constructor !== Interface) {

				throw new Error("Function Interface.ensureImplements expects arguments two and above to be instances of Interface.");
			}

			_interface.testImplementation( object );	
		}
	};
	
	Simples.Interface = Interface;	
	
})( Simples );

/*
Can I Simples.OO.exend( Simples.fn.init, myObj, addMethods );
*/