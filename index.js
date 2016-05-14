const seneca = require('seneca')();
const client = seneca.client();

const phantomActions = require('./phantom_actions.js');
const ActionTypes = require('./ActionTypes.js');

seneca.use(phantomActions, { Actions: ActionTypes.PhantomActions });
seneca.use('./file_actions.js');

const destFolder = __dirname + '/downloads/';

function act(action) {
    return new Promise((resolve, reject) => {
        client.act(action, function (err, result) {
            if (err) reject(err);
            else resolve(result);
        })
    })
}

var urlList = [
    'http://mp3.zing.vn/album/Tinh-Khuc-Vuot-Thoi-Gian-2-Various-Artists/ZWZAEWCI.html',
    'http://mp3.zing.vn/album/Tinh-Khuc-Vuot-Thoi-Gian-3-Various-Artists/ZWZBEA6D.html',
    'http://mp3.zing.vn/album/Tuyen-Tap-Cac-Bai-Hat-Hay-Nhat-Cua-Cam-Ly-Cam-Ly/ZWZ9AEB8.html'
]

function extractZingMp3FromUrl(url) {
    act({ role: 'user', cmd: 'GET_XML_SONG_LIST', url: url })
        .then((result) => {
            //Resolve XML Song List
            console.log(result.content);
            return act({ role: 'user', cmd: 'GET_SONGS_INFO_FROM_URL', url: result.content })
        })
        .then((result) => {
            //Resolve Song Info List 
            //console.log(result.content);
            return act({ role: 'user', cmd: 'GET_DOWNLOADABLE_LIST', songInfoList: result.content })
        })
        .then((result) => {
            //Get list of promise for downloadable url list
            return result.downloadableList;
        })
        .then((results) => {
            //Result Downloadable URL list
            //console.log(results);
            return act({ role: 'user', cmd: 'DOWNLOAD_FILE_LIST', songInfoList: results, destFolder: destFolder })
        })
        .then((result) => {
            //Resolve XML Song List
            return result.downloadResults
        })
        .then((results) => {
            //Resolve results of download files
            console.log(results);
        })
        .catch((err) => {
            console.log(err);
        })
}

extractZingMp3FromUrl("http://mp3.zing.vn/album/Tuyen-Tap-Cac-Bai-Hat-Hay-Nhat-Cua-Cam-Ly-Cam-Ly/ZWZ9AEB8.html");



