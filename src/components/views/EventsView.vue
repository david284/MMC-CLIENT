<template>
  <div>
    <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none" >
      <div class="text-h6">Events View</div>
      <template v-slot:action>
        <q-btn class="q-mx-xs  q-my-none" size="sm" color="blue" label="Toggle"  no-caps
        @click="clickToggleViewMode()" />
        <div class="text-h6" style="min-width: 250px">View {{ store.state.events_view_mode }} events</div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-btn class="q-mx-xs q-my-none" size="sm" color="info" label="INFO"  no-caps
            @click="clickInfo()" />
        <q-space/>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-input class="input-box" bg-color="grey-3" style="width: 200px;" filled dense borderless debounce="300" v-model="filter" placeholder="Search">
            <q-icon size="sm" name="search"/>
        </q-input>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-space/>
        <q-btn class="q-mx-xs q-my-none" size="sm" color="blue" label="Delete Unused"
          @click="clickDeleteUnused()" />
        <q-space/>
        <q-btn class="q-mx-xs q-my-none" size="sm" color="blue" label="SCAN NODES"  no-caps
          @click="clickScanNodes()" />
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Add Event" @click="clickAddEvent()"/>
        <q-btn square unelevated color="primary" icon="settings">
          <q-menu auto-close>
            <q-list style="min-width: 100px">
              <q-item>
                <q-checkbox class="no-margin no-padding" v-model="store.state.layout.settings.enableEventIdentifier" @click="click_enableEventIdentifier" label="show Event Identifier column"></q-checkbox>
              </q-item>
              <q-item>
                <q-checkbox class="no-margin no-padding" v-model="store.state.layout.settings.enableEventGroup" @click="click_enableEventGroup" label="show Group column"></q-checkbox>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>
    </q-banner>

    <div>
      <q-table
        class = "eventsView-table"
        bordered
        dense
        :rows = displayEventTable
        :columns = "columns"
        :filter = "filter"
        row-key = "eventIdentifier"
        virtual-scroll
        v-model:pagnation = "pagnation"
        :rows-per-page-options = "[0]"
        :virtual-scroll-sticky-size-start = "0"
        :visible-columns="visibleColumns"
        hide-bottom
      >

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="eventName" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">{{ props.row.name }}</q-td>
              <q-td key="eventGroup" :props="props">{{ props.row.eventGroup }} </q-td>
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

              <q-td key="linkedNodes" :props="props">
                {{props.row.linkedNodeCount}}
                <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="sm" label="view"
                  @click="clickLinkedNodes(props.row.eventIdentifier)" no-caps/>
              </q-td>

              <q-td key="actions" :props="props">
                <q-btn dense class="q-mx-xs" outline  size="md" color="primary" label="Name" @click="clickEventName(props.row.eventIdentifier)" no-caps/>
                <q-btn dense class="q-mx-xs" outline  size="md" color="primary" label="Teach" @click="clickTeach(props.row.eventIdentifier)" no-caps/>
                <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOn(props.row.nodeNumber, props.row.eventIdentifier)" no-caps>Send ON</q-btn>
                <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOff(props.row.nodeNumber, props.row.eventIdentifier)" no-caps>Send OFF</q-btn>
                <q-btn :disabled="(props.row.linkedNodeCount != 0) " dense class="q-mx-xs" outline size="md" color="negative" label="Delete" @click="clickDelete(props.row.eventIdentifier)" no-caps/>
              </q-td>
            </q-tr>

          </template>
        </q-table>


<!--
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
 -->

      </div>
  </div>

  <AddEventDialog v-model='showAddEventDialog' />

  <nameEventDialog v-model='showNameEventDialog'
    :eventIdentifier = selected_event_Identifier
  />

  <eventTeachDialog v-model='showEventTeachDialog'
    :eventIdentifier = selected_event_Identifier
  />

  <linkedNodesDialog v-model='showLinkedNodesDialog'
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

import {inject, onBeforeMount, onMounted, computed, watch, ref, onUpdated} from "vue";
import { useQuasar } from 'quasar'
import AddEventDialog from "components/dialogs/AddEventDialog"
import sendEventDialog from "components/dialogs/SendEventDialog"
import nameEventDialog from "components/dialogs/NameEventDialog"
import eventTeachDialog from "components/dialogs/EventTeachDialog"
import eventsViewInfoDialog from "components/dialogs/EventsViewInfoDialog"
import linkedNodesDialog from "components/dialogs/LinkedNodesDialog"
import * as utils from "components/functions/utils.js"

