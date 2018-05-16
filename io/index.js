const Koa = require('koa');
const koa = new Koa();
const http = require('http');
var cors = require('koa-cors');
const static = require('koa-static');

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
// 房间信息
global.ioRooms = {};
// 
var room = io.of('/room');
require('./room')(room);
