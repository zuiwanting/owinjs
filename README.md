[![OWIN/JS](https://raw.github.com/OwinJS/OwinJS-Spec/master/OwinJS.png)](http://owinjs.github.io)

# OwinJS/owinjs

[![NPM version](https://badge.fury.io/js/owinjs.png)](http://badge.fury.io/js/owinjs)

## About

 [`OwinJS/owinjs-spec`](https://github.com/OwinJS/owinjs-spec) defines a standard interface between Node.js (and .NET) http servers and web applications. 

In fact, OWIN/JS is a direct port of the [OWIN](http://owin.org) specification to expand the reach to Node.js servers as well as keep the reference .NET spec intact.  Published as open-source standards without dependence on any implementation or platform , the OWIN and OWIN/JS specs allow applications to be developed independently of the actual server (nGinX, IIS, Node.js, Katana, etc.)

In contrast to the  [`OwinJS/owinjs-spec`](https://github.com/OwinJS/owinjs-spec) *specification*, this repository contains an **actual** OWIN/JS **implementation** for node.js Javascript.  Since Node already contains a full function webserver `require(http)`, this repository remains  light weight and is ready to go with a handful of lines of code.

See all the other repositories in the OwinJS organization space for reference servers and middleware.


## Summary

An Owin/JS middleware/application is simply a `function(next)` that provides a single web-server owin context for each request, where it is easy to access all the http parameters  (`this.request.path`, `this.response.body` etc.).  "Tasks" (promises) are returned for full async programming without callbacks nor use of limited ES6 features.

Middleware can be chained with `app.use(middleware1).use(middleware2)` etc.

Owin/JS middleware can be used in Owin/JS servers like [nodeAppKit](https://github.com/OwinJS/NodeAppKit) with `app.build()` or can be used directly in legacy Node http servers with `app.buildHttp()`.  

Similarly, Owin/JS servers can call legacy middleware with `app.use( function(req,res){ ... }  )`.  


## NPM Package Contents

This repository contains a Node Package Manager (NPM) package with helper functions for:
 
* AppBuilder Interface and Implementation for middleware and applications, with automatic translation to async-based Tasks (Promises conforming to Promise/A specification), use of *this* for owinContext instead of separate argument, and *next* argument for middleware chaining
* OwinConnect: An OWIN/JS -> Connect/Express application bridge
* OwinHttp:  A Node Http Server --> OWIN/JS application bridge
* Promise:  Includes a dependecny to the [then/promise](https://github.com/then/promise) implementation which can be used by all other owinjs applications and middleware

This package is intended for use in Node applications that either run on an web server that conforms to the OWIN/JS specification or run using the included OwinHttp bridge from the Node Http server.

* [nodeAppKit](https://github.com/OwinJS/NodeAppKit) is an example of an OWIN/JS server implementation (that runs in cross-platform browser like window)
* [OwinHttp](./owinHttp.js) is an example of an OWIN/JS server implementation that simply pipes requests from a host Node.js `require('http')` server

## Middleware/Application Pipeline Builder: AppBuilder 
```js
app.use(middleware)
```

Adds a middleware node to the OWIN/JS function pipeline. The middleware are
invoked in the order they are added: the first middleware passed to `app.use` will
be the outermost function, and the last middleware passed to Use will be the
innermost.

### middleware
The middleware parameter determines which behavior is being chained into the pipeline. 

* If the middleware given to use is a function that takes **one** argument, then it will be invoked with the `next` component in the chain as its parameter, and with the `this` context set to the Owin/JS context.  It MUST return a promise that conforms to the Promise/A specification.

* If the middleware given to use is a function that takes **two** arguments, then it will be invoked with the `next` component in the chain as its parameter, with a Node-based callback (`function(err, result){}`)as its second parameter, and with the `this` context set to the Owin/JS context.  This type of middleware should return void.

* Legacy middleware can also be invoked with  `app.use( function(req,res){ ... }  )`, `app.use( function(req, res, next){ ... }  )` or `app.use( function(err, req, res, next){ ... }  )`.  The AppBuilder is smart enough to detect the two argument function with parameters named req and res in this case (use of different naming conventions need to be wrapped in a `function(req,res){}`), and assumes three and four argument functions are legacy.


### returns app
The AppBuilder `app` itself is returned. This enables you to chain your use statements together.

### build pipeline when all middleware added:
```js
app.build()
```
returns an Owin/JS AppFunc `(promise) function(owin)` that can be inserted into any Owin/JS server.

## Bridges

Two simple functions `owin.connect()` and `owin.http()` are provided to bridge between Owin context applications/middleware and Node.js http-style `function(req,res)` based  applications/middleware.   Often these are not used directly as the AppBuilder functionality automatically wraps legacy middleware and can reutnr a node.js-ready pipeline with `.buildHttp()`

Note: The bridges are low overhead functions, binding by reference not by value wherever possible, so middleware can be interwoven throughout the pipeline, and open up the Owin/JS world to the entire Connect/Express based ecosystem and vice versa.   

We have not ported to Koa, Mach, Kraken or other similar frameworks but it would be relatively straightforward to do so.

* `owin.connect()` consumes a Connect-based application function (one that would normally be passed to the http.CreateServer method) and returns an Owin/JS **AppFunc**.
* `owin.toHttp()` consumes an Owin/JS **AppFunc** and returns a function (that takes http.requestMessage and http.requestMessage as arguments) and one that can be passed directly to the http.createServer method    
* `app.buildHttp()` is syntactic sugar to build the pipleine and returns a node.js-ready function (that takes http.requestMessage and http.requestMessage as arguments) and one that can be passed directly to the http.createServer method   

## Example Usage

### Installation
``` js
npm install owinjs
```
    
### Hello World Example
``` js
var owin = require('owinjs');
var app = new owin.app();
app.use(function(next){
    this.response.writeHead(200, {'Content-Type': 'text/html'});
    this.response.end("<html><head></head><body>Hello World</body>");
    return next();
    });
owinjs.createServer(app.build()).listen();
```
   
### Hello World with callbacks instead of Async Promises
``` js
var owin = require('owinjs');
var app = new owin.app();
app.use(function(next, callback){
    this.response.writeHead(200, {'Content-Type': 'text/html'});
    this.response.end("<html><head></head><body>Hello World</body>");
    next(this, function(err, result){callback(err,result)});
    });
owinjs.createServer(app.build()).listen();
```

### Automatic OwinConnect Bridge to Legacy Middleware    
``` js
var owin = require('owinjs');
var app = new owin.app();  
app.use(function(req, res) {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end("<html><head></head><body>Hello World</body>");
});
owinjs.createServer(app.build()).listen(); 
```    

### OwinHttp Bridge
    
``` js
var owin = require('owinjs');
var http = require('http');
var app = new owin.app();
app.use(function(next){
    this.response.writeHead(200, {'Content-Type': 'text/html'});
    this.response.end("<html><head></head><body>Hello World</body>");
return next();
});
http.createServer(owin.buildHttp()).listen();
```  

## Definitions

 * **appFunc** = `(Promise) function()` with `this` = **owin**
 * **app.use** = `(app)function(middleware)`
 * **middleware** = `(Promise) function(next)` with `this` = **owin**, `next`=**appFunc**
 * OR **middleware** = `(void) function(next, callback)`  with `this` = **owin**, `next`=(void) function(callback)  for compatibility with traditional node Callback-style  OWIN/JS middelware
 * OR **middleware** = `fn(req, res, next)` for compatibility with Connect/ExpressJS middleware
 * OR **middleware** = `fn(err, req, res, next)` for compatibility with Connect/ExpressJS middleware
 * **app.build** = `(appFunc) function()`   // builds middleware 
 * **app.buildHttp** = `(function(req, res)) function()`   // builds middleware for compatibility with Connect/ExpressJS hosts
 * **owin** = owin context (with `.request`, `.response` object components)


## API Reference Specification
 
[`OwinJS/owinjs-spec`](https://github.com/OwinJS/owinjs-spec/blob/master/Specification.md)
