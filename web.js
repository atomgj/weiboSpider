var express = require('express');
var path = require('path');
var ejs = require('ejs');
var mongodb = require("mongodb");
var app = express();

var fw = require('./bin/file')(require('fs'));
var dbFactory = require('./bin/mongod');
var moment = require('moment');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('.html', ejs.__express);

var server = new mongodb.Server('localhost', 27017, {auto_reconnect: true});
var db = new mongodb.Db("weibo", server, {safe: false});

db.open(function (err, db) {
    if (err) {
        console.log(err);
    } else {
        console.log('mongodb connect!');
    }
});


var link = function (db) {
    return function (req, res) {
        db.collection('财上海', {safe: true}, function (err, collection) {
            if (err) {
                console.log(err);
            } else {
                var sort = {date: 1};
                collection.find().sort(sort).toArray(function (err, docs) {
                    var data = distinctData(docs);
                    res.render('index', {blogs: data});
                    writeTxt(data);
                });
            }
        });
    }
};

var distinctData = function (data) {

    var i, dataMap = {}, newData = [];
    for (i = 0; i < data.length; i++) {
        if (!dataMap[data[i].date]) {
            dataMap[data[i].date] = data[i];
        }
    }

    for (i in dataMap) {
        if (dataMap.hasOwnProperty(i)) {
            newData.push(dataMap[i]);
        }
    }

    return newData;
};

var writeTxt = function (blogs) {

    var i, file = '财上海.txt';
    fw.write(file);

    var header = ["序号", "年", "年月", "年月日", "时", "时间", "长度", "内容"];
    fw.append(file, header.join(','));

    var str = "";

    for (i = 0; i < blogs.length; i++) {
        var line = [];
        var date = moment(parseInt(blogs[i].date.trim(), 10));
        var content = blogs[i].content.trim().replace(/,/g, "，").replace(/\r\n/g, '').replace(/\n/g, '');
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

};


app.get('/', link(db));
app.listen(3000);

console.log('http server start...');