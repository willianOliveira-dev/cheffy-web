import axios, { AxiosRequestConfig, AxiosError } from 'axios';

export class ApiError extends Error {
    public readonly status?: number;
    public readonly data?: unknown;

    constructor(message: string, status?: number, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status;
        const data = error.response?.data;
        const message = error.message || 'Um erro inesperado aconteceu.';

        return Promise.reject(new ApiError(message, status, data));
    },
);

export const customInstance = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig,
): Promise<T> => {
    return axiosInstance({
        ...config,
        ...options,
        withCredentials: true,
    }).then(({ data }) => data);
};

export type ErrorType<TError = unknown> = ApiError & {
    readonly errorPayload?: TError;
};

export type BodyType<Body> = Body;
