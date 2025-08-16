export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export enum Errors {
  BAD_REQUEST = 'Invalid request / Endpoint',
  NETWORK_ERROR = 'A network error occurred while making request',
  SERVER_ERROR = 'A application error occurred, please contact administrator',
  UNAUTHORIZED = 'User session has Expired.',
  UNAUTHORIZED_ACCESS = 'Expired session',
  ERR_CONNECTION_RESET = 'Connection reset error',
  ERR_CONNECTION_REFUSED = 'Failed to establish connection',
  ERR_CONNECTION_TIMEOUT = 'Connection timed out while making request'
}


export interface TokenMap {
  processDate: string | null;
  employeeId: number | null;
  roleDescr: string | null;
  branchDesc: string | null;
  employeeName: string | null;
  pwdExpiryDate: string | null;
  passwordChanged: 'Y' | 'N';
  loginLimits: string | null;
  minPwdLength: string | null;
  lastLogonDate: string | null;
  emailAddress: string | null;
  loginId: string | null;
  branchId: number | null;
  branchNo: number | null;
  emplNo: string | null;
  userRoleId: number | null;
  status: string | null;
  gender: string | null;
}

export interface AuthRequest {
  userName: string | null;
  password: string | null;
  emailAddress: string | null;
  employeeId: number;
  deviceId: string | null;
  status: string | null;
  token: string | null;
}

export interface ChangeRequest {
  userName: string | null;
  password: string | null;
  emailAddress: string | null;
  employeeId: number;
  oldPassword: string | null;
  newPassword: string | null;
  confirmPassword: string | null;
}


export interface Response {
  code: string | null;
  message: string | null;
}

export interface ApiResponse<T> {
  data: T | T[] | null;
  response: Response
}

export interface SmsAlertCurrency {
  smsAlertCrncyId: number | null;
  crncyIso: string | null;
  crncyId: number | null;
  crncyNm: string | null;
  status: 'A' | 'I';
  createdBy: string | null;
  createDt: string | null;
  modifiedBy: string | null;
  modifyDt: string | null;
}

export interface User {
  userId?: number | null;
  loginId?: string | null;
  employeeNumber?: string | null;
  customerNo?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  allowMultipleSessions?: string | null;
  emailAddress?: string | null;
  branchId?: number | null;
  userRoleId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  failedLoginAttempts?: number | null;
  status?: string | null;
  passwordChangedFlag?: string | null;
  passwordExpiryDate?: string | null;
  lastLogonDate?: string | null;
  createdBy?: string | null;
  createDate?: string | null;
  modifiedBy?: string | null;
  modifyDate?: string | null;
  itemUuid?: string | null;
}

export interface Roles {
  userRoleId?: number | null;
  description?: string | null;
  maximumFailedLogins: string | null;
  daysForPasswordChange: string | null;
  status?: string | null;
  createdBy?: string | null;
  createDate?: string | null;
  modifiedBy?: string | null;
  modifyDate?: string | null;
  itemUuid?: string | null;
}

export interface ChargeTiers {
  id: number | null; // Payment Type ID (can be number or UUID string)
  smsAlertCrncyId: number | null;
  chargeDesc: string;    // Description of the charge
  txnType: string;      // Transaction type (e.g., 'DEPOSIT', 'WITHDRAWAL')
  minValue: number;     // Minimum applicable value
  maxValue: number;     // Maximum applicable value
  vendorCharge: number; // Charge amount for vendor
  bankCharge: number;   // Charge amount for bank
  exciseCharge: number; // Government excise charge
  status: 'A';
  modifiedBy: string;   // User who last modified
  modifiedDate: string | string; // Can be Date object or ISO string
}

export interface ChargeTierDTO{
  chargeTiers: ChargeTiers[];
  smsAlertCrncyId: number | null;
  isRemove: boolean;
}

export interface ChargeTierRequest {
  smsAlertCrncyId: number;
  tiers: ChargeTiers[];
  isEdit: boolean;
}
