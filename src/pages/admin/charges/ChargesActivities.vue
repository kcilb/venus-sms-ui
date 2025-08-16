<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md items-center q-gutter-md">
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
        color="primary"
        icon="play_circle"
        label="Run Charges"
        :loading="isProcessing"
        :disable="!selectedMonth || !selectedYear"
        @click="runChargesForSelectedMonth"
      />

      <q-space />

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

    <!-- History Table -->
    <q-table
      title="Charge Execution History"
      :rows="filteredHistory"
      :columns="columns"
      row-key="id"
      :loading="isLoading"
      :pagination="pagination"
      binary-state-sort
    >
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {format, useQuasar} from 'quasar'
import { api } from 'boot/axios'
import moment from "moment";

interface ChargeHistory {
  id: number
  totalAccounts: number
  lowFundsCount: number
  processedCount: number
  failedCount: number
  recoveredAmt: number
  chargeDesc: string
  createDt: string
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL'
}

const selectedMonth = ref<number | null>(null)
const selectedYear = ref<number | null>(null)



const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: moment().month(i).format('MMMM'), // Full month name
  value: i + 1 // Months 1-12
}))

const currentYear = moment().year()
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
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

const $q = useQuasar()

// Reactive state
const chargeHistory = ref<ChargeHistory[]>([])
const filterStatus = ref<string | null>(null)
const isProcessing = ref(false)
const isLoading = ref(false)

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
  { label: 'All', value: null },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Partial', value: 'PARTIAL' }
]

const pagination = {
  sortBy: 'createDt',
  descending: true,
  page: 1,
  rowsPerPage: 10
}

// Computed properties
const filteredHistory = computed(() => {
  if (!filterStatus.value) return chargeHistory.value
  return chargeHistory.value.filter(item => item.status === filterStatus.value)
})

// Methods
const fetchChargeHistory = async () => {
  try {
    isLoading.value = true
    const { data } = await api.get<ChargeHistory[]>('/api/charges/history')
    chargeHistory.value = data
  } catch (error) {
    showNotification('negative', 'Failed to load charge history')
  } finally {
    isLoading.value = false
  }
}

const runMonthlyCharges = async () => {
  isProcessing.value = true
  try {
    await api.post('/api/charges/run-monthly')
    showNotification('positive', 'Monthly charges processed successfully')
    await fetchChargeHistory() // Refresh data
  } catch (error) {
    showNotification('negative', 'Failed to process monthly charges')
  } finally {
    isProcessing.value = false
  }
}

const showNotification = (color: string, message: string) => {
  $q.notify({
    color,
    message,
    icon: color === 'positive' ? 'check_circle' : 'report_problem'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'positive'
    case 'FAILED': return 'negative'
    case 'PARTIAL': return 'warning'
    default: return 'grey'
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

// Lifecycle hook
onMounted(() => {
  fetchChargeHistory()
})

const runChargesForSelectedMonth = async () => {
  if (!selectedMonth.value || !selectedYear.value) return

  isProcessing.value = true
  try {
    const period = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`
    await api.post('/api/charges/run', { period })
    showNotification('positive', `Charges processed for ${formatMonthYear(period)}`)
    await fetchChargeHistory() // Refresh data
  } catch (error) {
    showNotification('negative', 'Failed to process charges')
  } finally {
    isProcessing.value = false
  }
}

</script>

<style scoped>
.q-table {
  height: calc(100vh - 150px);
}
</style>
