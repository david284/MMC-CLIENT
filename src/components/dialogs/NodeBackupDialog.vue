<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 450px; min-height: 300px;">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
             Backup node {{ store.getters.node_name(nodeNumber) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card style="height: 200px" class="q-pa-sm q-ma-sm">
          <div class="text-primary">status</div>
          <div class="text-h6">{{ backupStatus }}</div>
        </q-card>

      </q-card>

    </q-dialog>

    <WaitingOnBusTrafficDialog v-model='showWaitingOnBusTrafficDialog'
      callingModule = "Node Backup"
      :message = WaitingOnBusTrafficMessage
      @WaitingOnBusTrafficDialogEvent="WaitingOnBusTrafficDialogReturn = $event"
    />


</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import {refreshEventIndexes} from "components/functions/EventFunctions.js"
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog";


const $q = useQuasar()
const store = inject('store')
const name = "NodeBackupDialog"
const showWaitingOnBusTrafficDialog = ref(false)
const WaitingOnBusTrafficDialogReturn = ref('')
const WaitingOnBusTrafficMessage = ref(``)
const backupStatus = ref('starting')


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

watch(model, () => {
  //console.log(name + `: WATCH model`)
  if (model.value){
    // model is true when dialog made visible
    backupNode()
  }
})



//
// At this point we already have all the node parameters
// So read all the node variables
// and then read all the events & variables
//
const backupNode = async () => {
  console.log(name + `: backupNode ` + props.nodeNumber)
  var successState = false
  var result = ''
  var notifyType = 'negative'

  // refresh event indexes in advance of needing it
  backupStatus.value = "refresh event variables"
  await refreshEventIndexes(store, props.nodeNumber)
  let startTime = Date.now()

  //
  // load node variables
  backupStatus.value = "loading node variables"
  successState = await loadNodeVariables()
  if (successState == false) {
    console.log(name + `: backupNode ` + props.nodeNumber + ' failed to load Node variables')
    result = "Node variable load failed"
  }

  // wait until enough time elapsed for refresh indexes
  backupStatus.value = "waiting for events"
  while ((Date.now() - startTime) < 1000) {
    await sleep(100)
  }

  if (successState){
    // now load all event variables
    backupStatus.value = "loading event variables"
    successState = await loadEventVariables()
    if (successState == false) {
      console.log(name + `: backupNode ` + props.nodeNumber + ' failed to load Event variables')
      result = "Event variable load failed"
    }
  }

  if (successState) {
    // now store backup if it was successfull
    store.methods.save_node_backup(props.nodeNumber, store.state.nodes[props.nodeNumber])
    backupStatus.value = "Backup completed"
  } else {
    // display popup for failure
    backupStatus.value = result
    $q.notify({
      message: result,
      timeout: 1000,
      type: notifyType,
      position: 'center',
      actions: [ { label: 'Dismiss', handler: () => { }} ]
    })
  }

}

//
// Load node variables for this node
// return true if success
//
const loadNodeVariables = async () => {
  var result = false
  store.methods.request_all_node_variables(props.nodeNumber)
  WaitingOnBusTrafficMessage.value = "Loading Node Variables"
  WaitingOnBusTrafficDialogReturn.value =''
  showWaitingOnBusTrafficDialog.value = true
  //
  // wait for variables to load - allow up to 1 minute
  var startTime = Date.now()
  while ((Date.now() - startTime) < 60000){
      if (WaitingOnBusTrafficDialogReturn.value.length > 0)
    {
      result = true  // success if we exit early
      break
    }
    await sleep (100)
  }
  showWaitingOnBusTrafficDialog.value = false
  return result
}

//
// load event variables from all events for this node
// return true if success
//
const loadEventVariables = async () => {
  var result = false
  try{
    // show waiting dialog first
    WaitingOnBusTrafficMessage.value = "Loading Event Variables"
    WaitingOnBusTrafficDialogReturn.value =''
    showWaitingOnBusTrafficDialog.value = true
    // now request all the event variables for all events for this node
    store.methods.requestAllEventVariablesForNode(props.nodeNumber)
    // wait for variables to load - allow up to 2 minutes
    var startTime = Date.now()
    while ((Date.now() - startTime) < 120000){
      if (WaitingOnBusTrafficDialogReturn.value.length > 0)
      {
        result = true  // success if we exit early
        break
      }
      await sleep (100)
    }
    showWaitingOnBusTrafficDialog.value = false
  } catch (err) {
    console.log(name + ": loadEventVariables: " + err)
  }
  return result
}

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
