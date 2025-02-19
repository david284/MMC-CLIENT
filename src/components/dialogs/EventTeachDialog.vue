<template>

  <q-dialog v-model='model' persistent>
    <q-card  class="q-pa-none q-ma-none" style="min-width: 850px">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin g-py-none">
          <div class="text-h6">
            Teach event :  {{ store.getters.event_name(props.eventIdentifier) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card style="min-width: 800px">
        <q-card-section style="max-height: 75vh" class="q-py-none row">

          <q-card  style="width: 250px; height: 200px;" class="q-ma-md q-py-none">
          <q-card-section class="q-pa-xs">
            <div class="text-h6">Teach Event</div>
            <div class="text-subtitle2">Select node</div>
            <q-select
              v-model="newNode"
              :options="availableNodes">
            </q-select>
            <div class="q-pa-xs q-gutter-sm">
              <q-btn color="negative"
                  label="Teach"
                  @click="clickTeachEvent()"
                  no-caps/>
            </div>
          </q-card-section>
          </q-card>

          <q-card style="max-height: 70vh" class="scroll q-ma-md">
          <q-card-section class="no-margin q-py-none-xs" style="width: 450px;">
            <div class="text-h6">Taught Events</div>
            <div class="text-subtitle2">Nodes using this event</div>
            <q-table
              flat bordered
              dense
              :rows="teRows"
              :columns="teColumns"
              row-key="number"
              hide-header
              hide-bottom
              virtual-scroll
              :rows-per-page-options="[0]"
              :virtual-scroll-sticky-size-start="0"
              >

              <template v-slot:body="props">
                <q-tr :props="props" class="q-my-none q-py-none">
                  <q-td key="number" :props="props">{{ props.row.number }}</q-td>
                  <q-td key="name" :props="props">{{ props.row.name }}</q-td>
                  <!-- <q-td key="index" :props="props">{{ props.row.eventIndex }}</q-td> -->
                  <q-td key="actions" :props="props">
                    <q-btn dense class="q-mx-xs" outline color="primary" size="md" label="Variables"
                    @click="clickVariables(props.row.number, props.row.eventIdentifier)" no-caps/>
                  </q-td>              

                </q-tr>
              </template>
            </q-table>
          </q-card-section>
          </q-card>

        </q-card-section>
      </q-card>

    </q-card>
  </q-dialog>

  <eventVariablesDialog v-model='showEventVariablesDialog'
    :nodeNumber = selected_event_node
    :eventIdentifier = selected_event_Identifier
    :newEvent = isNewEvent
  />

  <WaitingOnBusTrafficDialog v-model='showWaitingOnBusTrafficDialog'
    callingModule = "Event Teach"
    :message = WaitingOnBusTrafficMessage
    @WaitingOnBusTrafficDialog="WaitingOnBusTrafficDialogReturn = $event"
  />

</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import eventVariablesDialog from "components/dialogs/EventVariablesDialog"
import {createNewEvent} from "components/functions/EventFunctions.js"
import {refreshEventIndexes} from "components/functions/EventFunctions.js"
import {sleep} from "components/functions/utils.js"
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog";

const $q = useQuasar()
const store = inject('store')
const name = 'EventTeachDialog'

const selected_event_Identifier = ref("") // Dialog will complain if null
const selected_event_node = ref() // Dialog will complain if null
const showEventVariablesDialog = ref(false)
const isNewEvent = ref(false)
const showWaitingOnBusTrafficDialog = ref(false)
const WaitingOnBusTrafficDialogReturn = ref('')
const WaitingOnBusTrafficMessage = ref('')



const props = defineProps({
  modelValue: { type: Boolean, required: true },
  eventIdentifier: {type: String, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

// model changes when Dialog opened & closed
watch(model, () => {
//  console.log(name + `: WATCH model`)
  newNode.value = ''
})



const newNode = ref()
const availableNodes = ref([])
const taughtNodes = ref([])
const teRows = ref([])

const teColumns = [
  {name: 'number', field: 'number', required: true, label: 'Number', align: 'left', sortable: true},
  {name: 'name', field: 'name', required: true, label: 'Name', align: 'left', sortable: true},
  {name: 'index', field: 'index', required: true, label: 'Index', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]


const nodesUpdated = computed(() => {
//  console.log(name + `: nodesUpdated`)
  return store.state.nodes.updateTimestamp
})

watch(nodesUpdated, () => {
//  console.log(name + `: WATCH: nodesUpdated ` + nodesUpdated.value)
  if (props.eventIdentifier){
    update_taught_nodes()
  }
})


const update_taught_nodes = async () => {
//  console.log(name + `: update_taught_nodes: eventIdentifier ` + props.eventIdentifier)
  try{
    teRows.value = []
    taughtNodes.value = []
    var list = Object.values(store.state.nodes)
    list.forEach(node => {
      if (node.nodeNumber > 0){
        if (node.storedEventsNI){
          if (Object.values(node.storedEventsNI).length > 0) {
            let events = Object.values(node.storedEventsNI)
            events.forEach(async event => {
              if (event.eventIdentifier == props.eventIdentifier) {
                taughtNodes.value.push(node.nodeNumber)
                var nodeName = store.getters.node_name(node.nodeNumber)
                teRows.value.push({"number" : node.nodeNumber, "name" : nodeName, "eventIndex":event.eventIndex, "eventIdentifier":event.eventIdentifier})
              }
            })
          }
        }
      }
    })
    update_available_nodes()
  } catch (err) {
    console.log(name + `: update_taught_nodes ` + err)
  }
}


const update_available_nodes = () =>{
//  console.log(name + `: update_available_nodes ` + props.eventIdentifier)
  try {
    availableNodes.value = []
    var nodes = store.state.nodes
    // loop through json object properties with a for-in loop
    // returns top level property even if a nested object (not an index like an array)
    for (var nodeNumber in nodes) {
      // loop through each node, but check if it's valid to be added first  
      let addNode = true  // assume we'll add it unless we find otherwise
      //    console.log(name + `: update_available_nodes: node ` + nodeNumber)
      //    console.log(name + `: update_available_nodes: taughtNodes ` + JSON.stringify(taughtNodes.value))
      //
      // don't add node if event already taught to this node
      for (var index in taughtNodes.value){
        if (taughtNodes.value[index] == nodeNumber){
          addNode = false
        }
      }
      //
      // if node isn't ok, then don't try teaching
      if(store.state.nodes[nodeNumber].status != true){ addNode = false }
      //
      // if node isn't in flim mode, then don't try teaching
      if(store.state.nodes[nodeNumber].flim != true){ addNode = false }
      //
      // ok, now check if we still want to add this node, then do it
      if (addNode){
        if (nodeNumber > 0) {
          var entry = nodeNumber + ': '
          if(store.state.layout){
            entry += store.getters.node_name(nodeNumber)
            availableNodes.value.push(entry)
          }
        }
      }
    }  
  } catch (err){
    console.log(name + `: update_available_nodes: ` + err)
  }
}

onBeforeMount(() => {
})

onMounted(() => {
})

onUpdated(() => {
//  console.log(name + ": onUpdated")
  if (props.eventIdentifier){
    update_taught_nodes()
  }
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
}

//
//
const checkNodeVariables = async (nodeNumber) => {
  //console.log(name + ': checkNodeVariables: node ' + nodeNumber)
  var maxNodeVariableIndex = store.state.nodes[nodeNumber].parameters[6]
  if(store.state.nodes[nodeNumber].nodeVariables[maxNodeVariableIndex] != undefined){
    //console.log(name + ": checkNodeVariables: already read")
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



/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickTeachEvent = async () => {
  console.log(name + `: clickTeachEvent: ${newNode.value} : ${props.eventIdentifier}`)
  if (newNode.value != "") {
    // get node number from input value
    var array = newNode.value.split(':')
    var nodeNumberToBeTaught = parseInt(array[0])
    selected_event_node.value = nodeNumberToBeTaught

    if(store.state.nodes[nodeNumberToBeTaught].eventSpaceLeft > 0){
      await checkNodeParameters(nodeNumberToBeTaught)
      await checkNodeVariables(nodeNumberToBeTaught)
      createNewEvent(store, nodeNumberToBeTaught, props.eventIdentifier)             

      selected_event_Identifier.value = props.eventIdentifier
      isNewEvent.value=true
      showEventVariablesDialog.value = true
    } else {
      const result = $q.notify({
        message: 'no event space left',
        timeout: 0,
        position: 'center',
        color: 'primary',
        actions: [
          { label: 'dismiss', color: 'white', handler: () => { /* ... */ } }
        ]
      })
    }

    newNode.value = undefined
  }
}


const clickVariables = async (nodeNumber, eventIdentifier) => {
  let intNodeNumber = parseInt(nodeNumber)
  console.log(name + `: clickVariables ` + intNodeNumber + ' ' + eventIdentifier)
  selected_event_node.value = intNodeNumber
  selected_event_Identifier.value = eventIdentifier
  isNewEvent.value=false
  await checkNodeParameters(intNodeNumber)
  await checkNodeVariables(intNodeNumber)
  await refreshEventIndexes(store, intNodeNumber)
  await store.methods.request_event_variables_by_identifier(intNodeNumber, eventIdentifier)
  showEventVariablesDialog.value = true
}


</script>

<style scoped>

</style>
