const Download = require('download');
const BBPromise = require('bluebird');
function downloadFile(title, downloadableUrl, destFolder, resolve, reject) {
    console.log('Downloading url: ' + downloadableUrl);
    const fileName = title + '.mp3';
    new Download({ mode: '755' })
        .get(downloadableUrl)
        .dest(destFolder).rename(fileName)
        .run(function (err, files) {
            if (err) {
                reject(err);
            } else {
                resolve('Successfully download file: ' + destFolder + fileName);
            }
        });
}
function downloadFileList(fileList) {

}
module.exports = function (options) {
    var seneca = this;
    seneca.add({ cmd: 'DOWNLOAD_FILE_LIST' }, function (args, callback) {
        var downloadResults = [];
        for (var i in args.songInfoList) {
            var title = args.songInfoList[i].title;
            var downloadableUrl = args.songInfoList[i].downloadableUrl;
            var destFolder = args.destFolder;
            downloadResults.push(new BBPromise(function (resolve, reject) {
                downloadFile(title, downloadableUrl, destFolder, resolve, reject);
            }));
        }
        callback(null, { downloadResults: BBPromise.all(downloadResults) });
    });
    seneca.listen({
        type: 'tcp',
        host: 'localhost',
        port: '27031'
    })
}