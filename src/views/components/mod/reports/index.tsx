// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';

function LogReport() {
  const [logs, setLogs] = useState(null);
  const [allLogs, setAllLogs] = useState(null);

  useEffect(() => {
    loadLogs(0);
  });
  async function loadLogs(numIncrement: number) {
    const response = await fetch('/mod/form', {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'text/json',
      }),
    });
    const reports = await response.json();
    setLogs(reports);
    if (logs) {
      setAllLogs(
        logs.map((log: {}, i: number) => {
          return (
            <span>
              <strong>Date</strong>: {logs[i].date} <br />
              <strong>Reason</strong>: {logs[i].reason}
              <br />
              <strong>Player Who Reported</strong>:{' '}
              {logs[i].playerWhoReport.username}
              <br />
              <strong>Reported Player</strong>:{' '}
              {logs[i].reportedPlayer.username}
              <br />
              <br />
            </span>
          );
        })
      );
    }
  }
  //
  return (
    // <h1>
    //   <button
    //     onClick={() => {
    //       console.log('HI');
    //     }}
    //   >
    //     CLICK ME
    //   </button>
    // </h1>
    <span>{allLogs}</span>
  );
}

export default hot(LogReport);
