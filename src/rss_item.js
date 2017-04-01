module.exports = function(item) {
    this.title = item.title;
    this.summary = item.summary;
    this.guid = item.guid;
    this.date = item.date;
    this.author = item.author;
    this.permalink = item.permalink;

    if(typeof item.posted == "undefined") {
        this.posted = false;
    } else {
        this.posted = item.posted;
    }
    
    this.getImage = function () {
        let match = this.summary.match(/<img.*src="([^"]+)"/);
        if(match) {
            return match[1];
        } else {
            return "";
        }
    }
    
    this.convert = function() {
        return "<html><body><div class=\"text-justify\">"
            + "Автор: " + this.author 
            + "<br/>" + "Источник: " + this.guid
            + "<br/>" + this.summary.replace(/&rarr;/,"")
            + "</div></body></html>";
    }

}

