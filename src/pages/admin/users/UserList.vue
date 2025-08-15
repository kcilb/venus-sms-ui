<template>
  <q-card bordered flat style="background: none" class="q-ma-lg">
    <q-card class="row col-12" flat>
      <q-toolbar class="q-pa-sm text-h6 bg-grey-4">
        USERS
      </q-toolbar>
      <div class="row q-pa-md col-12">
        <div class="col-12 q-pb-sm text-right">
          <q-btn size="13px" :to="'user/add'" color="primary" no-caps>Add User</q-btn>
        </div>
        <q-table
          :virtual-scroll-sticky-size-start="300"
          virtual-scroll
          :virtual-scroll-item-size="20"
          class="col-12"
          flat
          bordered
          :loading="adminStore.loading"
          :rows="rows"
          :columns="columns"
          no-data-label="No users found"
          row-key="name"
          :filter="filter"
          v-model:pagination="pagination"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="tb-header"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr>
              <q-td key="name" :props="props">
                {{ props.row.firstName }} {{ props.row.lastName }}
              </q-td>
              <q-td key="loginId" :props="props">
                {{ props.row.loginId }}
              </q-td>
              <q-td key="emailAddress" :props="props">
                {{ props.row.emailAddress }}
              </q-td>
              <q-td key="userRoleDesc" :props="props">
                {{ props.row.userRoleDesc }}
              </q-td>
              <q-td key="failedLoginAttempts" :props="props">
                {{ props.row.failedLoginAttempts }}
              </q-td>
              <q-td key="status" :props="props">
                {{ props.row.status }}
              </q-td>
              <q-td key="edit" :props="props">
                <q-btn glossy @click="onClickEdit(props.row)" color="blue-8" round outline size="11px"
                       icon="edit">
                  <q-tooltip style="font-size: 13px">edit</q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>
          </template>

        </q-table>
      </div>
    </q-card>
  </q-card>
</template>

<script setup lang="ts">


import {computed, onMounted, reactive, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useCommonUtility} from "src/utility/common";
import {useAlerts} from "src/utility/alerts";
import {useAdminOfficesStore} from "stores/admin-office-store";
import {User} from "components/models";

const router = useRouter();
const route = useRoute();
const adminStore = useAdminOfficesStore();
const alerts = useAlerts();
const utility = useCommonUtility();


const filter = ref();
const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10
});

onMounted(() => {
  findUser();
})

const columns = [
  {name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true},
  {name: 'loginId', align: 'left', label: 'Username', field: 'loginId', sortable: true},
  {name: 'emailAddress', align: 'left', label: 'Email', field: 'emailAddress', sortable: true},
  {name: 'userRoleDesc', align: 'left', label: 'Role', field: 'userRoleDesc', sortable: true},
  {name: 'failedLoginAttempts', align: 'left', label: 'Failed Logins', field: 'failedLoginAttempts'},
  {name: 'status', label: 'Status', field: 'status'},
  {name: 'edit', label: '', field: 'edit'}
];

const rows = computed(() => {
  return adminStore.userList;
});


async function findUser() {
  try {
    let request = {} as User;
    await adminStore.findUser(request);
    if (adminStore.response.code !== '00') {
      alerts.showAlert(adminStore.response);
      return;
    }
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}


function onClickEdit(data: User) {
  router.push('/admin/user/edit/' + data.itemUuid);
}

</script>

<style scoped>
thead tr th {
  position: sticky;
  z-index: 1
}

thead tr:last-child th {
  top: 48px;
}

thead tr:first-child th {
  top: 0
}

.tb-header {
  font-size: 14px;
  color: black;
  font-weight: bold;
  background: none;
  position: sticky;
  z-index: 1;
}
</style>
