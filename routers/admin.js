var config = require(__ROOTDIR__+'/config/config');
var express = require('express');
var router = express.Router();
var com = require(__ROOTDIR__+'/config/common');
var sql = require(__ROOTDIR__+'/config/mysql');
var base = require(__ROOTDIR__+'/config/base');

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
	      // console.log(req.session[__adminUserInfo__]);
	      if(!req.session[__adminUserInfo__]){
	           // return res.redirect("/",{data:{isLogin:false}});
	           // return  res.render(config.__admin_v__+'/',{list:[]});
	           return res.redirect("/admin/login");
	      }
		  next();
}

// 读取权限
function admin_permission(req, res, next){
      base.permission(req, res, next ,__adminUserInfo__);
}

// 首页
router.get('/', isLogin , admin_permission, require(config.__admin_c__+'/index').index);
// 首页
router.get('/index',isLogin ,admin_permission, require(config.__admin_c__+'/index').index );
// 登录
router.get('/login' , require(config.__admin_c__+'/login').login );
//退出登录
router.get('/logout' , require(config.__admin_c__+'/login').logout );
//浏览器
router.get('/brower',isLogin , require(config.__admin_c__+'/login').brower );
// 提交登录
router.post('/login', require(config.__admin_c__+'/login').postLogin );

// 用户管理
router.get('/user/index',isLogin ,admin_permission, require(config.__admin_c__+'/user').index );
// 用户列表
router.get('/user/list',isLogin , require(config.__admin_c__+'/user').list );
// 封号
router.get('/user/closeUser',isLogin , require(config.__admin_c__+'/user').closeUser );

// 权限管理 authority
router.get('/user/authority/:user_id',isLogin ,admin_permission, require(config.__admin_c__+'/user').authority );
// 角色管理 role
router.get('/user/role/:user_id',isLogin ,admin_permission, require(config.__admin_c__+'/user').role );
// 角色管理 role
router.get('/user/roleList',isLogin , require(config.__admin_c__+'/user').roleList );
// 角色管理 role
router.get('/user/changRole',isLogin , require(config.__admin_c__+'/user').changRole );
// 添加角色
router.get('/user/addRole',isLogin , require(config.__admin_c__+'/user').addRole );
// 删除角色
router.get('/user/delRole',isLogin , require(config.__admin_c__+'/user').delRole );

// 文章管理
router.get('/articles/index', require(config.__admin_c__+'/articles').index );

module.exports = router;