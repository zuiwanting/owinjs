exports = module.exports = function(connectApp) {
    
    return function(owin, nodeCallBack) {
        
        var self =  this;
          
        var url = owin.Request.PathBase + owin.Request.Path + owin.Request.QueryString;
        
        var req = {
            headers        :   owin.Request.Headers,
            method         :   owin.Request.Method,
            originalUrl    :    url,
            query          :   owin.Request.QueryString,
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
        
        var protocol = owin.Request.Protocol;
        req.httpVersion = protocol.split("/")[1];
        var httpVersionSplit = req.httpVersion.split(".");
        req.httpVersionMajor = httpVersionSplit[0];
        req.httpVersionMinor = httpVersionSplit[1];
        
        res.writeHead = function(statusCode, headers)
        {
            owin.Response.writeHead(statusCode, headers);
        }
        
        res.setHeader = function(key, value)
        {
            owin.Response.setHeader(key, value);
        }
        
        res.write = function(data)
        {
            owin.Response.write(data);
        }
        
        res.end = function(data)
        {
            owin.Response.end(data);
        }
        
        req.res = res;
        res.req = req;
        
        connectApp(req, res);
        
        nodeCallBack(null);
    }
};