var config = require(__ROOTDIR__+'/config/config');
var express = require('express');
var router = express.Router();
var com = require(__ROOTDIR__+'/config/common');

// 公共控件 
// function publicControl(req, res, next){
// 			// 模拟已经登录
//             // config.analogLogon(req,res,next);


// 		  // 网址路径 例如：http://127.0.0.1:1337/
// 		  __host__ = global.__host__?__host__:'http://'+req.headers.host;
// 		  __appPageInfo__ = {} ;
// 		  __appPageInfo__.host = global.__host__?__host__:'http://'+req.headers.host;
// 		  __appPageInfo__.sign=req.session.sign;//是否签到
// 		  __appPageInfo__.is_login = req.session.is_login;//是否登录
// 		  __appPageInfo__.userInfo=req.session[__appUserInfo__];//用户信息
// 	      // 判断是否登录
// 	      if(!req.session[__appUserInfo__]){
// 	           return res.redirect("/login");
// 	      }
// 		  next();
// }


router.get('/'  ,  require(config.__app_c__+'/chat').index);

// 聊天列表页面
router.get('/chat'  ,  require(config.__app_c__+'/chat').index );

// 聊天列表页面
router.get('/talk'  ,  require(config.__app_c__+'/chat').talk );

module.exports = router;