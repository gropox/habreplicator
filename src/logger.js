module.exports.error = 0;
module.exports.warn = 1;
module.exports.info = 2;
module.exports.debug = 3;
module.exports.trace = 4;


let Logger = function(source, level) {
    
    this.level = level;
    if(typeof this.level == "undefined") {
        this.level = i;
    }
    
    let p = source.split(/[\/\\]/);
    this.s = p[p.length-1].split(".")[0];
    
    
    this.log = function log(msg, l) {
        if(this.level >= l) { 
            console.log(this.s + ": " + msg);
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
