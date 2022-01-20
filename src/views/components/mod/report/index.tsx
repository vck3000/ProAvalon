import React, { useEffect, useRef, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import Swal from 'sweetalert2';
import { ExpandableComponent } from '../../common/expandableComponent';

import { myStyle } from './css';

type Report = {
  date: string;
  modWhoResolved: { id: string; username: string };
  modComment: string;
  playerWhoReported: { id: string; username: string };
  reason: string;
  description: string;
  reportedPlayer: { id: string; username: string };
  resolved: boolean;
  _id: string;
  allChat5Mins: string;
  roomChat: string;
};

function Report() {
  const [unresolvedReports, setUnresolvedReports] = useState<Report[]>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[]>([]);

  const [pageNum, setPageNum] = useState(0);

  useEffect(() => {
    triggerLoadReports();
  }, [pageNum]);

  const triggerLoadReports = () => {
    loadReports(pageNum);
  };

  async function loadReports(pageNum: number) {
    const resolvedReports = await fetch(`/mod/report/resolved/${pageNum}`).then(
      (res) => res.json()
    );

    const unresolvedReports = await fetch(`/mod/report/unresolved`).then(
      (res) => res.json()
    );

    setResolvedReports(resolvedReports);
    setUnresolvedReports(unresolvedReports);
  }

  const pageButtons = () => (
    <PageButtons
      currentPage={pageNum}
      nextPage={() => {
        setPageNum(pageNum + 1);
      }}
      prevPage={() => {
        setPageNum(pageNum - 1);
      }}
    />
  );

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

      {pageButtons()}

      <div>
        {resolvedReports.map((report) => (
          <ReportEntry
            report={report}
            key={report.date}
            callbackOnResolve={triggerLoadReports}
          />
        ))}
      </div>

      {pageButtons()}
    </span>
  );
}

type PageButtonProps = {
  currentPage: number;
  nextPage: () => void;
  prevPage: () => void;
};

function PageButtons({ currentPage, nextPage, prevPage }: PageButtonProps) {
  return (
    <span className="pageButtonGroup">
      <button
        className="btn btn-info"
        onClick={() => {
          prevPage();
          window.scrollTo(0, 0);
        }}
      >
        Prev page
      </button>
      <span> Page: {currentPage} </span>
      <button
        className="btn btn-info"
        onClick={() => {
          nextPage();
          window.scrollTo(0, 0);
        }}
      >
        Next page
      </button>
    </span>
  );
}

type ReportEntryProps = {
  report: Report;
  callbackOnResolve: () => void;
};

function ReportEntry({ report, callbackOnResolve }: ReportEntryProps) {
  const modCommentRef = useRef(null);

  const resolveReport = async (id: string) => {
    const res = await fetch('/mod/report/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, modComment: modCommentRef.current.value }),
    });

    if (res.status == 200) {
      Swal.fire(await res.text());
      callbackOnResolve();
    } else {
      Swal.fire(await res.text());
    }
  };

  return (
    <div style={myStyle}>
      <p>
        <strong>Reported player</strong>: {report.reportedPlayer.username}
      </p>
      <p>
        <strong>Date</strong>: {new Date(report.date).toString()}
      </p>
      <p>
        <strong>Player who reported</strong>:{' '}
        {report.playerWhoReported.username}
      </p>
      <p>
        <strong>Reason</strong>: {report.reason}
      </p>
      <p>
        <strong>Description</strong>: {report.description}
      </p>

      {report.resolved ? (
        <div>
          <p>
            <strong>Mod who resolved</strong>: {report.modWhoResolved.username}
          </p>
          <p>
            <strong>Mod Comment</strong>: {report.modComment}
          </p>
        </div>
      ) : (
        <div>
          <p>
            <strong>Resolve comments:</strong>
          </p>
          <textarea ref={modCommentRef} rows={3} cols={35}></textarea>
          <br />
          <button
            onClick={() => {
              resolveReport(report._id);
            }}
            className="btn btn-success"
          >
            Resolve
          </button>
        </div>
      )}
      <br />

      <h4>All Chat (5 mins):</h4>
      <ExpandableComponent
        data={report.allChat5Mins.split('\n').map((chat) => (
          <p style={{ marginBottom: 0 }}>{chat}</p>
        ))}
      />

      <h4>Room Chat:</h4>
      <ExpandableComponent
        data={report.roomChat.split('\n').map((chat) => (
          <p style={{ marginBottom: 0 }}>{chat}</p>
        ))}
      />
    </div>
  );
}

export default hot(Report);
