<template>
  <div class="q-pa-md" >
    <q-banner inline-actions>
      <div class="text-h6">
        Stored Events
      </div>
      <template v-slot:action>
        <q-btn color="positive" label="Add Event" @click="showAddEventDialog()" no-caps/>
        <q-btn color="positive" label="Refresh Events" @click="refreshEvents()" no-caps/>
      </template>
    </q-banner>
  </div>
  <div class="full-width" >
    <q-table
      :rows=rows
      :columns="columns"
      row-key="eventIdentifier"
      virtual-scroll
      :rows-per-page-options="[0]"
      :virtual-scroll-sticky-size-start="48"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="eventIdentifier" :props="props">{{ props.row.eventIdentifier }}</q-td>
          <q-td key="eventName" :props="props">{{ props.row.eventName}}</q-td>
          <q-td key="nodeNumber" :props="props">{{ props.row.nodeNumber }}</q-td>
          <q-td key="eventNumber" :props="props">{{ props.row.eventNumber }}</q-td>
          <q-td key="eventIndex" :props="props">{{ props.row.eventIndex }}</q-td>
          <q-td key="eventType" :props="props">{{ props.row.eventType }}</q-td>
          <q-td key="edit" :props="props">
            <q-btn outline rounded color="primary" label="Name" @click="showNameEventDialog(props.row.eventIdentifier)" no-caps/>
            <q-btn outline rounded color="primary" label="Edit" @click="editEvent(props.row.eventIndex)" no-caps/>
            <q-btn outline rounded color="negative" label="Delete"
                   @click="removeEvent(store.state.selected_node, props.row.eventIdentifier)" no-caps/>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="addEventDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h4">Add new event</div>
          <div class="q-gutter-sm">
            <q-radio v-model="eventType" val='long' label="Long event" />
            <q-radio v-model="eventType" val='short' label="Short event" />
          </div>
        </q-card-section>
        <div v-if="(eventType == 'long')">
          <q-card-section>
            <div class="text-h4">Node Number</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input dense v-model="newNodeNumber" autofocus />
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Consumed events will need the number of the node that produces the event</div>
            <div class="text-h6">Events produced by this node will need the number of this node, as well as editing the event variables</div>
          </q-card-section>
          <q-card-section>
            <div class="text-h4">Event Number</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input dense v-model="newEventNumber" autofocus />
          </q-card-section>
        </div>
        <div v-if="(eventType == 'short')">
          <q-card-section>
            <div class="text-h4">Device Number</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input dense v-model="newEventNumber" autofocus />
          </q-card-section>
        </div>
        <div v-if="(eventType != null)">
          <q-card-section>
            <div class="text-h6">Once event is added, select edit for the event from the event list to modify event variables</div>
          </q-card-section>
        </div>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Add Event" v-close-popup @click="createEvent()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="nameEventDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h4">edit event name</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
            <q-input dense v-model="newEventName" autofocus />
          </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Accept" v-close-popup @click="nameEvent()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
  <div class="q-pa-sm row" v-if="store.state.debug">
    <p>
      {{ Object.values(store.state.events) }}
    </p>
  </div>
</template>

<script setup>
import {inject, onBeforeMount, computed, watch, ref} from "vue";
import Default2EventVariables from "components/modules/default2/Default2EventVariables";
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";

const columns = [
  {name: 'eventIdentifier', field: 'eventIdentifier', required: true, label: 'EventId', align: 'left', sortable: true},
  {name: 'eventName', field: 'eventName', required: false, label: 'Name', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node', align: 'left', sortable: true},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event', align: 'left', sortable: true},
  {name: 'eventIndex', field: 'eventIndex', required: true, label: 'Event Index', align: 'left', sortable: true},
  {name: 'eventType', field: 'eventType', required: true, label: 'Event Type', align: 'left', sortable: true},
  {name: 'edit', field: 'edit', required: true, label: 'Edit', align: 'left', sortable: true}
]

const store = inject('store')
const rows = ref([])
const addEventDialog = ref(false)
const nameEventDialog = ref(false)
const newEventName = ref()
const newNodeNumber = ref()
const newEventNumber = ref()
const eventIdentifier = ref()
var eventType = ref()

