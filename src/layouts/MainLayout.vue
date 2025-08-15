<template>
  <q-layout class="welcome-card page-content"  view="lHh Lpr lFf">
    <menu-bar ></menu-bar>
    <q-page-container  >
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">

import MenuBar from "components/navigation/MenuBar.vue";
import AppFooter from "components/AppFooter.vue";
</script>


<style scoped>
.welcome-card {
  border-radius: 12px;
  background: rgba(25, 118, 210, 0.14);
  transition: transform 0.3s ease;
}

</style>
