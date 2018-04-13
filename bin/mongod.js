var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/";

function saveInDB(param, callback) {
    mongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("weibo");
        var collection = dbo.collection("财上海");
        collection.insertOne(param, callback, function (err, res) {
            if (err) throw err;
            if (callback) {
                callback();
            }
            console.log(param.date);
            db.close();
        });
    });
}

module.exports = saveInDB;
