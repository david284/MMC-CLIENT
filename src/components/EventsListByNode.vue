<template>
  <div style="height: 45vh;">
    <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
      <div class="text-h6">
        Events for node :  {{ store.getters.node_name(props.nodeNumber) }}
      </div>
      <template v-slot:action>
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Add Event" @click="clickAddEvent()"/>
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Advanced" @click="clickAdvanced()"/>
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Refresh" @click="clickRefresh()"/>
      </template>
    </q-banner>

    <div class="full-width" >
    <q-table
      class="my-sticky-header-table"
      bordered
      dense
      :rows=rows
      :columns="columns"
      row-key="eventIdentifier"
      virtual-scroll
      :rows-per-page-options="[0]"
      :virtual-scroll-sticky-size-start="48"
      hide-bottom
    >
      <template v-slot:body="props">
        <q-tr :props="props" :class="selected_event_Identifier==props.row.eventIdentifier?'bg-blue-1':'bg-white'" class="q-my-none q-py-none">
          <q-td key="eventIdentifier" :props="props">{{ props.row.eventIdentifier }}</q-td>
          <q-td key="eventName" :props="props">{{ props.row.eventName}}</q-td>
          <q-td key="group" :props="props">{{ props.row.eventGroup }} </q-td>
          <q-td key="nodeNumber" :props="props">{{ props.row.nodeNumber }}</q-td>
          <q-td key="eventNumber" :props="props">{{ props.row.eventNumber }}</q-td>
          <q-td key="eventIndex" :props="props">{{ props.row.eventIndex }}</q-td>
          <q-td key="eventType" :props="props">{{ props.row.eventType }}</q-td>
          <q-td key="source" :props="props">{{ props.row.source }}</q-td>
          <q-td key="actions" :props="props">
            <q-btn dense class="q-mx-xs" outline size="md" color="primary" label="Name" @click="clickEventName(props.row.eventIdentifier)" no-caps/>
            <q-btn dense class="q-mx-xs" outline :disabled="!props.row.storedEvent" color="primary" size="md" label="Variables"
            @click="clickVariables(props.row.eventIndex, props.row.eventIdentifier)" no-caps/>
            <q-btn dense class="q-mx-xs" outline size="md" color="primary" label="Teach" @click="clickTeach(props.row.eventIdentifier)" no-caps/>
            <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOn(props.row.eventIdentifier)" no-caps>send ON</q-btn>
            <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOff(props.row.eventIdentifier)" no-caps>send OFF</q-btn>
            <q-btn dense class="q-mx-xs" outline size="md" color="negative" label="Delete" @click="clickDelete(props.row.eventIdentifier)" no-caps/>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    </div>

    <addEventToNodeDialog v-model='showAddEventToNodeDialog' />

    <advancedEventsDialog v-model='showAdvancedEventDialog'
      :nodeNumber = nodeNumber
    />

    <nameEventDialog v-model='showNameEventDialog'
      :eventIdentifier = selected_event_Identifier
    />

    <eventTeachDialog v-model='showEventTeachDialog'
      :eventIdentifier = selected_event_Identifier
    />

    <sendEventDialog v-model='showSendEventDialog'
      :sendingNodeNumber = nodeNumber
      :eventNumber = selected_event_number
      :eventIdentifier = selected_event_Identifier
    />

    <deleteEventDialog v-model='showDeleteEventDialog'
      :nodeNumber = nodeNumber
      :eventIdentifier = selected_event_Identifier
    />

    <eventVariablesDialog v-model='showEventVariablesDialog'
        :nodeNumber = nodeNumber
        :eventIdentifier = selected_event_Identifier
      />


  </div>
</template>

<script setup>

import {computed, inject, ref, watch, onBeforeMount, onMounted, onUpdated} from "vue"
import addEventToNodeDialog from "components/dialogs/AddEventToNodeDialog"
import advancedEventsDialog from "components/dialogs/AdvancedEventsDialog"
import sendEventDialog from "components/dialogs/SendEventDialog"
import deleteEventDialog from "components/dialogs/DeleteEventDialog"
import nameEventDialog from "components/dialogs/NameEventDialog"
import eventTeachDialog from "components/dialogs/EventTeachDialog"
import eventVariablesDialog from "components/dialogs/EventVariablesDialog"

