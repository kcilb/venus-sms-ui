<template>
  <q-header elevated style=" background: linear-gradient(135deg, #1976d2 0%, #004ba0 100%);" class="text-white">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        @click="toggleDrawerState"
        class="q-mr-sm"
      />
      <q-space/>

      <div class="q-gutter-sm row items-center no-wrap">
        <q-chip color="white" outline>Process Date: {{ utility.formatProcessingDate() }}</q-chip>
        <!--        <q-btn v-if="utility.getMenuCode() == 'BLOTTERS'" dense flat round-->
        <!--               @click="router.push('/blotters/workflow-items')" icon="notifications">-->
        <!--          <q-badge rounded color="red" floating transparent>-->
        <!--            {{ workflowStore.workflowItems.length }}-->
        <!--          </q-badge>-->
        <!--        </q-btn>-->
        <q-btn-dropdown dropdown-icon="expand_more" flat dense no-caps>
          <template v-slot:label>
            <div class="row items-center no-wrap">
              <q-avatar size="32px" class="q-mr-sm">
                <img src="~/assets/images/avatar-1.jpg">
              </q-avatar>
            </div>
          </template>
          <q-list>
            <q-item clickable v-close-popup @click="onClickChange">
              <q-item-section avatar>
                <q-icon name="password"/>
              </q-item-section>
              <q-item-section>Change Password</q-item-section>
            </q-item>
            <q-separator></q-separator>

            <q-item clickable v-close-popup @click="router.push('/modules')">
              <q-item-section avatar>
                <q-icon name="swap_horiz"/>
              </q-item-section>
              <q-item-section>Switch Module</q-item-section>
            </q-item>
            <q-separator></q-separator>
            <q-item clickable v-close-popup @click="onClickLogout">
              <q-item-section avatar>
                <q-icon name="logout"/>
              </q-item-section>
              <q-item-section>Logout</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-toolbar>
  </q-header>
  <q-drawer
    v-model="leftDrawerOpen"
    show-if-above
    bordered
    :mini="isMiniMode"
    :width="280"
    :mini-width="70"
    class="sidebar"
    behavior="desktop"
  >
    <q-scroll-area class="fit">
      <div class="sidebar-header">
        <div class="row items-center q-pa-md" :class="{ 'justify-center': isMiniMode }">
          <q-icon
            name="account_balance_wallet"
            size="28px"
            color="primary"
            class="sidebar-header-icon"
          />
          <div v-if="!isMiniMode" class="q-ml-sm">
            <div class="text-h6 text-weight-bold">Treasury</div>
            <div class="text-caption text-grey-6">v1.0.0</div>
          </div>
        </div>
      </div>

      <q-separator v-show="!isMiniMode"/>


      <q-list padding class="menu-list">
        <q-item
          v-for="item in menuItems[menuCode]"
          :key="item.name"
          :active="isRouteActive(item)"
          :active-class="'active-menu-item'"
          clickable
          v-ripple
          :to="item.available ? item.route : null"
          exact
          class="menu-item"
          :class="{ 'disabled-item': !item.available }"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon"/>
          </q-item-section>

          <q-item-section v-show="!isMiniMode">
            {{ item.name }}
          </q-item-section>

          <q-tooltip v-if="isMiniMode" anchor="center right" self="center left" :offset="[10, 10]">
            {{ item.name }}
          </q-tooltip>

          <q-tooltip v-if="!item.available" anchor="center right" self="center left" :offset="[10, 10]">
            {{ item.name }}
            <span v-if="!item.available"> (Coming Soon)</span>
          </q-tooltip>

        </q-item>
      </q-list>

    </q-scroll-area>

    <initializer-dialog @processStage="processStage" :message="message "/>
  </q-drawer>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {useRoute, useRouter} from "vue-router";
import InitializerDialog from "components/dialogs/InitializerDialog.vue";
import {useDialogStore} from "stores/dialog-store";
import {useCommonUtility} from "src/utility/common";

