<template>
  <div>
    <q-banner style="min-height: 0;" class="bg-primary text-white dense no-padding">
      <div class="text-h6">
        Events for node :  {{ store.getters.node_name(store.state.selected_node) }}
      </div>
    </q-banner>

    <div class="full-width" >
    <q-table 
      style="height: 350px"
      bordered
      dense
      :rows=rows
      :columns="columns"
      row-key="eventIdentifier"
      virtual-scroll
      :rows-per-page-options="[0]"
      :virtual-scroll-sticky-size-start="48"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="eventIdentifier" :props="props">{{ props.row.eventIdentifier }}</q-td>
          <q-td key="eventName" :props="props">{{ props.row.eventName}}</q-td>
          <q-td key="nodeNumber" :props="props">{{ props.row.nodeNumber }}</q-td>
          <q-td key="eventNumber" :props="props">{{ props.row.eventNumber }}</q-td>
          <q-td key="eventIndex" :props="props">{{ props.row.eventIndex }}</q-td>
          <!-- <q-td key="eventType" :props="props">{{ props.row.eventType }}</q-td> -->
          <q-td key="actions" :props="props">
            <q-btn flat size="md" color="primary" label="Name" @click="clickEventName(props.row.eventIdentifier)" no-caps/>
            <q-btn :disabled="!props.row.storedEvent" color="primary" size="md" flat label="Variables"
            @click="clickVariables(props.row.eventIndex, props.row.eventIdentifier)" no-caps/>
            <q-btn flat size="md" color="primary" label="Teach" @click="clickTeach(props.row.eventIdentifier)" no-caps/>
            <q-btn flat size="md" color="primary" label="Test" @click="clickTest(props.row.nodeNumber, props.row.eventNumber, props.row.eventindex)" no-caps/>
            <q-btn flat size="md" color="negative" label="Delete" @click="clickDelete(props.row.eventIdentifier)" no-caps/>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    </div>

    <nameEventDialog v-model='showNameEventDialog'
      :eventIdentifier = selected_event_Identifier
    />
 
    <eventTeachDialog v-model='showEventTeachDialog'
      :eventIdentifier = selected_event_Identifier
    />
 
    <sendEventDialog v-model='showSendEventDialog' 
      :nodeNumber = selected_event_node
      :eventNumber = selected_event_number
    />

    <deleteEventDialog v-model='showDeleteEventDialog' 
      :nodeNumber = store.state.selected_node
      :eventIdentifier = selected_event_Identifier
    />

    <eventVariablesDialog v-model='showEventVariablesDialog'
        :nodeNumber = store.state.selected_node
        :eventIndex = selected_event_index
        :eventIdentifier = selected_event_Identifier
      />


  </div>
</template>

<script setup>

/*/////////////////////////////////////////////////////////////////////////////////////

This component uses store.state.selected_node, not a nodeNumber prop passed in
This is becaue this componet is meant tobe driven from a nodelist, which will
set the selected_node element

/////////////////////////////////////////////////////////////////////////////////////*/

import {computed, inject, ref, watch, onBeforeMount, onMounted, onUpdated} from "vue"
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";
import sendEventDialog from "components/dialogs/SendEventDialog"
import deleteEventDialog from "components/dialogs/DeleteEventDialog"
import nameEventDialog from "components/dialogs/NameEventDialog"
import eventTeachDialog from "components/dialogs/EventTeachDialog"
import eventVariablesDialog from "components/dialogs/EventVariablesDialog"

const store = inject('store')

const rows = ref([])
const showNameEventDialog = ref(false)
const showSendEventDialog = ref(false)
const showDeleteEventDialog = ref(false)
const showEventTeachDialog = ref(false)
const showEventVariablesDialog = ref(false)
const newEventName = ref()
const selected_event_Identifier = ref("") // Dialog will complain if null
const selected_event_node = ref(0) // Dialog will complain if null
const selected_event_number = ref(0) // Dialog will complain if null
const selected_event_index = ref(0) // Dialog will complain if null
var eventType = ref()


const columns = [
  {name: 'eventIdentifier', field: 'eventIdentifier', required: true, label: 'Identifier', align: 'left', sortable: true},
  {name: 'eventName', field: 'eventName', required: false, label: 'Name', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Event node', align: 'left', sortable: true},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event number', align: 'left', sortable: true},
  {name: 'eventIndex', field: 'eventIndex', required: true, label: 'Event index', align: 'left', sortable: true},
  // {name: 'eventType', field: 'eventType', required: true, label: 'Event type', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: true}
]

