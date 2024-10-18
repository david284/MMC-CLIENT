<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 800px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6" >
            Information about the Startup Dialog
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card class="q-pa-sm">
          <div class="text_body1  text-weight-bold">
            The Startup dialog is intended to allow selection of layout and connection method
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            To allow operation with more than one model railway layout, data is stored against a named layout
          </div>
          <div class="text_body1">
            Layouts can be selected, added or deleted at this point, and each layout also retains it's own connection method
          </div>
          <div class="text_body1">
            A 'default' layout is created automatically, but it's recommended to add a named layout
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            The default method of connecting is 'Auto', which will cause MMC to open a connection using the first CANUSB or CANUSB4 it finds, and no further configuration is needed if this is the required connection
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            The 'SerialPort' option will force the connection onto a specific serial port, which may be required if there is more than one CANUSB, or another device than accepts a serial connection
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            The Network option allows a TCP/IP connection to another service, like cbusServer or CANether
          </div>
          <div class="text_body1">
            The 'Host' parameter allows connection to either a remoted connection, or the same machine the MMC is running on - Computer names or IP addresses can be entered for the Host setting
          </div>
          <div class="text_body1">
            There is a useful technical Bulletin on the CANether that explains network connections in more detail
            <a href="https://www.merg.org.uk/merg_wiki/lib/exe/fetch.php?media=cbus:cbus:cbusmodules:canether:canether_connection_and_configuration_technical_bulletin_draft_1.pdf">link</a>
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            The connection method can be configured using the EDIT button for the selected layout, and each layout will retain it's own connection details
          </div>
          <div class="text_body1">
            The selected layout is saved automatically when changes are made
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
              When 'Auto' or 'SerialPort' modes are selected, an 'embedded' cbusServer is automatically started on port 5550, which can be used by other applications at the same time, such as FCU
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            With all connection options, 'modified Grid Connect' is the data format used to transfer messages to and from the modules
          </div>
          <div class="text_body1">
              Grid Connect is an established byte orientated data format used to encode the bit orientated CAN bus data format, such that it can be transmitted over stream connections, like serial or TCP/IP
          </div>
          <div class="text_body1">
              'modified Grid Connect' is a variant of the Grid Connect format that has small modifications for use with CBUS devices
          </div>
        </q-card>


      </q-card>
    </q-dialog>

    />


</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "StartupInfoDialog"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})


onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/




</script>

<style scoped>

</style>
