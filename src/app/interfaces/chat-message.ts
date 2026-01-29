export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}