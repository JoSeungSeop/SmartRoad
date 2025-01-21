var net = require('net');       // 소켓 서버를 위한 모듈
var mysql = require("mysql");   // MariaDB와 연동을 위한 모듈

// MariaDB와 연동
var sql1 = mysql.createConnection({
    host: "localhost",
    database: "smartroad",
    port: "3306",
    user: "root",
    password: "maria"     
})

// 서버 생성
var server = net.createServer(function(socket){                     // 콜백함수 : 클라이언트 소켓 연결 시
    console.log('[!] ' + socket.remoteAddress + " connected.");     // 콘솔에 연결된 클라이언트 주소 출력

    socket.setEncoding("utf8");                                     // 데이터 UTF-8로 인코딩
    socket.on('data', function(data){                               // on('data') : 'data' 이벤트가 왔을 때 콜백함수 실행
        
        var command = data.split(" ");                              // 들어온 데이터를 " "로 구분해 배열로 저장
        
        console.log(socket.remoteAddress + " : " + data);           // 해당 소켓에서 들어온 데이터 콘솔에 출력
        
        if(command[0] == "search"){                                 // "search" 명령일 경우
            var sql = "SELECT * FROM " + command[1];                // 쿼리문
            sql1.query(sql, function(err, result, fields){     // 쿼리문 실행 후 콜백함수 실행
                if(!err){                                           // 쿼리문이 에러가 없다면
                    var db = JSON.stringify(result);                // 결과값을 JSON 형태의 문자열로 변환
                    socket.write(db);                               // 연결된 소켓으로 데이터 전송
                }
                else{                                               // 에러가 있다면
                    console.log('[!] "' + sql + '" Query has error!');  // 에러가 있다고 콘솔에 출력
                    socket.write('[!] no data : ' + command[1]);        // 연결된 소켓에도 에러가 있다고 응답
                }
            })
        }
        else {
            socket.write('[!] Wrong command.');                     // 옳지 않은 명령일 경우 연결된 소켓에 응답
        }
    });
    
    socket.on('end', function(data){                                // 소켓 연결 종료 이벤트가 왔을 때 콜백함수 실행
       console.log('[!] ' + socket.remoteAddress + " disconnected.");   // 콘솔창에 연결이 종료되었다고 출력
    });
    
    socket.on('error', function(err){                               // 소켓 연결에 에러 이벤트가 왔을 때 콜백함수 실행
       console.log(err);                                            // 에러를 콘솔창에 출력
    });
})

// 포트 '3000' 으로 요청 대기
server.listen(3000, function(){
    console.log('listening on 3000...');
})
