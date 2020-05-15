import { ReactElement, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useDispatch } from 'react-redux';
import css from 'styled-jsx/css';

import { login, signup } from '../../store/user/actions';
import Icon from '../icon';

const { styles, className } = css.resolve`
  form {
    display: flex;
    flex-flow: column;
    min-width: 200px;
  }

  input {
    border: none;
    border-radius: 0.25rem;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  div {
    color: var(--text-pink);
    font-weight: bold;
  }
`;

const Error = ({ name }: { name: string }): ReactElement => (
  <ErrorMessage name={name}>
    {(message): ReactElement => <div className={className}>{message}</div>}
  </ErrorMessage>
);

const LoginSignupForm = (): ReactElement => {
  const dispatch = useDispatch();

  const [showLoginForm, setLoginForm] = useState(true);

  return (
    <>
      <Formik
        initialValues={{
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
        }}
        validate={(values): Partial<typeof values> => {
          const errors: Partial<typeof values> = {};

          if (!values.username) {
            errors.username = 'Required';
          }

          if (values.password.length < 4) {
            errors.password = 'Password must be at least 4 characters long';
          }

          if (showLoginForm) return errors;

          if (values.password !== values.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
          }

          if (!values.email) {
            errors.email = 'Required';
          }

          return errors;
        }}
        onSubmit={(values, { setSubmitting }): void => {
          if (showLoginForm) {
            dispatch(
              login({
                username: values.username,
                password: values.password,
              }),
            );
          } else {
            dispatch(
              signup({
                username: values.username,
                password: values.password,
                email: values.email,
              }),
            );
          }

          setSubmitting(false);
        }}
      >
        {({ isSubmitting }): ReactElement => (
          <Form className={className}>
            <span>
              <Field
                name="username"
                placeholder="Username"
                className={className}
              />
              <Icon name="user" />
            </span>
            <Error name="username" />
            <span>
              <Field
                type="password"
                name="password"
                placeholder="Password"
                className={className}
              />
              <Icon name="lock" />
            </span>
            <Error name="password" />
            {!showLoginForm && (
              <>
                <span>
                  <Field
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className={className}
                  />
                  <Icon name="lock" />
                </span>
                <Error name="confirmPassword" />
                <span>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email"
                    className={className}
                  />
                  <Icon name="envelope" />
                </span>
                <Error name="email" />
              </>
            )}
            <button type="submit" disabled={isSubmitting}>
              {showLoginForm ? 'Login' : 'Sign up'}
            </button>
            <button
              className="inverse"
              onClick={(): void => setLoginForm(!showLoginForm)}
              onKeyPress={(): void => setLoginForm(!showLoginForm)}
              type="button"
              tabIndex={0}
              aria-label="Sign up form"
            >
              {showLoginForm ? 'Sign up' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>
      {styles}
      <style jsx>
        {`
          button {
            background: var(--gold);
            color: var(--text);
            border: none;
            border-radius: 0.25rem;
            width: 100%;
            padding: 0.75rem 1.5rem;
            font-weight: bold;
            cursor: pointer;
            margin-top: 1rem;
          }

          button:hover {
            background: var(--gold-hover);
          }

          button:disabled {
            background: var(--gold-light);
            cursor: not-allowed;
          }

          button.inverse {
            border: 1px solid var(--gold);
          }

          button.inverse:not(:hover) {
            background: none;
            color: var(--gold);
          }

          span {
            position: relative;
            fill: var(--text-gray-light);
          }

          span:not(:first-child) {
            margin-top: 1rem;
          }

          span > :global(svg) {
            position: absolute;
            height: 1rem;
            top: 0.75rem;
            left: 0.875rem;
          }
        `}
      </style>
    </>
  );
};

export default LoginSignupForm;