const $q = useQuasar()
const store = inject('store')
const name = "EventsView"
const filter = ref('')
const pagnation = {rowsPerPage: 0}
let displayEventTable = ref([])
const showAddEventDialog = ref(false)
const showNameEventDialog = ref(false)
const showSendEventDialog = ref(false)
const showEventTeachDialog = ref(false)
const showEventsViewInfoDialog = ref(false)
const showLinkedNodesDialog = ref(false)
const selected_event_Identifier = ref("") // Dialog will complain if null
const newEventName = ref()
const selected_event_node = ref(0) // Dialog will complain if null
const selected_event_number = ref(0) // Dialog will complain if null
const showEventsJSON = ref(false)
const visibleColumns = ref([])

const columns = [
  {name: 'eventName', field: 'name', required: true, label: 'Event Name', align: 'left', sortable: true},
  {name: 'eventGroup', field: 'eventGroup', label: 'Group', align: 'left', sortable: true},
  {name: 'eventIdentifier', field: 'eventIdentifier', label: 'Event Identifier', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Event Node', align: 'left', sortable: true},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event Number', align: 'left', sortable: true},
  {name: 'type', field: 'type', required: true, label: 'Type', align: 'left', sortable: true},
  {name: 'status', field: 'status', required: true, label: 'Status', align: 'left', sortable: true},
  {name: 'linkedNodes', field: 'linkedNodes', required: true, label: 'Linked Nodes', align: 'left', sortable: false},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]

const layoutUpdated = computed(() => {
  return store.state.layout.updateTimestamp
})

watch(layoutUpdated, () => {
  //utils.timeStampedLog(name + `: WATCH: layoutUpdated`)
  update_events_table()
})


const nodesUpdated = computed(() => {
  return store.state.nodes.updateTimestamp
})

watch(nodesUpdated, () => {
  //utils.timeStampedLog(name + `: WATCH: nodesUpdated ` + nodesUpdated.value)
  update_events_table()
})

const busEvents = computed(() => {
  return Object.values(store.state.busEvents)
})

watch(busEvents, () => {
  //utils.timeStampedLog(name + `: WATCH busEvents`)
  update_events_table()
})

const update_events_table = () => {
//  utils.timeStampedLog(name + `:Update Events`)
  let displayEventListLocal = []
  let events = store.state.layout.eventDetails
  // order by eventIdentifier
  for (let eventIdentifier of Object.keys(events).sort()) {
    if (eventIdentifier.length == 8){
      var nodeNumber = parseInt(eventIdentifier.substring(0, 4), 16)
      if (store.state.event_view_status[eventIdentifier] == undefined){
        store.state.event_view_status[eventIdentifier] = 'unknown'
      }
      //
      // we use events_view_mode to decide which events we want to exclude from being displayed
      if (((store.state.events_view_mode == 'short') && (nodeNumber > 0)) ||
        ((store.state.events_view_mode == 'long') && (nodeNumber == 0)) ||
        ((store.state.events_view_mode == 'named') && (events[eventIdentifier].name == ''))) {
        // don't add this node as we've elected to not display it
      } else {
        let output = {}
        output['eventIdentifier'] = eventIdentifier
        output['nodeNumber'] = nodeNumber
        output['eventNumber'] = parseInt(eventIdentifier.slice(4,8), 16)
        output['type'] = nodeNumber == 0 ? "short" : "long"
        output['name'] = store.getters.event_name(eventIdentifier)
        output['colour'] = events[eventIdentifier].colour
        output['eventGroup'] = events[eventIdentifier].group
        output['status'] = store.state.event_view_status[eventIdentifier]
        output['linkedNodeCount'] = getLinkedNodesCount(eventIdentifier)
        displayEventListLocal.push(output)
      }
    }
  }
//  utils.timeStampedLog(name + ": eventlist " + JSON.stringify(displayEventListLocal))
  displayEventTable.value = displayEventListLocal
}


const event_colour = (eventIdentifier) => {
  if (eventIdentifier in store.state.layout.eventDetails) {
    //utils.timeStampedLog(`Event Colour`)
    return store.state.layout.eventDetails[eventIdentifier].colour
  } else {
    //utils.timeStampedLog(`Event No Colour ${JSON.stringify(eventIdentifier)}`)
    return "blue"
  }
}


