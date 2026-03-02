<template>
  <q-page class="dashboard-page">
    <!-- Header Section with Greeting -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="flex items-center gap-2">
          <q-avatar size="48px" class="bg-primary text-white shadow-2">
            <q-icon name="dashboard" size="28px" />
          </q-avatar>
          <div>
            <div class="text-h4 text-weight-medium text-primary">Dashboard</div>
            <div class="text-subtitle2 text-grey-7">
              <q-icon name="schedule" size="18px" class="q-mr-xs" />
              {{ currentDate }} • {{ greeting }},
            </div>
          </div>
        </div>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn
          flat
          round
          dense
          icon="notifications"
          color="grey-7"
          class="notification-btn"
        >
          <q-badge color="red" floating>3</q-badge>
          <q-tooltip>Notifications</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          icon="refresh"
          color="grey-7"
          @click="refreshData"
          :loading="refreshing"
        >
          <q-tooltip>Refresh Data</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          icon="more_vert"
          color="grey-7"
        >
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="file_download" />
                </q-item-section>
                <q-item-section>Export Report</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>Dashboard Settings</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="help" />
                </q-item-section>
                <q-item-section>Help & Support</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <!-- KPI Cards with Micro-interactions -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div v-for="(stat, index) in statistics" :key="index" class="col-md-3 col-sm-6 col-xs-12">
        <q-card
          class="stat-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @mouseenter="hoveredStat = index"
          @mouseleave="hoveredStat = null"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-overline text-grey-7">{{ stat.title }}</div>
                <div class="text-h3 text-weight-bold q-my-sm">{{ formatNumber(stat.value) }}</div>
                <div class="row items-center">
                  <q-badge
                    :color="stat.trend === 'up' ? 'positive' : 'negative'"
                    class="trend-badge"
                  >
                    <q-icon
                      :name="stat.trend === 'up' ? 'arrow_upward' : 'arrow_downward'"
                      size="14px"
                    />
                    {{ stat.change }}%
                  </q-badge>
                  <span class="text-caption text-grey-6 q-ml-sm">vs last month</span>
                </div>
              </div>
              <div class="col-auto">
                <q-avatar
                  :style="{ background: stat.color + '15' }"
                  :text-color="stat.color"
                  size="60px"
                  class="stat-avatar"
                  :class="{ 'avatar-pulse': hoveredStat === index }"
                >
                  <q-icon :name="stat.icon" size="28px" />
                </q-avatar>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-px-md q-py-sm">
            <q-btn
              flat
              :color="stat.color"
              :label="stat.action"
              size="sm"
              :to="stat.link"
              class="action-btn"
              no-caps
            >
              <q-icon name="east" size="16px" class="q-ml-xs" />
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-md-7 col-xs-12">
        <q-card class="insight-card">
          <q-card-section class="q-pb-none">
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">Today's Overview</div>
                <div class="text-caption text-grey-7">Real-time activity metrics</div>
              </div>
              <div class="col-auto">
                <q-btn flat round dense icon="more_horiz" size="sm">
                  <q-menu>
                    <q-list dense>
                      <q-item clickable>
                        <q-item-section>View Details</q-item-section>
                      </q-item>
                      <q-item clickable>
                        <q-item-section>Export</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <q-card-section>

            <div class="row q-mt-lg">
              <div class="col-12">
                <div class="activity-timeline">
                  <div v-for="(activity, index) in timelineActivities" :key="index" class="timeline-item">
                    <div class="timeline-dot" :style="{ backgroundColor: activity.color }"></div>
                    <div class="timeline-content">
                      <div class="row items-center justify-between">
                        <div>
                          <span class="text-weight-medium">{{ activity.title }}</span>
                          <span class="text-caption text-grey-7 q-ml-sm">{{ activity.time }}</span>
                        </div>
                        <q-badge :color="activity.badgeColor" outline>{{ activity.status }}</q-badge>
                      </div>
                      <div class="text-caption text-grey-6 q-mt-xs">{{ activity.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-5 col-xs-12">
        <q-card class="insight-card">
          <q-card-section class="q-pb-none">
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">Quick Actions</div>
                <div class="text-caption text-grey-7">Frequently used tasks</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="quick-actions-grid">
              <q-btn
                v-for="(action, index) in quickActions"
                :key="index"
                :color="action.color"
                :icon="action.icon"
                :label="action.label"
                stack
                unelevated
                class="quick-action-card"
                :to="action.link"
              >
                <q-badge v-if="action.badge" floating color="red">{{ action.badge }}</q-badge>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Activities Table -->
    <div class="row q-mb-xl">
      <div class="col-12">
        <q-card class="activities-card">
          <q-card-section class="q-pb-none">
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">Recent Activities</div>
                <div class="text-caption text-grey-7">Latest system events and updates</div>
              </div>
              <div class="col-auto q-gutter-sm">
                <q-btn
                  flat
                  dense
                  color="primary"
                  label="View All"
                  to="/activities"
                  size="sm"
                  icon-right="east"
                  no-caps
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="file_download"
                  color="grey-7"
                  size="sm"
                >
                  <q-tooltip>Export Activities</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-none">
            <q-table
              flat
              :rows="recentActivities"
              :columns="activityColumns"
              row-key="id"
              :rows-per-page-options="[5, 10]"
              :pagination="{ rowsPerPage: 5 }"
              hide-bottom
              class="activities-table"
            >
              <template v-slot:body-cell-user="props">
                <q-td :props="props">
                  <div class="flex items-center">
                    <q-avatar size="32px" :color="getAvatarColor(props.row.user)" text-color="white" class="q-mr-sm">
                      {{ props.row.user.charAt(0) }}
                    </q-avatar>
                    <div>
                      <div>{{ props.row.user }}</div>
                      <div class="text-caption text-grey-7">{{ props.row.role }}</div>
                    </div>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-time="props">
                <q-td :props="props">
                  <div class="flex items-center">
                    <q-icon name="access_time" size="14px" class="q-mr-xs text-grey-7" />
                    <span>{{ utility.formatDate(props.value) }}</span>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge
                    :color="statusColor(props.value)"
                    class="status-badge"
                  >
                    <q-icon :name="statusIcon(props.value)" size="14px" class="q-mr-xs" />
                    {{ props.value }}
                  </q-badge>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat round dense icon="more_vert" size="sm">
                    <q-menu>
                      <q-list dense>
                        <q-item clickable v-close-popup>
                          <q-item-section>View Details</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup>
                          <q-item-section>Track Activity</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-td>
              </template>

              <template v-slot:no-data>
                <div class="text-center q-pa-md text-grey-7">
                  <q-icon name="info" size="40px" />
                  <div class="q-mt-sm">No recent activities</div>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- System Status Footer -->
    <div class="row">
      <div class="col-12">
        <q-card flat bordered class="status-footer">
          <q-card-section class="q-py-sm">
            <div class="row items-center justify-between">
              <div class="row items-center q-gutter-md">
                <div class="flex items-center">
                  <q-icon name="circle" size="12px" color="positive" class="q-mr-xs" />
                  <span class="text-caption">All Systems Operational</span>
                </div>
                <q-separator vertical />
                <div class="flex items-center">
                  <q-icon name="cloud" size="18px" color="primary" class="q-mr-xs" />
                  <span class="text-caption">Last backup: Today 02:00 AM</span>
                </div>
              </div>
              <div class="row items-center q-gutter-sm">
                <q-chip size="sm" icon="wifi" color="positive" text-color="white">Live</q-chip>
                <q-chip size="sm" icon="security" color="primary" text-color="white">Secure</q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCommonUtility } from "src/utility/common";
import { useQuasar } from 'quasar';

const $q = useQuasar();
const utility = useCommonUtility();

const refreshing = ref(false);
const hoveredStat = ref(null);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Statistics data
const statistics = ref([
  {
    title: 'Total Users',
    value: 1254,
    change: '12',
    trend: 'up',
    icon: 'people',
    color: '#1976D2',
    action: 'Manage Users',
    link: '/admin/users'
  },
  {
    title: 'Active Alerts',
    value: 432,
    change: '5',
    trend: 'down',
    icon: 'notifications_active',
    color: '#26A69A',
    action: 'View Alerts',
    link: '/admin/alerts'
  },
  {
    title: 'Pending Charges',
    value: 87,
    change: '23',
    trend: 'up',
    icon: 'pending_actions',
    color: '#F2C037',
    action: 'Process Now',
    link: '/admin/charges'
  },
  {
    title: 'Messages Sent',
    value: '56',
    change: '8',
    trend: 'up',
    icon: 'message',
    color: '#9C27B0',
    action: 'View History',
    link: '/admin/messages'
  }
]);

// Quick actions
const quickActions = ref([
  { icon: 'add_alert', label: 'Create Alert', color: 'primary', link: '/alerts/new' },
  { icon: 'send', label: 'Send Message', color: 'secondary', link: '/messages/new', badge: '3' },
  { icon: 'assessment', label: 'Reports', color: 'accent', link: '/reports' },
  { icon: 'people', label: 'Add User', color: 'positive', link: '/users/new' },
  { icon: 'settings', label: 'Settings', color: 'grey-7', link: '/settings' },
  { icon: 'help', label: 'Support', color: 'purple', link: '/support' }
]);

// Timeline activities
const timelineActivities = ref([
  {
    title: 'New user registration',
    time: '5 minutes ago',
    description: 'John Smith created a new account',
    status: 'Completed',
    badgeColor: 'positive',
    color: '#1976D2'
  },
  {
    title: 'Alert triggered',
    time: '15 minutes ago',
    description: 'Payment threshold exceeded for Account #12345',
    status: 'Active',
    badgeColor: 'warning',
    color: '#F2C037'
  },
  {
    title: 'System update',
    time: '1 hour ago',
    description: 'Scheduled maintenance completed successfully',
    status: 'Completed',
    badgeColor: 'positive',
    color: '#26A69A'
  }
]);

// Upcoming tasks
const upcomingTasks = ref([
  { title: 'Review pending charges', due: 'Today, 5:00 PM', priority: 'High', priorityColor: 'negative', completed: false },
  { title: 'Monthly report generation', due: 'Tomorrow, 9:00 AM', priority: 'Medium', priorityColor: 'warning', completed: false },
  { title: 'User permission audit', due: 'Feb 28, 2026', priority: 'Low', priorityColor: 'positive', completed: true }
]);

// Recent activities
const recentActivities = ref([
]);

const activityColumns = ref([
  { name: 'action', label: 'Activity', field: 'action', align: 'left' },
  { name: 'user', label: 'User', field: 'user', align: 'left' },
  { name: 'time', label: 'Time', field: 'time', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' }
]);

function getAvatarColor(user: string) {
  const colors = ['primary', 'secondary', 'accent', 'positive', 'warning', 'negative'];
  const index = user.charCodeAt(0) % colors.length;
  return colors[index];
}

function statusColor(status: string) {
  const colors: Record<string, string> = {
    'success': 'positive',
    'completed': 'positive',
    'active': 'warning',
    'pending': 'warning',
    'failed': 'negative'
  };
  return colors[status.toLowerCase()] || 'grey';
}

function statusIcon(status: string) {
  const icons: Record<string, string> = {
    'success': 'check_circle',
    'completed': 'check_circle',
    'active': 'bolt',
    'pending': 'schedule',
    'failed': 'error'
  };
  return icons[status.toLowerCase()] || 'help';
}

function formatNumber(value: number | string) {
  if (typeof value === 'string') return value;
  return new Intl.NumberFormat().format(value);
}

async function refreshData() {
  refreshing.value = true;
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  refreshing.value = false;
  $q.notify({
    type: 'positive',
    message: 'Dashboard data refreshed',
    position: 'top-right',
    timeout: 2000
  });
}
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* Stat Cards */
.stat-card {
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  background: white;
  overflow: hidden;
  animation: slideInUp 0.5s ease forwards;
  opacity: 0;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.stat-avatar {
  transition: all 0.3s ease;
}

.avatar-pulse {
  animation: pulse 1s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.trend-badge {
  padding: 4px 8px;
  border-radius: 30px;
  font-weight: 500;
}

/* Insight Cards */
.insight-card {
  border-radius: 20px;
  background: white;
  transition: all 0.3s ease;
  height: 100%;
}

.insight-card:hover {
  box-shadow: 0 25px 30px -12px rgba(0, 0, 0, 0.1) !important;
}

.rounded-progress {
  border-radius: 30px;
}

/* Activity Timeline */
.activity-timeline {
  position: relative;
  padding-left: 20px;
}

.activity-timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: linear-gradient(to bottom, #1976D2, #26A69A, #F2C037);
  opacity: 0.2;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
}

.timeline-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: absolute;
  left: -20px;
  top: 4px;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-content {
  flex: 1;
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.timeline-content:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

/* Quick Actions Grid */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-action-card {
  height: 100px;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: #f8fafc !important;
  color: #1e293b !important;
}

.quick-action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  background: white !important;
}

/* Task Items */
.task-item {
  border-radius: 10px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: #f8fafc;
}

.text-strikethrough {
  text-decoration: line-through;
  color: #94a3b8;
}

/* Activities Table */
.activities-card {
  border-radius: 20px;
  background: white;
  overflow: hidden;
}

.activities-table :deep(.q-table) {
  border-radius: 0;
}

.activities-table :deep(thead tr) {
  background: #f8fafc;
}

.activities-table :deep(thead th) {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activities-table :deep(tbody tr) {
  transition: all 0.2s ease;
}

.activities-table :deep(tbody tr:hover) {
  background: #f1f5f9 !important;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 30px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

/* Status Footer */
.status-footer {
  border-radius: 16px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Notification Button */
.notification-btn {
  position: relative;
  animation: gentleShake 10s ease infinite;
}

@keyframes gentleShake {
  0%, 100% { transform: rotate(0); }
  1% { transform: rotate(5deg); }
  2% { transform: rotate(-5deg); }
  3% { transform: rotate(3deg); }
  4% { transform: rotate(-3deg); }
  5% { transform: rotate(0); }
}

/* Responsive */
@media (max-width: 1023px) {
  .dashboard-page {
    padding: 16px;
  }

  .stat-card {
    margin-bottom: 8px;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .quick-action-card {
    height: 80px;
    font-size: 12px;
  }
}

@media (max-width: 599px) {
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
