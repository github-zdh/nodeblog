var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');

exports.list=function (req, res, next) {
 	     var count='select count(id) from z_member';
	     sql.runSql(count,function(err,data){
		     	  if(err){
		     	  	    base.errorMsg(req,res,'查询用户失败');
		     	  	    return false;
		     	  }
		     	  __adminPageInfo__.user_count = data[0]['count(id)'];
			      res.render(config.__admin_v__+'/user_list',{__adminPageInfo__:__adminPageInfo__});		     	    	  
	     });
         
};

exports.ajaxList=function (req, res, next) {

 	     var limitCount=req.body.limit||10;
 	     var curr=(req.body.curr-1)*limitCount;
 	     var selsql='';
 	     let body = req.body;
		 let rqs = [];
		  if(req.body.isloadnum){
		  	   selsql='select  count(*) from z_member';
		  }else{
		  	   selsql='select * from z_member order by id limit '+curr+','+limitCount;
		  }

		 function appendSql(sql,addsql){
	            if(sql.indexOf('where')!=-1){
	            	    return sql.split(' where ')[0]+' where '+addsql+' and '+sql.split(' where ')[1];
	            }else{
						if(req.body.isloadnum){
							   return sql.split(' order ')[0]+' where '+addsql;
						}else{
							   return sql.split(' order ')[0]+' where '+addsql+' order '+sql.split(' order ')[1];
						}
	            }
		  }

		  if(body.keyworld){
		 	    const art_name = ' ( username like "%'+body.keyworld+'%"'+' or phone like "%'+body.keyworld+'%"'+' or email  like "%'+body.keyworld+'%" ) ';
		 	    selsql = appendSql(selsql,art_name);	  	  
		  }
		  if(body.minDate&&body.maxDate){
		 	    const minmaxDate = ' addtime between '+parseInt(new Date(body.minDate+' 23:59:59').getTime()/1000)+' and '+parseInt(new Date(body.maxDate+' 23:59:59').getTime()/1000);
		 	    selsql = appendSql(selsql,minmaxDate);
		  }else{
				if(body.minDate){
				    const minDate = ' addtime between '+parseInt(new Date(body.minDate+' 23:59:59').getTime()/1000)+' and '+parseInt(new Date().getTime()/1000);
				    selsql = appendSql(selsql,minDate);	  	  
				}
				if(body.maxDate){
				    const maxDate = ' addtime < '+parseInt(new Date(body.maxDate+' 23:59:59').getTime()/1000);
				    selsql = appendSql(selsql,maxDate);
			   }
		  }
		 if(req.body.isloadnum){
				  rqs = [
				          {
							   	sql:selsql,
							    sCallback:(data,options) => {
								   	    base.returnjson(res,'200','success',data[0]['count(*)'])
							    }
						  }
			      ];
	     }else{
				  rqs = [
				          {
							   	sql:selsql,
							    sCallback:(data,options) => {
								   	    base.returnjson(res,'200','success',data)
							    }
						  }
			      ];
	     }
		 sql.querysql({
				   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
				   eCallback:(err,options)=>{
				   	    return base.returnjson(res,'100','查询失败');
				   	    
				   }
		   })	     
         
};

exports.user_details=function (req, res, next) {
         // console.log(config.__admin_v__+'/bojin');
		  let rqs = [
		          {
					   	sql:'select * from z_member where id='+req.query.id,
					    sCallback:(data,options) => {

					     	  __adminPageInfo__ = data[0];
					     	  if(__adminPageInfo__&&__adminPageInfo__.addtime){
					     	  	   __adminPageInfo__.add_time = com.getTime(__adminPageInfo__.addtime);
					     	  }
						      res.render(config.__admin_v__+'/user_details',{__adminPageInfo__:__adminPageInfo__});		
					    }
				  }
	      ];
		 sql.querysql({
				   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
				   eCallback:(err,options)=>{
				   	    base.errorMsg(req,res,'查询失败');
				   }
		   })	 
};



// 设置用户角色
exports.role=function (req, res, next) {
         var user_id = req.params.user_id;
 	     var runSql='select username from z_member where id='+user_id;
	     sql.runSql(runSql,function(err,data){
		     	  if(err){
		     	  	    return base.errorMsg(req,res,'查询失败');
		     	  }
				  res.render(config.__admin_v__+'/role',{username:data[0].username}); 
	     });
         
};

