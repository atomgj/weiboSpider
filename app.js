var cheerio = require('cheerio');
var request = require('superagent');
var cookie = "YF-Ugrow-G0=9642b0b34b4c0d569ed7a372f8823a8e; login_sid_t=9899f8e80d8db89db7f9625d21b4f349; cross_origin_proto=SSL; YF-V5-G0=bb389e7e25cccb1fadd4b1334ab013c1; _s_tentry=passport.weibo.com; Apache=7129269806772.944.1523607966698; SINAGLOBAL=7129269806772.944.1523607966698; ULV=1523607966705:1:1:1:7129269806772.944.1523607966698:; SSOLoginState=1523607984; un=gj1827@163.com; wvr=6; YF-Page-G0=d52660735d1ea4ed313e0beb68c05fc5; WBtopGlobal_register_version=2018041316; TC-V5-G0=866fef700b11606a930f0b3297300d95; TC-Page-G0=b1761408ab251c6e55d3a11f8415fc72; TC-Ugrow-G0=370f21725a3b0b57d0baaf8dd6f16a18; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9W5Glo-iJV08v41KLZqdIsCL5JpX5KMhUgL.Foe7eKe7eheXShB2dJLoIEXLxK-L1-eL1hqLxKBLB.2LB.2LxKqL1-eL1h.LxKqLBoMLBo2LxK-LB.2LBKqt; ALF=1555250068; SCF=Ai_IBHiH7Ud5Gj0d1BFgBxDa8eUCRZpLoprCH1eHxHfq0_KlqhtLO-JfmOvx02GCevIJeYc5R3kJKKdOscHV6p8.; SUB=_2A2531nhGDeRhGeVO6lER8C3IzziIHXVUou6OrDV8PUNbmtANLRLskW9NTViPFKCzZjzkhrCNhDZX8LCGK_9v43pi; SUHB=04W-jaS586oJvJ; UOR=,,login.sina.com.cn";
var cookieService = require('./bin/cookieService.js');
var dbFactory = require('./bin/mongod.js');
var urls = require('./bin/urlService.js');
var timestamp = dbFactory.timestamp;

function getScriptContent(param) {
    var url = param;
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

function getJsonContent(param) {
    var url = param;
    request.get(url)
        .set('Cookie', cookieService.getCookie())
        .set('Accept', 'application/json')
        .end(function (err, rep) {
            if (err) {
                console.error(err);
            } else {
                if (rep.body.data) {
                    var contentHTML = rep.body.data;
                    if (contentHTML) {
                        var $ = cheerio.load(contentHTML || "<div/>");
                        parseDom($);
                    }
                }
            }
        });
}

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
        }else{
            var content = $content.text().replace(/\n/g, '');
            if (content) {
                if (!timestamp[date]) {
                    console.log(date);
                    dbFactory.saveInDB({
                        date: date,
                        content: $content.text().replace(/\n/g, '')
                    });
                    timestamp[date] = date;
                }
            }
        }
    });
}

function init() {
    cookieService.setCookie(cookie);
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
