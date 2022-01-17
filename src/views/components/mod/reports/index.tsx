import React, { useEffect, useRef, useState } from 'react';
import { hot } from 'react-hot-loader/root';

import { myStyle } from './css';


type Report = {
  date: string;
  modWhoResolved: { id: string; username: string };
  playerWhoReport: { id: string; username: string };
  reason: string;
  reportedPlayer: { id: string; username: string };
  resolved: boolean;
};

function Report() {
  const [unresolvedReports, setUnresolvedReports] = useState<Report[]>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[]>([]);

  useEffect(() => {
    triggerLoadReports();
  }, []);

  const triggerLoadReports = () => {
    loadReports(0);
    console.log('Triggered reload');
  };

  async function loadReports(numIncrement: number) {
    const response = await fetch('/mod/form', {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'text/json',
      }),
    });

    const reports = await response.json();

    setResolvedReports(reports.filter((r: Report) => r.resolved));
    setUnresolvedReports(reports.filter((r: Report) => !r.resolved));
  }

  return (
    <span>
      <h2>Unresolved Reports</h2>
      <div>
        {unresolvedReports.map((report) => (
          <ReportEntry
            report={report}
            key={report.date}
            callbackOnResolve={triggerLoadReports}
          />
        ))}
      </div>

      <h2>Resolved Reports</h2>
      <div>
        {resolvedReports.map((report) => (
          <ReportEntry
            report={report}
            key={report.date}
            callbackOnResolve={triggerLoadReports}
          />
        ))}
      </div>
    </span>
  );

  //async function handleConfirm(modComment: any, id_key: any) {
  //  //still need to get who?
  //  const res = await fetch('/mod/reports', {
  //    method: 'POST',
  //    headers: { 'Content-Type': 'application/json' },
  //    body: JSON.stringify({ modComment, modUser: '', id_key }),
  //  });
  //}

  //function handleUnresolvedLogs() {
  //  return logs.map((log: {}, i: number) => {
  //    if (logs[i].resolved == false) {
  //      return (
  //        <span key={logs[i]._id}>
  //          <div style={myStyle} id={logs[i]._id}>
  //            <strong>Date</strong>: {logs[i].date} <br />
  //            <strong>Reason</strong>: {logs[i].reason}
  //            <br />
  //            <strong>Player Who Reported</strong>:{' '}
  //            {logs[i].playerWhoReport.username}
  //            <br />
  //            <strong>Reported Player</strong>:{' '}
  //            {logs[i].reportedPlayer.username}
  //            <br />
  //            <strong>Resolved</strong>: {'False'}
  //            <br />
  //            <br />
  //            <button className="btn btn-info">See More</button>
  //            <button
  //              className="btn btn-success"
  //              id={`${logs[i]._id}resolve-button`}
  //              style={{ margin: '2px', marginLeft: '50px' }}
  //              onClick={() => {
  //                handleResolve(logs[i]._id);
  //              }}
  //            >
  //              Resolve
  //            </button>
  //          </div>
  //          <br />
  //          <br />
  //        </span>
  //      );
  //    }
  //  });
  //}

  //function handleResolvedLogs() {
  //  return logs.map((log: {}, i: number) => {
  //    if (logs[i].resolved == true) {
  //      return (
  //        <span key={logs[i]._id}>
  //          <div style={myStyle} id={logs[i]._id}>
  //            <strong>Date</strong>: {logs[i].date} <br />
  //            <strong>Reason</strong>: {logs[i].reason}
  //            <br />
  //            <strong>Player Who Reported</strong>:{' '}
  //            {logs[i].playerWhoReport.username}
  //            <br />
  //            <strong>Reported Player</strong>:{' '}
  //            {logs[i].reportedPlayer.username}
  //            <br />
  //            <strong>Resolved</strong>: True
  //            <br />
  //            <strong>Mod Who Resolved</strong> : idk how to do this
  //            <br />
  //            <strong>Mod Comment</strong>: {logs[i].modComment}
  //            <br />
  //          </div>
  //          <br />
  //          <br />
  //        </span>
  //      );
  //    }
  //  });
  //}

  // function handleResolve(id: any) {
  //   let cardID = document.getElementById(id);
  //   let resolveButton = document.getElementById(`${id}resolve-button`);
  //   if (resolveButton.innerHTML === 'Cancel') {
  //     resolveButton.innerHTML = 'Resolve';
  //     resolveButton.className = 'btn btn-success';
  //     let elements = document.getElementsByClassName(`${id}temp-element`);
  //     let length = elements.length;
  //     for (let i = length - 1; i >= 0; i--) {
  //       cardID.removeChild(elements[i]);
  //       // console.log(elements.length);
  //     }
  //   } else {
  //     resolveButton.innerHTML = 'Cancel';
  //     resolveButton.className = 'btn btn-danger';
  //     let modComment = document.createElement('TEXTAREA');
  //     modComment.className = `${id}temp-element`;
  //     // modComment.value = 'Enter in a comment';
  //     let confirm = document.createElement('BUTTON');
  //     confirm.innerHTML = 'Confirm';
  //     confirm.addEventListener('click', () => {
  //       // handleConfirm(modComment.value, id);
  //     });
  //     confirm.className = `${id}temp-element btn btn-success`;
  //     cardID.appendChild(modComment);
  //     cardID.appendChild(confirm);
  //   }
  // }

  //
}

type ReportEntryProps = {
  report: Report;
  callbackOnResolve: () => void;
};

function ReportEntry({ report, callbackOnResolve }: ReportEntryProps) {
  const textareaRef = useRef(null);

  const resolveReport = async () => {
    // console.log('HI');
    // console.log(textareaRef);
    // console.log(textareaRef.current.value);

    await fetch('', {});

    callbackOnResolve();
    // Swal.fire('Success! Please refresh the page to see updates.');
  };

  return (
    <div>
      <p>Reported player: {report.reportedPlayer.username}</p>
      <p>Date: {report.date}</p>

      {report.resolved ? null : (
        <div>
          <textarea ref={textareaRef}></textarea>
          <button onClick={resolveReport}>Resolve</button>
        </div>
      )}
    </div>
  );
}

export default hot(Report);