// 设置用户角色列表
exports.roleList=function (req, res, next) {
 	     var page=(req.query.page-1)*10;
 	     var limitCount=req.query.limit;
 	     var userInfo=req.session[__adminUserInfo__];
 	     var sqlRum='select id,name from z_admin_role order by id limit '+page+','+limitCount;
 	     var count='select count(id) from z_admin_role';
 	     var returnData = {
			 	     	 "code":0,
				 	     "msg":"success",
				 	     "count":1000,
				 	     "data":[]
			 	     }
	     sql.runSql(sqlRum,function(err,data){
		     	  if(err){
		     	  	    return base.errorMsg(req,res,'查询失败');
		     	  }
		     	  for(var i=0;i<data.length;i++){
		     	  	   data[i].current_user_id=userInfo.id;//当前登录用户id
		     	  }
		     	  returnData.data=data;
				  sql.runSql(count,function(err,data){
							     	  if(err){
							     	  	    base.errorMsg(req,res,'查询用户失败');
							     	  	    return false;
							     	  }
							     	  returnData.code=200;
							     	  returnData.count=data[0]["count(id)"];
                                       // {"code":0,"msg":"","count":1000,"data":[]}
							     	   res.end(JSON.stringify(returnData));      	  
					});
		     	  
	     });
         
};
// 设置添加角色
exports.addRole=function (req, res, next){
 	     var name = req.query.name ;
 	     var runSql='INSERT INTO z_admin_role ( name,description  ) VALUES ( "'+name+'", "'+name+'" )';
	     sql.runSql(runSql,function(err,data){
		     	  if(err){
		     	  	    return res.end(JSON.stringify({
				 	     	 "code":400,
					 	     "msg":'添加失败'
				 	     }));
		     	  }
				  res.end(JSON.stringify({
				 	     	 "code":200,
					 	     "msg":"添加成功"
				 	     }));
	     });
         
};
// 修改角色
exports.delRole=function (req, res, next){
 	     var runSql='DELETE FROM z_admin_role WHERE id='+req.query.id;
	     sql.runSql(runSql,function(err,data){
		     	  if(err){
		     	  	    return res.end(JSON.stringify({
				 	     	 "code":400,
					 	     "msg":'删除失败'
				 	     }));
		     	  }
				  res.end(JSON.stringify({
				 	     	 "code":200,
					 	     "msg":"删除成功"
				 	     }));
	     });
         
};

// 设置用户角色操作
exports.changRole=function (req, res, next) {
 	     var id = req.query.id ;
 	     var checked = req.query.checked;
 	     // var sqlRum='select id,name from z_admin_role order by id limit '+page+','+limitCount;
 	     // var count='select count(id) from z_admin_role';
 	     var returnData = {
			 	     	 "code":0,
				 	     "msg":"success",
				 	     "count":1000,
				 	     "data":[id,checked]
			 	     }
	     return res.end(JSON.stringify(returnData));
	     sql.runSql(sqlRum,function(err,data){
		     	  if(err){
		     	  	    return base.errorMsg(req,res,'查询失败');
		     	  }
		     	  returnData.data=data;
				  sql.runSql(count,function(err,data){
							     	  if(err){
							     	  	    base.errorMsg(req,res,'查询用户失败');
							     	  	    return false;
							     	  }
							     	  returnData.code=200;
							     	  returnData.count=data[0]["count(id)"];
                                       // {"code":0,"msg":"","count":1000,"data":[]}
							     	   res.end(JSON.stringify(returnData));      	  
					});
		     	  
	     });
         
};


/*
 *  @params aut_list[{
 *                      id:'',
 *                      describe:'',
 *                      module:'',
 *                      controller:'',
 *                      view:'',
 *                      grade:'',
 *                      per_id:'',
 *                      childred:[
 *                               id:'',
 *                               describe:'',
 *                               module:'',
 *                               controller:'',
 *                               view:'',
 *                               grade:'',
 *                               per_id:'', 
 *                               childred:[]
 *                      ]  
 *                   }]
 */

