import axios, { AxiosPromise } from 'axios';
import { LoginDetails } from './types';

const API_ADDRESS = 'http://localhost:3001';

export function get(path: string): AxiosPromise {
  const url = `${API_ADDRESS}${path}`;

  return axios({
    method: 'get',
    url,
    withCredentials: true,
  }).then(resp => resp.data);
}

export function post(path: string, data: LoginDetails): AxiosPromise {
  const url = `${API_ADDRESS}${path}`;

  return axios({
    method: 'post',
    url,
    data,
    withCredentials: true,
  });
};
