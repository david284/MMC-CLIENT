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
            <div class="text-subtitle2">To consumer nodes only</div>
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
              :virtual-scroll-sticky-size-start="48"
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

  <parametersLoadingDialog v-model='showParametersLoadingDialog'/>

  <nodeVariablesLoadingDialog v-model='showNodeVariablesLoadingDialog'/>



</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import eventVariablesDialog from "components/dialogs/EventVariablesDialog"
import {createNewEvent} from "components/functions/EventFunctions.js"
import {sleep} from "components/functions/utils.js"
import parametersLoadingDialog from "components/dialogs/parametersLoadingDialog"
import nodeVariablesLoadingDialog from "components/dialogs/NodevariablesLoadingDialog"

const store = inject('store')
const name = 'EventTeachDialog'

const selected_event_Identifier = ref("") // Dialog will complain if null
const selected_event_node = ref(0) // Dialog will complain if null
const showEventVariablesDialog = ref(false)
const showNodeVariablesLoadingDialog = ref(false)
const showParametersLoadingDialog = ref(false)
const isNewEvent = ref(false)


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  eventIdentifier: {type: String, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
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


const nodeList = computed(() => {
  //console.log(`Computed Events`)
  return Object.values(store.state.nodes)
})

watch(nodeList, () => {
  //console.log(`WATCH Nodes`)
  update_taught_nodes()
//  updateGroupList()
})

const update_taught_nodes = async () => {
  teRows.value = []
  taughtNodes.value = []
  nodeList.value.forEach(node => {
    if (Object.values(node.storedEvents).length > 0) {
      let events = Object.values(node.storedEvents)
      events.forEach(async event => {
        if (event.eventIdentifier == props.eventIdentifier) {
          taughtNodes.value.push(event.node)
          var nodeName = store.state.layout.nodeDetails[node.nodeNumber].name
          teRows.value.push({"number" : node.nodeNumber, "name" : nodeName, "eventIndex":event.eventIndex, "eventIdentifier":event.eventIdentifier})
          await checkNodeParameters(node.nodeNumber)
//temp          readEventVariables(node.nodeNumber, event.eventIndex)
        }
      })
    }
  })
  update_available_nodes()
}


const update_available_nodes = () =>{
  availableNodes.value = []
  var nodes = store.state.nodes                       // contains all node numbers
  // loop through json object properties with a for-in loop
  // returns top level property even if a nested object (not an index like an array)
  for (var nodeNumber in nodes) {
    // don't add node if event already taught to this node
    var notAdded = true
    for (var index in taughtNodes.value){
      if (taughtNodes.value[index] == nodeNumber){
        notAdded = false
//        console.log("update_available_nodes: event " + props.eventIdentifier + " already in node " + nodeNumber)
      }
    }
    if (notAdded){
      // not already taught, but only add to list if consumer node
      if (nodes[nodeNumber].consumer){
        var entry = nodeNumber + ': '
        if (store.state.layout.nodeDetails[nodeNumber]){
          // add node name if it exists
          entry += store.state.layout.nodeDetails[nodeNumber].name
        }
        availableNodes.value.push(entry)
      }
    }
  }  
}

onBeforeMount(() => {
})

onMounted(() => {
})

onUpdated(() => {
//  console.log("EventTeachDialog onUpdated")
  if (props.eventIdentifier){
    update_taught_nodes()
  }
})


const readEventVariables = (nodeNumber, eventIdentifier) => {
  // refresh event list
//  console.log(name + `: readEventVariables: node: ` + nodeNumber + ` eventIdentifier: ` + eventIdentifier)
  store.methods.request_event_variables_by_identifier(
    nodeNumber,
    eventIdentifier
  );
}


const checkNodeParameters = async (nodeNumber) => {
  // param9 - cpu type to check if parameters have been fully retrieved
  if(store.state.nodes[nodeNumber].parameters[9]){
//    console.log(name + ": parameters exist")
  } else {
//    console.log(name + ": checkNodeParameters: need to read node parameters")
    store.methods.request_all_node_parameters(nodeNumber, 20, 100)
    showParametersLoadingDialog.value = true
    var count = 0
    try {
      while (store.state.nodes[nodeNumber].parameters[9] == undefined){
        await sleep(10)
        count++
        // if 5 seconds elapsed, then exit by thowing error
        if (count >500) throw "failed to read Node Parameters"
      }
      showParametersLoadingDialog.value = false
    } catch (err){
      console.log(name + ": checkNodeParameters: " + err)
      showParametersLoadingDialog.value = false
    }
//    console.log(name + ": checkNodeParameters: end")
  }
}


const checkNodeVariables = async (nodeNumber) => {
  var maxNodeVariableIndex = store.state.nodes[nodeNumber].parameters[6]
  if(store.state.nodes[nodeNumber].nodeVariables[maxNodeVariableIndex]){
  } else {
//    console.log(name + ": checkNodeVariables: need to read node variables")
    store.methods.request_all_node_variables(
      nodeNumber,
      store.state.nodes[nodeNumber].parameters[6],
      100,
      1
    )
    showNodeVariablesLoadingDialog.value = true
    // set a count down based on number of node variables
    // but add minimum offset
    var countDown = (maxNodeVariableIndex * 10) + 20
    try {
      while (store.state.nodes[nodeNumber].nodeVariables[maxNodeVariableIndex] == undefined){
        await sleep(10)
        countDown--
        // 
        if (countDown <0 ) throw "failed to read Node Variables"
      }
      showNodeVariablesLoadingDialog.value = false
    } catch (err){
      console.log(name + ": checkNodeVariables: " + err)
      showNodeVariablesLoadingDialog.value = false
    }
//    console.log(name + ": checkNodeVariables: end")
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
//    console.log(`teach_event : ${nodeNumberToBeTaught} : ${props.eventIdentifier}`)

    await checkNodeParameters(nodeNumberToBeTaught)
    await checkNodeVariables(nodeNumberToBeTaught)
    createNewEvent(store, nodeNumberToBeTaught, props.eventIdentifier)             

    selected_event_node.value = nodeNumberToBeTaught
    selected_event_Identifier.value = props.eventIdentifier
    isNewEvent.value=true
    showEventVariablesDialog.value = true
  }
}

const clickVariables = (nodeNumber, eventIdentifier) => {
  console.log(name + `: clickVariables ` + nodeNumber + ' ' + eventIdentifier)
  selected_event_node.value = nodeNumber
  selected_event_Identifier.value = eventIdentifier
  isNewEvent.value=false
  showEventVariablesDialog.value = true
}

</script>

<style scoped>

</style>
