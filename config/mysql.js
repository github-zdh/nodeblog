// https://www.npmjs.com/package/mysql#pool-events 查看数据库查询写法
var mysql=require('mysql');
var config=require('./config');
var common=require('./common');
var pool=mysql.createPool(config.sql);//配置数据库 应用池

var sqlobj = {};

// 把数据库语句送到数据库运行
sqlobj.runSql=function(sql,callback,callbackParams){
	pool.getConnection(function(err,connection){
		  connection.query(sql,function(err,res){
		  	    if(callback!=null&&callbackParams!=null){
		  	    	 callback(err,res,callbackParams);
		  	    }else if(callback!=null){
                     callback(err,res);
		  	    }
		  	    connection.release();//释放链接
		  })
	})
}

/*
  @params //两种方法选其一 其实第一种最后也处理成第二种
  params.end();//不管失败还是成功都要掉这个函数；否则不执行下一步sql

   params
  1=> {
	   sql:[sql1,sql2,sql3],
	   callback:[{sCallback:fn,eCallback:fn,end_bool:false},{sCallback:fn,eCallback:fn},{sCallback:fn,eCallback:fn}],//如果这里eCallback没有传的话调默认eCallback
	   eCallback:fn, //默认eCallback
	   res:res,
	   req:req,
	   next:next

   }
   //或
  2=> {
	   sql:[{sql:sql1,sCallback:fn,eCallback:fn,end_bool:false},{sql:sql2,sCallback:fn,eCallback:fn},{sql:sql3,sCallback:fn,eCallback:fn}],//如果这里eCallback没有传的话调默认eCallback
	   eCallback:fn //默认eCallback
	   res:res,
	   req:req,
	   next:next
   }
   

   common.objType(o);//判断类型
   mysql.querysql({
	   sql:[sql1,sql2,sql3],
	   callback:[{sCallback:fn,eCallback:fn,end_bool:false},{sCallback:fn,eCallback:fn},{sCallback:fn,eCallback:fn}],//如果这里eCallback没有传的话调默认eCallback
	   eCallback:fn //默认eCallback
	   epollsql:fn //数据库连接失败
	   res:res,
	   req:req,
	   next:next
   })
   或
   mysql.querysql({
	   sql:[{sql:sql1,sCallback:fn,eCallback:fn,end_bool:false},{sql:sql2,sCallback:fn,eCallback:fn},{sql:sql3,sCallback:fn,eCallback:fn}],//如果这里eCallback没有传的话调默认eCallback
	   eCallback:fn //默认eCallback
	   epollsql:fn //数据库连接失败
	   res:res,
	   req:req,
	   next:next
   })
   

   demo:
	   sql.querysql({
		   sql:[
			   {
				   	sql:'select * from z_member',
				    sCallback:(res,options,obj) => {
				   	    console.log('---------------->sql.z_member');
				   	    console.log(res);
				   	    options.end();
				    }
				},
			   {
				   	sql:'select * from z_articles_list',
				    sCallback:(res,options,obj) => {
				   	    console.log('---------------->sql.z_articles_list');
				   	    console.log(res);
                        options.end();
				    }
				},
				{
				   	sql:'select * from z_articles_clas',
				    sCallback:(res,options,obj) => {
				   	    console.log('---------------->sql.z_articles_clas');
				   	    console.log(res);
				   	    options.end();
				    }
				}
		   ],//如果这里eCallback没有传的话调默认eCallback
		   eCallback:function(err,options){//(可选)
		   	    console.log('---------------->sql.eCallback');
		   	    options.end();
		   },
		   epollsql:function(err){//(可选)
		   	    console.log('---------------->epollsql');
		   },
		   res:res,//(可选)
		   req:req,//(可选)
		   next:next//(可选)
	   })

 */
