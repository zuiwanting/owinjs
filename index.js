exports.app = require('./owinAppBuilder.js');
exports.connect = require('./owinConnect.js');
exports.http = require('./owinHttp.js');
exports.createContext = require('./owinCreateContext.js');

//Promise
var Promise = require('promise');
Promise.empty = Promise.from(null);
global.Promise = exports.Promise = Promise;