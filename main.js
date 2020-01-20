let express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs');
const fse = require("fs-extra");
const multer = require('multer');
const multiparty = require("multiparty");
const path = require('path');
const UPLOAD_DIR = ''
let app = express()
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(multer({dest: './dist'}).array('file'));  //此处的array('file')对应html部分的name

app.use((req, res, next) => {
    // 设置是否运行客户端设置 withCredentials
    // 即在不同域名下发出的请求也可以携带 cookie
    res.header("Access-Control-Allow-Credentials",true)
    // 第二个参数表示允许跨域的域名，* 代表所有域名
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS') // 允许的 http 请求的方法
    // 允许前台获得的除 Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma 这几张基本响应头之外的响应头
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    if (req.method == 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next()
    }
})

app.post('/file_upload', function(req, res){
    const multipart = new multiparty.Form();
    multipart.parse(req, async (err, fields, files) => {
        console.log(files)
        if (err) {
            return;
        }
        const [chunk] = files.chunk;
        const [hash] = fields.hash;
        const [filename] = fields.fileName;
        const chunkDir = `${UPLOAD_DIR}/${filename}`;

           // 切片目录不存在，创建切片目录
        if (!fse.existsSync(chunkDir)) {
            await fse.mkdirs(chunkDir);
        }

              // fs-extra 专用方法，类似 fs.rename 并且跨平台
                  // fs-extra 的 rename 方法 windows 平台会有权限问题
                      // https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
        await fse.move(chunk.path, `e://js-worker//uploadChunkBackend//tmp//${hash}`);
        res.end("received file chunk");
    });
})

app.listen(9006)
