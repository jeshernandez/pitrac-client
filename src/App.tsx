import logo from './logo.svg';
import React, { useEffect, useState } from 'react';

import { Client, IMessage } from '@stomp/stompjs';

const ACTIVE_MQ_WS_URL = 'ws://localhost:61614/ws'; // Update with your ActiveMQ WebSocket URL
const TOPIC_NAME = 'Golf.Sim';                 // Your topic

function App() {
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
    <div className="App">
      <header className="App-header">


        <div style={{ marginTop: 20, maxHeight: 300, overflowY: 'auto', width: '90%', backgroundColor: '#222', padding: 10, borderRadius: 8 }}>
          <h3 style={{ color: 'white' }}>ActiveMQ Messages ({connected ? 'Connected' : 'Disconnected'})</h3>
          {messages.length === 0 ? (
            <p style={{ color: '#bbb' }}>No messages received yet.</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#444',
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 4,
                  color: '#eee',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                }}
              >
                {msg}
              </div>
            ))
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
