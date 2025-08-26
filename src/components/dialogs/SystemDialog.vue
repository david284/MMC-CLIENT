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
        <div>Quasar framework {{ $q.version }}

        </div>
        <div>Vue version {{ version }}</div>
      </q-card>

      <q-card class="q-pa-md" flat bordered>
        <a href="https://github.com/david284/MMC-SERVER">MMC-SERVER github repository</a>
      </q-card>

      <q-card class="q-pa-md" flat bordered>
        <div><span class="text-h6">app storage directory &nbsp;</span> {{ store.state.serverStatus.appStorageDirectory }}
          &nbsp; <q-btn dense color="primary" size="xs" label="copy" @click="clickCopyApp()" no-caps/>
        </div>
        <div><span class="text-h6">current user directory &nbsp;</span> {{ store.state.serverStatus.currentUserDirectory }}
          &nbsp; <q-btn dense color="primary" size="xs" label="copy" @click="clickCopyUser()" no-caps/>
        </div>
        <div><span class="text-h6">system directory &nbsp;</span> {{ store.state.serverStatus.systemDirectory }}
          &nbsp; <q-btn dense color="primary" size="xs" label="copy" @click="clickCopySystem()" no-caps/>
        </div>
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

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref, version} from "vue";
import packageInfo from './../../../package.json';
import { copyToClipboard } from 'quasar'

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

const clickCopyApp = () => {
  copyToClipboard(store.state.serverStatus.appStorageDirectory)
  .then(() => {
    // success!
  })
  .catch(() => {
    // fail
  })
}

const clickCopySystem = () => {
  copyToClipboard(store.state.serverStatus.systemDirectory)
  .then(() => {
    // success!
  })
  .catch(() => {
    // fail
  })
}

const clickCopyUser = () => {
  copyToClipboard(store.state.serverStatus.currentUserDirectory)
  .then(() => {
    // success!
  })
  .catch(() => {
    // fail
  })
}


</script>

<style scoped>

</style>
