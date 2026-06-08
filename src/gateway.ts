export type GatewayConnectionState = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

export interface GatewayEvent<P = unknown> {
  payload?: P;
  session_id?: string;
  type: string;
}

interface JsonRpcFrame {
  error?: { message?: string };
  id?: number | string | null;
  method?: string;
  params?: GatewayEvent;
  result?: unknown;
}

type PendingCall = {
  reject: (error: Error) => void;
  resolve: (value: unknown) => void;
  timer?: number;
};

const ANY_EVENT = '*';

export class JsonRpcGatewayClient {
  private nextId = 0;
  private pending = new Map<number, PendingCall>();
  private socket: WebSocket | null = null;
  private state: GatewayConnectionState = 'idle';
  private readonly eventHandlers = new Map<string, Set<(event: GatewayEvent) => void>>();
  private readonly stateHandlers = new Set<(state: GatewayConnectionState) => void>();

  get connectionState() {
    return this.state;
  }

  async connect(wsUrl: string): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN || this.state === 'connecting') {
      return;
    }

    this.setState('connecting');

    const socket = new WebSocket(wsUrl);
    this.socket = socket;

    socket.addEventListener('message', (message) => {
      if (this.socket === socket) {
        this.handleMessage(message.data);
      }
    });

    socket.addEventListener('close', () => {
      if (this.socket !== socket) {
        return;
      }

      this.socket = null;
      this.setState('closed');
      this.rejectAllPending(new Error('Hermes gateway connection closed'));
    });

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const timer = window.setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        this.setState('error');
        try {
          socket.close();
        } catch {
          // Ignore close failures on half-open sockets.
        }
        reject(new Error('Could not connect to Hermes gateway'));
      }, 15000);

      const cleanup = () => {
        window.clearTimeout(timer);
        socket.removeEventListener('open', onOpen);
        socket.removeEventListener('error', onError);
      };

      const onOpen = () => {
        if (settled || this.socket !== socket) {
          return;
        }

        settled = true;
        cleanup();
        this.setState('open');
        resolve();
      };

      const onError = () => {
        if (settled || this.socket !== socket) {
          return;
        }

        settled = true;
        cleanup();
        this.setState('error');
        reject(new Error('Could not connect to Hermes gateway'));
      };

      socket.addEventListener('open', onOpen, { once: true });
      socket.addEventListener('error', onError, { once: true });
    });
  }

  close(): void {
    this.socket?.close();
    this.socket = null;
    this.rejectAllPending(new Error('Hermes gateway connection closed'));
    this.setState('closed');
  }

  on(type: string, handler: (event: GatewayEvent) => void): () => void {
    let handlers = this.eventHandlers.get(type);

    if (!handlers) {
      handlers = new Set();
      this.eventHandlers.set(type, handlers);
    }

    handlers.add(handler);
    return () => handlers?.delete(handler);
  }

  onAny(handler: (event: GatewayEvent) => void): () => void {
    return this.on(ANY_EVENT, handler);
  }

  onState(handler: (state: GatewayConnectionState) => void): () => void {
    this.stateHandlers.add(handler);
    handler(this.state);

    return () => this.stateHandlers.delete(handler);
  }

  request<T>(method: string, params: Record<string, unknown> = {}, timeoutMs = 120000): Promise<T> {
    const socket = this.socket;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('Hermes gateway is not connected'));
    }

    const id = ++this.nextId;

    return new Promise<T>((resolve, reject) => {
      const pending: PendingCall = {
        reject,
        resolve: (value) => resolve(value as T),
      };

      if (timeoutMs > 0) {
        pending.timer = window.setTimeout(() => {
          if (this.pending.delete(id)) {
            reject(new Error(`request timed out: ${method}`));
          }
        }, timeoutMs);
      }

      this.pending.set(id, pending);

      try {
        socket.send(
          JSON.stringify({
            id,
            jsonrpc: '2.0',
            method,
            params,
          }),
        );
      } catch (error) {
        this.clearPending(id);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private handleMessage(data: unknown) {
    let frame: JsonRpcFrame;

    try {
      frame = JSON.parse(String(data)) as JsonRpcFrame;
    } catch {
      return;
    }

    if (frame.id !== undefined && frame.id !== null) {
      const id = Number(frame.id);
      const pending = this.pending.get(id);
      if (!pending) {
        return;
      }

      this.clearPending(id);

      if (frame.error) {
        pending.reject(new Error(frame.error.message || 'Hermes gateway request failed'));
      } else {
        pending.resolve(frame.result);
      }

      return;
    }

    const event = frame.params;
    if (frame.method === 'event' && event?.type) {
      this.emit(event);
    }
  }

  private emit(event: GatewayEvent) {
    this.eventHandlers.get(event.type)?.forEach((handler) => handler(event));
    this.eventHandlers.get(ANY_EVENT)?.forEach((handler) => handler(event));
  }

  private setState(state: GatewayConnectionState) {
    this.state = state;
    this.stateHandlers.forEach((handler) => handler(state));
  }

  private clearPending(id: number) {
    const pending = this.pending.get(id);

    if (pending?.timer) {
      window.clearTimeout(pending.timer);
    }

    this.pending.delete(id);
  }

  private rejectAllPending(error: Error) {
    for (const [id, pending] of this.pending) {
      if (pending.timer) {
        window.clearTimeout(pending.timer);
      }
      pending.reject(error);
      this.pending.delete(id);
    }
  }
}
