var urls = [];

var pageNo = 765;
var str1 = 'https://weibo.com/u/1565668374?pids=Pl_Official_MyProfileFeed__21&is_search=0&visible=0&is_all=1&is_tag=0&profile_ftype=1&page=',
    str2 = '&ajaxpagelet=1&ajaxpagelet_v6=1&__ref=%2Fu%2F1565668374%3Fis_search%3D0%26visible%3D0%26is_all%3D1%26is_tag%3D0%26profile_ftype%3D1%26page%3D2%23feedtop&_t=FM_152358484928032';
var _str1 = 'https://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100505&topnav=1&wvr=6&topsug=1&is_all=1&pagebar=',
    _str2 = '&pl_name=Pl_Official_MyProfileFeed__21&id=1005051565668374&script_uri=/u/1565668374&feed_type=0&page=',
    _str3 = '&pre_page=1&domain_op=100505&__rnd=';

function getURL() {
    var i, j;

    //若抓取超过50页，微博服务器缓存溢出，会暂时拒绝服务
    for (i = 565; i < 730; i++) {
        urls.push({type: 0, url: str1 + i + str2});
        for (j = 0; j < 2; j++) {
            urls.push({type: 1, url: _str1 + j + _str2 + i + _str3 + new Date().getTime()})
        }
    }
}

getURL();
module.exports = urls;