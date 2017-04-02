var hr = require("./src/habreplicator");
var global = require("./src/global");

process.argv.forEach(function (val, index, array) {
    if("broadcast" == val) {
        global.settings.broadcast = true;
    }
});

hr.run();