const store = inject('store')
const name = "EventsListByNode"
const rows = ref([])
const showAddEventToNodeDialog = ref(false)
const showAdvancedEventDialog = ref(false)
const showDeleteEventDialog = ref(false)
const showEventTeachDialog = ref(false)
const showEventVariablesDialog = ref(false)
const showNameEventDialog = ref(false)
const showSendEventDialog = ref(false)
const newEventName = ref()
const selected_event_Identifier = ref("") // Dialog will complain if null
const selected_event_node = ref(0) // Dialog will complain if null
const selected_event_number = ref(0) // Dialog will complain if null
var eventType = ref()

const props = defineProps({
  nodeNumber: {type: Number, required: true }
})

const columns = [
  {name: 'eventIdentifier', field: 'eventIdentifier', required: true, label: 'Identifier', align: 'left', sortable: true},
  {name: 'eventName', field: 'eventName', required: false, label: 'Name', align: 'left', sortable: true},
  {name: 'group', field: 'group', required: true, label: 'Group', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Event node', align: 'left', sortable: true},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event number', align: 'left', sortable: true},
  {name: 'eventIndex', field: 'eventIndex', required: true, label: 'Event index', align: 'left', sortable: true},
  {name: 'eventType', field: 'eventType', required: true, label: 'Event type', align: 'left', sortable: true},
  {name: 'source', field: 'source', required: true, label: 'Event source', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: true}
]

// need to know if selected node changed
const selected_node = computed(() =>{
  return props.nodeNumber
})
watch(selected_node, () => {
//  console.log(name + `: WATCH selected_node`)
  update_rows()
})


// need to know if new events added
const nodeEvents = computed(() =>{
  return Object.values(store.state.nodes[props.nodeNumber].storedEvents)
})
watch(nodeEvents, () => {
//  console.log(name + `: WATCH nodeEvents`)
  update_rows()
})


// need to know if new bus events received
const busEvents = computed(() =>{
  return Object.values(store.state.busEvents)
})
watch(busEvents, () => {
//  console.log(name + `: WATCH busEvents`)
  update_rows()
})


// need to know if event name changes
const eventDetails = computed(() => {
  return store.state.layout.eventDetails
})
watch(eventDetails, () => {
//  console.log(name + `: WATCH eventDetails`)
  update_rows()
})


const update_rows = () => {
//  console.log(name + ': update_rows ' + props.nodeNumber)
  rows.value = []

//  console.log(name + ': update_rows: storedEvents ' + JSON.stringify(store.state.nodes[props.nodeNumber].storedEvents))
  // do stored events for this node first.....
  var storedEvents = Object.values(store.state.nodes[props.nodeNumber].storedEvents)
//  console.log(name + ': update_rows: storedEvents ' + JSON.stringify(storedEvents))
  storedEvents.forEach(event => {
//    console.log(name + ': update_rows: event ' + JSON.stringify(event))
    var eventNodeNumber = parseInt(event.eventIdentifier.substr(0, 4), 16)
    var eventNumber = parseInt(event.eventIdentifier.substr(4, 4), 16)
    let output = {}
    output['eventIdentifier'] = event.eventIdentifier
    output['eventName'] = store.getters.event_name(event.eventIdentifier)
    output['eventGroup'] = store.getters.event_group(event.eventIdentifier)
    output['eventIndex'] = event.eventIndex
    output['nodeNumber'] = eventNodeNumber
    output['eventNumber'] = eventNumber
    output['eventType'] = eventNodeNumber == 0 ? "short" : "long"
    output['storedEvent'] = true
    output['source'] = "stored event"
    rows.value.push(output)
  })

  // now add bus events... but not if already in the list
  // need to be careful with short events
  var busEvents = Object.values(store.state.busEvents)
  busEvents.forEach(busEvent => {
    if (busEvent.nodeNumber == props.nodeNumber){
      // ok, it's an event matching this node
      // lets see if it's already in the stored events...
      // we need to match long and short events differently
      var alreadyInList = false
      var eventIdentifier = busEvent.eventIdentifier

      // for short events, we need to drop the nodenumber to find a match
      // as 'short' stored events will always have 0 as node number
      if (busEvent.type == 'short'){
        eventIdentifier = '0000' + eventIdentifier.substr(4,4)
      }

      // now find if we have a match
      storedEvents.forEach(event => {
        if(eventIdentifier == event.eventIdentifier){
          alreadyInList = true
        }
      })

      if (alreadyInList == false){
        let output = {}
        output['eventIdentifier'] = eventIdentifier
        output['eventName'] = store.getters.event_name(eventIdentifier)
        output['nodeNumber'] = busEvent.nodeNumber
        output['eventNumber'] = busEvent.eventNumber
        output['eventType'] = busEvent.type
        output['storedEvent'] = false
        output['source'] = "bus event"
        rows.value.push(output)
      }
    }
  })

  // sort rows by eventIdentifier, not eventIndex
  rows.value.sort(function(a, b){return (a.eventIdentifier < b.eventIdentifier)? -1 : 1;});
}



