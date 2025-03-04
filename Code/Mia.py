#미아 경로 분석 데이터를 받아와 시각화

#-*- coding:utf-8 -*-

import socket
import matplotlib.pyplot as plt
import matplotlib.image as img
import numpy as np
import os

HOST='192.168.0.67'
PORT=8604

s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.bind((HOST, PORT))

s.listen(1)
conn, addr=s.accept()
print(addr,' 에서 연결되었습니다 ...')

os.getcwd()
os.chdir("/home/pi/smartroad")

im = img.imread('back.png',0)

ax = plt.axes()

plt.xlim(0,747)
plt.ylim(0,374)

beacon1 = [30, 88]  #1번 비콘 아래
beacon1_2 = [30, 100] #1번 비콘 위
beacon2 = [315, 275] #2번 비콘 왼쪽
beacon2_2 = [360, 275] #2번 비콘 오른쪽
beacon3 = [640, 100] #3번 비콘 위쪽
beacon3_2 = [640, 88] #3번 비콘 아래쪽

while True:

    data = conn.recv(1024)  #데이터를 받아들임
    if not data: break  #비어있으면 탈출
    
    b = data.split("*") #구분기호 * 로 앞뒤를 나눈다
    
    a = []  #배열 선언

    for i in range(len(b) - 1): #비콘 구역 개수만큼 반복
        if(b[i]!=None):
            a.append(b[i])  #비콘 데이터 삽입해 배열에 따로 저장   
            
    print(a)
    c= [a[0],a[1],a[2]]
    a[0]=c[2]
    a[1]=c[1]
    a[2]=c[0]
    print(a)
    
    if(int(a[0]) == 1): #처음 인식장소가 1번 비콘에서 시작

        if(int(a[1]) == 2): #다음 인식장소가 2번 비콘일 때 (1 -> 2)

            if(len(a) < 3): #비콘 구역 개수가 2개일 때 화살표와 현재 시간 출력
            
                ax.arrow(beacon1_2[0], beacon1_2[1], beacon2[0] - beacon1_2[0] - 5, beacon2[1] - beacon1_2[1] - 5, head_width=15, head_length=15, fc='lightblue', ec='lightblue')
                plt.text(beacon2[0] - 50, beacon2[1] + 75, b[2], color='#00C8FF', size=8)
                
            elif(len(a) == 3): #비콘 구역 개수가 3개일 때 화살표와 현재 시간 출력

                if(int(a[2]) == 1): #그 다음 인식장소가 1번 비콘일 때 (1 -> 2 -> 1)
                    ax.arrow(beacon1_2[0] - 3, beacon1_2[1] + 3, beacon2[0] - beacon1_2[0] - 3 , beacon2[1] - beacon1_2[1] + 3, head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon2[0] + 3, beacon2[1] - 3, beacon1_2[0] - beacon2[0] + 3, beacon1_2[1] - beacon2[1] - 3, head_width=10, head_length=10, fc='#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon1[0] + 10, beacon1[1] + 10, b[3], color='#00C8FF', size=8)

                elif(int(a[2]) == 3): #그 다음 인식장소가 3번 비콘일 때 (1 -> 2 -> 3)
                    ax.arrow(beacon1_2[0], beacon1_2[1], beacon2[0] - beacon1_2[0], beacon2[1] - beacon1_2[1], head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon2_2[0], beacon2_2[1], beacon3[0] - beacon2_2[0], beacon3[1] - beacon2_2[1], head_width=10, head_length=10, fc='#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon3_2[0] - 40, beacon3_2[1] - 30, b[3], color='#00C8FF', size=8)

        elif(int(a[1]) == 3): #다음 인식장소가 3번 비콘일 때 (1 -> 3)

            if(len(a) < 3):
                ax.arrow(beacon1[0], beacon1[1], beacon3_2[0] - beacon1[0], beacon3_2[1] - beacon1[1], head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                plt.text(beacon3_2[0] - 40, beacon3_2[1] - 30, b[2], color='#00C8FF', size=8)

            elif(len(a) == 3):
                if(int(a[2]) == 1): #그 다음 인식장소가 1번 비콘일 때 (1 -> 3 -> 1)
                    ax.arrow(beacon1[0] + 5, beacon1[1] + 3, beacon3_2[0] - beacon1[0] - 10, beacon3_2[1] - beacon1[1] + 3, head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon3_2[0], beacon3_2[1] - 3, beacon1[0] - beacon3_2[0] + 10, beacon1[1] - beacon3_2[1] - 3, head_width=10, head_length=10, fc='#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon1[0], beacon1[1] - 30, b[3], color='#00C8FF', size=8)

                elif(int(a[2]) == 2): #그 다음 인식장소가 2번 비콘일 때 (1 -> 3 -> 2)
                    ax.arrow(beacon1[0], beacon1[1], beacon3_2[0] - beacon1[0], beacon3_2[1] - beacon1[1], head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon3[0],beacon3[1], beacon2_2[0] - beacon3[0], beacon2_2[1] - beacon3[1], head_width=10, head_length=10, fc='#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon2[0] - 50, beacon2[1] + 30, b[3], color='#00C8FF', size=8)

    elif(int(a[0]) == 2): #처음 인식장소가 2번 비콘에서 시작
        
        if(int(a[1]) == 1): #다음 인식장소가 1번 비콘일 때 (2 -> 1)

            if(len(a) < 3):
                ax.arrow(beacon2[0],beacon2[1], beacon1_2[0] - beacon2[0] + 10, beacon1_2[1] - beacon2[1] + 10, head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                plt.text(beacon1[0] + 10, beacon1[1] + 10, b[2], color='#00C8FF', size=8)

            elif(len(a) == 3):
                if(int(a[2]) == 2): #그 다음 인식장소가 2번 비콘일 때 (2 -> 1 -> 2)
                    ax.arrow(beacon2[0] - 3, beacon2[1] + 3, beacon1_2[0] - beacon2[0] - 3, beacon1_2[1] - beacon2[1] + 3, head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon1_2[0] + 3, beacon1_2[1] - 3, beacon2[0] - beacon1_2[0] + 3, beacon2[1] - beacon1_2[1] -3, head_width=10, head_length=10, fc='#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon2_2[0] - 70, beacon2_2[1] + 30, b[3], color='#00C8FF', size=8)

                elif(int(a[2]) == 3): #그 다음 인식장소가 3번 비콘일 때 (2 -> 1 -> 3)
                    ax.arrow(beacon2[0], beacon2[1], beacon1_2[0] - beacon2[0] + 5, beacon1_2[1] - beacon2[1] + 5, head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon1[0], beacon1[1], beacon3_2[0] - beacon1[0], beacon3_2[1] - beacon1[1], head_width=10, head_length=10, fc='#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon3[0] - 40, beacon3[1] - 50, b[3], color='#00C8FF', size=8)

        elif(int(a[1]) == 3): #다음 인식장소가 3번 비콘일 때 (2 -> 3)

            if(len(a) < 3):
                ax.arrow(beacon2_2[0],beacon2_2[1], beacon3[0] - beacon2_2[0], beacon3[1] - beacon2_2[1], head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                plt.text(beacon3_2[0] - 40, beacon3_2[1] - 30, b[2], color='#00C8FF', size=8)

            elif(len(a) == 3):
                if(int(a[2]) == 1): #그 다음 인식장소가 1번 비콘일 때 (2 -> 3 -> 1)
                    ax.arrow(beacon2_2[0], beacon2_2[1], beacon3[0] - beacon2_2[0], beacon3[1] - beacon2_2[1], head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon3_2[0], beacon3_2[1], beacon1[0] - beacon3_2[0] + 10, beacon1[1] - beacon3_2[1], head_width=10, head_length=10, fc='#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon1_2[0], beacon1_2[1], b[3], color='#00C8FF', size=8)

                elif(int(a[2]) == 2): #그 다음 인식장소가 2번 비콘일 때 (2 -> 3 -> 2)
                    ax.arrow(beacon2_2[0] - 3, beacon2_2[1] - 3, beacon3[0] - beacon2_2[0] - 3, beacon3[1] - beacon2_2[1] - 3, head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon3[0] + 3, beacon3[1] + 3, beacon2_2[0] - beacon3[0] + 3, beacon2_2[1] - beacon3[1] + 3, head_width=10, head_length=10, fc='#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon2[0] - 50, beacon2[1] + 30, b[3], color='#00C8FF', size=8)

    elif(int(a[0]) == 3): #처음 인식장소가 3번 비콘에서 시작

        if(int(a[1]) == 1): #다음 인식장소가 1번 비콘일 때 (3 -> 1)

            if(len(a) < 3):
                ax.arrow(beacon3_2[0], beacon3_2[1], beacon1[0] - beacon3_2[0] + 20, beacon1[1] - beacon3_2[1], head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                plt.text(beacon1_2[0], beacon1_2[1], b[2], color='#00C8FF', size=8)

            elif(len(a) == 3):
                if(int(a[2]) == 2): #그 다음 인식장소가 2번 비콘일 때 (3 -> 1 -> 2)
                    ax.arrow(beacon3_2[0], beacon3_2[1], beacon1[0] - beacon3_2[0] + 20, beacon1[1] - beacon3_2[1], head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon1_2[0], beacon1_2[1], beacon2[0] - beacon1_2[0], beacon2[1] - beacon1_2[1], head_width=10, head_length=10, fc='#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon2_2[0] - 5, beacon2_2[1] -10, b[3], color='#00C8FF', size=8)

                elif(int(a[2]) == 3): #그 다음 인식장소가 3번 비콘일 때 (3 -> 1 -> 3)
                    ax.arrow(beacon3_2[0], beacon3_2[1] + 3, beacon1[0] - beacon3_2[0] + 10, beacon1[1] - beacon3_2[1] + 3, head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon1[0], beacon1[1] - 3, beacon3_2[0] - beacon1[0] - 10, beacon3_2[1] - beacon1[1] - 3, head_width=10, head_length=10, fc = '#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon3[0] - 50, beacon3[1], b[3], color='#00C8FF', size=8)
   
        elif(int(a[1]) == 2): #다음 인식장소가 2번 비콘일 때 (3 -> 2)

            if(len(a) < 3):
                ax.arrow(beacon3[0], beacon3[1], beacon2_2[0] - beacon3[0], beacon2_2[1] -beacon3[1], head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                plt.text(beacon2[0] - 50, beacon2[1] + 30, b[2], color='#00C8FF', size=8)

            elif(len(a) == 3):
                if(int(a[2]) == 1): #그 다음 인식장소가 1번 비콘일 때 (3 -> 2 -> 1)
                    ax.arrow(beacon3[0], beacon3[1], beacon2_2[0] - beacon3[0], beacon2_2[1] -beacon3[1], head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon2[0], beacon2[1], beacon1_2[0] - beacon2[0] + 5, beacon1_2[1] - beacon2[1] + 3, head_width=10, head_length=10, fc='#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon1[0], beacon1[1] + 10, b[3], color='#00C8FF', size=8)

                elif(int(a[2]) == 3): #그 다음 인식장소가 3번 비콘일 때 (3 -> 2 -> 3)
                    ax.arrow(beacon3[0] - 3, beacon3[1] - 3, beacon2_2[0] - beacon3[0] - 3, beacon2_2[1] -beacon3[1] - 3, head_width=10, head_length=10, fc='lightblue', ec='lightblue')
                    ax.arrow(beacon2_2[0] + 3, beacon2_2[1] + 3, beacon3[0] - beacon2_2[0] + 3, beacon3[1] -beacon2_2[1] + 3, head_width=10, head_length=10, fc='#ff6f6d', ec='#ff6f6d')
                    plt.text(beacon3_2[0] - 40, beacon3_2[1] - 30, b[3], color='#00C8FF', size=8)

    plt.imshow(im)  
    plt.show()
    i   =  plt.gcf() 
    i.savefig('mia.jpg') 
    plt.close()

conn.close()

