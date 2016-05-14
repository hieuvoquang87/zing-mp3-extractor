var page = require('webpage').create();
var Download = require('download');

var downloadDir = './downloads/';
var url = 'http://mp3.zing.vn/xml/load-song/MjAxNCUyRjA4JTJGMjElMkY0JTJGNCUyRjQ0ZDAxMDZhNzE3ZThlZDA5ODkzODcyODg5MTQzZDMxLm1wMyU3QzI=';
var url1 = 'http://mp3.zing.vn/xml/album-xml/knJGyLmadidkWRRyLvxTvmkH';


page.onResourceRequested = function(request) {
  console.log('Request ' + JSON.stringify(request, undefined, 4));
};
page.onResourceReceived = function(response) {
  console.log('Receive ' + JSON.stringify(response, undefined, 4));
  console.log("About to download url: " + response.url);
  downloadFile('song', response.url);
};
page.open(url1);

function downloadFile(name, downloadUrl) {
  new Download({mode: '755'})
    .get(downloadUrl)
    .dest(downloadDir).rename(name+'.mp3')
    .run(function (err, files) {
        if(err) {
            console.log(err);
        }
    });

}

