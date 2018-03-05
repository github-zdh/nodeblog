var config = require(__ROOTDIR__+'/config/config');
var express = require('express');
var router = express.Router();
var com = require(__ROOTDIR__+'/config/common');



// 公共控件 
//不管是否登录都通过这个控件
function publicControl(req, res, next){
			// 模拟已经登录
            // config.analogLogon(req,res);

	      // 判断低版本
	      // return res.redirect("/lowVersion");


		  // 网址路径 例如：http://127.0.0.1:1337/
		  __host__ = global.__host__?__host__:'http://'+req.headers.host;
		  __webPageInfo__ = {} ;
		  __webPageInfo__.host = global.__host__?__host__:'http://'+req.headers.host;
		  __webPageInfo__.sign=req.session.sign;//是否签到
		  __webPageInfo__.is_login = req.session.is_login;//是否登录
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
	      if(!req.session[__webUserInfo__]){
	           return res.redirect("/login");
	      }
		  next();
}
// 判断是否有公共顶部 top.html
function top(req, res, next){
	       //这里应该是数据库读取；项目比较小；为了方便；直接写了
	       __webPageInfo__.top={
	               is_login:false,
	               login_url:'/login',
	               register_url:'/login#loginRegister=1',
	               nav_list:[
	                             {title:"首页",href:"/index",child:[]},
	                             // {title:"社区",href:"javascript:void(0)",child:[]},
	                             // {title:"社区",href:"javascript:void(0)",child:[
	                             //        {title:"移动模块",href:"javascript:void(0)",child:[]},  
	                             //        {title:"后台模版",href:"javascript:void(0)",child:[]},  
	                             //        {title:"电商平台",href:"javascript:void(0)",child:[]}
	                             // ]}
	                        ]

	       }

          //这里应该是数据库读取；项目比较小；为了方便；直接写了
	      __webPageInfo__.webAdmin={
	               user_nav:[
	                             {title:"我的主页",href:"/user/homepage/",check:false,child:[]}//check = 是否选中
	                             ,{title:"基本设置",href:"/user/basicSetup",check:false,child:[]}
	                             ,{title:"我的帖子",href:"/user/posts",check:false,child:[]}
	                             // ,{title:"我的消息",href:"javascript:void(0)",check:false,child:[]}
	               ]
	      }


	      if(!req.session[__webUserInfo__]){
	      	   //如果没登录顶部（html）信息
	           __webPageInfo__.top.is_login=false;
	      }else{
               __webPageInfo__.top.is_login=true;
	      }
		  next();
}
// 已经登录跳回首页
function loginTure(req, res, next){
	      if(req.session[__webUserInfo__]&&req.session[__webUserInfo__].id){
	      	   //如果没登录顶部（html）信息
	           return res.redirect("/errorMsg/你已经登录了/true");
	      }
		  next();
}


router.get('/' , publicControl , top , require(config.__web_c__+'/index').index);

// 首页
router.get('/index' , publicControl , top , require(config.__web_c__+'/index').index );

router.get('/socketIo' , publicControl , top , require(config.__web_c__+'/index').socketIo );
router.get('/socketIo/:Io' , publicControl , top , require(config.__web_c__+'/index').socketIo );
router.get('/socketIo_login' , publicControl , top , require(config.__web_c__+'/index').socketIo_login );
router.get('/socket_room' , publicControl , top , require(config.__web_c__+'/index').socket_room );

// 文章搜索列表
router.get('/index/searchList' , publicControl , top , require(config.__web_c__+'/index').searchList );
// 获取搜索数据
router.get('/index/getSearchList' , publicControl , top , require(config.__web_c__+'/index').getSearchList );
// 发表文章
router.get('/index/addArticle' , publicControl , isLogin , top , require(config.__web_c__+'/index').addArticle );
// 发表文章
router.get('/index/addArtContent' , publicControl , top , require(config.__web_c__+'/index').addArtContent );
// 发表文章
router.get('/index/editArticle/:id' , publicControl , isLogin , top , require(config.__web_c__+'/index').editArticle );
// 文章详情
router.get('/index/articleDetails/:id' , publicControl , top , require(config.__web_c__+'/index').articleDetails );


// 获取所有的文章/帖子列表
router.get('/index/getArtList' , publicControl ,  require(config.__web_c__+'/index').getArtList );

