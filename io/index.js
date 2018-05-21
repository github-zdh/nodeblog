const Koa = require('koa');
const koa = new Koa();
const http = require('http');
var cors = require('koa-cors');
const static = require('koa-static');

// global._dirname 根目录
global._dirname = __dirname;
// 跨域KOA-CORS
const koaOptions = {
    origin: true,
    credentials: true
};
koa.use(cors(koaOptions));

// 静态文件配置
koa
  .use(static(__dirname + '/public'));

// koa.listen(3000);
const server = http.createServer(koa.callback()).listen(3000);
console.log('http://localhost:3000/');

var io = require('socket.io')(server);


// 
var room = io.of('/room');
require('./room')(room);
