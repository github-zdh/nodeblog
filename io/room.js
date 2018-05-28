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
const chatMsgToText = (rid,msg) => {
      
}

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
              // 加入房间
              socket.on('room join',function(obj){roomJoin(obj)});
              var roomJoin = async (obj) => {
                    console.log(obj);
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
                    console.log(userInfo);
                    console.log('============')
                    if(!global.ioRooms[rid]){
                         global.ioRooms[rid] = [];
                    }
                    if(ioRooms[rid].indexOf(userInfo)==-1){
                        ioRooms[rid].push(userInfo);
                        socket.join(rid);
                    }
                    // console.log('----------------ioRooms---------------------');
                    // console.log(ioRooms);
                    room.to(rid).emit('room sys', userInfo['result']['username'] + '加入', ioRooms , ioRooms[rid]);
              }
              
              //roomJoin();   
              // 发送未读消息
              const unread = () => {
                   return chatRecord[rid];
              }
              socket.emit('room unread',unread());

              // 接收发的信息
              socket.on('room sendMsg',function(data,callback){
                    // 给某个房间触发信息
                    var smsg = {
                            msg:data.sendMsg,//信息内容
                            from:userInfo['result'],// 谁发送
                            status:false,//false=>未读 true =>已读
                            type:'text',//信息类型
                            times:new Date().getTime() //发送时间
                    }
                    console.log(chatRecord);
                    if(!chatRecord[rid]){
                         chatRecord[rid] = [];
                    }
                    chatRecord[rid].push(smsg)
                    room.to(rid).emit('room msg', smsg );
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
                    var userSplice = ioRooms[rid].indexOf(userInfo);
                    ioRooms[rid].splice(userSplice);
                    // 告诉当前房间离开的用户
                    room.to(rid).emit('room sys', userInfo['username'] + '离开', ioRooms , ioRooms[rid]);
              })
        });
    }

    return this.init;
}

module.exports = new room();
