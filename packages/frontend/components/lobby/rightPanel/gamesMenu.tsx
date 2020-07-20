import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import GameCard from './gameCard';

const GameMenu = (): ReactElement => {
  const games = useSelector((state: RootState) => state.lobby.games);

  return (
    <>
      {games.map((game) => (
        <GameCard key={game.id} lobbyRoom={game} />
      ))}
    </>
  );
};

export default GameMenu;
