import { GameData } from '../gameEngine';

export type SendData = (data: { username: string; data: any }[]) => void;

export interface System {
  run(gameData: GameData, sendData: SendData): void;
}