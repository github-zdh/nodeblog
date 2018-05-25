var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');

// 查询用户
exports.user=function (req, res, next) {
          console.log(req);
          var email = 'select * from z_member where email="'+req.body.email+'"';
          sql.runSql(email,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败");
		     	    }
		     	    if(data.length==0){
		     	    	    return base.returnjson(res,202,"用户不存在");
		     	    }
		     	    data[0]['user_img'] = __host__ + data[0]['user_img'];
		     	    delete data[0].password;
		            return base.returnjson(res,200,'查询成功',data[0]);
          })
};