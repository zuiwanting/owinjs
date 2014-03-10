var util = require('util');
var Stream = require('stream');
var Writable = Stream.Writable;
var Readable = Stream.Readable;
var EventEmitter = require('events').EventEmitter;

var owinConnect = require('./owinConnect.js');
var owinContextHelpers = require('./owinContextHelpers.js');
var const_Instance = require('./guid.js').guid();

/**
 * Run Once Self Initiating Function
 *
 * @method init
 * @returns (void)
 * @private
 */
(function  init() {
 var _temp_context = new OwinDefaultContext();   // use for adding properties
 owinContextHelpers.refreshPrototype(_temp_context, "owin.Request", OwinRequest.prototype)
 owinContextHelpers.refreshPrototype(_temp_context, "owin.Response", OwinResponse.prototype)
 owinContextHelpers.refreshPrototype(_temp_context, "owin.", OwinOwin.prototype)
 owinContextHelpers.refreshPrototype(_temp_context, "server.", OwinServer.prototype)
 owinContextHelpers.refreshPrototype(_temp_context, "nodeAppKit.", OwinNodeAppKit.prototype)
 
 owinContextHelpers.cloneResponseBodyPrototype(OwinResponse.prototype,EventEmitter.prototype, "owin.ResponseBody");
 owinContextHelpers.cloneResponseBodyPrototype(OwinResponse.prototype,Stream.prototype, "owin.ResponseBody");
 owinContextHelpers.cloneResponseBodyPrototype(OwinResponse.prototype,Writable.prototype, "owin.ResponseBody");
 
 owinContextHelpers.cloneResponseBodyPrototype(OwinRequest.prototype,EventEmitter.prototype, "owin.RequestBody");
 owinContextHelpers.cloneResponseBodyPrototype(OwinRequest.prototype,Stream.prototype, "owin.RequestBody");
 owinContextHelpers.cloneResponseBodyPrototype(OwinRequest.prototype,Readable.prototype, "owin.RequestBody");
 
 _temp_context = null;
 }).call(this);


// PUBLIC EXPORTS
/*exports.createContext = function() {
 return new OwinDefaultContext();
 }*/

/**
 * Expands owin context object with various helper methods;  called for every request context passing through OWIN/JS
 *
 * @method private_refreshPrototype
 * @param propertyList (object)  a representative OWIN context with all desired properties set (to null, default or value)
 * @param owinPrefix (string)  the Owin  prefix to search for (e.g., "owin.Request")
 * @param owinObject (object)  the javascript object on which to add the prototypes (e.g., context.Request)
 * @returns (void)
 * @private
 */
exports.expandContext = expandContext;

function expandContext(context, addReqRes) {
    var isOwinJsNative = true;
    
    if (context.req)
        isOwinJsNative = false;
    
    context.request = new OwinRequest(context);
    context.response = new OwinResponse(context);
    context.owin = new OwinOwin(context);
    context.server = new OwinServer(context);
    context.nodeAppKit = new OwinNodeAppKit(context);
    
    if (context["owinjs.id"] != const_Instance)
    {
        console.log("OwinJS/owinjs started; instance=" + const_Instance);
        
        // add default aliases to owinContext if needed;  not currently in default OWIN/JS spec
        // owinContextHelpers.refreshPrototypeOwinContext(context);
        
        Object.defineProperty(context.constructor.prototype, "owinjs.id", {value : const_Instance,
                              writable : false, enumerable : true, configurable : false});
        
        context.constructor.prototype.toString = function()
        {
            return util.inspect(this).replace(/\n/g,"\r");
        }
        
        if (isOwinJsNative)
            initOwinNativeContextPrototype(context.constructor.prototype);
    }
    
    if (isOwinJsNative)
        owinConnect.addReqRes(context);
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

/**
 * Represents an OWIN/JS nodeAppKit Object
 *
 * @class OwinNodeAppKit
 * @constructor
 */
function OwinNodeAppKit(owin){ this.context = owin;  };


/**
 * Run Once Self Initiating Function to create prototype methods on OwinRequest, OwinResponse, OwinServer etc.
 *
 * @method init
 * @returns (void)
 * @private
 */
(function initPrototypes(){
 Object.defineProperty(OwinRequest.prototype, "host", {   get: function () {
                       return this.context["owin.RequestHeaders"]["host"];
                       }});
 
 Object.defineProperty(OwinRequest.prototype, "originalUrl", {   get: function () {
                       var owin = this.context;
                       var uri =
                       owin["owin.RequestScheme"] +
                       "://" +
                       owin.host +
                       owin["owin.RequestPathBase"] +
                       owin["owin.RequestPath"];
                       
                       if (owin["owin.RequestQueryString"] != "")
                       uri += "?" + owin["owin.RequestQueryString"];
                       
                       return uri;
                       }});
 
 OwinResponse.prototype.writeHead= function(){this.context["owinjs.writeHead"].apply(this.context, Array.prototype.slice.call(arguments));};
 OwinResponse.prototype.getHeader= function(){this.context["owinjs.getResponseHeader"].apply(this.context, Array.prototype.slice.call(arguments));};
 OwinResponse.prototype.removeHeader = function(){this.context["owinjs.removeResponseHeader"].apply(this.context, Array.prototype.slice.call(arguments));};
 OwinResponse.prototype.setHeader = function(){this.context["owinjs.setResponseHeader"].apply(this.context, Array.prototype.slice.call(arguments));};
 
 Object.defineProperty(OwinServer.prototype, "instance", {value : const_Instance,
                       writable : false,
                       enumerable : true,
                       configurable : false});
 
 }).call(this);


function initOwinNativeContextPrototype(contextPrototype){
    
    contextPrototype["owinjs.writeHead"] = function OwinResponseWriteHead(statusCode, headers)
    {
        this["owin.ResponseStatusCode"] = statusCode;
        
        var keys = Object.keys(headers);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (k) this["owin.ResponseHeaders"][k] = headers[k];
        }
    };
    
    contextPrototype["owinjs.setResponseHeader"] = function OwinResponseSetHeader(key, value)
    {
        this["owin.ResponseHeaders"][key] = value;
    }
    
    contextPrototype["owinjs.getResponseHeader"] = function OwinResponseGetHeader(key)
    {
        return this["owin.ResponseHeaders"][key];
        
    }
    
    contextPrototype["owinjs.removeResponseHeader"] = function OwinResponseRemoveHeader(key, value)
    {
        delete this["owin.ResponseHeaders"][key];
    }
}

/**
 * Creates a new OWIN/JS Context Object with all empty or default fields
 *
 * @class OwinDefaultContext
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