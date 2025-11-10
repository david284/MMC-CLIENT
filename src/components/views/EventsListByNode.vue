<template>
  <div style="height: 35vh;">
    <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
      <div class="text-h6" v-if="(eventMode=='Event')">
        Events for node :  {{ store.getters.node_name(props.nodeNumber) }}
      </div>
      <div class="text-h6" v-if="(eventMode=='Index')">
        Slots for node :  {{ store.getters.node_name(props.nodeNumber) }}
      </div>
      <template v-slot:action>
        <q-btn class="q-mx-xs q-my-none" v-if="store.getters.node_descriptor_useSwitchTeach1(props.nodeNumber)"
         size="sm" color="blue" label="Switch Teach" no-caps @click="clickSwitchTeach1()">
        </q-btn>
        <q-btn class="q-mx-xs q-my-none" v-if="store.state.develop" size="sm" color="black" no-caps
          @click="clickToggleEventMode()">
          {{eventMode}}
        </q-btn>
        <q-btn class="q-mx-xs  q-my-none" size="sm" color="blue" label="Toggle"  no-caps
          @click="clickToggleViewMode()" />
        <div class="text-h6" style="min-width: 200px">view {{ store.state.events_view_mode }} events</div>
        <q-btn class="q-mx-xs q-my-none" size="sm" color="info" label="INFO"  no-caps
            @click="clickInfo()" />

        &nbsp;&nbsp;
        <q-input class="input-box" bg-color="grey-3" style="width: 200px;" filled dense borderless debounce="300" v-model="filter" placeholder="Search">
            <q-icon size="sm" name="search"/>
        </q-input>
        &nbsp;&nbsp;
        <q-btn v-if="(eventMode=='Event')" class="q-mx-xs q-my-none" color="blue" size="sm" label="Add Event" @click="clickAddEvent()"/>
        <q-btn v-if="enableActivateSlot" class="q-mx-xs q-my-none" color="blue" size="sm" label="Activate Slot" @click="clickActivateSlot()"/>
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Advanced" @click="clickAdvanced()"/>
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Refresh" @click="clickRefresh()"/>
        <q-btn square unelevated color="primary" icon="settings">
          <q-menu auto-close>
            <q-list style="min-width: 100px">
              <q-item>
                <q-checkbox class="no-margin no-padding" v-model="store.state.layout.settings.enableEventIdentifier" @click="click_enableEventIdentifier" label="show Event Identifier column"></q-checkbox>
              </q-item>
              <q-item>
                <q-checkbox class="no-margin no-padding" v-model="store.state.layout.settings.EventsByNodeView.enableEventIndex" @click="click_enableEventIndex" label="show Event Index column"></q-checkbox>
              </q-item>
              <q-item>
                <q-checkbox class="no-margin no-padding" v-model="store.state.layout.settings.enableEventGroup" @click="click_enableEventGroup" label="show Group column"></q-checkbox>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>
    </q-banner>

    <div class="full-width">

    <q-table
      v-if="(eventMode=='Index')"
      class="events-list-by-node-table"
      bordered
      dense
      :rows=rows
      :columns="slot_columns"
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
          <q-td key="eventIndex" :props="props">{{ props.row.eventIndex }}</q-td>
          <q-td key="eventIdentifier" :props="props">{{ props.row.eventIdentifier }}</q-td>
          <q-td key="eventName" :props="props">{{ props.row.eventName}}</q-td>
          <q-td key="eventGroup" :props="props">{{ props.row.eventGroup }}</q-td>
          <q-td key="nodeNumber" :props="props">{{ props.row.nodeNumber }}</q-td>
          <q-td key="eventNumber" :props="props">{{ props.row.eventNumber }}</q-td>
          <q-td key="eventType" :props="props">{{ props.row.eventType }}</q-td>
          <q-td key="source" :props="props">{{ props.row.source }}</q-td>
          <q-td key="actions" :props="props">
            <q-btn dense class="q-mx-xs" outline size="md" color="primary" label="Event" @click="clickEvent(props.row.eventIndex)" no-caps/>
            <q-btn dense class="q-mx-xs" outline size="md" color="primary" label="Name" @click="clickEventName(props.row.eventIdentifier)" no-caps/>
            <q-btn dense class="q-mx-xs" outline color="primary" size="md" label="Variables"
              v-if="props.row.editVariables"
              @click="clickVariables(props.row.eventIdentifier, props.row.eventIndex)" no-caps/>
            <q-btn dense class="q-mx-xs" outline size="md" color="primary" label="Teach" @click="clickTeach(props.row.eventIdentifier)" no-caps/>
            <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOn(props.row.eventIdentifier)" no-caps>send ON</q-btn>
            <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOff(props.row.eventIdentifier)" no-caps>send OFF</q-btn>
            <q-btn dense class="q-mx-xs" outline size="md" color="negative" label="Delete" @click="clickDelete(props.row.eventIdentifier, props.row.eventIndex)" no-caps/>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-table
      v-if="(eventMode=='Event')"
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
          <q-td key="eventIndex" :props="props">{{ props.row.eventIndex }}</q-td>
          <q-td key="eventType" :props="props">{{ props.row.eventType }}</q-td>
          <q-td key="source" :props="props">{{ props.row.source }}</q-td>
          <q-td key="actions" :props="props">
            <q-btn dense class="q-mx-xs" outline size="md" color="primary" label="Name" @click="clickEventName(props.row.eventIdentifier)" no-caps/>
            <q-btn dense class="q-mx-xs" outline color="primary" size="md" label="Variables"
              v-if="props.row.editVariables"
              @click="clickVariables(props.row.eventIdentifier, props.row.eventIndex)" no-caps/>
            <q-btn dense class="q-mx-xs" outline size="md" color="primary" label="Teach" @click="clickTeach(props.row.eventIdentifier)" no-caps/>
            <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOn(props.row.eventIdentifier)" no-caps>send ON</q-btn>
            <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOff(props.row.eventIdentifier)" no-caps>send OFF</q-btn>
            <q-btn dense class="q-mx-xs" outline size="md" color="negative" label="Delete" @click="clickDelete(props.row.eventIdentifier, props.row.eventIndex)" no-caps/>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    </div>

    <q-dialog v-model="showSwitchTeach1Dialog" persistent>
      <q-card style="min-width: 350px">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">Switch Teach</div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" @click="clickSwitchTeach1Close(props.nodeNumber)" v-close-popup/>
          </template>
        </q-banner>
        <q-card-section>
          <div class="text-h6">Operate the switch to be taught</div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <ActivateSlotDialog v-model='showActivateSlotDialog'
      :nodeNumber = nodeNumber
    />

    <AddEventDialog v-model='showAddEventDialog'
      :nodeNumber = nodeNumber
    />

    <advancedEventsDialog v-model='showAdvancedEventDialog'
      :nodeNumber = nodeNumber
    />

    <nameEventDialog v-model='showNameEventDialog'
      :eventIdentifier = selected_event_Identifier
    />

    <EventIdentityDialog v-model="showEventIdentityDialog"
      :nodeNumber=nodeNumber
      :eventIndex=selected_event_index
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
        :eventIndex = selected_event_index
      />

      <EventsByNodeViewInfoDialog v-model='showEventsByNodeViewInfoDialog'/>

      <WaitingOnBusTrafficDialog v-model='showWaitingOnBusTrafficDialog'
        callingModule = "EventsListByNode"
        :message = WaitingOnBusTrafficMessage
        @WaitingOnBusTrafficDialogEvent="WaitingOnBusTrafficDialogReturn = $event"
      />

  </div>
