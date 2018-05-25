//引入express
var express = require('express');
//引入socket
var io = require('socket.io');
//使用express建立服务器
var app = express();
//设置中间件
app.use(express.static(__dirname));
//设置服务器端口
var server = app.listen(8080);
//将socket绑定到服务器上
var ws = io.listen(server);

ws.on('connection', function(client){
    console.log('\033[96msomeone is connect\033[39m \n');
    //接收客户端发送的消息
    client.on('join', function(msg){
        // 检查是否有重复
        if(checkNickname(msg)){
            //发送给客户端
            client.emit('nickname', '昵称有重复!');
        }else{
            client.nickname = msg;
            client.broadcast.emit('announcement', '系统', msg + ' 加入了聊天室!');
        }
    });
    // 监听发送消息
    client.on('send.message', function(msg){
        client.broadcast.emit('send.message',client.nickname,  msg);
    });
    // 断开连接时，通知其它用户
    client.on('disconnect', function(){
        if(client.nickname){
            client.broadcast.emit('send.message','系统',  client.nickname + '离开聊天室!');
        }
    })

});
var checkNickname = function(name){
    for(var k in ws.sockets.sockets){
        if(ws.sockets.sockets.hasOwnProperty(k)){
            if(ws.sockets.sockets[k] && ws.sockets.sockets[k].nickname === name){
                return true;
            }
        }
    }
    return false;
}