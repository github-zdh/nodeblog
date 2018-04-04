var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');


exports.index=function (req, res, next) {
        
        res.render(config.__admin_v__+'/authority_index',{__adminPageInfo__:__adminPageInfo__});
};

exports.list=function (req, res, next) {
	  let rqs = [
	          {
				   	sql:'select * from z_permissions where register=1',
				    sCallback:(data,options) => {
					   	     base.returnjson(res,'200','success',data);	
				    }
			  }
     ];
	 sql.querysql({
			   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
			   eCallback:(err,options)=>{
			   	    return base.returnjson(res,'100','查询失败');
			   	    
			   }
	   })	
};

exports.add=function (req, res, next) {
	  
      var _body = req.body;
      let addsql = '';
	  let rqs = [
	          {
				   	sql:'select * from z_permissions where register=1',
				    sCallback:(data,options) => {
					   	    for(var i=0;i<data.length;i++){
					   	    	  if(data[i].module==_body.module&&data[i].controller==_body.controller&&data[i].view==_body.view){
                                         base.returnjson(res,'100','模块已存在');	
					   	    	  }
					   	    }    
				    }
			  }
			  ,{
				   	sql:'insert into z_permissions (descript,module,controller,view,grade,p_id,register) values ("'+_body.descript+'","'+_body.module+'","'+_body.controller+'","'+_body.view+'",'+_body.grade+','+_body.p_id+','+_body.register+')',
				    sCallback:(data,options) => {
					   	     base.returnjson(res,'200','新增成功');	
				    }
			  }
     ];
	 sql.querysql({
			   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
			   eCallback:(err,options)=>{
			   	    return base.returnjson(res,'100','查询失败');
			   	    
			   }
	   })	
};

