<template>
  <q-card bordered flat style="background: none" class="q-ma-lg">
    <q-card class="col-12" flat>
      <q-toolbar class="q-pa-sm text-h6 bg-grey-4">
        ROLE
      </q-toolbar>
      <q-card-section>
        <div class="row q-pb-md justify-end">
          <q-btn size="13px" :disabled="form.userRoleId == undefined" no-caps color="positive">Access Rights</q-btn>
        </div>

        <q-form ref="roleForm" @submit.prevent="onSaveRole">
          <div class="row q-col-gutter-md col-lg-12 col-md-12 col-sm-12">
            <div class="col-md-4">
              <q-input label="Role Description" outlined v-model="form.description"
                       :rules="[v => !!v || 'Description']"
              ></q-input>
            </div>
            <div class="col-md-4">
              <q-input label="Maximum failed logins" outlined
                       type="number"
                       input-style="text-align:right"
                       :rules="[v => !!v || 'Maximum failed logins']"
                       v-model="form.maximumFailedLogins"></q-input>
            </div>

            <div class="col-md-4 ">
              <q-input v-model="form.daysForPasswordChange"
                       :rules="[v => !!v || 'Days for change is required']"
                       outlined
                       input-style="text-align:right"
                       type="number"
                       label="Days for Password Change"/>
            </div>

            <div class="col-md-4">
              <q-select outlined label="Status"
                        map-options
                        :options="statusList"
                        emit-value
                        :rules="[v => !!v || 'Status is required']"
                        dropdown-icon="expand_more" v-model="form.status">

              </q-select>
            </div>
          </div>
          <div class="row q-pa-md q-gutter-sm justify-end">
            <q-btn no-caps type="submit" size="13px"
                   :loading="adminStore.loading"
                   color="positive">
              Save
            </q-btn>
            <q-btn size="13px" no-caps @click="router.go(-1)" color="red-5">
              Close
            </q-btn>
          </div>

        </q-form>


      </q-card-section>

    </q-card>
  </q-card>

</template>

<script setup lang="ts">


import {computed, onMounted, reactive, ref} from 'vue';
import {useRoute, useRouter} from "vue-router";
import {Roles, User} from "components/models";
import {useAdminOfficesStore} from "stores/admin-office-store";
import {useCommonUtility} from "src/utility/common";
import {useAlerts} from "src/utility/alerts";



const router = useRouter();
const route = useRoute();
const adminStore = useAdminOfficesStore();
const alerts = useAlerts();
const utility = useCommonUtility();


onMounted(() => {
  findRoleByUUID(route.params.id);
})

const statusList = ref(['Active', 'Inactive']);
const roleForm = ref();


const form = ref<Roles>({
  userRoleId: null as number | null,
  description: null as string | null,
  maximumFailedLogins: 1 as string | null,
  daysForPasswordChange: 1 as string | null,
  status: 'Active' as string | null,
  createdBy: 'TEST' as string | null,
  createDate: null as string | null,
  modifiedBy: 'TEST' as string | null,
  modifyDate: null as string | null,
  itemUuid: null
});


async function findRoleByUUID(uuid: string) {
  if (uuid == undefined)
    return;
  try {
    let request = {} as Roles;
    request.itemUuid = uuid;
    await adminStore.findRoleByUUID(request);
    if (adminStore.response.code !== '00') {
      alerts.showAlert(adminStore.response);
      return;
    }
    populateForm(adminStore.roleData);
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

function populateForm(data: Roles) {
  form.value = {
    ...form.value,
    ...data,
    createDate: null,
    modifyDate: null
  };
}


async function onSaveRole() {
  try {
    let request = {} as Roles;
    request = form.value;
    await adminStore.maintainRole(request);
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


</script>

<style scoped>

</style>
