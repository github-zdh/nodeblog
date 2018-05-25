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
       var uid = req.body.uid;
       var fid = req.body.fid;
       function addFriend(uid,fid){
		          var email = 'insert into z_friends (uid,fid) values ('+uid+','+fid+')';
		          sql.runSql(email,function(err,data){
				     	    if(err){
				     	    	    return base.returnjson(res,100,"查询失败");
				     	    }
				            return base.returnjson(res,200,'添加成功');
		          })
       }
       new sql.runMysql(()=>{
       	    return base.returnjson(res,1002,"查询失败");
        } )
       .then(()=>{
       	    return 'select * from z_friends where uid ='+ uid +' and fid = '+ fid;
        },
       	(data,_this)=>{
     	    if(data.length==0){
                   addFriend(uid,fid);
		          _this.endHandle = true;
     	    }else{
     	    	 return base.returnjson(res,101,'你已经添加该用户了');
     	    }
       	})
       .end();
};