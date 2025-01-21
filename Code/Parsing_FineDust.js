var convert = require('xml-js');    // xml 데이터를 json으로 파싱할 수 있는 모듈
var request = require('request');   // 미세먼지 API에 요청을 보낼 때 사용하는 모듈
var schedule = require('node-schedule');    // 일정시간마다 원하는 함수를 호출하기 위해 사용하는 모듈
var mysql = require("mysql");   // MariaDB와 연동을 위한 모듈

// MariaDB와 연동
var sql = mysql.createConnection({
    host: "localhost",
    database: "road",
    port: "3306",
    user: "root",
    password: "1234"     
})

var requestUrl = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst?serviceKey=Xq64Np67pvkDgHDDaTQ0gc6h3sjTC3PfJOIMRPaFwstU5h%2BCKeBUbRL3%2FWurv%2FyfcDClbXGsB3jlHm01ShvNEg%3D%3D&numOfRows=9&pageNo=1&sidoName=%EC%9D%B8%EC%B2%9C&searchCondition=HOUR'

console.log("미세먼지 데이터 수신 대기중입니다...");
var scheduler = schedule.scheduleJob('02 * * * *', function(){ 
    
    console.log('미세먼지 데이터가 업데이트 되었습니다...'); 

    request.get(requestUrl, (err, res, body) => {

        if(err) {
            console.log(`err => ${err}`);
        }

        else {

            if(res.statusCode == 200) {

                var result = body;

                var xmlToJson = convert.xml2json(result, {compact: true, spaces: 0});

                var jsonToString = JSON.parse(xmlToJson);

                var output = new Array();

                output.push(jsonToString.response.body.items.item[2].dataTime._text);
                output.push(jsonToString.response.body.items.item[2].cityName._text);
                output.push(jsonToString.response.body.items.item[2].pm10Value._text);
                output.push(jsonToString.response.body.items.item[2].pm25Value._text);

                output.push(jsonToString.response.body.items.item[3].dataTime._text);
                output.push(jsonToString.response.body.items.item[3].cityName._text);
                output.push(jsonToString.response.body.items.item[3].pm10Value._text);
                output.push(jsonToString.response.body.items.item[3].pm25Value._text);

                output.push(jsonToString.response.body.items.item[6].dataTime._text);
                output.push(jsonToString.response.body.items.item[6].cityName._text);
                output.push(jsonToString.response.body.items.item[6].pm10Value._text);
                output.push(jsonToString.response.body.items.item[6].pm25Value._text);

                for(i=0;i<=8;i=i+4){

                    var insert = "INSERT INTO munzi(DATE,CITY,MISAE,CHOMISAE) VALUES ('"+ output[i] + "','" + output[i+1] + "','" + output[i+2] + "','" + output[i+3] + "')" ;

                    if(output[i+2]<=30){var update1 = "UPDATE munzi SET STATUS1 = '좋음' WHERE MISAE = '" + output[i+2] + "'";}
                    else if(30<output[i+2]<=80){var update1 = "UPDATE munzi SET STATUS1 = '보통' WHERE MISAE = '" + output[i+2] + "'";}
                    else if(80<output[i+2]<=150){var update1 = "UPDATE munzi SET STATUS1 = '나쁨' WHERE MISAE = '" + output[i+2] + "'";}
                    else if(150<output[2]){var update1 = "UPDATE munzi SET STATUS1 = '매우 나쁨' WHERE MISAE = '" + output[i+2] + "'";}

                    if(output[i+3]<=15){var update2 = "UPDATE munzi SET STATUS2 = '좋음' WHERE CHOMISAE = '" + output[i+3] + "'";}
                    else if(15<output[i+3]<=35){var update2 = "UPDATE munzi SET STATUS2 = '보통' WHERE CHOMISAE = '" + output[i+3] + "'";}
                    else if(35<output[i+3]<=75){var update2 = "UPDATE munzi SET STATUS2 = '나쁨' WHERE CHOMISAE = '" + output[i+3] + "'";}
                    else if(75<output[i+3]){var update2 = "UPDATE munzi SET STATUS2 = '매우 나쁨' WHERE CHOMISAE = '" + output[i+3] + "'";}

                    sql.query(insert,function(err,result,field){
                        if(err) console.log("error : " + err);
                    });

                    sql.query(update1,function(err,result,field){
                        if(err) console.log("error : " + err);
                    });

                    sql.query(update2,function(err,result,field){
                        if(err) console.log("error : " + err);
                    });
                }
            }
        }
    })
});
