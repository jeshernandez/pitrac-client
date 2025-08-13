// src/ActiveMQMessaging.tsx
import React, { useEffect, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';

const ACTIVE_MQ_WS_URL = 'ws://localhost:61614/ws'; // Change to your ActiveMQ WebSocket URL
const TOPIC_NAME = '/topic/Golf.Sim'; // Updated to STOMP topic format

const ActiveMQMessaging: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [brokerInfo, setBrokerInfo] = useState<{ version?: string; sessionId?: string }>({});

  useEffect(() => {
    const client = new Client({
      brokerURL: ACTIVE_MQ_WS_URL,
      reconnectDelay: 5000,
      debug: (msg) => console.log('[STOMP]', msg),
    });

    client.onConnect = (frame) => {
      setConnected(true);
      console.log("✅ Connected frame:", frame);
      // Some brokers include version/session here too:
      if (frame.headers['server']) {
        setBrokerInfo((prev) => ({ ...prev, version: frame.headers['server'] }));
      }
      function handleMessage(message: IMessage) {
        console.log('Received message:', message.headers, message.body);
        // Capture version & sessionId from first message if available
        if (!brokerInfo.version && message.headers['version']) {
          setBrokerInfo((prev) => ({ ...prev, version: message.headers['version'] }));
        }
        if (!brokerInfo.sessionId && message.headers['session']) {
          setBrokerInfo((prev) => ({ ...prev, sessionId: message.headers['session'] }));
        }
        // Parse message body as JSON and store stringified version
        try {
          const parsed = JSON.parse(message.body);
          setMessages((prev) => [JSON.stringify(parsed, null, 2), ...prev]);
        } catch (e) {
          setMessages((prev) => [message.body, ...prev]);
        }
      }

      client.subscribe(TOPIC_NAME, handleMessage);
    };

    client.onDisconnect = () => {
      setConnected(false);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [brokerInfo.version, brokerInfo.sessionId]);

  function sanitize(version: string) {
    throw new Error('Function not implemented.');
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
<h2>
  ActiveMQ Messages {connected ? '(Connected' : '(Disconnected)'}
  {connected && brokerInfo.version && brokerInfo.sessionId && (
    <>
      : Version {sanitize(brokerInfo.version)}, Session ID {sanitize(brokerInfo.sessionId)}
    </>
  )}
</h2>
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
          <div
            key={idx}
            style={{
              marginBottom: 6,
              padding: 6,
              background: '#e0f7fa',
              borderRadius: 4,
            }}
          >
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveMQMessaging;
