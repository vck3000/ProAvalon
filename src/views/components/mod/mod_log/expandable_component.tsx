// @ts-nocheck
import React from 'react';

export class ExpandableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  toggleExpand() {
    this.setState({
      ...this.state,
      expanded: !this.state.expanded,
    });
  }

  render() {
    console.log(this.props.data);
    return (
      <div>
        <div className={this.state.expanded ? '' : 'collapsed'}>
          {this.props.data}
        </div>
        <button
          className={'expandButton'}
          onClick={this.toggleExpand.bind(this)}
        >
          {this.state.expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
    );
  }
}
