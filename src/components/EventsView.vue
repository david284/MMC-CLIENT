<template>

<div style="height: 45vh;">
    <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none" >
      <div class="text-h6">Events View</div>
      <template v-slot:action>
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Add Event" @click="clickAddEvent()"/>
      </template>
    </q-banner>

    <q-card>
      <q-card-section class="no-margin no-padding">

        <q-table
            title = "Events View"
            class = "events-table"
            dense
            :rows = displayEventTable
            :columns = "columns"
            :filter = "filter"
            row-key = "eventIdentifier"
            virtual-scroll
            v-model:pagnation = "pagnation"
            :rows-per-page-options = "[0]"
            :virtual-scroll-sticky-size-start = "0"
            hide-bottom
          >
          <template v-slot:top="">
            <q-btn dense class="q-mx-xs" outline  size="md" color="primary" label="Toggle"  no-caps
            @click="clickToggleViewMode()" />
            <div class="text-h6" style="min-width: 250px">{{ viewModes[viewModeIndex] }}</div>
            <q-space/>
            <q-btn dense class="q-mx-xs" size="md" color="info" label="INFO"  no-caps
            @click="clickInfo()" />
            <q-space/>
            <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
            <q-space/>
            <q-btn dense class="q-mx-xs" size="md" color="primary" label="SCAN NODES"  no-caps
            @click="clickScanNodes()" />
            <q-space/>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="eventName" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">{{ props.row.name }}</q-td>
              <q-td key="group" :props="props">{{ props.row.group }} </q-td>
              <q-td key="eventIdentifier" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">
                {{ props.row.eventIdentifier }}
              </q-td>
              <q-td key="nodeNumber" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">
                {{ props.row.nodeNumber }}
              </q-td>
              <q-td key="eventNumber" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">
                {{ props.row.eventNumber }}
              </q-td>
              <q-td key="type" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">
                {{ props.row.type }}
              </q-td>
              <q-td key="status" :props="props">
                <q-chip color="white" text-color="green" v-if="props.row.status=='on'">ON</q-chip>
                <q-chip color="white" text-color="red" v-else-if="props.row.status=='off'">OFF</q-chip>
                <q-chip color="white" text-color="blue" v-else>unknown</q-chip>
              </q-td>
              <q-td key="actions" :props="props">
                <q-btn dense class="q-mx-xs" outline  size="md" color="primary" label="Name" @click="clickEventName(props.row.eventIdentifier)" no-caps/>
                <q-btn dense class="q-mx-xs" outline  size="md" color="primary" label="Teach" @click="clickTeach(props.row.eventIdentifier)" no-caps/>
                <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOn(props.row.nodeNumber, props.row.eventIdentifier)" no-caps>send ON</q-btn>
                <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOff(props.row.nodeNumber, props.row.eventIdentifier)" no-caps>send OFF</q-btn>
              </q-td>
            </q-tr>

          </template>
        </q-table>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Toggle event details json" @click="clickToggleShowEventsJSON()"/>
        </q-card-actions>

        <q-card-section class="q-pa-sm" v-if="showEventsJSON">
          <div class="q-pa-xs row">
            <div class="text-body1">Events<br></div>
            <div class="text-body2">
              <pre>{{ store.state.layout.eventDetails }}</pre>
            </div>
          </div>
        </q-card-section>

      </q-card-section>
    </q-card>

  </div>

  <addEventToLayoutDialog v-model='showAddEventToLayoutDialog' />

  <nameEventDialog v-model='showNameEventDialog'
    :eventIdentifier = selected_event_Identifier
  />

  <eventTeachDialog v-model='showEventTeachDialog'
    :eventIdentifier = selected_event_Identifier
  />

  <sendEventDialog v-model='showSendEventDialog'
    :sendingNodeNumber = selected_event_node
    :eventNumber = selected_event_number
    :eventIdentifier = selected_event_Identifier
  />

  <eventsViewInfoDialog v-model='showEventsViewInfoDialog'/>


