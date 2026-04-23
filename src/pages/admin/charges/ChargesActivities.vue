<template>
  <q-card bordered flat style="background: none" class="q-ma-lg">
    <q-card class="row col-12" flat>
      <q-toolbar class="q-pa-sm text-h6 bg-grey-4">
        Charges
      </q-toolbar>
      <div class="row col-12 q-pa-lg items-center q-gutter-md">
        <div class="row items-center q-gutter-sm">
          <q-select
            dropdown-icon="expand_more"
            v-model="selectedCurrency"
            :options="currencyOptions"
            option-label="crncyIso"
            option-value="smsAlertCrncyId"
            label="Currency"
            style="min-width: 120px"
            outlined
            dense
            emit-value
            map-options
          />
        </div>

        <q-btn
          color="positive"
          icon="play_circle"
          label="Run Charges"
          :loading="isProcessing"
          :disable="!selectedMonth || !selectedYear"
          @click="showConfirmationDialog"
        />

        <q-space/>

        <q-select
          v-model="filterStatus"
          dropdown-icon="expand_more"
          :options="statusOptions"
          label="Filter by Status"
          dense
          outlined
          emit-value
          map-options
          style="min-width: 200px"
        />
      </div>

      <!-- Progress Indicator -->
      <q-linear-progress
        v-if="isProcessing"
        indeterminate
        color="primary"
        class="q-mb-md"
      />

      <q-table
        class="col-12"
        title="Charge History"
        :rows="filteredHistory"
        :columns="columns"
        row-key="id"
        :loading="chargeStore.loading"
        :pagination="pagination"
        binary-state-sort
      >
        <template v-slot:top>
          <div class="row col-12">
            <div class="col-8">
              <q-btn @click="onClickFilter" icon="manage_search">
                <q-tooltip>Custom Search</q-tooltip>
              </q-btn>

              <charge-filter @onDefineFilterCriteria="onClickSearch" :filterData="formData"></charge-filter>

            </div>

          </div>

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
        <template #body-cell-period="props">
          <q-td :props="props">
            {{ formatMonthYear(props.row.period) }}
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.row.status)">
              {{ props.row.status }}
            </q-badge>
          </q-td>
        </template>
        <template #body-cell-currency="props">
          <q-td :props="props">
            {{ props.row.currency }}
          </q-td>
        </template>

        <template #body-cell-recoveredAmt="props">
          <q-td :props="props" class="text-right">
            {{ utility.formatToAmount(props.row.recoveredAmt) }} {{ props.row.currency }}
          </q-td>
        </template>

        <template #body-cell-createDt="props">
          <q-td :props="props">
            {{ utility.formatDate(props.row.createDt) }}
          </q-td>
        </template>
      </q-table>
    </q-card>

    <charge-process :selectedCurrency="selectedCurrency" />
  </q-card>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import moment from "moment";
import {ChargeProcessDTO, Response, SmsAlertCurrency} from "components/models";
import {useChargeStore} from "stores/charge-store";
import {useAlerts} from "src/utility/alerts";
import {useCommonUtility} from "src/utility/common";
import {useDialogStore} from "stores/dialog-store";
import ChargeFilter from "components/dialogs/ChargeFilter.vue";
import {useAdminOfficesStore} from "stores/admin-office-store";
import ChargeProcess from "components/dialogs/ChargeProcess.vue";

const dialogStore = useDialogStore();
const chargeStore = useChargeStore();
const alerts = useAlerts();
const utility = useCommonUtility();
const adminStore = useAdminOfficesStore();

const selectedMonth = ref<number | null>(null)
const selectedYear = ref<number | null>(null)
const selectedCurrency = ref<number | null>(null) // Added currency ref


const currentYear = moment().year()

const currentDate = moment()
const currentMonth = currentDate
selectedMonth.value = currentMonth.month() + 1 // Moment months are 0-11
selectedYear.value = currentMonth.year()

const formatMonthYear = (period: string) => {
  return moment(period, 'YYYY-MM').format('MMMM YYYY')
}

const filterStatus = ref<string | null>(null);

onMounted(async () => {
  await findSmsAlertCurrencies();
  await findChargeHistory();
})

// Updated columns to include currency
const columns = [
  {
    name: 'createDt',
    label: 'Date',
    field: 'createDt',
    align: 'left',
    sortable: true
  },
  {
    name: 'chargeDesc',
    label: 'Description',
    field: 'chargeDesc',
    align: 'left'
  },
  {
    name: 'totalAccounts',
    label: 'Total Accounts',
    field: 'totalAccounts',
    align: 'center'
  },
  {
    name: 'processedCount',
    label: 'Processed',
    field: 'processedCount',
    align: 'center'
  },
  {
    name: 'failedCount',
    label: 'Failed',
    field: 'failedCount',
    align: 'center'
  },
  {
    name: 'lowFundsCount',
    label: 'Low Funds',
    field: 'lowFundsCount',
    align: 'center'
  },
  {
    name: 'recoveredAmt',
    label: 'Recovered Amount',
    field: 'recoveredAmt',
    align: 'right'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center'
  }
]

const statusOptions = [
  {label: 'All', value: null},
  {label: 'Completed', value: 'COMPLETED'},
  {label: 'Failed', value: 'FAILED'},
  {label: 'Partial', value: 'PARTIAL'}
]

const pagination = {
  sortBy: 'createDt',
  descending: true,
  page: 1,
  rowsPerPage: 10
}


const currencyOptions = computed(() => {
  return adminStore.currencyList.filter(f => f.status == "A")
})


const filteredHistory = computed(() => {
  return chargeStore.chargeHistoryList;
})

const isProcessing = computed(() => {
  return chargeStore.loading;
})

const formState = ref({
  startDate: moment().format('YYYY-MM-DD'),
  endDate: moment().format('YYYY-MM-DD')
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'C':
      return 'positive'
    case 'F':
      return 'negative'
    case 'P':
      return 'warning'
    default:
      return 'grey'
  }
}

const showConfirmationDialog = () => {
  if (!selectedCurrency.value) {
    let resp = {
      code: '403',
      message: 'Please select currency'
    } as Response
    alerts.showAlert(resp);
    return;
  }

  dialogStore.chargeProcess = true;
}


async function findChargeHistory() {
  try {
    let request = {} as ChargeProcessDTO;
    request.startDate = formState.value.startDate;
    request.endDate = formState.value.endDate;
    // Add currency to request if needed
    if (selectedCurrency.value) {
      request.currencyId = selectedCurrency.value;
    }
    await chargeStore.findChargeHistory(request);
    if (chargeStore.response.code !== '0') {
      alerts.showAlert(chargeStore.response);
      return;
    }
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

function onClickSearch(filter: any) {
  formState.value.startDate = filter.startDate;
  formState.value.endDate = filter.endDate;
  // Add currency to filter if needed
  if (filter.currency) {
    selectedCurrency.value = filter.currency;
  }
  findChargeHistory();
  dialogStore.filter = !dialogStore.filter;
}

const formData = ref({
  startDate: null,
  endDate: null,
  currency: null // Added currency to formData
})

function onClickFilter() {
  dialogStore.filter = !dialogStore.filter;
  formData.value = {
    startDate: formState.value.startDate,
    endDate: formState.value.endDate,
    currencyId: selectedCurrency.value
  };
}

async function findSmsAlertCurrencies() {
  try {
    await adminStore.findSmsAlertCurrencies({} as SmsAlertCurrency);
    if (chargeStore.response.code !== '0') {
      alerts.showAlert(chargeStore.response);
      return;
    }
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}
</script>

<style scoped>
.q-table {
  height: calc(100vh - 150px);
}

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
