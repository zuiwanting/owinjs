/*
 * nodeFunc = (void) function(owin, callback)
 * appFunc = (Promise) function(owin)
 * appletFunc = (Promise) function()   nodeletFunc = (void) function(callback)
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

appBuilder = function () {
    this.properties = {};
    this.middleware = [];
}

exports = module.exports = appBuilder;

var app = appBuilder.prototype;

app.use = function(middleware){
    this.middleware.push(middleware);
    return this;
};

app.buildNodeFunc = function(){
    var mw = [respond].concat(this.middleware).concat(defaultApp);
    var fn = compose(mw);
    var self = this;
    
    return function(owin, callback){
        OwinContext.expandContext(owin);
        
        owin.app = self;
        try {
        fn.call(owin, null,
                function(err, result){
                if (!err) {
                callback(null);}
                else {   errorRespond(owin,err);  callback(null);}
                });
        }
        catch (err)
        {
             errorRespond(owin,err);  callback(null);
        }
    }
};

app.build = function(){
    var mw = [respondAsync].concat(this.middleware).concat(defaultAppAsync);
    var fn = composeAsync(mw);
    var self = this;
    
    return function(owin, callback){
        OwinContext.expandContext(owin);
        
        owin.app = self;
        try {
            return fn(owin).then(function(){
                                 callback(null)},function(err){ errorRespond(owin,err);  callback(null);});
        }
        catch (err)
        {
            errorRespond(owin,err);  callback(null);;
        }
    }
};

app.buildAppFunc = app.build;

app.httpCallback = OwinHttp(app.build());

function compose(middleware){
    return function (next, callback){
        var i = middleware.length;
        var prev = next || function(callback){ callback(null);};
        var curr;
        while (i--) {
            curr = middleware[i];
            prev = curr.bind(this, prev);
        }
        prev(callback);
    }
}

function composeAsync(middleware){
    return function (owin){
        
        var i = middleware.length;
        var prev = function(){return new Promise(function(resolve,reject){resolve(null);});};
        var curr;
        while (i--) {
            curr = middleware[i];
            prev = curr.bind(owin, prev)
        }
        return prev();
    }
}

function errorRespond(owin, err)
{
    if (err==404)
    {
        owin.response.writeHead(404, {'Content-Type': 'text/html'});
        owin.response.end('<h1>404 Not Found</h1><p>Could not find resource:</p><xmb>' + owin.request.path + '</xmb>');
    }
    else
    {
    owin.response.writeHead(500, {'Content-Type': 'text/html'});
    owin.response.end('<h1>500 Server Error</h1><p>An error has occurred:</p><xmb>' + err + '</xmb> ');
    }
}

function respond(next, callback){
    this.response.setHeader('X-Powered-By', 'OWIN-JS');
    next(function(err, result) {
         if (err)
         {
               errorRespond(owin,err);
               callback(null);
         }
         callback(err, result);
         });
}

function respondAsync(next){
    var owin = this;
    this.response.setHeader('X-Powered-By', 'OWIN-JS');
    return next().then(
                       function(){},
                       function(err){
                       console.log("respondAsync ERROR " + owin.request.scheme + ":\\"+ owin.request.path + "\r" + err);
                       
                       errorRespond(owin,err);  return Promise.from(null);  }
                       );
}


function defaultApp(next, callback){
    if (this.response.statusCode === null)
    {
        console.log("defaultAppAsync HANDLED 404 " + this.request.scheme + ":\\"+ this.request.path );
         callback(404);
    }
    else
    {
        console.log("defaultAppAsync IGNORED" + this.request.scheme + ":\\"+ this.request.path );
        callback(null);
    }
}

function defaultAppAsync(next){
    if (this.response.statusCode === null)
    {
        console.log("defaultAppAsync HANDLED 404 " + this.request.scheme + ":\\"+ this.request.path );
        return Promise.reject(404);
    }
    else
    {
        console.log("defaultAppAsync IGNORED" + this.request.scheme + ":\\"+ this.request.path );
        return Promise.from(null);
    }
}


