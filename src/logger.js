module.exports.error = 0;
module.exports.warn = 1;
module.exports.info = 2;
module.exports.debug = 3;
module.exports.trace = 4;

var debug = require("debug");

let Logger = function(source, level) {
    
    
    this.level = level;
    if(typeof this.level == "undefined") {
        this.level = i;
    }
    
    let p = source.split(/[\/\\]/);
    this.s = p[p.length-1].split(".")[0];
    
    this._dbg = debug("habreplicator:" + this.s);

    this.log = function log(msg, l) {
        if(this.level >= l) {
            if(l >= 3) {
                this._dbg(msg);
            } else if( l == 0) {
                console.error(msg);  
            } else {
                console.log(msg);
            }
        }
    }
    
    this.trace = function(msg) {
        this.log(msg, module.exports.trace);
    }
    
    this.debug = function(msg) {
        this.log(msg, module.exports.debug);
    }

    this.info = function(msg) {
        this.log(msg, module.exports.info);
    }

    this.warn = function(msg) {
        this.log(msg, module.exports.warn);
    }

    this.error = function(msg) {
        this.log(msg, module.exports.error);
    }
}    

module.exports.getLogger = function (f,l) {
    return new Logger(f,l);
}
