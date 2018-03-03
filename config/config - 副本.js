// 配置文件
config={
    website_name:'ZDH',//网站名字
	__admin_c__:__ROOTDIR__+"/admin/controller",//后台控制器文件夹(js)
	__admin_m__:__ROOTDIR__+"/admin/model",//后台模型文件夹（css img）
	__admin_v__:__ROOTDIR__+"/admin/views",//后台视图文件夹(html ejs)	
    
    __web_c__:__ROOTDIR__+"/web/controller",//前台控制器文件夹(js)
	__web_m__:__ROOTDIR__+"/web/model",//前台模型文件夹（css img）
	__web_v__:__ROOTDIR__+"/web/views",//前台视图文件夹(html ejs)

	sql:{//本地数据库配置
			 host:'localhost',
			 user:'root',
			 password:'root',
			 port:'3306',
			 database:'node_blog'
	},


	// email:{
	// 	    //https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
	// 	    service: 'qq',
	// 	    port: 465, // SMTP 端口
	// 	    secureConnection: true, // 使用 SSL
	// 	    auth: {
	// 	        user: '768065158@qq.com',
	// 	        //这里密码不是qq密码，是你设置的smtp密码
	// 	        pass: '*****'
	// 	    }
	// 	},
	email:{
		    //https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
		    "163":{
				    host: "smtp.163.com",
			        secure: true,
				    service: '163',
				    port: 465, // SMTP 端口
				    secureConnection: true, // 使用 SSL
				    auth: {
				        //这里是你的发件邮箱
				        user: '*****@163.com',
				        //这里密码不是qq密码，是你设置的smtp密码
				        pass: 'zdh15602389463'
				    }
			},
			"aliyun":{//"qiye.aliyun":
			    "host": "smtp.aliyun.com",
			    "port": 465,
			    "secureConnection": true, // use SSL
			    "auth": {
			        //这里是你的发件邮箱
			        "user": '*******@aliyun.com', // user name
			        "pass": '*********'         // password
			    }
			}
	},
	
	// 模拟已经登录
	analogLogon:function(req,res,next){
			req.session[__webUserInfo__]={
					  id: 1,
					  username: 'username',
					  password: 'password',
					  // user_img: 'http://127.0.0.1:1337/images/web/1.gif',
					  phone: null,
					  email: 'email@qq.com',
					  is_admin: 1,
					  is_valid: 1,
					  sex: null,
					  motto: null,
					  nickname: 'nickname',
					  addtime: 1514370744,
					  province: 'province',
					  city: 'city',
					  area: 'area' 
			}
			req.session.is_login=true;
			req.session.emailCode=123456;//默认获取邮箱验证码
			next();
	},

}
module.exports=config;
