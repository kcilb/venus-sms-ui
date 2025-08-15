import {acceptHMRUpdate, defineStore} from "pinia";
import {ref} from "vue";

export const useDialogStore = defineStore('dialog', {
  state: () => ({
    initializer: ref(false),
  }),

  getters: {},

  actions: {},
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDialogStore, import.meta.hot));
}
