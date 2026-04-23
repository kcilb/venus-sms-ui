<template>
  <q-dialog v-model="dialogStore.chargeProcess" persistent>
    <q-card class="dialog-card">
      <!-- Header -->
      <q-card-section class="dialog-header bg-primary text-white q-pa-md">
        <div class="row items-center">
          <q-icon name="payments" size="24px" class="q-mr-sm"/>
          <div class="col">
            <div class="text-h6">Charge Processing</div>
            <div class="text-caption text-white-7">Manage monthly charges and recoveries</div>
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            :disable="
              progress.status === 'CONNECTED' ||
              progress.status === 'PENDING' ||
              progress.status === 'PROCESSING'
            "
          />
        </div>
      </q-card-section>

      <q-separator/>

      <!-- Tabs -->
      <q-tabs
        v-model="activeTab"
        class="tab-header"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        dense
      >
        <q-tab name="execution" label="Execute" icon="play_circle"/>
        <q-tab
          name="progress"
          label="Progress"
          icon="pending_actions"
          :disable="!hasActiveUploads"
        />
      </q-tabs>

      <q-separator/>

      <!-- Tab Panels -->
      <q-tab-panels v-model="activeTab" animated>
        <!-- Execution Panel -->
        <q-tab-panel name="execution" class="q-pa-md">
          <!-- Period Selection -->
          <div class="text-subtitle2 text-grey-8 q-mb-md">Process Details</div>

          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-6">
              <q-card flat bordered class="info-card">
                <q-card-section class="q-pa-sm">
                  <div class="text-caption text-grey-6">Period</div>
                  <div class="text-weight-medium text-primary">{{ formatMonthYear(selectedPeriod) }}</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-6" v-if="props.selectedCurrency">
              <q-card flat bordered class="info-card">
                <q-card-section class="q-pa-sm">
                  <div class="text-caption text-grey-6">Currency</div>
                  <div class="text-weight-medium text-primary">{{ selectedCurrencyLabel }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Mode Selection -->
          <div class="text-subtitle2 text-grey-8 q-mb-md">Execution Mode</div>

          <div class="mode-container q-mb-lg">
            <q-option-group
              v-model="isRecoveryMode"
              :options="modeOptions"
              color="primary"
              inline
              dense
            />
            <div class="mode-hint q-mt-sm text-caption text-grey-6">
              <q-icon :name="isRecoveryMode ? 'restore' : 'bolt'" size="14px" class="q-mr-xs"/>
              {{ recoveryModeDescription }}
            </div>
          </div>

          <!-- Warning -->
          <q-banner class="warning-box q-mb-md rounded-borders">
            <template v-slot:avatar>
              <q-icon name="warning" color="warning"/>
            </template>
            <span class="text-caption text-weight-medium">This action cannot be undone</span>
          </q-banner>

          <!-- Actions -->
          <div class="row justify-end q-gutter-sm">
            <q-btn flat no-caps label="Cancel" v-close-popup :disable="isProcessing"/>
            <q-btn
              no-caps
              :loading="isProcessing"
              @click="processSMSCharges"
              :label="isRecoveryMode ? 'Run Recoveries' : 'Run Charges'"
              :color="isRecoveryMode ? 'secondary' : 'primary'"
              :disable="!props.selectedCurrency"
            />
          </div>
        </q-tab-panel>

        <!-- Progress Panel -->
        <q-tab-panel name="progress" class="q-pa-none">
          <div v-if="progress" class="progress-panel">
            <!-- Status Header -->
            <div class="status-header q-pa-md" :style="{ backgroundColor: getStatusColor(progress) }">
              <div class="row items-center">
                <q-avatar :color="getStatusColor(progress)" text-color="white" size="36px" class="q-mr-sm">
                  <q-icon :name="getStatusIcon(progress)" size="20px"/>
                </q-avatar>
                <div class="col">
                  <div class="text-white text-weight-medium">Process {{ progress.processId }}</div>
                  <div class="text-white-7 text-caption">Started {{
                      formatRelativeTime(progress.metadata?.startTime)
                    }}
                  </div>
                </div>
                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  color="white"
                  @click="closeProgress"
                  :disable="isProgressInProgress"
                />
              </div>
            </div>

            <!-- Content -->
            <div class="q-pa-md">
              <!-- Status Badge -->
              <div class="row items-center justify-between q-mb-lg">
                <q-badge :color="getStatusColor(progress)" class="q-px-md q-py-sm">
                  <q-icon :name="getStatusIcon(progress)" size="14px" class="q-mr-xs"/>
                  {{ progress.status }}
                </q-badge>
                <div class="flex items-center text-caption text-grey-6">
                  <q-icon name="payments" size="14px" class="q-mr-xs"/>
                  {{ selectedCurrencyLabel }}
                </div>
              </div>

              <!-- Stats -->
              <div class="row q-col-gutter-sm q-mb-lg">
                <div class="col-4">
                  <div class="stat-item">
                    <div class="text-caption text-grey-6">Total</div>
                    <div class="stat-number text-primary">{{ formatNumber(progress.totalCount) }}</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="stat-item">
                    <div class="text-caption text-grey-6">Processed</div>
                    <div class="stat-number text-positive">{{ formatNumber(progress.processedCount) }}</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="stat-item">
                    <div class="text-caption text-grey-6">Pending</div>
                    <div class="stat-number text-warning">{{ formatNumber(pendingCount) }}</div>
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="q-mb-lg">
                <div class="row justify-between items-center q-mb-xs">
                  <span class="text-caption text-grey-6">Progress</span>
                  <span class="text-weight-bold">{{ progress.percentage }}%</span>
                </div>
                <q-linear-progress
                  :value="progress.percentage / 100"
                  :color="getProgressColor(progress)"
                  size="20px"
                  rounded
                  stripe
                />
                <div class="text-center text-caption text-grey-6 q-mt-xs">
                  {{ progress.processedCount }} of {{ progress.totalCount }} records
                </div>
              </div>

              <!-- Download -->
              <q-slide-transition>
                <div v-if="showReportSection" class="download-box q-mb-lg">
                  <div class="row items-center justify-between">
                    <div class="flex items-center">
                      <q-icon name="check_circle" color="positive" size="20px" class="q-mr-sm"/>
                      <span class="text-caption">Execution complete</span>
                    </div>
                    <q-btn
                      flat
                      dense
                      color="positive"
                      icon="download"
                      label="Report"
                      @click="onClickDownload"
                      :disable="!progress.fileInfo"
                      size="sm"
                      no-caps
                    />
                  </div>
                </div>
              </q-slide-transition>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state q-pa-xl text-center">
            <q-icon name="pending_actions" size="48px" color="grey-4"/>
            <div class="text-h6 text-grey-7 q-mt-sm">No Active Process</div>
            <div class="text-caption text-grey-6 q-mb-md">Start a charge execution to see progress</div>
            <q-btn flat color="primary" label="Go to Execute" @click="activeTab = 'execution'" no-caps/>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-dialog>
</template>


<script setup lang="ts">
import {computed, ref, watch, onUnmounted, onMounted} from "vue";
import {useDialogStore} from "stores/dialog-store";
import {ChargeProcessDTO, ProgressDTO, SmsAlertCurrency} from "components/models";
import moment from "moment/moment";
import {useAdminOfficesStore} from "stores/admin-office-store";
import {useChargeStore} from "stores/charge-store";
import {useAlerts} from "src/utility/alerts";
import {useCommonUtility} from "src/utility/common";
import {useSseListener} from "src/utility/sse-listener";

const props = defineProps<{
  selectedCurrency: number | null
}>();

const dialogStore = useDialogStore();
const adminStore = useAdminOfficesStore();
const chargeStore = useChargeStore();
const alerts = useAlerts();
const utility = useCommonUtility();
const sse = useSseListener();

// Mode options
const modeOptions = [
  {label: 'Regular Charges', value: false},
  {label: 'Recovery Mode', value: true}
];

// State
const activeTab = ref('execution');
const isProcessing = ref(false);
const isRecoveryMode = ref(false);
const selectedMonth = ref<number | null>(null);
const selectedYear = ref<number | null>(null);

// Initialize dates
const currentDate = moment();
selectedMonth.value = currentDate.month() + 1;
selectedYear.value = currentDate.year();

// Computed properties
const selectedPeriod = computed(() => {
  if (!selectedMonth.value || !selectedYear.value) return '';
  return `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`;
});

const selectedCurrencyLabel = computed(() => {
  if (!props.selectedCurrency) return 'All Currencies';
  const currency = currencyOptions.value.find(c => c.smsAlertCrncyId === props.selectedCurrency);
  return currency ? currency.crncyNm : props.selectedCurrency;
});

const currencyOptions = computed(() => {
  return adminStore.currencyList.filter(f => f.status == "A");
});

const progress = computed(() => sse.progressUpdate.value);
const hasActiveUploads = computed(() => progress.value?.totalCount > 0);
const isProgressInProgress = computed(() => ['PENDING', 'PROCESSING', 'CONNECTED'].includes(progress.value?.status));
const showReportSection = computed(() => progress.value?.status === 'COMPLETED');

const recoveryModeDescription = computed(() =>
  isRecoveryMode.value
    ? 'Processing outstanding charges from previous periods'
    : 'Processing regular monthly charges for current period'
);

const pendingCount = computed(() => {
  if (!progress.value) return 0;

  // Convert to numbers, handling potential strings
  const total = Number(progress.value.totalCount) || 0;
  const processed = Number(progress.value.processedCount) || 0;

  // Calculate and validate
  const result = total - processed;

  // Return 0 if result is invalid
  return isNaN(result) || result < 0 ? 0 : result;
});

// Status configuration
const statusConfig = {
  PENDING: {color: 'blue-grey', icon: 'schedule', progressColor: 'primary'},
  PROCESSING: {color: 'primary', icon: 'sync', progressColor: 'primary'},
  CONNECTED: {color: 'primary', icon: 'sync', progressColor: 'primary'},
  COMPLETED: {color: 'positive', icon: 'check_circle', progressColor: 'positive'},
  FAILED: {color: 'negative', icon: 'error', progressColor: 'negative'},
  CANCELLED: {color: 'orange', icon: 'cancel', progressColor: 'warning'},
} as const;

const getStatusColor = (progress: ProgressDTO) => statusConfig[progress?.status]?.color || 'info';
const getProgressColor = (progress: ProgressDTO) => statusConfig[progress?.status]?.progressColor || 'info';
const getStatusIcon = (progress: ProgressDTO) => statusConfig[progress?.status]?.icon || 'info';

// Helper functions
const formatMonthYear = (period: string) => moment(period, 'YYYY-MM').format('MMMM YYYY');
const formatRelativeTime = (timestamp: string) => timestamp ? moment(timestamp).fromNow() : 'N/A';

// Watchers
watch(
  () => dialogStore.chargeProcess,
  async (newValue) => {
    if (newValue) {
      await findSmsAlertCurrencies();
      activeTab.value = 'execution';
    }
  },
  {immediate: true}
);

watch(() => activeTab, (tab) => {
  if (tab.value == 'progress') return;
  sse.progressUpdate.value = {} as ProgressDTO;
})


watch(() => props.selectedCurrency, async (newValue) => {
  if (newValue) {
    await sse.connectSse(newValue?.toString());
  } else {
    sse.disconnect();
  }
});

// Cleanup
onUnmounted(() => {
  sse.disconnect();
});


const formatNumber = (num: any) => {
  if (num == null || isNaN(num)) return '0';
  return num.toLocaleString();
};

const emit = defineEmits<{ close: [] }>();
const onDialogClose = () => emit('close');

async function findSmsAlertCurrencies() {
  try {
    await adminStore.findSmsAlertCurrencies({} as SmsAlertCurrency);
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

async function processSMSCharges() {
  try {
    isProcessing.value = true;

    const request = {
      isAutoRecoveryInitiated: isRecoveryMode.value,
      currencyId: props.selectedCurrency,
    } as ChargeProcessDTO;

    await chargeStore.processSMSCharges(request);

    if (chargeStore.response.code === '0') {
      alerts.showAlert(chargeStore.response);
      activeTab.value = 'progress';
    } else {
      alerts.showAlert(chargeStore.response);
    }
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  } finally {
    isProcessing.value = false;
  }
}

const onClickDownload = () => {
  const fileInfo = Object.fromEntries(sse.progressUpdate.value?.fileInfo);
  if (!fileInfo) return;

  try {
    const fileData = fileInfo?.encodedFileData;
    const fileName = fileInfo?.fileName;

    if (fileData && fileName) {
      const src = `data:application/octet-stream;base64,${fileData}`;
      const link = document.createElement('a');
      link.href = src;
      link.download = fileName;
      link.click();
      link.remove();
    }
  } catch (e) {
    console.log(e);
    alerts.showAlert(utility.getError(e));
  }
};

function closeProgress() {
  if (!isProgressInProgress.value) {
    activeTab.value = 'execution';
  }
  sse.disconnect();
  emit('close');
}
</script>


<style scoped>
.dialog-card {
  min-width: 480px;
  max-width: 560px;
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1565C0 100%);
}

.tab-header {
  background: white;
}

/* Info Cards */
.info-card {
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

/* Mode Container */
.mode-container {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e2e8f0;
}

.mode-hint {
  padding: 6px 8px;
  background: white;
  border-radius: 6px;
  border-left: 3px solid var(--q-primary);
}

/* Summary Box */
.summary-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

/* Warning Box */
.warning-box {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
}

/* Progress Panel */
.status-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.stat-number {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 4px;
  font-family: 'Roboto Mono', monospace;
}

.download-box {
  background: #e8f5e9;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #c8e6c9;
}

.timeline-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

/* Empty State */
.empty-state {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 599px) {
  .dialog-card {
    min-width: 90vw;
    margin: 16px;
  }

  .mode-options :deep(.q-radio) {
    margin-bottom: 8px;
  }
}
</style>
