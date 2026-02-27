<template>
  <q-dialog v-model="dialogStore.chargeProcess" persistent @hide="onDialogClose">
    <div>
      <!-- Tab Navigation -->
      <q-tabs
        v-model="activeTab"
        class="bg-primary text-white"
        active-color="white"
        indicator-color="white"
        align="justify"
        narrow-indicator
      >
        <q-tab name="execution" label="Execute Charges" icon="play_circle"/>
        <q-tab
          name="progress"
          label="Progress"
          icon="pending_actions"
          :disable="!hasActiveUploads"
        >
          <q-badge v-if="hasActiveUploads" color="red" floating>{{ progress.totalCount }}</q-badge>
        </q-tab>
      </q-tabs>

      <!-- Tab Panels -->
      <q-tab-panels v-model="activeTab" animated>
        <!-- Execution Tab Panel -->
        <q-tab-panel name="execution">
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

                <div class="row items-center q-mb-sm" v-if="selectedCurrency">
                  <q-icon name="payments" color="grey" size="md"/>
                  <span class="q-ml-sm text-body1">
                  Currency: <strong>{{ selectedCurrencyLabel }}</strong>
                </span>
                </div>

                <q-separator spaced/>

                <div class="q-mt-md">
                  <q-checkbox
                    v-model="isRecoveryMode"
                    label="Run as Recoveries"
                    color="secondary"
                    class="q-mb-sm"
                  />
                  <div class="text-caption text-grey-7 q-ml-lg">
                    {{
                      isRecoveryMode ?
                        'Process outstanding charges from previous periods' :
                        'Process regular monthly charges for current period'
                    }}
                  </div>
                </div>

                <q-separator spaced/>

                <div class="text-subtitle1 q-mt-md">
                  <q-icon name="info" color="warning" class="q-mr-xs"/>
                  This operation will:
                </div>
                <ul class="q-pl-md q-mt-sm">
                  <li v-if="isRecoveryMode">Apply recovery charges for outstanding amounts</li>
                  <li v-else>Apply charges to all eligible accounts</li>
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
                  :loading="isProcessing"
                  @click="processSMSCharges"
                  no-caps
                  :label="isRecoveryMode ? 'Run Recoveries' : 'Run Charges'"
                  :color="isRecoveryMode ? 'secondary' : 'positive'"
                  class="q-px-lg"
                />
              </q-card-actions>
            </q-card>
        </q-tab-panel>

        <!-- Progress Tab Panel -->
        <q-tab-panel name="progress" class="q-pa-md">
          <!-- Progress Dialog (Embedded directly) -->
          <q-card v-if="progress" class="progress-dialog-card">
            <!-- Header -->
            <q-card-section class="dialog-header q-pa-md">
              <div class="row items-center no-wrap">
                <q-icon :name="getStatusIcon(progress)" size="24px" class="header-icon q-mr-sm" color="white"/>
                <div class="col">
                  <div class="text-h6 text-weight-medium">Upload Progress</div>
                  <div class="text-caption text-white-6">ID: {{ progress.processId }}</div>
                </div>
                <q-space/>
                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  @click="closeProgress"
                  :disable="isProgressInProgress"
                />
              </div>
            </q-card-section>

            <q-separator/>

            <!-- Main Content -->
            <q-card-section class="q-pa-lg">
              <!-- Progress Type & Status -->
              <div class="row q-mb-lg">
                <div class="col-6">
                  <div class="text-caption text-grey-6 q-mb-xs">Currency</div>
                  <div class="text-subtitle2">{{ selectedCurrencyLabel }}</div>
                </div>
                <div class="col-6 text-right">
                  <div class="text-caption text-grey-6 q-mb-xs">Status</div>
                  <q-badge :color="getStatusColor(progress)" :label="progress.status" class="q-px-md"/>
                </div>
              </div>

              <!-- Main Progress Bar -->
              <div class="q-mb-lg">
                <div class="row justify-between items-center q-mb-sm">
                  <div class="text-subtitle2">Processing Progress</div>
                  <div class="text-h6 text-weight-bold">{{ progress.percentage }}%</div>
                </div>

                <q-linear-progress
                  :value="progress.percentage / 100"
                  stripe
                  :color="getProgressColor(progress)"
                  size="20px"
                  rounded
                  class="main-progress-bar"
                >
                  <template v-slot:default>
                    <div class="absolute-full flex flex-center">
                    <span class="text-white text-caption">
                      {{ progress.processedCount }} / {{ progress.totalCount }}
                    </span>
                    </div>
                  </template>
                </q-linear-progress>
              </div>

              <div class="row q-col-gutter-md q-mb-lg">
                <div class="col-6">
                  <q-card flat bordered class="info-card">
                    <q-card-section class="q-pa-sm">
                      <div class="text-caption text-grey-6">Total Records</div>
                      <div class="text-subtitle2 text-center">
                        {{ progress.totalCount }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-6">
                  <q-card flat bordered class="info-card">
                    <q-card-section class="q-pa-sm">
                      <div class="text-caption text-grey-6">Processed Records</div>
                      <div class="text-subtitle2 text-center">
                        {{ progress.processedCount }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <div v-if="showReportSection" class="failed-records-section q-mb-lg">
                <div class="text-subtitle2 q-mb-sm">Execution Report</div>

                <div class="row items-center q-col-gutter-sm">
                  <div class="col-12 text-left">
                    <q-btn
                      color="warning"
                      icon="download"
                      label="Download"
                      @click="onClickDownload"
                      :disable="!progress.fileInfo"
                    />
                  </div>
                </div>
              </div>

              <div v-if="progress.metadata?.startTime" class="text-caption text-grey-6 q-mt-md">
                <q-icon name="schedule" size="14px" class="q-mr-xs"/>
                Process started at: {{ formatDateTime(progress.metadata.startTime) }}
              </div>
            </q-card-section>

            <!-- Actions -->
            <q-separator/>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                v-if="progress.status === 'COMPLETED' || progress.status === 'FAILED' || progress.status === 'CANCELLED'"
                label="Close"
                color="negative"
                @click="closeProgress"
              />
            </q-card-actions>
          </q-card>

          <!-- No Progress Message -->
          <div v-else class="text-center q-pa-xl">
            <q-icon name="info" size="48px" color="grey-4"/>
            <div class="text-h6 text-grey-6 q-mt-md">No Active Progress</div>
            <div class="text-caption text-grey-5">Start a charge execution to see progress here</div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {useDialogStore} from "stores/dialog-store";
import {ChargeProcessDTO, ProgressDTO, SmsAlertCurrency} from "components/models";
import moment from "moment/moment";
import {useAdminOfficesStore} from "stores/admin-office-store";
import {useChargeStore} from "stores/charge-store";
import {useAlerts} from "src/utility/alerts";
import {useCommonUtility} from "src/utility/common";
import {useSseListener} from "src/utility/sse-listener";


const dialogStore = useDialogStore();
const adminStore = useAdminOfficesStore();
const chargeStore = useChargeStore();
const alerts = useAlerts();
const utility = useCommonUtility();
const sse = useSseListener();


watch(
  () => dialogStore.chargeProcess,
  async (newValue) => {
    if (!newValue) return;
    await findSmsAlertCurrencies();
  },
  {immediate: true}
);


const activeTab = ref('execution');

const emit = defineEmits<{
  close: [];
}>();

const onDialogClose = () => {
  emit('close');
};

const formatMonthYear = (period: string) => {
  return moment(period, 'YYYY-MM').format('MMMM YYYY')
}

const formatDateTime = (timestamp: string): string => {
  if (!timestamp) return 'N/A';
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return 'Invalid date';
  }
};

const isProcessing = ref(false);
const isRecoveryMode = ref(false);
const selectedMonth = ref<number | null>(null)
const selectedYear = ref<number | null>(null)
const selectedCurrency = ref<number | null>(null)

// Status configuration
const statusConfig = {
  PENDING: {color: 'blue-grey', icon: 'schedule', progressColor: 'primary'},
  PROCESSING: {color: 'primary', icon: 'sync', progressColor: 'primary'},
  CONNECTED: {color: 'primary', icon: 'sync', progressColor: 'primary'},
  COMPLETED: {color: 'positive', icon: 'check_circle', progressColor: 'positive'},
  FAILED: {color: 'negative', icon: 'error', progressColor: 'negative'},
  CANCELLED: {color: 'orange', icon: 'cancel', progressColor: 'warning'},
} as const;

// Progress tracking
const hasActiveUploads = computed(() => {
  return progress.value.totalCount > 0;
});
const isProgressInProgress = computed(() => {
  const status = progress.value?.status;
  return status === 'PENDING' || status === 'PROCESSING' || status === 'CONNECTED';
});

const currentDate = moment()
const currentMonth = currentDate
selectedMonth.value = currentMonth.month() + 1 // Moment months are 0-11
selectedYear.value = currentMonth.year()

const selectedPeriod = computed(() => {
  if (!selectedMonth.value || !selectedYear.value) return ''
  return `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`
})

// Get the label for the selected currency
const selectedCurrencyLabel = computed(() => {
  if (!selectedCurrency.value) return 'All Currencies'
  const currency = currencyOptions.value.find(c => c.smsAlertCrncyId === selectedCurrency.value)
  return currency ? currency.crncyNm : selectedCurrency.value
})


const getStatusColor = (progress: ProgressDTO) => {
  return statusConfig[progress.status]?.color || 'grey';
};

const getProgressColor = (progress: ProgressDTO) => {
  return statusConfig[progress.status]?.progressColor || 'grey';
};

const getStatusIcon = (progress: ProgressDTO) => {
  return statusConfig[progress.status]?.icon || 'info';
};

const currencyOptions = computed(() => {
  return adminStore.currencyList.filter(f => f.status == "A")
})

const showReportSection = computed(() => {
  return progress.value?.status === 'COMPLETED';
})

watch(selectedCurrency, async (newValue) => {
  if (!newValue) return;
  await sse.connectSse(newValue?.toString());
})


const progress = computed(() => {
  return sse.progressUpdate.value;
})

async function findSmsAlertCurrencies() {
  try {
    let request = {} as SmsAlertCurrency;
    await adminStore.findSmsAlertCurrencies(request);
    if (adminStore.response.code !== '0') {
      alerts.showAlert(adminStore.response);
      return;
    }
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

async function processSMSCharges() {
  try {

    let request = {} as ChargeProcessDTO;
    request.isAutoRecoveryInitiated = isRecoveryMode.value;
    if (selectedCurrency.value) {
      request.currencyId = selectedCurrency.value;
    }
    await chargeStore.processSMSCharges(request);
    if (chargeStore.response.code !== '0') {
      alerts.showAlert(chargeStore.response);
      return;
    }
    alerts.showAlert(chargeStore.response);
    onClickDownload();

  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

const onClickDownload = () => {
  if (!sse.progressUpdate.value.fileInfo) return;

  try {
    const fileData = sse.progressUpdate.value.fileInfo.get("encodedFileData");
    const fileName = sse.progressUpdate.value.fileInfo.get('fileName');

    if (!fileData || !fileName) {
      alerts.showAlert({code: '-99', message: 'File data or name is missing'});
      return;
    }

    const src = `data:application/octet-stream;base64,${fileData}`;
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName;
    link.click();
    link.remove();
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
};

function closeProgress() {
  if (!isProgressInProgress.value) {
    activeTab.value = 'execution';
  }
  emit('close');
};


</script>


<style scoped>
.progress-dialog-card {
  border-radius: 10px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #2a93bc 0%, #1a6a8a 100%);
  color: white;
}

.header-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.main-progress-bar {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-card {
  border-radius: 8px;
  background: #f8f9fa;
}

.failed-records-section {
  padding: 16px;
  background: #fef8e6;
  border-radius: 8px;
  border: 1px solid #ffc10720;
}
</style>
