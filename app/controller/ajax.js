var express = require('express');
var fs = require('fs');
var request = require('request')
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
     loadType:
     0=> 默认上传路径
     1=>上传图片后插入 用户表；=>用户头像 上传路径:

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

                switch(loadType){
                      case 1:
                            if(!user){
                            	   res.end(JSON.stringify({"code": 100,"msg": "请登录"}));
                            	   return false;
                            }
                            loadPath = 'public/upload/user_img/'+user.username;
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
          		    endCallback:function(file){//最后回调函数
          	    	       url = file.file[0].path.replace(/\\/g,'/').replace('public','');
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

exports.addaudio=function (req, res, next) {
                // res.end(JSON.stringify({"code": 0,"msg": "error","data": {"src": "../images/web/1.gif","title": "图片名称"}}));
                // return false;
              var rid = req.query.rid;
              var uid = req.query.uid;

              var date = new Date();
                //loadPath=>发布文章 富文本编辑器上传的 图片文件夹
              var loadPath = loadPath = 'public/upload/audio/'+req.body.uid;

              // var filesTmp = req.body.fromOption;
              // filesTmp = JSON.stringify(filesTmp,null,2);

              // util.inspect({fields: {}, files: filesTmp})

              base.UploadImages(req,res,{
                  path:loadPath,//上传目标路径 
                  // fileName:com.randomSN(),//上传后重命名
                  uploadError:function(err){//上传失败
                        return res.end(JSON.stringify({"code": 101,"msg": "修改失败",error:'uploadError'}));
                  },
                  renameError:function(err){//重命名失败
                        return res.end(JSON.stringify({"code": 102,"msg": "修改失败",error:'renameError'}));
                  },
                  endCallback:function(file){//最后回调函数
                                console.log();
                                file = Object.prototype.toString.call(file) == '[object String]'?JSON.parse(file):file;
                                var url = file['audio'][0]['path'].replace(/\\/g,'/').replace('public','');
                                return res.end(JSON.stringify({"code": 0,"msg": "error","data": {"src":url,"title": "图片名称"}}));
                  },//最后回调
              })

              function callbackFn(loadType,url){
                        var re_user_img = 'update z_member set user_img="'+url+'" where id='+user.id;
                        sql.runSql(re_user_img,function(err,data){
                             if(err){
                                return res.end(JSON.stringify({"code": 103,"msg": "修改失败",error:'sql'}));
                             }
                        })
              }
};

exports.fsaddaudio=function (req, res, next) {
                // res.end(JSON.stringify({"code": 0,"msg": "error","data": {"src": "../images/web/1.gif","title": "图片名称"}}));
                // return false;
              var rid = req.query.rid;
              var uid = req.query.uid;

              var myfile = req.query.path;

              console.log(req.query);
              console.log(req.body);
              console.log(req.params);

              var date = new Date();
                //loadPath=>发布文章 富文本编辑器上传的 图片文件夹
              var loadPath = 'public/upload/audio/'+uid;
              // const myfile = 'D:/github/app/nodeapp/audio/friendship.mp3';
              // const myfile = 'E:/html/1528354834237.mp3';
              // var myfile = 'http://www.w3school.com.cn/i/horse.ogg';
              // http://www.w3school.com.cn/i/horse.ogg
              // 
               // fs.createReadStream('horse.ogg').pipe(request.put('http://www.w3school.com.cn/i/horse.ogg'))

              request(myfile, function (error, response, body) {
                     if(error){consoel.log(error)};
                     if (!error && response.statusCode == 200) {
                          // console.log(body) // 打印google首页
                              // 创建一个可以写入的流，写入到文件 output.txt 中
                              var writerStream = fs.createWriteStream(loadPath+'/horse.ogg');

                              // 使用 utf8 编码写入数据
                              writerStream.write(body);

                              // 标记文件末尾
                              writerStream.end();

                              // 处理流事件 --> data, end, and error
                              writerStream.on('finish', function() {
                                  console.log("写入完成。");
                              });

                              writerStream.on('error', function(err){
                                 console.log(err.stack);
                              });
                      }
               })

              // //读取（推荐）
              // fs.readFile(myfile, {flag: 'r+'}, function (err, data) {
              //     if(err) {
              //      console.error(err);
              //      return;
              //     }
              //     // console.log(data);
              //     var fswritedata = data;
              //     fs.access(loadPath,(err) => {
              //          // console.log(err ? 'no access!' : 'can read/write');
              //          if(err){
              //                  // console.log('文件不存在');
              //                  fs.mkdir(loadPath,function(err){
              //                         if(err){
              //                            console.log('文件夹创建失败');
              //                            fswrite('public/upload/audio/');
              //                         }else{
              //                            console.log('文件夹已经创建成功');
              //                            fswrite(fswritedata);
              //                         }
              //                  })
              //          }else{
              //                console.log('文件已存在');
              //                fswrite(fswritedata);
              //          }
              //     }) 
              // });

              //  //写入（推荐）
              //  function fswrite(w_data){
              //        console.log('开始写入');
              //       // fs.writeFile(filename,data,[options],callback);
              //       // var w_data = '这是一段通过fs.writeFile函数写入的内容；\r\n';
              //       // console.log(w_data);
              //       var w_data = new Buffer(w_data);

              //       /**
              //        * filename, 必选参数，文件名
              //        * data, 写入的数据，可以字符或一个Buffer对象
              //        * [options],flag,mode(权限),encoding
              //        * callback 读取文件后的回调函数，参数默认第一个err,第二个data 数据
              //        */
              //       var myfilearr = myfile.split('.');
              //       var writeDir = loadPath + '/'+new Date().getTime()+'.'+myfilearr[myfilearr.length-1];
              //       fs.writeFile(writeDir, w_data, {flag: 'a'}, function (err,data) {
              //             if(err) {
              //             console.error(err);
              //             } else {
              //                console.log('写入成功');
              //             }
              //       });
              //  }

};






// module.exports = index;
