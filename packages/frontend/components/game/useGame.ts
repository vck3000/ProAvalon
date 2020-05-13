import { useEffect } from 'react';
import { useRouter } from 'next/router';
import socket from '../../socket';
import { SocketEvents } from '../../proto/lobbyProto';
import useAuth from '../../effects/useAuth';

const useGame = (id: number): void => {
  const user = useAuth();

  const router = useRouter();

  useEffect((): (() => void) => {
    if (Number.isNaN(id)) router.replace('/404');

    if (user) socket.emit(SocketEvents.JOIN_GAME, { id });

    return (): void => {
      socket.emit(SocketEvents.LEAVE_GAME, { id });
    };
  }, [id, user]);
};

export default useGame;
