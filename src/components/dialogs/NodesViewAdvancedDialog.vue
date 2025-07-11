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
import {sleep} from "components/functions/utils.js"
import nodeParametersDialog from "components/dialogs/NodeParametersDialog"
import { date, useQuasar, scroll } from 'quasar'
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
  //console.log(name + ': checkNodeParameters: node ' + nodeNumber)
  //
  // param9 - cpu type to check if parameters have been fully retrieved
  if(store.state.nodes[nodeNumber].parameters[9]){
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
      await sleep (100)
    }
    showWaitingOnBusTrafficDialog.value = false
  }
  var result = (store.state.nodes[nodeNumber].parameters[9] != undefined)? true : false
  if (result == false){
    console.log(name + `: checkNodeParameters: node ${nodeNumber} failed`)
    $q.notify({
      message: 'Reading Node Parameters has failed',
      caption: 'please check connections to node',
      timeout: 5000,
      type: 'warning',
      position: 'center',
      actions: [ { label: 'Dismiss' } ]
    })
  }
  return result
}



/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickNodeZeroParameters = async () => {
  console.log(name + `: clickNodeZeroParameters`)
  // clear out parameters to force them to be reloaded
  if (store.state.nodes[0] == undefined){ store.state.nodes[0] = {} }
  store.state.nodes[0].parameters = {}
  if (await checkNodeParameters(0)){
    showNodeParametersDialog.value = true
  }
}

const clickProgramNode = () => {
  console.log(name + `: clickProgramNode: BOOT mode `)
  showProgramNodeDialog.value = true
}


</script>

<style scoped>

</style>
