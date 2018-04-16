var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/";

var dbFactory = {};

dbFactory.data = {};
dbFactory.saveInDB = function(param, callback) {
    mongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("weibo");
        var collection = dbo.collection("财上海");

        collection.insertOne(param, callback, function (err, res) {
            if (err) throw err;
            if (callback) {
                callback();
            }
            db.close();
        });
    });
};

dbFactory.findAll = function(callback){
    mongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("weibo");
        var collection = dbo.collection("财上海");

        collection.find().sort({date: -1}).toArray(function (err, docs) {
            dbFactory.data = docs;
            callback();
            db.close();
        });
    });
};

module.exports = dbFactory;
