var cheerio = require('cheerio');
var request = require('superagent');
var cookie = "YF-Ugrow-G0=8751d9166f7676afdce9885c6d31cd61; login_sid_t=78f468e6e97f5edb9266adc274471365; cross_origin_proto=SSL; YF-V5-G0=8d4d030c65d0ecae1543b50b93b47f0c; _s_tentry=passport.weibo.com; Apache=9450790365086.54.1523605099188; SINAGLOBAL=9450790365086.54.1523605099188; ULV=1523605099195:1:1:1:9450790365086.54.1523605099188:; appkey=; WB_register_version=60527d22cd000e4c; UOR=,,login.sina.com.cn; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9W5Glo-iJV08v41KLZqdIsCL5JpX5K2hUgL.Foe7eKe7eheXShB2dJLoIEXLxK-L1hqL1K.LxKqL1KBLBoqLxKqLBoqLBo-LxKqLB-qL1h-LxKMLBKqL1hBt; ALF=1555141493; SSOLoginState=1523605493; SCF=Ai_IBHiH7Ud5Gj0d1BFgBxDa8eUCRZpLoprCH1eHxHfqlsZKQv1iawZp9we9Tf9n60wUZP_ihIm-UYxn-bfKmsY.; SUB=_2A2531C-mDeRhGeVO6lER8C3IzziIHXVUoAZurDV8PUNbmtBeLVrtkW9NTViPFCJowOpOhfgrRCFtrmpQ8TwskuD6; SUHB=0JvwoOqcNHgJl1; un=gj1827@163.com; wvr=6; YF-Page-G0=0dccd34751f5184c59dfe559c12ac40a; WBtopGlobal_register_version=2018041315";
var cookieService = require('./bin/cookieService.js');
var saveInDB = require('./bin/mongod.js');
var urls = require('./bin/urlService.js');

var timestamp = {};

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
                    console.log('###############long###############');
                    saveInDB({
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
                    saveInDB({
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