</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import addEventToLayoutDialog from "components/dialogs/AddEventToLayoutDialog"
import sendEventDialog from "components/dialogs/SendEventDialog"
import nameEventDialog from "components/dialogs/NameEventDialog"
import eventTeachDialog from "components/dialogs/EventTeachDialog"
import eventsViewInfoDialog from "components/dialogs/EventsViewInfoDialog"

const store = inject('store')
const name = "EventsView"
const tab = ref('nodes')
const filter = ref('')
const pagnation = {rowsPerPage: 0}
let displayEventTable = ref([])
const showAddEventToLayoutDialog = ref(false)
const showNameEventDialog = ref(false)
const showSendEventDialog = ref(false)
const showEventTeachDialog = ref(false)
const showEventsViewInfoDialog = ref(false)
const selected_event_Identifier = ref("") // Dialog will complain if null
const newEventName = ref()
const selected_event_node = ref(0) // Dialog will complain if null
const selected_event_number = ref(0) // Dialog will complain if null
const showEventsJSON = ref(false)
const viewModeIndex = ref(0)

const viewModes = ref({
  0:"view all events",
  1: "view short events only"
})


const columns = [
  {name: 'eventName', field: 'name', required: true, label: 'Event Name', align: 'left', sortable: true},
  {name: 'group', field: 'group', required: true, label: 'Group', align: 'left', sortable: true},
  {name: 'eventIdentifier', field: 'eventIdentifier', required: true, label: 'Event Identifier', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Event Node Number', align: 'left', sortable: false},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event Number', align: 'left', sortable: false},
  {name: 'type', field: 'type', required: true, label: 'Type', align: 'left', sortable: false},
  {name: 'status', field: 'status', required: true, label: 'Status', align: 'left', sortable: false},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]

const EventsList = computed(() => {
  //console.log(`Computed Events`)
  return Object.values(store.state.layout.eventDetails)
})

watch(EventsList, () => {
  //console.log(`WATCH Events`)
  update_events_table()
})

const eventDetails = computed(() => {
  return store.state.layout.eventDetails
})

watch(eventDetails, () => {
  //console.log(`WATCH Details`)
  update_events_table()
})

const busEvents = computed(() => {
  return Object.values(store.state.busEvents)
})

watch(busEvents, () => {
  console.log(name + `: WATCH busEvents`)
  update_events_table()
})

const update_events_table = () => {
  console.log(name + `:Update Events`)
  let displayEventListLocal = []
  let events = store.state.layout.eventDetails
  // order keys
  for (let key of Object.keys(events).sort()) {
    var nodeNumber = parseInt(key.substring(0, 4), 16)
    if ((viewModeIndex.value == 1) && (nodeNumber > 0)){
      // don't add this node as we've selected short events only
    } else {
      let output = {}
      output['eventIdentifier'] = key
      output['nodeNumber'] = nodeNumber
      output['eventNumber'] = parseInt(key.slice(4,8), 16)
      output['type'] = nodeNumber == 0 ? "short" : "long"
      output['name'] = events[key].name
      output['colour'] = events[key].colour
      output['group'] = events[key].group
      output['status'] = events[key].status
      displayEventListLocal.push(output)
    }
  }
//  console.log(name + ": eventlist " + JSON.stringify(displayEventListLocal))
  displayEventTable.value = displayEventListLocal
}


const event_colour = (eventIdentifier) => {
  if (eventIdentifier in store.state.layout.eventDetails) {
    //console.log(`Event Colour`)
    return store.state.layout.eventDetails[eventIdentifier].colour
  } else {
    //console.log(`Event No Colour ${JSON.stringify(eventIdentifier)}`)
    return "blue"
  }
}

