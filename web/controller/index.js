var express = require('express');
var crypto = require('crypto');
var ejs = require('ejs');
var path = require('path');
var url = require('url');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');


var obj = {};

obj.index=function (req, res, next) {
     
       // 置顶
       new sql.runMysql(()=>{
       	    return base.errorMsg(req,res,'查询失败');
        } )
       .then(()=>{
       	    return 'select  a.id,a.title,a.source,a.source_link,a.time,a.update_time,a.point_num,a.img,a.description,b.clas_name,c.username,c.user_img from z_articles_list a inner join z_articles_clas b on a.art_clas_id=b.id inner join z_member c on a.user_id=c.id where a.isTop = 1 and a.is_valid=1 order by time limit 0,6';
        },
       	(data)=>{
       		__webPageInfo__.isTop = data;
       	})
       .then('select count(id) from z_articles_list',
       	(data)=>{
       		__webPageInfo__.articles_num = data[0]['count(id)'];
       		res.render(config.__web_v__+'/index',{webPageInfo:__webPageInfo__});
       	})
       .end();

	   // 置顶

	  // let rqs = [];	  
   //    rqs[0]= {
			// 	   	sql:'select  a.*,b.clas_name,c.username,c.user_img from z_articles_list a inner join z_articles_clas b on a.art_clas_id=b.id inner join z_member c on a.user_id=c.id where a.isTop = 1 and a.is_valid=1 order by time limit 0,6',
			// 	    sCallback:(data,options) => {
			// 		   	    __webPageInfo__.isTop = data;
			// 	    }
			//   }
   //    rqs[1]= {
			// 	   	sql:'select count(id) from z_articles_list',
			// 	    sCallback:(data,options) => {
			// 		  	    __webPageInfo__.articles_num = data[0]['count(id)'];
			// 		  	    res.render(config.__web_v__+'/index',{webPageInfo:__webPageInfo__}); 
			// 	    }
			//  }

	  // sql.querysql({
			//    sql:rqs,//如果这里eCallback没有传的话调默认eCallback
			//    eCallback:(err,options)=>{
			//    	    return base.errorMsg(req,res,'查询失败');
			//    }
	  //  })
      
};

// 显示搜索页面
obj.searchList=function (req, res, next) {
      let keyword = req.query.keyword;
      __webPageInfo__.keyword = keyword;
	  let getAllart = 'select count(id) from z_articles_list where concat(title,content) like "%'+keyword+'%" and is_valid = 1 ';

	  sql.runSql(getAllart,function(err,data){
		  	  if(err){
		  	  	    return base.errorMsg(req,res,'查询失败');
		  	  }
		  	  __webPageInfo__.articles_num = data[0]['count(id)'];
		  	  res.render(config.__web_v__+'/searchList',{webPageInfo:__webPageInfo__});
	  })        
};
// 获取搜索数据getSearchList
obj.getSearchList=function (req, res, next) {
      let query = req.query;
      let limitCount=query.limit||30;
      let page=(query.curr-1)*limitCount;
      let keyword = query.keyword;

	  // var clas_sql = "select * from z_articles_comment where art_list_id = " + query.id + ' order by time limit '+page+','+limitCount;
	 // 多表查询
	  // let getArtList_sql = 'select  a.*,b.user_img,b.username,c.clas_name from z_articles_list a inner  join z_member b on a.user_id=b.id inner join z_articles_clas c on a.art_clas_id=c.id  where  concat(a.title,a.content) like "%'+keyword+'%" and a.is_valid = 1  order by time limit '+page+','+limitCount;
	  
	  if(query.uid){//如果传用户ID；就查那个用户发布的文章/帖子
	  	    if(req.session[__webUserInfo__]&&query.id==req.session[__webUserInfo__].id){//如果这个用户是当前登录的用户则查全部；
	  	    	   var getArtList_sql = 'select  a.*,b.user_img,b.username,c.clas_name from z_articles_list a inner join z_member b on a.user_id=b.id inner join z_articles_clas c on a.art_clas_id=c.id where concat(a.title,a.content) like "%'+keyword+'%" and a.user_id = '+query.uid+' order by time DESC limit '+page+','+limitCount;
	  	    }else{//如果这个用户不是当前登录的用户则查 有效的文章/帖子
	  	    	   var getArtList_sql = 'select  a.*,b.user_img,b.username,c.clas_name from z_articles_list a inner join z_member b on a.user_id=b.id inner join z_articles_clas c on a.art_clas_id=c.id where concat(a.title,a.content) like "%'+keyword+'%" and a.is_valid = 1 and a.user_id = '+query.uid+' order by time DESC limit '+page+','+limitCount;
	  	    }
	  }else{//如果 没有；则查全部
	  	    var getArtList_sql = 'select  a.*,b.user_img,b.username,c.clas_name from z_articles_list a inner join z_member b on a.user_id=b.id inner join z_articles_clas c on a.art_clas_id=c.id where concat(a.title,a.content) like "%'+keyword+'%" and a.is_valid = 1 order by time DESC limit '+page+','+limitCount;
	  }
	  // console.log(getArtList_sql);
	  sql.runSql(getArtList_sql,function(err,data){
		  	  if(err){
		  	  	    return base.errorMsg(req,res,'查询失败');
		  	  }
		  	  return res.end(base.returnjson(res,200,"success",data));
	  })
};



