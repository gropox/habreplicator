require("./logger");
var RssHandler = require("./rss_handler").RssHandler;
var request = require('request'); // for fetching the feed 
var db = require("./db");
var golos = require('./golos');
var log = require("./logger").getLogger(__filename);

var global = require("./global");

const DELAY_MS = 1000 * 60 * 30;

//loop
    //fetch items
    //post items    

module.exports.run = async function() {
    
    while(true) {
        try {
            log.info("fetch rss");
            
            readRss(global.settings.geek_rss, "geektimes");
            readRss(global.settings.habr_rss, "habrahabr");
            await sleep(30*1000); //let golos do its work
            
            //получаем все записи, которые еще не отправлены и постим
            let items = await db.getUnpostedItems();
            if(items && items.length && items.length > 0) {
                log.debug("got unposted items " + items.length);
                log.info("post item " + items[0].guid);
                golos.post(items[0]);
            }
            await sleep(DELAY_MS);
        } catch(e) {
            await sleep(DELAY_MS);            
            log.error("Error catched in main loop!");
            log.error(golos.getExceptionCause(e));   
        }
    }
    process.exit(123);
}

function readRss(url, tag) {
    let handler = new RssHandler(tag);
    request.get(url)
        .on("error", function(error){ log.error(error) })
        .on("response", function(resp) {
            log.debug("got response " + resp.statusCode);  
            if (resp.statusCode !== 200) {
                this.emit('error', log.error("got wrong statusCode " + resp.statusCode ));
            } else {
                this.pipe(handler);
            }
        });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
