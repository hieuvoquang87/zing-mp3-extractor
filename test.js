var phantom = require('phantom');
var Download = require('download');
var parseString = require('xml2js').parseString;

var downloadDir = __dirname + '/downloads/';
//TO_DO: Parse Html to get link to xml data
var testUrl = 'http://mp3.zing.vn/xml/load-song/MjAxNCUyRjA4JTJGMjElMkY0JTJGNCUyRjQ0ZDAxMDZhNzE3ZThlZDA5ODkzODcyODg5MTQzZDMxLm1wMyU3QzI=';
var testUrl1 = 'http://mp3.zing.vn/xml/album-xml/knJGyLmadidkWRRyLvxTvmkH';
var testUrl2 = 'http://mp3.zing.vn/xml/album-xml/LmJHtknsBikFVmZykFcyvmkH';

var sitepage = null;
var phInstance = null;
function main () {
    phantom.create()
    .then(instance => {
        phInstance = instance;
        return instance.createPage();
    })
    .then(page => {
        sitepage = page;
        page.on('onResourceRequested', onRequest);
        page.on('onResourceReceived', onResponse);
        return page.open(testUrl2);
    })
    .then(status => {
        console.log(status);
        return sitepage.property('content');
    })
    .then(content => {
        processContent(content);
        //console.log(content);
        //sitepage.close();
        //phInstance.exit();
    })
    .catch(error => {
        console.log(error);
        phInstance.exit();
    });
}

function onRequest(request, networkRequest) {
    console.log("Request: --------------------");
    console.log(request);
    console.log("End Request: --------------------");
}

function onResponse(response) {
    console.log("Response: --------------------");
    console.log(response);
    console.log("End Response: --------------------");
}
var songList = [];
function processContent(content) {
    parseString(content, function (err, result) {
        var JsonString = JSON.stringify(result);
        console.log(JsonString);
        processJsonList(result);
    });
}

function processJsonList (jsonList) {
    jsonList.data.item.map(function (item) {
        var songItem = {
            type: item.$.type.trim(),
            title: item.title[0].trim(),
            performer: item.performer[0].trim(),
            lyric: item.lyric[0].trim(),
            source: item.source[0].trim()
        }
        console.log(songItem);
        getDownloadableSource(songItem.source, (downloadableUrl) => {
            downloadFile (songItem.title, downloadableUrl);
        });
    });
}

function getDownloadableSource(url, resultFcn) {
    console.log("Open url: " + url);
    var phTempInstance = null;
    var tempSite = null;
    phantom.create()
    .then(instance => {
        phTempInstance = instance;
        return instance.createPage();
    })
    .then(page => {
        tempSite = page;
        page.on('onResourceReceived', (response) => {
            if(response.contentType === 'audio/mpeg') {
                console.log(response.url);
                resultFcn(response.url);
            }
        });
        return page.open(url);
    })
    .then(status => {
        tempSite.close();
        phTempInstance.exit();
    })
    .catch(error => {
        console.log(error);
        phInstance.exit();
    });
}

function downloadFile (fileName, downloadableUrl) {
    new Download({ mode: '755' })
    .get(downloadableUrl)
    .dest(downloadDir).rename(fileName +'.mp3')
    .run(function (err, files) {
        if (err) {
            console.log(err);
        }
    });
}
//getDownloadableSource(testUrl, downloadFile);
main();
