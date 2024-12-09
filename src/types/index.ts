export interface Message {
  author: string;
  timestamp: string;
  content: string[];
  depth: number;
  children?: Message[];
}

export interface Thread {
  title: string;
  messages: Message[];
  collapsed?: boolean;
} 