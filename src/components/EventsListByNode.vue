<template>
  <div>

    <div class="full-width" >
    <q-table 
      style="height: 350px"
      bordered
      dense
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
          <q-td key="actions" :props="props">
            <q-btn flat size="md" color="primary" label="Name" @click="showNameEventDialog(props.row.eventIdentifier)" no-caps/>
            <q-btn flat size="md" color="primary" label="Edit" @click="editEvent(props.row.eventIndex)" no-caps/>
            <q-btn flat size="md" color="negative" label="Delete" @click="removeEvent(props.row.eventIdentifier)" no-caps/>
            <q-btn flat size="md" color="primary" label="Test" @click="testEvent(props.row.nodeNumber, props.row.eventNumber)" no-caps/>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    </div>


    <q-dialog v-model="nameEventDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h4">Edit event name</div>
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

    <sendEventDialog v-model='showSendEventDialog' 
      :nodeNumber = selected_event_node
      :eventNumber = selected_event_number
    />

    <deleteEventDialog v-model='showDeleteEventDialog' 
      :nodeNumber = store.state.selected_node
      :eventIdentifier = selected_event_Identifier
    />

  </div>
</template>

<script setup>
import {computed, inject, ref, watch, onBeforeMount, onMounted} from "vue"
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";
import sendEventDialog from "components/dialogs/SendEventDialog"
import deleteEventDialog from "components/dialogs/DeleteEventDialog"

const store = inject('store')

const rows = ref([])
const nameEventDialog = ref(false)
const showSendEventDialog = ref(false)
const showDeleteEventDialog = ref(false)
const newEventName = ref()
const selected_event_Identifier = ref()
const selected_event_node = ref()
const selected_event_number = ref()
var eventType = ref()

const columns = [
  {name: 'eventIdentifier', field: 'eventIdentifier', required: true, label: 'EventId', align: 'left', sortable: true},
  {name: 'eventName', field: 'eventName', required: false, label: 'Name', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node', align: 'left', sortable: true},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event', align: 'left', sortable: true},
  {name: 'eventIndex', field: 'eventIndex', required: true, label: 'Event Index', align: 'left', sortable: true},
  {name: 'eventType', field: 'eventType', required: true, label: 'Event Type', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: true}
]


const nodeEvents = computed(() =>{
  return Object.values(store.state.nodes[store.state.selected_node].storedEvents)
})


watch(nodeEvents, () => {
  update_rows()
})

const host_nodeNumber = computed(() =>{
  return store.state.selected_node
})

watch(host_nodeNumber, () => {
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
  if(store.state.nodeDescriptors[store.state.selected_node]){
    var logic = store.state.nodeDescriptors[store.state.selected_node].producedEventLogic
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

const showNameEventDialog = (eventIdentifier) => {
  console.log(`nameEvent`)
  selected_event_Identifier.value = eventIdentifier
  newEventName.value = store.getters.event_name(eventIdentifier)
  nameEventDialog.value = true;
}

const nameEvent = () => {
  store.setters.event_name(selected_event_Identifier.value, newEventName.value)
  update_rows()
}


const editEvent = (eventIndex) => {
  console.log(`editEvent`)
  store.state.selected_event_index = eventIndex
  store.methods.update_event_component("Default2EventVariables")
}

const removeEvent = (eventIndentifier) => {
  console.log(`removeEvent`)
  showDeleteEventDialog.value = true
  selected_event_Identifier.value = eventIndentifier
//  store.methods.remove_event(nodeNumber, eventIndentifier)
}


const testEvent = (nodeNumber, eventNumber) => {
  selected_event_node.value = nodeNumber
  selected_event_number.value = eventNumber
  console.log(`testEvent - eventIdentifier ` + selected_event_node.value + ' ' + selected_event_number.value)
  showSendEventDialog.value = true
}



onBeforeMount(() => {
  refreshEvents()
  update_rows()
})

onMounted(() => {
})

</script>

<style scoped>

</style>
