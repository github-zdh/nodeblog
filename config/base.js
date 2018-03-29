//这个主要写公共底层
//
var fs = require('fs');
var multiparty = require('multiparty');
var util = require('util');
var crypto = require('crypto');
var sql = require('./mysql');
var com = require('./common');
var config = require('./config');
var formidable = require('formidable');
var nodemailer = require('nodemailer');

var base = {};

// 重定向显示错误提示页面
base.errorMsg=function(req,res,msg){
	   var url = '/errorMsg/'+msg;
	   res.redirect(302, url);  
}

// 返回json字符串格式
base.returnjson=function(res,code,msg,result){
	  res.end(JSON.stringify({"code":code,"msg":msg,"result":result}));
}


// 获取表单数据
// @params    obj=>{
//                  req:req,
//                  res:res,
//                  next:next,
//                  error:fn,
//                  success:fn
//            }
//            
base.getFormData=function(obj){
		 var form = new formidable.IncomingForm();  
		 form.parse(obj.req, function(err, fields, files) {  
		        if(err!=null){
	                 if(obj.error){
	                 	   obj.error();
	                 }
	                 return false;
		        }
		        obj.success(fields,files);
		        // console.log('fields',fields);//表单传递的input数据  
		        // console.log('files',files);//上传文件数据  
		 }); 
}

// 用户登录
base.login=function(req, res, next,userInfo){
         var _this=this;
		 if(req.method.toLowerCase()!=='post'){
		    	res.render(config.__admin_v__+'/login');  
		 }
		 _this.getFormData({
				 	req:req,
				 	error:formError,
				 	success:formSeccess
		 })
	     function formError(){
	    	  _this.errorMsg(req,res,'账号密码提交失败！'); 
	     }
	     function formSeccess(fields){
	     	     var sqlRum='select * from z_member where username="'+fields.username+'"';
			     sql.runSql(sqlRum,function(err,data){
			     	  if(data.length===0){
	                         // 没有该用户
			     	  	    return _this.errorMsg(req,res,'账号密码错误');
			     	  }
			     	  if(com.md5(fields.password)===data[0].password){
						     if(userInfo==__webUserInfo__){//前台登录
                                   req.session[userInfo]=data[0];
                                   res.redirect('/index'); 
						     }
						     if(userInfo==__adminUserInfo__){//后台登录
						     	   if(data[0].is_admin!=1){
						     	   	    return  _this.errorMsg(req,res,'你还是后台管理员；请联系管理员!');
						     	   }
						     	   if(data[0].is_valid!=1){
						     	   	    return  _this.errorMsg(req,res,'你账号已失效；请联系管理员!');
						     	   }
						     	   req.session[userInfo]=data[0];
						     	   res.redirect('/admin/index'); 
						     }			     	  	      
			     	  }else{
			     	  	    // 密码错误
			     	  	    _this.errorMsg(req,res,'账号密码错误')
			     	  }
			     });
			     // res.render(config.__web_v__+'/index');  
	     }
}

