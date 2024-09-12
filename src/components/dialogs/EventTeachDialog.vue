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
                    @click="clickVariables(props.row.number, props.row.eventIndex, props.row.eventIdentifier)" no-caps/>
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
      />



</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import eventVariablesDialog from "components/dialogs/EventVariablesDialog"

const store = inject('store')
const name = 'EventTeachDialog'

const selected_event_Identifier = ref("") // Dialog will complain if null
const selected_event_node = ref(0) // Dialog will complain if null
const selected_event_index = ref(0) // Dialog will complain if null
const showEventVariablesDialog = ref(false)


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

const update_taught_nodes = () => {
  teRows.value = []
  taughtNodes.value = []
  nodeList.value.forEach(node => {
    if (Object.values(node.storedEvents).length > 0) {
      let events = Object.values(node.storedEvents)
      events.forEach(event => {
        if (event.eventIdentifier == props.eventIdentifier) {
          taughtNodes.value.push(event.node)
          var nodeName = store.state.layout.nodeDetails[node.nodeNumber].name
          teRows.value.push({"number" : node.nodeNumber, "name" : nodeName, "eventIndex":event.eventIndex, "eventIdentifier":event.eventIdentifier})
          checkNodeParameters(node.nodeNumber)
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


const readEventVariables = (nodeNumber, eventIndex) => {
  // refresh event list
//  console.log(name + `: readEventVariables: node: ` + nodeNumber + ` eventIndex: ` + eventIndex)
  store.methods.request_all_event_variables(
    nodeNumber,
    eventIndex,
    100,
    store.state.nodes[nodeNumber].parameters[5]
  );
}


// used to ensure the parameters have been read for a node
const checkNodeParameters = (nodeNumber) => {
//  console.log(name + `: checkNodeParameters ` + nodeNumber)
  // param9 - cpu type to check if parameters have been fully retrieved
  if(store.state.nodes[nodeNumber].parameters[9]){
//    console.log(name + ": parameters exist")
  } else {
//    console.log(name + ": need to read parameters")
    store.methods.request_all_node_parameters(nodeNumber, 20, 100)
  }
}

const getFreeEventIndex = (nodeNumber) => {
  // need to find first free event index - node parameter [4]
  var maxEventCount = store.state.nodes[nodeNumber].parameters[4]
  var eventIndex = null
  for (var i=1; i < maxEventCount; i++ ){
//    console.log(name + ': getFreeEventIndex: index ' + i)
    if (store.state.nodes[nodeNumber].storedEvents[i]) {
      continue
    } else {
      eventIndex = i + 3
      break
    }
  }
  return eventIndex
}

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickTeachEvent = () => {
//  console.log(name + `: ${newNode.value} : ${props.eventIdentifier}`)
  if (newNode.value != "") {
    // get node number from input value
    var array = newNode.value.split(':')
    var nodeNumberToBeTaught = parseInt(array[0])
    var eventIndexToBeTaught = getFreeEventIndex(parseInt(array[0]))
    console.log(`teach_event : ${nodeNumberToBeTaught} : ${eventIndexToBeTaught} : ${props.eventIdentifier}`)
    /*
    store.methods.teach_event(array[0], props.eventIdentifier, props.eventIndex)
    // make sure parameters have been read for the taught node in case the variables get edited
    checkNodeParameters(array[0])
    newNode.value = undefined
    */
  // create temporary event entry in storedEvent table (will be overwritten when module read after teach)
  store.state.nodes[nodeNumberToBeTaught].storedEvents[eventIndexToBeTaught] = {
      "eventIdentifier": props.eventIdentifier,
      "eventIndex": eventIndexToBeTaught,
      "node": nodeNumberToBeTaught,
      "variables": {}
  }

    selected_event_node.value = nodeNumberToBeTaught
    selected_event_index.value = eventIndexToBeTaught
    selected_event_Identifier.value = props.eventIdentifier
    showEventVariablesDialog.value = true

  }
}

const clickVariables = (nodeNumber, eventIndex, eventIdentifier) => {
  console.log(name + `: clickVariables ` + nodeNumber + ' ' + eventIndex + ' ' + eventIdentifier)
//temp  readEventVariables(nodeNumber, eventIndex)
  selected_event_node.value = nodeNumber
  selected_event_index.value = eventIndex
  selected_event_Identifier.value = eventIdentifier
  showEventVariablesDialog.value = true
}


</script>

<style scoped>

</style>
