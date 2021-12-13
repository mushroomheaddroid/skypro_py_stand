import { updateToken } from "../api/auth";
import { getCookie, setCookie } from "./cookies";

export const tokenChecker = (error) => {
  const accessToken = getCookie("AccessToken");
  const refreshToken = getCookie("RefreshToken");

  if (error?.response?.status === 401 && accessToken && refreshToken) {
    console.log("Trying to refresh token");
    tokenUpdater();
    document.location.reload();
  } else {
    console.error("No tokens were founded", error.response);
    window.location = "/login";
  }
};

export const isTokenExpired = () => {
  console.log(getJWTData().exp, new Date()/1000)
  return getJWTData().exp < new Date()/1000;
};

export const tokenObserver = () => {
  window.interval = setInterval(() => {
    if (getJWTData().exp - new Date()/1000 < 10) {
      tokenUpdater()
    }
  }, 1000);
}

const tokenUpdater = () => {
  const accessToken = getCookie("AccessToken");
  const refreshToken = getCookie("RefreshToken");

  updateToken({access_token: accessToken, refresh_token: refreshToken})
    .then(res => {
      setCookie("AccessToken", res.data.access_token, { 'max-age': 3600 * 24 * 7 });
      setCookie("RefreshToken", res.data.refresh_token, { 'max-age': 3600 * 24 * 7 });
    })
    .catch(error => {
      console.error("Token refresh unsuccessful", error.response);
      window.location = "/login";
    })
}

export const getJWTData = () => {
  const token = getCookie("AccessToken");
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};