var Segment = require('segment');

var fs = require('fs');
var fw = require('./bin/file')(fs);

var segment = new Segment();
segment
    .use('URLTokenizer')            // URL识别
    .use('WildcardTokenizer')       // 通配符，必须在标点符号识别之前
    .use('PunctuationTokenizer')    // 标点符号识别
    .use('ForeignTokenizer')        // 外文字符、数字识别，必须在标点符号识别之后
    // 中文单词识别
    .use('DictTokenizer')           // 词典识别
    .use('ChsNameTokenizer')        // 人名识别，建议在词典识别之后
    // 优化模块
    .use('EmailOptimizer')          // 邮箱地址识别
    .use('ChsNameOptimizer')        // 人名识别优化
    .use('DictOptimizer')           // 词典识别优化
    .use('DatetimeOptimizer')       // 日期时间识别优化
    // 字典文件
    .loadDict('dict.txt')           // 盘古词典
    .loadDict('dict2.txt')          // 扩展词典（用于调整原盘古词典）
    .loadDict('names.txt')          // 常见名词、人名

    .loadDict('dicts/csh.txt')

    .loadDict('wildcard.txt', 'WILDCARD', true)   // 通配符
    .loadSynonymDict('synonym.txt')   // 同义词
    .loadStopwordDict('stopword.txt') // 停止符
;

function readFile(callback) {
    var file = 'dist/财上海_pure.txt';

    fs.readFile(file, function (err, data) {
        if (err) {
            return console.error(err);
        }
        callback(data.toString().split(/\r?\n/ig));
    });
}

function startSegment(data) {

    var i;
    for (i = 0; i < data.length; i++) {
        var step1 = segment.doSegment(data[i], {
            simple: true,
            stripPunctuation: true,
            stripStopword: true
        });

        toMap(step1);
    }

    finishSegment();
}

var dictMap = {};
function toMap(arr) {
    var j;
    for (j = 0; j < arr.length; j++) {
        if (!dictMap[arr[j]]) {
            dictMap[arr[j]] = 1;
        } else {
            dictMap[arr[j]]++;
        }
    }
}

function start() {
    readFile(startSegment);
}

function finishSegment() {

    var i, dictArr = [];
    for(i in dictMap){
        if(dictMap.hasOwnProperty(i)){
            dictArr.push({w:i, c:dictMap[i]});
        }
    }

    function compare(key) {
        return function (oa, ob) {
            var va, vb, sa;
            va = oa[key];
            vb = ob[key];
            if (vb > va) {
                sa = 1;
            } else if (vb < va) {
                sa = -1;
            } else {
                sa = 0;
            }
            return sa;
        };
    }
    dictArr.sort(compare("c"));

    writeTxt(dictArr);
    console.log('done!');
}

function writeTxt(data){
    var i, file = 'dist/word_freq.txt';
    fw.write(file);
    var str = "";

    for (i = 0; i < data.length; i++) {
        var line = [];
        line.push(data[i].w);
        line.push(data[i].c);
        str += line.join(' | ') + '\n';
    }
    fw.append(file, str);
}

start();
