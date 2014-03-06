exports = module.exports = function(connectApp) {
    
    return function(owin, nodeCallBack) {
        
        var self =  this;
        
        var url = owin.request.pathBase + owin.request.path + owin.request.queryString;
        
        var req = {
            headers        :   owin.request.headers,
            method         :   owin.request.method,
            originalUrl    :    url,
            query          :   owin.request.queryString,
            url            :    url,
            params         :    {},
            session        :    {},
            cookies        :    {},
            body           :    {},
            files          :    {}
        };
        
        var res = {
        chunkedEncoding:    false,
            finished       :    false,
            output         :    [],
        outputEncodings:    [],
            sendDate       :    false,
        shouldkeepAlive:    false,
            useChunkedEncdoingByDefault
            :    Boolean,
            viewCallbacks  :    [],
            writable       :     true,
            statusCode     :    -1,
            cookies        :    {},
            cookie         :    function (name, value, options) {
                this.cookies[name] = { value: value, options: options};
            },
            clearCookie    :    function (name) { delete this.cookies[name]; },
            status         :    function (code) { this.statusCode = code; return this;}
        }
        
        var protocol = owin.request.protocol;
        req.httpVersion = protocol.split("/")[1];
        var httpVersionSplit = req.httpVersion.split(".");
        req.httpVersionMajor = httpVersionSplit[0];
        req.httpVersionMinor = httpVersionSplit[1];
        
        res.writeHead = function(statusCode, headers)
        {
            owin.response.writeHead(statusCode, headers);
        }
        
        res.setHeader = function(key, value)
        {
            owin.response.setHeader(key, value);
        }
        
        res.write = function(data)
        {
            owin.response.write(data);
        }
        
        res.end = function(data)
        {
            owin.response.end(data);
        }
        
        req.res = res;
        res.req = req;
        
        connectApp(req, res);
        
        nodeCallBack(null);
    }
};

/**
 * Representss an OWIN/JS bridge to Node.js http ServerRequest Object
 *
 * @class OwinHttpServerRequest
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

// INITIALIZATION
private_InstallPrototypes();

function private_InstallPrototypes()
{
    var req= OwinHttpServerRequestBridge;
    var res= OwinHttpServerResponseBridge;
    
    // REQUEST
    Object.defineProperty(req.prototype, "headers", {
                          get: function () {  return this.context["owin.RequestHeaders"];   },
                          set: function (val) {  this.context["owin.RequestHeaders"] = val;    }
                          });
    
    Object.defineProperty(req.prototype, "method", {
                          get: function () {  return this.context["owin.RequestMethod"];   },
                          set: function (val) {  this.context["owin.RequestMethod"] = val;    }
                          });
    
    Object.defineProperty(req.prototype, "originalUrl", {
                          get: function () {  return this.context["owin.RequestPathBase"] + this.context["owin.RequestPath"] + this.context["owin.RequestQueryString"]
                          },
                          set: function (val) { throw ("not implemented");    }
                          });
    
    Object.defineProperty(req.prototype, "params", {
                          get: function () {  throw ("not implemented");
                          },
                          set: function (val) { throw ("not implemented");    }
                          });
    
    Object.defineProperty(req.prototype, "session", {
                          get: function () {  throw ("not implemented");
                          },
                          set: function (val) { throw ("not implemented");    }
                          });
    
    Object.defineProperty(req.prototype, "cookies", {
                          get: function () {  throw ("not implemented");
                          },
                          set: function (val) { throw ("not implemented");    }
                          });
    
    Object.defineProperty(req.prototype, "body", {
                          get: function () {  return this.context["owin.RequestBody"];   },
                          set: function (val) {   this.context["owin.RequestBody"] = val;    }
                          });
    
    Object.defineProperty(req.prototype, "files", {
                          get: function () {  throw ("not implemented");
                          },
                          set: function (val) { throw ("not implemented");    }
                          });
    
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
    
    // RESPONSE
    Object.defineProperty(res.prototype, "chunkedEncoding", {
                          get: function () {  throw ("not implemented") },
                          set: function (val) {   throw ("not implemented");  }
                          });
    
    Object.defineProperty(res.prototype, "finished", {
                          get: function () {  throw ("not implemented")  },
                          set: function (val) {  throw ("not implemented");    }
                          });
    
    Object.defineProperty(res.prototype, "output", {
                          get: function () { throw ("not implemented");   },
                          set: function (val) {  throw ("not implemented");    }
                          });
    Object.defineProperty(res.prototype, "sendDate", {
                          get: function () { throw ("not implemented");   },
                          set: function (val) {  throw ("not implemented");    }
                          });
    Object.defineProperty(res.prototype, "shouldkeepAlive", {
                          get: function () { throw ("not implemented");   },
                          set: function (val) {  throw ("not implemented");    }
                          });
    Object.defineProperty(res.prototype, "useChunkedEncdoingByDefault", {
                          get: function () { throw ("not implemented");   },
                          set: function (val) {  throw ("not implemented");    }
                          });
    Object.defineProperty(res.prototype, "viewCallbacks", {
                          get: function () { throw ("not implemented");   },
                          set: function (val) {  throw ("not implemented");    }
                          });
    
    Object.defineProperty(res.prototype, "writable", {
                          get: function () { throw ("not implemented");   },
                          set: function (val) {  throw ("not implemented");    }
                          });
    
    Object.defineProperty(res.prototype, "statusCode", {
                          get: function () { return this.context["owin.ResponseStatusCode"];  },
                          set: function (val) { this.context["owin.ResponseStatusCode"] = val;   }
                          });
    
    Object.defineProperty(res.prototype, "cookies", {
                          get: function () { throw ("not implemented");   },
                          set: function (val) { throw ("not implemented");  }
                          });
    
    
    res.prototype.cookie = function (name, value, options) {
        this.cookies[name] = { value: value, options: options};
    }
    
    res.prototype.clearCookie =  function (name) { delete this.cookies[name]; }
    
    res.prototype.status =  function (code) { this.context["owin.ResponseStatusCode"] = code; return this;}
    
    
    res.prototype.writeHead = function(statusCode, headers)
    {
        this.context.response.writeHead(statusCode, headers);
    }
    
    res.prototype.setHeader = function(key, value)
    {
        this.context.response.setHeader(key, value);
    }
    
    res.prototype.write = function(data)
    {
        this.context.response.write(data);
    }
    
    res.prototype.end = function(data)
    {
        tthis.context.response.end(data);
    }
    
    Object.defineProperty(req.prototype, "res", {
                          get: function () { return this.context.res   },
                          });
    Object.defineProperty(res.prototype, "req", {
                          get: function () { return this.context.req   },
                          });
}

