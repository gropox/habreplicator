var rssh = require("./rss_handler");
var request = require('request'); // for fetching the feed 
var log = require("./logger").getLogger(__filename, 6);

var global = require("./global");

const DELAY_MS = 1000 * 60 * 30;



//loop
    //fetch items
    //post items

module.exports.run = async function() {    
    while(true) {
        log.info("fetch rss");
        
        readRss(global.settings.geek_rss, "geektimes");
        readRss(global.settings.habr_rss, "habrahabr");
        
        await sleep(DELAY_MS);
    }    
}

function readRss(url, tag) {
    request.get(url)
        .on("error", function(error){ log.error(error) })
        .on("response", function(resp) {
            log.debug("got response " + resp.statusCode);  
            if (resp.statusCode !== 200) {
                this.emit('error', log.error("got wrong statusCode " + resp.statusCode ));
            } else {
                this.pipe(rssh.handler(tag));
            }
        });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
