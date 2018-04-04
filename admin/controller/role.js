var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');



// 设置用户角色
exports.index=function (req, res, next) {
 	     var count='select count(id) from z_role';
	     sql.runSql(count,function(err,data){
		     	  if(err){
		     	  	    base.errorMsg(req,res,'查询用户失败');
		     	  	    return false;
		     	  }
		     	  __adminPageInfo__.user_count = data[0]['count(id)'];
			      res.render(config.__admin_v__+'/admin-role',{__adminPageInfo__:__adminPageInfo__});		     	    	  
	     });
         
};

// 设置用户角色列表
exports.roleList=function (req, res, next) {

 	     var limitCount=req.body.limit||10;
 	     var curr=(req.body.curr-1)*limitCount;
 	     var selsql='';
 	     let body = req.body;
		 let rqs = [];
		  if(req.body.isloadnum){
		  	   selsql='select  count(*) from z_role';
		  }else{
		  	   selsql='select * from z_role order by id limit '+curr+','+limitCount;
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
				   	    options.end();
				   }
		   })	     
         
};
// 添加角色/编辑角色
exports.add=function (req, res, next){
         var query = req.query;
         __adminPageInfo__.role = {
         	 name:'',
         	 description:''
         };
         __adminPageInfo__.role_per = [];
         if(query.id){
				  let rqs = [
				          {
							   	sql:'select * from z_role where id='+query.id,
							    sCallback:(data,options) => {
								   	      __adminPageInfo__.role = data[0];
								   	      options.end();	
							    }


						  }
						  ,{
							   	sql:'select per_id from z_role_permissions where role_id='+query.id,
							    sCallback:(data,options) => {
								   	      __adminPageInfo__.role_per = data;
								   	      options.end();	
							    }


						  }
						  ,{
							   	sql:'SELECT	p.* FROM z_permissions AS p LEFT JOIN z_role_permissions AS rp ON p.id = rp.per_id LEFT JOIN z_role AS r ON rp.role_id = r.id where r.register = 1 and r.id = '+query.id,
							    sCallback:(data,options) => {
								   	      __adminPageInfo__.data = data;
								   	      res.render(config.__admin_v__+'/admin-role-add',{__adminPageInfo__:__adminPageInfo__});
							    }

						  }
			     ];
				 sql.querysql({
						   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
						   eCallback:(err,options)=>{
						   	    return base.returnjson(res,'100','查询失败');
						   	    options.end();
						   }
				   })	  
         }else{
         	     res.render(config.__admin_v__+'/admin-role-add',{__adminPageInfo__:__adminPageInfo__});	
         }
	     	
         
};
// 设置添加角色
exports.ajaxAdd=function (req, res, next){

         let body  = req.body;
         let rqs = [];

         if(body.id){
				  rqs = [
				         {
						   	sql:'select id from z_role where name="'+body.roleName+'"',
						    sCallback:(data,options) => {
							   	      if(data.length!=0&&data[0]['id']&&data[0]['id']!=body.id){
							   	      	   base.returnjson(res,'100','该角色已存在,请重命名');
							   	      	   return false;
							   	      }
							   	      options.end();	
						    }
					    }
					    ,{
						   	sql:'update z_role set name="'+body.roleName+'",description="'+body.description+'" where id='+body.id,
						    sCallback:(data,options) => {
							   	      options.end();	
						    }
					    }
					    ,{
							   	sql:'select * from z_role_permissions where role_id='+body.id,
							    sCallback:(data,options) => {
								   	     options.end();	
							    }
							    
						  }
						  ,{
							   	sCallback:(data,options) => {
								   	      if(options.add.length==0){
								   	      	    return base.returnjson(res,'200','添加成功');
								   	      }
								   	      options.end();
							    }
							    ,beforeSql:function(obj,options){

							    	let data = options.sql_data[options.index];
						   	        let _per= body['per[]'];

						    	    options.del=[];
						    	    options.add=[];
						   	        let new_per = [] ;

						   	        for(var i=0;i<data.length;i++){
						   	        	if(_per.indexOf(String(data[i].per_id))==-1){
						   	        		options.del.push(data[i].id);
						   	        	}else{
						   	        		new_per.push(String(data[i].per_id));
						   	        	}
						   	        }
						   	        for(var i=0;i<_per.length;i++){
						   	        	if(new_per.indexOf(_per[i])==-1){
						   	        		options.add.push(Number(_per[i]));
						   	        	}
						   	        }
						   	        if(options.del.length==0){
						   	        	obj.skip = true;
						   	        	obj.isNext = true;
						   	        }else{
						   	        	obj.sql = 'DELETE FROM z_role_permissions WHERE id in ('+options.del.join(',')+')';
						   	        }
						   	        return obj;
							    }
						  }
						  ,{
							   	sCallback:(data,options) => {
								   	      base.returnjson(res,'200','添加成功');
							    }
							    ,beforeSql:function(obj,options){
							    	let data = options.add;
							    	if(options.add.length==0){
							    		return base.returnjson(res,'200','添加成功');
							    	}
							    	function insertValue(){
                                            var intosql = '';
                                            if(data.length>1){
                                            	 for(var i=0;i<data.length;i++){
                                            	 	   
                                            	 	   if(intosql==''){
                                            	 	   	   intosql = '('+body.id+','+data[i]+',1)'
                                            	 	   }else{
                                            	 	   	   intosql = intosql + ' , ('+body.id+','+data[i]+',1)'
                                            	 	   } 
                                            	 }
                                            }else{
                                            	intosql = '('+body.id+','+data[0]+',1)'
                                            }
                                            return intosql;
							    	}
							    	obj.sql='insert into z_role_permissions (role_id,per_id,register) VALUES ' + insertValue();
							    	return obj;
							    }

						  }
			     ];
  
         }else{
				  rqs = [
					    {
						   	sql:'select * from z_role where name="'+body.roleName+'"',
						    sCallback:(data,options) => {
							   	      if(data.length!=0){
							   	      	   base.returnjson(res,'100','该角色已存在,请重命名');
							   	      	   return false;
							   	      }
							   	      options.end();	
						    }
					    }
					    ,{
						   	sql:'insert into z_role (name,description,register) VALUES  ("'+body.roleName+'","'+body.description+'",1)',
						    sCallback:(data,options) => {
							   	      options.end();	
						    }
					    }
					    ,{
							    sCallback:(data,options) => {
								   	      return base.returnjson(res,'200','添加成功');
								   	      options.end();	
							    }
							    ,beforeSql:function(obj,options){
							    	let insertId = parseInt(options.sql_data[options.index].insertId);
							    	let data = body['per[]'];
							    	if(data=='undefined'){
							    		return base.returnjson(res,'200','添加成功,请编辑权限');
							    	}
							    	function insertValue(){
                                            var intosql = '';
                                            if(data.length>1){
                                            	 for(var i=0;i<data.length;i++){
                                            	 	   
                                            	 	   if(intosql==''){
                                            	 	   	   intosql = '('+insertId+','+data[i]+',1)'
                                            	 	   }else{
                                            	 	   	   intosql = intosql + ' , ('+insertId+','+data[i]+',1)'
                                            	 	   } 
                                            	 }
                                            }else{
                                            	intosql = '('+insertId+','+data[0]+',1)'
                                            }
                                            return intosql;
							    	}
							    	obj.sql='insert into z_role_permissions (role_id,per_id,register) VALUES ' + insertValue();
							    	return obj;
							    }
						}
				  ];
         }
         
		 sql.querysql({
				   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
				   eCallback:(err,options)=>{
				   	    base.returnjson(res,'202','添加失败');
				   	    options.end();
				   }
		   })	
};

// 删除角色
exports.del=function (req, res, next){
 	     var runSql='DELETE FROM z_role WHERE id='+req.body.id;
	     sql.runSql(runSql,function(err,data){
		     	  if(err){
		     	  	    base.returnjson(res,'100','删除失败');
		     	  }
		     	  base.returnjson(res,'200','删除成功');
	     });
         
};
