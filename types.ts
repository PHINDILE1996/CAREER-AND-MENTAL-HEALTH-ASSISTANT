
export enum Sender {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  imageUrl?: string;
  quickReplies?: string[];
}

export interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
}
