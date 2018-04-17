var Segment = require('segment');


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


    .loadDict('../dicts/csh.txt')

    .loadDict('wildcard.txt', 'WILDCARD', true)   // 通配符
    .loadSynonymDict('synonym.txt')   // 同义词
    .loadStopwordDict('stopword.txt') // 停止符
;

var text = "路边撒尿。如果是步行，我是反对随地撒尿的。但开车的话，要实事求是。司机是可以找厕所，但找厕所之前，你要先找到停车场，如果你不熟悉的区域，找到停车场，再去厕所，估计四十分钟了。如果是在高架上，估计一个小时了。我不相信你憋的住。如果司机憋昏过去了，导致车辆失控，反而不好。 ​​​​";


var arr = segment.doSegment(text, {
    simple: true,
    stripPunctuation: true
});

console.log(arr);