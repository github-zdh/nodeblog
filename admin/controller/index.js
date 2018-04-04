var express = require('express');
var crypto = require('crypto');
var ejs = require('ejs');
var path = require('path');
var url = require('url');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');



exports.index=function (req, res, next) {
		  let rqs = [
		          {
					   	sql:'select * from z_role where register=1 and id=(select role_id from z_user_role where register=1 and user_id='+req.session[__adminUserInfo__].id+')',
					    sCallback:(data,options) => {
				   	            req.session[__adminUserInfo__].role='管理员';
						   	    if(data.length>0){
						   	    	req.session[__adminUserInfo__].role=data[0].name;
						   	    }	
						   	    // console.log(__adminUserInfo__);					   	    
						   	    res.render(config.__admin_v__+'/',{__adminUserInfo__:req.session[__adminUserInfo__]}); 	
					    }
				  }
	     ];
		 sql.querysql({
				   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
				   eCallback:(err,options)=>{
				   	    req.session[__adminUserInfo__].role='管理员';
				   	    res.render(config.__admin_v__+'/',{__adminUserInfo__:req.session[__adminUserInfo__]}); 				   	    
				   }
		   })	

};

exports.news=function (req, res, next) {
      res.render(config.__admin_v__+'/index');
};

exports.product=function(req, res, next) {
      var urlArr=req.originalUrl.split('/');
      var originalUrl=req.originalUrl.split('/')[1]+'-'+req.originalUrl.split('/')[2];
      res.render(config.__admin_v__+'/index');

};
exports.welcome=function (req, res, next) {
         var list=base.list(req,res,1);
         res.render(config.__admin_v__+'/welcome',{list:list}); 
};



// module.exports = index;