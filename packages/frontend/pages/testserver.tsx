import React from 'react';
import Head from 'next/head';
import fetch from 'isomorphic-unfetch';
import { NextPage } from 'next';
import getConfig from 'next/config';

import Nav from '../components/nav';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
const apiUrl = serverRuntimeConfig.apiUrl || publicRuntimeConfig.apiUrl;

type Props = {
  backendResponse: string;
};

const TestServer: NextPage<Props> = ({ backendResponse }: Props) => (
  <div>
    <Head>
      <title>Home</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Nav />

    {backendResponse}
  </div>
);

// For initial server render, we need to go through docker network. Interesting behavior.
TestServer.getInitialProps = async (): Promise<Props> => {
  const res = await fetch(apiUrl);
  const text = await res.text();
  return { backendResponse: JSON.stringify(text) };
};

export default TestServer;
