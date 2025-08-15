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
        <q-btn v-if="utility.getMenuCode() == 'BLOTTERS'" dense flat round
               @click="router.push('/blotters/workflow-items')" icon="notifications">
          <q-badge rounded color="red" floating transparent>
            {{ workflowStore.workflowItems.length }}
          </q-badge>
        </q-btn>
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
import {useCommonUtility} from "src/utils/common";
import {useWorkFlowStore} from "stores/workflow-store";
import InitializerDialog from "components/dialogs/InitializerDialog.vue";
import {useDialogStore} from "stores/dialog-store";
import {WorkflowRequest} from "components/models";

const workflowStore = useWorkFlowStore();
const router = useRouter();
const route = useRoute();
const leftDrawerOpen = ref(true);
const isMiniMode = ref(false);
const utility = useCommonUtility();
const dialogStore = useDialogStore();
const workFlowStore = useWorkFlowStore();


onMounted(() => {
  if (router.currentRoute.value.fullPath.includes('blotters')) {
    isMiniMode.value = true;
    findPendingWorkFlowItems();
  }
})


const menuItems = {
  ADMIN: [
    {
      name: 'Dashboard', icon: 'dashboard', route: '/admin',
      activeRoutes: ['Dashboard'], available: true
    },
    {
      name: 'Approval Route', icon: 'admin_panel_settings', route: '/admin/approval-routes',
      activeRoutes: ['RouteList', 'CreateRoute', 'EditRoute'], available: true
    },
    {
      name: 'Roles', icon: 'admin_panel_settings', route: '/admin/roles',
      activeRoutes: ['RoleList', 'CreateRole', 'EditRole'], available: true
    },
    {
      name: 'Branch', icon: 'business', route: '/admin/branches',
      activeRoutes: ['BranchList'], available: true
    },
    {
      name: 'Dealers', icon: 'supervisor_account', route: '/admin/users',
      activeRoutes: ['UserList', 'CreateUser', 'EditUser'], available: true
    },
    {
      name: 'Books', icon: 'menu_book', route: '/admin/books',
      activeRoutes: ['BookList', 'CreateBook', 'EditBook'], available: true
    },
    {
      name: 'Brokers', icon: 'business_center', route: '/admin/brokers',
      activeRoutes: ['BrokerList', 'CreateBroker', 'EditBroker'], available: true
    },
    {
      name: 'Counterparty Definition', icon: 'account_balance', route: '/admin/counter-party-definitions',
      activeRoutes: ['CounterPartyList', 'CreateCounterParty', 'EditCounterParty'], available: true
    },
    {
      name: 'Currency', icon: 'attach_money', route: '/admin/currency',
      activeRoutes: ['CurrencyList', 'CreateCurrency', 'EditCurrency'], available: true
    },
    {
      name: 'Currency Holiday', icon: 'event_busy', route: '/admin/currency-holiday',
      activeRoutes: ['CurrencyHolidayList', 'CreateCurrencyHoliday', 'EditCurrencyHoliday'], available: true
    },
    {
      name: 'Exchange Rate', icon: 'currency_exchange', route: '/admin/exchange-rates',
      activeRoutes: ['ExchangeRateList', 'CreateExchangeRate', 'EditExchangeRate'], available: true
    },
    {
      name: 'Currency Pairs', icon: 'currency_exchange', route: '/admin/currency-pairs',
      activeRoutes: ['CurrencyPairList', 'CreateCurrencyPair', 'EditCurrencyPair'], available: true
    },
    {
      name: 'Trade Limits', icon: 'trending_up', route: '/admin/trade-limits',
      activeRoutes: ['TradeLimitList', 'CreateTradeLimit', 'EditTradeLimit'], available: true
    },
    {
      name: 'Dealing Parameters', icon: 'tune', route: '/admin/dealing-parameters',
      activeRoutes: ['DealingParamList', 'CreateDealingParam', 'EditDealingParam'], available: true
    },
    {
      name: 'Nostro Account', icon: 'account_balance_wallet', route: '/admin/nostro-settlement-accounts',
      activeRoutes: ['NostroAccountList', 'NostroAccountCreate', 'NostroAccountEdit'], available: true
    },

    {
      name: 'Tax Rate', icon: 'percent', route: '/admin/tax-rates',
      activeRoutes: ['TaxRateList', 'CreateTaxRate', 'EditTaxRate'], available: true
    },
    {name: 'Audit Logs', icon: 'history', route: '/admin/audit-logs', available: true}
  ],
  FRONT_OFFICE: [
    {
      name: 'Dashboard',
      icon: 'dashboard',
      route: '/front-office',
      activeRoutes: ['FrontOffice'], available: true
    },

    {
      name: 'Discounted Deposit',
      icon: 'account_balance_wallet',
      route: '/front-office/discounted-deposit',
      activeRoutes: ['DiscountedDeposit', 'DiscountedDepositCreate', 'DiscountedDepositEdit'], available: false
    },
    {
      name: 'Forward Rate Agreement',
      icon: 'timeline',
      route: '/front-office/forward-rate-agreement',
      activeRoutes: ['ForwardRateAgreement', 'ForwardRateAgreementCreate', 'ForwardRateAgreementEdit'], available: false
    },
    {
      name: 'Fx Forward',
      icon: 'trending_flat',
      route: '/front-office/fx-forward',
      activeRoutes: ['FxForward', 'FxForwardCreate', 'FxForwardEdit'], available: true
    },
    {
      name: 'Fx Spot',
      icon: 'bolt',
      route: '/front-office/fx-spot',
      activeRoutes: ['FxSpot', 'FxSpotCreate', 'FxSpotEdit'], available: true
    },
    {
      name: 'Fx Swap',
      icon: 'sync_alt',
      route: '/front-office/fx-swap',
      activeRoutes: ['FxSwap', 'FxSwapCreate', 'FxSwapEdit'], available: true
    },
    {
      name: 'Certificate Of Deposit',
      icon: 'verified',
      route: '/front-office/negotiable-certificate-of-deposit',
      activeRoutes: ['NegotiableCertificateOfDeposit', 'NegotiableCertificateOfDepositCreate', 'NegotiableCertificateOfDepositEdit']
      , available: false
    },
    {
      name: 'Placement And Borrowings',
      icon: 'account_balance',
      route: '/front-office/placement-and-borrowing',
      activeRoutes: ['PlacementAndBorrowing', 'PlacementAndBorrowingCreate', 'PlacementAndBorrowingEdit'],
      available: true
    },
    {
      name: 'Repurchase Agreement',
      icon: 'autorenew',
      route: '/front-office/repurchase-agreement',
      activeRoutes: ['RepurchaseAgreement', 'RepurchaseAgreementCreate', 'RepurchaseAgreementEdit'], available: false
    },
    {
      name: 'Scheduled Deposit',
      icon: 'schedule',
      route: '/front-office/scheduled-deposit',
      activeRoutes: ['ScheduledDeposit', 'ScheduledDepositCreate', 'ScheduledDepositEdit'], available: false
    },
    {
      name: 'Security Deal',
      icon: 'security',
      route: '/front-office/security-deal',
      activeRoutes: ['SecurityDeal', 'SecurityDealCreate', 'SecurityDealEdit'], available: false
    },
    {
      name: 'Security Position',
      icon: 'shield',
      route: '/front-office/security-position',
      activeRoutes: ['SecurityPosition', 'SecurityPositionCreate', 'SecurityPositionEdit'], available: true
    },

  ],
  BACK_OFFICE: [
    {
      name: 'Dashboard', icon: 'space_dashboard', route: '/back-office',
      activeRoutes: ['BackOffice'], available: true
    },
    {
      name: 'RTGS', icon: 'account_balance', route: '/back-office/rtgs',
      activeRoutes: ['RTGS', 'RTGSCreate', 'RTGSEdit'], available: false
    },
    {
      name: 'Letters', icon: 'mark_email_read', route: '/back-office/letters',
      activeRoutes: ['Letters', 'LetterCreate', 'LetterEdit'], available: false
    },
    {
      name: 'Swift', icon: 'compare_arrows', route: '/back-office/swift',
      activeRoutes: ['Swift', 'SwiftCreate', 'SwiftEdit'], available: false
    },
  ],

  MIDDLE_OFFICE: [
    {
      name: 'Dashboard', icon: 'space_dashboard', route: '/middle-office',
      activeRoutes: ['MiddleOffice'], available: true
    },
    {
      name: 'Nostro Balances', icon: 'account_balance_wallet', route: '/middle-office/nostro-balances',
      activeRoutes: ['NostroBalance', 'NostroBalanceView'], available: true
    },
    {
      name: 'Security Definition', icon: 'security', route: '/middle-office/security-definitions',
      activeRoutes: ['DefinitionList', 'CreateDefinition', 'EditDefinition'], available: true
    },
    {
      name: 'Trade / Deal Entry Profile', icon: 'view_timeline', route: '/middle-office/trade-profiles',
      activeRoutes: ['ProfileList', 'ProfileCreate', 'ProfileEdit'], available: true
    },
    {
      name: 'Country Limits', icon: 'public', route: '/middle-office/country-limits',
      activeRoutes: ['CountryLimit', 'CountryLimitCreate', 'CountryLimitEdit'], available: true
    },
    {
      name: 'Fixing', icon: 'gavel', route: '/middle-office/fixings',
      activeRoutes: ['Fixing', 'FixingCreate', 'FixingEdit'], available: true
    },
    {
      name: 'Mark to Market', icon: 'show_chart', route: '/middle-office/mark-to-market-history',
      activeRoutes: ['MTM', 'MTMCreate', 'MTMEdit'], available: true
    },
    {
      name: 'Rate Index', icon: 'bar_chart', route: '/middle-office/rate-index',
      activeRoutes: ['RateIndex', 'RateIndexCreate', 'RateIndexEdit'], available: true
    },
    {
      name: 'Security Rate', icon: 'trending_up', route: '/middle-office/security-rate',
      activeRoutes: ['SecurityRate', 'SecurityRateCreate', 'SecurityRateEdit'], available: true
    },
  ],

  BLOTTERS: [
    {
      name: 'Deals List', icon: 'format_list_numbered', route: '/blotters/deals-list',
      activeRoutes: ['Deals', 'DealDetail'], available: true
    },
    {
      name: 'Pending Approval',
      icon: 'view_timeline',
      route: '/blotters/workflow-items',
      activeRoutes: ['WorkFlow', 'WorkFlowFx', 'WorkFlowSpot', 'WorkFlowSwap', 'WorkFlowPANDB', 'WorkFlowTB'],
      available: true
    },
    {
      name: 'Reports', icon: 'add_chart', route: '/blotters/reports',
      activeRoutes: ['Report'], available: true
    },

  ]
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


async function findPendingWorkFlowItems() {
  try {
    let request = {} as WorkflowRequest;
    request.userRoleId = utility.getAuthData().userRoleId;
    request.loginId = utility.getAuthData().loginId;
    await workFlowStore.findPendingWorkFlowItem(request);
    if (workFlowStore.response.code !== '00') {
      return;
    }
  } catch (e) {
    console.log(e);
  }
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
