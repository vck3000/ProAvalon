import React, { useState } from 'react';

type Props = {
  data: any;
};

export const ExpandableComponent: React.FC<Props> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  const styles = expanded ? {} : { maxHeight: '10vh', overflow: 'hidden' };

  return (
    <div>
      <div style={styles}>
        {data}
      </div>
      <button className={'expandButton'} onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Collapse' : 'Expand'}
      </button>
    </div>
  );
};
