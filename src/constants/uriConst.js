/**
 * Http Request URI Const
 */

// ============================================================
// Login
// ============================================================
// Login
// export const URI_OAUTH2_LOGIN =
//   "/oauth2/login?redirect_uri={host}/auth/callback&nonce={nonce}&state={state}&code_challenge={code_challenge}&code_challenge_method=S256";
export const URI_OAUTH2_LOGIN =
  "/oauth2/login?redirect_uri={host}/auth/callback&nonce={nonce}&state={state}";
// Get token
// export const URI_OAUTH2_TOKEN =
//   "/oauth2/token?redirect_uri={host}/auth/callback&code={code}&code_verifier={code_verifier}";
export const URI_OAUTH2_TOKEN =
  "/oauth2/token?redirect_uri={host}/auth/callback&code={code}";
// Refresh token
export const URI_OAUTH2_REFRESH_TOKEN = "/oauth2/refresh/";
