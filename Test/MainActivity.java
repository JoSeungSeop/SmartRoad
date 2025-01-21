//안드로이드 서버 통신 테스트



package com.example.server_chat_01;


import android.os.AsyncTask;
import android.os.StrictMode;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.net.Socket;

import static android.os.StrictMode.setThreadPolicy;

public class MainActivity extends AppCompatActivity {

    private static final String IP = "192.168.0.3";
    private static final int PORT = 8201;

    SocketTask socketTask;
    String msg;

    Button conbt, sendbt;
    EditText sendms;
    TextView textData;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 쓰레드 규칙정의
        StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
        setThreadPolicy(policy);

        conbt = (Button)findViewById(R.id.conbt);
        sendbt = (Button)findViewById(R.id.sendbt);
        sendms = (EditText)findViewById(R.id.sendms);
        textData = (TextView)findViewById(R.id.textData);


        socketTask = new SocketTask();

        conbt.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                socketTask.execute();
            }
        });

        sendbt.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String data = sendbt.getText().toString();
                sendbt.setText(null);
                socketTask.SendDataToNetwork(data);
            }
        });
    }

    class SocketTask extends AsyncTask<Integer, Integer, Integer> {
        private Socket socket = null;
        private BufferedReader in;
        private PrintWriter out;
        String ReceiveMsg;

        InetAddress serverAddr;

        // 작업을 시작할 때
        @Override
        protected void onPreExecute() {
            try{
                serverAddr = InetAddress.getByName(IP);
                socket = new Socket(serverAddr, PORT);

                socket.setReceiveBufferSize(65536);

                out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(socket.getOutputStream())), true);
                in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

                conbt.setVisibility(View.GONE);
                sendbt.setVisibility(View.VISIBLE);
                sendms.setVisibility(View.VISIBLE);
                textData.setVisibility(View.VISIBLE);
            } catch (Exception e){
                e.printStackTrace();
            }
        }

        // 작업을 종료할 때
        @Override
        protected void onPostExecute(Integer integer) {
            try{
                socket.close();
            }catch (IOException e){
                e.printStackTrace();
            }
        }

        // 백그라운드 작업 정의
        @Override
        protected Integer doInBackground(Integer... params) {
            while(socket.isConnected()){
                try{
                    ReceiveMsg = in.readLine();
                    publishProgress();
                }catch (Exception e){
                    e.printStackTrace();
                }
            }
            return null;
        }

        // Update 요청이 들어왔을 때
        @Override
        protected void onProgressUpdate(Integer... values) {
            textData.append(ReceiveMsg);
        }

        // 데이터 전송에 대한 요청 처리
        public void SendDataToNetwork(String msg){
            try{
                if(socket.isConnected()){
                    out.println(msg);
                }
            } catch(Exception e){
                e.printStackTrace();
            }
        }
    }
}
