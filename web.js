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

function replaceTxt(str){
    var rts;
    rts = str.trim().replace(/,/g, "，").replace(/\r\n/g, '').replace(/\n/g, '');
    return rts;
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
        var content = replaceTxt(data[i].content);
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

function writeSimpleText(data){
    var i, file = 'dist/财上海_simp.txt';
    fw.write(file);
    var header = ["时间","微博内容"];
    fw.append(file, header.join(','));
    var str = "";

    for (i = 0; i < data.length; i++) {
        var line = [];
        var date = moment(data[i].date);
        var content = replaceTxt(data[i].content);
        line.push(date.format('YYYY-MM-DD HH:mm:ss'));
        line.push(content);
        str += line.join(',') + '\n';
    }
    fw.append(file, str);
}

function writePureTxtFile(data){
    var i, file = 'dist/财上海_pure.txt';
    fw.write(file);
    var str = "";

    for (i = 0; i < data.length; i++) {
        var line = [];
        var content = replaceTxt(data[i].content);
        line.push(content);
        str += line.join(',') + '\n';
    }
    fw.append(file, str);
}

function writeMarkdown(key, data){
    var i, header, file = 'md/'+key+'.md';
    header = '---\n' +
        'title: '+key+'\n' +
        'date: '+data.date+'\n' +
        'layout: true\n' +
        '---\n';

    fw.write(file);
    fw.append(file, header);

    var str = "";

    for (i = 0; i < data.content.length; i++) {
        var line = [];
        var date = moment(data.content[i].date);
        var content = replaceTxt(data.content[i].content);
        line.push(date.format('YYYY-MM-DD HH:mm:ss'));
        line.push(content);
        str += '\n>'+line.join('\n>') + '\n---\n';
    }
    fw.append(file, str);
}

function writeMarkdownFile(data){
    var i, map = {}, date, month, lastDay;
    for(i = 0; i < data.length; i++){
        date = moment(data[i].date);
        month = date.format('YYYY年第ww周');
        lastDay = moment(data[i].date).endOf('w').format('YYYY-MM-DD');
        if(!map[month]){
            map[month] = {
                date: lastDay,
                content: []
            };
        }
        map[month].content.push(data[i]);
    }

    for(i in map){
        if(map.hasOwnProperty(i)){
            writeMarkdown(i, map[i]);
        }
    }
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
        writeSimpleText(wbData);
        writePureTxtFile(wbData);
        writeMarkdownFile(wbData);
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