// 设置权限
exports.authority=function (req, res, next) {
             var user_id = req.params.user_id;
             var flow_control = [] ;//流程控制 （ 函数 ）
             var aut_list = []; //显示在前台的数据 [{}]
             var aut_data=[];
             
		     var role_id='select role_id from z_user_role where  register = 1 and user_id='+req.session[__adminUserInfo__].id;
		     // var per_id='select per_id from z_admin_role_permissions where role_id=';
		     var per_id_in='select per_id from z_role_permissions where  register = 1 and role_id in (';
		     // var z_per='select * from z_admin_permissions where id=';
		     var z_per_in='select * from z_permissions where  register = 1 and id in (';

	         flow_control[0]=function(){
		             var runSql = 'select * from z_permissions'; 
					 sql.runSql(runSql,function(err,data){
					     	  if(err){
					     	  	   return base.errorMsg(req,res,'查询失败');
					     	  }
					     	  // console.log(JSON.stringify(data));
                              for(var i=0;i<data.length;i++){
                              	      data[i].authority = 0;
                              }
                              aut_data=data;
                              flow_control[1]();
 	
	                          // flow_control[1](data);
					});
	         }

	         flow_control[1]=function(){
				    sql.runSql(role_id,function(err,data){
					     	  if(err){
					     	  	    return  base.errorMsg(req,res,'查询失败');
					     	  }
                              flow_control[2](data);
				   });
	         }


	         flow_control[2]=function(){
		     	    per_id_in= per_id_in + arguments[0][0].role_id +')'; 
				    sql.runSql(per_id_in,function(err,data){
					     	    if(err){
					     	    	    return  base.errorMsg(req,res,'查询失败');
					     	    }
					     	    var per_arr='';
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
					     	    flow_control[3](per_arr);  	  
				   });
	         }
	         flow_control[3]=function(){
	                sql.runSql(z_per_in+arguments[0]+')',function(err,data){//检测权限
					     	    if(err){
					     	    	    return  base.errorMsg(req,res,'查询失败');
					     	    }

					     	    for(var i=0;i<data.length;i++){
					     	    	  for(var j=0;j<aut_data.length;j++){
					     	    	  	      // console.log('++++++++++++++++++++++++'+data[i].id+'=='+aut_data[j].id);
							     	    	  if(data[i].id==aut_data[j].id){
                                                      aut_data[j].authority = 1;
							     	    	  }
					     	    	  }
					     	    }
					     	    aut_list_fn(aut_data);
					     	    // console.log(JSON.stringify(aut_list));
					     	    res.render(config.__admin_v__+'/authority',{list:aut_list});    
				     })
	         }
             
             //返回处理前台数据
             function aut_list_fn(data){
					     	  // 第一级权限
					     	  for(var i=0;i<data.length;i++){
					     	  	        if(data[i].grade==1){
									     	       	aut_list.push({
																id:data[i].id,//用户权限ID
																describe:data[i].describe,//用户权限描述
																module:data[i].module,//用户权限模块
																controller:data[i].controller,//用户权限控制器
																view:data[i].view,//用户权限页面
																grade:data[i].grade,//用户权限列表级别（菜单级别）
																p_id:data[i].p_id,//用户权限列表上级ID（菜单上级ID）
																has_authority:data[i].authority,//该用户是否有这个权限(0=>没有，1=>有)
																childred:[]//用户权限列表下级数据（菜单下级数据）
													})
					     	  	        }
					     	  }
					     	  // 第二级权限
					     	  for(var i=0;i<data.length;i++){
					     	  	        if(data[i].grade==2){
									     	  for(var j=0;j<aut_list.length;j++){
									     	  	        if(aut_list[j].id==data[i].p_id){
													     	       	aut_list[j].childred.push({
																				id:data[i].id,
																				describe:data[i].describe,
																				module:data[i].module,
																				controller:data[i].controller,
																				view:data[i].view,
																				grade:data[i].grade,
																				p_id:data[i].p_id,
																				has_authority:data[i].authority,//该用户是否有这个权限(0=>没有，1=>有)
																				childred:[]
																	})
									     	  	        }
									     	  }
					     	  	        }
					     	  }
					     	  // 第三级权限
					     	  for(var i=0;i<data.length;i++){
					     	  	        if(data[i].grade==3){
									     	  for(var j=0;j<aut_list.length;j++){
												     	  for(var k=0;k<aut_list[j].childred.length;k++){
												     	  	        if(aut_list[j].childred[k].id==data[i].p_id){
																     	    aut_list[j].childred[k].childred.push({
																						id:data[i].id,
																						describe:data[i].describe,
																						module:data[i].module,
																						controller:data[i].controller,
																						view:data[i].view,
																						grade:data[i].grade,
																						p_id:data[i].p_id,
																						has_authority:data[i].authority,//该用户是否有这个权限(0=>没有，1=>有)
																						childred:[]
																		    })
												     	  	        }
												     	  }
									     	  }
					     	  	        }
					     	  }
             }

	         flow_control[0]();         

};


