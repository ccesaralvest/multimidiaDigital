require("./libs.js");
var options = {
  debug: true,
};

var custom = require('./modules/custom.js')(options);
custom.init();