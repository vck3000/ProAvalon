import { SocketUser } from './types';

export interface ReadyPromptReplyFromClient {
  promptId: number;
  accept: boolean;
}

export interface ReadyPromptRequestToClient {
  promptId: number;
  timeout: number;
  title: string;
  text: string;
}

export type ReadyPromptResultCallback = (
  success: boolean,
  acceptedUsernames: string[],
  rejectedUsernames: string[],
) => void;

export class ReadyPrompt {
  // 10 seconds in milliseconds
  private timeout = 10 * 1000;

  private prompts: Map<number, SingleReadyPrompt> = new Map();
  private nextPromptId = 0;

  createReadyPrompt(
    sockets: SocketUser[],
    title: string,
    text: string,
    callback: ReadyPromptResultCallback,
  ): void {
    const usernamesSet: Set<string> = new Set();

    // Send out message to all clients.
    for (const socket of sockets) {
      const data: ReadyPromptRequestToClient = {
        promptId: this.nextPromptId,
        timeout: this.timeout,
        title,
        text,
      };
      socket.emit('ready-prompt-to-client', data);

      usernamesSet.add(socket.request.user.username);
    }

    // Create the single ready prompt
    const singleReadyPrompt = new SingleReadyPrompt(usernamesSet, callback);
    const currentPromptId = this.nextPromptId;
    this.prompts.set(currentPromptId, singleReadyPrompt);

    setTimeout(() => {
      singleReadyPrompt.timedOut();
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
  private pendingUsernames: Set<string> = new Set();
  private acceptedUsernames: Set<string> = new Set();
  private rejectedUsernames: Set<string> = new Set();
  private readonly callback: ReadyPromptResultCallback;

  private done = false;

  constructor(usernames: Set<string>, callback: ReadyPromptResultCallback) {
    this.pendingUsernames = usernames;
    this.callback = callback;
  }

  timedOut() {
    if (this.done) {
      return;
    }

    for (const username of this.pendingUsernames) {
      this.rejectedUsernames.add(username);
    }
    this.pendingUsernames.clear();
    this.callTheCallback();
  }

  clientReply(username: string, accept: boolean): void {
    const existed = this.pendingUsernames.delete(username);
    if (!existed) {
      return;
    }

    if (accept) {
      this.acceptedUsernames.add(username);
    } else {
      this.rejectedUsernames.add(username);
    }

    if (this.pendingUsernames.size === 0) {
      this.done = true;
      this.callTheCallback();
      return;
    }
  }

  private callTheCallback() {
    this.callback(
      this.rejectedUsernames.size === 0,
      Array.from(this.acceptedUsernames),
      Array.from(this.rejectedUsernames),
    );
  }
}
