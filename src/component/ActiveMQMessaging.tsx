// src/ActiveMQMessaging.tsx
import React, { useEffect, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';

const ACTIVE_MQ_WS_URL = 'ws://localhost:61614/ws'; // Change to your ActiveMQ WebSocket URL
const TOPIC_NAME = 'Golf.Sim';                 // Change to your topic

const ActiveMQMessaging: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const client = new Client({
      brokerURL: ACTIVE_MQ_WS_URL,
      reconnectDelay: 5000,
      debug: (msg) => console.log('[STOMP]', msg),
    });

    client.onConnect = () => {
      setConnected(true);
      client.subscribe(TOPIC_NAME, (message: IMessage) => {
        setMessages((prev) => [...prev, message.body]);
        console.log('Received message:', message.headers, message.body);
      });
    };

    client.onDisconnect = () => {
      setConnected(false);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>ActiveMQ Messaging Client</h2>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <div
        style={{
          border: '1px solid #ccc',
          padding: 10,
          height: 300,
          overflowY: 'auto',
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.length === 0 && <p>No messages received yet.</p>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 6, padding: 6, background: '#e0f7fa', borderRadius: 4 }}>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveMQMessaging;
