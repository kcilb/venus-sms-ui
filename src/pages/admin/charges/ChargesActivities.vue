<template>

  <q-card bordered flat style="background: none" class="q-ma-lg">
    <q-card class="row col-12" flat>
      <q-toolbar class="q-pa-sm text-h6 bg-grey-4">
        Charges
      </q-toolbar>
      <div class="row col-12 q-pa-lg items-center q-gutter-md">
        <div class="row items-center q-gutter-sm">
          <q-select
            v-model="selectedMonth"
            input-style="font-size:bold"
            dropdown-icon="expand_more"
            :options="monthOptions"
            label="Month"
            style="min-width: 120px"
            outlined
            dense
            emit-value
            map-options
          />
          <q-select
            dropdown-icon="expand_more"
            v-model="selectedYear"
            :options="yearOptions"
            label="Year"
            style="min-width: 100px"
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
        :loading="isLoading"
        :pagination="pagination"
        binary-state-sort
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

        <template #body-cell-recoveredAmt="props">
          <q-td :props="props" class="text-right">
            {{ formatCurrency(props.row.recoveredAmt) }}
          </q-td>
        </template>

        <template #body-cell-createDt="props">
          <q-td :props="props">
            {{ formatDateTime(props.row.createDt) }}
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px; border-radius: 8px;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Monthly Charges Execution
            <q-icon
              name="warning"
              size="sm"
              color="white"
              class="q-ml-sm"
            />
          </div>

        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row items-center q-mb-sm">
            <q-icon name="calendar_month" color="grey" size="md"/>
            <span class="q-ml-sm text-body1">
          Processing period: <strong>{{ formatMonthYear(selectedPeriod) }}</strong>
        </span>
          </div>

          <q-separator spaced/>

          <div class="text-subtitle1 q-mt-md">
            <q-icon name="info" color="warning" class="q-mr-xs"/>
            This operation will:
          </div>
          <ul class="q-pl-md q-mt-sm">
            <li>Apply charges to all eligible accounts</li>
            <li>Generate transaction records</li>
            <li>Update account balances</li>
          </ul>

          <div class="text-negative q-mt-md">
            <q-icon name="error_outline" class="q-mr-xs"/>
            <strong>Warning:</strong> This action cannot be undone.
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            no-caps
            flat
            label="Cancel"
            color="grey-7"
            v-close-popup
            class="q-px-md"
          />
          <q-btn
            no-caps
            @click="processSMSCharges(true)"
            label="Run Recoveries"
            color="secondary"
            class="q-px-lg"
          />
          <q-btn
            @click="processSMSCharges(false)"
            no-caps
            label="Run Charges"
            color="positive"
            class="q-px-lg"
          />

        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-card>

</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {format, useQuasar} from 'quasar'
import {api} from 'boot/axios'
import moment from "moment";
import {ChargeHistory, ChargeProcessDTO, SmsAlertCurrency} from "components/models";
import {useChargeStore} from "stores/charge-store";
import {useAlerts} from "src/utility/alerts";
import {useCommonUtility} from "src/utility/common";


const chargeStore = useChargeStore();
const alerts = useAlerts();
const utility = useCommonUtility();

const selectedMonth = ref<number | null>(null)
const selectedYear = ref<number | null>(null)


const monthOptions = Array.from({length: 12}, (_, i) => ({
  label: moment().month(i).format('MMMM'), // Full month name
  value: i + 1 // Months 1-12
}))

const currentYear = moment().year()
const yearOptions = Array.from({length: 5}, (_, i) => ({
  label: String(currentYear - i),
  value: currentYear - i
}))

const currentDate = moment()
const currentMonth = currentDate
selectedMonth.value = currentMonth.month() + 1 // Moment months are 0-11
selectedYear.value = currentMonth.year()

const formatMonthYear = (period: string) => {
  return moment(period, 'YYYY-MM').format('MMMM YYYY')
}

const selectedPeriod = computed(() => {
  if (!selectedMonth.value || !selectedYear.value) return ''
  return `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`
})

const $q = useQuasar()

// Reactive state

const filterStatus = ref<string | null>(null)

const isLoading = ref(false)

onMounted(() => {
  findChargeHistory();
})

// Constants
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


const filteredHistory = computed(() => {
  return chargeStore.chargeHistoryList;
})

const isProcessing = computed(() => {
  return chargeStore.loading;
})


const showNotification = (color: string, message: string) => {
  $q.notify({
    color,
    message,
    icon: color === 'positive' ? 'check_circle' : 'report_problem'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'positive'
    case 'FAILED':
      return 'negative'
    case 'PARTIAL':
      return 'warning'
    default:
      return 'grey'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}
const showDialog = ref(false);

const showConfirmationDialog = () => {
  if (!selectedMonth.value || !selectedYear.value) return
  showDialog.value = true
}


async function findChargeHistory() {
  try {
    let request = {} as ChargeProcessDTO;
    await chargeStore.findChargeHistory(request);
    if (chargeStore.response.code !== '0') {
      alerts.showAlert(chargeStore.response);
      return;
    }
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

async function processSMSCharges(isRecover: boolean) {
  try {
    let request = {} as ChargeProcessDTO;
    request.isAutoRecoveryInitiated = isRecover;
    await chargeStore.processSMSCharges(request);
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
