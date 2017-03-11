const http = require('http');
const https = require('https');
const fs = require('fs');
// 需要给出的路径
const path = require('path');
const cheerio = require('cheerio');
// 需要抓取的页面
var opt = {
    'hostname': 'movie.douban.com',
    'path': '/top250',
    'port': 80
}
// 释放我们的小蜘蛛
function spiderMovie(index) {
    console.log();
    https.get('https://' + opt.hostname + opt.path + '?start=' + index, function (res) {
        var html = '';
        res.setEncoding('utf-8');
        res.on('data', function (chunk) {
            html += chunk;
        })
        //  传输完成
        res.on('end', function () {
            //  使用第三方cheerio库 加载我们得到的html 字符串
            // console.log(html);
            var $ = cheerio.load(html);
            //  选中所有类名为item的元素 电影内容组合 document.queryselectorAll();
            //  console.log($('.item .title').text());
            var i = 0;
            var data = {};
            $('.item').each(function () {
                //  img 的srcshux
                var picUrl = $('.pic img', this).attr('src');
                //  console.log(picUrl);
                // console.log($(this).find('.title').text());//title
                i = i + 1;
                var title1 = $(this).find('.title').eq(0).text().replace(/\/n/, '').replace(/(^\s*)|(\s*$)/g, "");
                var director = $(this).find('div.bd p').eq(0).text().split('主')[0].replace(/导演|:/g, "").replace(/[\r\n]/g, "");
                var act = $(this).find('div.bd p').eq(0).text().split('主')[1].replace(/主演|演|...|:/, '').replace(/:/, '').split('...')[0].replace(/[\r\n]/g, "");
                var desc = $(this).find('div.bd p').eq(0).text().split('主')[1].replace(/主演|演|...|:/, '').split('...')[1];
                var quote = $(this).find('div.bd p').eq(1).text().replace(/[\r\n]/g, "");
                var temp = '{title:' + title1 + ',director:' + director + ',act:' + act + ',desc:' + desc + ',quote:' + quote + '}'.replace(/\ +/g, "").replace(/[ ]/g, "").replace(/[\r\n]/g, "").replace(/undefined/g, "无");
                    //console.log(temp);
                 data['top'+i]=temp;
                //data['top' + i] = JSON.parse(temp);
                //  downloadImg('./img/',picUrl);  
                                
            });
            setJson(data); 


        })
    })

}
// 生成json
function setJson(data) {
    var t=JSON.stringify(data);
    fs.writeFile('top25.json', t, (err) => {
        if (err) throw err;
        console.log('It\'s saved!');
    });
}
// 下载图片  图片放哪  图片远程网址
function downloadImg(imgDir, url) {
    https.get(url, function (res) {
        var data = '';
        // 二进制组成
        res.setEncoding('binary');
        res.on('data', function (chunk) {
            data += chunk;
        })
        res.on('end', function () {
            // 图片下载完成 保存    路径 数据 格式  回调函数
            fs.writeFile(imgDir + path.basename(url), data, 'binary', function (err) {
                if (err) {
                    console.log('保存图片失败,');
                } else {
                    console.log('图片已经保存到服务器');
                }
            });
        });
    });

}
function* doSpider(x) {
    var start = 0;
    while (start < x) {
        yield start;
        spiderMovie(start);
        start += 25;
    }
}
spiderMovie(0);
// for(var x of doSpider(250)) {
//    console.log(x);
// }
// const hostname='127.0.0.1';
// const port=3000;
// const server=http.createServer((req,res)=>{
//     res.statusCode=200;
//     res.setHeader('Content-Type','text/plain');
//     res.end('hello world');
// });
// server.listen(port,hostname,()=>{
//     console.log(`服务器运行在 http://${hostname}:${port}/`);
// })
