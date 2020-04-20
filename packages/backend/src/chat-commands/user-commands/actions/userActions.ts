import Help from './help';
import Roll from './roll';

export const userActions: Record<string, any> = {
  help: new Help('help'),
  roll: new Roll('roll'),
};
