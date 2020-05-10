import * as io from 'socket.io-client';

export const connectSocketHelper = (port: string) => (token: string) =>
  io.connect(`http://127.0.0.1:${port}`, {
    transports: ['websocket'],
    forceNew: true,
    query: {
      token,
    },
  });

export const socketEmit = (
  socket: SocketIOClient.Socket,
  event: string,
  data: any,
) =>
  new Promise((resolve, reject) => {
    socket.on('error', (err: any) => {
      reject(err);
    });

    socket.emit(event, data, (ret: any) => {
      if (ret) {
        socket.removeAllListeners();
        resolve(ret);
      }
    });
  });

export const socketOn = (socket: SocketIOClient.Socket, event: string) =>
  new Promise((resolve, reject) => {
    // Disable previous listeners
    socket.off(event);

    socket.on(event, (ret: any) => {
      socket.removeAllListeners();
      resolve(ret);
    });
    socket.on('error', (err: any) => {
      reject(err);
    });
  });

// Will call done if the socket receives this event.
export const socketNotOn = (
  socket: SocketIOClient.Socket,
  event: string,
  done: any,
) => {
  // Disable previous listeners
  socket.off(event);

  socket.on(event, (data: any) => {
    socket.removeAllListeners();
    done(`Socket should not have received ${event} event. Err: ${data}`);
  });
};

export const socketOnAll = (sockets: SocketIOClient.Socket[], event: string) =>
  sockets.map((socket) => socketOn(socket, event));

export const socketClose = (socket: SocketIOClient.Socket, done: any) => {
  socket.on('disconnect', () => {
    socket.removeAllListeners();
    // Wait a bit for redis operations to complete, then finish.
    setTimeout(() => {
      done();
    }, 100);
  });

  socket.on('error', (err: any) => {
    done(err);
  });

  socket.disconnect();
};

export const socketClosePromise = (socket: SocketIOClient.Socket) =>
  new Promise((resolve, reject) => {
    socket.on('disconnect', () => {
      socket.removeAllListeners();
      resolve();
    });

    socket.on('error', (err: any) => {
      reject(err);
    });

    socket.disconnect();
  });

export const socketCloseAll = (sockets: SocketIOClient.Socket[], done: any) => {
  // Delay slightly in case socketNotOn needs to be triggered.
  setTimeout(async () => {
    // Disconnect each socket.
    await Promise.all(sockets.map((socket) => socketClosePromise(socket)));

    // Wait a bit for redis operations to complete, then finish.
    setTimeout(() => {
      done();
    }, 100);
  }, 100);
};
