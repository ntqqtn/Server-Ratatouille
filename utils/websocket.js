import { WebSocketServer } from 'ws';
import { createComment } from "../controllers/forumManage/createComment.js";

const clientInPost = {};

const initializeWebSocket = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws, req) => {
    const post_id = req.url.split('/')[2]; // Lấy postId từ URL

    if (!clientInPost[post_id]) {
      clientInPost[post_id] = [];
    }
    console.log(`Number of clients in post ${post_id}:`, clientInPost[post_id].length);

    console.log('Connection for post_id:', post_id);
    // clientInPost[post_id].push(ws);
    if (!clientInPost[post_id].includes(ws)) {
        clientInPost[post_id].push(ws);
      }
    ws.on('message', async (message) => {
      const data = JSON.parse(message);
    
      console.log("data nhaan dc ", data);
      try {
        const postedComment = await createComment(data);

        console.log("created comment", postedComment)
        clientInPost[post_id].forEach(client => {
          if (client.readyState === ws.OPEN) { // Thay WebSocket.OPEN bằng ws.OPEN
            client.send(JSON.stringify(postedComment)); // Gửi comment mới
          }
        });
      } catch (err) {
        console.error('Error handling message:', err);
        ws.send(JSON.stringify({ error: 'Failed to save comment.' })); // Trả về lỗi nếu có
      }
    });

    ws.on('close', () => {
      clientInPost[post_id] = clientInPost[post_id].filter(client => client !== ws);
    });
  });

  // Lắng nghe yêu cầu upgrade từ HTTP server (nâng cấp kết nối từ HTTP sang WebSocket)
  server.on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/ws/')) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req); // Tạo kết nối WebSocket
      });
    } else {
      socket.destroy(); // Nếu không phải WebSocket, hủy kết nối
    }
  });
};

export { initializeWebSocket };
