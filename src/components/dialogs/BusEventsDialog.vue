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
        <q-btn color="negative" label="Refresh Events" @click="store.methods.refresh_events()" no-caps/>
        <q-space/>
        <q-btn color="negative" label="Clear Events" @click="store.methods.clear_events()" no-caps/>
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

</template>


<script setup>

/************************************************************************************
      usage
      <BusEventsDialog v-model='showBusEventsDialog' />
      
************************************************************************************ */ 


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import EventDetails from "components/modules/common/EventDetails.vue"

const store = inject('store')
const name = "BusEventsDialog"
const tab = ref('nodes')
const filter = ref('')
const pagnation = {rowsPerPage: 0}
let displayEventList = ref()

const columns = [
  {name: 'expand', field: 'expand', required: true, label: 'Expand', align: 'left', sortable: false},
  {name: 'eventName', field: 'name', required: true, label: 'Event Name', align: 'left', sortable: false},
//  {name: 'group', field: 'name', required: true, label: 'Group', align: 'left', sortable: false},
  {name: 'eventIdentifier', field: 'id', required: true, label: 'Event Identifier', align: 'left', sortable: false},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node Number', align: 'left', sortable: false},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event Number', align: 'left', sortable: false},
  {name: 'status', field: 'status', required: true, label: 'Status', align: 'left', sortable: false},
  {name: 'type', field: 'type', required: true, label: 'Type', align: 'left', sortable: false},
  {name: 'count', field: 'count', required: true, label: 'Count', align: 'left', sortable: false}
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


const eventList = computed(() => {
  //console.log(`Computed Events`)
  return Object.values(store.state.events)
})

const eventDetails = computed(() => {
  return store.state.layout
})

watch(eventList, () => {
  //console.log(`WATCH Events`)
  update_events()
})

watch(eventDetails, () => {
  //console.log(`WATCH Details`)
  update_events()
})

const update_events = () => {
  //  console.log(`Update Events`)
  let displayEventListLocal = []
  let events = store.state.events
  // order keys
  for (let key of Object.keys(events).sort()) {
    let output = {}
    output['id'] = events[key].id
    output['nodeNumber'] = events[key].nodeNumber
    output['eventNumber'] = events[key].eventNumber
    output['status'] = events[key].status
    output['type'] = events[key].type
    output['count'] = events[key].count
    //displayEventList[i].id = i.id
    output['name'] = event_name(events[key])
    output['colour'] = event_colour(events[key].id)
    output['group'] = event_group(events[key].id)
    /*if (event.id in store.state.layout.eventDetails) {
      output['name'] = store.state.layout.eventDetails[event.id].name
      output['colour'] = store.state.layout.eventDetails[event.id].colour
    } else {
      output['name'] = event.id
      output['colour'] = "black"
    }*/
    displayEventListLocal.push(output)
  }
  displayEventList.value = displayEventListLocal
}

const event_name = (event) => {
  var eventIdentifier = event.id
  // need to handle short events differently
  if(event.type == 'short'){
    eventIdentifier = '0000' + event.id.slice(-4)
  }
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
  store.methods.refresh_events()
  for (var node in store.state.nodes){
    // refresh event list
    console.log(`request Events for node ` + node)
    store.methods.request_all_node_events(node)
  }
})




</script>

<style scoped>

</style>