// 后台用户权限 permission
base.permission=function(req,res,next,userInfo){
         var originalUrl=req.originalUrl.split('/');//检测路径
         var _this=this;
		  //         baseUrl: '/admin',
		  // originalUrl: '/admin/index',
	     if(req.session[userInfo].permission&&req.session[userInfo].permission.length!=0){
	     	   // next();
	     	   originalUrl_fn();
	     	   return false;
	     }
         
         if(userInfo==__adminUserInfo__){//后台用户 角色 权限 查询

			     var role_id='select role_id from z_user_role where register = 1 and user_id='+req.session[userInfo].id;
			     // var per_id='select per_id from z_admin_role_permissions where role_id=';
			     var per_id_in='select per_id from z_role_permissions where  register = 1 and role_id in (';
			     // var z_per='select * from z_admin_permissions where id=';
			     var z_per_in='select * from z_permissions where  register = 1 and id in (';
		 }

		 if(userInfo==__webUserInfo__){//前台用户 角色 权限 查询
			     // var role_id='select role_id from z_admin_user_role where user_id='+req.session[userInfo].id;
			     // var per_id='select per_id from z_admin_role_permissions where role_id=';
			     // var z_per='select * from z_admin_permissions where id=';
		 }

	     var role_arr='';
	     var per_arr='';
	     var admin_per=[];
	     req.session[userInfo].permission=[];

	     sql.runSql(role_id,function(err,data){//查询一个用户有多少种角色；拥有多少权限
                 if(err){
                 	 return  base.errorMsg(req,res,'查询失败');
                 }
                 role_arr=data[0].role_id;
                 role_arr_fn(data);
	     })

   	     function role_arr_fn(data){//检测角色
		            sql.runSql(per_id_in+role_arr+')',function(err,data){//检测权限
					     	    if(err){
					     	    	    return  base.errorMsg(req,res,'查询失败');
					     	    }
					     	    

			                    for(var i=0;i<data.length;i++){
			                    	   if(per_arr==''){
			                    	   	      per_arr=data[i].per_id;
			                    	   }else{
                                              per_arr=per_arr+','+data[i].per_id;
			                    	   }
			                    }
			                    per_arr=per_arr.split(',');
			                    per_arr=com.unique(per_arr);
			                    per_arr=per_arr.join(',');
			                    per_arr_fn();
				     })
   	     }  
   	     function per_arr_fn(){//检测权限
                sql.runSql(z_per_in+per_arr+')',function(err,data){//检测权限
		                    if(err){
					     	    	    return  base.errorMsg(req,res,'查询失败');
					     	}
		                    for(var i=0;i<data.length;i++){
		                    	   req.session[userInfo].permission.push(data[i]);
		                    }
		                    originalUrl_fn();
			     })
   	     }  

   	     // 检测权限(路径)
   	     function originalUrl_fn(){
   	     	   // console.log(originalUrl);
   	     	   if(originalUrl.length>3){  
	   	     	        var originalUrl_mcv = '/'+originalUrl[1]+'/'+originalUrl[2]+'/'+originalUrl[3];
	   	     	        // var per_mcv='';
	   	     	        var _per = req.session[userInfo].permission ;
	   	     	        var through=false;//是否通过权限验证 	  	   	    
	   	     	   	    for(var i=0;i<_per.length;i++){
	                            // per_mcv = '/'+_per[i].module+'/'+_per[i].controller+'/'+_per[i].view;
	   	     	   	            if(('/'+_per[i].module+'/'+_per[i].controller+'/'+_per[i].view) == originalUrl_mcv){
	                            	    through=true; 
	                            }
	   	     	   	    }
	   	     	   	    if(!through){
	   	     	   	    	  _this.errorMsg(req,res,'无权限访问!');
	   	     	   	    	  return false;
	   	     	   	    }
   	     	   }
   	     	   base.leftmenu(req,res,userInfo);
   	     	   next();
   	     }
}

// 处理后台用户左菜单列表
base.leftmenu = (req,res,userInfo) => {
     let reqAdminUserInfo=req.session[userInfo];     
     if(!reqAdminUserInfo||!reqAdminUserInfo.permission){
          return false;
     }
     if(reqAdminUserInfo&&reqAdminUserInfo.leftmenu){
     	  return false;
     }

     let leftmenu = {};
     for(var i=0;i<reqAdminUserInfo.permission.length;i++){
            if(reqAdminUserInfo.permission[i].grade==1){
                 leftmenu[reqAdminUserInfo.permission[i].id] = reqAdminUserInfo.permission[i];
                 leftmenu[reqAdminUserInfo.permission[i].id].children=[];
            }
     }
     for(var i=0;i<reqAdminUserInfo.permission.length;i++){
            if(reqAdminUserInfo.permission[i].p_id!=0){
                 leftmenu[reqAdminUserInfo.permission[i].p_id].children.push(reqAdminUserInfo.permission[i]);
            }
     }
     req.session[userInfo].leftmenu = leftmenu;
}

