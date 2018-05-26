var http=require('http');
var path = require('path');
var express=require('express');
var ejs = require('ejs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');




// var express = require('express');
// var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
// var ejs = require('ejs');
// var session = require('express-session');


// 总文件目录 例如：D:/nodeBlogWin10
global.__ROOTDIR__=__dirname;

// 网址路径 例如：http://127.0.0.1:1337/
global.__host__ = '';

// 后台登录 ===> 用户信息
global.__adminUserInfo__='adminUserInfo';
// 前台登录 ===> 用户信息
global.__webUserInfo__='webUserInfo';
// app登录 ===> app信息 存 token 如果有token 就是已经登录，没有token就还没登录
global.__appUserInfo__=[];

// 后台登录 ===> 页面信息
global.__adminPageInfo__={};
// 前台登录 ===> 页面信息
global.__webPageInfo__={};
// app登录 ===> app页面信息
global.__appPageInfo__={};

//导入模块
//前台入口
var web=require('./routers/web');
//app入口
var socket=require('./routers/app');
//后台入口
var admin=require('./routers/admin');
//微信app入口
var WeChat=require('./routers/WeChat');

var app=express();



var allowCrossDomain = function (req, res, next) {
 // res.header('Access-Control-Allow-Origin', '*');//自定义中间件，设置跨域需要的响应头。
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
};

app.use(allowCrossDomain);//运用跨域的中间件

//设置静态资源
// app.use(express.static(path.join(__dirname, 'public')));
// view engine setup -- jade
app.set('views', __dirname);
// app.set('view engine', 'ejs');
app.engine('.html', ejs.__express);//转成支持.html 文件
app.set('view engine', 'html');



// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({
//     secret: 'iteming node', //secret的值建议使用随机字符串
//     cookie: {maxAge: 60 * 1000 * 30} // 过期时间（毫秒）
// }));
// 
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser({
  limit: 50000000  //50m
}));
// app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
	  resave: true,  
	  saveUninitialized: false,  
      secret:Math.random().toString(36).substr(2),
      // secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串
      cookie: { maxAge: 10 * 60 * 60 * 1000 }
}));




app.use('/', web);
app.use('/app', socket);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function (err, req, res, next) {

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // console.log(res.locals.message);
    res.render('error',{errorMsg:err});
});




var server = http.createServer(app);

// socketIo == https://socket.io/
global.__socketIo__ = require('socket.io').listen(server);
var _socketIo = require(__ROOTDIR__+'/socketIo/socketIo');
_socketIo.init()

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(80);
// server.listen(1337, '127.0.0.1');
// console.log('Server running at http://127.0.0.1:1337/');
console.log('open server => 127.0.0.1:80');
