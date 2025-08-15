<template>
  <q-card bordered flat style="background: none" class="q-ma-lg">
    <q-card class="row col-12" flat>
      <q-toolbar class="q-pa-sm text-h6 bg-grey-4">
        ROLES
      </q-toolbar>
      <div class="row q-pa-md col-12">
        <div class="col-12 q-pb-sm text-right">
          <q-btn :to="'role/add'" size="13px" color="primary" no-caps>Add Role</q-btn>
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
          no-data-label="No roles found"
          row-key="name"
          :filter="filter"
          v-model:pagination="pagination"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary">
              <q-spinner-ios
                color="primary"
                :size="'lg'"
              />

            </q-inner-loading>
          </template>
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
              <q-td key="description" :props="props">
                {{ props.row.description }}
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
import {Roles, User} from "components/models";
import {useAdminOfficesStore} from "stores/admin-office-store";
import {useCommonUtility} from "src/utility/common";
import {useAlerts} from "src/utility/alerts";


const router = useRouter();
const route = useRoute();
const adminStore = useAdminOfficesStore();
const alerts = useAlerts();
const utility = useCommonUtility();


const loading = ref();
const filter = ref();

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10
});

onMounted(() => {
  findRoles();
})


const columns = [
  {
    name: 'description',
    required: true,
    label: 'Description',
    align: 'left',
    sortable: true
  },
  {name: 'status', label: 'Status', field: 'status'},
  {name: 'edit', label: '', field: 'edit'}
];


const rows = computed(() => {
  return adminStore.roleList;
})

async function findRoles() {
  try {
    let request = {} as Roles;
    await adminStore.findRoles(request);
    if (adminStore.response.code !== '00') {
      alerts.showAlert(adminStore.response);
      return;
    }
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

function onClickEdit(data: Roles) {
  router.push('/admin/role/edit/' + data.itemUuid);
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