</template>

<script setup>

import {computed, inject, ref, watch, onBeforeMount, onMounted, onUpdated} from "vue"
import { date, useQuasar, scroll } from 'quasar'
import * as utils from "components/functions/utils.js"
import * as eventFunctions from "components/functions/EventFunctions.js"
import cbusLib from "cbuslibrary"
import ActivateSlotDialog from "components/dialogs/ActivateSlotDialog"
import AddEventDialog from "components/dialogs/AddEventDialog"
import advancedEventsDialog from "components/dialogs/AdvancedEventsDialog"
import EventIdentityDialog from "components/dialogs/EventIdentityDialog"
import EventsByNodeViewInfoDialog from "components/dialogs/EventsByNodeViewInfoDialog"
import eventTeachDialog from "components/dialogs/EventTeachDialog"
import eventVariablesDialog from "components/dialogs/EventVariablesDialog"
import nameEventDialog from "components/dialogs/NameEventDialog"
import sendEventDialog from "components/dialogs/SendEventDialog"
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog"


const $q = useQuasar()
const store = inject('store')
const name = "EventsListByNode"
const rows = ref([])
const filter = ref('')
const showActivateSlotDialog = ref(false)
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
const selected_event_index = ref()
const selected_event_node = ref(0) // Dialog will complain if null
const selected_event_number = ref(0) // Dialog will complain if null
const WaitingOnBusTrafficDialogReturn = ref('')
const WaitingOnBusTrafficMessage = ref('')
const eventMode = ref('Event')
const enableActivateSlot = ref(false)
const showEventIdentityDialog = ref(false)
const showSwitchTeach1Dialog = ref(false)


