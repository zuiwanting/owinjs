var constants = require('./owinConstants.js');

/**
 * Assures that the middleware is represented as OWIN/JS middleware promise format (promise) fn(next)  where next = (promise) function()
 *
 * @method owinMiddleware
 * @param middleware (function)  the function which may already be in OWIN format or may be an Express/Connect middleware component
 * @returns (function)   the same middleware, wrapped as needed, to assure it is a (promise) function(next)
 */
exports = module.exports = function owinMiddleware(middleware){
    if (typeof middleware === 'function')
    {
        switch(middleware.length)
        {
                //fn()
            case 0:
                return middleware;
                
                //fn(next) 
            case 1:
                return middleware;
                
                //fn(req,res) or fn(next, callback) NOT SUPPORTED
            case 2:
                
                var args =private_getParamNames(middleware);
                if (arrayEqual(args,["req","res"]))
                {
                    return owinFromConnect2(middleware);
                }
                else
                {
                    throw ("not supported");
                }

                //fn(req,res,next)
            case 3:
                return owinFromConnect3(middleware);
                
                //fn(err, req,res,next)
            case 4:
                return owinFromConnect4(middleware);
                
            default:
                throw("unknown middleware");
                return middleware;
        }
    }
    else
    {
        console.log("middleware must be a function");
        throw("middleware must be called on a function");
    }
    
};

// PRIVATE HELPER FUNCTIONS

/**
 * Gets the parameter names of a javascript function
 *
 * @method private_getParamNames
 * @param func (function)  the function to parse
 * @returns (array[string])   the names of each argument (e.g., function (a,b) returns ['a', 'b']
 * @private
 */
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function private_getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '')
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
    if(result === null)
        result = []
        return result
        }

/**
 * Converts an OWIN/JS promise-based Next() function  to an synchronous Connect-style Next() function
 *
 * @method arrayEqual
 *
 * @param array1 (Array[string])  the first array to compare
 * @param array2 (Array[string])  the second array to compare
 * @returns  (bool) true if the two arrays are equal, false if not  (e.g., ['a', 'c'], ['a', 'c'] is true)
 * @private
 */
function arrayEqual (array1, array2) {
    // if the other array is a falsy value, return
    if (!array2)
        return false;
    
    // compare lengths - can save a lot of time
    if (array1.length != array2.length)
        return false;
    
    for (var i = 0, l=array1.length; i < l; i++) {
        // Check if we have nested arrays
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array1[i].compare(array2[i]))
                return false;
        }
        else if (array1[i] != array2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

// ASYNC <--> SYNC CONVERSION PRIVATE METHODS


/**
 * Converts an OWIN/JS NodeFunc to an OWIN/JS AppFunc
 *
 * @method promiseFromConnect2
 *
 * @param (void) fn(req,res)    with next ignored
 * @returns (err) fn()
 * @private
 */
function owinFromConnect2(fn) {
    return function convertedPromiseFromConnect2() {
        var owin = this;
  
        try {
            fn.call(owin, owin.req, owin.res);
            owin = null;
            resolve(null);
            return null;
        } catch (ex) {
            return ex;
        }
    }
}
 
/**
 * Converts an OWIN/JS NodeFunc to an OWIN/JS AppFunc
 *
 * @method owinFromConnect3
 *
 * @param (void) fn(req,res, next)
 * @returns (err) fn(next)  with next translated from (err) function() to (void) function(err)
 * @private
 */
function owinFromConnect3(fn) {
    return function (next) {
        var owin = this;
        var nextAdjusted = nextSyncFromOwinNext(next);
        try {
            fn.call(owin, owin.req, owin.res, nextAdjusted);
            owin = null;
            nextAdjusted = null;
            resolve(null);
            return null;
        } catch (ex) {
            return ex;
        }
    }
}

/**
 * Converts an OWIN/JS NodeFunc to an OWIN/JS AppFunc
 *
 * @method owinFromConnect4
 *
 * @param (void) fn(err, req, res, next)
 * @returns (err) fn(next) with next translated from (err) function() to (void) function(err)
 * @private
 */
function owinFromConnect4(fn) {
    return function (next) {
        var owin = this;
        var nextAdjusted = nextSyncFromOwinNext(next);
        
        try {
            fn.call(owin, owin[constants.owinjs.Error], owin.req, owin.res, nextAdjusted);
            owin = null;
            nextAdjusted= null;
            resolve(null);
            return null;
        } catch (ex) {
            return ex;
        }
    }
}

/**
 * Converts an OWIN/JS  Next() function  to an synchronous Connect-style Next() function
 *
 * @method nextSyncFromOwinNextPromise
 *
 * @param (promise) fn()
 * @returns  (void) fn(err)
 * @private
 */
function nextSyncFromOwinNext(fn) {
    return function (err) {
        if (err)
        {
            this[constants.owinjs.Error] = err;   // store err for subsequent Connect error handlers
            fn.call(this);
        }
        else
            fn.call(this);
    }
}
