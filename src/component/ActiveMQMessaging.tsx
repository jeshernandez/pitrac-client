// src/ActiveMQMessaging.tsx
import React, { useEffect, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { unpackMessagePackData } from './unpackMessagePackData';

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
      try {
        const bytes = base64ToUint8Array(message.body);
        const unpacked = tryUnpackWithSlices(bytes, unpackMessagePackData);

        if (unpacked) {
        console.log('Unpacked message:', unpacked);
        setMessages(prev => [...prev, JSON.stringify(unpacked)]);

          // Convert unpacked object to a pretty JSON string (or customize display)
         // const displayString = JSON.stringify(unpacked, null, 2);

          // Append new message to the messages state array
          //setMessages((prevMessages) => [...prevMessages, displayString]);
        }
      } catch (e) {
        console.error('Error unpacking message:', e);
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
<div style={{ maxWidth: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
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

function base64ToUint8Array(base64: string): Uint8Array {
  try {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch {
    // If not valid base64, treat as plain text UTF-8 bytes
    const encoder = new TextEncoder();
    return encoder.encode(base64);
  }
}

// Helper function to safely unpack with retries by slicing buffer
function tryUnpackWithSlices(
  bytes: Uint8Array,
  unpackFunc: (data: Uint8Array) => any
): any | null {
  try {
    return unpackFunc(bytes);
  } catch (e) {
    console.warn('Full buffer unpack failed:', e);

    // Try skipping first byte
    try {
      return unpackFunc(bytes.slice(1));
    } catch {
      // Try skipping last byte
      try {
        return unpackFunc(bytes.slice(0, bytes.length - 1));
      } catch (e2) {
        console.error('Unpack failed on sliced buffers too:', e2);
        return null;
      }
    }
  }
}


export default ActiveMQMessaging;
