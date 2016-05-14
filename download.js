var downloadDir = __dirname + '/downloads/';
var downloadRootUrl = 'http://stream2.cache70.vcdn.vn/fsfsdfdsfdserwrwq3/a8c519fa98c86d27f262e3175502fe92/57341674/2014/08/21/4/4/44d0106a717e8ed09893872889143d31.mp3';

var url1 = 'http://mp3.zing.vn/xml/album-xml/knJGyLmadidkWRRyLvxTvmkH';

var Download = require('download');


var downloadUrl = url1;//downloadRootUrl;
new Download({ mode: '755' })
    .get(downloadUrl)
    .dest(downloadDir).rename('songs'+'.mp3')
    .run(function (err, files) {
        if (err) {
            console.log(err);
        }
    });
