<template>

  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 900px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense q-py-none">
        <div class="text-h6">
          System
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

      <q-card v-if="(store.state.develop)" class="q-pa-md" flat>
        <q-btn color="positive" label="Backup" @click="clickBackup()" no-caps/>
        &emsp; Open the dialog to manage backups
      </q-card>

      <q-card class="q-pa-md" flat v-show="store.state.advanced">
        <q-input
          label="Base Node Number"
          outlined
          v-model="store.state.layout.layoutDetails.baseNodeNumber"
          @change="store.methods.update_layout()">
        </q-input>
      </q-card>
      <q-card class="q-pa-md" flat>
        <q-checkbox v-model="store.state.develop" label="Develop"></q-checkbox>
        &emsp;&emsp;&emsp;Enables development features
      </q-card>

      <q-card-actions align="right" class="text-primary">
      </q-card-actions>

    </q-card>
  </q-dialog>

  <backupDialog v-model='showBackupDialog' />

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref, version} from "vue";
import packageInfo from './../../../package.json';
import backupDialog from "components/dialogs/BackupDialog"

const store = inject('store')
const name = "SystemDialog"
const showBackupDialog = ref(false)

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

const clickBackup = () => {
  console.log(name + `: clickBackup`)
  showBackupDialog.value = true
}



</script>

<style scoped>

</style>
