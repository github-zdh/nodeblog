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

// 房间信息
global.ioRooms = {};
 // global.ioRooms[rid] = {
 //       info:{}, //房间信息
 //       room:[]  //有哪些人在房间中
 // };

// 用户信息(数据库读取)
// global.ioUserInfo = [{id:0,username:'user_0'},{id:1,username:'user_1'},{id:2,username:'user_2'},{id:3,username:'user_3'}];
// 数据库读取/房间信息
// global.rInfo = { 
//   '1': [ { id: 1, username: 'user_1' }, { id: 2, username: 'user_2' } ],
//   '2': [ { id: 3, username: 'user_3' } ] 
// }

// 缓存房间聊天记录
global.chatMsg = {
              msg:'',//信息内容
              from:{uid:1,uname:'',uimg:''},// 谁发送
              status:false,//false=>未读 true =>已读
              type:'text',//信息类型
              times:12346 //发送时间
          }
// 缓存房间聊天记录
global.chatRecord = { 
  '1': [] //1是房间id
}

//  存储聊天记录到文件中
/*
    rid => 房间id
    msg => { //聊天信息
        msg:'',//信息内容
        from:{uid:1,uname:''},// 谁发送
        status:false,//false=>未读 true =>已读
        type:'text',//信息类型
        times:12346 //发送时间
    }
 */