const readEventVariables = (eventIndex) => {
  // refresh event list
//  console.log(name + `: readEventVariables - eventIndex ` + eventIndex)
  store.methods.request_all_event_variables(
    props.nodeNumber,
    eventIndex,
    100,
    store.state.nodes[props.nodeNumber].parameters[5]
  );
}

onBeforeMount(() => {
//  console.log(name + ": onBeforeMount")
  update_rows()
})

onMounted(() => {
})

onUpdated(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickAddEvent = () => {
  console.log(name + `: clickAddEvent`)
  showAddEventToNodeDialog.value = true
}


const clickAdvanced = () => {
  console.log(name + `: clickAdvanced`)
  showAdvancedEventDialog.value = true
}


const clickDelete = (eventIndentifier) => {
  console.log(name + `: clickDelete`)
  showDeleteEventDialog.value = true
  selected_event_Identifier.value = eventIndentifier
}


const clickEventName = (eventIdentifier) => {
  console.log(name + `: clickEventName ` + eventIdentifier)
  selected_event_Identifier.value = eventIdentifier
  newEventName.value = store.getters.event_name(eventIdentifier)
  showNameEventDialog.value = true;
}


const clickRefresh = () => {
  console.log(name + `: clickRefresh`)
  store.methods.request_all_node_events(props.nodeNumber)
update_rows()
}

const clickSendOff = (eventIdentifier) => {
  console.log (name + ": send OFF " + eventIdentifier)
  var eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
  var eventNumber = parseInt(eventIdentifier.slice(4,8), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_off_event(props.nodeNumber, eventNumber)
  } else {
    store.methods.long_off_event(eventNodeNumber, eventNumber)
  }
}


const clickSendOn = (eventIdentifier) => {
  console.log (name + ": send ON " + eventIdentifier)
  var eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
  var eventNumber = parseInt(eventIdentifier.slice(4,8), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_on_event(props.nodeNumber, eventNumber)
  } else {
    store.methods.long_on_event(eventNodeNumber, eventNumber)
  }
}


const clickTeach = (eventIndentifier) => {
  console.log(name + `: clickTeach`)
  selected_event_Identifier.value = eventIndentifier
  showEventTeachDialog.value = true
}


const clickTest = (nodeNumber, eventNumber, eventIndentifer) => {
  selected_event_node.value = nodeNumber
  selected_event_number.value = eventNumber
  selected_event_Identifier.value = eventIndentifer
  console.log(name + `: clickTest: event ` 
    + selected_event_node.value + ' ' 
    + selected_event_number.value + ' '
    + selected_event_Identifier.value)
  showSendEventDialog.value = true
}

const clickVariables = (eventIndex, eventIdentifier) => {
  readEventVariables(eventIndex)
  selected_event_Identifier.value = eventIdentifier
  console.log(name + `: clickVariables: node ` + props.nodeNumber)
  showEventVariablesDialog.value = true
}

</script>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 43vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    /* otherwise you see the table scrolling underneath the header */
    background-color: $blue-grey-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
