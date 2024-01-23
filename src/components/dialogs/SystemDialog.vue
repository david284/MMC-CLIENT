<template>

  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 900px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Manage Layout
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

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
        <q-btn color="negative" label="stop Server" @click="clickStop()" no-caps/>
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

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Close" v-close-popup/>
      </q-card-actions>

    </q-card>
  </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref, version} from "vue";
import packageInfo from './../../../package.json';

const store = inject('store')
const name = "SystemDialog"

const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
  console.log(name + `: WATCH model`)
})


onBeforeMount(() => {
})

onMounted(() => {
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickStop = () => {
  console.log(name + `: clickStop`)
  store.methods.STOP_SERVER()
}



</script>

<style scoped>

</style>