// 获取所有的文章/帖子列表
obj.getArtList=function (req, res, next) {

      var query = req.query;
      var limitCount=query.limit||30;
      var page=(query.curr-1)*limitCount;
      // console.log(req.params);

	  // var clas_sql = "select * from z_articles_comment where art_list_id = " + query.id + ' order by time limit '+page+','+limitCount;
	 // 多表查询
	  var selectquery = 'select  a.id,a.title,a.source,a.source_link,a.time,a.update_time,a.point_num,a.img,a.description,b.user_img,b.username,c.clas_name';
	  if(query.uid){//如果传用户ID；就查那个用户发布的文章/帖子
	  	    if(req.session[__webUserInfo__]&&query.uid==req.session[__webUserInfo__].id){//如果这个用户是当前登录的用户则查全部；
	  	    	   var getArtList_sql = selectquery+' from z_articles_list a inner join z_member b on a.user_id=b.id inner join z_articles_clas c on a.art_clas_id=c.id where a.user_id = '+query.uid+' order by time DESC limit '+page+','+limitCount;
	  	    }else{//如果这个用户不是当前登录的用户则查 有效的文章/帖子
	  	    	   var getArtList_sql = selectquery+' from z_articles_list a inner join z_member b on a.user_id=b.id inner join z_articles_clas c on a.art_clas_id=c.id where a.is_valid = 1 and a.user_id = '+query.uid+' order by time DESC limit '+page+','+limitCount;
	  	    }
	  }else{//如果 没有；则查全部
	  	    var getArtList_sql = selectquery+' from z_articles_list a inner join z_member b on a.user_id=b.id inner join z_articles_clas c on a.art_clas_id=c.id where a.is_valid = 1 order by time DESC limit '+page+','+limitCount;
	  }
      console.log(getArtList_sql);

	  sql.runSql(getArtList_sql,function(err,data){ 
		  	  if(err){
		  	  	    return base.errorMsg(req,res,'查询失败');
		  	  }
		  	  return res.end(base.returnjson(res,200,"success",data));
	  })

};

