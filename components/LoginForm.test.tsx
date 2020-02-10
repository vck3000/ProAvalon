import React from 'react';
import {
  render,
  // fireEvent,
  // waitForElement,
  RenderResult
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import LoginForm, { Props } from './LoginForm';
// import LoginForm from './LoginForm';

const renderLoginForm = (props: Partial<Props> = {}): RenderResult => {
  const defaultProps: Props = {
    onPasswordChange() {
      // Empty
    },
    onRememberChange() {
      // Empty
    },
    onUsernameChange() {
      // Empty
    },
    onSubmit() {
      // Empty
    },
    shouldRemember: true
  };
  // eslint-disable-next-line react/jsx-props-no-spreading
  return render(<LoginForm {...defaultProps} {...props} />);
};

describe('<LoginForm />', () => {
  test('basic', async () => {
    expect(true).toBe(true);
  });

  test('should display a blank login form, with remember me checked by default', async () => {
    const { findByTestId } = renderLoginForm();

    const loginForm = await findByTestId('login-form');

    expect(loginForm).toHaveFormValues({
      username: '',
      password: '',
      remember: true
    });
  });
});

// Continue from this:
// https://www.pluralsight.com/guides/how-to-test-react-components-in-typescript
