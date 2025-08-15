import {ApiResponse, createDefaultActionData, DealType, Errors, Response, TokenMap} from "components/models";
import {jwtDecode} from "jwt-decode";
import CryptoJS from 'crypto-js/index';
import moment from "moment";

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
    return moment(getAuthData().processDate).format('ddd, MMM DD YYYY');
  }


  function lastLoginDate() {
    if (getAuthData() == null)
      return 'N/A';
    return formatToTimestamp(getAuthData().lastLogonDate);
  }

  function getWhen(): string {
    if (getAuthData() == null) {
      return 'N/A';
    }

    const lastLogonDate = getAuthData().lastLogonDate;
    if (!lastLogonDate) {
      return 'Never logged in';
    }

    const now = moment();
    const loginMoment = moment(lastLogonDate);
    const formattedDate = loginMoment.format('DD/MM/YYYY hh:mm:ss A');

    let narration: string;
    const minutesDiff = now.diff(loginMoment, 'minutes');
    const hoursDiff = now.diff(loginMoment, 'hours');
    const daysDiff = now.diff(loginMoment, 'days');

    if (minutesDiff < 1) {
      narration = 'Just now';
    } else if (minutesDiff < 60) {
      narration = `${minutesDiff} minute(s) ago`;
    } else if (hoursDiff < 24) {
      narration = `${hoursDiff} hour(s) ago`;
    } else if (daysDiff < 7) {
      narration = `${daysDiff} day(s) ago`;
    } else {
      narration = 'A long time ago';
    }

    return `${formattedDate} (${narration})`;
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

  function isAuthenticated() {
    return getAuthData() != null;
  }

  // function generateDealReference(dealType: any) {
  //   const prefixMap = {
  //     PLACEMENT: 'LN',
  //     BORROWING: 'DEP',
  //     FX_SPOT: 'SPT',
  //     FX_SWAP: 'SWP',
  //     FX_FORWARD: 'FWD'
  //   };
  //
  //   const prefix = prefixMap[dealType] || 'DFT/Default';
  //   const randomNum = Math.floor(100000 + Math.random() * 900000);
  //   return `${prefix}-${randomNum}`;
  // }

  function getDefaultDate() {
    return moment(getAuthData().processDate).format('YYYY-MM-DD')
  }


  function convertArrayResponseData<T>(responseData: T | T[] | null | undefined): T[] {
    if (responseData == null) {
      return [];
    }
    return Array.isArray(responseData) ? responseData : [responseData];
  }

  function convertResponseMessageObj(response: ApiResponse<any>) {
    let resp = {} as Response
    resp.code = response.code;
    resp.message = response.message;
    return resp;
  }

  function isResolveActionData(route: string | null, workflowId: number, itemId: number, status: string, dealType: string) {
    const action = createDefaultActionData();

    const isReviewRoute = route === 'review';
    const isSubmittable = route === 'edit' && itemId != null && status === 'Inactive';
    const isEditable = route === 'edit' || route === 'add'
    const stageFlags = {
      APPROVE: isReviewRoute,
      DECLINE: isReviewRoute,
      RETURN: isReviewRoute,
      SUBMIT: isSubmittable,
      EDIT: isEditable
    };

    for (const [key, value] of Object.entries(stageFlags)) {
      action.isStage.set(key, value);
    }

    action.workItemId = Number.parseInt(String(workflowId));
    action.itemId = itemId;
    action.itemDescription = getDescription(dealType);
    action.dealType = dealType;
    return action;
  }

  function getDescription(dealType: string | undefined): string {
    const DEAL_TYPE_DESCRIPTIONS: Record<string, string> = {
      [DealType.FX_FORWARD]: 'FX Forward Submission',
      [DealType.FX_SWAP]: 'FX Swap Submission',
      [DealType.FX_SPOT]: 'FX Spot Submission',
      [DealType.PLACEMENT_BORROWING]: 'Placement and Borrowing Submission',
      [DealType.BORROWING]: 'Borrowing Submission',
      [DealType.T_BILL]: 'Treasury Bill Submission',
      [DealType.T_BOND]: 'Treasury Bond Submission',
    };
    return dealType ? DEAL_TYPE_DESCRIPTIONS[dealType] ?? '' : '';
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
    getError,
    convertArrayResponseData,
    convertResponseMessageObj,
    isResolveActionData,
    storeAuthData,
    getTokenData,
    isAuthenticated,
    isPasswordChange,
    storePasswordChangeFlag,
    removePassword,
    getAuthData,
    formatToTimestamp,
    lastLoginDate,
    getWhen,
    getMenuCode,
    getDefaultDate,
    formatToAmount,
    formatDate,
    formatProcessingDate
  }
}

