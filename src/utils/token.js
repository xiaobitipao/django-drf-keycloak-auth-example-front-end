import dayjs from "dayjs";

const setAccessToken = (token) => {
  localStorage.setItem("access_token", token);
};

const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

const setAuthRedirectUri = (uri) => {
  return localStorage.setItem("auth_redirect_uri", uri);
};

const getAuthRedirectUri = () => {
  return localStorage.getItem("auth_redirect_uri");
};

const setAuthNonce = (payload) => {
  return localStorage.setItem("auth_nonce", payload);
};

const getAuthNonce = () => {
  const data = localStorage.getItem("auth_nonce");
  localStorage.removeItem("auth_nonce");
  return data;
};

const setAuthState = (payload) => {
  return localStorage.setItem("auth_state", payload);
};

const getAuthState = () => {
  const data = localStorage.getItem("auth_state");
  localStorage.removeItem("auth_state");
  return data;
};

const setAuthCodeVerifier = (payload) => {
  return localStorage.setItem("auth_code_verifier", payload);
};

const getAuthCodeVerifier = () => {
  const data = localStorage.getItem("auth_code_verifier");
  localStorage.removeItem("auth_code_verifier");
  return data;
};

const isAccessTokenExpired = () => {
  const expiresAt = localStorage.getItem("expires_at");
  if (!expiresAt) {
    return false;
  }
  try {
    const now = dayjs();
    const expirationDate = dayjs((expiresAt - 60) * 1000);
    return expirationDate.isBefore(now) ? true : false;
  } catch {
    return false;
  }
};

const getUserInfo = () => {
  const default_info = {
    displayName: "Unknown",
    emailAddress: "Unknown",
  };
  try {
    // display_name/email_address/uid/avatar
    const info = JSON.parse(localStorage.getItem("userinfo"));
    if (info === null) {
      return default_info;
    }
    return info;
  } catch {
    return default_info;
  }
};

const setInfo = (res) => {
  // Response format:
  //
  // {
  //   "access_token": "access_token",
  //   "refresh_token": "refresh_token",
  //   "scope": "openid profile email",
  //   "grant_id": "grant_id",
  //   "id_token": "id_token",
  //   "token_type": "Bearer",
  //   "expires_in": 7199,
  //   "expires_at": 1729050309,
  //   "userinfo": {
  //     "displayName": "Jirou Tanaka",
  //     "emailAddress": "jirou@ibm.com",
  //     "uid": "12345678",
  //     "avatar": "https://w3-unifiedprofile-api.dal1a.cirrus.ibm.com/v3/image/12345678"
  //   }
  // }
  const { access_token, id_token, refresh_token, expires_at, userinfo } = res;
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("id_token", id_token);
  localStorage.setItem("refresh_token", refresh_token);
  localStorage.setItem("expires_at", expires_at); // seconds, not millisecond
  if (userinfo) {
    localStorage.setItem("userinfo", JSON.stringify(userinfo));
  }
};

const removeInfo = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("id_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("expires_at");
  localStorage.removeItem("userinfo");
};

export {
  setAccessToken,
  getAccessToken,
  getRefreshToken,
  setAuthRedirectUri,
  getAuthRedirectUri,
  setAuthNonce,
  getAuthNonce,
  setAuthCodeVerifier,
  getAuthCodeVerifier,
  setAuthState,
  getAuthState,
  isAccessTokenExpired,
  getUserInfo,
  setInfo,
  removeInfo,
};