const props = defineProps({
  nodeNumber: {type: Number, required: true }
})

const visibleColumns = ref([])

const columns = [
  {name: 'eventIdentifier', field: 'eventIdentifier', label: 'Identifier', align: 'left', sortable: true},
  {name: 'eventName', field: 'eventName', required: true, label: 'Name', align: 'left', sortable: true},
  {name: 'eventGroup', field: 'eventGroup', label: 'Group', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Event node', align: 'left', sortable: true},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event number', align: 'left', sortable: true},
  {name: 'eventIndex', field: 'eventIndex', label: 'Index', align: 'left', sortable: true},
  {name: 'eventType', field: 'eventType', required: true, label: 'Type', align: 'left', sortable: true},
  {name: 'source', field: 'source', required: true, label: 'Source', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: true}
]

const slot_columns = [
  {name: 'eventIndex', field: 'eventIndex', label: 'Slot', align: 'left', sortable: true},
  {name: 'eventIdentifier', field: 'eventIdentifier', label: 'Identifier', align: 'left', sortable: true},
  {name: 'eventName', field: 'eventName', required: true, label: 'Name', align: 'left', sortable: true},
  {name: 'eventGroup', field: 'eventGroup', label: 'Group', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Event node', align: 'left', sortable: true},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event number', align: 'left', sortable: true},
  {name: 'eventType', field: 'eventType', required: true, label: 'Type', align: 'left', sortable: true},
  {name: 'source', field: 'source', required: true, label: 'Source', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: true}
]

//
// need to know if selected node changed
const selected_node = computed(() =>{
  return props.nodeNumber
})

//
//
watch(selected_node, () => {
  //utils.timeStampedLog(name + `: WATCH selected_node ${props.nodeNumber}`)
  if (props.nodeNumber){
    update_rows()
  }
})


//
// need to know if new bus events received
const busEvents = computed(() =>{
  return Object.values(store.state.busEvents)
})
watch(busEvents, () => {
  //utils.timeStampedLog(name + `: WATCH busEvents`)
  if (props.nodeNumber){
    update_rows()
  }
})


// watch if anything in the layout changes
const layoutUpdated = computed(() => {
  return store.state.layout.updateTimestamp
})

watch(layoutUpdated, () => {
  //utils.timeStampedLog(name + `: WATCH: layoutUpdated`)
  if (props.nodeNumber){
    update_rows()
  }
})


// watch if any nodes change
const nodesUpdated = computed(() => {
  return store.state.nodes.updateTimestamp
})

