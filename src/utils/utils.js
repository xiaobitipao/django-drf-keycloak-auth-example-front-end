function __base64UrlEncode(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binaryStr = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryStr += String.fromCharCode(bytes[i]);
  }
  const base64 = window.btoa(binaryStr);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function __sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  return hash;
}

/**
 * Generates a random string of specified digits, which is used as nonce in the authentication process.
 *
 * @param length String length
 * @returns String
 */
function generateRandomString(len = 64) {
  const arr = new Uint8Array(len);
  window.crypto.getRandomValues(arr);
  return __base64UrlEncode(arr);
}

async function challengeFromVerifier(verifier) {
  const hashed = await __sha256(verifier);
  return __base64UrlEncode(hashed);
}

function parseQueryString(qs) {
  const params = new URLSearchParams(qs);
  const obj = {};
  for (const [k, v] of params.entries()) {
    obj[k] = v;
  }
  return obj;
}

export { generateRandomString, challengeFromVerifier, parseQueryString };
