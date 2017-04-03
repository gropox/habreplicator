var debug = require("debug");



let Logger = function(source, level) {
        
    let p = source.split(/[\/\\]/);
    this.s = p[p.length-1].split(".")[0];
    
    this._trc = debug("habreplicator:trc:" + this.s);
    this._dbg = debug("habreplicator:dbg:" + this.s);
    this._inf = debug("habreplicator:inf:" + this.s);
    this._wrn = debug("habreplicator:wrn:" + this.s);
    this._err = debug("habreplicator:err:" + this.s);
    
    debug.enable("habreplicator:err* habreplicator:wrn* habreplicator:inf*");

    this.trace = function(msg) {
        this._trc(msg);
    }
    
    this.debug = function(msg) {
        this._dbg(msg);
    }

    this.info = function(msg) {
        this._inf(msg);
    }

    this.warn = function(msg) {
        this._wrn(msg);
    }

    this.error = function(msg) {
        this._err(msg);
    }
}    

module.exports.getLogger = function (f,l) {
    return new Logger(f,l);
}