// 后台用户菜单列表
// @params type 1 一级菜单 2二级菜单 3 三级菜单
base.list=function(req,res,type){
         var list=[];
         var permission=req.session[__adminUserInfo__].permission;

         if(permission&&permission.length!=0){//设置显示权限
                for(var i=0;i<permission.length;i++){
                      if(permission[i].grade==type){
                            if(type==1){
		                            list.push({
		                                  url:'/'+permission[i].controller+'/'+permission[i].view,
		                                  title:permission[i].describe
		                            })
                            }else{
		                            list.push({
		                                  url:'/'+permission[i].view,
		                                  title:permission[i].describe
		                            })
                            }
                      }
                }
         }

        return list;
}

// 发送邮箱验证
// @params mailOptions 发送邮箱基本配置
base.sendMail=function(req,res,params){
        var email = config.email['aliyun'];
        var mailTransport = nodemailer.createTransport(email);
		var options = {
			        from        : email.auth.user,//'"你的名字" <你的邮箱地址>',
			        to          : params.email,//'"用户1" <邮箱地址1>, "用户2" <邮箱地址2>',
			        // cc         : ''  //抄送
			        // bcc      : ''    //密送
			        subject     :  params.subject?params.subject:config.website_name,
			        text        :  params.text?params.text:config.website_name,
			        html        :  params.html?params.html:'<h1>'+params.code+'</h1>',
			        // attachments : 
			        //             [
			        //                 {
			        //                     filename: 'img1.png',            // 改成你的附件名
			        //                     path: 'public/images/img1.png',  // 改成你的附件路径
			        //                     cid : '00000001'                 // cid可被邮件使用
			        //                 },
			        //                 {
			        //                     filename: 'img2.png',            // 改成你的附件名
			        //                     path: 'public/images/img2.png',  // 改成你的附件路径
			        //                     cid : '00000002'                 // cid可被邮件使用
			        //                 },
			        //             ]
		    };
		    mailTransport.sendMail(options, function(err, msg){
			        if(err){
			            res.end(base.returnjson(res,100,"发送失败!"));
			        }
			        else {
			        	
			            res.end(base.returnjson(res,200,"请去邮箱查看验证码！\n如果没接收到；请查看邮箱垃圾箱中有没有,并且添加修改为不是垃圾邮件"));
			        }
		    });
}

/*
	检测文件路径文件是否存在
	@params
	{
	  path: string 路径
	  isCreate:boolean 是否创建文件夹  默认不创建 false 创建 true,
	  end: function 结束回调函数 接收三个参数 （'isdir/ismkdir'【string】 ，isdir/ismkdir【boolean】，err） 
	                isdir => false 没有该文件夹，TRUE有该文件夹  ismkdir =》false 创建该文件夹失败 TRUE 创建该文件成功
	                err = > 错误信息

	}

	base.testdir(req,res,{
		path:'D:\\githud\\nodejs/public/arr/user_img/admin',
		isCreate:true,
		end:function(dir,bool){//（'isdir/ismkdir'【string】 ，isdir/ismkdir【boolean】）

		}
	})
*/
base.testdir = function(req,res,params){
	  var options = {};
      options.testdirpath = '';
      options.index = 0;
      // options.path = 'D:\\githud\\nodejs/public/arr/user_img/admin'.replace(/\/|\\/g,',').split(',');
      options.path = params.path.replace(/\/|\\/g,',').split(',');
      options.__ROOTDIR__ = global.__ROOTDIR__!=undefined?__ROOTDIR__:options.path[0]+'/'+options.path[1];
      options.__ROOTDIR__ = options.__ROOTDIR__.replace(/\/|\\/g,'/');

      options.for = function(){
	      	  options.testdirpath = '';
	      	  for(var i=0;i<options.path.length;i++){
		                if(i==0){
		                	 options.testdirpath = options.path[i];
		                }else{
		                	 options.testdirpath = options.testdirpath +'/'+ options.path[i];
		                }
		                if(arguments[0]==options.__ROOTDIR__){
				                options.index=i;
				                if(arguments[0]==options.__ROOTDIR__&&options.testdirpath==options.__ROOTDIR__){
			                          options.text(options.testdirpath)
			                          break;
				                }
		                }else if(i==options.index){
			                  break;
		                }
	      	  }
	      	  return options.testdirpath;
      }
      //回调
      options.endFn=function(oparams){
	           if(params.isCreate){
	           	        //创建
	                    if(oparams.bool&&(oparams.dir=='isdir'||oparams.dir=='ismkdir')){
                             options.index++;
                             if(options.index>=options.path.length){
                                   params.end(oparams.dir,oparams.bool,oparams.err);
                                   return false;
                             }
                             options.text(options.for());
	                    }else{
	                    	  //创建
	                    	  if(oparams.dir=='ismkdir'){
                                  params.end(oparams.dir,oparams.bool,oparams.err);
	                    	  }else{
	                    	  	  options.mkdir(oparams.path);
	                    	  }
	                    }
	           }else{
			            //不创建
			            if(params.end){
			            	  params.end(oparams.dir,oparams.bool,oparams.err);
			            }else{
			            	  res.end();
			            }
		       }
      }
      //创建文件/检测路径 回调
	  options.tmdircallback=function(err,dir){  
		          options.endFn({
		              	dir:dir,
		              	err:err,
		              	bool:err?false:true,
		              	index:options.index,
		              	path:options.testdirpath
		          });
	  }

      //创建文件
      options.mkdir=function(path){
		   	   fs.mkdir(path,function(err){
                    // if(err){
                    // 	  // console.log('文件夹创建失败');
                    // }else{
                    // 	  // console.log('文件夹已经创建成功');
                    // }
                    options.tmdircallback(err,'ismkdir')
		   	   })
      }

      // 检测路径
      options.text = function(testPath){
		      fs.access(testPath,(err) => {
				       // console.log(err ? 'no access!' : 'can read/write');
					   // if(err){
					   // 	      // console.log('文件不存在');
					   // }else{
						  //  	  // console.log('文件已存在');
					   // }
					   options.tmdircallback(err,'isdir');
			  }) 
      }
      
      options.for(options.__ROOTDIR__);

}

