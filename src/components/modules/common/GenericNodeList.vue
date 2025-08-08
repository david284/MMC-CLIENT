<template>
    <q-card style="max-height: 70vh" class="scroll q-ma-md">

        <q-card-section class="no-margin q-py-none-xs" style="width: 750px;">

          <q-table
            flat bordered
            dense
            :rows="teRows"
            :columns="teColumns"
            row-key="nodeNumber"
            hide-bottom
            virtual-scroll
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="0"
            >

            <template v-slot:body="props">
              <q-tr :props="props" class="q-my-none q-py-none">
                <q-td key="nodeNumber" :props="props">{{ props.row.nodeNumber }}</q-td>
                <q-td key="name" :props="props">{{ props.row.name }}</q-td>
                <q-td key="group" :props="props">{{ props.row.group }}</q-td>
                <q-td key="actions" :props="props">
                  <q-btn dense class="q-mx-xs" outline color="primary" size="md" label="Variables"
                    @click="clickVariables(props.row.nodeNumber)" no-caps/>
                  <q-btn dense class="q-mx-xs" outline size="md" color="negative" label="Delete" @click="clickDelete(props.row.nodeNumber)" no-caps/>
                </q-td>
              </q-tr>
            </template>
          </q-table>


        </q-card-section>

  </q-card>

  <EventVariablesDialog v-model='showEventVariablesDialog'
    :nodeNumber = selected_nodeNumber
    :eventIdentifier = eventIdentifier
  />

  <WaitingOnBusTrafficDialog v-model='showWaitingOnBusTrafficDialog'
    callingModule = "Node List"
    :message = WaitingOnBusTrafficMessage
    @WaitingOnBusTrafficDialogEvent="WaitingOnBusTrafficDialogReturn = $event"
  />


</template>

<script setup>
import {inject, ref, onBeforeMount, onMounted, onUpdated, computed, watch} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import {NodeParametersLoaded} from "components/functions/NodeFunctions.js"
import EventVariablesDialog from "components/dialogs/EventVariablesDialog"
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog";
import {timeStampedLog} from "components/functions/utils.js"

const $q = useQuasar()
const store = inject('store')
const name = "GenericNodeList"
const showEventVariablesDialog = ref(false)
const selected_nodeNumber = ref(0)
const showWaitingOnBusTrafficDialog = ref(false)
const WaitingOnBusTrafficMessage = ref('')
const WaitingOnBusTrafficDialogReturn = ref('')

const props = defineProps({
  nodeNumberList: {
    type: Object,
    required: true
  },
  eventIdentifier:{
    type: String,
    required: true
  }
})


const teRows = ref([])

const teColumns = [
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node Number', align: 'left', sortable: true},
  {name: 'name', field: 'name', required: true, label: 'Name', align: 'left', sortable: true},
  {name: 'group', field: 'group', required: true, label: 'Node Group', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: true}
]

const update_nodes_table = async () => {
//  timeStampedLog(name + `: update__nodes_table`)
  teRows.value = []
  props.nodeNumberList.forEach(nodeNumber => {
    var nodeName = store.getters.node_name(nodeNumber)
    teRows.value.push({
      "nodeNumber" : nodeNumber,
      "name" : nodeName,
      "group" : store.getters.node_group(nodeNumber)
    })
  })
}


//
//
const checkNodeParameters = async (nodeNumber) => {
  //timeStampedLog(name + ': checkNodeParameters: node ' + nodeNumber)
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
      await sleep (100)
    }
    showWaitingOnBusTrafficDialog.value = false
  }
}


//
//
const checkNodeVariables = async (nodeNumber) => {
  //timeStampedLog(name + ': checkNodeVariables: node ' + nodeNumber)
  var maxNodeVariableIndex = store.state.nodes[nodeNumber].parameters[6]
  if(store.state.nodes[nodeNumber].nodeVariables[maxNodeVariableIndex] != undefined){
    //timeStampedLog(name + ": checkNodeVariables: already read")
  } else {
    WaitingOnBusTrafficDialogReturn.value =''
    WaitingOnBusTrafficMessage.value = "Loading Node Variables"
    store.methods.request_all_node_variables(nodeNumber)
    showWaitingOnBusTrafficDialog.value = true
    // wait for variables to load
    for (let i = 0; i < 10000; i++){
      if (WaitingOnBusTrafficDialogReturn.value.length > 0) break
      await sleep (10)
    }
    showWaitingOnBusTrafficDialog.value = false
  }
}

//
//
const getEventIndexes = async () => {
  WaitingOnBusTrafficMessage.value = "Loading Event Indexes"
  timeStampedLog(name + `: ${WaitingOnBusTrafficMessage.value}`)
  //
  WaitingOnBusTrafficDialogReturn.value =''
  showWaitingOnBusTrafficDialog.value = true
  store.methods.request_all_node_events(props.nodeNumber)

  // allow up to 1 minutes to finish loading
  let startTime = Date.now()
  while ((Date.now() - startTime) < 60000){
  if (WaitingOnBusTrafficDialogReturn.value.length > 0)
    {
      // success if we exit early
      break
    }
    await sleep (10)
  }
  showWaitingOnBusTrafficDialog.value = false
}




onBeforeMount(() => {
//  timeStampedLog(name + `: onBeforeMount`)
})

onMounted(() => {
//  timeStampedLog(name + ': props: ' + JSON.stringify(props))
})

onUpdated(() => {
//  timeStampedLog(name + `: onUpdated`)
  update_nodes_table()
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickDelete = (nodeNumber) => {
  timeStampedLog(name + `: clickDelete`)
  const result = $q.notify({
    message: 'Are you sure you want to delete event ' + store.getters.event_name(props.eventIdentifier) + ' from node ' + store.getters.node_name(nodeNumber),
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => {
        timeStampedLog(`removeEvent ` + nodeNumber + ' ' + props.eventIdentifier)
        store.methods.remove_event(nodeNumber, props.eventIdentifier)
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}


const clickVariables = async (nodeNumber) => {
  timeStampedLog(name + `: clickVariables: node ` + nodeNumber + ' eventIdentifer ' + props.eventIdentifier)
  selected_nodeNumber.value = nodeNumber
  await checkNodeParameters(nodeNumber)
  await checkNodeVariables(nodeNumber)
  if(store.state.nodes[nodeNumber].VLCB == false){
    await getEventIndexes()
  }
  await store.methods.request_event_variables_by_identifier(nodeNumber, props.eventIdentifier)
  showEventVariablesDialog.value = true
}


</script>

<style scoped>

</style>