// 显示文字详情页面
obj.articleDetails=function (req, res, next) {
	  var id = req.params.id;
	  var clas_sql = "select a.*,b.username,b.user_img,b.nickname,c.clas_name from z_articles_list a , z_member b , z_articles_clas c  WHERE  a.user_id = b.id  AND  a.art_clas_id = c.id AND a.is_valid = 1 AND a.id = "+ id;
	  // console.log(clas_sql);
	  sql.runSql(clas_sql,function(err,data){
		  	  if(err){
		  	  	    // console.log(0);
		  	  	    return base.errorMsg(req,res,'查询失败');
		  	  }
		  	  if(data.length==0){
		  	  	    return base.errorMsg(req,res,'没有这篇文章；或者文章已下线');
		  	  }
			  __webPageInfo__.posts = data[0];

		  	  var clas_sql = "select * from z_articles_comment where art_list_id = " + id;
			  sql.runSql(clas_sql,function(err,data){
				  	  if(err){
				  	  	    // console.log(2);
				  	  	    return base.errorMsg(req,res,'查询失败');
				  	  }
				  	  __webPageInfo__.posts.commentLenght = data.length;
				  	  res.render(config.__web_v__+'/articleDetails',{webPageInfo:__webPageInfo__});
			  })

	  })
};

// 分段上传数据 更新数据
obj.updateArtContent = (req,res,next) =>{
	//  分段上传数据库语句
	// update z_articles_list a set a.title = (select concat(a.title,'concat')) where id=24;
	// 

	  const id = req.query.id;
      const content = req.query.content;	

	  const clas_sql = "update z_articles_list a set a.content = (select concat(a.content,'"+content+"')) where id="+id;

	  sql.runSql(clas_sql,function(err,data){
		  	  if(err){
		  	  	    return res.end(base.returnjson(res,100,"更新失败"));
		  	  }
		  	  return res.end(base.returnjson(res,200,"更新成功"));
	  })
}
// 显示添加文章页面
obj.addArticle=function (req, res, next) {
	  obj.editArticle(req, res, next);

	  // var clas_sql = "select * from z_articles_clas";
	  // sql.runSql(clas_sql,function(err,data){
		 //  	  if(err){
		 //  	  	    return base.errorMsg(req,res,'查询失败');
		 //  	  }
		 //  	  var other = {};
		 //  	  __webPageInfo__.clas=[];
		 //  	  for(var i=0;i<data.length;i++){
   //                 if(data[i].id==1){
   //                       other=data[i];
   //                 }else{
   //                 	     __webPageInfo__.clas.push(data[i]);
   //                 }
		 //  	  }
		 //  	  __webPageInfo__.clas.push(other);
		 //  	  console.log(other);
		 //  	  res.render(config.__web_v__+'/addArticle',{webPageInfo:__webPageInfo__});
	  // })

      
};

// 显示编辑文章页面
obj.editArticle=function (req, res, next) {
	  
	  var params = req.params;
  	  // 编辑
  	  __webPageInfo__.editArt={
                art_clas_id:0,//分类
                title:'',//标题
                source:'',//来源
                source_link:'',//来源链接
                img:'',//图片
                description:'',//描述
                content:'',//内容
  	  }
  	 
      var clas_sql = "select * from z_articles_clas";
	  sql.runSql(clas_sql,function(err,data){
		  	  if(err){
		  	  	    return base.errorMsg(req,res,'查询失败');
		  	  }
		  	  var other = {};
		  	  __webPageInfo__.clas=[];
		  	  for(var i=0;i<data.length;i++){
                   if(data[i].id==1){
                         other=data[i];
                   }else{
                   	     __webPageInfo__.clas.push(data[i]);
                   }
		  	  }
		  	  __webPageInfo__.clas.push(other);

		      if(!params.id){ // 说明是添加
				    return  res.render(config.__web_v__+'/addArticle',{webPageInfo:__webPageInfo__});
		      }
		      // 编辑
		      var clas_sql = "select * from z_articles_list where id="+params.id;
			  sql.runSql(clas_sql,function(err,data){
				  	  if(err){
				  	  	    return base.errorMsg(req,res,'查询失败');
				  	  }
				  	  __webPageInfo__.editArt = data[0];

				  	  res.render(config.__web_v__+'/addArticle',{webPageInfo:__webPageInfo__});
			  })
	  })
};

// 添加文章评论列表
obj.addArtComment=function (req, res, next) {

	  var clas_sql = "select * from z_articles_clas";
	  sql.runSql(clas_sql,function(err,data){
		  	  if(err){
		  	  	    return base.errorMsg(req,res,'查询失败');
		  	  }
		  	  __webPageInfo__.clas = data;
		  	  res.render(config.__web_v__+'/addArticle',{webPageInfo:__webPageInfo__});
	  })
};