// 封号
exports.closeUser=function(req, res, next) {
             // console.log(req.query);
	         let _query = req.body;
	         let userInfo = req.session[__adminUserInfo__];
	         if(_query.id==1){
	                base.returnjson(res,'100','超级管理员不能被封号 ~ ~ ~');
	                return false;
	         }
	         if(userInfo.is_valid!=1){
		                base.returnjson(res,'300','你的账户已失效');
		                return false;
	         }

	         if(userInfo.is_admin!=1){
	         	   base.returnjson(res,'101','你无权限修改');
	         	   return false;
	         }
	         
	         var runSql = 'select id,is_admin,is_valid from z_member where id = '+ _query.id; 
			 sql.runSql(runSql,function(err,data){
			     	  if(err){
			     	  	    base.returnjson(res,'001','操作失败');
			     	  	    return false;
			     	  }
			     	  var runUpdateSql = 'update z_member SET is_valid = '+( data[0].is_valid==1 ? 0 : 1 )+' WHERE id = '+ _query.id;
					  sql.runSql(runUpdateSql,function(err,data){
					     	  if(err){
					     	  	   base.returnjson(res,'100','操作失败');
					     	  	    return false;
					     	  }
					     	  base.returnjson(res,'200','操作成功');
					 });	  
			});
	         
};

// 关闭管理员权限
exports.isAdmin=function(req, res, next) {
             // console.log(req.query);
	         let _query = req.body;
	         let userInfo = req.session[__adminUserInfo__];
	         if(_query.id==1){
	                base.returnjson(res,'100','超级管理员不能被封号 ~ ~ ~');
	                return false;
	         }
	         if(userInfo.is_valid!=1){
		                base.returnjson(res,'300','你的账户已失效');
		                return false;
	         }

	         if(userInfo.is_admin!=1){
	         	   base.returnjson(res,'101','你无权限修改');
	         	   return false;
	         }
	         
	         var runSql = 'select id,is_admin,is_valid from z_member where id = '+ _query.id; 
			 sql.runSql(runSql,function(err,data){
			     	  if(err){
			     	  	    base.returnjson(res,'001','操作失败');
			     	  	    return false;
			     	  }
			     	  var runUpdateSql = 'update z_member SET is_admin = '+( data[0].is_admin==1 ? 0 : 1 )+' WHERE id = '+ _query.id;
					  sql.runSql(runUpdateSql,function(err,data){
					     	  if(err){
					     	  	   base.returnjson(res,'100','操作失败');
					     	  	    return false;
					     	  }
					     	  base.returnjson(res,'200','操作成功');
					 });	  
			});
	         
};

exports.adminList = (req, res, next) => {
 	     var count='select count(id) from z_member where is_admin = 1';
	     sql.runSql(count,function(err,data){
		     	  if(err){
		     	  	    base.errorMsg(req,res,'查询用户失败');
		     	  	    return false;
		     	  }
		     	  __adminPageInfo__.user_count = data[0]['count(id)'];
		     	  let z_role = 'select * from z_role';
			      sql.runSql(z_role,function(err,data){
				     	  if(err){
				     	  	    base.errorMsg(req,res,'查询用户失败');
				     	  	    return false;
				     	  }
				     	  __adminPageInfo__.role = data;
					      res.render(config.__admin_v__+'/admin_list',{__adminPageInfo__:__adminPageInfo__});	     	    	  
			     });
			      	     	    	  
	     });
         
};


