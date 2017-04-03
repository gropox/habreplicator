var db = require("./db");
var FeedParser = require('feedparser');
var log = require("./logger").getLogger(__filename);
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

        var stream = this; 
        var meta = this.meta; 
        var item;
        var doPost = true;
        while (item = stream.read()) {
            log.debug("got rss item = " + item.guid);
            log.trace(JSON.stringify(item));
            let rssItem = await db.get(item.guid);
            if(null == rssItem) {
                rssItem = new RssItem(item);
                rssItem.tag = feedparser.golos_tag;
                log.debug("\tsave");
                await db.save(rssItem);
            }
            //Post only one Item
            if(doPost && !rssItem.posted) {
                log.info("post item " + rssItem.guid);
                writeDebug(rssItem);
                await golos.post(rssItem);
                doPost = false;
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