// 获取文章评论列表
obj.getArtComment=function (req, res, next) {
      
      var query = req.query;
      var limitCount=query.limit||10;
      var page=(query.curr-1)*query.limit;
      

	  // var clas_sql = "select * from z_articles_comment where art_list_id = " + query.id + ' order by time limit '+page+','+limitCount;
	 // 多表查询
	  var clas_sql = "select  a.*,b.user_img,b.username from z_articles_comment a inner  join z_member b  on a.user_id=b.id  where art_list_id = " + query.id + ' order by time desc limit '+page+','+limitCount;

	  sql.runSql(clas_sql,function(err,data){
		  	  if(err){
		  	  	    return base.errorMsg(req,res,'查询失败');
		  	  }
		  	  return res.end(base.returnjson(res,200,"success",data));
	  })
};

// 添加文章
// req.query.artType = 'add' ===> 是添加文章
// req.query.artType = 'edit' ===> 是编辑文章 
// 
obj.addArtContent=function (req, res, next) {
          // console.log(req.query);
          // console.log('------------------------')
          if(!req.query){
          	   return base.returnjson(res,100,"请提交信息");  
          }
          if(req.session[__webUserInfo__]==null){
          	   return  base.returnjson(res,100,"请登录");  
          }
          var query = req.query;
          var userInfo = req.session[__webUserInfo__];
	
		  if(query.artType=='edit'){
		  	      var getArtUserId = 'select user_id from z_articles_list where id = '+ query.artListId ;
				  var editArt = "UPDATE z_articles_list set "+
		                     " art_clas_id = " +  query.clas+","+
		                     " title = " +  "'"+query.title+"',"+
		                     " source_link = " +  "'"+query.source_link+"',"+
		                     " source = " +  "'"+query.source+"',"+
		                     " update_time = " +  com.timestamp()+","+
		                     " content = " +  "'"+query.content+"',"+
		                     " img = " + "'"+ query.img+"',"+
		                     " description = " + ("`" + query.description +"`").toString() + ","+
				     " where id = "+ query.artListId ;
                                  console.log(("`" + query.description +"`").toString());
			  console.log('------------------------')
				  sql.runSql(getArtUserId,function(err,data){
					  	  // console.log(data);
					  	  if(err){
					  	  	    return res.end(base.returnjson(res,1,"修改失败"));
					  	  }
						  if(data[0].user_id != userInfo.id){
						  	    return res.end(base.returnjson(res,2,"你不能修改别人的文章！"));
						  }
						  console.log(editArt);
						  sql.runSql(editArt,function(err,data){
							  	  // console.log(data);
							  	  if(err){
							  	  	    return res.end(base.returnjson(res,3,"修改失败"));
							  	  }
							  	  return res.end(base.returnjson(res,200,"修改成功",{id:query.artListId,url:'/index/articleDetails/'+query.artListId}));
						  })
				  })
		  }else{
				  var addArt = "insert into z_articles_list (user_id,art_clas_id,title,source_link,source,time,update_time,content,img,description) values ("+
		                      req.session[__webUserInfo__].id+","+
		                      query.clas+","+
		                      "'"+query.title+"',"+
		                      "'"+query.source_link+"',"+
		                      "'"+query.source+"',"+
		                      com.timestamp()+","+
		                      com.timestamp()+","+
		                      "'"+query.content+"',"+
		                      "'"+query.img+"',"+
		                      "'"+query.description+"'"+
				  ")";
				  // console.log(addArt);
				  sql.runSql(addArt,function(err,data){
					  	  // console.log(data);
					  	  if(err){
					  	  	    return res.end(base.returnjson(res,4,"修改失败"));
					  	  }
					  	  return res.end(base.returnjson(res,200,"发布成功",{id:data.insertId,url:'/index/articleDetails/'+data.insertId}));
				  })
		  }
 
};

