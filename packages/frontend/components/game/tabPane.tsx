import { ReactElement, useState } from 'react';

import AllChat from '../chat/allChat';

const tabs = [
  {
    text: 'ALL CHAT',
    pane: <AllChat />,
  },
  {
    text: 'GAME CHAT',
    pane: 'Game Chat',
  },
  {
    text: 'VOTE HISTORY',
    pane: 'Vote History',
  },
  {
    text: 'NOTES',
    pane: 'Notes',
  },
];

const TabPane = (): ReactElement => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <ul>
        {tabs.map(({ text }, index) => (
          <li>
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
      {tabs[activeTab].pane}
      <style jsx>
        {`
          div {
            height: 100%;
            display: flex;
            flex-flow: column;
          }

          ul {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
          }

          li {
            margin-right: 4px;
            min-width: 132px;
          }

          a {
            display: flex;
            justify-content: center;
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
