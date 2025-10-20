import { useEffect } from "react";
import PropTypes from "prop-types";

import {
  getAccessToken,
  setAuthRedirectUri,
  setAuthNonce,
  setAuthState,
  isAccessTokenExpired,
  generateRandomString,
} from "@/utils";
import { URI_OAUTH2_LOGIN } from "@/constants/uriConst";

const ProtectedRoute = ({ children }) => {
  const accessToken = getAccessToken();

  const isExpired = isAccessTokenExpired();

  const startLogin = async () => {
    const nonce = generateRandomString(16);
    const state = generateRandomString(16);
    // const codeVerifier = generateRandomString(64);
    setAuthNonce(nonce);
    setAuthState(state);
    // setAuthCodeVerifier(codeVerifier);
    setAuthRedirectUri(window.location.href);

    // const code_challenge = await challengeFromVerifier(codeVerifier);
    window.location.href =
      import.meta.env.VITE_REST_BASE_API +
      URI_OAUTH2_LOGIN.format({
        host: window.location.origin,
        nonce,
        state,
        // code_challenge,
      });
  };

  useEffect(() => {
    if (!accessToken || isExpired) {
      startLogin();
    }
  }, [accessToken, isExpired]);

  return accessToken && !isExpired ? children : null;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

export default ProtectedRoute;
