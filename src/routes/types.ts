import { Request } from 'express';
import { IUser } from '../gameplay/types';

export interface EnrichedRequest extends Request {
  user: IUser;
}
