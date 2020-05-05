import { ReactElement } from 'react';
import { Tab } from 'semantic-ui-react';
import css from 'styled-jsx/css';

const { className, styles } = css.resolve`
  div > :global(.ui.attached.tabular.menu) > :global(.item) {
    font-family: 'Montserrat-Bold';
    background: var(--light-inactive);
    border-radius: 0.75rem 0.75rem 0 0 !important;
    padding: 0 0.75rem;
    margin-right: 4px;
    color: var(--text);
    min-width: 132px;
    justify-content: center;
  }

  div > :global(.ui.attached.tabular.menu) > :global(.active.item) {
    background: var(--light);
    font-weight: 400;
  }

  div > :global(.attached.active.tab) {
    background: var(--light);
  }
`;

const TabPane = (): ReactElement => (
  <>
    <Tab
      className={className}
      panes={[
        {
          menuItem: 'ALL CHAT',
          render: (): ReactElement => <Tab.Pane>All Chat</Tab.Pane>,
        },
        {
          menuItem: 'GAME CHAT',
          render: (): ReactElement => <Tab.Pane>Game Chat</Tab.Pane>,
        },
        {
          menuItem: 'VOTE HISTORY',
          render: (): ReactElement => <Tab.Pane>Vote History</Tab.Pane>,
        },
        {
          menuItem: 'NOTES',
          render: (): ReactElement => <Tab.Pane>Notes</Tab.Pane>,
        },
      ]}
    />
    {styles}
  </>
);

export default TabPane;
