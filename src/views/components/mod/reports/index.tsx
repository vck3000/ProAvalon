import React, { useEffect, useRef, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import Swal from 'sweetalert2';

import { myStyle } from './css';

type Report = {
  date: string;
  modWhoResolved: { id: string; username: string };
  modComment: string;
  playerWhoReport: { id: string; username: string };
  reason: string;
  reportedPlayer: { id: string; username: string };
  resolved: boolean;
  _id: string;
};

function Report() {
  const [unresolvedReports, setUnresolvedReports] = useState<Report[]>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[]>([]);
  const [currentPageResolved, setCurrentPageResolved] = useState(0);
  const [currentPageUnresolved, setCurrentPageUnresolved] = useState(0);

  useEffect(() => {
    triggerLoadReports();
  }, [currentPageResolved, currentPageUnresolved]);

  const triggerLoadReports = () => {
    loadReports(currentPageUnresolved, currentPageResolved);
    console.log('Triggered reload');
  };
  const nextPageUnresolved = () => {
    let tempCurrentPage = currentPageUnresolved + 1;
    setCurrentPageUnresolved(tempCurrentPage);
  };

  const prevPageUnresolved = () => {
    if (currentPageUnresolved != 0) {
      let tempCurrentPage = currentPageUnresolved - 1;
      setCurrentPageUnresolved(tempCurrentPage);
    }
  };

  const nextPageResolved = () => {
    let tempCurrentPage = currentPageResolved + 1;
    setCurrentPageResolved(tempCurrentPage);
  };

  const prevPageResolved = () => {
    if (currentPageResolved != 0) {
      let tempCurrentPage = currentPageResolved - 1;
      setCurrentPageResolved(tempCurrentPage);
    }
  };

  async function loadReports(
    pageNumberUnresolved: number,
    pageNumberResolved: number
  ) {
    const responseResolved = await fetch(
      `/mod/form/${pageNumberResolved}?resolved=true`,
      {
        method: 'GET',
        headers: new Headers({
          'Content-Type': 'text/json',
        }),
      }
    );
    const responseUnresolved = await fetch(
      `/mod/form/${pageNumberUnresolved}?resolved=false`,
      {
        method: 'GET',
        headers: new Headers({
          'Content-Type': 'text/json',
        }),
      }
    );

    const reportsResolved = await responseResolved.json();
    const reportsUnresolved = await responseUnresolved.json();

    //else need to revert the page number, but that causes a re render (can ignore?), for now just sending an alert to know its end of page

    if (reportsResolved.length != 0) {
      setResolvedReports(reportsResolved);
    } else {
      if (currentPageResolved != 0) {
        Swal.fire('End of page, go back');
      }
    }
    if (reportsUnresolved.length != 0) {
      setUnresolvedReports(reportsUnresolved);
    } else {
      if (currentPageUnresolved != 0) {
        Swal.fire('End of page, go back');
      }
    }
  }

  return (
    <span>
      <h2>Unresolved Reports</h2>
      <PageButtons
        currentPage={currentPageUnresolved}
        nextPage={nextPageUnresolved}
        prevPage={prevPageUnresolved}
      />
      <div>
        {unresolvedReports.map((report) => (
          <ReportEntry
            report={report}
            key={report.date}
            callbackOnResolve={triggerLoadReports}
          />
        ))}
      </div>
      <PageButtons
        currentPage={currentPageUnresolved}
        nextPage={nextPageUnresolved}
        prevPage={prevPageUnresolved}
      />

      <h2>Resolved Reports</h2>
      <PageButtons
        currentPage={currentPageResolved}
        nextPage={nextPageResolved}
        prevPage={prevPageResolved}
      />
      <div>
        {resolvedReports.map((report) => (
          <ReportEntry
            report={report}
            key={report.date}
            callbackOnResolve={triggerLoadReports}
          />
        ))}
      </div>
      <PageButtons
        currentPage={currentPageResolved}
        nextPage={nextPageResolved}
        prevPage={prevPageResolved}
      />
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
      <span>Page: {currentPage}</span>
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
  const textareaRef = useRef(null);

  const resolveReport = async (id: string) => {
    console.log(textareaRef.current.value);
    const res = await fetch('/mod/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, modComment: textareaRef.current.value }),
    });
    if (res.status == 200) {
      callbackOnResolve();
    } else {
      Swal.fire('Unknown error resolving message');
    }
  };

  return (
    <span>
      <div style={myStyle}>
        <p>
          <strong>Reported player</strong>: {report.reportedPlayer.username}
        </p>
        <p>
          <strong>Date</strong>: {report.date}
        </p>
        <p>
          <strong>Player who reported</strong>:{' '}
          {report.playerWhoReport.username}
        </p>
        <p>
          <strong>Reason</strong>: {report.reason}
        </p>
        {report.resolved ? (
          <div>
            <p>
              <strong>Mod who resolved</strong>:{' '}
              {report.modWhoResolved.username}
            </p>
            <p>
              <strong>Mod Comment</strong>: {report.modComment}
            </p>
          </div>
        ) : (
          <div>
            <textarea ref={textareaRef} rows={3} cols={35}></textarea>
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
      </div>
      <br />
    </span>
  );
}

export default hot(Report);
