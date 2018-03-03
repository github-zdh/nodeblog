var socketIo = {};

socketIo.users = [];

socketIo.rooms = {};
// 房间用户名单
socketIo.roomInfo = {
	"r_12":['user_1','user_2']
};

socketIo.init = () => {
        
		__socketIo__.on('connection', function (socket) {
             var sockets = __socketIo__.sockets.sockets;
             socket.join("r_12");    // 加入房间
             socketIO.to("r_12").emit('sys', '加入了房间', socketIo.roomInfo['r_12']);
             var arr = [];
             var userNum = 1;
             // console.log(socket.id);
             for(var i in sockets){
                  arr.push({
                  	  name:'user_'+userNum
                  	  ,id:i
                  });
                  userNum++;
             }
             socket.emit('new message', JSON.stringify(arr));
		     socket.broadcast.emit('new message', JSON.stringify(arr));


		     socket.on('new msg',function(data){
		     	     
		     	     var  soc = '';
		     	     for(var i=0;i<arr.length;i++){
		     	     	  if(arr[i].name==='user_2'){
                                 soc=arr[i].id;
		     	     	  }
		     	     }
		     	     console.log(sockets[soc]);
				     socket.emit('new msg', JSON.stringify(data));
				     sockets[soc].emit('new msg', JSON.stringify(data));
		     })

		});
}

// socketIo.init = () => {
// 	    var numUsers = 0;
// 		__socketIo__.on('connection', function (socket) {
// 					  var addedUser = false;

// 					  // when the client emits 'new message', this listens and executes
// 					  socket.on('new message', function (data) {
// 					    // we tell the client to execute 'new message'
// 					    socket.broadcast.emit('new message', {
// 					      username: socket.username,
// 					      message: data
// 					    });
// 					  });

// 					  // when the client emits 'add user', this listens and executes
// 					  socket.on('add user', function (username) {
// 					    if (addedUser) return;

// 					    // we store the username in the socket session for this client
// 					    socket.username = username;
// 					    ++numUsers;
// 					    addedUser = true;
// 					    socket.emit('login', {
// 					      numUsers: numUsers
// 					    });
// 					    // echo globally (all clients) that a person has connected
// 					    socket.broadcast.emit('user joined', {
// 					      username: socket.username,
// 					      numUsers: numUsers
// 					    });
// 					  });

// 					  // when the client emits 'typing', we broadcast it to others
// 					  socket.on('typing', function () {
// 					    socket.broadcast.emit('typing', {
// 					      username: socket.username
// 					    });
// 					  });

// 					  // when the client emits 'stop typing', we broadcast it to others
// 					  socket.on('stop typing', function () {
// 					    socket.broadcast.emit('stop typing', {
// 					      username: socket.username
// 					    });
// 					  });

// 					  // when the user disconnects.. perform this
// 					  socket.on('disconnect', function () {
// 					    if (addedUser) {
// 					      --numUsers;

// 					      // echo globally that this client has left
// 					      socket.broadcast.emit('user left', {
// 					        username: socket.username,
// 					        numUsers: numUsers
// 					      });
// 					    }
// 					  });
// 		});
// }

module.exports = socketIo;