// 上传图片
// 这个文件上传主要针对layui富文本
// @params multiparty params 上传图片基本配置
// params{
//     path:path上传目标路径 
//     uploadError:function(err){}//上传失败
//     renameError:function(err){}//重命名失败
//     endCallback:function(err){}//最后回调
// }
base.UploadImages=function(req,res,params){

      // 主要是检测有没有这个文件夹；如果没有就创建；
      var loadPath = global.__ROOTDIR__+'/'+params.path;

	  base.testdir(req,res,{
		  	path:loadPath,
		  	isCreate:true,
		  	end:function(dir,bool){//（'isdir/ismkdir'【string】 ，isdir/ismkdir【boolean】,err）
                if(!bool){
                	    return res.end(JSON.stringify({"code": 100,"msg": "修改失败",'failMsg':'文件夹创建失败'}));
                }else{
                	    uploadImg()
                }
		  	}
	  })

      // 
      function uploadImg(){
		        //生成multiparty对象，并配置上传目标路径
		        //fileName:fileName 上传后重命名（暂时不做）
		        // console.log(params)
		        var form = new multiparty.Form({uploadDir: params.path});
		        //上传完成后处理
		        form.parse(req, function(err, fields, files) {
				          var filesTmp = JSON.stringify(files,null,2);
				          var suffix_name = files.file[0].headers['content-type'].split('image/')[1];
				          if(err){
				                // console.log('parse error: ' + err);
				                if(params.uploadError){
				                	   params.uploadError(err);
				                }
				          } else {
				          	  //   // console.log(filesTmp.path);
					            // var uploadedPath = files.file[0].path;
					            // var dstPath = params.path +'/'+ params.fileName+'.'+suffix_name;
					            // //重命名为真实文件名
					            // fs.rename(uploadedPath, dstPath, function(err) {
						           //    if(err){
						           //           if(params.renameError){
						           //           	  params.renameError(err);
						           //           }
						           //    } else {
						           //           console.log('rename ok');
						           //           // console.log(dstPath);
						           //           uploadedPath=dstPath;
						           //    }
					            // });
				          }      
				          util.inspect({fields: fields, files: filesTmp})
				          if(params.endCallback){
			          	     
				          	     params.endCallback(files.file[0].path);
				          }else{
				          	     res.end();
				          }			      
                });
      }
}

module.exports = base;
