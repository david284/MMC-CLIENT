<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 600px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Advanced functions for node {{ store.getters.node_name(nodeNumber) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card-section v-if="(store.state.nodes[nodeNumber].status != true)">
            <div class="text-h6">
              Node is offline, so standard function are unavailable
            </div>
        </q-card-section>

        <q-card-section v-if="(store.state.nodes[nodeNumber].status)">
          <q-card-actions align="left">
            <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Backup & Restore"
            @click="clickBackupAndRestoreNode()"/>
          </q-card-actions>

          <q-card-actions align="left" v-if="(store.state.nodes[nodeNumber].VLCB == false)">
            <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="CAN ID Enumeration"
            @click="clickCanIdEnumeration()"/>
          </q-card-actions>

          <q-card-actions align="left">
            <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Manage Module Descriptor"
            @click="clickMDF()"/>
          </q-card-actions>

          <q-card-actions align="left" v-if="(store.state.nodes[nodeNumber].VLCB == true)">
            <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="MODE: set Event Acknowledge"
            @click="click_MODE_Event_Acknowledge()"/>
          </q-card-actions>

          <q-card-actions align="left" v-if="(store.state.nodes[nodeNumber].VLCB == true)">
            <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="MODE: set FCU Compatibility"
            @click="click_MODE_FCU_Compatibility()"/>
          </q-card-actions>

          <q-card-actions align="left" v-if="(store.state.nodes[nodeNumber].VLCB == true)">
            <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="MODE: set heartbeat"
            @click="click_Mode_Heartbeat()"/>
          </q-card-actions>

          <q-card-actions align="left" v-if="(store.state.nodes[nodeNumber].bootloader)">
            <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="program Node"
            @click="clickProgramNode()"/>
          </q-card-actions>

          <q-card-actions align="left">
            <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="reset Node"
            @click="clickResetNode()"/>
          </q-card-actions>

          <q-card-actions align="left" v-if="(store.state.nodes[nodeNumber].VLCB == false)">
            <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Set CANID"
            @click="clickSetCAN_ID()"/>
          </q-card-actions>
        </q-card-section>

        <q-card class="q-py-none q-ma-none row"  v-if="(store.state.nodes[nodeNumber].status != true)">
          <q-card-section style="min-width: 250px;">
            <q-card-actions align="left">
              <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="program in boot mode"
              @click="clickProgramInBootMode()"/>
            </q-card-actions>
          </q-card-section>
          <q-card-section style="width: 300px;">
            <div class="text-body1">
              A node in boot mode (both green & yellow led on) will show as offline, but can be programmed
            </div>
          </q-card-section>
        </q-card>

      </q-card>
    </q-dialog>

    <MDFDialog v-model='showMDFDialog'
      :nodeNumber = nodeNumber
    />

    <programNodeDialog v-model='showProgramNodeDialog'
      :nodeNumber = nodeNumber
      :mode = programNodeMode
    />

    <NodeBackupAndRestoreDialog  v-model='showNodeBackupAndRestoreDialog'
        :nodeNumber = nodeNumber
      />

    <setCanIdDialog v-model='showSetCanIdDialog'
      :nodeNumber = nodeNumber
    />


</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import MDFDialog from "components/dialogs/MDFDialog"
import programNodeDialog from "components/dialogs/programNodeDialog"
import NodeBackupAndRestoreDialog from "components/dialogs/NodeBackupAndRestoreDialog"
import setCanIdDialog from "components/dialogs/setCanIdDialog"
import cbusLib from "cbuslibrary"

const $q = useQuasar()
const store = inject('store')
const name = "AdvancedNodeDialog"
const programNodeMode = ref("NORMAL")
const showMDFDialog = ref(false)
const showProgramNodeDialog = ref(false)
const showNodeBackupAndRestoreDialog = ref(false)
const showSetCanIdDialog = ref(false)

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number }
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

//
//
const clickBackupAndRestoreNode = () => {
  console.log(name + `: clickBackupAndRestoreNode ` + props.nodeNumber)
  showNodeBackupAndRestoreDialog.value = true
}

//
//
const clickCanIdEnumeration = () => {
  console.log(name + `: clickCanIdEnumeration ` + props.nodeNumber)
  store.methods.node_can_id_enum(props.nodeNumber)
}

//
//
const clickMDF = () => {
  console.log(name + `: clickMDF`)
  store.methods.request_matching_mdf_list(props.nodeNumber, "USER")
  store.methods.request_matching_mdf_list(props.nodeNumber, "SYSTEM")
  showMDFDialog.value = true
}


//
// Mode values for Event_Acknowledge
// Event_Acknowledge 0ff = 0x0B
// Event_Acknowledge 0n = 0x0A
//
const click_MODE_Event_Acknowledge = () => {
  console.log(name + `: click_MODE_Event_Acknowledge`)
  const result = $q.notify({
    message: 'Set Event Acknowledge for node: '+ store.getters.node_name(props.nodeNumber),
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'ON', color: 'white', handler: async () => {
        let commandString = cbusLib.encodeMODE(props.nodeNumber, 0x0A)
        store.methods.send_cbus_message(commandString)
      } },
      { label: 'OFF', color: 'white', handler: () => {
        let commandString = cbusLib.encodeMODE(props.nodeNumber, 0x0B)
        store.methods.send_cbus_message(commandString)
      } },
      { label: 'CANCEL', color: 'white', handler: () => {} }
    ]
  })
}

