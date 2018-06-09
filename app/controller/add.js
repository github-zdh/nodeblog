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
       if(uid==fid){
           return base.returnjson(res,100,"不能添加自己为好友");
       }
       function addFriend(uid,fid){
		          var email = 'insert into z_add_friend_request (uid,fid) values ('+uid+','+fid+')';
		          sql.runSql(email,function(err,data){
				     	    if(err){
				     	    	    return base.returnjson(res,100,"查询失败");
				     	    }
				            return base.returnjson(res,200,'请求已发送');
		          })
       }
       new sql.runMysql(()=>{
       	    return base.returnjson(res,1002,"查询失败");
        } )
       .then(()=>{
       	    return 'select * from z_mail where uid ='+ uid +' and fid = '+ fid;
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

// 用户请求添加处理 是否通过 
exports.friendIsPass=function (req, res, next) {
       var ispass = req.body.ispass?req.body.ispass:0; // 0 =>不通过 1=>通过
       ispass = parseInt(ispass);
       var uid = req.body.uid;
       var fid = req.body.fid;
       var afqid = req.body.afqid;// z_add_friend_request =>中的id //添加盆友的处理数据id
       var rid = ''; 

       new sql.runMysql(()=>{
       	    return base.returnjson(res,1002,"查询失败");
        })
       .then(()=>{
       	    return 'update z_add_friend_request SET handle=1 , ispass='+ispass+' where id='+afqid;
        },
       	(data,_this)=>{
     	    if(ispass!=1){
     	    	_this.endHandle = true;
     	    	return base.returnjson(res,200,"拒绝通过");
     	    }
       	})
       .then(()=>{//创建一个房间
       	    return 'INSERT INTO z_room (name,description) VALUES ("聊天群","个人群")';
        },
       	(data,_this)=>{
     	    rid = data['insertId'];  
       	})
       .then((data)=>{//处理z_mail表中数据

       	    return 'INSERT INTO z_mail (uid,fid,rid) VALUES ('+uid+','+fid+','+rid+') , ('+fid+','+uid+','+rid+')';
        })
       .then(()=>{//处理z_user_room 表中数据
       	    return 'INSERT INTO z_user_room (uid,rid) VALUES ('+uid+','+rid+') , ('+fid+','+rid+')';
        },
       	(data,_this)=>{
     	    return base.returnjson(res,200,"添加成功");
       	})
       .end();       
};
