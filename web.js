var express = require('express');
var path = require('path');
var ejs = require('ejs');
var mongodb = require("mongodb");
var app = express();

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
                collection.find().toArray(function (err, docs) {
                    res.render('index', {blogs: docs});
                });
            }
        });
    }
};

app.get('/', link(db));
app.listen(3000);

console.log('http server start...');