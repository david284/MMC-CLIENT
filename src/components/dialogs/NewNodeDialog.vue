<template>

  <q-dialog v-model="model" persistent>
    <q-card style="min-width: 350px" class="bg-amber-2">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          New node detected
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card-section class="q-pa-md" color="orange-1">
        <div class="text-h6">
          Accept the first free node number below <br/> or enter a new one
        </div>
        <q-input type="number" style="max-width: 150px" :input-style="{ fontSize: '25px' }" dense v-model="newNodeNumber" autofocus />
        <div class="text-h6">
          This node was previously {{ props.previousNodeNumber }}<br/>
          The module type is CAN{{ displayModuleName }}<br/>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="text-h6">
          Enter a name for this node (optional)
        </div>
        <q-input :input-style="{ fontSize: '25px' }" dense v-model="newNodeName" autofocus />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="text-h6">
          Enter a group for this node (optional)
        </div>
        <q-input :input-style="{ fontSize: '25px' }" dense v-model="newGroupName" autofocus />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Accept" @click="clickAccept()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import * as utils from "components/functions/utils.js"

const $q = useQuasar()
const store = inject('store')
const logPrefix = "NewNodeDialog"
const newGroupName = ref("")
const newNodeName = ref("")
const newNodeNumber = ref(0)
const displayModuleName = ref()


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  previousNodeNumber:{ type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

watch(model, () => {
  console.log(logPrefix + `: WATCH model`)
  console.log(logPrefix + `: WATCH model: previousNodeNumber ` + props.previousNodeNumber)
  newNodeNumber.value = getNextFreeNodeNumber()
  newNodeName.value = ""
})


watch(newNodeNumber, () => {
  console.log(logPrefix + `: WATCH model: newNodeNumber ` + newNodeNumber.value)
  try{
    if(newNodeNumber.value in store.state.layout.nodeDetails){
      newNodeName.value = store.state.layout.nodeDetails[newNodeNumber.value].name
      newGroupName.value = store.state.layout.nodeDetails[newNodeNumber.value].group
    } else {
      newNodeName.value = ""
      newGroupName.value = ""
    }
  } catch(err){
    console.log(logPrefix + `: WATCH newNodeNumber ` + err)
  }
})



const getNextFreeNodeNumber = () => {
  var freeNode = 0
  var baseNodeNumber = 256
  if (store.state.layout.layoutDetails.baseNodeNumber){
    baseNodeNumber = store.state.layout.layoutDetails.baseNodeNumber
  }
  var nodes = Object.keys(store.state.nodes)  // just get node numbers
  // loop through all node numbers starting at base, checking it it already exists
  for (var i = baseNodeNumber; i < 65535; i++){
    if (nodes.includes(i.toString())) {
      //console.log(name + " node number match: " + i)
      // found node, so not free
    } else {
      console.log(logPrefix + " first free node number: " + i)
      freeNode = i
      break
    }
  }
  return freeNode
}


const isNodeNumberFree = (nodeNumber) => {
  var nodes = Object.keys(store.state.nodes)  // just get node numbers
  // loop through all node numbers, checking it it already exists
    if (nodes.includes(nodeNumber)) {
      console.log(logPrefix + " node number in use: " + nodeNumber)
      // found nodeNumber, so not free
      return false
    } else {
      console.log(logPrefix + " free node number: " + nodeNumber)
      return true
    }
}

// inspect bus traffic to find when cbus NAME is received
// and update displayModuleName
// replaces using props.moduleName as as the NAME hasn't always
// been received when the dialog is shown
//
store.eventBus.on('BUS_TRAFFIC_EVENT', (data) => {
    var opCode = data.json.opCode
    // check for NAME (E2) event
    if (opCode == 'E2')
    {
      utils.timeStampedLog(logPrefix + `: BUS_TRAFFIC_EVENT : NAME event: ${data.json.name}` )
      displayModuleName.value = data.json.name
    }
})




onUpdated(() => {
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickAccept = () => {
  console.log(logPrefix + " new node number: " + newNodeNumber.value)
  console.log(logPrefix + " new node name: " + newNodeName.value)
  console.log(logPrefix + " new group name: " + newGroupName.value)

  if (isNodeNumberFree(newNodeNumber.value)){
    store.methods.set_node_number(newNodeNumber.value)
    // setting name will trigger layoutdetails update & create entry if it doesn't exist
    store.setters.node_name(newNodeNumber.value, newNodeName.value)
    store.setters.node_group(newNodeNumber.value, newGroupName.value)
    store.setters.node_set_backup_required(newNodeNumber.value, true)
    model.value = false // close dialog
  } else {
    const result = $q.notify({
      message: 'node number is already assigned - still proceed?',
      timeout: 0,
      position: 'center',
      color: 'primary',
      actions: [
        { label: 'YES', color: 'white', handler: async () => {
          store.methods.set_node_number(newNodeNumber.value)
          // setting name will trigger layoutdetails update & create entry if it doesn't exist
          store.setters.node_name(newNodeNumber.value, newNodeName.value)
          store.setters.node_group(newNodeNumber.value, newGroupName.value)
          store.setters.node_set_backup_required(newNodeNumber.value, true)
          model.value = false   // close dialog
        } },
        { label: 'NO', color: 'white', handler: () => { /* ... */ } }
      ]
    })
  }
}





</script>

<style scoped>

</style>