// need to know if new event selected or new events added
const nodeEvents = computed(() =>{
  return Object.values(store.state.nodes[store.state.selected_node].storedEvents)
})
watch(nodeEvents, () => {
  console.log(`EventsListByNode WATCH nodeEvents`)
  update_rows()
})


// need to know if event name changes
const eventDetails = computed(() => {
  return store.state.layout.eventDetails
})
watch(eventDetails, () => {
  console.log(`EventsListByNode WATCH eventDetails`)
  update_rows()
})



const update_rows = () => {
  //console.log(`EventsListByNode Update Rows ${store.state.selected_node}`)
  rows.value = []

  // do stored events for this node first.....
  nodeEvents.value.forEach(event => {
    var eventNodeNumber = parseInt(event.eventIdentifier.substr(0, 4), 16)
    let output = {}
    output['eventIdentifier'] = event.eventIdentifier
    output['eventName'] = store.getters.event_name(event.eventIdentifier)
    output['eventIndex'] = event.eventIndex
    output['nodeNumber'] = eventNodeNumber
    output['eventNumber'] = parseInt(event.eventIdentifier.substr(4, 4), 16)
    output['eventType'] = getEventType(event.eventIndex)
    output['storedEvent'] = true
    rows.value.push(output)
  })

  // now add bus events... but not if already in the list
  var busEvents = Object.values(store.state.events) 
  busEvents.forEach(busEvent => {
    if (busEvent.nodeNumber == store.state.selected_node){
      // lets see if it's already in the stored events...
      var alreadyInList = false
      nodeEvents.value.forEach(event => {
        if(busEvent.id == event.eventIdentifier){
          alreadyInList = true
        }
      })
      if (alreadyInList == false){
        let output = {}
        output['eventIdentifier'] = busEvent.id
        output['eventName'] = store.getters.event_name(busEvent.id)
        output['nodeNumber'] = busEvent.nodeNumber
        output['eventNumber'] = busEvent.eventNumber
        output['storedEvent'] = false
        rows.value.push(output)
      }
    }
  })

  // sort rows by eventIdentifier, not eventIndex
  rows.value.sort(function(a, b){return (a.eventIdentifier < b.eventIdentifier)? -1 : 1;});
}


const getEventType = (eventIndex) =>{
  if(store.state.nodeDescriptors[store.state.selected_node]){
    var logic = store.state.nodeDescriptors[store.state.selected_node].producedEventLogic
    if (logic == undefined){
      return ""
    }
    var isProduced = parseLogicElement(logic, store, eventIndex)
    if (isProduced){
      return "produced"
    } else {
      return "consumed"
    }
  }
}

const refreshEvents = () => {
  // refresh event list
  console.log(`refresh Events`)
  store.methods.request_all_node_events(store.state.selected_node)
  var timeout = 0
  nodeEvents.value.forEach(event => {
    timeout += 100
    setTimeout(()=>{
        store.methods.request_all_event_variables(
          store.state.selected_node,
          event.eventIndex,
          100,
          store.state.nodes[store.state.selected_node].parameters[5]
        );
			} , timeout
    );
  });
}

onBeforeMount(() => {
  console.log("EventsListByNode - onBeforeMount")
  refreshEvents()
  update_rows()
})

onMounted(() => {
})

onUpdated(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickEventName = (eventIdentifier) => {
  console.log(`clickEventName ` + eventIdentifier)
  selected_event_Identifier.value = eventIdentifier
  newEventName.value = store.getters.event_name(eventIdentifier)
  showNameEventDialog.value = true;
}

const clickDelete = (eventIndentifier) => {
  console.log(`removeEvent`)
  showDeleteEventDialog.value = true
  selected_event_Identifier.value = eventIndentifier
//  store.methods.remove_event(nodeNumber, eventIndentifier)
}


const clickTest = (nodeNumber, eventNumber, eventIndex) => {
  selected_event_node.value = nodeNumber
  selected_event_number.value = eventNumber
  selected_event_index.value = eventIndex
  console.log(`testEvent - eventIdentifier ` + selected_event_node.value + ' ' + selected_event_number.value)
  showSendEventDialog.value = true
}

const clickVariables = (eventIndex, eventIdentifier) => {
  selected_event_index.value = eventIndex
  selected_event_Identifier.value = eventIdentifier
  console.log(`clickVariables - node, index ` + store.state.selected_node + ' ' + selected_event_index.value)
  showEventVariablesDialog.value = true
}

const clickTeach = (eventIndentifier) => {
  console.log(`clickTeach`)
  selected_event_Identifier.value = eventIndentifier
  showEventTeachDialog.value = true
}


</script>

<style scoped>

</style>
