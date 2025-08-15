<template>
  <q-card bordered flat style="background: none" class="q-ma-lg">
    <q-card class="row col-12" flat>
      <q-toolbar class="q-pa-sm text-h6 bg-grey-4">
        SMS CURRENCIES
      </q-toolbar>
      <div class="row q-pa-md col-12">
        <div class="col-12 q-pb-sm text-right">
          <q-btn size="13px" :to="'currency/add'" color="primary" no-caps>Add Currency</q-btn>
        </div>
        <q-table
          :virtual-scroll-sticky-size-start="300"
          virtual-scroll
          :virtual-scroll-item-size="20"
          class="col-12"
          flat
          bordered
          :loading="loading"
          :rows="rows"
          :columns="columns"
          no-data-label="No currencies"
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
              <q-td key="crncyNm" :props="props">
                {{ props.row.crncyNm }}
              </q-td>
              <q-td key="crncyIso" :props="props">
                {{ props.row.crncyIso }}
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
import {SmsAlertCurrency} from "components/models";
import {useAdminOfficesStore} from "stores/admin-office-store";
import {useCommonUtility} from "src/utility/common";
import {useAlerts} from "src/utility/alerts";


;
const router = useRouter();
const route = useRoute();
const adminStore = useAdminOfficesStore();
const utility = useCommonUtility();
const alerts = useAlerts();


const filter = ref();


onMounted(() => {
  findCurrency();
})

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10
});


const columns = [

  {
    name: 'crncyNm',
    required: true,
    label: 'Description',
    align: 'left',
    sortable: true
  },
  {
    name: 'crncyIso',
    required: true,
    label: 'Iso Code',
    align: 'left',
    sortable: true
  },

  {name: 'status', label: 'Status', field: 'status'},
  {name: 'edit', label: '', field: 'edit'}
];


const rows = computed(() => {
  return adminStore.currencyList;
})

const loading = computed(()=>{
  return adminStore.loading;
});


async function findCurrency() {
  try {
    let request = {} as SmsAlertCurrency;
    await adminStore.findCurrency(request);
    if (adminStore.response.code !== '00') {
      alerts.showAlert(adminStore.response);
      return;
    }
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}


function onClickEdit(data: SmsAlertCurrency) {
  router.push('/admin/currency/edit/' + data.itemUuid);
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
