import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  ReadyPromptReplyFromClient,
  ReadyPromptRequestToClient,
} from '../../../sockets/readyPrompt';

export function ReadyPrompt() {
  useEffect(() => {
    // @ts-ignore
    const socket: Socket = socket_;
    // @ts-ignore
    const playSound_: (sound: string) => boolean = playSound;

    let timerInterval: ReturnType<typeof setInterval>;
    socket.on('ready-prompt-to-client', (data: ReadyPromptRequestToClient) => {
      playSound_('buzz');

      Swal.fire({
        title: data.title,
        html: `${data.text}${data.text ? '<br><br>' : ''}<span></span>`,
        icon: 'info',
        showConfirmButton: true,
        confirmButtonText: 'Accept',
        showDenyButton: true,
        denyButtonText: 'Reject',
        timerProgressBar: true,
        allowOutsideClick: false,
        timer: data.timeout,
        didOpen: () => {
          Swal.hideLoading();
          const timer = Swal.getPopup().querySelector('span');
          timerInterval = setInterval(() => {
            timer.textContent = `${Math.floor(
              Swal.getTimerLeft() / 1000,
            )}s remaining...`;
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then((result) => {
        const reply: ReadyPromptReplyFromClient = {
          promptId: data.promptId,
          accept: result.isConfirmed,
        };
        socket.emit('ready-prompt-reply', reply);
      });
    });
  }, []);

  return <></>;
}
