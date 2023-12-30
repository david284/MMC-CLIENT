<template>
  <div class="bg-primary q-pa-md">
    <div class="q-pa-md bg-white rounded-borders">
      <div class="text-h4">System</div>
      <q-card class="q-pa-md" flat bordered>
        <div class="text-h6">Backend</div>
        <div>Backend App version {{ JSON.stringify(store.state.version.App) }}</div>
        <div>API version {{ JSON.stringify(store.state.version.API) }}</div>
        <div>node version {{ JSON.stringify(store.state.version.node) }}</div>
      </q-card>
      <q-card class="q-pa-md" flat bordered>
        <div class="text-h6">Frontend</div>
        <div>Frontend App version {{ packageInfo.version }}</div>
        <div>Quasar framework {{ $q.version }}</div>
        <div>Vue version {{ version }}</div>
      </q-card>
      <q-card class="q-pa-md" flat>
        <q-btn color="negative" label="stop Server" @click="stop1()" no-caps/>
        This will signal the server to stop and close the page
      </q-card>
    </div>
  </div>
</template>

<script setup>
import {inject, version} from "vue";
import packageInfo from './../../package.json';

const store = inject('store')


const stop1 = () => {
  store.methods.STOP_SERVER()
}


</script>

<style scoped>

</style>
