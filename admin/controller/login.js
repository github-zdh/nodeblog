var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');

Function.prototype.login=function (req, res, next) {
		  if(req.session.adminUserInfo){
                return res.redirect("/admin/index");
		  }
		  res.render(config.__admin_v__+'/login'); 
};
Function.prototype.getAdminCode=function (req, res, next) {
		  req.session['adminCode'] = com.randomFlag(true, 6, 6);
		  return base.returnjson(res,'200',req.session['adminCode']);
};
// 用户登录
Function.prototype.postLogin=function (req, res, next) {
         let userInfo = __adminUserInfo__;
		 if(req.method.toLowerCase()!=='post'){
		    	res.render(config.__admin_v__+'/login');  
		 }
		 base.getFormData({
				 	req:req,
				 	error:formError,
				 	success:formSeccess
		 })
	     function formError(){
	    	  base.errorMsg(req,res,'账号密码提交失败！'); 
	     }
	     function formSeccess(fields){
	     	     if(fields.adminCode.toUpperCase()!=req.session['adminCode'].toUpperCase()){
	     	     	  return base.errorMsg(req,res,'验证码错误');
	     	     }
	     	     var sqlRum='select * from z_member where username="'+fields.username+'"';
			     sql.runSql(sqlRum,function(err,data){
			     	  if(data.length===0){
	                         // 没有该用户
			     	  	    return base.errorMsg(req,res,'账号密码错误');
			     	  }
			     	  if(com.md5(fields.password)===data[0].password){
						     if(userInfo==__webUserInfo__){//前台登录
                                   req.session[userInfo]=data[0];
                                   return res.redirect('/index'); 
						     }
						     if(userInfo==__adminUserInfo__){//后台登录
						     	   if(data[0].is_admin!=1){
						     	   	    return base.errorMsg(req,res,'你还是后台管理员；请联系管理员!');
						     	   }
						     	   if(data[0].is_valid!=1){
						     	   	    return  base.errorMsg(req,res,'你账号已失效；请联系管理员!');
						     	   }
						     	   req.session[userInfo]=data[0];
						     	   return res.redirect('/admin/index'); 
						     }			     	  	      
			     	  }else{
			     	  	    // 密码错误
			     	  	    base.errorMsg(req,res,'账号密码错误')
			     	  }
			     });
			     // res.render(config.__web_v__+'/index');  
	     } 
};

Function.prototype.logout=function (req, res, next) {
	    delete req.session.adminUserInfo;
	    return res.redirect('/admin/login'); 
};


Function.prototype.register=function (req, res, next) {
      res.render(config.__admin_v__+'/register'); 
};

Function.prototype.brower=function (req, res, next) {
      res.render(config.__admin_v__+'/brower'); 
};

Function.prototype.userInfo=function(req,res,next){
	  res.render(config.__admin_v__+'/userInfo'); 
}

module.exports = Function;