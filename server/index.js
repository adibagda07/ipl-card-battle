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
  const interfaces = os.networkInterfaces();
  const localIPs = [];
  Object.values(interfaces).forEach(iface => {
    iface?.forEach(addr => {
      if (addr.family === 'IPv4' && !addr.internal) localIPs.push(addr.address);
    });
  });

  console.log('\n🏏 IPL 2026 Fantasy Card Battle Server Started!\n');
  console.log(`📡 Local:   http://localhost:${PORT}`);
  localIPs.forEach(ip => console.log(`📡 Network: http://${ip}:${PORT}`));
  console.log('\n📋 Share the Network URL with friends on same WiFi!');
  console.log('\n🌐 For internet sharing:');
  console.log('   ngrok:     npx ngrok http ' + PORT);
  console.log('   cloudflare: npx cloudflared tunnel --url http://localhost:' + PORT);
  console.log('   localtunnel: npx lt --port ' + PORT);
  console.log('\n');
});
