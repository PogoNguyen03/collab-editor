import { Server } from '@hocuspocus/server';

// Khởi tạo server bằng từ khóa 'new'
const server = new Server({
  port: 1234,

  async onAuthenticate(data) {
    console.log(`🔐 Đang kết nối phòng: ${data.documentName}`);
  },

  onConnect() {
    console.log('🤝 Có người vừa tham gia!');
  },
});

// Chạy server
server.listen();
console.log('🚀 Hocuspocus Server đang chạy tại ws://127.0.0.1:1234');