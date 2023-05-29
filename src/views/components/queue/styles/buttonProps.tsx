import React from 'react';

type ButtonId = 'rankBtn' | 'unrankBtn';

interface ButtonProps {
  button: ButtonId;
  clickedButton: ButtonId | null;
  buttonsDisabled: boolean;
  handleClick: (button: ButtonId) => void;
}

const ButtonProps = ({
  button,
  clickedButton,
  buttonsDisabled,
  handleClick,
}: ButtonProps): React.ButtonHTMLAttributes<HTMLButtonElement> => {
  const style: React.CSSProperties = { backgroundColor: 'transparent' };

  if (clickedButton === button) {
    style.backgroundColor = 'yellow';
  }
  if (buttonsDisabled) {
    style.backgroundColor = 'transparent';
    style.cursor = 'not-allowed';
  }

  const props: React.ButtonHTMLAttributes<HTMLButtonElement> = {
    style,
    onClick: () => handleClick(button),
    disabled: (clickedButton && clickedButton !== button) || buttonsDisabled,
  };

  return props;
};

export default ButtonProps;
