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
var owinHttp = require('./owinHttp.js');

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

app.httpCallback = owinHttp(app.build());

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
        owin.Response.writeHead(404, {'Content-Type': 'text/html'});
        owin.Response.end('<h1>404 Not Found</h1><p>Could not find resource:</p><xmb>' + owin.Request.Path + '</xmb>');
    }
    else
    {
    owin.Response.writeHead(500, {'Content-Type': 'text/html'});
    owin.Response.end('<h1>500 Server Error</h1><p>An error has occurred:</p><xmb>' + err + '</xmb> ');
    }
}

function respond(next, callback){
    this.Response.setHeader('X-Powered-By', 'OWIN-JS');
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
    this.Response.setHeader('X-Powered-By', 'OWIN-JS');
    return next().then(
                       function(){},
                       function(err){
                       console.log("respondAsync ERROR " + owin.Request.Scheme + ":\\"+ owin.Request.Path + "\r" + err);
                       
                       errorRespond(owin,err);  return Promise.from(null);  }
                       );
}


function defaultApp(next, callback){
    if (this.Response.StatusCode === null)
    {
        console.log("defaultAppAsync HANDLED 404 " + this.Request.Scheme + ":\\"+ this.Request.Path );
         callback(404);
    }
    else
    {
        console.log("defaultAppAsync IGNORED" + this.Request.Scheme + ":\\"+ this.Request.Path );
        callback(null);
    }
}

function defaultAppAsync(next){
    if (this.Response.StatusCode === null)
    {
        console.log("defaultAppAsync HANDLED 404 " + this.Request.Scheme + ":\\"+ this.Request.Path );
        return Promise.reject(404);
    }
    else
    {
        console.log("defaultAppAsync IGNORED" + this.Request.Scheme + ":\\"+ this.Request.Path );
        return Promise.from(null);
    }
}


