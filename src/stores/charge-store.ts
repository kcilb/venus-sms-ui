import {defineStore, acceptHMRUpdate} from 'pinia';
import {api} from "boot/axios";
import {reactive, ref} from "vue";
import {
  ApiResponse,
  Response,
  AuthRequest,
  User,
  ChangeRequest,
  Roles,
  ChargeProcessDTO,
  SmsChargeLog
} from "components/models";
import {useCommonUtility} from "src/utility/common";


const utility = useCommonUtility();
export const useChargeStore = defineStore('charges', {
  state: () => ({
    loading: false,
    apiResponse: reactive({} as ApiResponse<any>),
    chargeHistoryList: reactive<SmsChargeLog[]>([]),
    response: reactive({} as Response)
  }),

  getters: {},

  actions: {
    async processSMSCharges(request: ChargeProcessDTO) {
      this.apiResponse = {} as any;
      this.loading = true;
      try {
        await api.post('charges/process-charges', request, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.apiResponse = response.data;
          this.response = utility.convertResponseMessageObj(this.apiResponse);
        });
      } catch (err) {
        throw err;
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 3000);
      }
    },
    async findChargeHistory(request: ChargeProcessDTO) {
      this.apiResponse = {} as any;
      this.loading = true;
      try {
        await api.post('auth/find-charge-history', request, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.apiResponse = response.data;
          this.chargeHistoryList = utility.convertArrayResponseData<SmsChargeLog>(this.apiResponse.data);
          this.response = utility.convertResponseMessageObj(this.apiResponse);
        });
      } catch (err) {
        throw err;
      } finally {
        this.loading = false;
      }
    },
  }

});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChargeStore, import.meta.hot));
}
