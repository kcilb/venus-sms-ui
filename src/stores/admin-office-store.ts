import {acceptHMRUpdate, defineStore} from "pinia";
import {reactive, ref} from "vue";
import {
  ApiResponse,
  Response, Roles,
  User
} from "components/models";
import {api} from "boot/axios";
import {useCommonUtility} from "src/utility/common";


const utility = useCommonUtility();
export const useAdminOfficesStore = defineStore('admin', {
  state: () => ({
    loading: false,
    apiResponse: reactive({} as ApiResponse<any>),
    response: reactive({} as Response),

    userList: reactive<User[]>([]),
    userData: ref<User>({} as User),

    roleList: reactive<Roles[]>([]),
    roleData: ref<Roles>({} as Roles),

  }),

  getters: {},

  actions: {

    async findUser(request: User) {
      this.apiResponse = {} as any;
      this.userList = [];
      this.loading = true;
      try {
        await api.post('admin/find-user', request, {
          headers: {'Content-Type': 'application/json'}
        }).then(response => {
          this.apiResponse = response.data;
          this.userList = utility.convertArrayResponseData<User>(this.apiResponse.data);
          this.response = utility.convertResponseMessageObj(this.apiResponse);
        });
      } catch (err) {
        throw err;
      } finally {
        this.loading = false;
      }
    },


    async findUserByUUID(request: User) {
      this.apiResponse = {} as any;
      this.loading = true;
      try {
        await api.post('admin/find-user-by-uuid', request, {
          headers: {'Content-Type': 'application/json'}
        }).then(response => {
          this.apiResponse = response.data;
          this.userData = this.apiResponse.data;
          this.response = utility.convertResponseMessageObj(this.apiResponse);
        });
      } catch (err) {
        throw err;
      } finally {
        this.loading = false;
      }
    },


    async maintainUser(request: User) {
      this.apiResponse = {} as any;
      this.loading = true;
      request.createdBy = utility.getAuthData().loginId;
      request.modifiedBy = utility.getAuthData().loginId;
      try {
        await api.post('admin/maintain-user', request, {
          headers: {'Content-Type': 'application/json'}
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


    async findRoles(request: Roles) {
      this.apiResponse = {} as any;
      this.roleList = [];
      this.loading = true;
      try {
        await api.post('admin/find-user-role', request, {
          headers: {'Content-Type': 'application/json'}
        }).then(response => {
          this.apiResponse = response.data;
          this.roleList = utility.convertArrayResponseData<Roles>(this.apiResponse.data);
          this.response = utility.convertResponseMessageObj(this.apiResponse);
        });
      } catch (err) {
        throw err;
      } finally {
        this.loading = false;
      }
    },


    async findRoleByUUID(request: User) {
      this.apiResponse = {} as any;
      this.loading = true;
      try {
        await api.post('admin/find-user-role-by-uuid', request, {
          headers: {'Content-Type': 'application/json'}
        }).then(response => {
          this.apiResponse = response.data;
          this.roleData = this.apiResponse.data;
          this.response = utility.convertResponseMessageObj(this.apiResponse);
        });
      } catch (err) {
        throw err;
      } finally {
        this.loading = false;
      }
    },


    async maintainRole(request: Roles) {
      this.apiResponse = {} as any;
      this.loading = true;
      request.createdBy = utility.getAuthData().loginId;
      request.modifiedBy = utility.getAuthData().loginId;
      try {
        await api.post('admin/maintain-user-role', request, {
          headers: {'Content-Type': 'application/json'}
        }).then(response => {
          this.response = response.data;
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
  import.meta.hot.accept(acceptHMRUpdate(useAdminOfficesStore, import.meta.hot));
}