watch(nodesUpdated, () => {
  //utils.timeStampedLog(name + `: WATCH: nodesUpdated ` + nodesUpdated.value)
  if (props.nodeNumber){
    if (store.getters.node_descriptor_useEventIndex(props.nodeNumber) == true){
      eventMode.value = "Index"
    } else {
      eventMode.value = "Event"
    }
    update_rows()
    // logical AND
    if((store.state.nodes[props.nodeNumber].VLCB) && (eventMode.value == "Index")){
      enableActivateSlot.value = true
    } else {
      enableActivateSlot.value = false
    }

  }
})


const update_rows = () => {
  utils.timeStampedLog(name + `: update_rows: node ${props.nodeNumber} `)
  rows.value = []
  try{
    if (eventMode.value == "Event"){
      utils.timeStampedLog(name + `: update_rows: node ${props.nodeNumber} `)
      // do stored events for this node first.....
      var storedEventsNI = Object.values(store.state.nodes[props.nodeNumber].storedEventsNI)
      storedEventsNI.forEach(event => {
        var eventNodeNumber = parseInt(event.eventIdentifier.substr(0, 4), 16)
        var eventNumber = parseInt(event.eventIdentifier.substr(4, 4), 16)
        //
        let output = {}
        output['eventIdentifier'] = event.eventIdentifier
        output['eventName'] = store.getters.event_name(event.eventIdentifier)
        output['eventGroup'] = store.getters.event_group(event.eventIdentifier)
        output['nodeNumber'] = eventNodeNumber
        output['eventIndex'] = event.eventIndex
        output['eventNumber'] = eventNumber
        output['eventType'] = eventNodeNumber == 0 ? "short" : "long"
        output['editVariables'] = (store.state.nodes[props.nodeNumber].parameters[5] > 0) ? true : false
        output['source'] = "stored event"
        if (isEventVisible(event.eventIdentifier)){
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
            output['editVariables'] = (store.state.nodes[props.nodeNumber].parameters[5] > 0) ? true : false
            output['source'] = "bus event"
            if (isEventVisible(event.eventIdentifier)){
              rows.value.push(output)
            }
          }
        }
      })
      // sort rows by eventIdentifier, not eventIndex
      rows.value.sort(function(a, b){return (a.eventIdentifier < b.eventIdentifier)? -1 : 1;});
    } else {
      update_rows_indexed()
    }
  } catch (err) {
    utils.timeStampedLog(name + `: update_rows: ${err} `)
  }
}


const update_rows_indexed = () => {
  try{
    utils.timeStampedLog(name + `: update_rows_indexed: node ${props.nodeNumber} `)
    //
    // first add all reported events to list
    var eventsByIndex = Object.values(store.state.nodes[props.nodeNumber].eventsByIndex)
    eventsByIndex.forEach(event => {
      var eventNodeNumber = parseInt(event.eventIdentifier.substr(0, 4), 16)
      var eventNumber = parseInt(event.eventIdentifier.substr(4, 4), 16)
      // don't add if event index 0
      if (event.eventIndex > 0){
        // don't add if no eventIdentifier - inactive
        if (event.eventIdentifier != "00000000"){
            let output = {}
          output['eventIdentifier'] = event.eventIdentifier
          output['eventName'] = store.getters.event_name(event.eventIdentifier)
          output['eventGroup'] = store.getters.event_group(event.eventIdentifier)
          output['nodeNumber'] = eventNodeNumber
          output['eventIndex'] = event.eventIndex
          output['eventNumber'] = eventNumber
          output['eventType'] = eventNodeNumber == 0 ? "short" : "long"
          output['editVariables'] = (store.state.nodes[props.nodeNumber].parameters[5] > 0) ? true : false
          output['source'] = "stored event"
          if (isEventVisible(event.eventIdentifier)){
            rows.value.push(output)
          }
        }
      }
    })
    //
    // now add any 'indexed events' if they aren't already in the list
    if (store.state.layout.nodeDetails[props.nodeNumber].indexedEvents != undefined){
      var LayoutNodeEvents = Object.values(store.state.layout.nodeDetails[props.nodeNumber].indexedEvents)
      LayoutNodeEvents.forEach(event => {
          // ok, now check if it already exists
        let alreadyInList = false
        rows.value.forEach(rowEvent => {
          if (rowEvent.eventIndex == event.eventIndex ){
            alreadyInList = true
          }
        })
        // so, if it's not already in the list, then add it
        if (alreadyInList == false){
          var eventNodeNumber = parseInt(event.eventIdentifier.substr(0, 4), 16)
          var eventNumber = parseInt(event.eventIdentifier.substr(4, 4), 16)
          let output = {}
          output['eventIdentifier'] = event.eventIdentifier
          output['eventName'] = store.getters.event_name(event.eventIdentifier)
          output['eventGroup'] = store.getters.event_group(event.eventIdentifier)
          output['nodeNumber'] = eventNodeNumber
          output['eventIndex'] = event.eventIndex
          output['eventNumber'] = eventNumber
          output['eventType'] = eventNodeNumber == 0 ? "short" : "long"
          output['editVariables'] = (store.state.nodes[props.nodeNumber].parameters[5] > 0) ? true : false
          output['source'] = "saved index"
          if (isEventVisible(event.eventIdentifier)){
            rows.value.push(output)
          }
        }
      })
    }
    //
    // finally, sort rows by eventIndex
    rows.value.sort(function(a, b){return (a.eventIndex < b.eventIndex)? -1 : 1;});
  } catch(err){
    utils.timeStampedLog(name + `: update_rows_indexed: ${err} `)
  }
}

