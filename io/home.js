var fs = require('fs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');

function asyncAwait(fun){
     return new Promise(function(resolve,reject){
         if(fun){
             fun(resolve,reject)
             // resolve(res) res=>返回的结果
             // reject  rej返回报错
         }else{
             resolve();
         }
     })
}

const _home = function(){
    this.init = async (_home) => {
         _home.on('connection', function (socket) {
              // 更新首页 群聊天未读信息数量
              function reHomeChatNum(uid,rid,num){
                   socket.server.nsps['/home'].emit('uid_'+uid+'_num',{rid:rid,num:num})
              }
              // 触发未读消息在首页显示未读数量
              function GetReHomeChatNum(uid){
                    var selectNum = 'select rid, COUNT(*) as counts from z_room_unread where status =0 and uid='+uid+' group by rid';
                    sql.runSql(selectNum,function(err,data){
                          if(err){
                                return false;
                          }
                          for(var i=0;i<data.length;i++){
                               reHomeChatNum(uid,data[i].rid,data[i].counts);
                          }                                  
                    })
              }
              socket.on('home GetReHomeChatNum',function(obj){
                    GetReHomeChatNum(obj.uid)
              });

              // 读取用户信息
              var getUserInfo = function(resolve,reject,uid){
                      var email = 'select * from z_member where id="'+uid+'"';
                      sql.runSql(email,function(err,data){
                          if(err){
                                resolve({code:100,msg:"查询失败"});
                                return false;
                          }
                          if(data.length==0){
                                resolve({code:202,msg:"用户不存在"});
                                return false;
                          }
                          delete data[0].password;
                          resolve({code:200,msg:"查询成功",result:data[0]});
                      })
              }
              // 读取房间信息
              var getRoomInfo = function(resolve,reject,rid){
                      var email = 'select r.*,u.uid,u.description as udescriptio from z_room r left join z_user_room u on u.rid=r.id where r.id="'+rid+'"';
                      sql.runSql(email,function(err,data){
                          if(err){
                                var info = global.ioRooms[rid] ? global.ioRooms[rid].info:{};
                                resolve({code:100,msg:"查询失败",result:info});
                                return false;
                          }
                          resolve({code:200,msg:"查询成功",result:data});
                      })
              }
              
              // 读取该用户 存储未读消息
              var getStoreUnread = function(resolve,reject,uid,rid){
                      var email = 'SELECT msg  from z_room_unread where status = 0 and uid='+uid+' and rid='+rid+' order by addtime ASC';
                      // console.log(email);
                      sql.runSql(email,function(err,data){
                            if(err){
                                  resolve([]);
                                  return false;
                            }
                            resolve(data);
                      })
              }

              
              

              //断网或者离开当前聊天页面
              socket.on('disconnect',function(){

              })
        });
    }

    return this.init;
}

module.exports = new _home();
