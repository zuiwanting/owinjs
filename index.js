exports.app = require('./owinAppBuilder.js');
exports.connect = require('./owinConnect.js');
exports.http = require('./owinHttp.js');
exports.context = require('./owinContext.js');
exports.middleware = require('./owinMiddleware');

//Promise
var Promise = require('promise');
Promise.empty = Promise.from(null);
global.Promise = exports.Promise = Promise;