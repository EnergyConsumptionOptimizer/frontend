import { io } from "socket.io-client";

export class socketController {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionPromise = null;
  }

  async connect(url) {
    if (this.isConnected) {
      console.warn("Socket already connected");
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket = io(url, {
        transports: ["websocket"],
        reconnection: true,
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket.id);
        this.isConnected = true;
        resolve();
      });

      this.socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        reject(err);
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
        this.isConnected = false;
      });
    });

    return this.connectionPromise;
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Cannot emit: socket not connected");
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionPromise = null;
      console.log("Socket disconnected and cleaned up");
    }
  }
}
