import { COLOR_DAY, COLOR_NIGHT } from './colours';

interface Props {
  nightTheme?: boolean;
}

const Lobby = ({ nightTheme }: Props): React.ReactElement => (
  <div className="background">
    Hello World
    <style jsx>
      {`
        .background {
          background-color: ${nightTheme ? COLOR_NIGHT : COLOR_DAY};
          z-index: -1;
        }
    `}
    </style>
  </div>
);

export default Lobby;
