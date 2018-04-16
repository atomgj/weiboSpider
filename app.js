var cheerio = require('cheerio');
var request = require('superagent');
var cookieService = require('./bin/cookieService');
var dbFactory = require('./bin/mongod');
var urls = require('./bin/urlService');
var timestamp = {};

/**
 * 缓存已抓取的时间戳，避免重复写入
 */
function getTimestamp() {
    var i, data = dbFactory.data;
    for (i = 0; i < data.length; i++) {
        timestamp[data[i].date] = data[i].date;
    }
}

/**
 * 首次显示内容来源于dom文档中script标签
 */
function getScriptContent(url) {
    request.get(url).set('Cookie', cookieService.getCookie())
        .end(function (err, rep) {
            if (err) {
                console.error(err);
            } else {
                var html = rep.text.replace('<script>', '').replace('</script>', '');
                var parent = {};
                parent.FM = {};
                parent.FM.view = function (data) {
                    return data;
                };
                var contentHTML = eval(html).html || "<div/>";
                var $ = cheerio.load(contentHTML);
                parseDom($);
            }
        });
}

/**
 * 每次显示不完整，需要加载更多
 */
function getJsonContent(url) {
    request.get(url)
        .set('Cookie', cookieService.getCookie())
        .set('Accept', 'application/json')
        .end(function (err, rep) {
            if (err) {
                console.error(err);
            } else {
                var contentHTML = rep.body.data || "<div/>";
                var $ = cheerio.load(contentHTML);
                parseDom($);
            }
        });
}

/**
 * 抓取长微博
 * @param date
 * @param param
 */
function getLongText(date, param) {
    var url = "https://weibo.com/p/aj/mblog/getlongtext?ajwvr=6&" + param + "&__rnd=" + new Date().getTime();
    request
        .get(url)
        .set('Cookie', cookieService.getCookie())
        .set('Accept', 'application/json')
        .end(function (err, rep) {
            if (err) {
                console.error(err);
            } else {
                var contentHTML;
                if (rep.body.data) {
                    contentHTML = rep.body.data.html;
                }
                var $ = cheerio.load(contentHTML || "<div/>");
                if (!timestamp[date]) {
                    console.log(date);
                    dbFactory.saveInDB({
                        date: date,
                        content: $.text()
                    });
                    timestamp[date] = date;
                }
            }
        });
}


function parseDom($) {
    $('[node-type="feed_content"]').each(function (i, elem) {
        var $elem = $(elem);
        var $date = $elem.find('[node-type="feed_list_item_date"]');
        var $content = $elem.find('[node-type="feed_list_content"]');
        var date = $date.attr('date');
        var $longtext = $elem.find('[action-type="fl_unfold"]');
        if ($longtext.length) {
            var action_data = $longtext.attr('action-data');
            getLongText(date, action_data);
        } else {
            if (!timestamp[date]) {
                console.log(date);
                dbFactory.saveInDB({
                    date: date,
                    content: $content.text().replace(/\n/g, '')
                });
                timestamp[date] = date;
            }
        }
    });
}

function init() {
    getTimestamp();
    var i;
    for (i = 0; i < urls.length; i++) {
        if (!urls[i].type) {
            getScriptContent(urls[i].url);
        } else {
            getJsonContent(urls[i].url);
        }
    }
}

init();
