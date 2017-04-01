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
        request.get(global.settings.geek_rss)
            .on("error", function(error){ log.error(error) })
            .on("response", function(resp) {
                  log.debug("got response " + resp.statusCode);  
                  if (resp.statusCode !== 200) {
                    this.emit('error', log.error("got wrong statusCode " + resp.statusCode ));
                  } else {
                    
                    this.pipe(rssh.handler());
                    
                  }
            });
        await sleep(DELAY_MS);
    }    
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
