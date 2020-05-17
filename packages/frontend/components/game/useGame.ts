import Swal from 'sweetalert2';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import socket from '../../socket';
import { SocketEvents } from '../../proto/lobbyProto';
import useAuth from '../../effects/useAuth';

const useGame = (gameID?: string | string[]): void => {
  const user = useAuth();

  const router = useRouter();

  useEffect((): (() => void) => {
    if (Number.isNaN(Number(gameID))) {
      router.replace('/404');
    }

    if (user) {
      socket.emit(SocketEvents.JOIN_GAME, { id: gameID }, (msg: string) => {
        if (msg !== 'OK') {
          Swal.fire({
            heightAuto: false,
            title: 'Oops',
            text: msg,
            icon: 'error',
          });
        }
      });
    }

    return (): void => {
      socket.emit(SocketEvents.LEAVE_GAME, { id: gameID });
    };
  }, [gameID, user, router]);
};

export default useGame;
