<template>
  <div style="height: 35vh;">
    <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
      <div class="text-h6">
        Events for node :  {{ store.getters.node_name(props.nodeNumber) }}
      </div>
      <template v-slot:action>
        <q-btn class="q-mx-xs  q-my-none" size="sm" color="blue" label="Toggle"  no-caps
          @click="clickToggleViewMode()" />
        <div class="text-h6" style="min-width: 250px">view {{ store.state.events_view_mode }} events</div>
        <q-btn class="q-mx-xs q-my-none" size="sm" color="info" label="INFO"  no-caps
            @click="clickInfo()" />
        <q-space/>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-input class="input-box" bg-color="grey-3" style="width: 200px;" filled dense borderless debounce="300" v-model="filter" placeholder="Search">
            <q-icon size="sm" name="search"/>
        </q-input>
        &nbsp;&nbsp;
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Add Event" @click="clickAddEvent()"/>
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Advanced" @click="clickAdvanced()"/>
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Refresh" @click="clickRefresh()"/>
        <q-btn square unelevated color="primary" icon="settings" @click="clickSettings()"/>
      </template>
    </q-banner>

    <div class="full-width" >
    <q-table
      class="events-list-by-node-table"
      bordered
      dense
      :rows=rows
      :columns="columns"
      :filter="filter"
      row-key="eventIdentifier"
      virtual-scroll
      :rows-per-page-options="[0]"
      :virtual-scroll-sticky-size-start="0"
      :visible-columns="visibleColumns"
      hide-bottom
    >
      <template v-slot:body="props">
        <q-tr :props="props" :class="selected_event_Identifier==props.row.eventIdentifier?'bg-blue-1':'bg-white'" class="q-my-none q-py-none">
          <q-td key="eventIdentifier" :props="props">{{ props.row.eventIdentifier }}</q-td>
          <q-td key="eventName" :props="props">{{ props.row.eventName}}</q-td>
          <q-td key="eventGroup" :props="props">{{ props.row.eventGroup }}</q-td>
          <q-td key="nodeNumber" :props="props">{{ props.row.nodeNumber }}</q-td>
          <q-td key="eventNumber" :props="props">{{ props.row.eventNumber }}</q-td>
          <!-- <q-td key="eventIndex" :props="props">{{ props.row.eventIndex }}</q-td> -->
          <q-td key="eventType" :props="props">{{ props.row.eventType }}</q-td>
          <q-td key="source" :props="props">{{ props.row.source }}</q-td>
          <q-td key="actions" :props="props">
            <q-btn dense class="q-mx-xs" outline size="md" color="primary" label="Name" @click="clickEventName(props.row.eventIdentifier)" no-caps/>
            <q-btn dense class="q-mx-xs" outline :disabled="!props.row.storedEvent" color="primary" size="md" label="Variables"
            @click="clickVariables(props.row.eventIdentifier)" no-caps/>
            <q-btn dense class="q-mx-xs" outline size="md" color="primary" label="Teach" @click="clickTeach(props.row.eventIdentifier)" no-caps/>
            <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOn(props.row.eventIdentifier)" no-caps>send ON</q-btn>
            <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOff(props.row.eventIdentifier)" no-caps>send OFF</q-btn>
            <q-btn dense class="q-mx-xs" outline size="md" color="negative" label="Delete" @click="clickDelete(props.row.eventIdentifier)" no-caps/>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    </div>

    <AddEventDialog v-model='showAddEventDialog'
      :nodeNumber = nodeNumber
    />

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

    <eventVariablesDialog v-model='showEventVariablesDialog'
        :nodeNumber = nodeNumber
        :eventIdentifier = selected_event_Identifier
      />

      <EventsByNodeViewInfoDialog v-model='showEventsByNodeViewInfoDialog'/>

      <WaitingOnBusTrafficDialog v-model='showWaitingOnBusTrafficDialog'
        callingModule = "EventsListByNode"
        :message = WaitingOnBusTrafficMessage
        @WaitingOnBusTrafficDialogEvent="WaitingOnBusTrafficDialogReturn = $event"
      />

    <q-dialog v-model="showSettingsDialog" persistent>
      <q-card style="min-width: 500px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Events by Node View Settings
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card>
          <q-card-section class="no-margin no-padding">
            <q-checkbox v-model="store.state.layout.settings.EventsByNodeView.enableEventIdentifier" @click="click_enableEventIdentifier" label="show Event Identifier column"></q-checkbox>
          </q-card-section>
        </q-card>

      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>

import {computed, inject, ref, watch, onBeforeMount, onMounted, onUpdated} from "vue"
import { date, useQuasar, scroll } from 'quasar'
import AddEventDialog from "components/dialogs/AddEventDialog"
import advancedEventsDialog from "components/dialogs/AdvancedEventsDialog"
import sendEventDialog from "components/dialogs/SendEventDialog"
import nameEventDialog from "components/dialogs/NameEventDialog"
import eventTeachDialog from "components/dialogs/EventTeachDialog"
import eventVariablesDialog from "components/dialogs/EventVariablesDialog"
import EventsByNodeViewInfoDialog from "components/dialogs/EventsByNodeViewInfoDialog"
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog"
import { sleep } from "../functions/utils"
import {timeStampedLog} from "components/functions/utils.js"