// 对文章点赞
obj.addArtPoint=function(req,res){
          if(req.session[__webUserInfo__]==null){
          	   return  base.returnjson(res,100,"请登录");  
          }
          var nuser_id = req.session[__webUserInfo__].id;//当前登录用户ID
          // var nuser_id = 3;
          var postsId = req.query.posts_id;//当前帖子/文章ID
          obj.point(req,res,nuser_id,postsId,'z_articles_list');

}
// 对文章评论点赞
obj.addCommentPoint=function(req,res){
          if(req.session[__webUserInfo__]==null){
          	   return  base.returnjson(res,100,"请登录");  
          }
          var nuser_id = req.session[__webUserInfo__].id;//当前登录用户ID
          // var nuser_id = 1;
          var comment_id = req.query.comment_id;//当前评论ID
          obj.point(req,res,nuser_id,comment_id,'z_articles_comment');
}

obj.point = (req,res,nuser_id,id,sqlTable) => {
          // var getpointNum = "select * from "+sqlTable+" where  id ="+id;
          var getpointNum = "select point_num,point_user_id from "+sqlTable+" where  id ="+id
		  // console.log(getpointNum);
		  sql.runSql(getpointNum,function(err,data){
			  	  if(err){
			  	  	    return base.errorMsg(req,res,'查询失败');
			  	  }
                  var point_num = 0 ;//最后加入数据库中的点赞数
                  var ct_userId_arr = '';//最后加入数据库中的点赞用户ID
                  var pointBool = false;//判断是否点赞过
                  if(data.length==0){
                  	      return res.end(base.returnjson(res,200,"文章/帖子不存在"));//帖子不存在
                  }
			  	  if(data[0].point_user_id==null){//数据库中没有数据
                        point_num = 1 ;
                        ct_userId_arr = nuser_id;
			  	  }else{//数据库中有数据
					  	  
					  	  if(data[0].point_user_id.toString().indexOf(',')==-1){//判断数据库中只有一条数
                                if(data[0].point_user_id==nuser_id){
                                     ct_userId_arr = '';//取消点赞
                                     point_num = data[0].point_num-1;
                                     pointBool=true;
                                }else{
                                	 ct_userId_arr = data[0].point_user_id+','+nuser_id ;//点赞成功
                                	 point_num = data[0].point_num+1;
                                	 pointBool=false;
                                }  
					  	  }else{//多条数据

							  	  var point_user_id_ARR = (data[0].point_user_id).toString().split(',') ;
							  	  var nArr = [] ;
							  	  for(var i=0;i<point_user_id_ARR.length;i++){

				                         if(point_user_id_ARR[i]==nuser_id){
				                         	   pointBool=true;
				                         }else{
				                         	   nArr.push(point_user_id_ARR[i]);
				                         }
							  	  }
							  	  if(pointBool){//已经点赞过
							  	  	   point_num = data[0].point_num-1;
							  	  	   ct_userId_arr = nArr.join(',');
							  	  }else{
							  	  	   point_num = data[0].point_num+1;
							  	  	   ct_userId_arr = nArr.join(',')+','+ nuser_id;
							  	  }

						  }
			  	  }
			  	  var addpointNum = "UPDATE "+sqlTable+" SET point_num = '"+point_num+"',point_user_id = '"+ct_userId_arr+"' WHERE id = "+id;
				  sql.runSql(addpointNum,function(err,data){
					  	  if(err){
					  	  	    return base.errorMsg(req,res,'查询失败');
					  	  }
					  	  if(pointBool){
					  	  	    return res.end(base.returnjson(res,200,"false",{point_num:point_num}));//取消点赞
					  	  }else{
					  	  	    return res.end(base.returnjson(res,200,"true",{point_num:point_num}));//点赞成功
					  	  }
				  })
		  })
}

