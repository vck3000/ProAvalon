// @ts-nocheck
import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Log } from './log';

class ModLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logs: null,
      logPage: 0,
    };
  }

  componentDidMount() {
    this.loadLogs();
  }

  loadMoreLogs() {
    this.loadLogs(1);
  }

  loadLessLogs() {
    this.loadLogs(-1);
  }

  loadLogs(numIncrement) {
    let page = 0;

    if (numIncrement !== undefined) {
      if (this.state.logPage + numIncrement >= 0) {
        page = this.state.logPage + numIncrement;
        this.setState({ logPage: page });
      }
    }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', '/mod/ajax/logData/' + page, true);

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var logs = JSON.parse(xmlhttp.responseText);
        this.setState({ logs: logs });
        // console.log(logs);
      }
    };
    xmlhttp.send();
  }

  render() {
    if (!this.state.logs) {
      return 'Loading.....';
    } else {
      const allLogs = this.state.logs.map((log, i) => {
        return <Log log={this.state.logs[i]} key={this.state.logs[i]._id} />;
      });

      return (
        <span>
          <span className="pageButtonGroup">
            <button
              className="btn btn-info logButtons"
              onClick={() => this.loadLessLogs()}
            >
              Prev page
            </button>
            <span>Page: {this.state.logPage + 1}</span>
            <button
              className="btn btn-info logButtons"
              onClick={() => this.loadMoreLogs()}
            >
              Next page
            </button>
          </span>
          {allLogs}
        </span>
      );
    }
  }
}

export default hot(ModLog);
