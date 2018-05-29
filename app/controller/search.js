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
	
          var email = 'select * from z_member where email="'+req.body.email+'"';
          sql.runSql(email,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败");
		     	    }
		     	    if(data.length==0){
		     	    	    return base.returnjson(res,202,"用户不存在");
		     	    }
		     	    delete data[0].password;
		            return base.returnjson(res,200,'查询成功',data[0]);
          })
};

// 查询通讯录
exports.mail=function (req, res, next) {
	      var uid = req.body.uid;
          var email = 'SELECT a.*,b.username,b.user_img from z_mail a , z_member b where b.id=a.fid and a.uid ='+ uid;
          sql.runSql(email,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败");
		     	    }
		            return base.returnjson(res,200,'查询成功',data);
          })
};

// 查询新朋友
exports.newfriend=function (req, res, next) {
	      var uid = req.body.uid;	       
          var email = 'SELECT a.*,b.username,b.user_img from z_add_friend_request a LEFT JOIN z_member b on  b.id <> '+uid+' and (b.id = a.uid or b.id = a.fid)  where a.uid ='+uid+' or a.fid ='+ uid;
          sql.runSql(email,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败");
		     	    }
		            return base.returnjson(res,200,'查询成功',data);
          })
};

// 查询群信息
exports.roomInfo=function (req, res, next) {
	      var rid = req.body.rid;
	      var uid = req.body.uid;	       
          var email = 'SELECT * from z_room where id= '+ rid;
          sql.runSql(email,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败");
		     	    }
		     	    console.log(data);
		     	    console.log(data[0]['type']);
		     	    console.log(data[0]['type']==0)
		     	    console.log(data['type'])
		     	    if(data[0]['type']==0){
                         var getsql = 'SELECT a.rename,u.user_img,u.username from z_mail a LEFT JOIN z_member u on u.id=a.fid  WHERE uid='+uid+' and fid=(SELECT uid from z_user_room where rid='+rid+' and uid<>'+uid+')'
				          sql.runSql(email,function(err,data){
						     	    if(err){
						     	    	    return base.returnjson(res,100,"查询失败");
						     	    }
						            return base.returnjson(res,200,'查询成功',data);
				          })
		     	    }else{
		     	    	  return base.returnjson(res,200,'查询成功',data[0]);
		     	    }
          })
};