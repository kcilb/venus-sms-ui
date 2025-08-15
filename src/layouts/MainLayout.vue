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
</script>


<style scoped>
.welcome-card {
  border-radius: 12px;
  background: #f4fffc;
  transition: transform 0.3s ease;
}

</style>