const nodeEvents = computed(() =>{
  return Object.values(store.state.nodes[store.state.selected_node].storedEvents)
})

watch(nodeEvents, () => {
  update_rows()
})

const update_rows = () => {
  //console.log(`DefaultEventList Update Rows ${store.state.selected_node}`)
  rows.value = []

   nodeEvents.value.forEach(event => {
    var eventNodeNumber = parseInt(event.eventIdentifier.substr(0, 4), 16)
    let output = {}
    output['eventIdentifier'] = event.eventIdentifier
    output['eventName'] = store.getters.event_name(event.eventIdentifier)
    output['eventIndex'] = event.eventIndex
    output['nodeNumber'] = eventNodeNumber
    output['eventNumber'] = parseInt(event.eventIdentifier.substr(4, 4), 16)
    output['eventType'] = getEventType(event.eventIndex)
    rows.value.push(output)
  })
  // sort rows by eventIdentifier, not eventIndex
  rows.value.sort(function(a, b){return (a.eventIdentifier < b.eventIdentifier)? -1 : 1;});
}


const getEventType = (eventIndex) =>{
  if(store.state.nodes[store.state.selected_node].variableConfig){
    var logic = store.state.nodes[store.state.selected_node].variableConfig.producedEventLogic
    if (logic == undefined){
      return ""
    }
    var isProduced = parseLogicElement(logic, store, eventIndex)
    if (isProduced){
      return "produced"
    } else {
      return "consumed"
    }
  }
}


onBeforeMount(() => {
  //console.log(`DefaultEventList Mounted ${store.state.selected_node}`)
  refreshEvents()
  update_rows()
})

const showNameEventDialog = (eventId) => {
  console.log(`nameEvent`)
  eventIdentifier.value = eventId
  newEventName.value = store.getters.event_name(eventId)
  nameEventDialog.value = true;
}

const editEvent = (eventIndex) => {
  console.log(`editEvent`)
  store.state.selected_event_index = eventIndex
  store.methods.update_event_component("Default2EventVariables")
}

const removeEvent = (nodeId, eventIndex) => {
  console.log(`removeEvent`)
  store.methods.remove_event(nodeId, eventIndex)
}

const showAddEventDialog = () => {
  console.log(`addEventDialog`)
  newNodeNumber.value = null
  newEventNumber.value = null
  eventType.value = null
  addEventDialog.value = true
}

const refreshEvents = () => {
  // refresh event list
  console.log(`refresh Events`)
  store.methods.request_all_node_events(store.state.selected_node)
  var timeout = 0
  nodeEvents.value.forEach(event => {
    timeout += 100
    setTimeout(()=>{
        store.methods.request_all_event_variables(
          store.state.selected_node,
          event.eventIndex,
          100,
          store.state.nodes[store.state.selected_node].parameters[5]
        );
			} , timeout
    );
  });
}


const createEvent = () => {
  var eventIndex = getFreeEventIndex()
  if (eventType.value == 'short'){newNodeNumber.value = 0}
  var eventID = parseInt(newNodeNumber.value).toString(16).toUpperCase().padStart(4, 0)
               + parseInt(newEventNumber.value).toString(16).toUpperCase().padStart(4, 0)
  console.log(`createEvent - index ` + eventIndex + ` eventID ` + eventID)
  store.methods.teach_event(store.state.selected_node, eventID, eventIndex, )
  // event list will be refreshed on acknowledge (WRACK, GRSP) from node
}

const nameEvent = () => {
  store.setters.event_name(eventIdentifier.value, newEventName.value)
  update_rows()
}

const getFreeEventIndex = () => {
      // need to find first free event index - node parameter [4]
      var maxEventCount = store.state.nodes[store.state.selected_node].parameters[4]
      var eventIndex = null
      for (var i=1; i < maxEventCount; i++ ){
        console.log('i ' + i)
        if (store.state.nodes[store.state.selected_node].storedEvents[i]) {
          continue
        } else {
          eventIndex = i + 1
          break
        }        
      }
      return eventIndex
    }


</script>

<style scoped>

</style>
