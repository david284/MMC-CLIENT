<template>
  <div>
    <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
      <div class="text-h6">
        Bus Events
      </div>
      <template v-slot:action>
        <q-btn class="q-mx-xs q-my-none" size="sm" color="blue" label="Toggle"  no-caps @click="clickToggleViewMode()" />
        <div class="text-h6" style="min-width: 250px">view {{ store.state.events_view_mode }} events</div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-btn class="q-mx-xs q-my-none" size="sm" color="info" label="INFO"  no-caps @click="clickInfo()" />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-input class="input-box" bg-color="grey-3" style="width: 200px;" filled dense borderless debounce="300" v-model="filter" placeholder="Search">
          <q-icon size="sm" name="search"/>
        </q-input>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-btn class="q-mx-xs q-my-none" size="sm" color="blue" label="CLEAR BUS EVENTS" @click="clickClearAllBusEvents()" no-caps/>
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

    <q-card>
      <q-card-section class="no-margin no-padding">

        <q-table
          class="bus-events-table"
          dense
          :rows=displayEventList
          :columns="columns"
          :filter="filter"
          row-key="eventIdentifier"
          virtual-scroll
          v-model:pagnation="pagnation"
          :rows-per-page-options="[0]"
          :virtual-scroll-sticky-size-start="0"
          :visible-columns="visibleColumns"
          hide-bottom
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="eventName" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">{{ props.row.name }}</q-td>
              <q-td key="eventGroup" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">{{ props.row.eventGroup }}</q-td>
              <q-td key="eventIdentifier" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">
                {{ props.row.eventIdentifier }}
              </q-td>
              <q-td key="nodeNumber" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">
                {{ props.row.nodeNumber }}
              </q-td>
              <q-td key="eventNumber" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">
                {{ props.row.eventNumber }}
              </q-td>
              <q-td key="type" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">{{ props.row.type }}</q-td>
              <q-td key="status" :props="props">
                <q-chip color="white" text-color="green" v-if="props.row.status=='on'">ON</q-chip>
                <q-chip color="white" text-color="red" v-else>OFF</q-chip>
              </q-td>
              <q-td key="count" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">{{ props.row.count }}</q-td>
              <q-td key="actions" :props="props">
                <q-btn dense class="q-mx-xs" outline  size="md" color="primary" label="Name" @click="clickEventName(props.row.eventIdentifier)" no-caps/>
                <q-btn dense class="q-mx-xs" outline  size="md" color="primary" label="Teach" @click="clickTeach(props.row.eventIdentifier)" no-caps/>
                <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOn(props.row.nodeNumber, props.row.eventIdentifier)" no-caps>send ON</q-btn>
                <q-btn dense class="q-mx-xs" outline size="md" color="positive" @click="clickSendOff(props.row.nodeNumber, props.row.eventIdentifier)" no-caps>send OFF</q-btn>
              </q-td>
            </q-tr>

          </template>
        </q-table>


        <q-card-section class="q-pa-sm" v-if="showBusEventsJSON">
          <div class="q-pa-xs row">
            <div class="text-body1">Bus events<br></div>
            <div class="text-body2">
              <pre>{{ store.state.busEvents }}</pre>
            </div>
          </div>
        </q-card-section>

      </q-card-section>
    </q-card>

    <q-card-actions align="right" class="text-primary">
      <q-btn flat label="Toggle bus events json" @click="clickToggleShowBusEventsJSON()"/>
    </q-card-actions>

  </div>

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

  <BusEventsViewInfoDialog v-model='showBusEventsViewInfoDialog'/>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { useQuasar } from 'quasar'
import sendEventDialog from "components/dialogs/SendEventDialog"
import nameEventDialog from "components/dialogs/NameEventDialog"
import eventTeachDialog from "components/dialogs/EventTeachDialog"
import BusEventsViewInfoDialog from "components/dialogs/BusEventsViewInfoDialog"
import * as utils from "components/functions/utils.js"

const $q = useQuasar()
const store = inject('store')
const name = "BusEventsView"
const tab = ref('nodes')
const filter = ref('')
const pagnation = {rowsPerPage: 0}
let displayEventList = ref()
const showNameEventDialog = ref(false)
const showSendEventDialog = ref(false)
const showEventTeachDialog = ref(false)
const showBusEventsViewInfoDialog = ref(false)
const selected_event_Identifier = ref("") // Dialog will complain if null
const newEventName = ref()
const selected_event_node = ref(0) // Dialog will complain if null
const selected_event_number = ref(0) // Dialog will complain if null
const showBusEventsJSON = ref(false)
const visibleColumns = ref([])

