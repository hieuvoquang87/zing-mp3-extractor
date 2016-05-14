
const phantom = require('phantom');
const BBPromise = require('bluebird');
const parseString = require('xml2js').parseString;
const cheerio = require('cheerio');

function getDownloadableSource(songInfo, resolve, reject) {
    var phTempInstance = null;
    var sitepage = null;
    const url = songInfo.source;
    phantom.create()
    .then(instance => {
        phTempInstance = instance;
        return instance.createPage();
    })
    .then(page => {
        sitepage = page;
        page.on('onResourceReceived', (response) => {
            if(response.contentType === 'audio/mpeg') {
                songInfo.downloadableUrl = response.url;
                resolve(songInfo);
            }
        });
        return page.open(url);
    })
    .then(status => {
        sitepage.close();
        phTempInstance.exit();
    })
    .catch(error => {
        reject(error);
        phInstance.exit();
    });
}

function requestPage(url, resolve, reject) {
    var sitepage = null;
    var phInstance = null;
    phantom.create()
    .then(instance => {
        phInstance = instance;
        return instance.createPage();
    })
    .then(page => {
        sitepage = page;
        //page.on('onResourceRequested', onRequest);
        //page.on('onResourceReceived', resolve);
        return page;
    })
    .then((page) => {
        return page.open(url);
    })
    .then(status => {
        return sitepage.property('content');
    })
    .then(content => {
        parseString(content, function (err, result) {
            var songInfoList = processJsonList (result);
            resolve(songInfoList);
        });
        sitepage.close();
        phInstance.exit();
    })
    .catch(error => {
        reject(error);
        phInstance.exit();
    });
}

function processJsonList (jsonList) {
    return jsonList.data.item.map(function (item) {
        var songItem = {
            type: item.$.type.trim(),
            title: item.title[0].trim(),
            performer: item.performer[0].trim(),
            lyric: item.lyric[0].trim(),
            source: item.source[0].trim()
        }
        return songItem;
    });
}

function getXmlSongList (url, resolve, reject) {
    console.log('Open url: ' + url);
    var phTempInstance = null;
    var sitepage = null;
    phantom.create()
    .then(instance => {
        phTempInstance = instance;
        return instance.createPage();
    })
    .then(page => {
        sitepage = page;
        return page.open(url);
    })
    .then(status => {
        return sitepage.property('content');
    })
    .then(content => {
        if(content.indexOf('html') !== -1) {
            const $ = cheerio.load(content);
            var xmlUrl = $('#html5player').attr('data-xml');
            resolve(xmlUrl);
        }
    })
    .then(status => {
        sitepage.close();
        phTempInstance.exit();
    })
    .catch(error => {
        reject(error);
        phInstance.exit();
    });
}

module.exports = function (options) {
    var seneca = this;
    seneca.add({cmd: 'GET_SONGS_INFO_FROM_URL'}, function (args, callback) {
        const url = args.url;
        new Promise(function (resolve, reject) {
                    requestPage(url, resolve, reject);
                }).then((result) => {
                    callback(null, {content: result});
                }).catch((err) => {
                    callback(err, null);
                });
        
    });
    seneca.add({cmd: 'GET_DOWNLOADABLE_LIST'}, function (args, callback) {
        const songInfoList = args.songInfoList;
        var urlList = [];
        for(var i in songInfoList) {
            if(songInfoList[i].source.indexOf('http://') !== -1) {
                urlList.push(new BBPromise(function (resolve, reject) {
                    getDownloadableSource(songInfoList[i], resolve, reject);
                }));
            }
        }
        callback(null, {downloadableList: BBPromise.all(urlList)});
    });
    seneca.add({cmd: 'GET_XML_SONG_LIST'}, function (args, callback) {
        const url = args.url;
        new Promise(function (resolve, reject) {
                    getXmlSongList(url, resolve, reject);
                }).then((result) => {
                    callback(null, {content: result});
                }).catch((err) => {
                    callback(err, null);
                });
    });
    seneca.listen({
        type: 'tcp',
        host: 'localhost',
        port: '27030'
    })
}
