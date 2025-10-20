import React, { useEffect, useState, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";

import {
  generateRandomString,
  challengeFromVerifier,
  parseQueryString,
} from "@/utils";

// ====== CONFIG - replace with your provider values ======
const CLIENT_ID = "exampleClient";
const AUTH_URL =
  "http://localhost:8080/realms/example_realm/protocol/openid-connect/auth";
const TOKEN_URL =
  "http://localhost:8080/realms/example_realm/protocol/openid-connect/token";
const REDIRECT_URI = window.location.origin + "/"; // ensure this matches registered redirect URI
const SCOPES = "openid profile email";
// ========================================================

export default function App() {
  const [accessToken, setAccessToken] = useState(null); // keep in-memory
  const [idToken, setIdToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const refreshTimerRef = useRef(null);

  // Read refresh token from sessionStorage if present
  const getStoredRefresh = () => sessionStorage.getItem("pkce_refresh_token");

  const clearStoredTokens = () => {
    sessionStorage.removeItem("pkce_refresh_token");
    sessionStorage.removeItem("pkce_code_verifier");
    sessionStorage.removeItem("pkce_state");
    sessionStorage.removeItem("pkce_nonce");
  };

  const scheduleRefresh = useCallback((expiresInSec) => {
    // clear previous
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    // refresh a bit earlier (e.g., 60s before expiry or 20% before)
    const ahead = Math.min(60, Math.floor(expiresInSec * 0.2));
    const ms = Math.max(1000, (expiresInSec - ahead) * 1000);
    refreshTimerRef.current = setTimeout(async () => {
      const refresh = getStoredRefresh();
      if (!refresh) {
        console.warn("No refresh token available to refresh");
        setAccessToken(null);
        setIdToken(null);
        return;
      }
      try {
        await refreshTokenFlow(refresh);
      } catch (e) {
        console.error("refresh failed", e);
        setAccessToken(null);
        setIdToken(null);
        clearStoredTokens();
      }
    }, ms);
  }, []);

  // exchange code for tokens
  const tokenExchange = useCallback(
    async (code, codeVerifier) => {
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier,
      });

      const resp = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error("token endpoint error: " + text);
      }
      const tok = await resp.json();
      // tok = { access_token, id_token, refresh_token, expires_in, token_type }
      setAccessToken(tok.access_token);
      setIdToken(tok.id_token);
      if (tok.refresh_token)
        sessionStorage.setItem("pkce_refresh_token", tok.refresh_token);
      if (tok.expires_in) scheduleRefresh(tok.expires_in);
      return tok;
    },
    [scheduleRefresh]
  );

  const refreshTokenFlow = useCallback(
    async (refreshToken) => {
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      });
      const resp = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error("refresh token failed: " + text);
      }
      const tok = await resp.json();
      setAccessToken(tok.access_token);
      setIdToken(tok.id_token);
      if (tok.refresh_token)
        sessionStorage.setItem("pkce_refresh_token", tok.refresh_token);
      if (tok.expires_in) scheduleRefresh(tok.expires_in);
      return tok;
    },
    [scheduleRefresh]
  );

  // Start PKCE login: generate verifier, challenge, state, nonce, save and redirect
  const startLogin = async () => {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await challengeFromVerifier(codeVerifier);
    const state = generateRandomString(16);
    const nonce = generateRandomString(16);

    sessionStorage.setItem("pkce_code_verifier", codeVerifier);
    sessionStorage.setItem("pkce_state", state);
    sessionStorage.setItem("pkce_nonce", nonce);

    const url = new URL(AUTH_URL);
    url.searchParams.set("client_id", CLIENT_ID);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", SCOPES);
    url.searchParams.set("state", state);
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");

    window.location.href = url.toString();
  };

  // Handle callback (if URL contains code)
  useEffect(() => {
    const params = parseQueryString(window.location.search);
    if (params.code) {
      (async () => {
        try {
          const savedState = sessionStorage.getItem("pkce_state");
          if (!params.state || params.state !== savedState) {
            throw new Error("Invalid state");
          }
          const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
          if (!codeVerifier) throw new Error("Missing PKCE verifier");

          const tok = await tokenExchange(params.code, codeVerifier);

          // optionally validate id_token nonce
          const payload = tok.id_token ? jwtDecode(tok.id_token) : null;
          const savedNonce = sessionStorage.getItem("pkce_nonce");
          if (payload && savedNonce && payload.nonce !== savedNonce) {
            console.warn("nonce mismatch");
            // decide whether to treat as fatal
          }

          // Clean up PKCE artifacts in sessionStorage and URL
          sessionStorage.removeItem("pkce_code_verifier");
          sessionStorage.removeItem("pkce_state");
          sessionStorage.removeItem("pkce_nonce");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (e) {
          console.error("PKCE callback handling failed", e);
        }
      })();
    } else {
      // no code in URL: maybe we have refresh token in sessionStorage, try silent refresh
      const refresh = getStoredRefresh();
      if (refresh && !accessToken) {
        // try to refresh to populate access_token on load
        (async () => {
          try {
            await refreshTokenFlow(refresh);
          } catch (e) {
            console.warn("initial refresh failed", e);
            clearStoredTokens();
          }
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch userinfo as example
  const callApi = useCallback(async () => {
    if (!accessToken) return alert("no access token");
    try {
      const r = await fetch("/api/protected", {
        headers: { Authorization: "Bearer " + accessToken },
      });
      if (!r.ok) throw new Error("api returned " + r.status);
      const j = await r.json();
      setUserInfo(j);
    } catch (e) {
      console.error("api call failed", e);
    }
  }, [accessToken]);

  const logout = useCallback(() => {
    setAccessToken(null);
    setIdToken(null);
    setUserInfo(null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    clearStoredTokens();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">
          React PKCE Minimal Example
        </h1>

        {!accessToken ? (
          <div>
            <p className="mb-4">Not authenticated.</p>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white"
              onClick={startLogin}
            >
              Login with PKCE
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Note: refresh token stored in sessionStorage for demo only.
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-2">
              Authenticated. Access token present in memory.
            </p>
            <button
              className="px-4 py-2 rounded bg-green-600 text-white mr-2"
              onClick={callApi}
            >
              Call Protected API
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white"
              onClick={logout}
            >
              Logout
            </button>
            {idToken && (
              <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(jwtDecode(idToken), null, 2)}
              </pre>
            )}
            {userInfo && (
              <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
