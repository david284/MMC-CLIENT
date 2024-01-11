<template>
  <div class="bg-primary q-pa-md">
    <div class="q-pa-md bg-white rounded-borders">
      <div class="text-h4">Settings</div>
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
import {inject} from "vue";

const store = inject('store')

</script>

<style scoped>

</style>