//
// Mode values for FCU_Compatibility
// FCU_Compatibility 0ff = 0x11
// FCU_Compatibility 0n = 0x10
//
const click_MODE_FCU_Compatibility = () => {
  console.log(name + `: click_MODE_FCU_Compatibility`)
  const result = $q.notify({
    message: 'Set FCU Compatibility for node: '+ store.getters.node_name(props.nodeNumber),
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'ON', color: 'white', handler: async () => {
        let commandString = cbusLib.encodeMODE(props.nodeNumber, 0x10)
        store.methods.send_cbus_message(commandString)
      } },
      { label: 'OFF', color: 'white', handler: () => {
        let commandString = cbusLib.encodeMODE(props.nodeNumber, 0x11)
        store.methods.send_cbus_message(commandString)
      } },
      { label: 'CANCEL', color: 'white', handler: () => {} }
    ]
  })
}

//
// Mode values for Heartbeat
// Heartbeat 0ff = 0x0D
// Heartbeat 0n = 0x0C
//
const click_Mode_Heartbeat = () => {
  console.log(name + `: click_Mode_Heartbeat`)
  const result = $q.notify({
    message: 'Set Heartbeat for node: '+ store.getters.node_name(props.nodeNumber),
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'ON', color: 'white', handler: async () => {
        let commandString = cbusLib.encodeMODE(props.nodeNumber, 0x0C)
        store.methods.send_cbus_message(commandString)
      } },
      { label: 'OFF', color: 'white', handler: () => {
        let commandString = cbusLib.encodeMODE(props.nodeNumber, 0x0D)
        store.methods.send_cbus_message(commandString)
      } },
      { label: 'CANCEL', color: 'white', handler: () => {} }
    ]
  })
}

//
//
const clickProgramNode = () => {
  console.log(name + `: clickProgramNode ` + props.nodeNumber)
  programNodeMode.value = "NORMAL"
  showProgramNodeDialog.value = true
}

//
//
const clickProgramInBootMode = () => {
  console.log(name + `: clickProgramInBootMode ` + props.nodeNumber)
  programNodeMode.value = "BOOT"
  showProgramNodeDialog.value = true
}

//
//
const clickResetNode = () => {
  console.log(name + `: clickResetNode ` + props.nodeNumber)
  store.methods.reset_node(props.nodeNumber)
}

//
//
const clickSetCAN_ID = () => {
  console.log(name + `: clickSetCAN_ID ` + props.nodeNumber)
  showSetCanIdDialog.value = true
}



</script>

<style scoped>

</style>