const $q = useQuasar()
const store = inject('store')
const name = "EventsListByNode"
const rows = ref([])
const filter = ref('')
const showAddEventDialog = ref(false)
const showAdvancedEventDialog = ref(false)
const showWaitingOnBusTrafficDialog = ref(false)
const showEventTeachDialog = ref(false)
const showEventVariablesDialog = ref(false)
const showEventsByNodeViewInfoDialog = ref(false)
const showNameEventDialog = ref(false)
const showSendEventDialog = ref(false)
const newEventName = ref()
const selected_event_Identifier = ref("") // Dialog will complain if null
const selected_event_node = ref(0) // Dialog will complain if null
const selected_event_number = ref(0) // Dialog will complain if null
const WaitingOnBusTrafficDialogReturn = ref('')
const WaitingOnBusTrafficMessage = ref('')
const showSettingsDialog = ref(false)


const props = defineProps({
  nodeNumber: {type: Number, required: true }
})

const visibleColumns = ref([])

const columns = [
  {name: 'eventIdentifier', field: 'eventIdentifier', label: 'Identifier', align: 'left', sortable: true},
  {name: 'eventName', field: 'eventName', required: false, label: 'Name', align: 'left', sortable: true},
  {name: 'eventGroup', field: 'eventGroup', required: false, label: 'Group', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Event node', align: 'left', sortable: true},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event number', align: 'left', sortable: true},
  {name: 'eventType', field: 'eventType', required: true, label: 'Event type', align: 'left', sortable: true},
  {name: 'source', field: 'source', required: true, label: 'Event source', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: true}
]


// need to know if selected node changed
const selected_node = computed(() =>{
  return props.nodeNumber
})
watch(selected_node, () => {
  //timeStampedLog(name + `: WATCH selected_node`)
  if (props.nodeNumber){
    update_rows()
  }
})


// need to know if new bus events received
const busEvents = computed(() =>{
  return Object.values(store.state.busEvents)
})
watch(busEvents, () => {
  //timeStampedLog(name + `: WATCH busEvents`)
  if (props.nodeNumber){
    update_rows()
  }
})


// watch if anything in the layout changes
const layoutUpdated = computed(() => {
  return store.state.layout.updateTimestamp
})

watch(layoutUpdated, () => {
  //timeStampedLog(name + `: WATCH: layoutUpdated`)
  if (props.nodeNumber){
    update_rows()
  }
})


// watch if any nodes change
const nodesUpdated = computed(() => {
  return store.state.nodes.updateTimestamp
})

watch(nodesUpdated, () => {
  //timeStampedLog(name + `: WATCH: nodesUpdated ` + nodesUpdated.value)
  if (props.nodeNumber){
    update_rows()
  }
})


