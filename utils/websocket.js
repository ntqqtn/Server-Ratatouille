import { WebSocketServer } from 'ws';
import { createComment } from "../controllers/forumManage/createComment.js";
import { deleteComment } from "../controllers/forumManage/deleteComment.js";

const clientInPost = {};

const initializeWebSocket = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws, req) => {
    const post_id = req.url.split('/')[2]; // Lấy postId từ URL

    if (!clientInPost[post_id]) {
      clientInPost[post_id] = [];
    }
  
    if (!clientInPost[post_id].includes(ws)) {
        clientInPost[post_id].push(ws);
    }

    ws.on('message', async (message) => {
      const data = JSON.parse(message);
    
      // console.log("data nhaan dc ", data);
      // console.log("data nhaan dc ", data.commentId);
      try {
        if(data.action === "create_comment"){
          const postedComment = await createComment(data);
          // console.log("created comment", postedComment)
          clientInPost[post_id].forEach(client => {
            if (client.readyState === ws.OPEN) { // Thay WebSocket.OPEN bằng ws.OPEN
              client.send(JSON.stringify({
                type: "new_comment",
                comment: postedComment
              })); // Gửi comment mới
            }
          });
        }
        if(data.action === "delete_comment"){
          const commentId  = data.commentId;
          // console.log("comment id dang test", commentId)

          await deleteComment(commentId);

          clientInPost[post_id].forEach(client => {
            if(client.readyState === ws.OPEN) {
              client.send(JSON.stringify({
                type: "delete_comment",
                commentId: commentId
              }))
            }
          })
        }

        
      } catch (err) {
        console.error('Error handling message:', err);
        ws.send(JSON.stringify({ error: 'Failed to proccess comment.' })); // Trả về lỗi nếu có
      }
    });

    ws.on('close', () => {
      clientInPost[post_id] = clientInPost[post_id].filter(client => client !== ws);
    });
  });

  // Lắng nghe yêu cầu upgrade từ HTTP server (nâng cấp kết nối từ HTTP sang WebSocket)
  server.on('upgrade', (req, socket, head) => {
    try {
      if (req.url.startsWith('/ws/')) {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      } else {
        console.log('Non-WebSocket request received at:', req.url);
        socket.destroy();
      }
    } catch (error) {
      console.error('Error during upgrade:', error);
      socket.destroy();
    }
  });
};

export { initializeWebSocket };