//
//
const isEventVisible = (eventIdentifier) => {
  // extract eventNodeNumber from eventIdentifier
  var eventNodeNumber = parseInt(eventIdentifier.substr(0, 4), 16)
  // we use events_view_mode to decide which events we want to exclude from being displayed
  if (((store.state.events_view_mode == 'short') && (eventNodeNumber > 0)) ||
    ((store.state.events_view_mode == 'long') && (eventNodeNumber == 0)) ||
    ((store.state.events_view_mode == 'named') && (store.state.layout.eventDetails[eventIdentifier].name.length == ''))) {
      return false
    } else {
      return true
    }
}


onBeforeMount(() => {
  utils.timeStampedLog(name + ": onBeforeMount")
  getSettings()
  if (props.nodeNumber){
    update_rows()
  }
})


onMounted(() => {
  utils.timeStampedLog(name + ": onMounted")
})

onUpdated(() => {
  utils.timeStampedLog(name + ": onUpdated")
})


const getEventVariables = async (eventIdentifier, eventIndex) => {
  utils.timeStampedLog(name + `: getEventVariables: ${eventIdentifier} ${eventIndex}`)
  //
  WaitingOnBusTrafficDialogReturn.value =''
  WaitingOnBusTrafficMessage.value = "Loading Event Variables"
  showWaitingOnBusTrafficDialog.value = true
  if (eventMode.value == "Index"){
    store.methods.request_event_variables_by_index(props.nodeNumber, eventIndex)
  } else {
    store.methods.request_event_variables_by_identifier(props.nodeNumber, eventIdentifier)
  }

  // allow up to 1 minutes to finish loading
  let startTime = Date.now()
  while ((Date.now() - startTime) < 60000){
  if (WaitingOnBusTrafficDialogReturn.value.length > 0)
    {
      // success if we exit early
      break
    }
    await utils.sleep (10)
  }
  showWaitingOnBusTrafficDialog.value = false
}

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
//  utils.timeStampedLog(name + ': LAYOUT_DATA')
  getSettings()
})

