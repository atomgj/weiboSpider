var express = require('express');
var path = require('path');
var ejs = require('ejs');
var app = express();
var moment = require('moment');
var fw = require('./bin/file')(require('fs'));
var dbFactory = require('./bin/mongod');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('.html', ejs.__express);

var wbData = {};

/**
 * 数据去重
 */
function distinctData(data) {

    var i, dataMap = {}, newData = [];
    for (i = 0; i < data.length; i++) {
        if (!dataMap[data[i].date]) {
            dataMap[data[i].date] = data[i];
        }
    }

    for (i in dataMap) {
        if (dataMap.hasOwnProperty(i)) {
            var date = moment(parseInt(dataMap[i].date.trim(), 10));
            dataMap[i].date = date.format('YYYY-MM-DD HH:mm:ss');
            newData.push(dataMap[i]);
        }
    }

    return newData;
}

/**
 * 写入文件
 */
function writeFile(data) {

    var i, file = 'dist/财上海.txt';
    fw.write(file);

    var header = ["序号", "年", "年月", "年月日", "小时", "时间", "微博字数", "微博内容"];
    fw.append(file, header.join(','));

    var str = "";

    for (i = 0; i < data.length; i++) {
        var line = [];
        var date = moment(data[i].date);
        var content = data[i].content.trim().replace(/,/g, "，").replace(/\r\n/g, '').replace(/\n/g, '');
        line.push(i + 1);
        line.push(date.format('YYYY'));
        line.push(date.format('YYYY-MM'));
        line.push(date.format('YYYY-MM-DD'));
        line.push(date.format('HH'));
        line.push(date.format('YYYY-MM-DD HH:mm:ss'));
        line.push(content.length);
        line.push(content);
        str += line.join(',') + '\n';
    }

    fw.append(file, str);
}

/**
 * web server 启动
 */
function start(){
    function callback(){
        console.log('------query data success------');
        wbData = distinctData(dbFactory.data);
        console.log("------start writing to file ...");
        writeFile(wbData);
        console.log("------write finished!");
        app.listen(3000);
        console.log('------http server start！');
    }

    console.log('------start mongodb server------');
    dbFactory.findAll(callback);
}

start();

app.get('/', function(req, res){
    res.render('index', {data: wbData});
});
