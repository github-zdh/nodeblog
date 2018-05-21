var fs = require('fs');

// 房间信息
global.ioRooms = {};
// 用户信息(数据库读取)
global.ioUserInfo = [{id:0,username:'user_0'},{id:1,username:'user_1'},{id:2,username:'user_2'},{id:3,username:'user_3'}];
// 数据库读取/房间信息
global.rInfo = { 
  '1': [ { id: 1, username: 'user_1' }, { id: 2, username: 'user_2' } ],
  '2': [ { id: 3, username: 'user_3' } ] 
}

// 缓存房间聊天记录
global.chatMsg = {
              msg:'',//信息内容
              from:{uid:1,uname:''},// 谁发送
              status:false,//false=>未读 true =>已读
              type:'text',//信息类型
              times:12346 //发送时间
          }
global.chatRecord = { 
  '1': [],
  '2': [] 
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
    this.init = (room) => {
         room.on('connection', function (socket) {
              var url = socket.request.headers.referer;
              // console.log(url);
              var roomUser = url.split('?room=')[1].split('&uid=');
              // console.log(roomUser);
              var roomID = roomUser[0];
              var uIndex = roomUser[1];
              var userInfo = '';
              // 加入房间
              // socket.on('room join',function(usermsg){})
              var roomJoin = () => {
                    userInfo = ioUserInfo[uIndex];
                    // console.log(userInfo);
                    // console.log('============')
                    if(!global.ioRooms[roomID]){
                         global.ioRooms[roomID] = [];
                    }
                    if(ioRooms[roomID].indexOf(userInfo)==-1){
                        ioRooms[roomID].push(userInfo);
                        socket.join(roomID);
                    }
                    // console.log('----------------ioRooms---------------------');
                    // console.log(ioRooms);
                    room.to(roomID).emit('room sys', userInfo['username'] + '加入', ioRooms , ioRooms[roomID]);
              }
              roomJoin();   
              // 发送未读消息
              const unread = () => {
                   return chatRecord[roomID];
              }
              socket.emit('room unread',unread());

              // 接收发的信息
              socket.on('room sendMsg',function(sendMsg){
                    // 给某个房间触发信息
                    var smsg = {
                            msg:sendMsg,//信息内容
                            from:userInfo,// 谁发送
                            status:false,//false=>未读 true =>已读
                            type:'text',//信息类型
                            times:new Date().getTime() //发送时间
                    }
                    chatRecord[roomID].push(smsg)
                    room.to(roomID).emit('room msg', smsg );
              })
              //断网或者离开当前聊天页面
              socket.on('disconnect',function(){
                    // console.log('>>>>>>>>>>>>>');
                    // console.log(ioRooms);
                    // console.log(roomID);
                    // console.log(ioRooms[roomID]);
                    // console.log(userInfo)
                    // 移除保存的房间用户信息
                    var userSplice = ioRooms[roomID].indexOf(userInfo);
                    ioRooms[roomID].splice(userSplice);
                    // 告诉当前房间离开的用户
                    room.to(roomID).emit('room sys', userInfo['username'] + '离开', ioRooms , ioRooms[roomID]);
              })
        });
    }

    return this.init;
}

module.exports = new room();