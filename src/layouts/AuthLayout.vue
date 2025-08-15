<template>
  <q-layout class="logo-bg" view="hHh Lpr lff">
    <q-page-container>
      <router-view/>
    </q-page-container>
    <app-footer style="background: none"/>

  </q-layout>

</template>

<script setup lang="ts">

import AppFooter from "components/AppFooter.vue";
</script>

<style scoped>

</style>
