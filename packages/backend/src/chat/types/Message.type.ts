export type MessageType =
  | 'chat'
  | 'res_win'
  | 'spy_win'
  | 'player_join_lobby'
  | 'player_leave_lobby'
  | 'create_room';

export interface Message {
  id: string;
  timestamp: Date;
  username: string;
  message: string;
  type: MessageType;
}
