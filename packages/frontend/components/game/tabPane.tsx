import { ReactElement, useState } from 'react';

import Chat from '../chat/chatContainer';
import VoteHistory from './voteHistory';

const tabs = [
  { text: 'ALL CHAT', pane: <Chat type="lobby" /> },
  { text: 'GAME CHAT', pane: <Chat type="game" /> },
  { text: 'VOTE HISTORY', pane: <VoteHistory /> },
  { text: 'NOTES', pane: <>Notes</> },
];

const TabPane = (): ReactElement => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <ul>
        {tabs.map(({ text }, index) => (
          <li key={text}>
            <a
              onClick={(): void => setActiveTab(index)}
              onKeyPress={(): void => setActiveTab(index)}
              tabIndex={0}
              role="button"
              style={
                index === activeTab
                  ? {
                      background: 'var(--light)',
                    }
                  : undefined
              }
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
      <div className="pane">{tabs[activeTab].pane}</div>
      <style jsx>
        {`
          div {
            height: 100%;
            display: flex;
            flex-flow: column;
          }

          div.pane {
            background: var(--light);
          }

          ul {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
          }

          li {
            margin-right: 4px;
            max-width: 132px;
            flex: 1 0 auto;
          }

          a {
            display: flex;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: bold;
            background: var(--light-inactive);
            border-radius: 0.75rem 0.75rem 0 0 !important;
            padding: 0.75rem;
            color: var(--text);
            cursor: pointer;
          }
        `}
      </style>
    </div>
  );
};

export default TabPane;