store.eventBus.on('BUS_TRAFFIC_EVENT', (data) => {
  //utils.timeStampedLog(name + ': BUS_TRAFFIC_EVENT : opcode ' + data.json.opCode)
  if (showSwitchTeach1Dialog.value){
    var opCode = data.json.opCode
    // check for ACON1 or ACOF1 event
    if ((opCode == 'B0')
      || (opCode == 'B1')
      )
    {
      selected_event_index.value = data.json.data1
      utils.timeStampedLog(name + `: BUS_TRAFFIC_EVENT : ACON1/ACOF1 event - switch ${selected_event_index.value}`)
      showEventIdentityDialog.value = true
    }
  }
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickActivateSlot = () => {
  utils.timeStampedLog(name + `: clickActivateSlot`)
  showActivateSlotDialog.value = true
}

//
//
const clickAddEvent = () => {
  utils.timeStampedLog(name + `: clickAddEvent`)
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
  utils.timeStampedLog(name + `: clickAdvanced`)
  showAdvancedEventDialog.value = true
}

//
//
const clickDelete = async (eventIdentifier, eventIndex) => {
  utils.timeStampedLog(name + `: clickDelete ${eventIdentifier} ${eventIndex}`)
  const result = $q.notify({
    message: 'Are you sure you want to delete event ' + store.getters.event_name(eventIdentifier),
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => {
        utils.timeStampedLog(`removeEvent ` + props.nodeNumber + ' ' + eventIdentifier)
        await eventFunctions.eventDelete(store, props.nodeNumber, eventIdentifier, eventIndex)
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
const click_enableEventIndex = () => {
  utils.timeStampedLog(name + `: click_enableEventIndex ${store.state.layout.settings.EventsByNodeView.enableEventIndex}`)
  utils.setVisibleColumn(visibleColumns.value, "eventIndex", store.state.layout.settings.EventsByNodeView.enableEventIndex)
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
const clickEvent = (eventIndex) => {
  utils.timeStampedLog(name + `: clickEvent: eventIndex ${eventIndex}`)
  selected_event_index.value = eventIndex
  showEventIdentityDialog.value = true
}


//
//
const clickEventName = (eventIdentifier) => {
  utils.timeStampedLog(name + `: clickEventName ` + eventIdentifier)
  selected_event_Identifier.value = eventIdentifier
  newEventName.value = store.getters.event_name(eventIdentifier)
  showNameEventDialog.value = true;
}

//
//
const clickInfo = () => {
  utils.timeStampedLog(name + `: clickInfo`)
  showEventsByNodeViewInfoDialog.value = true
}

//
//
const clickRefresh = () => {
  utils.timeStampedLog(name + `: clickRefresh`)
  if (eventMode.value == "Index"){
    eventFunctions.requestAllEventsByIndex(store, props.nodeNumber)
  } else {
    store.methods.request_all_node_events(props.nodeNumber)
  }
  update_rows()
}

//
//
const clickSendOff = (eventIdentifier) => {
  utils.timeStampedLog (name + ": send OFF " + eventIdentifier)
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
  utils.timeStampedLog (name + ": send ON " + eventIdentifier)
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
const clickSwitchTeach1 = (nodeNumber) => {
  utils.timeStampedLog (name + `: clickSwitchTeach1 ${nodeNumber}`)
  let commandString = cbusLib.encodeNNLRN(props.nodeNumber)
  // put into learn mode
  store.methods.send_cbus_message(commandString)
  showSwitchTeach1Dialog.value = true
}

//
//
const clickSwitchTeach1Close = (nodeNumber) => {
  utils.timeStampedLog (name + `: clickSwitchTeach1Close ${nodeNumber}`)
  // take out of learn mode
  let commandString = cbusLib.encodeNNULN(props.nodeNumber)
  store.methods.send_cbus_message(commandString)
}

//
//
const clickTeach = (eventIndentifier) => {
  utils.timeStampedLog(name + `: clickTeach`)
  selected_event_Identifier.value = eventIndentifier
  showEventTeachDialog.value = true
}


//
//
const clickToggleEventMode = () => {
  utils.timeStampedLog(name + `: clickToggleEventMode`)
  eventMode.value = (eventMode.value == 'Event') ? 'Index' : 'Event'
  update_rows()
}

//
//
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
  update_rows()
}

//
//
const clickVariables = async (eventIdentifier, eventIndex) => {
  utils.timeStampedLog(name + `: clickVariables: node ${props.nodeNumber} event ${eventIdentifier}`)
  selected_event_Identifier.value = eventIdentifier
  selected_event_index.value = eventIndex
  await getEventVariables(eventIdentifier, eventIndex)
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
