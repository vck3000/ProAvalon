import { SocketUser } from './types';

export interface ReadyPromptReplyFromClient {
  promptId: number;
  accept: boolean;
}

export interface ReadyPromptRequestToClient {
  promptId: number;
  timeout: number;
}

export type ReadyPromptResultCallback = (success: boolean) => void;

export class ReadyPrompt {
  // 10 seconds in milliseconds
  private timeout = 10 * 1000;

  private prompts: Map<number, SingleReadyPrompt> = new Map();
  private nextPromptId = 0;

  createReadyPrompt(
    sockets: SocketUser[],
    callback: ReadyPromptResultCallback,
  ): void {
    const usernamesSet: Set<string> = new Set();

    // Send out message to all clients.
    for (const socket of sockets) {
      const data: ReadyPromptRequestToClient = {
        promptId: this.nextPromptId,
        timeout: this.timeout,
      };
      socket.emit('ready-prompt-to-client', data);

      usernamesSet.add(socket.request.user.username);
    }

    // Create the single ready prompt
    const singleReadyPrompt = new SingleReadyPrompt(usernamesSet, callback);
    const currentPromptId = this.nextPromptId;
    this.prompts.set(currentPromptId, singleReadyPrompt);

    setTimeout(() => {
      singleReadyPrompt.destructor();
      this.prompts.delete(currentPromptId);
    }, this.timeout);

    this.nextPromptId++;
  }

  clientReply(username: string, clientReply: ReadyPromptReplyFromClient): void {
    if (!this.prompts.has(clientReply.promptId)) {
      return;
    }

    // Forward the request onwards
    this.prompts
      .get(clientReply.promptId)
      .clientReply(username, clientReply.accept);
  }
}

class SingleReadyPrompt {
  private usernames: Set<string> = new Set();
  private readonly callback: ReadyPromptResultCallback;

  private done = false;

  constructor(usernames: Set<string>, callback: ReadyPromptResultCallback) {
    this.usernames = usernames;
    this.callback = callback;
  }

  destructor() {
    // Timed out
    if (!this.done) {
      this.callback(false);
    }
  }

  clientReply(username: string, accept: boolean): void {
    if (!accept) {
      this.callback(false);
      return;
    }

    if (accept) {
      this.usernames.delete(username);
    }

    if (this.usernames.size === 0) {
      this.done = true;
      this.callback(true);
      return;
    }
  }
}
