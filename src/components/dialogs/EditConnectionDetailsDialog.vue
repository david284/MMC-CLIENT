<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 650px; height: 450px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Edit connection details
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <div class="q-pa-xs row">

          <q-card flat class="q-pa-xs" style="width: 200px">
            <q-select 
              autofocus
              outlined
              v-model="mode" 
              :options="mode_options" 
              label="Mode" 
            />
          </q-card>

          <q-card flat class="q-pa-xs" style="width: 400px">
            Auto will connect to the first CANUSB or CANUSB4 it finds <br/>
            SerialPort will connect to the serial port entered below<br/>
            Network will use the address & port entered below <br/>
          </q-card>

        </div>

        <div class="q-pa-xs row">

          <q-card flat class="q-pa-xs" style="width: 200px">
              <q-input
                autofocus
                class="q-pa-sm"
                outlined
                v-model="serialPort"
                label="serialPort"
                maxlength="30"
                >
              </q-input>
          </q-card>

          <q-card flat class="q-pa-xs" style="width: 400px">
            Forces MMC to use this specific serial port<br/>
            Windows example: COM3<br/>
            Linux example: ttyUSB2<br/>
            Leave blank if 'SerialPort' not selected<br/>
          </q-card>

        </div>

        <div class="q-pa-xs row">

          <q-card flat class="q-pa-xs" style="width: 200px">
              <q-input
                autofocus
                class="q-pa-sm"
                outlined
                v-model="Host"
                label="Host"
                maxlength="30"
                >
              </q-input>
          </q-card>

          <q-card flat class="q-pa-xs" style="width: 400px">
            Name or IP address of machine to use for CAN connection<br/>
            Leave blank if 'Network' not selected
          </q-card>

        </div>

        <div class="q-pa-xs row">

          <q-card flat class="q-pa-xs" style="width: 200px">
              <q-input
                autofocus
                class="q-pa-sm"
                outlined
                v-model="HostPort"
                label="Host Port"
                maxlength="30"
                >
              </q-input>
          </q-card>

          <q-card flat class="q-pa-xs" style="width: 400px">
            Port number of machine for CAN connection<br/>
            Leave blank if 'Network' not selected
          </q-card>

        </div>

        <q-card-actions align="right" class="text-primary">
          <q-btn color="primary" label="save" @click="clickSave()" no-caps/>
        </q-card-actions>


      </q-card>
    </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import {sleep} from "components/functions/utils.js"

const store = inject('store')
const name = "EditConnectionDetailsDialog"
const mode = ref('')
const serialPort = ref('')
const Host = ref('')
const HostPort = ref('')

const mode_options =  ref([ 'Auto', 'SerialPort', 'Network' ])


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
  mode.value = store.state.layout.connectionDetails.mode
  serialPort.value = store.state.layout.connectionDetails.serialPort
  Host.value = store.state.layout.connectionDetails.host
  HostPort.value = store.state.layout.connectionDetails.hostPort
})




onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickSave = async () => {
  console.log(name + `: clickSave`)
  store.state.layout.connectionDetails.mode = mode.value
  if (mode.value == 'SerialPort'){
    store.state.layout.connectionDetails.serialPort = serialPort.value
  } else {
    store.state.layout.connectionDetails.serialPort = ''
  }
  if (mode.value == 'Network'){
    store.state.layout.connectionDetails.host = Host.value
    store.state.layout.connectionDetails.hostPort = HostPort.value
  } else {
    store.state.layout.connectionDetails.host = ''
    store.state.layout.connectionDetails.hostPort = ''
  }
  store.methods.update_layout()
  await sleep(50)
  model.value=false
}


</script>

<style scoped>

</style>
