import { http } from "@/utils";
import {
  URI_OAUTH2_TOKEN,
  URI_OAUTH2_REFRESH_TOKEN,
} from "@/constants/uriConst";

const getToken = ({ host, code, code_verifier }) => {
  return http.get(URI_OAUTH2_TOKEN.format({ host, code, code_verifier }));
};

const refreshAccessToken = (refresh_token) => {
  return http.post(URI_OAUTH2_REFRESH_TOKEN, { refresh_token });
};

export { getToken, refreshAccessToken };
