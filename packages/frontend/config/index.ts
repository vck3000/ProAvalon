import getConfig from 'next/config';

export const getApiUrl = (): string => {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  // Note: serverRuntimeConfig was required for server side rendering for
  // getInitialProps. This however, conflicts with docker networks and running
  // locally. Therefore, in order for devs to be able to use docker or local
  // server instances at their choice, we shall disable all getInitialProps.
  // If we require this feature in the future, we will discuss it then.
  return serverRuntimeConfig.apiUrl || publicRuntimeConfig.apiUrl;
};

export const getEnv = (): string => {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  return serverRuntimeConfig.env || publicRuntimeConfig.env;
};
