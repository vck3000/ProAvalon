import { Request } from 'express';
import { IUser } from '../gameplay/gameEngine/types';

export interface EnrichedRequest extends Request {
  user: IUser;
}
