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
      <q-card class="q-pa-md" flat v-show="store.state.advanced">
        <q-input
          label="Next Assigned Node ID"
          hint="hint"
          outlined
          v-model="store.state.layout.layoutDetails.nextNodeId"
          @change="store.methods.update_layout()">
        </q-input>
        <q-checkbox v-model="store.state.layout.layoutDetails.assignId" label="Assign Id"></q-checkbox>
      </q-card>
      <q-card class="q-pa-md" flat>
        <q-checkbox v-model="store.state.debug" label="Debug"></q-checkbox>
        <q-checkbox v-model="store.state.advanced" label="Advanced"></q-checkbox>
        <q-checkbox v-model="store.state.develop" label="Develop"></q-checkbox>
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
