var net = require('net');       // 소켓 서버를 위한 모듈
var mysql = require("mysql");   // MariaDB와 연동을 위한 모듈
var mh_socket, dj_socket1, dj_socket2, dj_socket3, hh_socket;

// MariaDB와 연동
var sql = mysql.createConnection({
    host: "localhost",
    database: "road",
    port: "3306",
    user: "root",
    password: "1234"     
})

// Web MariaDB와 연동
var web_sql = mysql.createConnection({
    host: "192.168.0.6",
    database: "jbts",
    port: "3306",
    user: "root",
    password: "1234"     
})

// 서버 생성
var server = net.createServer(function(socket){                     // 콜백함수 : 클라이언트 소켓 연결 시
    console.log("(신호등) 8602 포트로 "+socket.remoteAddress.toString().substring(7) + " 가 접속하였습니다...");     // 콘솔에 연결된 클라이언트 주소 출력

    if(socket.remoteAddress.toString().substring(7) == "192.168.0.58") mh_socket = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.42") dj_socket = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.12") dj_socket1 = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.77") hh_socket = socket;

    socket.setEncoding("utf8");                                     // 데이터 UTF-8로 인코딩
        
    socket.on('data', function(data){                               // on('data') : 'data' 이벤트가 왔을 때 콜백함수 실행
        
        var command = data.split("*");                              // 들어온 데이터를 " "로 구분해 배열로 저장

        console.log(socket.remoteAddress.toString().substring(7) + " : " + data);           // 해당 소켓에서 들어온 데이터 콘솔에 출력
        
        if(command[0] == "1"){

            if(command[1] == "1"){
                if(command[2] == "N"){mh_socket.write("1*N");}
                else if(command[2] == "E"){ mh_socket.write("1*E");}
            }
            
            else if (command[1] == "2"){
                if(command[2] == "N"){mh_socket.write("2*N");}
                else if(command[2] == "E"){mh_socket.write("2*E");}
            }
            
            else if (command[1] == "3"){
                if(command[2] == "N"){mh_socket.write("3*N");}
                else if(command[2] == "E"){mh_socket.write("3*E");}
            }
        }
});
    
    socket.on('end', function(data){                                // 소켓 연결 종료 이벤트가 왔을 때 콜백함수 실행
       console.log("(신호등) 8602 포트에서 "+socket.remoteAddress.toString().substring(7) + " 가 접속을 종료하였습니다...");   // 콘솔창에 연결이 종료되었다고 출력
    });
    
    socket.on('error', function(err){                               // 소켓 연결에 에러 이벤트가 왔을 때 콜백함수 실행
       console.log(err);                                            // 에러를 콘솔창에 출력
    });
})

// 포트 '8602' 으로 요청 대기
server.listen(8602, function(){
    console.log('8602 포트 활성화... 신호 제어 요청 대기중입니다 ...');
})
