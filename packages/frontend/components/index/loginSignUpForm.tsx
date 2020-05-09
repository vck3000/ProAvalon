import { ReactElement, useState } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { login, signup } from '../../store/user/actions';

interface IProps {
  dispatchLogin: typeof login;
  dispatchSignup: typeof signup;
}

const LoginSignupForm = ({
  dispatchLogin,
  dispatchSignup,
}: IProps): ReactElement => {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });

  const [showLoginForm, setLoginForm] = useState(true);

  const [error, setError] = useState('');

  const checkInputs = (): boolean => {
    if (inputs.username === '') {
      setError('Please provide a username.');
      return false;
    }

    if (inputs.password.length < 4) {
      setError('Password must be at least 4 letters long...');
      return false;
    }

    if (!showLoginForm && inputs.password !== inputs.confirmPassword) {
      setError('Passwords do not match!');
      return false;
    }

    if (!showLoginForm && inputs.email === '') {
      setError('Please provide an email address.');
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    return setInputs(() => ({ ...inputs, [e.target.name]: e.target.value }));
  };

  const loginForm = (
    <>
      <Form
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleInputChange(e)
        }
        onSubmit={(e: React.FormEvent<HTMLFormElement>): void => {
          e.preventDefault();

          if (!checkInputs()) {
            return;
          }

          dispatchLogin({
            username: inputs.username,
            password: inputs.password,
          });
        }}
      >
        <Form.Field>
          <Form.Input
            className="myInput"
            name="username"
            icon="user"
            iconPosition="left"
            placeholder="Username"
          />
        </Form.Field>
        <Form.Field>
          <Form.Input
            name="password"
            icon="lock"
            iconPosition="left"
            placeholder="Password"
            type="password"
          />
        </Form.Field>
        {error !== '' ? <div className="error">{error}</div> : null}
        <Button type="submit" className="login">
          Login
        </Button>
        <div className="signup">
          <a
            onClick={(): void => setLoginForm(!showLoginForm)}
            onKeyPress={(): void => setLoginForm(!showLoginForm)}
            role="button"
            tabIndex={0}
            aria-label="Sign up form"
          >
            Sign up
          </a>
        </div>
      </Form>
      <style jsx>
        {`
          .signup {
            margin-top: 8px;
            cursor: pointer;
          }

          .signup a {
            transition: color 0.1s ease;
            color: var(--gold);
            font-family: Montserrat-Bold;
            text-decoration: underline;
          }

          .signup a:hover {
            color: var(--gold-hover);
          }

          .error {
            color: var(--text-pink);
            padding-bottom: 8px;
            font-family: Montserrat-Bold;
          }
        `}
      </style>
    </>
  );

  const signupForm = (
    <>
      <Form
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleInputChange(e)
        }
        onSubmit={(e: React.FormEvent<HTMLFormElement>): void => {
          e.preventDefault();

          if (!checkInputs()) {
            return;
          }

          dispatchSignup({
            username: inputs.username,
            password: inputs.password,
            email: inputs.email,
          });
        }}
      >
        <Form.Field>
          <Form.Input
            className="myInput"
            name="username"
            icon="user"
            iconPosition="left"
            placeholder="Username"
          />
        </Form.Field>
        <Form.Field>
          <Form.Input
            name="password"
            icon="lock"
            iconPosition="left"
            placeholder="Password"
            type="password"
          />
        </Form.Field>
        <Form.Field>
          <Form.Input
            name="confirmPassword"
            icon="lock"
            iconPosition="left"
            placeholder="Confirm password"
            type="password"
          />
        </Form.Field>
        <Form.Field>
          <Form.Input
            name="email"
            icon="envelope"
            iconPosition="left"
            placeholder="Email"
          />
        </Form.Field>
        {error !== '' ? <div className="error">{error}</div> : null}
        <Button type="submit" className="login">
          Sign up
        </Button>
        <div className="signup">
          <a
            onClick={(): void => setLoginForm(!showLoginForm)}
            onKeyPress={(): void => setLoginForm(!showLoginForm)}
            role="button"
            tabIndex={0}
            aria-label="Login form"
          >
            Login
          </a>
        </div>
      </Form>
      <style jsx>
        {`
          .signup {
            margin-top: 8px;
            cursor: pointer;
          }

          .signup a {
            transition: color 0.1s ease;
            color: var(--gold);
            font-family: Montserrat-Bold;
            text-decoration: underline;
          }

          .signup a:hover {
            color: var(--gold-hover);
          }

          .error {
            color: var(--text-pink);
            padding-bottom: 8px;
            font-family: Montserrat-Bold;
          }
        `}
      </style>
    </>
  );

  return showLoginForm ? loginForm : signupForm;
};

const mapDispatchToProps = {
  dispatchLogin: login,
  dispatchSignup: signup,
};

export default connect(null, mapDispatchToProps)(LoginSignupForm);
