


var db = require("./db");
var FeedParser = require('feedparser');
var log = require("./logger").getLogger(__filename);
var RssItem = require("./rss_item.js");
var fs = require('fs');

class RssHandler extends FeedParser {

    constructor(tag) {
        super();
        log.debug("called constructor");
        
        if(typeof tag == "undefined") {
            throw "Tag is required";
        }
        log.debug("got tag " + tag);
        this.tag = tag;
        
        this.oncePosted = false;
        
        this.retrieved = 0;
        this.newItems = 0;

        log.debug("setup handlers");
        this.on('error', function (error) {
            log.error("unable to fetch rss");
        });
         
        this.on('readable', async function () {
            var stream = this; 
            var meta = this.meta; 
            var item;
            var doPost = true;
            while (item = stream.read()) {
                log.debug("got rss item = " + item.guid);
                log.trace(JSON.stringify(item));
                let rssItem = await db.get(item.guid);
                this.retrieved = this.retrieved + 1;
                if(null == rssItem) {
                    this.newItems = this.newItems + 1;
                    rssItem = new RssItem(item);
                    rssItem.tag = this.tag;
                    log.trace("\tsave " + item.guid);
                    db.save(rssItem);
                }
            }
        });
    }
}

function writeDebug(i) {
    let file = i.guid.replace(/\//g, "_");
    file = file.replace(/:/g,"_");
    fs.writeFile("/tmp/" + file, i.convert(), function(err) {
        if(err) {
            return console.log(err);
        }
    });         
}

module.exports.RssHandler = RssHandler;