// 获取文章评论列表
router.get('/index/getArtComment' , publicControl , require(config.__web_c__+'/index').getArtComment );
// 对文章点赞
router.get('/index/addArtPoint' , publicControl , require(config.__web_c__+'/index').addArtPoint );
// 对文章评论点赞
router.get('/index/addCommentPoint' , publicControl , require(config.__web_c__+'/index').addCommentPoint );
// 对文章/帖子 回复/评论
router.get('/index/replyPoint' , publicControl , require(config.__web_c__+'/index').replyPoint );

// 对文章/帖子 举报
router.get('/index/report' , publicControl , require(config.__web_c__+'/index').report );
// 对文章/帖子 判断是否举报过
router.get('/index/judgeReport' , publicControl , require(config.__web_c__+'/index').judgeReport );

// 用户首页
router.get('/user/index' , publicControl , top , require(config.__web_c__+'/user').index );
// 个人中心 - 基本设置
router.get('/user/basicSetup' , publicControl , top , require(config.__web_c__+'/user').basicSetup );
// 个人中心 - 基本设置 - 修改邮箱 
router.get('/user/reSetEmail' , publicControl , top , require(config.__web_c__+'/user').reSetEmail );
// 个人中心 - 基本设置 - 签名/座右铭
router.get('/user/motto' , publicControl , top , require(config.__web_c__+'/user').motto );
// 个人中心 - 基本设置 - 修改昵称
router.get('/user/nickname' , publicControl , top , require(config.__web_c__+'/user').nickname );

// 个人中心 - 我的帖子
router.get('/user/posts' , publicControl , top , require(config.__web_c__+'/user').posts );
// 个人中心 - 我发的帖/我收藏的帖
router.get('/user/memberGetPosts' , publicControl , top , require(config.__web_c__+'/user').memberGetPosts );
// 个人中心 - 删除我发的帖 req.query.postsType==1
// 个人中心 - 取消收藏帖子 req.query.postsType==2
router.get('/user/memberDelPosts' , publicControl , top , require(config.__web_c__+'/user').memberDelPosts );


// 个人中心 - 个人主页
router.get('/user/homepage/:id' , publicControl , top , require(config.__web_c__+'/user').homepage );
// 用户签到
router.get('/user/sign' , publicControl , top , require(config.__web_c__+'/user').sign );

// 登录/注册/找回密码
router.get('/login' , publicControl , top , loginTure , require(config.__web_c__+'/login').index );
// 登录
router.get('/login/login' , publicControl , loginTure , require(config.__web_c__+'/login').login );
// 退出登录
router.get('/login/logout' , publicControl , require(config.__web_c__+'/login').logout );
// 注册
router.get('/login/register' , publicControl , loginTure , require(config.__web_c__+'/login').register );
// 邮箱验证登录
router.get('/login/emailLogin' , publicControl , loginTure , require(config.__web_c__+'/login').emailLogin );
// 找回密码
router.get('/login/findpaypswd' , publicControl , require(config.__web_c__+'/login').findpaypswd );
// 重置密码
router.get('/login/resetpaypswd' , publicControl , require(config.__web_c__+'/login').resetpaypswd );

// 发送email
router.get('/login/sendEmail' , publicControl , require(config.__web_c__+'/login').sendEmail );
// 获取动态验证码 ( 不是邮箱验证码 )
router.get('/login/getCode' , publicControl , require(config.__web_c__+'/login').getCode );


// 发表文章/上传图片
router.post('/ajax/addImg' , publicControl , require(config.__web_c__+'/ajax').addImg );



// 错误提示页面
router.get('/errorMsg/:msg' , publicControl , require(config.__web_c__+'/errorMsg').msg );
// 错误提示页面/重置路径(默认3秒)
router.get('/errorMsg/:msg/:urlBool' , publicControl , require(config.__web_c__+'/errorMsg').msgUrl );
// 低版本浏览器
router.get('/lowVersion' , require(config.__web_c__+'/errorMsg').lowVersion );

// 公告
router.get('/index/notice' , publicControl , require(config.__web_c__+'/index').notice );
// 富文本编辑器
router.get('/ueditor/ueditorDemo' , publicControl , require(config.__web_c__+'/ueditor').ueditorDemo );
router.get('/ueditor/ue' , require(config.__web_c__+'/ueditor').ue );
router.post('/ueditor/ue' , require(config.__web_c__+'/ueditor').ue );


module.exports = router;
