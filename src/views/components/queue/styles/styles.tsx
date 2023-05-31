import { CSSProperties } from 'react';

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    maxWidth: '30rem',
    maxHeight: '20rem',
    margin: 'auto',
  },
};

const modalElement: CSSProperties = {
  width: '80%',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
}

const btnContainer: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  margin: '1rem 0',
};

const inQueueContainer: CSSProperties = {
  boxShadow: '0 5px 30px #ccc',
  padding: '2rem',
  borderRadius: '5px',
  textAlign: 'center',
};

const centerElement: CSSProperties = {
  textAlign: 'center',
}

const matchMakingHeading: CSSProperties = {
  textAlign: 'center',
  marginBottom: '2rem',
  fontSize: '1.5rem',
};

const loadingContainer: CSSProperties = {
  position: 'relative',
  top: '3rem',
  marginBottom: '70%',
};

const timer: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '18px',
  color: '#000',
  textAlign: 'center',
};

const loadingIcon: CSSProperties = {
  position: 'absolute',
  width: '100px',
  height: '100px',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  margin: '0 auto',
  border: '5px solid #f3f3f3',
  borderTopColor: '#3498db',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const btnRed: CSSProperties = {
  border: 'none',
  backgroundColor: '#C3211A',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
};

const btnGreen: CSSProperties = {
  border: 'none',
  backgroundColor: 'green',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  marginRight: '10px',
};

const timerContainer: React.CSSProperties = {
  width: '100%',
  height: '10px',
  backgroundColor: '#ccc',
  borderRadius: '5px',
  marginBottom: '2rem',
  overflow: 'hidden',
};

const timerBar: React.CSSProperties = {
  height: '100%',
  transition: 'width 1s linear',
  transformOrigin: 'top right',
};

export {
  modalStyles,
  btnContainer,
  inQueueContainer,
  matchMakingHeading,
  timer,
  timerContainer,
  timerBar,
  loadingIcon,
  loadingContainer,
  btnRed,
  btnGreen,
  centerElement,
  modalElement,
};
