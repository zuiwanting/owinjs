/*
 * nodeFunc = (void) function(owin, callback)
 * appFunc = (Promise) function(owin)
 * appletFunc = (Promise) function(owin)   nodeletFunc = (void) function(owin, callback)
 * app.use = function(middleware)   OR function(middlewareAsync)
 * middleware = (void) function(next, callback)  with this = owin, next=nodeletFunc;
 *         OR = (Promise) function(next) with this = owin, next=appletFunc;
 * app.build = (nodeFunc) function()  // builds all middleware into Owin/JS server format
 * app.httpCallback = (function(req, res)) function()  // builds all middleware into http server format
 * */

/**
 * Module dependencies.
 */
var Promise = require('promise');
var OwinHttp = require('./owinHttp.js');
var OwinContext = require('./owinContext');
var OwinMiddleware = require('./owinMiddleware');
var util = require('util');

appBuilder = function() {
    this.properties = {};
    this.middleware = [];
}

exports = module.exports = appBuilder;

var app = appBuilder.prototype;

app.use = function(mw){
     this.middleware.push(OwinMiddleware(mw));
     return this;
 };

app.build = function(){
    
    var mw = [owinRespondMiddleware].concat(this.middleware).concat(owinDefaultApp);
    var fn = compose(mw);
    var self = this;
    
    return function owinPipelineBuilder(owin, callback){
        OwinContext.expandContext(owin);
                
        owin.app = self;
        try {
            return fn(owin).then(function(){
                                 callback(null)},
                                 function(err){
                                 errorRespond(owin,err);
                                 callback(null);});
        }
        catch (err)
        {
            throw(err);
            owinDefaultError.call(owin,err);
            callback(null);
        }
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
                       function (){ return Promise.from(null);
                       },
                       function (err){   owinDefaultError.call(owin,err);
                       return Promise.from(null);  }
                       );
}

function owinDefaultApp(next){
    if (this["owinJS.Error"])
        return Promise.reject(this["owinJS.Error"]);
    else if (this.response.statusCode === null)
        return Promise.reject(404);
    else
    {
        return Promise.from(null);
    }
}

function owinDefaultError(err){
    console.log("OwinJS Error Occured in Pipeline " + this.request.scheme + ":\\"+ this.request.path + "\r" + err);
    
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