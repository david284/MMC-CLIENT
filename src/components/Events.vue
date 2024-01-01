<template>
  <div>
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
        <div class="col-2 q-table__title text-h4">Events</div>
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
          <q-td key="group" :props="props" :class="'text-'+event_colour(props.row.id)">{{ props.row.group }}</q-td>
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
  </div>
  <div>
    <p v-if="store.state.debug">
      {{ Object.values(store.state.events) }}
    </p>
  </div>
</template>

<script setup>
import EventDetails from "components/modules/common/EventDetails.vue"

import {computed, inject, ref, watch, onMounted} from "vue"

const columns = [
  {name: 'expand', field: 'expand', required: true, label: 'Expand', align: 'left', sortable: false},
  {name: 'eventName', field: 'name', required: true, label: 'Event Name', align: 'left', sortable: false},
  {name: 'group', field: 'name', required: true, label: 'Group', align: 'left', sortable: false},
  {name: 'eventIdentifier', field: 'id', required: true, label: 'Event Identifier', align: 'left', sortable: false},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node Number', align: 'left', sortable: false},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event Number', align: 'left', sortable: false},
  {name: 'status', field: 'status', required: true, label: 'Status', align: 'left', sortable: false},
  {name: 'type', field: 'type', required: true, label: 'Type', align: 'left', sortable: false},
  {name: 'count', field: 'count', required: true, label: 'Count', align: 'left', sortable: false}
]
const store = inject('store')
const filter = ref('')
const pagnation = {rowsPerPage: 0}
let displayEventList = ref()


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
  //console.log(`Update Events`)
  let displayEventListLocal = []
  for (const event of Object.values(store.state.events)) {
    //console.log(`Update Event : ${event.id} - ${JSON.stringify(event)}`)
    let output = {}
    output['id'] = event.id
    output['nodeNumber'] = event.nodeNumber
    output['eventNumber'] = event.eventNumber
    output['status'] = event.status
    output['type'] = event.type
    output['count'] = event.count
    //displayEventList[i].id = i.id
    output['name'] = event_name(event.id)
    output['colour'] = event_colour(event.id)
    output['group'] = event_group(event.id)
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

const event_name = (eventId) => {
  if (eventId in store.state.layout.eventDetails) {
    //console.log(`Event Name`)
    return store.state.layout.eventDetails[eventId].name
  } else {
    //console.log(`Event No Name ${JSON.stringify(eventId)}`)
    return JSON.stringify(eventId)
  }
}

const event_colour = (eventId) => {
  if (eventId in store.state.layout.eventDetails) {
    //console.log(`Event Colour`)
    return store.state.layout.eventDetails[eventId].colour
  } else {
    //console.log(`Event No Colour ${JSON.stringify(eventId)}`)
    return "blue"
  }
}

const event_group = (eventId) => {
  if (eventId in store.state.layout.eventDetails) {
    //console.log(`Event Colour`)
    return store.state.layout.eventDetails[eventId].group
  } else {
    //console.log(`Event No Colour ${JSON.stringify(eventId)}`)
    return ""
  }
}

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
