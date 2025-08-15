<template>
  <q-card bordered flat style="background: none" class="q-ma-lg">
    <q-card class="col-12" flat>
      <q-toolbar class="q-pa-sm text-h6 bg-grey-4">
        USER
      </q-toolbar>
      <q-card-section>
        <q-form ref="userForm" @submit.prevent="onSaveUser">
          <div class="row q-col-gutter-md col-lg-12 col-md-12 col-sm-12">
            <div class="col-md-4">
              <q-input label="First Name" outlined
                       :rules="[v => !!v || 'First name is required']"
                       v-model="form.firstName"></q-input>
            </div>
            <div class="col-md-4">
              <q-input label="Middle Name"
                       outlined v-model="form.middleName"></q-input>
            </div>
            <div class="col-md-4">
              <q-input label="Last Name"
                       :rules="[v => !!v || 'Last name is required']"
                       outlined v-model="form.lastName"></q-input>
            </div>
            <div class="col-md-4">
              <q-input :filled="form.userId != undefined" :readonly="form.userId != undefined"
                       label="Login Name"
                       :rules="[v => !!v || 'Login name is required']"
                       outlined v-model="form.loginId"></q-input>
            </div>
            <div class="col-md-4">
              <q-input
                label="Employee Number"
                :rules="[v => !!v || 'Employee no is required']"
                outlined v-model="form.employeeNumber"></q-input>
            </div>
            <div class="col-md-4">
              <q-input label="Email Address"
                       :rules="[v => !!v || 'Email is required']"
                       outlined v-model="form.emailAddress"></q-input>
            </div>
            <div class="col-md-4">
              <q-select outlined label="Gender"
                        map-options
                        :rules="[v => !!v || 'Gender is required']"
                        :options="['Male','Female']"
                        emit-value
                        dropdown-icon="expand_more" v-model="form.gender">

              </q-select>
            </div>
            <div class="col-md-4">
              <q-input type="number" label="Failed Logins"
                       input-style="text-align:right"
                       outlined v-model="form.failedLoginAttempts"></q-input>
            </div>
            <div class="col-md-4">
              <q-select outlined label="Role"
                        map-options
                        :rules="[v => !!v || 'Role is required']"
                        :options="roleList"
                        option-label="description"
                        option-value="userRoleId"
                        emit-value
                        dropdown-icon="expand_more" v-model="form.userRoleId">

              </q-select>
            </div>
            <div class="col-md-4">
              <q-checkbox
                v-model="form.allowMultipleSessions"
                label="Allow Multiple Sessions"
                true-value="Y"
                false-value="N"
              />
            </div>
            <div class="col-md-4">
              <q-select outlined label="Status"
                        map-options
                        :rules="[v => !!v || 'Status is required']"
                        :options="statusList"
                        emit-value
                        dropdown-icon="expand_more" v-model="form.status">

              </q-select>
            </div>
          </div>
          <div class="row q-pa-md q-gutter-sm justify-end">
            <q-btn
              :loading="adminStore.loading"
              type="submit" size="13px"
              no-caps color="positive">
              Save
            </q-btn>
            <q-btn size="13px"
                   v-if="form.userId != undefined"
                   :loading="authStore.loading"
                   @click="onClickResetPassword"
                   no-caps color="positive">
              Reset Password
            </q-btn>
            <q-btn size="13px" no-caps @click.prevent="router.go(-1)" color="red-5">
              Close
            </q-btn>
          </div>
        </q-form>


      </q-card-section>

    </q-card>
  </q-card>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue';
import moment from 'moment';
import {useRoute, useRouter} from 'vue-router';
import {AuthRequest, Roles, User} from "components/models";
import {useAdminOfficesStore} from "stores/admin-office-store";
import {useAuthStore} from "stores/auth-store";
import {useCommonUtility} from "src/utility/common";
import {useAlerts} from "src/utility/alerts";

const router = useRouter();
const route = useRoute();
const adminStore = useAdminOfficesStore();
const alerts = useAlerts();
const authStore = useAuthStore();
const utility = useCommonUtility();


onMounted(() => {
  findRoles();
  findUserByUUID(route.params.id);
});


const form = ref<User>({
  userId: null,
  loginId: '',
  employeeNumber: null,
  customerNo: null,
  firstName: null,
  middleName: null,
  lastName: null,
  gender: null,
  allowMultipleSessions: 'N',
  emailAddress: null,
  branchId: 1,
  userRoleId: null,
  startDate: null,
  endDate: null,
  failedLoginAttempts: 0,
  status: null,
  passwordChangedFlag: null,
  passwordExpiryDate: null,
  lastLogonDate: null,
  createdBy: 'TEST',
  createDate: null,
  modifiedBy: 'TEST',
  modifyDate: null,
  itemUuid: null
});


const statusList = ref(['Active', 'Inactive']);


const roleList = computed(() => {
  return adminStore.roleList.filter(f => f.status == 'Active');
});


watch(form.value, () => {
  form.value.loginId = form.value.loginId?.toUpperCase()
})


async function findRoles() {
  try {
    let request = {} as Roles;
    await adminStore.findRoles(request);
    if (adminStore.response.code !== '00') {
      // alerts.showAlert(adminStore.response);
      return;
    }
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}


async function findUserByUUID(uuid: string) {
  if (uuid == undefined)
    return;
  try {
    let request = {} as User;
    request.itemUuid = uuid;
    await adminStore.findUserByUUID(request);
    if (adminStore.response.code !== '00') {
      alerts.showAlert(adminStore.response);
      return;
    }
    populateForm(adminStore.userData);
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

function populateForm(data: User) {
  form.value = {
    ...form.value,
    ...data,
    createDate: null,
    modifyDate: null
  };
}


async function onSaveUser() {
  try {
    let request = {} as User;
    request = form.value;
    await adminStore.maintainUser(request);
    if (adminStore.response.code !== '00') {
      alerts.showAlert(adminStore.response);
      return;
    }
    router.go(-1);
    alerts.showAlert(adminStore.response);

  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}


async function onClickResetPassword() {
  try {
    let request = {} as AuthRequest;
    request.userName = form.value.loginId;
    await authStore.resetUserPassword(request);
    if (authStore.response.code !== '00') {
      alerts.showAlert(authStore.response);
      return;
    }
    alerts.showAlert(authStore.response);
    router.go(-1);

  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}
</script>

<style scoped>

</style>
