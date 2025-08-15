<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Summary Cards -->
      <div class="col-12 col-md-3">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 text-grey-7">Total Balance</div>
            <div class="text-h4 text-weight-bold q-mt-sm">245,382</div>
            <q-icon
              name="account_balance"
              size="md"
              color="primary"
              class="absolute-top-right q-ma-md bg-blue-1 rounded-borders"
              style="padding: 8px;"
            />
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-sm text-caption text-grey-7">
            <q-icon name="info" size="xs" class="q-mr-xs" />
            Across all accounts
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 text-grey-7">Monthly Income</div>
            <div class="text-h4 text-weight-bold text-green q-mt-sm">48,750</div>
            <q-icon
              name="trending_up"
              size="md"
              color="green"
              class="absolute-top-right q-ma-md bg-green-1 rounded-borders"
              style="padding: 8px;"
            />
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-sm text-caption text-grey-7">
            <q-icon name="info" size="xs" class="q-mr-xs" />
            12% increase from last month
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 text-grey-7">Monthly Expenses</div>
            <div class="text-h4 text-weight-bold text-orange q-mt-sm">32,190</div>
            <q-icon
              name="trending_down"
              size="md"
              color="orange"
              class="absolute-top-right q-ma-md bg-orange-1 rounded-borders"
              style="padding: 8px;"
            />
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-sm text-caption text-grey-7">
            <q-icon name="info" size="xs" class="q-mr-xs" />
            8% decrease from last month
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 text-grey-7">Pending Approvals</div>
            <div class="text-h4 text-weight-bold text-purple q-mt-sm">12</div>
            <q-icon
              name="pending_actions"
              size="md"
              color="purple"
              class="absolute-top-right q-ma-md bg-purple-1 rounded-borders"
              style="padding: 8px;"
            />
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-sm text-caption text-grey-7">
            <q-icon name="info" size="xs" class="q-mr-xs" />
            5 require immediate attention
          </q-card-section>
        </q-card>
      </div>

      <!-- Charts Row -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="bg-white">
          <q-card-section>
            <div class="row items-center">
              <div class="text-h6 text-weight-medium">Cash Flow</div>
              <q-space />
              <q-btn-toggle
                v-model="chartPeriod"
                toggle-color="primary"
                :options="[
                  {label: 'Weekly', value: 'week'},
                  {label: 'Monthly', value: 'month'},
                  {label: 'Quarterly', value: 'quarter'}
                ]"
                dense
                flat
              />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pt-none">
            <div class="chart-container" style="height: 300px;">
              <!-- Chart would go here -->
              <div class="flex flex-center full-height text-grey-5">
                <q-icon name="insert_chart" size="xl" />
                <div class="q-ml-sm">Cash Flow Visualization</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="bg-white">
          <q-card-section>
            <div class="text-h6 text-weight-medium">Budget Allocation</div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pt-none">
            <div class="chart-container" style="height: 300px;">
              <!-- Chart would go here -->
              <div class="flex flex-center full-height text-grey-5">
                <q-icon name="pie_chart" size="xl" />
                <div class="q-ml-sm">Budget Breakdown</div>
              </div>
            </div>
          </q-card-section>
          <q-separator />
        </q-card>
      </div>

      <!-- Recent Transactions -->
      <div class="col-12">
        <q-card flat bordered class="bg-white">
          <q-card-section>
            <div class="row items-center">
              <div class="text-h6 text-weight-medium">Recent Transactions</div>
              <q-space />
              <q-btn
                flat
                color="primary"
                label="View All"
                to="/transactions"
                icon-right="chevron_right"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <q-table
              :rows="recentTransactions"
              :columns="transactionColumns"
              row-key="id"
              flat
              bordered
              hide-pagination
              :rows-per-page-options="[0]"
              class="transactions-table"
            >
              <template v-slot:body-cell-date="props">
                <q-td :props="props">
                  <div class="text-weight-medium">{{ formatDate(props.row.date) }}</div>
                </q-td>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge
                    :color="getStatusColor(props.row.status)"
                    class="q-px-sm q-py-xs"
                    :class="`text-${getStatusColor(props.row.status)}`"
                  >
                    {{ capitalizeFirstLetter(props.row.status) }}
                  </q-badge>
                </q-td>
              </template>

              <template v-slot:body-cell-amount="props">
                <q-td :props="props">
                  <span
                    :class="`text-${props.row.type === 'income' ? 'green' : 'red'}`"
                    class="text-weight-medium"
                  >
                    {{ props.row.type === 'income' ? '+' : '-' }}${{ props.row.amount }}
                  </span>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const chartPeriod = ref('month');
const recentTransactions = ref([
  {
    id: 1,
    date: '2023-05-15',
    description: 'Vendor Payment - Office Supplies',
    account: 'Operating Account',
    amount: '1,250.00',
    type: 'expense',
    status: 'completed',
    category: 'Office Expenses'
  },
  {
    id: 2,
    date: '2023-05-14',
    description: 'Client Payment - Project X',
    account: 'Client Receivables',
    amount: '5,800.00',
    type: 'income',
    status: 'completed',
    category: 'Services'
  },
  {
    id: 3,
    date: '2023-05-13',
    description: 'Bank Transfer - Savings',
    account: 'Main Account',
    amount: '2,000.00',
    type: 'expense',
    status: 'pending',
    category: 'Transfers'
  },
  {
    id: 4,
    date: '2023-05-12',
    description: 'Utility Bill - Electricity',
    account: 'Operating Account',
    amount: '450.00',
    type: 'expense',
    status: 'completed',
    category: 'Utilities'
  },
  {
    id: 5,
    date: '2023-05-10',
    description: 'Consulting Fee',
    account: 'Operating Account',
    amount: '3,200.00',
    type: 'income',
    status: 'completed',
    category: 'Services'
  }
]);

const transactionColumns = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'account', label: 'Account', field: 'account', align: 'left' },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' }
];

function getStatusColor(status: string) {
  return {
    'completed': 'green',
    'pending': 'orange',
    'rejected': 'red'
  }[status] || 'grey';
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
</script>

<style scoped>
.summary-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 8px;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-container {
  position: relative;
  border-radius: 6px;
}

.transactions-table {
  border-radius: 0 0 8px 8px;
}

.transactions-table :deep(thead tr) {
  background-color: #f5f5f5;
}

.transactions-table :deep(thead th) {
  font-weight: 600;
  color: #424242;
}

.q-badge {
  border-radius: 4px;
  text-transform: capitalize;
}
</style>