exports.ajaxAdminList=function (req, res, next) {

 	     var limitCount=req.body.limit||10;
 	     var curr=(req.body.curr-1)*limitCount;
 	     var selsql='';
 	     let body = req.body;
		 let rqs = [];
		  if(req.body.isloadnum){
		  	   selsql='select  count(*) from z_member';
		  }else{
		  	   selsql='select a.*,u.*,r.* from z_member a INNER JOIN z_user_role u on u.user_id = a.id INNER JOIN z_role r on u.role_id = r.id  order by a.id limit '+curr+','+limitCount;
		  }

		 function appendSql(sql,addsql){
	            if(sql.indexOf('where')!=-1){
	            	    return sql.split(' where ')[0]+' where '+addsql+' and '+sql.split(' where ')[1];
	            }else{
						if(req.body.isloadnum){
							   return sql.split(' order ')[0]+' where '+addsql;
						}else{
							   return sql.split(' order ')[0]+' where '+addsql+' order '+sql.split(' order ')[1];
						}
	            }
		  }
          if(!body.type||body.type=='admin'){
		 	    const type = ' is_admin = 1 ';
		 	    selsql = appendSql(selsql,type);	  	  
		  }
		  if(body.keyworld){
		 	    const art_name = ' ( username like "%'+body.keyworld+'%"'+' or phone like "%'+body.keyworld+'%"'+' or email  like "%'+body.keyworld+'%" ) ';
		 	    selsql = appendSql(selsql,art_name);	  	  
		  }
		  if(body.minDate&&body.maxDate){
		 	    const minmaxDate = ' addtime between '+parseInt(new Date(body.minDate+' 23:59:59').getTime()/1000)+' and '+parseInt(new Date(body.maxDate+' 23:59:59').getTime()/1000);
		 	    selsql = appendSql(selsql,minmaxDate);
		  }else{
				if(body.minDate){
				    const minDate = ' addtime between '+parseInt(new Date(body.minDate+' 23:59:59').getTime()/1000)+' and '+parseInt(new Date().getTime()/1000);
				    selsql = appendSql(selsql,minDate);	  	  
				}
				if(body.maxDate){
				    const maxDate = ' addtime < '+parseInt(new Date(body.maxDate+' 23:59:59').getTime()/1000);
				    selsql = appendSql(selsql,maxDate);
			   }
		  }
		 if(req.body.isloadnum){
				  rqs = [
				          {      
							   	sql:selsql,     
							    sCallback:(data,options) => {
								   	    base.returnjson(res,'200','success',data[0]['count(*)'])
							    }
						  }
			      ];
	     }else{
				  rqs = [
				          {
							   	sql:selsql,
							    sCallback:(data,options) => {
								   	    base.returnjson(res,'200','success',data)
							    }
						  }
			      ];
	     }
		 sql.querysql({
				   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
				   eCallback:(err,options)=>{
				   	    return base.returnjson(res,'100','查询失败');
				   	    
				   }
		   })	     
         
};

exports.adminRoleList = (req,res,next) => {

}

// 添加修改用户角色
exports.userRoleAdd = (req,res,next) => {
 	     
 	     let body = req.body;
		 let rqs = [
				          {      
							   	sql:'select * from z_user_role where user_id = '+body.id,     
							    sCallback:(data,options) => {
								   	    options.end(options);   
							    }
						  }
						  ,{         
							    sCallback:(data,options) => {
								   	    base.returnjson(res,'200','修改成功')
							    }
							    ,beforeSql:(obj,options) => {
							    	  let data = options.sql_data[options.index];
							    	  // return base.returnjson(res,'200','修改成功');
							    	  if(data.length==0){
							    	  	  obj.sql = 'insert into z_user_role (user_id,role_id,register) values ('+body.id+','+body.role_id+',1)'
							    	  }else{
							    	  	  obj.sql = 'update z_user_role set user_id='+body.id+',role_id='+body.role_id+' where id='+data[0].id
							    	  }
							    	  	// obj.sql = 'insert into z_user_role (user_id,role_id,register) values ('+body.id+','+body.role_id+',1)';
							    	   //  obj.sql = 'update z_user_role set user_id='+body.id+',role_id='+body.role_id+' where id='+data[0].id
							    	  return obj;
							    }
						  }
			      ];
	    
		 sql.querysql({
				   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
				   eCallback:(err,options)=>{
				   	    return base.returnjson(res,'100','查询失败');
				   	    
				   }
		   })	
}
