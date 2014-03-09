var path = require('path');
var url = require('url');
var owinContextHelpers = require('./owinContextHelpers.js');

// PUBLIC EXPORTS

/**
 * Expands owin context object with various helper methods
 *
 * @method addReqRes
 *
 * @param context (object)  the javascript object on which to add the prototypes (i.e., the OWIN/JS context)
 * @returns (void)
 * @public
 */
exports.addReqRes = function addReqRes(context) {
    context.req = new OwinHttpServerRequestBridge(context);
    context.res = new OwinHttpServerResponseBridge(context);
};

/**
 * Representss an OWIN/JS bridge to Node.js http ServerRequest Object
 *
 * @class OwinHttpServerRequestBridge
 * @constructor
 */
function OwinHttpServerRequestBridge(owin){ this.context = owin;  };

/**
 * Representss an OWIN/JS bridge to Node.js http ServerResponse Object
 *
 * @class OwinHttpServerResponseBridge
 * @constructor
 */
function OwinHttpServerResponseBridge(owin){ this.context = owin;  };

/**
 * Self initiating method to create the prototype properties on the OwinHttpServerRequestBridge to match http ServerRequest object
 *
 * @method init_InstallRequestPrototypes
 * @private
 */
(function init_InstallRequestPrototypes()
 {
 var req= OwinHttpServerRequestBridge;
 
 Object.defineProperty(req.prototype, "socket", { get: function () {  return {}  } });
 Object.defineProperty(req.prototype, "connection", { get: function () {  return {}  } });
 
 Object.defineProperty(req.prototype, "httpVersion", {
                       get: function () { return  this.context["owin.RequesProtocol"].split("/")[1];
                       },
                       set: function (val) { throw ("not implemented");    }
                       });
 
 Object.defineProperty(req.prototype, "httpVersionMajor", {
                       get: function () { return this.context["owin.RequesProtocol"].split("/")[1].split(".")[0];
                       },
                       set: function (val) { throw ("not implemented");    }
                       });
 
 Object.defineProperty(req.prototype, "httpVersionMinor", {
                       get: function () { return this.context["owin.RequesProtocol"].split("/")[1].split(".")[1];
                       },
                       set: function (val) { throw ("not implemented");    }
                       });
 
 Object.defineProperty(req.prototype, "originalUrl", {
                       get: function () {
                       if (!this._originalurl)
                       this._originalUrl = this.url;
                       return this._originalurl;
                       }
                       });
 
 Object.defineProperty(req.prototype, "url", {
                       get: function () {
                       var owin = this.context;
                       var uri =
                       owin["owin.RequestPath"];
                       
                       if (owin["owin.RequestQueryString"] != "")
                       uri += "?" + owin["owin.RequestQueryString"];
                       
                       }, set: function (val) {
                       if (!this._originalurl)
                       this._originalUrl = this.url;
                       var urlParsed = url.parse(val);
                       this.context["owin.RequestPathBase"] = "";
                       this.context["owin.RequestPath"] = urlParsed.pathName;
                       this.context["owin.RequestQueryString"] = urlParsed.query;
                       }
                       });
 
 Object.defineProperty(req.prototype, "complete", {
                       get: function () {  return false;   }
                       });
 
 Object.defineProperty(req.prototype, "headers", {
                       get: function () {  return this.context["owin.RequestHeaders"];   }
                       });
 
 Object.defineProperty(req.prototype, "rawHeaders", {
                       get: function () {
                       var ret = [];
                       for(var key in this.context["owin.RequestHeaders"]){
                       ret.push(key);
                       ret.push(this.context["owin.RequestHeaders"]);
                       };
                       return ret;
                       }
                       });
 
 Object.defineProperty(req.prototype, "trailers", {
                       get: function () {  return {};   }
                       });
 
 Object.defineProperty(req.prototype, "rawTrailers", {
                       get: function () {  return []; }
                       });
 
 
 Object.defineProperty(req.prototype, "readable", {
                       get: function () {  return true ; }
                       });
 
 
 Object.defineProperty(req.prototype, "method", {
                       get: function () {  return this.context["owin.RequestMethod"];   },
                       set: function (val) {  this.context["owin.RequestMethod"] = val;    }
                       });
 
 
 
 
 
 }).call(global);

