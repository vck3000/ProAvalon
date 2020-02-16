import React from 'react';
import Head from 'next/head';
// import { NextPage } from 'next';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

import Nav from '../components/nav';

const Home = (): React.ReactElement => (
  <div>
    <Head>
      <title>Home</title>
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
        crossOrigin="anonymous"
      />
      <link
        href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
        rel="stylesheet"
      />
    </Head>

    <div>
      <img src="/Starsinthesky.jpg" className="background" alt="background" />
      <Nav />

      <div className="center_div">
        <img src="/proavalon.jpg" alt="proavalon" className="logo" />
        <div
          style={{
            fontWeight: 1000,
            fontSize: '200%',
            marginTop: '5px',
          }}
        >
          A GAME OF DECEPTION
        </div>
        <div
          style={{
            transform: 'translate(0%, -35%)',
          }}
        >
          CAN YOU OUTWIT YOUR OPPONENTS?
        </div>
        <div
          style={{
            textAlign: 'justify',
            textJustify: 'inter-word',
            textAlignLast: 'center',
            marginBottom: '25px',
          }}
        >
          This is a free online version of the popular game The Resistance
          (designed by Don Eskridge), wherein a small band of revolutionaries
          must use logic and deduction in order to ferret out the spies who have
          infiltrated their ranks and are sabotaging the cell&apos;s presumably
          heroic acts of rebellion against government tyranny.
        </div>
        <div className="form_wrapper">
          <Form>
            <Form.Group controlId="formUsername">
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faUser} />
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control type="text" placeholder="Username" required />
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="formPassword">
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faLock} />
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control type="password" placeholder="Password" required />
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="formRememberMe">
              <Form.Check type="checkbox" label="Remember me" />
            </Form.Group>

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      </div>
    </div>

    <style jsx>
      {`
        .background {
          pointer-events: none;
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: -1;
        }

        .logo {
          max-width: 275px;
        }

        .center_div {
          color: white;
          max-width: 500px;
          position: relative;
          top: 42%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .form_wrapper {
          max-width: 300px;
          margin: 0 auto;
        }
      `}
    </style>

    <style global jsx>
      {`
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div,
        div#__next > div > div {
          height: 100%;
        }
        body {
          margin: 0px;
        }
      `}
    </style>
  </div>
);

export default Home;
