import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IBaseResponse } from './IResponse';

const DEFAULT_TIMEOUT = 10000; // 5 seconds
const MAX_RETRIES = 3;

export const restClientWithHeaders = async <T extends IBaseResponse>(
  method: AxiosRequestConfig['method'],
  url: string,
  payload?: object,
  headers?: AxiosRequestConfig['headers'],
): Promise<T> => {
  const config: AxiosRequestConfig = {
    method,
    url,
    data: payload,
    headers,
    timeout: DEFAULT_TIMEOUT,
    maxRedirects: 5, // Prevent infinite redirects
  };

  const retryRequest = async (attempt: number = 1): Promise<AxiosResponse> => {
    try {
      return await axios(config);
    } catch (error: unknown) {
      if ((error as Error) && attempt < MAX_RETRIES) {
        return retryRequest(attempt + 1);
      } else {
        throw error;
      }
    }
  };

  try {
    const response: AxiosResponse = await retryRequest();
    return response.data as T;
  } catch (error: unknown) {
    if ((error as Error).message === 'Network Error') {
      throw new Error('Unable to connect to the server. Please try again later.');
    }
    return {
      status: 'error',
      success: false,
    } as T;
  }
};
