var nedb = require("nedb");
var global = require("./global");
var log = require("./logger").getLogger(__filename);
var RssItem = require("./rss_item");

const HOME = global.settings.dbdir;
const DBFILE = HOME + "/habreplicator_fetched.db";

var dbFetched = new nedb({filename : DBFILE, autoload : true});

module.exports.get = async function(guid) {
  log.debug("get(" + guid + ")");
  return new Promise(resolve => {
    dbFetched.find({ guid : guid }, function(err, docs) {
        if(err) {
            log.error("err + " + err);
            throw err;
        }
        
        if(docs.length > 0) {
            log.trace("found existing item");
            resolve(new RssItem(docs[0]));
        } else {
            log.trace("item not found ");
            resolve(null);
        }
    });
  });
}

module.exports.getUnpostedItems = async function() {
  log.debug("getUnpostedItems");
  return new Promise(resolve => {
    dbFetched.find({posted:false}, function(err, docs) {
        if(err) {
            log.error("err + " + err);
            throw err;
        }
        log.debug("got docs " + docs.length);
        let ret = [];
        for(let i = 0; i < docs.length; i++) {
            let item = new RssItem(docs[i]);
            ret[i] = item;
        }
        resolve(ret);
    });
  });
}


module.exports.save = async function(item) {
  return new Promise(async (resolve) => {
        if(!item || typeof item == "undefined") {
            throw "item undefined!";
        }
        log.trace("save item ");
        let itemstor = {}
        Object.assign(itemstor, item);
        dbFetched.update({ guid : item.guid }, itemstor, {upsert : true}, function(err, numReplaced, upsert) {
            if(err) {
                log.error("error = " + err);
                throw err;
            }
            log.trace("saved item = " + item.guid + "(" + upsert + "," + numReplaced + ")");
            resolve(true);
        });
    resolve(true);
  });     
}



