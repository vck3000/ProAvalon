export type MessageType =
  | 'chat'
  | 'res_win'
  | 'spy_win'
  | 'player_join_lobby'
  | 'player_leave_lobby'
  | 'create_room';

export interface IMessage {
  timestamp: Date;
  username: string;
  text: string;
  type: MessageType;
}
