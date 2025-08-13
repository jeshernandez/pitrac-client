import React, { useEffect, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';

const ACTIVE_MQ_WS_URL = 'ws://localhost:61614/ws'; // Change to your ActiveMQ WebSocket URL
const TOPIC_NAME = 'Golf.Sim'; // Change to your topic

interface ReceivedMessage {
  headers: { [key: string]: string };
  body: string;
  timestamp: string;
}

const ActiveMQMessaging: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ReceivedMessage[]>([]);

  useEffect(() => {
    const client = new Client({
      brokerURL: ACTIVE_MQ_WS_URL,
      reconnectDelay: 5000,
      debug: (msg) => console.log('[STOMP]', msg),
    });

    client.onConnect = () => {
      setConnected(true);
      client.subscribe(TOPIC_NAME, (message: IMessage) => {
        const newMessage: ReceivedMessage = {
          headers: message.headers,
          body: message.body,
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages((prev) => [...prev, newMessage]);
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
      <p>Status: {connected ? '✅ Connected' : '❌ Disconnected'}</p>
      <div
        style={{
          border: '1px solid #ccc',
          padding: 10,
          height: 300,
          overflowY: 'auto',
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No messages received yet.
          </p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 10,
              padding: 10,
              background: '#e0f7fa',
              borderRadius: 6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '0.85em', color: '#555' }}>
              <strong>Time:</strong> {msg.timestamp}
            </div>
            <div style={{ fontSize: '0.85em', color: '#333' }}>
              <strong>Headers:</strong>
              <pre style={{ margin: 0, background: '#fff', padding: '4px 6px', borderRadius: 4 }}>
                {JSON.stringify(msg.headers, null, 2)}
              </pre>
            </div>
            <div style={{ marginTop: 6 }}>
              <strong>Body:</strong>
              <pre style={{ margin: 0, background: '#fff', padding: '4px 6px', borderRadius: 4 }}>
                {msg.body}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveMQMessaging;
