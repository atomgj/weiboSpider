var Segment = require('segment');

var fs = require('fs');


var segment = new Segment();
segment.useDefault();

segment.loadSynonymDict('synonym.txt');
console.log();


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
            convertSynonym: true,
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
            if (vb < va) {
                sa = 1;
            } else if (vb > va) {
                sa = -1;
            } else {
                sa = 0;
            }
            return sa;
        };
    }
    dictArr.sort(compare("c"));

    console.log(dictArr);
}

start();
