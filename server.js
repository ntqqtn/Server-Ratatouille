import express from "express";
import bodyParser from "body-parser";
import apiRouter from "./routes/api.js";
import { initializeWebSocket } from "./utils/websocket.js"; // Import hàm khởi tạo WebSocket
import http from "http";

import path from "path";
import { fileURLToPath } from 'url';

const app = express();
const server = http.createServer(app); // Tạo HTTP server từ Express app

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json()); // Middleware xử lý JSON
app.use('/api', apiRouter); // Định nghĩa các route API

app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Khởi tạo WebSocket với server
initializeWebSocket(server);

// Lắng nghe HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
