<template>
  <q-dialog v-model="dialogStore.initializer" persistent position="top">
    <q-card class="text-center q-gutter-sm" style="width: 300px">
      <q-spinner-dots color="primary"  style="font-size: 40px"/>
      <span>{{ message }}</span>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">

import {useDialogStore} from "stores/dialog-store";
import {watch} from "vue";

const dialogStore = useDialogStore();

const props = defineProps(['message'])
const emits = defineEmits(['processStage'])

watch(
  () => props.message,
  (newValue) => {
    if (newValue) {
      setTimeout(() => {
        emits('processStage');
      }, 2000)
    }
  }
);

</script>


<style scoped>

</style>
