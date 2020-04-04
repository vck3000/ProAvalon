export type MessageType =
  | 'chat'
  | 'res_win'
  | 'spy_win'
  | 'player_join_lobby'
  | 'player_leave_lobby'
  | 'create_room';

export interface Message {
  readonly timestamp: Date;
  readonly username: string;
  readonly text: string;
  readonly type: MessageType;
}
