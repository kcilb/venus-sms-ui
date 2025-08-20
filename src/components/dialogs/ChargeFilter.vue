<template>
  <q-dialog v-model="dialogStore.filter" persistent>

    <q-card style="width: 500px; max-width: 90vw;">
      <q-card-section class="bg-primary">
        <q-toolbar
          class="q-pa-sm text-h6 text-white">
          CHARGE FILTER
          <q-space></q-space>
          <q-btn icon="close" flat round dense @click="dialogStore.filter = false">
            <q-tooltip style="font-size: 13px">close</q-tooltip>
          </q-btn>
        </q-toolbar>

      </q-card-section>
      <q-card-section>

        <q-form ref="searchForm">
          <div class="row flex-center q-col-gutter-sm col-12">
            <div class="col-6">
              <q-input type="date" outlined dense v-model="formData.startDate">

              </q-input>
            </div>
            <div class="col-6">
              <q-input type="date" outlined dense v-model="formData.endDate">

              </q-input>
            </div>
          </div>

          <div class="row q-pt-sm justify-end">
            <q-btn @click="onClickSearch" color="positive" no-caps>Search</q-btn>
          </div>
        </q-form>

      </q-card-section>
    </q-card>

  </q-dialog>
</template>

<script setup lang="ts">

import {useDialogStore} from "stores/dialog-store";
import {ref, watch} from "vue";


const props = defineProps(['filterData'])
const dialogStore = useDialogStore();
const emits = defineEmits(['onDefineFilterCriteria'])

const searchForm = ref(null);


const formData = ref({
  startDate: null,
  endDate: null
})


watch(
  () => props.filterData,
  (newValue) => {
    console.log('xsxsxs');
    formData.value.startDate = newValue.startDate;
    formData.value.endDate = newValue.endDate;
  }
);

function onClickSearch() {
  emits('onDefineFilterCriteria', formData.value)
}


</script>


<style scoped>

</style>
