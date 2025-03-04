//미세먼지 요청을 받음

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
    console.log("(미세먼지) 8603 포트로 "+socket.remoteAddress.toString().substring(7) + " 가 접속하였습니다...");     // 콘솔에 연결된 클라이언트 주소 출력

    if(socket.remoteAddress.toString().substring(7) == "192.168.0.58") mh_socket = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.42") dj_socket = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.57") dj_socket1 = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.59") dj_socket2 = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.152") dj_socket3 = socket;
    else if(socket.remoteAddress.toString().substring(7) == "192.168.0.77") hh_socket = socket;
    
    socket.setEncoding("utf8");                                     // 데이터 UTF-8로 인코딩
    
    socket.on('data', function(data){                               // on('data') : 'data' 이벤트가 왔을 때 콜백함수 실행
        
        var command = data.split("*");                              // 들어온 데이터를 " "로 구분해 배열로 저장

        console.log(socket.remoteAddress + " : " + data);           // 해당 소켓에서 들어온 데이터 콘솔에 출력

        if(command[0] == "munzi"){

            var select = "SELECT * from munzi"  // 미세먼지 데이터베이스 값을 불러오는 쿼리문
            sql.query(select,function(err,result,field){    // 쿼리문 실행
        
                if(!err){   // 에러가 발생하지 않았을 때
        
                    var db = JSON.stringify(result);    // JSON 객체인 결과값을 String 객체로 변환하여 변수에 저장 (다듬는 과정)
                    var db1 = JSON.parse(db);           // JSON 파싱을 하기 위해 다시 JSON 객체로 변환하여 변수에 저장 
            
                    var date = new Array();     // T 포함 날짜를 담는 변수  ex) [ {2019-08-29T00:02:00.616Z},{2019-08-30T00:06:00.617Z} ]    
                    var date1 = new Array();    // 구분한 날짜를 담는 변수  ex) [ {2019-08-29},{T00:02:00.616Z},{2019-08-30},{T00:06:00.617Z} ]
                    var date2 = new Array();    // 실제 날짜만 담긴 변수    ex) [ {2019-08-29},{2019-08-30} ]
            
                    var nam;            // 남구의 미세먼지 임시 보관 변수
                    var namdong;        // 남동구의 미세먼지 임시 보관 변수
                    var seo;            // 서구의 미세먼지 임시 보관 변수
            
                    var nam1 = 0;	    // 남구의 미세먼지 총합산 변수
                    var namdong1 = 0;   // 남동구의 미세먼지 총합산 변수
                    var seo1 = 0;       // 서구의 미세먼지 총합산 변수
            
                    var nam2 = 0;       // 남구의 일일 미세먼지 평균이 담길 변수
                    var namdong2 = 0;   // 남동구의 일일 미세먼지 평균이 담길 변수
                    var seo2 = 0;       // 서구의 일일 미세먼지 평균이 담길 변수
            
                    var cnt = 0;        // 시간을 세는 변수

                    var final = "";

                    for(var i=0;i<db1.length;i++){          // 0부터 JSON 데이터의 길이만큼 반복하는 구문
            
                        date.push(db1[i].DATE);             // 날짜만 파싱해 date 배열 맨 뒤에 추가
                        date1.push(date[i].split('T'));     // T 문자를 기준으로 문자열을 분리하여 date1 배열 맨 뒤에 추가
                        date2.push(date1[i][0]);            // 실제 날짜 부분만 파싱해 date2 배열 맨 뒤에 추가
                    }

                    for(var j=db1.length-1;j>0;j--){
       
                        if(date2[j] == date2[j-1]){           // i번째 날짜와 i-1번째 날짜가 서로 같은 경우   
                                
                            switch(db1[j].CITY){            //  i번째 구에 따라서 (남구일 때 / 남동구일 때 / 서구일 때)
            
                                case '남구' :   if(db1[j].MISAE != "-" ){
                                                    nam = db1[j].MISAE; nam1 = nam1 + parseInt(nam); // 미세먼지 값을 받아와 정수형 변환 후 저장
                                                }
                                                else{ nam1 = nam1 + 0; }  
                                                cnt = cnt + 1;  break; // cnt 값 1 증가 
                                                
                                case '남동구' : if(db1[j].MISAE != "-" ){
                                                    namdong = db1[j].MISAE; namdong1 = namdong1 + parseInt(namdong); // 미세먼지 값을 받아와 정수형 변환 후 저장
                                                }
                                                else{ namdong1 = namdong1 + 0; }  
                                                cnt = cnt + 1; break; // cnt 값 1 증가
            
                                case '서구' :   if(db1[j].MISAE != "-" ){
                                                    seo = db1[j].MISAE; seo1 = seo1 + parseInt(seo); // 미세먼지 값을 받아와 정수형 변환 후 저장
                                                }
                                                else{ seo1 = seo1 + 0; }
                                                cnt = cnt + 1; break; // cnt 값 1 증가
                            }                                
                        }
                        
                        else if (date2[j] != date2[j-1]){ //i번째와 i+1번째의 날짜가 서로 다른경우 = 서구 -> 남구로 넘어갈 때
            
                            if(db1[j].MISAE != "-" ){
                                nam = db1[j].MISAE;  nam1 = nam1 + parseInt(nam); // 미세먼지 값을 받아와 정수형 변환 후 저장
                            }

                            else{ nam1 = nam1 + 0; }
                            
                            cnt = (cnt + 1) / 3;        // cnt 값 / 구의 수 
                                
                            nam2 = parseInt(nam1 / cnt);            // 남구의 일일 미세먼지 평균을 구해 정수형 변환 후 저장
                            namdong2 = parseInt(namdong1 / cnt);    // 남동구의 일일 미세먼지 평균을 구해 정수형 변환 후 저장
                            seo2 = parseInt(seo1 / cnt);            // 서구의 일일 미세먼지 평균을 구해 정수형 변환 후 저장
                            
                            if(j == 0){final =''+ date2[j] + "*" + String(nam2) + "*" + String(namdong2) + "*" + String(seo2) + "*" + '';}
                            else	final = final + ''+ date2[j] + "*" + String(nam2) + "*" + String(namdong2) + "*" + String(seo2) + "*" + '';
                            nam1 = 0; namdong1 = 0; seo1 = 0; cnt = 0;  //변수 초기화
                        }                 
                        
                    }
			        socket.write(final); // Python 으로 변수 값 전달  
                }
                else{console.log("error : " + err);}    // 에러 발생시 에러를 콘솔에 출력   
            })
        }
});
    
    socket.on('end', function(data){                                // 소켓 연결 종료 이벤트가 왔을 때 콜백함수 실행
       console.log("(미세먼지) 8603 포트에서 "+socket.remoteAddress.toString().substring(7) + " 가 접속을 종료하였습니다...");   // 콘솔창에 연결이 종료되었다고 출력
    });
    
    socket.on('error', function(err){                               // 소켓 연결에 에러 이벤트가 왔을 때 콜백함수 실행
       console.log(err);                                            // 에러를 콘솔창에 출력
    });
})

// 포트 '8603' 으로 요청 대기
server.listen(8603, function(){
    console.log('8603 포트 활성화... 미세먼지 요청 대기중입니다 ...');
})