const columns = [
  {name: 'eventName', field: 'name', required: true, label: 'Event Name', align: 'left', sortable: true},
  {name: 'eventGroup', field: 'eventGroup', label: 'Group', align: 'left', sortable: true},
  {name: 'eventIdentifier', field: 'eventIdentifier', label: 'Event Identifier', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Source Node Number', align: 'left', sortable: true},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event Number', align: 'left', sortable: true},
  {name: 'type', field: 'type', required: true, label: 'Type', align: 'left', sortable: true},
  {name: 'status', field: 'status', required: true, label: 'Status', align: 'left', sortable: true},
  {name: 'count', field: 'count', required: true, label: 'Count', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]

//
//
const busEventList = computed(() => {
  //utils.timeStampedLog(`Computed Events`)
  return Object.values(store.state.busEvents)
})

//
//
const eventDetails = computed(() => {
  return store.state.layout
})

//
//
watch(busEventList, () => {
  //utils.timeStampedLog(`WATCH Events`)
  update_bus_events()
})

//
//
watch(eventDetails, () => {
  //utils.timeStampedLog(`WATCH Details`)
  update_bus_events()
})

//
//
const update_bus_events = () => {
//  utils.timeStampedLog(name + `:Update busEvents`)
  let displayEventListLocal = []
  try{
    let busEvents = store.state.busEvents
    // order keys
    if (busEvents){
      for (let key of Object.keys(busEvents).sort(function(a, b){return (busEvents[a].eventIdentifier < busEvents[b].eventIdentifier)? -1 : 1;})) {
        var eventIdentifier = busEvents[key].eventIdentifier
        var eventNodeNumber = parseInt(busEvents[key].eventIdentifier.slice(0,4), 16)
        //
        // we use events_view_mode to decide which events we want to exclude from being displayed
        if (((store.state.events_view_mode == 'short') && (eventNodeNumber > 0)) ||
          ((store.state.events_view_mode == 'long') && (eventNodeNumber == 0)) ||
          ((store.state.events_view_mode == 'named') && (store.state.layout.eventDetails[eventIdentifier].name.length == ''))) {
          // don't add this node as we've elected to not display it
        } else {
          let output = {}
          output['eventIdentifier'] = eventIdentifier
          output['nodeNumber'] = busEvents[key].nodeNumber
          output['eventNumber'] = busEvents[key].eventNumber
          output['status'] = busEvents[key].status
          output['type'] = busEvents[key].type
          output['count'] = busEvents[key].count
          output['name'] = store.getters.event_name(eventIdentifier)
          output['colour'] = store.getters.event_colour(eventIdentifier)
          output['eventGroup'] = store.getters.event_group(eventIdentifier)
          displayEventListLocal.push(output)
        }
      }
    }
  } catch (err){
    utils.timeStampedLog(name + `: update_bus_events ` + err)
  }
  displayEventList.value = displayEventListLocal
}

//
//
const event_colour = (eventIdentifier) => {
  return store.getters.event_colour(eventIdentifier)
}

//
//
onBeforeMount(() => {
//  store.methods.query_all_nodes()
  store.methods.refresh_bus_events()
  update_bus_events()
  getSettings()
})

//
//
onMounted(() => {
  store.methods.refresh_bus_events()
  update_bus_events()
})

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

//
//
const clickClearAllBusEvents = () => {
  utils.timeStampedLog(name + `: clickClearAllBusEvents`)
  const result = $q.notify({
    message: 'Are you sure you want to clear all bus events?',
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => {
          store.methods.clear_bus_events()
        }
      },
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

//
//
const clickInfo = () => {
  utils.timeStampedLog(name + `: clickInfo`)
  showBusEventsViewInfoDialog.value = true
}

//
//
const clickSendOff = (nodeNumber, eventIdentifier) => {
  utils.timeStampedLog (name + ": send OFF " + nodeNumber + ' ' + eventIdentifier)
  var eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
  var eventNumber = parseInt(eventIdentifier.slice(4,8), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_off_event(nodeNumber, eventNumber)
  } else {
    store.methods.long_off_event(eventNodeNumber, eventNumber)
  }
}

//
//
const clickSendOn = (nodeNumber, eventIdentifier) => {
  utils.timeStampedLog (name + ": send ON " + nodeNumber + ' ' + eventIdentifier)
  var eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
  var eventNumber = parseInt(eventIdentifier.slice(4,8), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_on_event(nodeNumber, eventNumber)
  } else {
    store.methods.long_on_event(eventNodeNumber, eventNumber)
  }
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
const clickToggleShowBusEventsJSON = () => {
  utils.timeStampedLog(name + `: clickToggleShowBusEventsJSON`)
  if (showBusEventsJSON.value){
    showBusEventsJSON.value = false
  } else {
    showBusEventsJSON.value = true
  }
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
  update_bus_events()
}


</script>

<style lang="sass">
.bus-events-table
  /* height or max-height is important */
  max-height: 83vh

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
