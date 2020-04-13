/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosPromise } from 'axios';
import { BACKEND_URL } from '../utils/getEnvVars';

export const Post = (path: string, data: any): AxiosPromise => {
  const url = `${BACKEND_URL}${path}`;

  return axios({
    method: 'post',
    url,
    data,
  });
};
