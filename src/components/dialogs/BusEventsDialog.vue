<template>
  <q-dialog v-model='model' persistent  full-width>
    <q-card class="q-pa-none q-ma-none">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Bus Events Dialog
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card>
        <q-card-section class="no-margin no-padding">

          <q-table
          title="Bus Events"
          class="bus-events-table"
          dense
          :rows=displayEventList
          :columns="columns"
          :filter="filter"
          row-key="eventIdentifier"
          virtual-scroll
          v-model:pagnation="pagnation"
          :rows-per-page-options="[0]"
          :virtual-scroll-sticky-size-start="48"
          hide-bottom
        >

          <template v-slot:top="">
            <div class="col-2 q-table__title text-h4">Bus Events</div>
            <q-space/>
            <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
            <q-space/>
            <q-btn color="negative" label="Refresh Events" @click="store.methods.refresh_bus_events()" no-caps/>
            <q-space/>
            <q-btn color="negative" label="Clear Events" @click="store.methods.clear_bus_events()" no-caps/>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="eventName" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">{{ props.row.name }}</q-td>
              <!-- <q-td key="group" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">{{ props.row.group }}</q-td> -->
              <q-td key="eventIdentifier" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">
                {{ props.row.eventIdentifier }}
              </q-td>
              <q-td key="nodeNumber" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">
                {{ props.row.nodeNumber }}
              </q-td>
              <q-td key="eventNumber" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">
                {{ props.row.eventNumber }}
              </q-td>
              <q-td key="status" :props="props">
                <q-chip color="white" text-color="green" v-if="props.row.status=='on'">ON</q-chip>
                <q-chip color="white" text-color="red" v-else>OFF</q-chip>
              </q-td>
              <q-td key="type" :props="props" :class="'text-'+event_colour(props.row.eventIdentifier)">{{ props.row.type }}</q-td>
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

    </q-card>

  </q-dialog>

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

</template>


<script setup>

/************************************************************************************
      usage
      <BusEventsDialog v-model='showBusEventsDialog' />
      
************************************************************************************ */ 


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import EventDetails from "components/modules/common/EventDetails.vue"
import sendEventDialog from "components/dialogs/SendEventDialog"
import nameEventDialog from "components/dialogs/NameEventDialog"
import eventTeachDialog from "components/dialogs/EventTeachDialog"

const store = inject('store')
const name = "BusEventsDialog"
const tab = ref('nodes')
const filter = ref('')
const pagnation = {rowsPerPage: 0}
let displayEventList = ref()
const showNameEventDialog = ref(false)
const showSendEventDialog = ref(false)
const showEventTeachDialog = ref(false)
const selected_event_Identifier = ref("") // Dialog will complain if null
const newEventName = ref()
const selected_event_node = ref(0) // Dialog will complain if null
const selected_event_number = ref(0) // Dialog will complain if null
const showBusEventsJSON = ref(false)

const columns = [
  {name: 'eventName', field: 'name', required: true, label: 'Event Name', align: 'left', sortable: false},
//  {name: 'group', field: 'name', required: true, label: 'Group', align: 'left', sortable: false},
  {name: 'eventIdentifier', field: 'eventIdentifier', required: true, label: 'Event Identifier', align: 'left', sortable: false},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node Number', align: 'left', sortable: false},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event Number', align: 'left', sortable: false},
  {name: 'status', field: 'status', required: true, label: 'Status', align: 'left', sortable: false},
  {name: 'type', field: 'type', required: true, label: 'Type', align: 'left', sortable: false},
  {name: 'count', field: 'count', required: true, label: 'Count', align: 'left', sortable: false},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]

const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
  console.log(name + `: WATCH model`)
})


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
  console.log(name + `:Update busEvents`)
  let displayEventListLocal = []
  let busEvents = store.state.busEvents
  // order keys
  for (let key of Object.keys(busEvents).sort()) {
    let output = {}
    output['eventIdentifier'] = busEvents[key].eventIdentifier
    output['nodeNumber'] = busEvents[key].nodeNumber
    output['eventNumber'] = busEvents[key].eventNumber
    output['status'] = busEvents[key].status
    output['type'] = busEvents[key].type
    output['count'] = busEvents[key].count
    output['name'] = event_name(busEvents[key].eventIdentifier)
    output['colour'] = event_colour(busEvents[key].eventIdentifier)
    output['group'] = event_group(busEvents[key].eventIdentifier)
    displayEventListLocal.push(output)
  }
  displayEventList.value = displayEventListLocal
}

const event_name = (eventIdentifier) => {
  if (eventIdentifier in store.state.layout.eventDetails) {
    //console.log(`Event Name`)
    return store.state.layout.eventDetails[eventIdentifier].name
  } else {
    //console.log(`Event No Name ${JSON.stringify(eventIdentifier)}`)
    return JSON.stringify(eventIdentifier)
  }
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

const event_group = (eventIdentifier) => {
  if (eventIdentifier in store.state.layout.eventDetails) {
    //console.log(`Event Colour`)
    return store.state.layout.eventDetails[eventIdentifier].group
  } else {
    //console.log(`Event No Colour ${JSON.stringify(eventIdentifier)}`)
    return ""
  }
}







onBeforeMount(() => {
  store.methods.query_all_nodes()
})

onMounted(() => {
  store.methods.refresh_bus_events()
  /*
  for (var node in store.state.nodes){
    // refresh event list
    console.log(name + `: request Events for node ` + node)
    store.methods.request_all_node_events(node)
  }
  */
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickEventName = (eventIdentifier) => {
  console.log(name + `: clickEventName ` + eventIdentifier)
  selected_event_Identifier.value = eventIdentifier
  newEventName.value = store.getters.event_name(eventIdentifier)
  showNameEventDialog.value = true;
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
