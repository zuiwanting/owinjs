var util = require('util');

var const_Instance = guid();

/**
 * Run Once Self Initiating Function
 *
 * @method init
 * @returns (void)
 * @private
 */
(function  init() {
 var _temp_context = new OwinDefaultContext();   // use for adding properties
 private_refreshPrototype(_temp_context, "owin.Request", OwinRequest)
 private_refreshPrototype(_temp_context, "owin.Response", OwinResponse)
 private_refreshPrototype(_temp_context, "owin.", OwinOwin)
 private_refreshPrototype(_temp_context, "server.", OwinServer)
 private_refreshPrototype(_temp_context, "nodeAppKit.", OwinNodeAppKit)
 _temp_context = null;
 }).call(this);


// PUBLIC EXPORTS
/*exports.createContext = function() {
    return new OwinDefaultContext();
}*/

/**
 * Expands owin context object with various helper methods
 *
 * @method private_refreshPrototype
 * @param propertyList (object)  a representative OWIN context with all desired properties set (to null, default or value)
 * @param owinPrefix (string)  the Owin  prefix to search for (e.g., "owin.Request")
 * @param owinObject (object)  the javascript object on which to add the prototypes (e.g., context.Request)
 * @returns (void)
 * @private
 */
exports.expandContext = function expandContext(context) {
    context.request = new OwinRequest(context);
    context.response = new OwinResponse(context);
    context.owin = new OwinOwin(context);
    context.server = new OwinServer(context);
    context.nodeAppKit = new OwinNodeAppKit(context);
  
    if (context["owinjs._id"] != const_Instance)
    {
        private_refreshPrototypeOwinContext(context);
    }
};

/**
 * Represents an OWIN/JS request Object.
 * 
 * Properties are generated dynamically from all the owin context elements starting with "owin.Request"
 *
 * @class OwinRequest
 * @constructor
 */
function OwinRequest(owin){ this.context = owin;};

/**
 * Represents an OWIN/JS response Object.
 *
 * Properties are generated dynamically from all the owin context elements starting with "owin.Request"
 *
 * @class owinResponse
 * @constructor
 */

function OwinResponse(owin){  this.context = owin;  };

/**
 * Representss an OWIN/JS owin Object
 *
 * @class OwinOwin
 * @constructor
 */
function OwinOwin(owin){ this.context = owin;  };


/**
* Representss an OWIN/JS server Object
*
* @class OwinServer
* @constructor
*/
function OwinServer(owin){ this.context = owin;  };

Object.defineProperty(OwinServer.prototype, "instance", {value : const_Instance,
                      writable : false,
                      enumerable : true,
                      configurable : false});

/**
 * Representss an OWIN/JS nodeAppKit Object
 *
 * @class OwinNodeAppKit
 * @constructor
 */
function OwinNodeAppKit(owin){ this.context = owin;  };


// Add additional helpers for writing response
OwinResponse.prototype.writeHead = function OwinResponseWriteHead(statusCode, headers)
{
    this.context["owin.ResponseStatusCode"] = statusCode;
    
    var keys = Object.keys(headers);
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (k) this.context["owin.ResponseHeaders"][k] = headers[k];
    }
}

OwinResponse.prototype.setHeader = function OwinResponseSetHeader(key, value)
{
    this.context["owin.ResponseHeaders"][key] = value;
}

OwinResponse.prototype.write = function OwinResponseWrite(data)
{
    this.context["owin.ResponseHeaders"].write(data);
}

OwinResponse.prototype.end = function OwinResponseEnd(data)
{
    this.context["owin.ResponseBody"].end(data);
}


// PRIVATE METHODS

/**
 * Extract name from Owin Property
 *
 * @method private_getSuffix
 * @param prefix (string)  the prefix to search for (e.g., "owinRequest")
 * @param data (string)  the Owin Property (e.g., "owinRequestBody")
 * @returns (string)  the suffix if found (e.g., "owinRequestBody"), null if no match
 * @private
 */

function private_getSuffix(prefix, data) {
    if (data.lastIndexOf(prefix, 0) === 0)
        return data.substring(prefix.length);
    else
        return null;
}

/**
 * Extract name from Owin Property
 *
 * @method private_refreshPrototype
 * @param propertyList (object)  a representative OWIN context with all desired properties set (to null, default or value)
 * @param owinPrefix (string)  the Owin  prefix to search for (e.g., "owin.Request")
 * @param owinObject (object)  the javascript object on which to add the prototypes (e.g., context.Request)
 * @returns (void)  
 * @private
 */
function private_refreshPrototype(propertyList, owinPrefix, owinObject)
{
    Object.keys(propertyList).forEach(function (_property)
                                      {
                                      var suffix = private_getSuffix(owinPrefix, _property);
                                      
                                      if (suffix)
                                      {
                                      if (suffix.length >1)
                                        var suffix = suffix.substring(0,1).toLowerCase() + suffix.substring(1)
                                      else
                                        suffix = suffix.toLowerCase();
                                      
                            
                                      Object.defineProperty(owinObject.prototype, suffix, {
                                                            
                                                            get: function () {
                                                            return this.context[_property];
                                                            },
                                                            
                                                            set: function (val) {
                                                            this.context[_property] = val;
                                                            }
                                                            
                                                            })
                                      }
                                      });
}

function private_refreshPrototypeOwinContext(owinObject)
{
    
    var proto = owinObject.constructor.prototype;
    
    Object.defineProperty(proto, "owinjs._id", {value : const_Instance,
                          writable : false,
                          enumerable : true,
                          configurable : false});
    
    
    proto.setHeader = function(key, value)
    {
        this.owinResponseHeaders[key] = value;
    }
    
    proto.toString = function()
    {
        return util.inspect(this).replace(/\n/g,"\r");
    }

    Object.keys(owinObject).forEach(function (_property)
                                      {
                                      
                                      var n = _property.indexOf(".");
                                      if (n>-1)
                                      {
                                      
                                      var short = _property.substring(0,n) + _property.substring(n+1);
                                      
                                      Object.defineProperty(proto, short, {
                                                            get: function () {
                                                             return this[_property];
                                                            },
                                                            
                                                            set: function (val) {
                                                            this[_property] = val;
                                                            }
                                                            
                                                            });
                                      }
                                      
                                      });
    
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


/**
 * Represents the OWIN/JS Context Object
 *
 * @class OwinContext
 * @constructor
 */
function OwinDefaultContext() {
    this["owin.RequestHeaders"] = {};
    this["owin.RequestMethod"] = "";
    this["owin.RequestPath"] = "";
    this["owin.RequestPathBase"] = "";
    this["owin.RequestProtocol"] = "";
    this["owin.RequestQueryString"] ="";
    this["owin.RequestScheme"] = "";
    this["owin.RequestBody"] = {};
    
    this["owin.ResponseHeaders"] = {};
    this["owin.ResponseStatusCode"] = null;
    this["owin.ResponseReasonPhrase"] = "";
    this["owin.ResponseProtocol"] = "";
    this["owin.ResponseBody"] = {};
    this["owin.ResponseHeaders"]["Content-Length"]= "-1";
  
    this["server.appId"] = "";
    this["nodeAppKit.callCancelledSource"] = {};
    this["owin.Version"] = "";
    this["owin.callCancelled"] = {};
};



