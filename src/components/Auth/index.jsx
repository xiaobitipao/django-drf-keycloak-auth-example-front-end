import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import {
  getAuthRedirectUri,
  getAuthNonce,
  setInfo,
  getAuthState,
} from "@/utils";
import api from "@/api";

const Auth = () => {
  const location = useLocation();

  useEffect(() => {
    const getToken = async () => {
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get("code");
      if (code) {
        // React.StrictMode will render the page twice,
        // resulting in the same code being used twice to obtain the token.
        // The code are used for a short period of time after authorization and can only be used once.
        // If the code is used twice or expires, the generated token will be marked as invalid.
        //
        // Therefore, once the nonce is used, it should be deleted. Whether to obtain the token is determined by whether the nonce exists.

        // Verify state
        const state = queryParams.get("state");
        const savedState = getAuthState();
        if (!state || state !== savedState) {
          throw new Error("Invalid state");
        }

        // // Get code verifier
        // const code_verifier = getAuthCodeVerifier();
        // if (!code_verifier) {
        //   throw new Error("Missing PKCE verifier");
        // }

        try {
          const host = window.location.origin;
          // const res = await api.login.getToken({ host, code, code_verifier });
          const res = await api.login.getToken({ host, code });

          // Varify the id_token nonce
          const payload = res.id_token ? jwtDecode(res.id_token) : null;
          const savedNonce = getAuthNonce();
          if (!payload || payload.nonce !== savedNonce) {
            console.warn("nonce mismatch");
            throw new Error("Invalid nonce");
          }

          setInfo(res);

          const redirectUri = getAuthRedirectUri();
          window.location.assign(redirectUri);
        } catch (error) {
          console.error("Error fetching token:", error);
        }
      }
    };
    getToken();
  }, [location]);

  return <div>認証処理を行います。。。</div>;
};

export default Auth;