// 对文章/帖子 回复/评论
obj.replyPoint=(req,res) => {
          // console.log(req.query);
          let query = req.query;
          let time = com.timestamp();
          // let userId = 2;
          if(!req.session[__webUserInfo__]||!req.session[__webUserInfo__].id){
          	   return res.end(base.returnjson(res,100,"请登录")); 
          }
          var userId = req.session[__webUserInfo__].id;
          var getReplyCount = 'SELECT count(1) from z_articles_comment where art_list_id ='+query.id+' and user_id = '+userId;
          let getpointNum = "select * from z_articles_list where  id ="+query.id ;
		  sql.runSql(getpointNum,function(err,data){
				  	  if(err){
				  	  	    return base.errorMsg(req,res,'查询失败');
				  	  }
	                  if(data.length==0){
	                  	      return res.end(base.returnjson(res,200,"文章/帖子不存在"));//帖子不存在
	                  }
			          sql.runSql(getReplyCount,(err,data) => {
				          	  if(err){
				                   return res.end(base.returnjson(res,100,"查询失败"));
				          	  }

				          	  if(data[0]['count(1)']>10){//每个人每个帖子最多评论11次
			                          return res.end(base.returnjson(res,100,"每个人每个帖子最多评论11次"));
				          	  }else{
							          let replyPoint = 'insert into z_articles_comment (user_id,art_list_id,content,time) values ('+userId+','+query.id+',"'+query.motto+'",'+time+')';
							          sql.runSql(replyPoint,(err,data) => {
								          	  if(err){
								                   return res.end(base.returnjson(res,100,"查询失败"));
								          	  }
									          let update_num = 'update z_articles_list set comment_num = (select count(*) from z_articles_comment where art_list_id='+query.id+') where id='+query.id;
									          // console.log(update_num);
									          sql.runSql(update_num,(err,data) => {
									          	  if(err){
									                   return res.end(base.returnjson(res,100,"查询失败"));
									          	  }						          	  
									          	  return res.end(base.returnjson(res,200,"回复成功"));
									          })
							          })
				          	  }
			          })
          })
}



