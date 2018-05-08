var express = require('express');
var fs = require('fs');
var fse = require('fs-extra');
var crypto = require('crypto');
var ejs = require('ejs');
var path = require('path');

var url = require('url');

var multiparty = require('multiparty');
var util = require('util');

var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');


/*
前端用layui框架
{
	  "code": 0 //0表示成功，其它失败
	  ,"msg": "" //提示信息 //一般上传失败后返回
	  ,"data": {
		    "src": "图片路径"
		    ,"title": "图片名称" //可选
	  }

	  loadPath=>发布文章 富文本编辑器上传的 图片文件夹
}
var upload = layui.upload; //得到 upload 对象
 
//创建一个上传组件
upload.render({
  elem: '#id'
  ,url: '/ajax/addImg/?loadType=1' //上传接口
  ,done: function(res, index, upload){ //上传后的回调
  
  } 
  //,accept: 'file' //允许上传的文件类型
  //,size: 50 //最大允许上传的文件大小
  //,……
})
 */
/*
     loadType:
     0=> 默认上传路径
     1=>上传图片后插入 用户表；=>用户头像 上传路径:/upload/user_img
     2=>上传图片后插入 文章表；=>文章头像 上传路径:/upload/art_img

*/
exports.addImg=function (req, res, next) {
                // res.end(JSON.stringify({"code": 0,"msg": "error","data": {"src": "../images/web/1.gif","title": "图片名称"}}));
                // return false;
                // var loadPath = 'public/postsContent/uploadImages/7vnhkfjxoop'+com.randomSN();
                var date = new Date();
                //loadPath=>发布文章 富文本编辑器上传的 图片文件夹
// console.log(req.query);                 
                var loadType = parseInt(req.query.loadType) || 0 ;
                // console.log(loadPath);

                var loadPath = '';
                var user = req.session[__webUserInfo__];
	        console.log(user);

                switch(loadType){
                      case 1:
                            if(!user){
                            	   res.end(JSON.stringify({"code": 100,"msg": "请登录"}));
                            	   return false;
                            }
                            loadPath = 'public/upload/user_img/'+user.username;
                      break;
                      case 2:
                            if(!user){
                                 res.end(JSON.stringify({"code": 100,"msg": "请登录"}));
                                 return false;
                            }
                            loadPath = 'public/upload/art_img/'+user.username;
                      break;
                      default:
                            loadPath = 'public/upload/images';
                }
                 // console.log(loadPath);
                 // console.log(__host__);
                 // console.log('console.log(loadPath);')
          	  base.UploadImages(req,res,{
          		    path:loadPath,//上传目标路径 
          		    // fileName:com.randomSN(),//上传后重命名
          		    uploadError:function(err){//上传失败
                        return res.end(JSON.stringify({"code": 100,"msg": "修改失败"}));
          		    },
          	      renameError:function(err){//重命名失败
                        return res.end(JSON.stringify({"code": 100,"msg": "修改失败"}));
          		    },
          		    endCallback:function(url){//最后回调函数
          	    	       url = url.replace(/\\/g,'/').replace('public','');
          	    	       callbackFn(loadType,url);
                         if(loadType==1){
                               req.session[__webUserInfo__].user_img = url;
                         }
          			         return res.end(JSON.stringify({"code": 0,"msg": "error","data": {"src":url,"title": "图片名称"}}));
          		    },//最后回调
          	  })

                function callbackFn(loadType,url){
          		       switch(loadType){
          		            case 1:
          		                  var re_user_img = 'update z_member set user_img="'+url+'" where id='+user.id;
          		                  sql.runSql(re_user_img,function(err,data){
          		                  	   if(err){
          		                  	   	  return res.end(JSON.stringify({"code": 100,"msg": "修改失败"}));
          		                  	   }
          		                  })
          		            break;
          		       }
                }


};









// module.exports = index;
