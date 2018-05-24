var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');


exports.index=function (req, res, next) {
          req.session.loginCode = com.randomSN();
          __webPageInfo__.loginCode = req.session.loginCode;//登录验证码

		  res.render(config.__web_v__+'/login',{webPageInfo:__webPageInfo__}); 
};

// 登录
exports.login=function (req, res, next) {
          // if(req.query.code!=req.session.loginCode){
          // 	     return base.returnjson(res,100,"验证失败;请重新获取验证码");
          // }
          var email = 'select * from z_member where email="'+req.query.email+'"';
          sql.runSql(email,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败");
		     	    }
		     	    if(data.length==0){
		     	    	    return base.returnjson(res,100,"用户不存在或者密码错误！");
		     	    }
		     	    if(com.md5(req.query.password)!=data[0].password){
		     	    	    return base.returnjson(res,100,"用户不存在或者密码错误！");
		     	    }
		     	    if(data[0].is_valid!=1){
		     	    	    return base.returnjson(res,100,"用户失效！请联系管理员");
		     	    }
		     	    req.session[__appUserInfo__]=data[0];
		            let LocaleDate = com.LocaleDate();//获取当天0点时间戳   
		            return base.returnjson(res,200,{result:data[0]});
          })
};

// 退出登录
exports.logout=function (req, res, next) {
          if(!req.session[__appUserInfo__]){
	          return base.returnjson(res,100,"你还没登录");
          }
  	      delete req.session[__appUserInfo__];
          return base.returnjson(res,200,"退出成功");
};

//获取验证码（不是邮箱的）
exports.getCode=function (req, res, next) {
         req.session.loginCode = com.randomSN();
         return base.returnjson(res,200,"success",{"code":req.session.loginCode});
};

// 注册
exports.register=function(req,res){
          if(!req.query){
          	   return base.returnjson(res,100,"请提交信息");  
          }
          if(req.query.code!=req.session.emailCode){
          	   return  base.returnjson(res,100,"验证码出错");  
          }
          if(req.query.password!=req.query.confirmPassword){
          	   return base.returnjson(res,100,"两次输入密码不一致"); 
          }
          if(req.query.sex=='男'){
          	    req.query.sex = 1; 
          }
          if(req.query.sex=='女'){
          	    req.query.sex = 0; 
          }

          var email = 'select * from z_member where email="'+req.query.email+'"';

          sql.runSql(email,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败"); 
		     	    }
		     	    if(data.length!=0){
		     	    	    return base.returnjson(res,100,"用户已存在！"); 
		     	    }
		     	    var addtime = new Date().getTime();
		     	    var insertUser = "INSERT INTO z_member (username,password,user_img,phone,email,sex,motto,addtime,province,city,area) VALUES ("+
				     	      "'u_"+addtime+"',"+
				     	      "'"+com.md5(req.query.password)+"',"+
				     	      "'"+__host__+"/images/web/1.gif',"+
				     	      "'"+req.query.phone+"',"+
				     	      "'"+req.query.email+"',"+
				     	      "'"+req.query.sex+"',"+
				     	      "'"+req.query.motto+"',"+
				     	      "'"+addtime/1000+"',"+
				     	      "'"+req.query.province+"',"+
				     	      "'"+req.query.city+"',"+
				     	      "'"+req.query.area+"'"+
		     	    ")";
			        sql.runSql(insertUser,function(err,data){
					   	    if(err){
					   	    	    return  base.errorMsg(req,res,'查询失败');
					   	    }
					   	    req.session[__webUserInfo__]={
						   	    	id:data.insertId,
						   	    	username:"u_"+addtime,
						   	    	user_img:req.headers.host+"/images/web/1.gif",
						   	    	phone:req.query.phone,
						   	    	email:req.query.email,
						   	    	is_admin:0,
						   	    	is_valid:1,
						   	    	sex:req.query.sex,
						   	    	motto:req.query.motto,
						   	    	addtime:addtime
					   	    };
							return base.returnjson(res,200,"success",{"url":"/index"}); 
			        })
          })
}

// 邮箱登录
exports.emailLogin=function(req,res){
          if(!req.query){
          	   return base.returnjson(res,100,"请提交信息");  
          }
          if(req.query.code!=req.session.emailCode){
          	   return base.returnjson(res,100,"验证码出错");
          }

 	     var sqlRum='select * from z_member where email="'+req.query.email+'"';
	     sql.runSql(sqlRum,function(err,data){
			     	  if(err){
			     	        return base.returnjson(res,100,"查询失败");
			     	  }
			     	  if(data.length===0){
		                     // 没有该用户
			     	  	    return base.returnjson(res,100,"账号或者密码错误");
			     	  }
		     	      req.session[__webUserInfo__]=data[0];
		     	      return base.returnjson(res,200,"success",{"url":"/index"}); 	     	  
	     });
}

// 找回密码
exports.findpaypswd=function(req,res){
          if(!req.query){
          	   return base.returnjson(res,100,"请提交信息");  
          }
          if(req.query.code!=req.session.emailCode){
          	   return base.returnjson(res,100,"验证码出错");
          }
          var _this=this;
          var reqEmail = req.query.email;
          var email = 'UPDATE z_member SET password="'+com.md5('123456')+'" WHERE email="'+reqEmail+'"';
          sql.runSql(email,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败");
		     	    }
		     	    base.sendMail(req,res,{email:reqEmail,code:'你新密码是：123456 , 请登录后修改密码'});
		     	    return base.returnjson(res,200,"请去邮箱查看新密码！",{"url":"/login"});
          })
}

// 重置密码
exports.resetpaypswd=function(req,res){
          if(!req.query){
          	   return base.returnjson(res,100,"请提交信息");  
          }
          if(!req.session[__webUserInfo__]){
          	   return base.returnjson(res,100,"请登录");    
          }
          
          var resetpaypswd = 'UPDATE z_member SET password="'+com.md5(req.query.password)+'" WHERE id='+req.session[__webUserInfo__].id;
          sql.runSql(resetpaypswd,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败");  
		     	    }
		     	    return base.returnjson(res,200,"修改密码成功");  
          })
}



// 发送验证码
exports.sendEmail=function(req,res){
      var email = req.query.email;
      var emailCode = Math.random().toString().substr(2,6);
      req.session.emailCode = emailCode;//暂时不区分登录、修改邮箱；邮箱验证码
      if(!req.query.email){
            return base.returnjson(res,100,"对不起；数据出错！！！");    
      }
      console.log({email:email,code:emailCode});
      console.log(base);
      base.sendMail(req,res,{email:email,code:emailCode});
}



