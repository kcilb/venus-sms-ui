import {defineStore, acceptHMRUpdate} from 'pinia';
import {api} from "boot/axios";
import {reactive} from "vue";
import {ApiResponse, Response, AuthRequest, User, ChangeRequest} from "components/models";
import {useCommonUtility} from "src/utility/common";


const utility = useCommonUtility();
export const useAuthStore = defineStore('auth', {
  state: () => ({
    loading: false,
    apiResponse: reactive({} as ApiResponse<any>),
    response: reactive({} as Response)
  }),

  getters: {},

  actions: {
    async login(request: AuthRequest) {
      this.apiResponse = {} as any;
      this.loading = true;
      try {
        await api.post('auth/login', request, {
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
    async reset(request: AuthRequest) {
      this.apiResponse = {} as any;
      this.loading = true;
      try {
        await api.post('auth/resetUserPassword', request, {
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
        this.loading = false;
      }
    },
    async change(request: ChangeRequest) {
      this.loading = true;
      this.response = {} as any;
      try {
        await api.post('auth/change', request, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.response = response.data;
        });
      } catch (err) {
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async resetUserPassword(request: AuthRequest) {
      this.loading = true;
      this.response = {} as any;
      try {
        await api.post('auth/resetUserPassword', request, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.response = response.data;
        });
      } catch (err) {
        throw err;
      } finally {
        this.loading = false;
      }
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
