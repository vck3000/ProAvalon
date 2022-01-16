// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';

function LogReport() {
  const [logs, setLogs] = useState(null);
  const [unresolvedLogs, setUnresolvedLogs] = useState(null);
  const [resolvedLogs, setResolvedLogs] = useState(null);

  const myStyle = {
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
    transition: '0.3s',
    width: '40%',
    padding: '5px',
  };

  useEffect(() => {
    loadLogs(0);
  }, []);

  async function handleConfirm(modComment, id_key) {
    //still need to get who?
    const res = await fetch('/mod/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modComment, modUser: '', id_key }),
    });
  }

  function handleUnresolvedLogs() {
    return logs.map((log: {}, i: number) => {
      if (logs[i].resolved == false) {
        return (
          <span key={logs[i]._id}>
            <div style={myStyle} id={logs[i]._id}>
              <strong>Date</strong>: {logs[i].date} <br />
              <strong>Reason</strong>: {logs[i].reason}
              <br />
              <strong>Player Who Reported</strong>:{' '}
              {logs[i].playerWhoReport.username}
              <br />
              <strong>Reported Player</strong>:{' '}
              {logs[i].reportedPlayer.username}
              <br />
              <strong>Resolved</strong>: {'False'}
              <br />
              <br />
              <button className="btn btn-info">See More</button>
              <button
                className="btn btn-success"
                id={`${logs[i]._id}resolve-button`}
                style={{ margin: '2px', marginLeft: '50px' }}
                onClick={() => {
                  handleResolve(logs[i]._id);
                }}
              >
                Resolve
              </button>
            </div>
            <br />
            <br />
          </span>
        );
      }
    });
  }

  function handleResolvedLogs() {
    return logs.map((log: {}, i: number) => {
      if (logs[i].resolved == true) {
        return (
          <span key={logs[i]._id}>
            <div style={myStyle} id={logs[i]._id}>
              <strong>Date</strong>: {logs[i].date} <br />
              <strong>Reason</strong>: {logs[i].reason}
              <br />
              <strong>Player Who Reported</strong>:{' '}
              {logs[i].playerWhoReport.username}
              <br />
              <strong>Reported Player</strong>:{' '}
              {logs[i].reportedPlayer.username}
              <br />
              <strong>Resolved</strong>: True
              <br />
              <strong>Mod Who Resolved</strong> : idk how to do this
              <br />
              <strong>Mod Comment</strong>: {logs[i].modComment}
              <br />
            </div>
            <br />
            <br />
          </span>
        );
      }
    });
  }

  function handleResolve(id) {
    let cardID = document.getElementById(id);
    let resolveButton = document.getElementById(`${id}resolve-button`);
    if (resolveButton.innerHTML === 'Cancel') {
      resolveButton.innerHTML = 'Resolve';
      resolveButton.className = 'btn btn-success';
      let elements = document.getElementsByClassName(`${id}temp-element`);
      let length = elements.length;
      for (let i = length - 1; i >= 0; i--) {
        cardID.removeChild(elements[i]);
        // console.log(elements.length);
      }
    } else {
      resolveButton.innerHTML = 'Cancel';
      resolveButton.className = 'btn btn-danger';
      let modComment = document.createElement('TEXTAREA');
      modComment.className = `${id}temp-element`;
      modComment.value = 'Enter in a comment';
      let confirm = document.createElement('BUTTON');
      confirm.innerHTML = 'Confirm';
      confirm.addEventListener('click', () => {
        handleConfirm(modComment.value, id);
      });
      confirm.className = `${id}temp-element btn btn-success`;
      cardID.appendChild(modComment);
      cardID.appendChild(confirm);
    }
  }

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
      setResolvedLogs(handleResolvedLogs());
      setUnresolvedLogs(handleUnresolvedLogs());
    }
  }

  //
  return (
    <span>
      <h2 style={{ float: 'left' }}>Unresolved Reports</h2>
      <h2 style={{ float: 'right', marginRight: '20%' }}>Resolved Reports</h2>
      <br />
      <br />
      <br />
      <br />
      <button onClick={() => loadLogs(0)}>Load logs</button>

      <div style={{ float: 'left', width: '50%' }}>{unresolvedLogs}</div>
      <div style={{ float: 'right', width: '50%' }}>{resolvedLogs}</div>
    </span>
  );
}

export default hot(LogReport);