const router = useRouter();
const route = useRoute();
const leftDrawerOpen = ref(true);
const isMiniMode = ref(false);
const utility = useCommonUtility();
const dialogStore = useDialogStore();


const menuItems = {
  ADMIN: [
    {
      name: 'Dashboard', icon: 'dashboard', route: '/admin',
      activeRoutes: ['Dashboard'], available: true
    },
    {
      name: 'User', icon: 'admin_panel_settings', route: '/admin/users',
      activeRoutes: ['UserList', 'CreateUser', 'EditUser'], available: true
    },
    {
      name: 'Roles', icon: 'admin_panel_settings', route: '/admin/roles',
      activeRoutes: ['RoleList', 'CreateRole', 'EditRole'], available: true
    },
    {
      name: 'Alerts', icon: 'admin_panel_settings', route: '/admin/alerts',
      activeRoutes: ['AlertList', 'CreateAlert', 'EditAlert'], available: true
    },
    {
      name: 'Currency & Charges', icon: 'admin_panel_settings', route: '/admin/currency',
      activeRoutes: ['CurrencyList', 'CreateCurrency', 'EditCurrency'], available: true
    },

    {
      name: 'Charge', icon: 'business', route: '/admin/branches',
      activeRoutes: ['ChargeHistory'], available: true
    },
  ],

};


const menuCode = computed(() => {
  if (!sessionStorage.getItem('MENU_CODE'))
    router.go(-1);
  else
    return sessionStorage.getItem('MENU_CODE') || router.go(-1)
})

function isRouteActive(item: any) {
  return item.activeRoutes
    ? item.activeRoutes.includes(route.name)
    : route.name === item.route.name;
}


const toggleDrawerState = () => {
  if (!leftDrawerOpen.value) {
    leftDrawerOpen.value = true;
    isMiniMode.value = true;
  } else if (isMiniMode.value) {
    isMiniMode.value = false;
  } else {
    leftDrawerOpen.value = false;
  }
};

function onClickChange() {
  utility.storePasswordChangeFlag("N");
  router.push('/auth/password-change')
}

function onClickLogout() {
  message.value = 'Logging out ...'
  dialogStore.initializer = !dialogStore.initializer;
}


const message = ref('');

function processStage() {
  dialogStore.initializer = !dialogStore.initializer;
  if (!dialogStore.initializer)
    router.push('/auth/login');
}


</script>

<style scoped>


.sidebar {

  border-right: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;

  .sidebar-header {
    &-icon {
      min-width: 48px;
      display: flex;
      justify-content: center;
    }
  }

  .menu-list {
    padding: 8px 0;

    .menu-item {
      margin: 4px 8px;
      border-radius: 8px;
      color: #5f6368;
      transition: all 0.3s ease;
      min-height: 40px;
      white-space: nowrap;
      overflow: hidden;

      .q-icon {
        color: #5f6368;
        margin-left: 4px;
        min-width: 24px;
      }

      &:hover {
        border: 1px solid #1976d2;
        background: rgba(25, 118, 210, 0.18);
        color: #1976d2;

        .q-icon {
          color: #1976d2;
        }
      }

      &.active-menu-item {
        background: linear-gradient(135deg, #1976d2 0%, #004ba0 100%);
        color: #e3f2fd;


        .q-icon {
          color: #e3f2fd;
        }

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #1976d2;
          border-radius: 4px 0 0 4px;
        }
      }
    }
  }


  &.q-drawer--mini {
    .menu-item {
      justify-content: center;
      padding: 8px 0;

      .q-item__section--avatar {
        min-width: 0;
        margin-right: 0;
      }
    }
  }
}

.menu-list .disabled-item {
  opacity: 0.7;
  cursor: not-allowed;
}

.menu-list .disabled-item .q-item__section {
  color: #999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


</style>
