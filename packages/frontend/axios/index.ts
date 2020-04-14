/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosPromise } from 'axios';
import { getBackendUrl } from '../utils/getEnvVars';

export const Post = (path: string, data: any): AxiosPromise => {
  const url = `${getBackendUrl()}${path}`;

  return axios({
    method: 'post',
    url,
    data,
  });
};
