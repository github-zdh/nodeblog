var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');



Function.prototype.list=function (req, res, next) {
	  const rqs = [

	          {
				   	sql:'select COUNT(*) from z_articles_list',
				    sCallback:(data,options) => {				    	
				    	    __adminPageInfo__.art_count = data[0]['COUNT(*)'];
				    	    options.end();					   	    
				    }
			  }
			  ,{
				   	sql:'select * from z_articles_clas  order by id desc',
				    sCallback:(data,options) => {
				    	    __adminPageInfo__.clas = data;
					   	    res.render(config.__admin_v__+'/articles_list',{__adminPageInfo__:__adminPageInfo__}); 
				    }
			  }
      ];
	  sql.querysql({
			   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
			   eCallback:(err,options)=>{
			   	    return base.errorMsg(req,res,'查询失败');
			   	    options.end();
			   }
	   })
        
};
// ajax 加载文章列表数据
Function.prototype.lists=function (req, res, next) {
	  const body = req.body;
	  let selsql = '';
	  function appendSql(sql,addsql){
            if(sql.indexOf('where')!=-1){
            	   return sql.split(' where ')[0]+' where '+addsql+' and '+sql.split(' where ')[1];
            }else{
            	   return sql.split(' order ')[0]+' where '+addsql+' order '+sql.split(' order ')[1];
            }
	  }
	  selsql = 'select a.id,a.update_time,a.title,a.report_num,a.is_valid,b.username from z_articles_list a inner join z_member b on a.user_id = b.id order by update_time desc limit '+(body.curr-1)*body.limit+','+body.limit;
	  if(body.clas_id){
	 	    const clas_id = 'a.art_clas_id = '+body.clas_id;
	 	    selsql = appendSql(selsql,clas_id);	
	  }
	  if(body.art_name){
	 	    const art_name = 'a.title  like "%'+body.art_name+'%"';
	 	    selsql = appendSql(selsql,art_name);	  	  
	  }
	  if(body.minDate&&body.maxDate){
	 	    const minmaxDate = ' update_time between '+parseInt(new Date(body.minDate+' 23:59:59').getTime()/1000)+' and '+parseInt(new Date(body.maxDate+' 23:59:59').getTime()/1000);
	 	    selsql = appendSql(selsql,minmaxDate);
	  }else{
			if(body.minDate){
			    const minDate = ' update_time between '+parseInt(new Date(body.minDate+' 23:59:59').getTime()/1000)+' and '+parseInt(new Date().getTime()/1000);
			    selsql = appendSql(selsql,minDate);	  	  
			}
			if(body.maxDate){
			    const maxDate = ' update_time < '+parseInt(new Date(body.maxDate+' 23:59:59').getTime()/1000);
			    selsql = appendSql(selsql,maxDate);
		   }
	  }
	  let rqs = [];
	  if(body.isloadnum){
			  rqs = [
			          {
						   	sql:'select COUNT(*) from '+selsql.split('from')[1],
						    sCallback:(data,options) => {
							   	    base.returnjson(res,'200','success',data[0]['COUNT(*)'])
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
			   	    return base.returnjson(res,'200','查询失败');
			   	    options.end();
			   }
	   })
        
};
// 管理员封贴/解封
Function.prototype.paste=function (req, res, next) {
      let isPasteSql = '';
      
      let isPaste = typeof req.body.isPaste == 'string' ? req.body.isPaste=='true' : req.body.isPaste;

      if(isPaste){
              //解封( 解封同时把举报数量变成0)
			  isPasteSql = 'update z_articles_list set is_valid = 1 and report_num = 0 where id = '+req.body.id
	  }else{
		      isPasteSql = 'update z_articles_list set is_valid = 0 where id = '+req.body.id
	  }
	  let rqs = [
	          {
				   	sql:isPasteSql,
				    sCallback:(data,options) => {	    	
				    	   base.returnjson(res,'200','success',data)				   	    
				    }
			  }
      ];
	  sql.querysql({
			   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
			   eCallback:(err,options)=>{
			   	    base.returnjson(res,'100','查询失败')
			   	    options.end();
			   }
	   })
        
};
module.exports = new Function();