/**
 * Self initiating method to create the prototype properties on the OwinHttpServerResponseBridge to match http ServerResponse object
 *
 * @method init_InstallReesponsePrototypes
 * @private
 */
(function init_InstallReesponsePrototypes()
 {
 var res= OwinHttpServerResponseBridge;
 
 Object.defineProperty(res.prototype, "writable", {
                       get: function () { return true;   }
                       });
 
 Object.defineProperty(res.prototype, "socket", { get: function () {  return {}  } });
 Object.defineProperty(res.prototype, "connection", { get: function () {  return {}  } });
 
 Object.defineProperty(res.prototype, "statusCode", {
                       get: function () { return this.context["owin.ResponseStatusCode"];  },
                       set: function (val) { return this.context["owin.ResponseStatusCode"] = val;  },
                       });
 
 Object.defineProperty(res.prototype, "headersSent", {
                       get: function () { return  false;  }
                       });
 
 Object.defineProperty(res.prototype, "sendDate", {
                       get: function () { return true; },
                       set: function (val) { /* ignore */  },
                       });
 
 
 res.prototype.status =  function (code) { this.context["owin.ResponseStatusCode"] = code; return this;}
 
 
 res.prototype.writeContinue = function writeContinue(statusCode, headers)
 {
 throw {name : "NotImplementedError", message : "writeContinue HTTP 100 not implemented"};
 }
 
 res.prototype.setTimeout = function setTimeout(msecs, callback)
 {
 throw {name : "NotImplementedError", message : "set Timeout not implemented as no sockets needed in OWIN/JS"};
 }
 
 res.prototype.addTrailers = function addTrailers(trailers)
 {
 throw {name : "NotImplementedError", message : "HTTP Trailers (trailing headers) not supported"};
 }
 
 res.prototype.setHeader = function(key, value)
 {
 this.context.response.setHeader(key, value);
 }
 
 res.prototype.getHeader = function(key)
 {
 return this.context.response.getHeader(key);
 }
 
 res.prototype.removeHeader = function(key)
 {
 this.context.response.removeHeader(key);
 }
 
 res.prototype.writeHead = function(statusCode, reasonPhrase, headers)
 {
 this.context.response.writeHead(statusCode, reasonPhrase, headers);
 }

 var Stream = require('stream');
 var Writable = Stream.Writable;
 var EventEmitter = require('events').EventEmitter;

 owinContextHelpers.cloneResponseBodyPrototype(res.prototype,EventEmitter.prototype);
 owinContextHelpers.cloneResponseBodyPrototype(res.prototype,Stream.prototype);
 owinContextHelpers.cloneResponseBodyPrototype(res.prototype,Writable.prototype);
 
 }).call(global);

/**
 * Create alias access methods on context.response for context["owin.ResponseBody"] for given stream/writable prototype
 *
 * Note: the alias will be a collection of both functions (which simply shell out to target function) and valuetypes (which
 * have a getter and setter defined which each shell out to the target property)
 *
 * @method private_cloneResponseBodyPrototype
 * @param targetObjectPrototype (__proto__)  the prototype object for the context.response object on which the alias properties are set
 * @param sourceObjectprototype (__proto__)  the prototpye object for the generic stream/writable on which to enumerate all properties
 * @returns (void)
 * @private
 */
function private_cloneResponseBodyPrototype(targetObjectPrototype, sourceObjectprototype)
{
    Object.getOwnPropertyNames(sourceObjectprototype).forEach(function (_property)
                                                              {
                                                              if (typeof( sourceObjectprototype[_property]) === 'function')
                                                              {
                                                              targetObjectPrototype[_property] = function(){
                                                              var body =this.context["owin.ResponseBody"];
                                                              return body[_property].apply(body, Array.prototype.slice.call(arguments));
                                                              };
                                                              }
                                                              else
                                                              {
                                                              Object.defineProperty(targetObjectPrototype, _property, {
                                                                                    
                                                                                    get: function () {
                                                                                    return this.context["owin.ResponseBody"][_property];
                                                                                    },
                                                                                    
                                                                                    set: function (val) {
                                                                                    this.context["owin.ResponseBody"][_property] = val;
                                                                                    }
                                                                                    
                                                                                    });
                                                              }
                                                              });
    
}