// 对文章/帖子  判断是否举报过
obj.judgeReport=(req,res) => {
          // console.log(req.query);
          
          // let userId = 2;
          if(!req.session[__webUserInfo__]){
          	   return res.end(base.returnjson(res,100,"请登录")); 
          }
	      if(!req.query){
	             return base.returnjson(res,100,"请提交信息");  
	      }
	      let query = req.query;
	      let userInfo = req.session[__webUserInfo__];
          let getReportCount = 'SELECT * from z_report where art_list_id ='+query.art_id+' and user_id = '+userInfo.id;//查询自己是否举报过、如果举报过；就不插入数据库
          sql.runSql(getReportCount,(err,data) => {
	          	  if(err){
	                   return res.end(base.returnjson(res,100,"查询失败"));
	          	  }
	          	  if(data.length!=0){//已经举报过
                         return res.end(base.returnjson(res,300,"你已经举报过了"));
	          	  }
	          	  return res.end(base.returnjson(res,200,"你已经举报过了"));
          })
}
// 对文章/帖子  举报
obj.report=(req,res) => {
          // console.log(req.query);
          
          // let userId = 2;
          if(!req.session[__webUserInfo__]){
          	   return res.end(base.returnjson(res,100,"请登录")); 
          }
	      if(!req.query){
	             return base.returnjson(res,100,"请提交信息");  
	      }
	      let query = req.query;
	      let userInfo = req.session[__webUserInfo__];  

		  const rqs = [

		          {
					   	sql:'SELECT * from z_report where art_list_id ='+query.art_id+' and user_id = '+userInfo.id,
					    sCallback:(data,options) => {
				          	  if(data.length!=0){//已经举报过
			                         return res.end(base.returnjson(res,200,"你已经举报过了"));
				          	  }
					    }
				  }
				  ,{
					   	sql:'SELECT count(*),b.report_num from z_report a,z_articles_list b where a.art_list_id ='+query.art_id+' and b.id ='+query.art_id,
					    sCallback:(data,options) => {
				          	  let count = data[0]['count(*)'];
				          	  let reportData = data[0];
					    }
				  }
				  ,{
					   	sql:'insert into z_report (user_id,art_list_id,content,time) values ('+userInfo.id+','+query.art_id+',"'+query.content+'",'+com.timestamp()+')',
					    sCallback:(data,options) => {
					    	       console.log(options.sql_data);
					          	  if(options.sql_data[1][0]['count(*)']+1 >= 3){
								          let update_num = 'update z_articles_list set is_valid = 0 , report_num = 3 where id = '+query.art_id;
					          	  }else{
								         let update_num = 'update z_articles_list set report_num = '+(options.sql_data[1][0]['count(*)']+1)+' where id = '+query.art_id;
					          	  }
					          	  sql.runSql(update_num,(err,data) => {
						          	  if(err){
						                   return res.end(base.returnjson(res,100,"查询失败"));
						          	  }						          	  
						          	  return res.end(base.returnjson(res,200,"举报成功"));
						          })
					    }
				  }
	      ];
		  sql.querysql({
				   sql:rqs,//如果这里eCallback没有传的话调默认eCallback
				   eCallback:(err,options)=>{
				   	    return base.returnjson(res,100,"查询失败");
				   	    options.end();
				   }
		   })

          // let getReportCount = 'SELECT * from z_report where art_list_id ='+query.art_id+' and user_id = '+userInfo.id;//查询自己是否举报过、如果举报过；就不插入数据库
          // sql.runSql(getReportCount,(err,data) => {
	         //  	  if(err){
	         //           return res.end(base.returnjson(res,100,"查询失败"));
	         //  	  }
	         //  	  if(data.length!=0){//已经举报过
          //                return res.end(base.returnjson(res,200,"你已经举报过了"));
	         //  	  }
		        //   let getReportCount = 'SELECT count(*),b.report_num from z_report a,z_articles_list b where a.art_list_id ='+query.art_id+' and b.id ='+query.art_id;
		        //   sql.runSql(getReportCount,(err,data) => {
			       //    	  if(err){
			       //             return res.end(base.returnjson(res,100,"查询失败"));
			       //    	  }
			       //    	  let count = data[0]['count(*)'];
			       //    	  let reportData = data[0];
	         //                  // 举报
				      //     let addReport = 'insert into z_report (user_id,art_list_id,content,time) values ('+userInfo.id+','+query.art_id+',"'+query.content+'",'+com.timestamp()+')';
				      //     sql.runSql(addReport,(err,data) => {
					     //      	  if(err){
					     //               return res.end(base.returnjson(res,100,"查询失败"));
					     //      	  }
					     //      	  // console.log(count);
					     //      	  // 如果举报 3(默认 report_num) 次封贴
					     //      	  if(reportData['count(*)']+1 >= reportData.report_num){
								  //         let update_num = 'update z_articles_list set is_valid = 0 where id ='+query.art_id;
								  //         // console.log(update_num);
								  //         sql.runSql(update_num,(err,data) => {
								  //         	  if(err){
								  //                  return res.end(base.returnjson(res,100,"查询失败"));
								  //         	  }						          	  
								  //         	  return res.end(base.returnjson(res,200,"举报成功"));
								  //         })
					     //      	  }else{
					     //      	  	      return res.end(base.returnjson(res,200,"举报成功"));
					     //      	  }

				      //     })
		        //   })
          // })
}

// 公告
obj.notice= (req,res) => {
	  res.render(config.__web_v__+'/notice',{webPageInfo:__webPageInfo__});  
}


// scokitIo
obj.socketIo= (req,res) => {



	     res.render(config.__web_v__+'/socketIo',{webPageInfo:__webPageInfo__});  
}
// scokitIo
obj.socketIo_login= (req,res) => {



	     res.render(config.__web_v__+'/socketIo_login',{webPageInfo:__webPageInfo__});  
}
// scokitIo
obj.socket_room= (req,res) => {



	     res.render(config.__web_v__+'/socket_room',{webPageInfo:__webPageInfo__});  
}


module.exports = obj;