const update_rows = () => {
//  timeStampedLog(name + ': update_rows ' + props.nodeNumber)
  rows.value = []
  try{
    // do stored events for this node first.....
    var storedEventsNI = Object.values(store.state.nodes[props.nodeNumber].storedEventsNI)
    storedEventsNI.forEach(event => {
      var eventNodeNumber = parseInt(event.eventIdentifier.substr(0, 4), 16)
      var eventNumber = parseInt(event.eventIdentifier.substr(4, 4), 16)
      //
      // we use events_view_mode to decide which events we want to exclude from being displayed
      if (((store.state.events_view_mode == 'short') && (eventNodeNumber > 0)) ||
        ((store.state.events_view_mode == 'long') && (eventNodeNumber == 0)) ||
        ((store.state.events_view_mode == 'named') && (store.state.layout.eventDetails[event.eventIdentifier].name.length == ''))) {
        // don't add this node as we've elected to not display it
      } else {
        let output = {}
        output['eventIdentifier'] = event.eventIdentifier
        output['eventName'] = store.getters.event_name(event.eventIdentifier)
        output['eventGroup'] = store.getters.event_group(event.eventIdentifier)
        output['nodeNumber'] = eventNodeNumber
        output['eventNumber'] = eventNumber
        output['eventType'] = eventNodeNumber == 0 ? "short" : "long"
        output['storedEvent'] = true
        output['source'] = "stored event"
        rows.value.push(output)
      }
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
        storedEventsNI.forEach(event => {
          if(eventIdentifier == event.eventIdentifier){
            alreadyInList = true
          }
        })

        if (alreadyInList == false){
          let output = {}
          output['eventIdentifier'] = eventIdentifier
          output['eventName'] = store.getters.event_name(eventIdentifier)
          output['eventGroup'] = store.getters.event_group(eventIdentifier)
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
  } catch {}
}


onBeforeMount(() => {
  //timeStampedLog(name + ": onBeforeMount")
  getSettings()
  if (props.nodeNumber){
    update_rows()
  }
})

/*
onMounted(() => {
  timeStampedLog(name + ": onMounted")
})

onUpdated(() => {
  timeStampedLog(name + ": onUpdated")
})
*/

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



const getEventVariables = async (eventIdentifier) => {
  timeStampedLog(name + ': getEventVariables:')
  //
  WaitingOnBusTrafficDialogReturn.value =''
  WaitingOnBusTrafficMessage.value = "Loading Event Variables"
  showWaitingOnBusTrafficDialog.value = true
  store.methods.request_event_variables_by_identifier(props.nodeNumber, eventIdentifier)

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


//
//
const getSettings = () => {
  if (store.state.layout.settings == undefined){store.state.layout["settings"] = {"EventsByNodeView":{}}}
  if (store.state.layout.settings.EventsByNodeView == undefined){store.state.layout.settings["EventsByNodeView"] = {}}
  //
  if (store.state.layout.settings.EventsByNodeView.enableEventIdentifier == undefined){
    store.state.layout.settings.EventsByNodeView['enableEventIdentifier'] = true
    store.state.update_layout_needed = true
  }
  setVisibleColumn("events", store.state.layout.settings.EventsByNodeView.enableEventIdentifier)
}

//
//
const setVisibleColumn = (columnName, state) => {
  let index = visibleColumns.value.indexOf(columnName)
  if (state){
    if (index == -1){
      visibleColumns.value.push(columnName)
    }
  } else {
    if (index != -1){
      visibleColumns.value.splice(index)
    }
  }
}


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickAddEvent = () => {
  timeStampedLog(name + `: clickAddEvent`)
  if(store.state.nodes[props.nodeNumber].eventSpaceLeft > 0 ) {
    showAddEventDialog.value = true
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
}

//
//
const clickAdvanced = () => {
  timeStampedLog(name + `: clickAdvanced`)
  showAdvancedEventDialog.value = true
}

//
//
const clickDelete = (eventIdentifier) => {
  timeStampedLog(name + `: clickDelete`)
  const result = $q.notify({
    message: 'Are you sure you want to delete event ' + store.getters.event_name(eventIdentifier),
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => {
        timeStampedLog(`removeEvent ` + props.nodeNumber + ' ' + eventIdentifier)
        store.methods.remove_event(props.nodeNumber, eventIdentifier)
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

//
//
const click_enableEventIdentifier = () => {
  timeStampedLog(name + `: click_enableEventIdentifier ${store.state.layout.settings.EventsByNodeView.enableEventIdentifier}`)
  setVisibleColumn("eventIdentifier", store.state.layout.settings.EventsByNodeView.enableEventIdentifier)
  store.state.update_layout_needed = true
}



//
//
const clickEventName = (eventIdentifier) => {
  timeStampedLog(name + `: clickEventName ` + eventIdentifier)
  selected_event_Identifier.value = eventIdentifier
  newEventName.value = store.getters.event_name(eventIdentifier)
  showNameEventDialog.value = true;
}

//
//
const clickInfo = () => {
  timeStampedLog(name + `: clickInfo`)
  showEventsByNodeViewInfoDialog.value = true
}

//
//
const clickRefresh = () => {
  timeStampedLog(name + `: clickRefresh`)
  store.methods.request_all_node_events(props.nodeNumber)
update_rows()
}

//
//
const clickSendOff = (eventIdentifier) => {
  timeStampedLog (name + ": send OFF " + eventIdentifier)
  var eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
  var eventNumber = parseInt(eventIdentifier.slice(4,8), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_off_event(props.nodeNumber, eventNumber)
  } else {
    store.methods.long_off_event(eventNodeNumber, eventNumber)
  }
}

//
//
const clickSendOn = (eventIdentifier) => {
  timeStampedLog (name + ": send ON " + eventIdentifier)
  var eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
  var eventNumber = parseInt(eventIdentifier.slice(4,8), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_on_event(props.nodeNumber, eventNumber)
  } else {
    store.methods.long_on_event(eventNodeNumber, eventNumber)
  }
}

//
//
const clickSettings = () => {
  timeStampedLog(name + ': clickSettings')
  showSettingsDialog.value = true
}

//
//
const clickTeach = (eventIndentifier) => {
  timeStampedLog(name + `: clickTeach`)
  selected_event_Identifier.value = eventIndentifier
  showEventTeachDialog.value = true
}

//
//
const clickToggleViewMode = () => {
  timeStampedLog(name + `: clickToggleViewMode`)
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
  update_rows()
}

//
//
const clickVariables = async (eventIdentifier) => {
  timeStampedLog(name + `: clickVariables: node ${props.nodeNumber} event ${eventIdentifier}`)
  selected_event_Identifier.value = eventIdentifier
  if(store.state.nodes[props.nodeNumber].VLCB == false){
    await getEventIndexes()
  }
  await getEventVariables(eventIdentifier)
  showEventVariablesDialog.value = true
}

</script>

<style lang="sass">
.events-list-by-node-table
  /* height or max-height is important */
  height: 42vh

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
