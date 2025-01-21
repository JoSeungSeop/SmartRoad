var net = require('net');       // 소켓 서버를 위한 모듈
var mysql = require("mysql");   // MariaDB와 연동을 위한 모듈
var munzi = require("./FineDust.js"); //다른 서버 파일들을 import하는 모듈
var sinho = require("./TrafficSignal.js");
var parsing = require("./Parsing_FineDust.js");
var bulbub = require("./illegalParking.js");

var mh_socket, dj_socket1, dj_socket2, dj_socket3, hh_socket, ye_socket;

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
    console.log("(앱) 8600 포트로 "+socket.remoteAddress.toString().substring(7) + " 가 접속하였습니다...");     // 콘솔에 연결된 클라이언트 주소 출력

    if(socket.remoteAddress.toString().substring(7) == "192.168.0.58") mh_socket = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.42") dj_socket = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.57") dj_socket1 = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.59") dj_socket2 = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.152") dj_socket3 = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.77") hh_socket = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.21") ye_socket = socket;
    
    socket.setEncoding("utf8");                                     // 데이터 UTF-8로 인코딩
    
    socket.on('data', function(data){                               // on('data') : 'data' 이벤트가 왔을 때 콜백함수 실행
        
        var command = data.split("*");                              // 들어온 데이터를 " "로 구분해 배열로 저장

        console.log(socket.remoteAddress.toString().substring(7) + " : " + data);           // 해당 소켓에서 들어온 데이터 콘솔에 출력
        
        if(command[0] == "regikid"){    // 아이 정보 생성 요청이 들어올 시
            
            var CREATE = "CREATE TABLE " + command[1] + "(DATE DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), beacon VARCHAR(20), Parents varchar(10))";
            var update = "UPDATE user SET parents = 'FALSE' WHERE name = '" + command[1] +"'" ;

            web_sql.query(update,function(err,result,field){    

                if(!err){
                    console.log("자녀 정보 등록 성공 ...");
                }

                else{
                    socket.write("error : " + err);
                    console.log("error : " + err);
                }    
            })
            
            sql.query(CREATE,function(err,result,field){    //아이 이름으로 된 테이블 생성
                
                if(!err){
                    console.log(command[1] + " 테이블 생성 성공 ...");
                }

                else{
                    socket.write("error : " + err);
                    console.log("error : " + err);
                }    
            })           
        }
        
        if(command[0] == "regiadult"){      //부모 정보 등록 요청 시
            
            var UPDATE = "UPDATE user SET kid = '" + command[2] + "' , parents = 'TRUE' WHERE name = '" + command[1] + "'";

            web_sql.query(UPDATE,function(err,result,field){
                
                if(!err){
                    console.log("부모 정보 등록 성공 ...");
                }

                else{
                    socket.write("error : " + err);
                    console.log("error : " + err);
                }    
            })
        }
        
        if(command[0] == "login"){      //앱에서 로그인 했을 때

            var SELECT = "SELECT parents FROM user WHERE name = '" + command[1] + "'";

            web_sql.query(SELECT,function(err,result,field){    //부모인지 자녀인지 구분 (parents 열이 TRUE 인지 FALSE인지)
                
                if(!err){
                    console.log(result);
                    var parents = result[0].parents + "\n";
                    socket.write(parents);
                }

                else{
                    socket.write("error : " + err);
                    console.log("error : " + err);
                }    
            })
        }
        
        if(command[0] == "delete"){     //앱에서 삭제 요청이 들어왔을 때

            var Delete = "DROP TABLE "+ command[1];

            sql.query(Delete,function(err,result,field){    //테이블 삭제
                
                if(!err){
                    console.log(command[1] + " 테이블 삭제 성공 ...");
                }
                else{
                    socket.write("error : " + err);
                    console.log("error : " + err);
                }    
            })
        }
        
        if(command[0] == "mia"){    //미아 찾기 요청이 들어왔을 때

            var SELECT = "SELECT * FROM " + command[1];

            sql.query(SELECT,function(err,result,field){

                if(!err){
                    
                    var db = JSON.stringify(result);    // JSON 객체인 결과값을 String 객체로 변환하여 변수에 저장 (다듬는 과정)
                    var db1= JSON.parse(db);           // JSON 파싱을 하기 위해 다시 JSON 객체로 변환하여 변수에 저장

                    var beacon = new Array();
                    var beacon1 = new Array();

                    var send_result;
                                            
                    for(var i = 0; i < db1.length; i++){
                        beacon.push(db1[i].beacon);
                    }

                    for(var j = db1.length - 1; j > 0; j--){

                        if(beacon[j].substring(1,2) != beacon[j-1].substring(1,2)){     //다음 비콘값이 달라질 때까지 반복

                            if(beacon1.length < 4){ //인식된 비콘 구역 번호 삽입
                                switch(beacon[j].substring(1,2)){
                                    case "1" : beacon1.push("1"); break;
                                    case "2" : beacon1.push("2"); break;
                                    case "3" : beacon1.push("3"); break;
                                }

                                switch(beacon[j-1].substring(1,2)){
                                    case "1" : beacon1.push("1"); break;
                                    case "2" : beacon1.push("2"); break;
                                    case "3" : beacon1.push("3"); break;
                                }
                            }
                        }
                    }

                    switch(beacon1.length){     //인식된 구역의 개수
                        case 2 : var time = db1[db1.length - 1].DATE;   //비콘이 인식된 시간
                                beacon1.splice(2,1);
                                console.log("hihi");
                                send_result = beacon1[1] + '*' + beacon1[0] + '*' + time.substring(5,19);
                                var client = new net.Socket();  //경로분석해주는 파일에 데이터 전달
                                client.setEncoding('utf8');
                                client.connect('8604','192.168.0.9',function(){
                                    client.write(send_result);
                                }); break;
                                
                        case 4 : var time = db1[db1.length - 1].DATE;
                                console.log(time);
                                beacon1.splice(2,1);
                                send_result = beacon1[2] + '*' + beacon1[1] + '*' + beacon1[0] + '*' + time.substring(5,19);
                                console.log(send_result);
                                var client = new net.Socket();
                                client.setEncoding('utf8'); 
                                client.connect('8604','192.168.0.9',function(){
                                    client.write(send_result);
                                }); break;
                    }
                }

                else{
                    socket.write("error : " + err);
                    console.log("error : " + err);
                }
            })     
        }
        
        if(command[0] == "beacon"){  //앱에서 비콘이 인식될 때

            if(command[2].toString().substring(0,1) == "b"){
            
                var INSERT = "INSERT INTO " + command[1] + "(DATE, beacon) VALUES(now(), '" + command[2] + "')";
                
                sql.query(INSERT,function(err,result,field){    //사용자 테이블에 비콘 데이터 삽입
                    
                    if(!err){
                        console.log(command[1] + " 테이블에 " + command[2] + " 데이터 삽입 성공 ..." );                          
                    }

                    else{
                        socket.write("error : " + err);
                        console.log("error : " + err);
                    }       
                })
            }

            else{ console.log("지정되지 않은 비콘입니다 ..."); 
                  socket.write("지정되지 않은 비콘입니다 ..."); 
            }   
        }        
});
    
    socket.on('end', function(data){                                // 소켓 연결 종료 이벤트가 왔을 때 콜백함수 실행
       console.log("(앱) 8600 포트에서 "+socket.remoteAddress.toString().substring(7) + " 가 접속을 종료하였습니다...");   // 콘솔창에 연결이 종료되었다고 출력
    });
    
    socket.on('error', function(err){                               // 소켓 연결에 에러 이벤트가 왔을 때 콜백함수 실행
       console.log(err);                                            // 에러를 콘솔창에 출력
    });
})

// 포트 '8600' 으로 요청 대기
server.listen(8600, function(){
    console.log('8600 포트 활성화... 앱 요청 대기중입니다 ...');
})
