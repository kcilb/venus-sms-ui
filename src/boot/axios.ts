import {defineBoot} from '#q-app/wrappers';
import axios, {type AxiosInstance} from 'axios';
import {useCommonUtility} from "src/utility/common";

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
//172.16.13.6
const api = axios.create({baseURL: 'http://localhost:8081/apis/v2/'});

export default defineBoot(({app}) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});


const excludedPaths = ['/login', '/reset', '/password-change'];
const utility = useCommonUtility();

api.interceptors.request.use(function (config) {
  //const token = utility.getTokenData();
  const shouldExclude = excludedPaths.some((path) =>
    config.url?.startsWith(path)
  );

  if (!shouldExclude) {
    let username = "neptune";
    let password = "p@ssw0rd";
    if (username && password) {
      const credentials = `${username}:${password}`;
      const base64Credentials = btoa(credentials);
      config.headers.Authorization = `Basic ${base64Credentials}`;
    }
  }
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
}, function (error) {
  return Promise.reject(error);
});

export {api};