sqlobj.querysql = (params) =>{
      var options = {};
      options.i = 0;
      options.sql_data = {};//数据查询结果
      options.index = 0;//判断执行到那个options.params.sql
      options.isNextSql = true;//如果遇到查询失败 是否结束查询//不管失败还是成功 false =>不执行下一步查询；trun执行下一步查询
      options.params = params;
      options.runquerysql = '';
      options.err = '';//自定义错误信息

      if(common.objType(options.params.sql[0])==='string'){
            for(options.i;options.i<options.params.sql.length;options.i++){
                 options.params.sql[options.i] = {
	                 	 sql       : options.params.sql[options.i],
	                 	 sCallback : options.params.callback[options.i]&&options.params.callback[options.i].sCallback?options.params.callback[options.i].sCallback:null,
	                 	 eCallback : options.params.callback[options.i]&&options.params.callback[options.i].eCallback?options.params.callback[options.i].eCallback:null,
	                 	 isNext    : options.params.callback[options.i]&&options.params.callback[options.i].end_bool ?options.params.callback[options.i].end_bool :false //不管失败还是成功 false =>不执行下一步查询；trun执行下一步查询
                 }
            }
            options.i=0;
      }
      options.pool_i = 1;
      options.pool_bool = false;
      options.pool=(queryFn) => {
			  pool.getConnection((err,connection)=>{
                   options.connection=connection;
			       options.release=() => {
			              options.connection.release();//释放链接
			       }
                   if(err){
	                   	 if(options.pool_i>=10){//如果连接失败 最多重连10次 
	                   	 	  options.release();//释放链接 
	                   	 	  options.err = '数据库连接失败';
	                   	 	  if(options.params.epollsql){
		                               options.params.epollsql(err,options);
		                               if(options.params.eCallback){
					  	  	      	   	     options.params.eCallback(err,options)
					  	  	      	   }else{
					  	  	      	   	    options.params.callback[0].eCallback(err,options)
					  	  	      	   }
	                   	 	  }
	                   	 	  return false;
	                   	 }
                        options.pool_i++;
                        options.pool();
                   }else{
	                   	  options.pool_bool = true;
	                   	  if(queryFn){
	                   	  	    queryFn(options.runquerysql);
	                   	  }
                   }
			  })
      }
      options.query = (obj) => {
		  	  options.runquerysql = obj;

		  	  if(!options.pool_bool){
		  	  	   options.pool(options.query);
		  	  	   return false;
		  	  }
		  	  options.connection.query(obj.sql,(err,data) => {
		  	  	      if(err){
		  	  	      	   options.isNextSql = obj.isNext;
		  	  	      	   if(obj.eCallback){
		  	  	      	   	     options.err = '数据库查询失败，请检查查询语句是否正确=> '+obj.sql;
		  	  	      	   	     obj.eCallback(err,options);
		  	  	      	   }else if(options.params.eCallback){
		  	  	      	   	     options.err = '数据库查询失败，请检查查询语句是否正确=> '+obj.sql;
		  	  	      	   	     options.params.eCallback(err,options);
		  	  	      	   }
		  	  	      }else{
		  	  	      	   if(obj.sCallback){
		  	  	      	   	      obj.sCallback(data,options);
		  	  	      	   	      options.sql_data[options.index]=data;
		  	  	      	   }
		  	  	      }	  	  	    
		  	  })
      }
      options.end = (endOptions) =>{//endOptions用于修改内部参数options 或者 (sql/添加/新增/修改/移除)
              if(endOptions!=undefined){
                     options = endOptions;
              }else{
              	     options = options;
              }
              if(options.index < options.params.sql.length){
                     if(options.isNextSql){
	                     options.query(options.params.sql[options.index]);
	                     options.index++;
                     }else{
                     	 if(options.params.endFunction){
                     	 	  options.params.endFunction(options);
                     	 }else{
                     	 	  if(options.release){
                     	 	  	   options.release();
                     	 	  }
                     	 }
                     }
              }else{
	         	 	  if(options.release){
	         	 	  	   options.release();
	         	 	  }
              }
      }
      if(options.params.params){
           options.end(options.params.params);
      }else{
      	   options.end();
      }
      
}



//      查询语句
// 		var userId = 1;
// 		var columns = ['username', 'email'];
// 		var query = connection.query('SELECT ?? FROM ?? WHERE id = ?', [columns, 'users', userId], function (error, results, fields) {
// 		    if (error) throw error;
// 		  	// ... 
// 		});

//      更新语句
//      result.affectedRows=1 更新成功


//      插入语句
// 		connection.query('INSERT INTO posts SET ?', {title: 'test'}, function (error, results, fields) {
// 		     if (error) throw error;
// 		 	 console.log(results.insertId);
// 		});


//     删除语句
// 		connection.query('DELETE FROM posts WHERE title = "wrong"', function (error, results, fields) {
// 		     if (error) throw error;
// 		 	 console.log('deleted ' + results.affectedRows + ' rows');
// 		})


module.exports = sqlobj;