store.eventBus.on('BUS_TRAFFIC_EVENT', (data) => {
//  console.log(name + ': BUS_TRAFFIC_EVENT : ' + JSON.stringify(data.json.eventIdentifier))
  var eventIdentifier = data.json.eventIdentifier
  var opCode = data.json.opCode
  var status = 'unknown'
  // check for ON event
  if ((opCode == 90)
    || (opCode == 98)
  //  || (opCode == B0)
  //  || (opCode == B8)
  //  || (opCode == D0)
  //  || (opCode == D8)
  //  || (opCode == F0)
  //  || (opCode == F8)
    ){
      console.log(name + ': BUS_TRAFFIC_EVENT : ON event ' + eventIdentifier)
      status = 'on'
    }

  // check for OFF event
  if ((opCode == 91)
    || (opCode == 99)
//    || (opCode == B1)
//    || (opCode == B9)
//    || (opCode == D1)
//    || (opCode == D9)
//    || (opCode == F1)
//    || (opCode == F9)
    ){
      console.log(name + ': BUS_TRAFFIC_EVENT : OFF event ' + eventIdentifier)
      status = 'off'
  }
  if (status != 'unknown'){
    let events = store.state.layout.eventDetails
    for (let key of Object.keys(events).sort()) {
      if (key == eventIdentifier){
        store.state.layout.eventDetails[key].status = status  
      }
    }
    update_events_table()
  }

})

/*
BUS_TRAFFIC_EVENT {"direction":"Out","json":{"encoded":":SB780N9800000001;","ID_TYPE":"S","mnemonic":"ASON","opCode":"98","nodeNumber":0,"deviceNumber":1,"eventIdentifier":"00000001","eventData":{"hex":""},"text":"ASON (98) Node 0 Device Number 1"}}
*/




onBeforeMount(() => {
//  store.methods.query_all_nodes()
  update_events_table()
})

onMounted(() => {
  update_events_table()
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickAddEvent = () => {
  console.log(name + `: clickAddEvent`)
  showAddEventToLayoutDialog.value = true
}

const clickEventName = (eventIdentifier) => {
  console.log(name + `: clickEventName ` + eventIdentifier)
  selected_event_Identifier.value = eventIdentifier
  newEventName.value = store.getters.event_name(eventIdentifier)
  showNameEventDialog.value = true;
}

const clickInfo = () => {
  console.log(name + `: clickInfo`)
  showEventsViewInfoDialog.value = true
}

const clickScanNodes = () => {
//  console.log(name + `: clickScanNodes`)
  var nodeList = Object.values(store.state.nodes)
  try{
    nodeList.forEach(node => {
      store.methods.request_all_node_events(node.nodeNumber)
      update_events_table()
    })
  } catch (err){
    console.log(name + `: clickScanNodes: ` + err)
  }
}

const clickSendOff = (nodeNumber, eventIdentifier) => {
  console.log (name + ": send OFF " + nodeNumber + ' ' + eventIdentifier)
  var eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
  var eventNumber = parseInt(eventIdentifier.slice(4,8), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_off_event(nodeNumber, eventNumber)
  } else {
    store.methods.long_off_event(eventNodeNumber, eventNumber)
  }
}


const clickSendOn = (nodeNumber, eventIdentifier) => {
  console.log (name + ": send ON " + nodeNumber + ' ' + eventIdentifier)
  var eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
  var eventNumber = parseInt(eventIdentifier.slice(4,8), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_on_event(nodeNumber, eventNumber)
  } else {
    store.methods.long_on_event(eventNodeNumber, eventNumber)
  }
}

const clickTeach = (eventIndentifier) => {
  console.log(name + `: clickTeach`)
  selected_event_Identifier.value = eventIndentifier
  showEventTeachDialog.value = true
}

const clickToggleShowEventsJSON = () => {
  console.log(name + `: clickToggleShowEventsJSON`)
  if (showEventsJSON.value){
    showEventsJSON.value = false
  } else {
    showEventsJSON.value = true
  }
}

const clickToggleViewMode = () => {
  console.log(name + `: clickToggleViewMode`)
  viewModeIndex.value++
  if (viewModeIndex.value > 1){viewModeIndex.value = 0}
  update_events_table()
}





</script>

<style lang="sass">
.events-table
  /* height or max-height is important */
  height: 600px

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
