/**
 * Config axios
 */

import axios from "axios";
import { message } from "antd";

import { getAccessToken, getRefreshToken, setInfo } from "./token";
import api from "@/api";

let isRefreshingAccessToken = false;

let pendingRequests = [];

const redirectToHomePage = () => {
  window.location.href = "/";
};

const http = axios.create({
  baseURL: import.meta.env.VITE_REST_BASE_API,
  timeout: 30 * 1000,
});

http.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    // 2xx
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    // 2xx 以外
    if (!error.response) {
      // 1. timeout
      // code:    ECONNABORTED
      // message: timeout of 1000ms exceeded
      //
      // 2. server not start
      // code:    ERR_NETWORK
      // message: Network Error
      message.error(error.message);
      return Promise.reject(error);
    } else if (error.response.status === 403) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // If there is no refresh token, jump to the home page and perform SSO authentication
        redirectToHomePage();
        return Promise.reject("No refresh token, redirecting to home page");
      }

      if (isRefreshingAccessToken) {
        // If there are other requests refreshing the token, return a Promise to wait for the refresh to complete
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        })
          .then((accessToken) => {
            // Add the new access token to the header of the original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshingAccessToken = true;

      try {
        // Refresh access token
        const res = await api.login.refreshAccessToken(refreshToken);

        // Set access_token, refresh_token and other values to local storage
        setInfo(res);

        // Add the new access token to all pending requests
        const newAccessToken = getAccessToken();
        pendingRequests.forEach((request) => request.resolve(newAccessToken));

        // Clear pending requests
        pendingRequests = [];

        // Add the new access token to the header of the original request
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Resend the last failed request
        return http(originalRequest);
      } catch (error) {
        // If the refresh token fails,
        // clear the pending requests and jump to the home page
        pendingRequests.forEach((request) => request.reject(error));
        pendingRequests = [];
        redirectToHomePage();
        return Promise.reject(error);
      } finally {
        isRefreshingAccessToken = false;
      }
    } else if (error.response.status === 422) {
      // Validate error
      const validationErrorMsg = error.response.data?.errors;
      if (validationErrorMsg) {
        message.error({
          content: [
            ...new Set(
              validationErrorMsg.map((error) => {
                if (error.field) {
                  return `${error.field}:${error.msg}`;
                }
                return error.msg;
              })
            ),
          ].join("\n"),
          style: { whiteSpace: "pre-line" },
        });
      }
      return Promise.reject(error);
    }

    const errorMsg = error?.response?.data?.detail;
    if (errorMsg) {
      message.error(errorMsg);
    } else {
      message.error(error.message);
    }

    return Promise.reject(error);
  }
);

export { http };