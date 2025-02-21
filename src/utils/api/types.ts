export interface MessageUpdate {
  threadTitle: string;
  messageAuthor: string;
  messageTimestamp: string;
  newContent: string[];
  newTimestamp?: string;
}

export interface MessageReply {
  threadTitle: string;
  parentAuthor: string;
  parentTimestamp: string;
  parentContent: string[];
  content: string[];
  author: string;
  timestamp: string;
}

export interface ThreadCreate {
  title: string;
  initialMessage?: {
    content: string[];
    author: string;
  };
}

export interface MessageMove {
  newTitle: string;
  sourceThreadTitle: string;
  messageAuthor: string;
  messageTimestamp: string;
  messageContent: string[];
}

export interface MessageDelete {
  threadTitle: string;
  messageAuthor: string;
  messageTimestamp: string;
}

export interface MessageAPI {
  updateMessage(update: MessageUpdate): Promise<boolean>;
  replyToMessage(reply: MessageReply): Promise<boolean>;
  createThread(thread: ThreadCreate): Promise<boolean>;
  moveToThread(move: MessageMove): Promise<boolean>;
  deleteMessage(del: MessageDelete): Promise<boolean>;
} 