const getLinkedNodesCount = (eventIdentifier) => {
  var count = 0
  let nodesList = Object.keys(store.state.nodes)
  try{
    nodesList.forEach(node => {
      if (eventIdentifier in store.state.nodes[node].storedEventsNI){
        count++
      }
    })
  } catch {}
  return count
}


store.eventBus.on('BUS_TRAFFIC_EVENT', (data) => {
//  utils.timeStampedLog(name + ': BUS_TRAFFIC_EVENT : ' + JSON.stringify(data.json.eventIdentifier))
  utils.timeStampedLog(name + ': BUS_TRAFFIC_EVENT : opcode ' + data.json.opCode)
  var eventIdentifier = data.json.eventIdentifier
  var opCode = data.json.opCode
  var status = 'unknown'
  // check for ON event
  if ((opCode == '90')
    || (opCode == '98')
    || (opCode == 'B0')
    || (opCode == 'B8')
    || (opCode == 'D0')
    || (opCode == 'D8')
    || (opCode == 'F0')
    || (opCode == 'F8')
    ){
      utils.timeStampedLog(name + ': BUS_TRAFFIC_EVENT : ON event ' + eventIdentifier)
      status = 'on'
    }

  // check for OFF event
  if ((opCode == '91')
    || (opCode == '99')
    || (opCode == 'B1')
    || (opCode == 'B9')
    || (opCode == 'D1')
    || (opCode == 'D9')
    || (opCode == 'F1')
    || (opCode == 'F9')
    ){
      utils.timeStampedLog(name + ': BUS_TRAFFIC_EVENT : OFF event ' + eventIdentifier)
      status = 'off'
  }
  if (status != 'unknown'){
    if (store.state.event_view_status[eventIdentifier] != undefined){
      store.state.event_view_status[eventIdentifier] = status
    }
    update_events_table()
  }

})



onBeforeMount(() => {
//  utils.timeStampedLog(name + `: onBeforeMount`)
  update_events_table()
  getSettings()
})

/*
onMounted(() => {
    utils.timeStampedLog(name + `: onMounted`)
    update_events_table()
})

onUpdated(() => {
    utils.timeStampedLog(name + `: onUpdated`)
})
    */

//
//
const getSettings = () => {
  if (store.state.layout.settings == undefined){store.state.layout["settings"] = {"EventsByNodeView":{}}}
  if (store.state.layout.settings.EventsByNodeView == undefined){store.state.layout.settings["EventsByNodeView"] = {}}
  //
  if (store.state.layout.settings.enableEventIdentifier == undefined){
    store.state.layout.settings['enableEventIdentifier'] = true
    store.state.update_layout_needed = true
  }
  //
  if (store.state.layout.settings.EventsByNodeView.enableEventIndex == undefined){
    store.state.layout.settings.EventsByNodeView['enableEventIndex'] = true
    store.state.update_layout_needed = true
  }
  //
  if (store.state.layout.settings.enableEventGroup == undefined){
    store.state.layout.settings['enableEventGroup'] = true
    store.state.update_layout_needed = true
  }
  utils.setVisibleColumn(visibleColumns.value, "eventIdentifier", store.state.layout.settings.enableEventIdentifier)
  utils.setVisibleColumn(visibleColumns.value, "eventIndex", store.state.layout.settings.EventsByNodeView.enableEventIndex)
  utils.setVisibleColumn(visibleColumns.value, "eventGroup", store.state.layout.settings.enableEventGroup)
}

