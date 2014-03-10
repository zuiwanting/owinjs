var path = require('path');
var url = require('url');
var util = require('util');

var cancellationTokenSource = require('cancellation');
var owinContextHelpers = require('./owinContextHelpers.js');
var OwinContextModule = require('./owinContext');
var initialized = false;

exports = module.exports = function toHttp(appFunc) {
    if (!initialized)
    {
        init();
        initialized = true;
    }
    return function(req, res) {
        var owin = new OwinContext(req,res);
        appFunc(owin, function() {});
    }
};

/**
 * Represents an OWIN/JS bridge to Node.js http ServerResponse Object
 *
 * @class OwinHttpServerResponseBridge
 * @constructor
 */

function OwinContext(req, res) {
    console.log("owin/js http bridge: url path " + req.url);
    this.req = req;
    this.res = res;
    var context = this;
    var tokenSource = new cancellationTokenSource();
    
    res.setHeader('X-Powered-By', 'OWIN-JS');
    context["nodeAppKit.callCancelledSource"] =  tokenSource;
    context["owin.callCancelled"] = tokenSource.token;
    context["server.appId"] = "node-http";
    context["owin.ResponseStatusCode"] = null;
    
    if (!context["owin.ResponseHeaders"]["Content-Length"])
      context["owin.ResponseHeaders"]["Content-Length"] = "-1";    
 }

function init(){
    
    var ctx= OwinContext.prototype;
    
    Object.defineProperty(ctx, "owin.RequestHeaders", {
                          get: function () {return this.req.headers; }
                          });
    
    Object.defineProperty(ctx, "owin.RequestMethod", {
                          get: function () { return this.req.method;  },
                          set: function (val) { this.req.method = val;    }
                          });
    
    Object.defineProperty(ctx, "owin.RequestPath", {
                          get: function () { return url.parse(this.req.url).pathname; },
                          set: function (val) {
                          var uri = val;
                          var uriQuery =  url.parse(this.req.url).query;
                          if (uriQuery != "")
                          uri += "?" + uriQuery;
                          this.req.url = uri;
                          }
                          });
    
    Object.defineProperty(ctx, "owin.RequestPathBase", {
                          get: function () { return "" },
                          set: function (val) {
                          if (!this.req.originalUrl)
                          this.req.originalUrl = this.req.url;
                          var uri = path.join(val, this.req.url);
                          this.req.url = uri;
                          }
                          });
    
    Object.defineProperty(ctx, "owin.RequestProtocol", {
                          get: function () {return "HTTP/" + this.req.httpVersion; }
                          });
    
    Object.defineProperty(ctx, "owin.RequestQueryString", {
                          get: function () {  return  url.parse(this.req.url).query; },
                          set: function (val) {
                          var uri = url.parse(this.req.url).pathname;
                          var uriQuery =  val;
                          if (uriQuery != "")
                          uri += "?" + uriQuery;
                          this.req.url = uri;
                          }
                          });
    
    Object.defineProperty(ctx, "owin.RequestScheme", {
                          get: function () { return "http"; }
                          });
    
    Object.defineProperty(ctx, "owin.RequestBody", {
                          get: function () { return this.req;}
                          });
    
    Object.defineProperty(ctx, "owin.ResponseHeaders", {
                          get: function () {return this.res._headers; }
                          });
    
    Object.defineProperty(ctx, "owin.ResponseStatusCode", {
                          get: function () { return this.res.statusCode; },
                          set: function (val) { this.res.statusCode = val;    }
                          });
    
    Object.defineProperty(ctx, "owin.ResponseReasonPhrase", {
                          get: function () { return "";   },
                          set: function (val) { /* ignore */    }
                          });
    
    Object.defineProperty(ctx, "owin.ResponseProtocol", {
                          get: function () {  return "HTTP/" + this.req.httpVersion; },
                          set: function (val) { /* ignore */  }
                          });
    
    Object.defineProperty(ctx, "owin.ResponseBody", {
                          get: function () { return this.res; }
                          });
    
    Object.defineProperty(ctx, "server.appId", {
                          get: function () { return this._appId; },
                          set: function (val) { this._appId = val;    }
                          });
    
    Object.defineProperty(ctx, "nodeAppKit.callCancelledSource", {
                          set: function (val) { this._callCancelledSource = val; }
                          });
    
    Object.defineProperty(ctx, "owin.Version", {
                          get: function () { return "1.0";  }
                          });
    
    Object.defineProperty(ctx, "owin.callCancelled", {
                          get: function () {  return this._callCancelled; },
                          set: function (val) { this._callCancelled = val;    }
                          });
    
    ctx["owinjs.setResponseHeader"] = function(){this.res.setHeader.apply(this.res, Array.prototype.slice.call(arguments));};
    ctx["owinjs.getResponseHeader"] = function(){this.res.getHeader.apply(this.res, Array.prototype.slice.call(arguments));};
    ctx["owinjs.removeResponseHeader"] = function(){this.res.removeHeader.apply(this.res, Array.prototype.slice.call(arguments));};
    ctx["owinjs.writeHead"] = function(){this.res.writeHead.apply(this.res, Array.prototype.slice.call(arguments));};
    
    console.log("http -> OWIN/JS server initialized");
}