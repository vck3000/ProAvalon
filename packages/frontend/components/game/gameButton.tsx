import { ReactElement } from 'react';

type Props = {
  text: string;
  type: 'green' | 'red';
  event?: () => void;
};

export const GameButton = ({ text, type, event }: Props): ReactElement => {
  return (
    <>
      <button type="button" className={type} onClick={event}>
        {text}
      </button>
      <style jsx>
        {`
          button {
            display: inline-block;
            padding: 10px 16px;
            margin-bottom: 0;
            font-weight: 400;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            touch-action: manipulation;
            cursor: pointer;
            user-select: none;
            background-image: none;
            border: 1px solid transparent;
            border-radius: 4px;
            font-size: 1rem;

            color: white;
          }

          .green {
            background-color: #5cb85c;
            border-color: #4cae4c;
          }

          .green:focus,
          .green.focus {
            background-color: #449d44;
            border-color: #255625;
          }

          .green:hover {
            background-color: #449d44;
            border-color: #398439;
          }

          .red {
            background-color: #d9534f;
            border-color: #d43f3a;
          }

          .red:focus,
          .red.focus {
            background-color: #c9302c;
            border-color: #761c19;
          }

          .red:hover {
            background-color: #c9302c;
            border-color: #ac2925;
          }
        `}
      </style>
    </>
  );
};
