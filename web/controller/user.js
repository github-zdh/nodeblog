var express = require('express');
var crypto = require('crypto');
var ejs = require('ejs');
var path = require('path');
var url = require('url');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');



exports.index=function (req, res, next) {
       res.render(config.__web_v__+'/index',{webPageInfo:__webPageInfo__});  
};

// 个人中心 - 基本设置
exports.basicSetup=function (req, res, next) {

      __webPageInfo__.webAdmin.user_nav[1].check=true;//选中基本设置
      if(!req.session[__webUserInfo__]){
            return res.redirect("/login/login");
      }
      // console.log(JSON.stringify(__webPageInfo__));

      res.render(config.__web_v__+'/basicSetup',{webPageInfo:__webPageInfo__});
};


// 个人中心 - 基本设置 - 修改邮箱 
exports.reSetEmail=function (req, res, next) {
          if(!req.session[__webUserInfo__]){
            return base.returnjson(res,100,"你还没登录");
          }
          if(!req.query){
               return base.returnjson(res,100,"请提交信息");  
          }
          if(req.query.code!=req.session.emailCode){
               return base.returnjson(res,100,"验证码出错");
          }
  
          let getEmail = 'select * from z_member where email="'+req.query.email+'"';

          sql.runSql(getEmail,function(err,data){
                  if(err){
                        return base.returnjson(res,100,"查询失败");
                  }
                  if(data.length!=0){
                         return base.returnjson(res,100,"该邮箱已经注册了！");
                  }                  
                  let reEmail = 'UPDATE z_member SET email="'+req.query.email+'" WHERE id='+req.session[__webUserInfo__].id;
                  sql.runSql(reEmail,function(err,data){
                      if(err){
                            return base.returnjson(res,100,"查询失败");
                      }
                      return base.returnjson(res,200,"邮箱修改成功!");
                  })
          })
};

// 个人中心 - 我的帖子
exports.posts=function(req, res, next) {
      __webPageInfo__.webAdmin.user_nav[2].check=true;//选中我的帖子

      res.render(config.__web_v__+'/memberPosts',{webPageInfo:__webPageInfo__});

};

// 个人中心 - 我发的帖/我收藏的帖
// 我发的帖->postsType:1
// 我收藏->postsType:2
// {"code":200,"msg":"","count":1000,"data":[]} 默认
exports.memberGetPosts=function(req, res, next) {
        if(!req.session[__webUserInfo__]){
          return base.returnjson(res,100,"你还没登录");
        }
        if(!req.query){
             return base.returnjson(res,100,"请提交信息");  
        }
        let query = req.query;
        let userInfo = req.session[__webUserInfo__];
        let page = query.page ? query.page : 1;//页数
        let curr = query.limit ? (query.page-1)*query.limit : 0; //从第几个开始
        let limitCurr = query.limit || 10; //每页个数
        let getPosts = '';
        let count = 0;
        
        // 查询自己发布的文章
        if(query.postsType==1){
                 getPostsCount = 'select count(*) from z_articles_list where user_id = '+userInfo.id+' and title like "%'+(query.keyword||'')+'%"';
                 getPosts = 'select id,title,time,is_valid from z_articles_list where user_id = '+userInfo.id+' and title like "%'+(query.keyword||'')+'%" order by (time) DESC limit '+curr+','+limitCurr;

        }

        // 查询自己收藏的文章
        if(query.postsType==2){
                getPostsCount = 'select count(*) from z_articles_list a , z_articles_collect b where a.id = b.art_list_id and a.user_id = '+userInfo.id+' and a.title like "%'+(query.keyword||'')+'%"';
                getPosts = 'select b.id,a.title,a.time,a.is_valid,b.art_list_id from z_articles_list a , z_articles_collect b where a.id = b.art_list_id and a.user_id = '+userInfo.id+' and a.title like "%'+(query.keyword||'')+'%" order by (a.time) DESC limit '+curr+','+limitCurr;

        }
        sql.runSql(getPostsCount,(err,data)=>{
               if(err){
                    return base.returnjson(res,100,"查询失败");
               }
              count = data[0]['count(*)'];
              sql.runSql(getPosts,(err,data)=>{
                           if(err){
                                return base.returnjson(res,100,"查询失败");
                           }
                           return res.end(JSON.stringify({"code":200,"msg":"200","count":count,"data":data}));
              })
        })

};

