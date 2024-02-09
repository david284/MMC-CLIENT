<template>

  <q-dialog v-model='model' persistent  full-width full-height>
    <q-card>

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
      <div class="text-h6">
        Bus Events Dialog
      </div>
      <template v-slot:action>
        <q-btn flat color="white" size="md" label="Close" v-close-popup/>
      </template>
    </q-banner>

    <q-table
      title="Events"
      :rows=displayEventList
      :columns="columns"
      :filter="filter"
      row-key="id"
      virtual-scroll
      v-model:pagnation="pagnation"
      :rows-per-page-options="[0]"
      :virtual-scroll-sticky-size-start="48"
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
          <q-td key="expand" auto-width>
            <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand"
                   :icon="props.expand ? 'remove' : 'add'"/>
          </q-td>
          <q-td key="eventName" :props="props" :class="'text-'+event_colour(props.row.id)">{{ props.row.name }}</q-td>
          <!-- <q-td key="group" :props="props" :class="'text-'+event_colour(props.row.id)">{{ props.row.group }}</q-td> -->
          <q-td key="eventIdentifier" :props="props" :class="'text-'+event_colour(props.row.id)">{{
              props.row.id
            }}
          </q-td>
          <q-td key="nodeNumber" :props="props" :class="'text-'+event_colour(props.row.id)">{{
              props.row.nodeNumber
            }}
          </q-td>
          <q-td key="eventNumber" :props="props" :class="'text-'+event_colour(props.row.id)">{{
              props.row.eventNumber
            }}
          </q-td>
          <q-td key="status" :props="props">
            <q-chip color="white" text-color="green" v-if="props.row.status=='on'">ON</q-chip>
            <q-chip color="white" text-color="red" v-else>OFF</q-chip>
          </q-td>
          <q-td key="type" :props="props" :class="'text-'+event_colour(props.row.id)">{{ props.row.type }}</q-td>
          <q-td key="count" :props="props" :class="'text-'+event_colour(props.row.id)">{{ props.row.count }}</q-td>
          <q-td key="actions" :props="props">
            <q-btn flat size="md" color="primary" label="Name" @click="clickEventName(props.row.id)" no-caps/>
            <q-btn flat size="md" color="primary" label="Teach" @click="clickTeach(props.row.id)" no-caps/>

            <!-- <q-btn flat size="md" color="primary" label="Test" @click="clickTest(props.row.nodeNumber, props.row.eventNumber, props.row.eventindex)" no-caps/> -->

          </q-td>
        </q-tr>

        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <event-details
              :eventIdentifier="props.row.id"
              :nodeNumber="props.row.nodeNumber"
              :eventNumber="props.row.eventNumber"
              :type="props.row.type"
            ></event-details>
          </q-td>
        </q-tr>
      </template>
    </q-table>


      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Close" v-close-popup/>
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
    :nodeNumber = selected_event_node
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
const selected_event_index = ref(0) // Dialog will complain if null

const columns = [
  {name: 'expand', field: 'expand', required: true, label: 'Expand', align: 'left', sortable: false},
  {name: 'eventName', field: 'name', required: true, label: 'Event Name', align: 'left', sortable: false},
//  {name: 'group', field: 'name', required: true, label: 'Group', align: 'left', sortable: false},
  {name: 'eventIdentifier', field: 'id', required: true, label: 'Event Identifier', align: 'left', sortable: false},
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
    output['id'] = busEvents[key].eventIdentifier
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


const clickTest = (nodeNumber, eventNumber, eventIndex) => {
  selected_event_node.value = nodeNumber
  selected_event_number.value = eventNumber
  selected_event_index.value = eventIndex
  console.log(name + `: clickTest: eventIdentifier ` + selected_event_node.value + ' ' + selected_event_number.value)
  showSendEventDialog.value = true
}

const clickTeach = (eventIndentifier) => {
  console.log(name + `: clickTeach`)
  selected_event_Identifier.value = eventIndentifier
  showEventTeachDialog.value = true
}




</script>

<style scoped>

</style>