//
//
store.eventBus.on('LAYOUT_DATA', () => {
//  timeStampedLog(name + ': LAYOUT_DATA')
  getSettings()
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickAddEvent = () => {
  utils.timeStampedLog(name + `: clickAddEvent`)
  showAddEventDialog.value = true
}


const clickDelete = (eventIdentifier) => {
  utils.timeStampedLog(name + `: clickDelete`)
  const result = $q.notify({
    message: 'Are you sure you want to delete event ' + store.getters.event_name(eventIdentifier),
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => {
        delete store.state.layout.eventDetails[eventIdentifier]
        store.state.update_layout_needed = true
        update_events_table()
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

const clickDeleteUnused = (eventIdentifier) => {
  utils.timeStampedLog(name + `: clickDeleteUnused`)
  const result = $q.notify({
    message: 'Continue with delete?',
    caption: 'To be deleted, events must have no linked nodes and also no user provided name',
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => {
        let events = store.state.layout.eventDetails
        let count = 0
        // order by eventIdentifier
        for (let eventIdentifier of Object.keys(events).sort()) {
          var nodeNumber = parseInt(eventIdentifier.substring(0, 4), 16)
          if ((store.state.layout.eventDetails[eventIdentifier].name == undefined)
          || (store.state.layout.eventDetails[eventIdentifier].name.length == 0))
          {
            if (getLinkedNodesCount(eventIdentifier) == 0){
              utils.timeStampedLog(name + `: ${eventIdentifier} ${store.getters.event_name(eventIdentifier)}`)
              count++
              delete store.state.layout.eventDetails[eventIdentifier]
              store.state.update_layout_needed = true
            }
          }
        }
        utils.timeStampedLog(name + `: events deleted ${count}`)
        update_events_table()
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

//
//
const click_enableEventIdentifier = () => {
  utils.timeStampedLog(name + `: click_enableEventIdentifier ${store.state.layout.settings.enableEventIdentifier}`)
  utils.setVisibleColumn(visibleColumns.value, "eventIdentifier", store.state.layout.settings.enableEventIdentifier)
  store.state.update_layout_needed = true
}

//
//
const click_enableEventGroup = () => {
  utils.timeStampedLog(name + `: click_enableEventGroup ${store.state.layout.settings.enableEventGroup}`)
  utils.setVisibleColumn(visibleColumns.value, "eventGroup", store.state.layout.settings.enableEventGroup)
  store.state.update_layout_needed = true
}

//
//
const clickEventName = (eventIdentifier) => {
  utils.timeStampedLog(name + `: clickEventName ` + eventIdentifier)
  selected_event_Identifier.value = eventIdentifier
  newEventName.value = store.getters.event_name(eventIdentifier)
  showNameEventDialog.value = true;
}


const clickInfo = () => {
  utils.timeStampedLog(name + `: clickInfo`)
  showEventsViewInfoDialog.value = true
}


const clickLinkedNodes = (eventIdentifier) => {
  utils.timeStampedLog(name + `: clickLinkedNodes ` + eventIdentifier)
  selected_event_Identifier.value = eventIdentifier
  showLinkedNodesDialog.value = true
}


const clickScanNodes = () => {
  utils.timeStampedLog(name + `: clickScanNodes`)
  var nodeNumberList = Object.keys(store.state.nodes)
  nodeNumberList.forEach(nodeNumber => {
    EventFunctions.requestAllNodeEvents(nodeNumber)
  })
}


const clickSendOff = (nodeNumber, eventIdentifier) => {
  utils.timeStampedLog (name + ": Send OFF " + nodeNumber + ' ' + eventIdentifier)
  var eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
  var eventNumber = parseInt(eventIdentifier.slice(4,8), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_off_event(nodeNumber, eventNumber)
  } else {
    store.methods.long_off_event(eventNodeNumber, eventNumber)
  }
}


const clickSendOn = (nodeNumber, eventIdentifier) => {
  utils.timeStampedLog (name + ": Send ON " + nodeNumber + ' ' + eventIdentifier)
  var eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
  var eventNumber = parseInt(eventIdentifier.slice(4,8), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_on_event(nodeNumber, eventNumber)
  } else {
    store.methods.long_on_event(eventNodeNumber, eventNumber)
  }
}


const clickTeach = (eventIndentifier) => {
  utils.timeStampedLog(name + `: clickTeach ` + eventIndentifier)
  selected_event_Identifier.value = eventIndentifier
  showEventTeachDialog.value = true
}


const clickToggleShowEventsJSON = () => {
  utils.timeStampedLog(name + `: clickToggleShowEventsJSON`)
  if (showEventsJSON.value){
    showEventsJSON.value = false
  } else {
    showEventsJSON.value = true
  }
}


const clickToggleViewMode = () => {
  utils.timeStampedLog(name + `: clickToggleViewMode`)
  switch(store.state.events_view_mode){
    case 'all':
      store.state.events_view_mode = 'short'
      break
    case 'short':
      store.state.events_view_mode = 'long'
      break
    case 'long':
      store.state.events_view_mode = 'named'
      break
    case 'named':
      store.state.events_view_mode = 'all'
      break
    default:
      store.state.events_view_mode = 'all'
  }
  //utils.timeStampedLog(name + `: clickToggleViewMode ${store.state.events_view_mode}`)
  update_events_table()
}


</script>

<style lang="sass">
.eventsView-table
  /* height or max-height is important */
  height: 89vh

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

<style scoped>
:deep(.input-box .q-field__control),
:deep(.input-box .q-field__marginal) {
  height: 25px;
  font-size: 12px;
}
</style>
