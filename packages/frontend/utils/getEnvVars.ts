import getConfig from 'next/config';

// Checks for production. Each variable must be defined.
if (process.env.ENV === 'production') {
  if (!process.env.BACKEND_URL) {
    throw Error('Environment variable BACKEND_URL was not provided');
  }
}

export const getBackendUrl = (): string => {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  // Note: serverRuntimeConfig was required for server side rendering for
  // getInitialProps. This however, conflicts with docker networks and running
  // locally. Therefore, in order for devs to be able to use docker or local
  // server instances at their choice, we shall disable all getInitialProps.
  // If we require this feature in the future, we will discuss it then.
  return serverRuntimeConfig.apiUrl || publicRuntimeConfig.apiUrl;
};
