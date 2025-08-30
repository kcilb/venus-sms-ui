<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-medium text-primary">Dashboard</div>
        <div class="text-subtitle2 text-grey-7">Overview of your alert service metrics</div>
      </div>
      <div class="col-auto">
        <q-btn
          flat
          round
          dense
          icon="refresh"
          color="grey-7"
          @click="refreshData"
        >
          <q-tooltip>Refresh Data</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="stat-card shadow-3">
          <q-card-section class="bg-blue-grey-1">
            <div class="text-subtitle1 text-grey-8">Users</div>
            <div class="text-h3 text-weight-bold q-mt-sm text-blue-grey-10">1,254</div>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="right" class="q-px-md">
            <q-btn
              unelevated
              color="blue-grey-7"
              label="Manage"
              size="sm"
              class="text-capitalize"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="stat-card shadow-3">
          <q-card-section class="bg-cyan-1">
            <div class="text-subtitle1 text-grey-8">Alerts</div>
            <div class="text-h3 text-weight-bold q-mt-sm text-cyan-10">432</div>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="right" class="q-px-md">
            <q-btn
              unelevated
              color="cyan-8"
              label="Manage"
              size="sm"
              class="text-capitalize"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="stat-card shadow-3">
          <q-card-section class="bg-orange-1">
            <div class="text-subtitle1 text-grey-8">Pending Charges</div>
            <div class="text-h3 text-weight-bold q-mt-sm text-orange-10">87</div>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="right" class="q-px-md">
            <q-btn
              unelevated
              color="orange-8"
              label="Run Now"
              to="admin/charges"
              size="sm"
              class="text-capitalize"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="stat-card shadow-3">
          <q-card-section class="bg-purple-1">
            <div class="text-subtitle1 text-grey-8">Today's Sent Messages</div>
            <div class="text-h3 text-weight-bold q-mt-sm text-purple-10">56</div>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="right" class="q-px-md">
            <q-btn
              unelevated
              color="purple-8"
              label="View"
              size="sm"
              class="text-capitalize"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <div class="row q-mt-lg">
      <div class="col-12">
        <q-card flat bordered class="shadow-1">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <div class="col">
                <div class="text-h5 text-weight-medium">Recent Activities</div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  dense
                  color="primary"
                  label="View All"
                  to="/activities"
                  size="sm"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator/>

          <q-card-section class="q-pa-none">
            <q-table
              flat
              bordered
              :rows="recentActivities"
              :columns="activityColumns"
              row-key="id"
              :rows-per-page-options="[5, 10]"
              :pagination="{ rowsPerPage: 5 }"
              hide-bottom
              class="no-shadow"
            >
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge
                    :color="statusColor(props.value)"
                    :label="props.value"
                    class="text-capitalize"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-time="props">
                <q-td :props="props">
                  <div class="text-caption">{{ utility.formatDate(props.value) }}</div>
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
import {ref} from 'vue';
import {useCommonUtility} from "src/utility/common";

const utility = useCommonUtility();

const leftDrawerOpen = ref(false);

const recentActivities = ref([]);

const activityColumns = ref([
  {name: 'action', label: 'Action', field: 'action', align: 'left'},
  {name: 'user', label: 'User', field: 'user', align: 'left'},
  {name: 'time', label: 'Time', field: 'time', align: 'left'},
  {name: 'status', label: 'Status', field: 'status', align: 'left'}
]);

function statusColor(status: string) {
  const colors = {
    'success': 'green',
    'completed': 'blue',
    'pending': 'orange',
    'failed': 'red'
  };
  return colors[status.toLowerCase()] || 'grey';
}

function refreshData() {

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
