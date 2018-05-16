const room = function(){
    this.init = (room) => {
         room.on('connection', function (socket) {
              var url = socket.request.headers.referer;
              var roomID = url.split('?room=')[1];
              var userInfo = '';
              // 加入房间
              socket.on('room join',function(usermsg){
                    userInfo = usermsg;
                    if(!global.ioRooms[roomID]){
                         global.ioRooms[roomID] = [];
                    }
                    if(ioRooms[roomID].indexOf(userInfo)==-1){
                        ioRooms[roomID].push(userInfo);
                        socket.join(roomID);
                    }
                    room.to(roomID).emit('room sys', userInfo['username'] + '加入', ioRooms , ioRooms[roomID]);
              })
              // 接收发的信息
              socket.on('room sendMsg',function(sendMsg){
                    // 给某个房间触发信息
                    room.to(roomID).emit('room msg', sendMsg);
              })
              //断网或者离开当前聊天页面
              socket.on('disconnect',function(){
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