import {ApiResponse, Errors, Response, TokenMap} from "components/models";
import {jwtDecode} from "jwt-decode";
import CryptoJS from 'crypto-js/index';
import moment from "moment";
import {saveAs} from "file-saver";

export function useCommonUtility() {

  const key = 'N3ptun3123*';
  const phonePattern = /^\d{10}$/;
  const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


  function formatToAmount(val: any) {
    if (val === null || val === undefined)
      return Number.parseInt('0').toFixed(1);
    const formattedAmt = Number.parseInt(val).toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    cleanAmount(formattedAmt);
    return formattedAmt;
  }

  function cleanAmount(val: any) {
    const amountWithoutCommas = val.replace(/,/g, '');
    Math.floor(parseFloat(amountWithoutCommas)).toString();
  }

  function formatDate(date: any) {
    if (date == '1998-04-04')
      return '';
    return moment(date).format('DD/MM/YYYY');
  }

  function formatToTimestamp(date: any) {
    if (date == null)
      return '';
    return moment(date).format('DD/MM/YYYY HH:mm:ss A');
  }


  function formatProcessingDate() {
    return moment().format('ddd, MMM DD YYYY');
  }


  function storePasswordChangeFlag(val: string) {
    sessionStorage.setItem('changePasswordFlag', val);
  }

  function removePassword() {
    sessionStorage.removeItem('changePasswordFlag');
  }

  function isPasswordChange() {
    return sessionStorage.getItem('changePasswordFlag') === 'N';
  }

  function getMenuCode() {
    return sessionStorage.getItem('MENU_CODE');
  }



  function getAuthData() {
    return decodeJwt() as TokenMap;
  }

  function decodeJwt() {
    return getTokenData() == null ? null : jwtDecode(getTokenData());
  }

  function encryptData(data: any) {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  function storeAuthData(data: any) {
    const encryptedData = encryptData(data);
    sessionStorage.setItem('authData', encryptedData);
  }

  function getTokenData() {
    const encryptedData = sessionStorage.getItem('authData');
    if (encryptedData == null)
      return null;
    return CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8) as any;
  }

  function saveFile(fileDownLoad:any, fileName:any, exportType:any) {
    let fileEncodeFormat
    if (exportType === 'EXCEL') {
      fileEncodeFormat = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,';
    } else {
      fileEncodeFormat = 'data:application/pdf;base64,';
    }
    let downLoadURL = fileEncodeFormat + fileDownLoad;
    saveAs(downLoadURL, fileName);
  }

  function isAuthenticated() {
    return getAuthData() != null;
  }


  function convertArrayResponseData<T>(responseData: T | T[] | null | undefined): T[] {
    if (responseData == null) {
      return [];
    }
    return Array.isArray(responseData) ? responseData : [responseData];
  }

  function convertResponseMessageObj(response: ApiResponse<any>) {
    let resp = {} as Response
    resp.code = response.response.code;
    resp.message = response.response.message;
    return resp;
  }


  function getError(err: any) {
    if (err.code === 'ERR_NETWORK') {
      return {code: '504', message: Errors.NETWORK_ERROR};
    } else if (err.code === 'ERR_BAD_REQUEST') {

      return {code: '401', message: Errors.BAD_REQUEST};
    } else if (err.code === 'ERR_CONNECTION_RESET') {
      return {code: '500', message: Errors.ERR_CONNECTION_RESET};
    } else if (err.code === 'ERR_CONNECTION_REFUSED') {
      return {code: '500', message: Errors.ERR_CONNECTION_REFUSED};
    } else {
      return {code: '500', message: Errors.SERVER_ERROR};
    }
  }

  return {
    isAuthenticated,
    isPasswordChange,
    getError,
    formatProcessingDate,
    convertResponseMessageObj,
    convertArrayResponseData,
    storeAuthData,
    storePasswordChangeFlag,
    removePassword,
    formatDate,
    getAuthData,
    formatToAmount,
    saveFile
  }
}

