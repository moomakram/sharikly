const connectWebSocket = () => {
  try {
    const socket = new WebSocket('ws://localhost:3000/ws');
    socket.onopen = () => {
      console.log('WebSocket connection established.');
    };
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    socket.onclose = () => {
      console.warn('WebSocket connection closed. Retrying...');
      setTimeout(connectWebSocket, 5000); // Retry connection after 5 seconds
    };
  } catch (error) {
    console.error('WebSocket connection failed:', error);
  }
};

connectWebSocket();
