
var steem = require("steem");
var global = require("./global");
var db = require("./db");
var log = require("./logger").getLogger(__filename, 12);
var speakingurl = require("speakingurl");
var RssItem = require("./rss_item");

const golos_ws = "wss://ws.golos.io";
steem.config.set('websocket',golos_ws);
steem.config.set('address_prefix',"GLS");
steem.config.set('chain_id','782a3039b478c839e4cb0c941ff4eaeb7df40bdd68bd441afd444b9da763de12');

log.debug(steem.config.get('websocket'));

var timeDiff = 0;
var lastRetrievedProps = 0;

const USERID = global.settings.userid;
const POSTING_KEY = global.settings.postingKey;
const NEWS_TAG = "geektimes";
var props = {};

/** holt properties */
async function retrieveDynGlobProps() {
    try {
        //console.log("current time " + new Date().getTime());
        //console.log("last retrieved " + lastRetrievedProps );
        //console.log("timeDiff " + timeDiff );
        if(lastRetrievedProps + timeDiff + 15000 < new Date().getTime()) {
            log.debug("retrieve dyn glob props"); 
            props = await steem.api.getDynamicGlobalPropertiesAsync();
            //console.log(JSON.stringify(props));
            lastRetrievedProps = getCurrentServerTime();
            //console.log("last retrieved " + lastRetrievedProps );              
            timeDiff = new Date().getTime() - lastRetrievedProps;
        }
    } catch(e) {
        log.error(e);
    }        
}

/** time in milliseconds */
function getCurrentServerTime() {
    return Date.parse(props.time) + timeDiff;
}

async function getContent(permlink) {

    try {
        var content = await steem.api.getContentAsync(USERID, permlink);
        return content;
    } catch(e) {
        log.error(e);
    }        
}

async function testComment(parent_author, parent_permlink, author, permlink, title, body, json) {
    log.info("broadcast comment");
    log.info("  parent_author = " + parent_author);
    log.info("  parent_permlink = " + parent_permlink);
    log.info("  author = " + author);
    log.info("  permlink = " + permlink);
    log.info("  title = " + title);
    log.info("  body = " + body);
    log.info("  json = " + json);
}

async function testCommentOptions(author, permlink, max_accepted_payout, percent_steem_dollars, allow_votes, allow_curation_rewards, extensions) {
    log.info("broadcast comment_options");
    log.info("  author = " + author);
    log.info("  permlink = " + permlink);
    log.info("  max_accepted_payout = " + max_accepted_payout);
    log.info("  percent_steem_dollars = " + percent_steem_dollars);
    log.info("  allow_votes = " + allow_votes);
    log.info("  allow_curation_rewards = " + allow_curation_rewards);
    log.info("  extensions = " + extensions);
    
    log.info("====\n\n\n");
}

module.exports.post = async function(rssItem) {
    let success = false;
    try {
        log.debug("post " + rssItem.title);
        var json = JSON.stringify({
            tags:[NEWS_TAG],
            image:[rssItem.getImage()],
            links:[rssItem.permalink],
            app:"habreplicator",
            format:"markdown"});

        var permlink = await createPermlink(rssItem);

        let content = await getContent(permlink);
        
        if(content.permlink == permlink) {
            log.info("already posted " + permlink);
            return;
        }

        testComment("", NEWS_TAG, USERID, permlink, 
            rssItem.title, rssItem.convert(), json);
        await steem.broadcast.commentAsync(POSTING_KEY, "", NEWS_TAG, USERID, permlink, 
            rssItem.title, rssItem.convert(), json, function(e, m)  {
                log.trace(e);
                log.trace(m);
                success = (e == null);
                //set option
                if(success) {
                    testCommentOptions(USERID, permlink, 0, 10000, true, true, []);
                    steem.broadcast.commentOptionsAsync(POSTING_KEY, USERID, permlink, "0.000 GBG", 10000, true, true, []);  
                    rssItem.posted = true;
                    db.save(rssItem);                
                } 
            });
        return success;
    } catch(e) {
        log.error(e);
        return false;
    }        
}

// copypaste from https://gist.github.com/tamr/5fb00a1c6214f5cab4f6
// (it have been modified: ий > iy and so on)
// this have been done beecause we cannot use special symbols in url (`` and '')
// and url seems to be the only source of thruth
var d = /\s+/g,
    //rus = "щ  ш   ч   ц   ю   ю   я   я  ые   ий  ё   ё   ж   ъ   э   ы   а   б   в   г   д   е   з   и   й   к   л   м   н   о   п   р   с   т   у   ф   х   х   ь".split(d),
    //eng = "sch    sh  ch  cz  yu  ju  ya  q  yie  iy  yo  jo  zh  w   ye  y   a   b   v   g   d   e   z   i   yi  k   l   m   n   o   p   r   s   t   u   f   x   h   j".split(d);

    rus = "щ    ш  ч  ц  й  ё  э  ю  я  х  ж  а б в г д е з и к л м н о п р с т у ф ъ  ы ь ґ є і ї".split(d),
    eng = "shch sh ch cz ij yo ye yu ya kh zh a b v g d e z i k l m n o p r s t u f xx y x g e i i".split(d);

function detransliterate(str, reverse) {
  if (!str) return str
    if (!reverse && str.substring(0, 4) !== 'ru--') return str
    if (!reverse) str = str.substring(4)

    // TODO rework this
    // (didnt placed this earlier because something is breaking and i am too lazy to figure it out ;( )
    if(!reverse) {
    //    str = str.replace(/j/g, 'ь')
    //    str = str.replace(/w/g, 'ъ')
        str = str.replace(/yie/g, 'ые')
    }
    else {
    //    str = str.replace(/ь/g, 'j')
    //    str = str.replace(/ъ/g, 'w')
        str = str.replace(/ые/g, 'yie')
    }

    var i,
        s = /[^[\]]+(?=])/g, orig = str.match(s),
        t = /<(.|\n)*?>/g, tags = str.match(t);

    if(reverse) {
        for(i = 0; i < rus.length; ++i) {
            str = str.split(rus[i]).join(eng[i]);
            str = str.split(rus[i].toUpperCase()).join(eng[i].toUpperCase());
        }
    }
    else {
        for(i = 0; i < rus.length; ++i) {
            str = str.split(eng[i]).join(rus[i]);
            str = str.split(eng[i].toUpperCase()).join(rus[i].toUpperCase());
        }
    }

    if(orig) {
        var restoreOrig = str.match(s);

        for (i = 0; i < restoreOrig.length; ++i)
            str = str.replace(restoreOrig[i], orig[i]);
    }

    if(tags) {
        var restoreTags = str.match(t);

        for (i = 0; i < restoreTags.length; ++i)
            str = str.replace(restoreTags[i], tags[i]);

        str = str.replace(/\[/g, '').replace(/\]/g, '');
    }

    return str;
}

async function createPermlink(rssItem) {
    let permlink = 
        slug(detransliterate(rssItem.title));
    //https://geektimes.ru/post/287440/
    let m = rssItem.guid.match(/([0-9]+)/);
    if(m) {
        permlink = permlink + "-" + m[1];
    }
    
    return permlink;
}

function makeTrail()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


function slug(text) {
    return speakingurl(text.replace(/[<>]/g, ''), {truncate: 128})
}

createPermlink({
    guid:"https://geektimes.ru/post/", 
    title: "Привет, я здесь и там"}
).then( (m) => log.debug(m) );
