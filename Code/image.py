#웹에 시각화한 이미지를 전송함

# -*- coding: utf-8 -*- 
import SocketServer #소켓서버 모듈
import sys #입출력 모듈
from os.path import exists #경로설정 모듈
 
HOST ='192.168.0.9' #IP
PORT = 8605 #PORT
 
class MyTcpHandler(SocketServer.BaseRequestHandler):
    def handle(self):
        data_transferred = 0
        print('[%s] 연결됨' %self.client_address[0])
        filename = self.request.recv(1024) #클라이언트로 부터 파일이름을 전달받음
        #filename = filename.decode() # 파일이름 이진 바이트 스트림 데이터를 일반 문자열로 변환
 
        if not exists(filename): #파일이 해당 디렉터리에 존재하지 않으면
            return #handle()함수를 빠져 나온다.
 
        print('파일[%s] 전송 시작...' %filename)
        with open(filename,'rb') as f: #요청온 데이터의 이름으로 된 파일 참조
            try:
                data = f.read(1024) #파일을 1024바이트 읽음
                while data: #파일이 빈 문자열일때까지 반복
                    data_transferred += self.request.send(data) #파일 전송
                    data = f.read(1024)
            except Exception as e: #예외 처리
                print(e)
 
        print('전송완료[%s], 전송량[%d]' %(filename,data_transferred))
 
def runServer(): #서버 함수
    print('++++++파일 서버를 시작++++++')
    print("+++파일 서버를 끝내려면 'Ctrl + C'를 누르세요.")
 
    try:
        server = SocketServer.TCPServer((HOST,PORT),MyTcpHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print('++++++파일 서버를 종료합니다.++++++')
 
runServer()
