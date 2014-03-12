/**
 * Module dependencies.
 */
var Promise = require('promise');
var OwinHttp = require('./owinHttp.js');
var OwinContext = require('./owinContext');
var OwinMiddleware = require('./owinMiddleware');
var util = require('util');
var constants = require('./owinConstants');

appBuilder = function() {
    this.properties = {};
    this.middleware = [];
    this.properties[constants.builder.DefaultApp] = owinDefaultApp;
    this.properties[constants.builder.DefaultMiddleware] = [owinRespondMiddleware];
}

exports = module.exports = appBuilder;

var app = appBuilder.prototype;

app.use = function(mw){
     this.middleware.push(OwinMiddleware(mw));
     return this;
 };

app.build = function(){
    var mw = this.properties[constants.builder.DefaultMiddleware].concat(this.middleware).concat(this.properties[constants.builder.DefaultApp]);
    var fn = compose(mw);
    var self = this;
    
    return function owinPipelineBuilder(owin, callback){
        OwinContext.expandContext(owin);
                
        owin.app = self;
        try {
            return fn(owin).then(function(){
                                 OwinContext.shrinkContext(owin);
                                 callback(null);
                                 owin = null;
                          },
                                 function(err){
                                 owinDefaultError.call(owin, err);
                                 OwinContext.shrinkContext(owin);
                                 callback(null);
                                 owin = null;
                                 });
        }
        catch (err)
        {
            throw(err);
            owinDefaultError.call(owin,err);
            OwinContext.shrinkContext(owin);
            callback(null);
            owin = null;
        }
        self = null;
    }
};

app.buildHttp = function(){
    return OwinHttp(app.build.call(this));
};

function compose(middleware){
    return function owinPipeline(owin){
        var i = middleware.length;
        var prev = function (){return Promise.from(null);};
        var curr;
        while (i--) {
            curr = middleware[i];
            prev = curr.bind(owin, prev)
        }
        return prev();
    }
}

// DEFAULT OWIN/JS HANDLERS:  RESPOND, DEFAULT APP, ERROR HELPER

function owinRespondMiddleware(next){
    var owin = this;
    
    this.response.setHeader('X-Powered-By', 'OWIN-JS');
    
    return next().then(
                       function (){
                       owin = null;
                       return Promise.from(null);
                       },
                       function (err){
                       owinDefaultError.call(owin,err);
                       owin = null;
                       return Promise.from(null);  }
                       );
}

function owinDefaultApp(next){
    if (this[constants.owinjs.Error])
        return Promise.reject(this[constants.owinjs.Error]);
    else if (this.response.statusCode == null)
    {
        return Promise.reject(404);
    }
    else
    {
         return Promise.from(null);
    }
}

function owinDefaultError(err){
    console.log("Server Error " + err + " for " + this.request.path);
    
    if (err==404)
    {
        this.response.writeHead(404, {'Content-Type': 'text/html'});
        this.response.end('<h1>404 Not Found</h1><p>Could not find resource:</p><xmb>' + this.request.path + '</xmb>');
    }
    else
    {
        this.response.writeHead(500, {'Content-Type': 'text/html'});
        this.response.end('<h1>500 Server Error</h1><p>An error has occurred:</p><xmb>' + err + '</xmb> ');
    }
}