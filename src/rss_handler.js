var db = require("./db");
var FeedParser = require('feedparser');
var log = require("./logger").getLogger(__filename, 6);
var RssItem = require("./rss_item.js");
var fs = require('fs');
var golos = require('./golos');

module.exports.handler = function(tag) {
    var feedparser = new FeedParser();

    if(typeof tag == "undefined") {
        throw "Tag is required";
    }
    feedparser.golos_tag = tag;

    feedparser.on('error', function (error) {
        log.error("unable to fetch rss");
        
    });
     
    feedparser.on('readable', async function () {
        // This is where the action is! 
        var stream = this; // `this` is `feedparser`, which is a stream 
        var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance 
        var item;

        while (item = stream.read()) {
            log.trace("\n\n\n==== got rss item > " + JSON.stringify(item));
            let rssItem = await db.get(item.guid);
            if(null == rssItem) {
                rssItem = new RssItem(item);
                rssItem.tag = feedparser.golos_tag;
                log.trace("save");
                await db.save(rssItem);
            }
            if(!rssItem.posted) {
                log.info("post item " + rssItem.guid);
                writeDebug(rssItem);
                await golos.post(rssItem);
            }
        }
    });
    
    return feedparser;
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




