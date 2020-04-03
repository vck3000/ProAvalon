import getConfig from 'next/config';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
const apiUrl = publicRuntimeConfig.apiUrl || serverRuntimeConfig.apiUrl;
export default apiUrl;
