var express = require('express');
var path = require('path');
var ejs = require('ejs');
var mongodb = require("mongodb");
var app = express();

var fw = require('./bin/file')(require('fs'));
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
                var sort = { date: 1 };
                collection.find().sort(sort).toArray(function (err, docs) {
                    writeTxt(docs);
                    res.render('index', {blogs: docs});
                });
            }
        });
    }
};

var writeTxt = function(blogs){

    var i, file = '财上海.txt';
    fw.write(file);

    var str = "";

    for(i = 0; i<blogs.length;i++){
        var line = [];
        var date = blogs[i].date.trim();
        line.push(moment(parseInt(date,10)).format('YYYY-MM-DD HH:mm:ss'));
        line.push(blogs[i].content.trim());
        str += line.join(' | ')+'\n';
    }

    fw.append(file, str);

};


function fix2number(n) {
    return [0,n].join('').slice(-2);
}
function getTime(format) {
    var curDate = new Date();
    if (format == undefined) return curDate;
    format = format.replace(/Y/i, curdate.getFullYear());
    format = format.replace(/m/i, fix2number(curdate.getMonth() + 1));
    format = format.replace(/d/i, fix2number(curdate.getDate()));
    format = format.replace(/H/i, fix2number(curdate.getHours()));
    format = format.replace(/i/i, fix2number(curdate.getMinutes()));
    format = format.replace(/s/i, fix2number(curdate.getSeconds()));
    format = format.replace(/ms/i, curdate.getMilliseconds());
    return format;
}


app.get('/', link(db));
app.listen(3000);

console.log('http server start...');