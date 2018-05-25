var config = require(__ROOTDIR__+'/config/config');
var express = require('express');
var router = express.Router();
var com = require(__ROOTDIR__+'/config/common');



// 公共控件 
//不管是否登录都通过这个控件
function publicControl(req, res, next){


		  next();
}

// 判断是否登录中间件
function isLogin(req, res, next){

		  // // 检查 session 中的 isVisit 字段
		  // // 如果存在则增加一次，否则为 session 设置 isVisit 字段，并初始化为 1。
		  // if(req.session.isVisit) {
		  //   // req.session.isVisit++;
		  //   req.session.isVisit='isVisit'
		  //   req.session.num++;
		  // } else {
		  //   req.session.isVisit = 'isVisit';
		  //   req.session.num = 1;
		  // }
		  // console.log(req.session);   
		  // return;  
	      // if(!req.session[__webUserInfo__]){
	      //      return res.redirect("/login");
	      // }
		  next();
}


// router.get('/' , require(config.__app_c__+'/index').index);

// 首页
// router.get('/index' ,  require(config.__app_c__+'/index').index );

// 登录
router.post('/login/login' , require(config.__app_c__+'/login').login );
// 退出登录
router.post('/login/logout' , require(config.__app_c__+'/login').logout );
// 查询用户 / 添加朋友
router.post('/search/user' , require(config.__app_c__+'/search').user );
// 添加朋友
router.post('/add/friend' , require(config.__app_c__+'/add').friend );

module.exports = router;
