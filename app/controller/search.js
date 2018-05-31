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
          var email = 'SELECT r.*,m.msg from z_room r INNER JOIN z_room_msg m on m.rid = r.id where r.id ='+ rid;
          sql.runSql(email,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败");
		     	    }
		     	    if(data[0]['type']==0){
                         var getsql = 'SELECT a.rename,u.user_img,u.username,m.msg from z_mail a LEFT JOIN z_member u on u.id=a.fid  LEFT JOIN z_room_msg m on m.rid=a.rid  WHERE uid='+uid+' and fid=(SELECT uid from z_user_room where rid='+rid+' and uid<>'+uid+') order by m.addtime desc LIMIT 1'
                         // SELECT a.rename,u.user_img,u.username,m.msg,m.addtime  from z_mail a LEFT JOIN z_member u on u.id=a.fid LEFT JOIN z_room_msg m on m.rid=a.rid  WHERE uid=1 and fid=(SELECT uid from z_user_room where rid=19 and uid<>1) order by m.addtime desc LIMIT 1;
				          sql.runSql(getsql,function(err,data){
						     	    if(err){
						     	    	    return base.returnjson(res,100,"查询失败");
						     	    }
						            return base.returnjson(res,200,'查询成功',data[0]);
				          })
		     	    }else{
		     	    	  return base.returnjson(res,200,'查询成功',data[0]);
		     	    }
          })
};

// 查询群
exports.GroupChat=function (req, res, next) {
	      var uid = req.body.uid;	       
          var email = 'SELECT r.* from z_user_room ur LEFT JOIN z_room r on ur.rid = r.id where r.type = 1 and ur.uid ='+ uid;
          sql.runSql(email,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败");
		     	    }
		     	    return base.returnjson(res,200,'查询成功',data);
          })
};

// 查询聊天记录
exports.ChatRecord=function (req, res, next) {
	      var rid = req.body.rid;
	      var page = req.body.page&&req.body.page>0 ? req.body.page-1 : 0;
	      var pageSize = page*(req.body.pageSize?req.body.pageSize:10);	       
          var email = 'SELECT rm.* from z_room_msg rm WHERE rid='+rid+' LIMIT '+page+','+ pageSize;
          console.log(email);
          
          sql.runSql(email,function(err,data){
		     	    if(err){
		     	    	    return base.returnjson(res,100,"查询失败");
		     	    }
		     	    return base.returnjson(res,200,'查询成功',data);
          })
};