const room = function(){
    this.init = async (room) => {
         room.on('connection', function (socket) {
              var url = socket.request;
             // console.log(url);
             // var roomUser = url.split('?room=')[1].split('&uid=');
              // console.log(roomUser);
              var rid = 1;
              var uid = 1;
              var userInfo = '';
              if(chatRecord[rid]==undefined){
                  chatRecord[rid] = [];
              }
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
              // 加入房间
              socket.on('room join',function(obj){roomJoin(obj)});
              var roomJoin = async (obj) => {
                    // console.log(obj);
                    if(obj&&obj.rid){
                        rid = obj.rid;
                    }
                    if(obj&&obj.uid){
                        uid = obj.uid;
                    }
                    // console.log(obj);
                    // 获取用户信息
                    userInfo = await asyncAwait(function(resolve,reject){
                         getUserInfo(resolve,reject,uid)
                    });
                    userInfo = userInfo['result'];
                    // console.log(userInfo);
                    // console.log('============')
                    // 添加房间
                    if(!global.ioRooms[rid]){
                           global.ioRooms[rid] = {
                                 info:{},
                                 room:[]
                           };
                    }
                     global.ioRooms[rid].info =  await asyncAwait(function(resolve,reject){
                           getRoomInfo(resolve,reject,rid)
                     });

                    if(ioRooms[rid].room.indexOf(userInfo)==-1){
                        ioRooms[rid].room.push(userInfo);
                        socket.join(rid);
                    }
                    // console.log('----------------ioRooms---------------------');
                    // console.log(ioRooms);
                    room.to(rid).emit('room sys', userInfo['username'] + '加入', ioRooms , ioRooms[rid]);

                    // 发送未读消息
                    // console.log(unread());
                    sendRoomUnread();
                    
              }
              
              // 读取该用户 存储未读消息
              var getStoreUnread = function(resolve,reject){
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
              // 修改该用户 存储未读消息 状态
              var reStoreUnread = function(){
                      var email = 'update z_room_unread set status = 1 where uid='+uid+' and rid='+rid;
                      // console.log(email);
                      sql.runSql(email,function(err,data){
                            if(err){
                                  return false;
                            }
                            return false;
                      })
              }
              //roomJoin();   
              // 发送未读消息
              const sendRoomUnread = async () => {
                    var getUnread = await asyncAwait(function(resolve,reject){
                         getStoreUnread(resolve,reject);
                    })
                    reStoreUnread();
                    var newUnreadMsg = [];
                    for(var i=0;i<getUnread.length;i++){
                        newUnreadMsg.push(getUnread[i].msg);
                    }

                    socket.emit('room unread',newUnreadMsg);
              }

              

              // 检查不在线人并且把信息存到数据库  存储未读消息
              var storeUnread = function(resolve,reject,rid,uid,msg,addtime){
                      var roomArr = [];
                      for(var i=0;i<ioRooms[rid]['info']['result'].length;i++){
                           roomArr.push(ioRooms[rid]['info']['result'][i].uid)
                      }
                      var uArr = [];
                      for(var i=0;i<ioRooms[rid].room.length;i++){
                           uArr.push(ioRooms[rid].room[i].id)
                      }
                      Array.prototype.diff = function(a){
                           return this.filter(function(i){return a.indexOf(i) < 0 ; })
                      }
                      var uroom = roomArr.diff(uArr);
                      var insertValues = '';
                      for(var i=0;i<uroom.length;i++){
                           if(i==0){
                                 insertValues = '('+rid+','+uroom[i]+',\''+msg+'\','+addtime+','+uid+')';
                           }else{
                                 insertValues = insertValues + ','+ '('+rid+','+uroom[i]+',\''+msg+'\','+addtime+','+uid+')';
                           }
                      }
                      var email = 'insert into z_room_unread (rid,uid,msg,addtime) VALUES '+insertValues;
                      // console.log('insertValues------>'+insertValues);
                      // console.log(email);
                      sql.runSql(email,function(err,data){
                            GetReHomeChatNum();
                            if(err){
                                  resolve({code:100,msg:"查询失败",result:[]});
                                  return false;
                            }                            
                            resolve({code:200,msg:"查询成功",result:data});
                      })
                      // 触发未读消息在首页显示未读数量
                      function GetReHomeChatNum(){
                            var selectNum = 'select uid, COUNT(*) as counts from z_room_unread where status =0 and rid='+rid+' group by uid ';
                            // console.log('selectNum----->'+selectNum)
                            sql.runSql(selectNum,function(err,data){
                                  if(err){
                                        return false;
                                  }
                                  for(var i=0;i<data.length;i++){
                                       reHomeChatNum(data[i].uid,rid,data[i].counts);
                                  }                                  
                            })
                      }
                      
              }
              // 存储所有的聊天记录
              var storeAllChatMsg = function(addtime,msg,uid){
                      var email = 'insert into z_room_msg (rid,msg,addtime,fromUid) VALUES ('+rid+',\''+msg+'\','+addtime+','+uid+')';
                      console.log(email);
                      sql.runSql(email,function(err,data){
                            if(err){
                                  return false;
                            }
                            return false;
                      })
              }
              // 更新首页 群聊天未读信息数量
              function reHomeChatNum(uid,rid,num){
                   socket.server.nsps['/home'].emit('uid_'+uid+'_num',{rid:rid,num:num})
              }
              // 接收发的信息
              socket.on('room sendMsg', async function(data,callback){
                    // 给某个房间触发信息
                    // 默认发送文字
                    var smsg = {
                            msg:data.sendMsg.replace(/"/g,"\\\""),//信息内容
                            fromUid:userInfo['id'],// 谁发送
                            username:userInfo['username'],
                            user_img:userInfo['user_img'],
                            nickname:userInfo['nickname'],
                            status:false,//false=>未读 true =>已读
                            type:data.type?data.type:'text',//信息类型 text/img/video
                            times:parseInt(new Date().getTime()/1000) //发送时间
                    }

                    room.to(rid).emit('room msg', smsg );

                    // var _smsg = JSON.stringify(smsg);
                    var reg = /(\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff])/g;//过滤emoji表情图片
                    var _smsg = smsg.msg.replace(reg,'emoji');
                    storeAllChatMsg(smsg.times,_smsg,userInfo['id']);

                    //  更新自己首页 群聊天信息列表
                    reHomeChatNum(uid,rid,0);

                    // 存储未读消息
                    await asyncAwait(function(resolve,reject){
                           storeUnread(resolve,reject,rid,uid,_smsg,smsg.times,userInfo['id'])
                    });
                     
                    // var getStoreUnread = await asyncAwait(function(resolve,reject){
                    //        storeUnread(resolve,reject,rid,uid,msg)
                    //  });
                    if(callback){callback(data)};
              })
              //断网或者离开当前聊天页面
              socket.on('disconnect',function(){
                    // console.log('>>>>>>>>>>>>>');
                    // console.log(ioRooms);
                    // console.log(rid);
                    // console.log(ioRooms[rid]);
                    // console.log(userInfo)
                    // 移除保存的房间用户信息
                    var userSplice = ioRooms[rid].room.indexOf(userInfo);
                    if(userSplice>-1){
                         ioRooms[rid].room.splice(userSplice,1);
                    }      
                    // console.log(userInfo['username'] + '离开'); 
                    // console.log(ioRooms[rid]);             
                    // 告诉当前房间离开的用户
                    room.to(rid).emit('room sys', userInfo['username'] + '离开', ioRooms , ioRooms[rid]);
              })
        });
    }

    return this.init;
}

module.exports = new room();
