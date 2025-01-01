<template>
  <div style="height: 45vh;">

    <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
      <div class="text-h6">
        Bus Events
      </div>
      <template v-slot:action>
        <q-btn class="q-mx-xs q-my-none" size="sm" color="blue" label="Toggle"  no-caps @click="clickToggleViewMode()" />
        <div class="text-h6" style="min-width: 250px">{{ viewModes[viewModeIndex] }}</div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-btn class="q-mx-xs q-my-none" size="sm" color="info" label="INFO"  no-caps @click="clickInfo()" />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-input class="input-box" bg-color="grey-3" style="width: 200px;" filled dense borderless debounce="300" v-model="filter" placeholder="Search">
          <q-icon size="sm" name="search"/>
        </q-input>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-btn class="q-mx-xs q-my-none" size="sm" color="blue" label="CLEAR BUS EVENTS" @click="clickClearAllBusEvents()" no-caps/>
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
          hide-bottom
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="eventName" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">{{ props.row.name }}</q-td>
              <q-td key="group" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">{{ props.row.group }}</q-td>
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
import { date, useQuasar, scroll } from 'quasar'
import sendEventDialog from "components/dialogs/SendEventDialog"
import nameEventDialog from "components/dialogs/NameEventDialog"
import eventTeachDialog from "components/dialogs/EventTeachDialog"
import BusEventsViewInfoDialog from "components/dialogs/BusEventsViewInfoDialog"

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
const viewModeIndex = ref(0)
const viewModes = ref({
  0:"view all bus events",
  1: "view short bus events only"
})



const columns = [
  {name: 'eventName', field: 'name', required: true, label: 'Event Name', align: 'left', sortable: true},
  {name: 'group', field: 'name', required: true, label: 'Group', align: 'left', sortable: true},
  {name: 'eventIdentifier', field: 'eventIdentifier', required: true, label: 'Event Identifier', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Source Node Number', align: 'left', sortable: true},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event Number', align: 'left', sortable: true},
  {name: 'type', field: 'type', required: true, label: 'Type', align: 'left', sortable: true},
  {name: 'status', field: 'status', required: true, label: 'Status', align: 'left', sortable: true},
  {name: 'count', field: 'count', required: true, label: 'Count', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]

const busEventList = computed(() => {
  //console.log(`Computed Events`)
  return Object.values(store.state.busEvents)
})

const eventDetails = computed(() => {
  return store.state.layout
})

watch(busEventList, () => {
  //console.log(`WATCH Events`)
  update_bus_events()
})

watch(eventDetails, () => {
  //console.log(`WATCH Details`)
  update_bus_events()
})

const update_bus_events = () => {
//  console.log(name + `:Update busEvents`)
  let displayEventListLocal = []
  try{
    let busEvents = store.state.busEvents
    // order keys
    if (busEvents){
      for (let key of Object.keys(busEvents).sort(function(a, b){return (busEvents[a].eventIdentifier < busEvents[b].eventIdentifier)? -1 : 1;})) {
        var eventNodeNumber = parseInt(busEvents[key].eventIdentifier.slice(0,4), 16)
        if ((viewModeIndex.value == 1) && (eventNodeNumber > 0)){
          // don't add this node as we've selected short events only
        } else {
          let output = {}
          output['eventIdentifier'] = busEvents[key].eventIdentifier
          output['nodeNumber'] = busEvents[key].nodeNumber
          output['eventNumber'] = busEvents[key].eventNumber
          output['status'] = busEvents[key].status
          output['type'] = busEvents[key].type
          output['count'] = busEvents[key].count
          output['name'] = store.getters.event_name(busEvents[key].eventIdentifier)
          output['colour'] = store.getters.event_colour(busEvents[key].eventIdentifier)
          output['group'] = store.getters.event_group(busEvents[key].eventIdentifier)
          displayEventListLocal.push(output)
        }
      }
    }
  } catch (err){
    console.log(name + `: update_bus_events ` + err)
  }
  displayEventList.value = displayEventListLocal
}

const event_colour = (eventIdentifier) => {
  return store.getters.event_colour(eventIdentifier)
}


onBeforeMount(() => {
//  store.methods.query_all_nodes()
  store.methods.refresh_bus_events()
  update_bus_events()
})

onMounted(() => {
  store.methods.refresh_bus_events()
  update_bus_events()
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickClearAllBusEvents = () => {
  console.log(name + `: clickClearAllBusEvents`)
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

const clickEventName = (eventIdentifier) => {
  console.log(name + `: clickEventName ` + eventIdentifier)
  selected_event_Identifier.value = eventIdentifier
  newEventName.value = store.getters.event_name(eventIdentifier)
  showNameEventDialog.value = true;
}

const clickInfo = () => {
  console.log(name + `: clickInfo`)
  showBusEventsViewInfoDialog.value = true
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

const clickToggleShowBusEventsJSON = () => {
  console.log(name + `: clickToggleShowBusEventsJSON`)
  if (showBusEventsJSON.value){
    showBusEventsJSON.value = false
  } else {
    showBusEventsJSON.value = true
  }
}

const clickToggleViewMode = () => {
  console.log(name + `: clickToggleViewMode`)
  viewModeIndex.value++
  if (viewModeIndex.value > 1){viewModeIndex.value = 0}
  update_bus_events()
}




</script>

<style lang="sass">
.bus-events-table
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

<style scoped>
:deep(.input-box .q-field__control),
:deep(.input-box .q-field__marginal) {
  height: 25px;
  font-size: 12px;
}
</style>