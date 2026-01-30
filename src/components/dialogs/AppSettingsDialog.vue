<template>

  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 800px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense q-py-none">
        <div class="text-h6">
          App Settings
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card class="q-pa-sm q-ma-none text-subtitle1">
        Unless stated otherwise,  these settings will only take effect the next time MMC is started
      </q-card>

      <q-card style="min-height: 200px;" class="q-py-none q-ma-none">

        <q-card-section class="q-py-none q-ma-none row">
          <q-card-section style="width: 250px;" class="q-py-none q-ma-none">
            <q-checkbox v-model="develop" label="Develop"
              @update:model-value="Develop_updated"></q-checkbox>
          </q-card-section>
          <q-card-section style="width: 500px;" class="q-py-none q-ma-none">
            Enables development features.
            Has immediate effect.
          </q-card-section>
        </q-card-section>

        <q-card-section style="border" class="q-py-none q-ma-none row">
          <q-card-section style="width: 250px;" class="q-py-none q-ma-none">
            <q-checkbox v-model="resetDisplaySettings" label="reset display settings"
              @update:model-value="resetDisplaySettings_updated"></q-checkbox>
          </q-card-section>
          <q-card-section style="width: 500px;" class="q-py-none q-ma-none">
            resets display settings at startup
          </q-card-section>
        </q-card-section>

        <q-card-section class="q-py-none q-ma-none row">
          <q-card-section style="width: 250px;" class="q-py-none q-ma-none">
            <q-select
              autofocus
              outlined
              v-model="userDataMode"
              :options="mode_options"
              label="user data mode"
            />
          </q-card-section>
          <q-card-section style="width: 500px;" class="q-py-none q-ma-none">
            selects which directory to use for user data<br>
            APP - use system defined directory<br>
            CUSTOM - use custom user directory
          </q-card-section>
        </q-card-section>

        <q-card-section class="q-py-none q-ma-none row">
          <q-card-section style="width: 250px;" class="q-py-none q-ma-none">
              <q-input
                autofocus
                class="q-pa-sm"
                outlined
                type="url"
                v-model="customUserDirectory"
                label="custom user directory"
                >
              </q-input>
          </q-card-section>
          <q-card-section style="width: 500px;" class="q-py-none q-ma-none">
            <br>sets the custom directory for user data
          </q-card-section>
        </q-card-section>

        <q-card-section class="q-py-none q-ma-none row">
          <q-card-section style="width: 250px;" class="q-py-none q-ma-none">
              <q-input
                autofocus
                class="q-pa-sm"
                outlined
                type="number"
                v-model="archiveLogsLimit"
                label="archive Logs Limit"
                >
              </q-input>
          </q-card-section>
          <q-card-section style="width: 500px;" class="q-py-none q-ma-none">
            <br>oldest archive will be deleted when this limit reached
          </q-card-section>
        </q-card-section>

      </q-card>

      <q-separator />
      <q-card-section class="q-pa-md">
        <div><span class="text-h6">App storage directory &nbsp;</span> {{ store.state.serverStatus.appStorageDirectory }}
          &nbsp; <q-btn dense color="primary" size="xs" label="copy" @click="clickCopyApp()" no-caps/>
        </div>
      </q-card-section>

      <q-separator />
      <q-card-section class="q-pa-sm">
        <div class="q-pa-xs">
          <div class="text-h6">App Settings<br></div>
          <div class="text-body2">
            <pre>{{ store.state.serverStatus.appSettings }}</pre>
          </div>
        </div>
      </q-card-section>

    </q-card>

  </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref, version} from "vue";
import { copyToClipboard } from 'quasar'
import * as utils from "components/functions/utils.js"

const store = inject('store')
const name = "AppSettingsDialog"
const develop = ref()
const resetDisplaySettings = ref()
const userDataMode = ref()
const mode_options =  ref(['APP', 'CUSTOM'])
const customUserDirectory = ref()
const archiveLogsLimit = ref()

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
  utils.timeStampedLog(name + `: WATCH model`)
  let appSettings = store.state.serverStatus.appSettings
  develop.value = (appSettings.develop != undefined) ? appSettings.develop : false
  resetDisplaySettings.value = (appSettings.resetDisplaySettings != undefined) ? appSettings.resetDisplaySettings : false
  userDataMode.value = (appSettings.userDataMode != undefined) ? appSettings.userDataMode : "APP"
  customUserDirectory.value = (appSettings.customUserDirectory != undefined) ? appSettings.customUserDirectory : ""
  archiveLogsLimit.value = (appSettings.archiveLogsLimit != undefined) ? appSettings.archiveLogsLimit : 20
})

const Develop_updated = (value) => {
  utils.timeStampedLog(name + `: Develop_updated ${value}`)
  store.methods.save_app_setting({"develop": value})
}

const resetDisplaySettings_updated = (value) => {
  utils.timeStampedLog(name + `: resetDisplaySettings_updated ${value}`)
  store.methods.save_app_setting({"resetDisplaySettings": value})
}

watch(userDataMode,() => {
  store.methods.save_app_setting({"userDataMode": userDataMode.value})
})

watch(customUserDirectory,() => {
  store.methods.save_app_setting({"customUserDirectory": customUserDirectory.value})
})

watch(archiveLogsLimit,() => {
  store.methods.save_app_setting({"archiveLogsLimit": archiveLogsLimit.value})
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



</script>

<style scoped>

</style>
