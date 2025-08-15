import {acceptHMRUpdate, defineStore} from "pinia";
import {ref} from "vue";

export const useDialogStore = defineStore('dialog', {
  state: () => ({
    mtm: ref(false),
    exchangeRate: ref(false),
    approvalStage: ref(false),
    approvalPath: ref(false),
    nostroAccountBalance: ref(false),
    branch: ref(false),
    initializer: ref(false),
    instrumentType: ref(false),
    glInterface: ref(false),
    relatedEntries: ref(false),
    dealFilter: ref(false),
    nostroFilter: ref(false),
    counterPartyLimit: ref(false),
    scheduleAndSettlementDetails: ref(false),
    securitySubType: ref(false),
    securityIssues: ref(false),
  }),

  getters: {},

  actions: {},
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDialogStore, import.meta.hot));
}
