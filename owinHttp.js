exports = module.exports = function(appFunc) {
  
     return function(req, res) {
        
     //   var owin = owinCreateContext();

        //TO DO fill out owin

        appFunc.call(owin, function() {});
    }
};