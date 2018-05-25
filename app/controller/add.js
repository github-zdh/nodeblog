var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');

// 查询用户
exports.friend=function (req, res, next) {
       function addFriend(uid,fid){
		          var email = 'insert into z_friends (uid,uids) values ('+uid+','+fid+')';
		          sql.runSql(email,function(err,data){
				     	    if(err){
				     	    	    return base.returnjson(res,100,"查询失败");
				     	    }
				            return base.returnjson(res,200,'添加成功');
		          })
       }
       new sql.runMysql(()=>{
       	    return base.returnjson(res,100,"查询失败");
        } )
       .then(()=>{
       	    return 'select * from z_friends where uid ="'+req.body.uid+'"';
        },
       	(data,_this)=>{
     	    if(data.length==0){
                   addFriend(req.body.uid,req.body.fid);
		          _this.endHandle = true;
     	    }
       	})
       .then('select uids from z_friends where uid ='+ req.body.uid,
       	(data,_this)=>{
     	    if(data[0].uids == ''){
		           addFriend(req.body.uid,req.body.fid);
     	    }else{
	     	     var uids = String(data[0].uids).split(',');
	     	     var strFid = String(req.body.fid);
	     	     if(uids.indexOf(strFid)>-1){
	     	     	  return base.returnjson(res,200,'你已经添加该用户了');
	     	     }else{
                      uids.push(strFid);
			          var email = 'UPDATE z_friends set uids = "'+uids.join(',')+'" where uid = '+req.body.uid;
			          sql.runSql(email,function(err,data){
					     	    if(err){
					     	    	    return base.returnjson(res,100,"查询失败");
					     	    }
					            return base.returnjson(res,200,'添加成功');
			          })
	     	     }
     	    }            
       	})
       .end();
};