// 个人中心 - 删除我发的帖 req.query.postsType==1
// 个人中心 - 取消收藏帖子 req.query.postsType==2
// {"code":200,"msg":"","count":1000,"data":[]} 默认
exports.memberDelPosts=function(req, res, next) {
        if(!req.session[__webUserInfo__]){
          return base.returnjson(res,100,"你还没登录");
        }
        // console.log(req.query);
        if(!req.query){
             return base.returnjson(res,100,"请提交信息");  
        }
        let query = req.query;
        let userInfo = req.session[__webUserInfo__];
        let getPosts = '';
        let count = 0;
        let runPostsSql = '';
        let postsType = parseInt(query.postsType) ;
       

        switch(postsType){
              case 1:
                   runPostsSql = 'delete from z_articles_list where id = '+query.id+' and user_id='+userInfo.id;
              break;
              case 2:
                   runPostsSql = 'delete from z_articles_collect where id = '+query.id+' and user_id='+userInfo.id;
              break;
              default:
                 return base.returnjson(res,100,"请提交信息错误",{query:query});
        }
        sql.runSql(runPostsSql,(err,data)=>{
               if(err){
                    return base.returnjson(res,100,"查询失败");
               }
               // console.log(data);
               if(data.affectedRows!=0){
                     return res.end(JSON.stringify({"code":200,"msg":"删除成功"}));
               }
               return res.end(JSON.stringify({"code":100,"msg":"删除失败"}));   
        })

};


// 个人中心 - 个人主页
exports.homepage = (req, res, next) => {
      let params = req.params;
      let getUserInfo = 'select username,user_img,sex,motto,nickname,addtime,province,city,area from z_member where id = '+params.id;
      sql.runSql(getUserInfo,(err,data) => {
             if(err){
             	   return base.errorMsg(req,res,'查询失败');
             }
             __webPageInfo__.personalInfo=data[0];
             __webPageInfo__.personalInfo.uid=params.id;
             
      			 let getAllart = 'select count(id) from z_articles_list where user_id ='+params.id;
      			 sql.runSql(getAllart,(err,data) => {
      			  	  if(err){
      			  	  	    return base.errorMsg(req,res,'查询失败');
      			  	  }
      			  	  __webPageInfo__.articles_num = data[0]['count(id)'];
      			  	  res.render(config.__web_v__+'/homepage',{webPageInfo:__webPageInfo__});
      			 }) 
      })
};

// 用户签到
exports.sign = (req, res, next) => {
          if(req.session[__webUserInfo__]==null){
               return  base.returnjson(res,100,"请登录");  
          }
          let nuser_id = req.session[__webUserInfo__].id;//当前登录用户ID
          
          // let nuser_id = 1;          
          let sign_num = 1;//连续签到次数
          let LocaleDate = com.LocaleDate();//获取当天0点时间戳   
          let getsign = 'select * from z_sign where user_id ='+nuser_id+' order by time desc';
          sql.runSql(getsign,function(err,data){
                    if(err){
                            return base.errorMsg(req,res,'查询失败');
                    }
                    if(data.length!=0){
                          // 判断当天是否签到过                          
                          if(LocaleDate==data[0].cur_time){
                                return res.end(base.returnjson(res,100,"你今天已经签到了~"));
                          }
                          // 判断是否连续签到
                          if(LocaleDate-data[0].cur_time == 60*60*24){
                                sign_num = data[0].sign_num + 1;   
                          }
                    }

                    var addsign = 'insert into z_sign (user_id,time,cur_time,sign_num) values ('+nuser_id+','+com.timestamp()+','+LocaleDate+','+sign_num+')';
                    // console.log(addsign);
                    sql.runSql(addsign,function(err,data){
                                if(err){
                                        return base.errorMsg(req,res,'查询失败');
                                }
                                req.session.sign=true;
                                return res.end(base.returnjson(res,200,"签到成功"));
                    })
         })

};

// 个人中心 - 基本设置 - 签名/座右铭
exports.motto = (req, res, next) => {
          if(!req.query){
               return base.returnjson(res,100,"请提交信息");  
          }

          if(req.session[__webUserInfo__]==null){
               return  base.returnjson(res,100,"请登录");  
          }

          let setMotto = 'update z_member set motto="'+req.query.motto+'" where id ='+req.session[__webUserInfo__].id;
          // console.log(setMotto);

          sql.runSql(setMotto,function(err,data){
                    if(err){
                            return base.errorMsg(req,res,'查询失败');
                    }
                    return res.end(base.returnjson(res,200,"修改成功"));
         })

};

// 个人中心 - 基本设置 - 修改昵称
exports.nickname = (req, res, next) => {
          if(!req.query){
               return base.returnjson(res,100,"请提交信息");  
          }

          if(req.session[__webUserInfo__]==null){
               return  base.returnjson(res,100,"请登录");  
          }

          let setNickname = 'update z_member set nickname="'+req.query.nickname+'" where id ='+req.session[__webUserInfo__].id;
          sql.runSql(setNickname,function(err,data){
                    if(err){
                            return base.errorMsg(req,res,'查询失败');
                    }
                    return res.end(base.returnjson(res,200,"修改成功"));
         })

};



// module.exports = index;