<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 800px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Advanced functions
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card class="q-py-none q-ma-none row">

          <q-card-section style="width: 250px; min-height: 80px;">
            <q-card-actions align="left">
              <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Delete Offline Nodes"
              @click="clickDeleteAllOffline()" v-close-popup/>
            </q-card-actions>
          </q-card-section>

          <q-card-section style="width: 500px; min-height: 80px;">
            This will remove all nodes in the list with a status of 'Offline'<br>
            Offline means any node that hasn't communicated since MMC started this time
          </q-card-section>

        </q-card>

        <q-card class="q-py-none q-ma-none row">

          <q-card-section style="width: 250px; min-height: 80px;">
            <q-card-actions align="left">
              <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Node 0 parameters"
              @click="clickNodeZeroParameters()"  v-close-popup/>
            </q-card-actions>
          </q-card-section>

          <q-card-section style="width: 500px; min-height: 80px;">
            A node with an ID of 0 won't show in the main node view, but it's parameters can be viewed from here.
            An uninitialised node will have an ID of 0, as will a SLiM consumer node, so if there is more than one node with ID 0, then the last one to respond will be displayed
          </q-card-section>

        </q-card>

        <q-card class="q-py-none q-ma-none row">

          <q-card-section style="min-width: 250px; min-height: 80px;">
            <q-card-actions align="left">
              <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="program Node in boot mode"
              @click="clickProgramNode()"/>
            </q-card-actions>
          </q-card-section>

          <q-card-section style="width: 500px; min-height: 80px;">
            A node in boot mode (both green & yellow led on) won't respond to CBUS commands, but can be programmed from here
          </q-card-section>

        </q-card>

      </q-card>
    </q-dialog>

    <nodeParametersDialog v-model='showNodeParametersDialog'
      :nodeNumber = 0
    />

    <programNodeDialog v-model='showProgramNodeDialog'
      :nodeNumber = "0"
      mode = "BOOT"
    />

      <WaitingOnBusTrafficDialog v-model='showWaitingOnBusTrafficDialog'
        callingModule = "NodesView Advanced"
        :message = WaitingOnBusTrafficMessage
        @WaitingOnBusTrafficDialogEvent="WaitingOnBusTrafficDialogReturn = $event"
      />

</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import * as utils from "components/functions/utils.js"
import nodeParametersDialog from "components/dialogs/NodeParametersDialog"
import { date, useQuasar, scroll } from 'quasar'
import {NodeParametersLoaded} from "components/functions/NodeFunctions.js"
import programNodeDialog from "components/dialogs/programNodeDialog"
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog";


const $q = useQuasar()

const store = inject('store')
const name = "NodesViewAdvancedDialog"
const showNodeParametersDialog = ref(false)
const showProgramNodeDialog = ref(false)
const showWaitingOnBusTrafficDialog = ref(false)
const WaitingOnBusTrafficDialogReturn = ref('')
const WaitingOnBusTrafficMessage = ref('')


const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})


//
//
const checkNodeParameters = async (nodeNumber) => {
  //utils.timeStampedLog(name + ': checkNodeParameters: node ' + nodeNumber)
  //
  // check if parameters have already been fully retrieved
  if(NodeParametersLoaded(store, nodeNumber)){
    // parameters exist, so don't need to load
  } else {
    WaitingOnBusTrafficDialogReturn.value =''
    WaitingOnBusTrafficMessage.value = "Loading Node Parameters"
    showWaitingOnBusTrafficDialog.value = true
    store.methods.request_all_node_parameters(nodeNumber, 20, 100)
    // allow up to 1 minute to finish loading
    let startTime = Date.now()
    while ((Date.now() - startTime) < 60000){
      if (WaitingOnBusTrafficDialogReturn.value.length > 0) { break }
      await utils.sleep (100)
    }
    showWaitingOnBusTrafficDialog.value = false
  }
  if (NodeParametersLoaded(store, nodeNumber) == false){
    utils.timeStampedLog(name + `: checkNodeParameters: node ${nodeNumber} failed`)
    $q.notify({
      message: 'Reading Node Parameters has failed',
      caption: 'please check connections to node',
      timeout: 5000,
      type: 'warning',
      position: 'center',
      actions: [ { label: 'Dismiss' } ]
    })
  }
  return NodeParametersLoaded(store, nodeNumber)
}

//
// deletes offline nodes one-by-one
// needs a delay between each, otherwise doesn't keep up
// a bulk delete would be quicker, but would need new WebSocket message
//
const deleteAllOfflineNodes = async () => {
  // don't use forEach, as await doesn't work
  for(const nodeNumber in store.state.nodes){
    //utils.timeStampedLog(name + `: clickDeleteAllOffline: node ${JSON.stringify(nodeNumber, null, " ")}`)
    utils.timeStampedLog(name + `: clickDeleteAllOffline: node ${nodeNumber}`)
    try{
      // offline is status==false
      if (store.state.nodes[nodeNumber].status != true){
        utils.timeStampedLog(name + `: clickDeleteAllOffline: delete node ${nodeNumber}`)
        store.methods.remove_node(nodeNumber)
        store.eventBus.emit('NODE_DELETED_EVENT', nodeNumber)
        await utils.sleep(1000)   // allow time for individual deletes
      }
    }catch{}
  }
}

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickDeleteAllOffline = async () => {
  utils.timeStampedLog(name + `: clickDeleteAllOffline`)
  const result = $q.notify({
    message: 'Are you sure you want to delete all offline nodes?',
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => {
        await deleteAllOfflineNodes()
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

//
//
const clickNodeZeroParameters = async () => {
  utils.timeStampedLog(name + `: clickNodeZeroParameters`)
  // clear out parameters to force them to be reloaded
  if (store.state.nodes[0] == undefined){ store.state.nodes[0] = {} }
  store.state.nodes[0].parameters = {}
  if (await checkNodeParameters(0)){
    showNodeParametersDialog.value = true
  }
}

const clickProgramNode = () => {
  utils.timeStampedLog(name + `: clickProgramNode: BOOT mode `)
  showProgramNodeDialog.value = true
}


</script>

<style scoped>

</style>
