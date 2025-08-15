<template>
  <q-footer class="q-mb-md">
  <div class="text-center">
    <div class="text-caption text-grey-7 q-mb-xs">
      <span class="text-grey-5 unclickable">Need help?</span> |
      <span class="text-grey-5 unclickable">Terms</span> |
      <span class="text-grey-5 unclickable">Privacy</span> |
      <span class="text-grey-5 unclickable">v1.0.0</span>
    </div>
    <div :class="getModeColor()">
      © {{ moment().format("yyyy") }} Neptune Financial Software. All rights reserved.
    </div>
  </div>

  </q-footer>
</template>

<script setup lang="ts">

import moment from "moment";
import {onMounted} from "vue";
import {useRoute} from "vue-router";

const route = useRoute();

function getModeColor() {
  const baseClass = 'text-caption';
  return route.path.includes('modules')
    ? `${baseClass} text-grey-2`
    : `${baseClass} text-grey-5`;
}
</script>


<style scoped>

</style>
