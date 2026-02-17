declare module 'ws' {
  import { Server as HttpServer } from 'http';
  import { Server as HttpsServer } from 'https';
  import { EventEmitter } from 'events';

  class WebSocket extends EventEmitter {
    static Server: typeof WebSocketServer;
    
    constructor(address: string | URL, options?: any);
    
    on(event: 'close', listener: (code: number, reason: Buffer) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'message', listener: (data: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;

    send(data: any, options?: any, cb?: (err?: Error) => void): void;
    close(code?: number, data?: string | Buffer): void;
    
    readyState: number;
    static CONNECTING: number;
    static OPEN: number;
    static CLOSING: number;
    static CLOSED: number;
  }

  class WebSocketServer extends EventEmitter {
    constructor(options?: any, callback?: () => void);
    
    on(event: 'connection', cb: (socket: WebSocket, request: any) => void): this;
    on(event: 'error', cb: (error: Error) => void): this;
    on(event: 'headers', cb: (headers: string[], request: any) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
  }

  export { WebSocket, WebSocketServer };
  export default WebSocket;
}
