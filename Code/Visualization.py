#-*- coding:utf-8 -*-
import schedule #일정시간마다 실행할 수 있게 해주는 모듈
import time	#시간에 관한 함수를 쓰는 모듈
import numpy as np #다차원 배열을 쉽게 처리하는 모듈
from matplotlib import pyplot as plt #그래프 표시할 수 있게 해주는 모듈
from socket import * #소켓통신 모듈

HOST='192.168.0.9'     # 서버주소
PORT=8603               # 서버포트

c = socket(AF_INET, SOCK_STREAM)    # 소켓 객체 생성
print ('connecting....')
c.connect((HOST, PORT))             # 소켓 연결
print ('ok')

file_transferred = 0

def job():	#일정시간 마다 실행하는 함수
	c.send("munzi")	#munzi라는 데이터를 보낸다
	day = [] #배열 초기선언
	nam = []
	namdong = []
	seo = []
	u = str(c.recv(1024)).encode("utf-8")  #데이터 수신대기
	print(u)
	a = u.split('*') #*로 문자열 구분
	
	day.append(a[8]) #날짜 삽입
	day.append(a[4])
	day.append(a[0])
	
	nam.append(int(a[9])) #남구의 미세먼지 삽입
	nam.append(int(a[5]))
	nam.append(int(a[1]))
	
	namdong.append(int(a[10])) #남동구의 미세먼지 삽입
	namdong.append(int(a[6]))
	namdong.append(int(a[2]))
	
	seo.append(int(a[11])) #서구의 미세먼지 삽입
	seo.append(int(a[7]))
	seo.append(int(a[3]))
	
	plt.figure() #새로운 figure 생성
	
	width = 0.20
	x= np.arange(3) #x와 y를 일정구간으로 나누어줌 
	y= np.arange(0,110,10)
	
	p1 = plt.bar(x-0.25,nam,width,label='namgu') #막대그래프 생성
	p2 = plt.bar(x,namdong,width,label='namdonggu')
	p3 = plt.bar(x+0.25,seo,width,label='seogu')
	
	plt.xticks(x,day) #x, y축의 현재 눈금 위치 및 레이블을 설정함
	plt.yticks(y)
	plt.legend() #라벨 및 범례를 표시함
	
	plt.xlabel('DAY') #x축 제목 설정
	plt.ylabel('AVR(%)') #y축 제목 설정
	
	plt.title("Munzi") #표 제목 설정
	img = plt.gcf() #figure에 접근할 수 있는 객체 생성
	img.savefig('munzi.jpg') #표를 munzi.jpg라는 이름의 파일로 저장
	
schedule.every(10).seconds.do(job) #job()함수를 10초마다 실행

while 1: #무한루프를 돌면서 스케줄을 유지함  
	schedule.run_pending()

c.close()





