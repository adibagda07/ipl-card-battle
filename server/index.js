const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const { setupSocket } = require('./socket/handlers');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'IPL Card Battle Server Running' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

setupSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏏 IPL 2026 Fantasy Card Battle Server Started!\n`);
  console.log(`Local: http://localhost:${PORT}`);
  const interfaces = os.networkInterfaces();
  Object.values(interfaces).forEach(iface => {
    iface?.forEach(addr => {
      if (addr.family === 'IPv4' && !addr.internal) {
        console.log(`Network: http://${addr.address}:${PORT}`);
      }
    });
  });
  console.log(`\nShare the Network URL with friends on same WiFi!\n`);
});