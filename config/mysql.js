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
				   	    options.end();
				    }
				},
			   {
				   	sql:'select * from z_articles_list',
				    sCallback:(res,options,obj) => {
                        options.end();
				    }
				},
				{
				   	sql:'select * from z_articles_clas',
				    sCallback:(res,options,obj) => {
				   	    options.end();
				    }
				}
		   ],//如果这里eCallback没有传的话调默认eCallback
		   eCallback:function(err,options){//(可选)
		   	    options.end();
		   },
		   epollsql:function(err){//(可选)
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

	      	  if(obj.beforeSql){
	      	   	     let objBeforeSql = obj.beforeSql(obj,options);
	      	   	     if(objBeforeSql!=undefined&&Object.prototype.toString.call(objBeforeSql)==="[object Object]"){
	      	   	     	   obj = objBeforeSql;
	      	   	     }
	      	  }
	      	  if(obj.skip){
	      	  	    options.sql_data[options.index]=[];
	      	  	    options.index++;
	      	  	    options.end(options);
	      	  	    return false;
	      	  }	      	  
	      	  if(Object.prototype.toString.call(obj.sql)=="[object Function]"){
	      	  	   obj.sql = obj.sql()
	      	  }
		  	  options.connection.query(obj.sql,(err,data) => {
		  	  	      options.sql_data[options.index] = [];
		  	  	      if(err){
		  	  	      	   options.isNextSql = obj.isNext;
		  	  	      	   if(obj.eCallback){
		  	  	      	   	      options.err = '数据库查询失败，请检查查询语句是否正确=> '+obj.sql;
				      	   	      let objsCallback = obj.eCallback(err,options);
				      	   	      if(objsCallback!=undefined&&Object.prototype.toString.call(objsCallback)==="[object Object]"){
				      	   	     	   options.end(objsCallback);
				      	   	      }else{
				      	   	      	   options.end();
				      	   	      }
		  	  	      	   }else if(options.params.eCallback){
		  	  	      	   	      options.err = '数据库查询失败，请检查查询语句是否正确=> '+obj.sql;
				      	   	      let objsCallback = options.params.eCallback(err,options);
				      	   	      if(objsCallback!=undefined&&Object.prototype.toString.call(objsCallback)==="[object Object]"){
				      	   	     	   options.end(objsCallback);
				      	   	      }else{
				      	   	      	   options.end();
				      	   	      }
		  	  	      	   }
		  	  	      }else{
		  	  	      	   options.sql_data[options.index]=data;
		  	  	      	   if(obj.sCallback){
				      	   	      let objsCallback = obj.sCallback(data,options);
				      	   	      if(objsCallback!=undefined&&Object.prototype.toString.call(objsCallback)==="[object Object]"){
				      	   	     	   options.end(objsCallback);
				      	   	      }else{
				      	   	      	   options.end();
				      	   	      }
		  	  	      	   }
		  	  	      }	  	  	    
		  	  })
      }
      options.end = (endOptions) =>{//endOptions用于修改内部参数options 或者 (sql/添加/新增/修改/移除)

              options = endOptions?endOptions:options;

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

/*
     sqlobj.mysql
     demo : 
        new sql.runMysql(()=>{
       	    return base.errorMsg(req,res,'查询失败');
        })
       .then(()=>{
       	    return 'select  a.*,b.clas_name,c.username,c.user_img from z_articles_list a inner join z_articles_clas b on a.art_clas_id=b.id inner join z_member c on a.user_id=c.id where a.isTop = 1 and a.is_valid=1 order by time limit 0,6';
        },
       	(data,_this)=>{
       		__webPageInfo__.isTop = data;
       	},
       	(err,_this)=>{
	        console.log(err);
       	})
       .then('select count(id) from z_articles_list',
       	(data)=>{
       		__webPageInfo__.articles_num = data[0]['count(id)'];
       		res.render(config.__web_v__+'/index',{webPageInfo:__webPageInfo__});
       	})
       .end();
 */ 

class runMysql {
      constructor(eCallback){
			this.i=0;//执行then的次数
			this.index=0;//执行sql查询的次数
			this.data={};//sql查询 返回的数据
			this.pool_i=1;//数据库连接次数
			this.sqlpool=false;//数据库连接成功
			this.code=200;//数据库连接次数 400 (Bad Request  请求出现语法错误。) 500 (Internal Server Error  服务器遇到了意料不到的情况，不能完成客户的请求)
			this.errmsg='';//错误信息
			this.pending = {};//待处理数据
			this.ishandle = false;//是否处理数据
			this.endHandle = false; //是否结束执行其他的操作、释放数据库连接
			this.init(eCallback);			
      }
      init(eCallback){
			 var _this = this;
			 // if(Object.prototype.toString.call(eCallback)==="[object Function]"){
			 if(common.typeof(eCallback,'function')){
					runMysql.prototype.eCallback = eCallback
			 }	 
			 pool.getConnection((err,connection)=>{
			       _this.connection=connection;
			       if(err){
			           	 _this.sqlpool=false;
			           	 if(_this.pool_i>=10){//如果连接失败 最多重连10次 
			           	 	  _this.connection.release();//释放链接
			           	 	  _this.code = 500;
			           	 	  _this.errmsg = '数据库连接失败';
			           	 	  if(common.typeof(_this.eCallback,'function')){
			                         _this.eCallback(err,_this);
			           	 	  }
			           	 	  return false;
			           	 }
			            _this.pool_i++;
			            _this.init();
			       }else{		
		       	        _this.sqlpool=true; 
			       	    if(_this.ishandle&&_this.sqlpool){
			       	     	   _this.query(); 
			       	    }			       	   
			       }
			  })
      }
      then(sql,sCallback,eCallback){
	      	  this.pending[this.i] = {
                   sql:sql,
                   sCallback:sCallback,
                   eCallback:eCallback
	      	  }
	      	  this.i++;
	      	  return this;
      }
      query(){
	      	  var _this = this;
	      	  if(this.endHandle){
	      	  	   this.connection.release();//释放链接
	      	  	   return false;
	      	  }
	      	  if(this.index==this.ie){
	      	  	   this.connection.release();//释放链接
	      	  	   return false;
	      	  }
	      	  if(common.typeof(_this.pending[_this.index].sql,'function')){
	      	   	     _this.pending[_this.index].sql = _this.pending[_this.index].sql(_this);
	      	  }
		  	  _this.connection.query(_this.pending[_this.index].sql,(err,data) => {
		  	  	      if(err){
  	  	      	   	       _this.errmsg = '数据库查询失败，请检查查询语句是否正确=> '+_this.pending[_this.index].sql;
  	  	      	   	       _this.code = 400;
  	  	      	   	       _this.data[_this.index]=[];
  	  	      	   	       // if(Object.prototype.toString.call(_this.thenArguments.eCallback)==="[object Function]"){
  	  	      	   	       if(common.typeof(_this.pending[_this.index].eCallback,'function')){
  	  	      	   	       	    _this.pending[_this.index].eCallback(err,_this);
  	  	      	   	       }else if(common.typeof(_this.eCallback,'function')){  	  	      	   	       	
  	  	      	   	       	     _this.eCallback(err,_this);
  	  	      	   	       }  	  	
  	  	      	   	       _this.connection.release();      	   
		  	  	      }else{
		  	  	      	   _this.data[_this.index]=data;
  	  	      	   	       // if(Object.prototype.toString.call(_this.thenArguments.sCallback)==="[object Function]"){
  	  	      	   	       if(common.typeof(_this.pending[_this.index].sCallback,'function')){
  	  	      	   	       	    _this.pending[_this.index].sCallback(data,_this);
  	  	      	   	       }
		  	  	      }	 
		  	  	      _this.index++; 	
		  	  	      _this.query();  	    
		  	 })
      }
      end(){
      	   // this.connection.release();//释放链接
            this.ishandle = true;	       	   
	   	    if(this.ishandle&&this.sqlpool){
	   	     	   this.query(); 
	   	    }	
      }
}

sqlobj.runMysql = runMysql;



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






