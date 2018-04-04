var config = require(__ROOTDIR__+'/config/config');
var express = require('express');
var router = express.Router();
var com = require(__ROOTDIR__+'/config/common');
var sql = require(__ROOTDIR__+'/config/mysql');
var base = require(__ROOTDIR__+'/config/base');

// 公共控件 
//不管是否登录都通过这个控件
function publicControl(req, res, next){
			// 模拟已经登录
            config.adminAnalogLogon(req,res);

	      // 判断低版本
	      // return res.redirect("/lowVersion");


		  // 网址路径 例如：http://127.0.0.1:1337/
		  __host__ = global.__host__?__host__:'http://'+req.headers.host;
		  __webPageInfo__ = __webPageInfo__?__webPageInfo__:{} ;
		  __webPageInfo__.host = global.__host__?__host__:'http://'+req.headers.host;
		  __webPageInfo__.sign=req.session.sign;//是否签到
		  __webPageInfo__.userInfo=req.session[__webUserInfo__];//用户信息

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
      base.leftmenu(req, res, next);
}

// 首页
router.get('/', publicControl ,  isLogin , admin_permission, require(config.__admin_c__+'/index').index);
// 首页
router.get('/index', publicControl , isLogin ,admin_permission, require(config.__admin_c__+'/index').index );
router.get('/index.html', publicControl , isLogin ,admin_permission, require(config.__admin_c__+'/index').index );

// 登录
router.get('/login' , publicControl ,  require(config.__admin_c__+'/login').login );
// 提交登录
router.post('/login', publicControl ,  require(config.__admin_c__+'/login').postLogin );
// 获取登录验证码
router.post('/getAdminCode', publicControl ,  require(config.__admin_c__+'/login').getAdminCode );
//退出登录
router.get('/logout' , publicControl ,  require(config.__admin_c__+'/login').logout );


// 用户管理
// router.get('/user/index', publicControl , isLogin ,admin_permission, require(config.__admin_c__+'/user').index );
// 用户列表
router.get('/user/list', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/user').list );
router.post('/user/ajaxList', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/user').ajaxList );
// 查看用户详情
router.get('/user/user_details', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/user').user_details );
// 封号
router.post('/user/closeUser', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/user').closeUser );

// 权限管理 authority
router.get('/authority/index', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/authority').index );

router.get('/user/authority/:user_id', publicControl , isLogin ,admin_permission, require(config.__admin_c__+'/user').authority );

// 获取权限列表
router.post('/authority/list', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/authority').list );
// 添加节点/添加权限
router.post('/authority/add', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/authority').add );

// 角色管理 role
router.get('/role/index', publicControl , isLogin ,admin_permission, require(config.__admin_c__+'/role').index );
// 角色列表 role
router.post('/role/roleList', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/role').roleList );
// 添加角色
router.get('/role/add', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/role').add );
router.post('/role/ajaxAdd', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/role').ajaxAdd );
// 删除角色
router.post('/role/del', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/role').del );


// 角色管理 role
router.get('/user/changRole', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/user').changRole );

// 管理员列表
router.get('/admin/list', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/admin').adminList );
router.post('/admin/ajaxAdminList', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/admin').ajaxAdminList );
// 设置是否成为管理员
router.post('/admin/isAdmin', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/admin').isAdmin );
// 角色列表
router.post('/admin/adminRoleList', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/admin').adminRoleList );
// 添加修改用户角色
router.post('/admin/userRoleAdd', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/admin').userRoleAdd );



// 文章管理
router.get('/articles/list', publicControl , isLogin , admin_permission ,  require(config.__admin_c__+'/articles').list );
// ajax 加载文章列表数据
router.post('/articles/lists', publicControl , isLogin , admin_permission ,  require(config.__admin_c__+'/articles').lists );
// 管理员封贴
router.post('/articles/paste', publicControl , isLogin , isLogin , admin_permission ,  require(config.__admin_c__+'/articles').paste );


router.get('/welcome.html', publicControl , isLogin , admin_permission , require(config.__admin_c__+'/index').welcome );

module.exports = router;