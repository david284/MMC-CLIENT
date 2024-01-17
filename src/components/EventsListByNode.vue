<template>
  <div>

<!--
      <q-card class="q-pa-sm" style="max-width: 300px">

       <q-card-section>
        <NodeParameter Name="Node Number"
                        :Value="nodeNumber">
        </NodeParameter>
      </q-card-section>
    </q-card>
 -->

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
          <q-td key="edit" :props="props">
            <q-btn outline rounded color="primary" label="Name" @click="showNameEventDialog(props.row.eventIdentifier)" no-caps/>
            <q-btn outline rounded color="primary" label="Edit" @click="editEvent(props.row.eventIndex)" no-caps/>
            <q-btn outline rounded color="negative" label="Delete"
                   @click="removeEvent(store.state.selected_node, props.row.eventIdentifier)" no-caps/>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    </div>

  </div>
</template>

<script setup>
import {computed, inject, ref, watch, onBeforeMount, onMounted} from "vue"
import NodeParameter from "components/modules/common/NodeParameter"
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";

const store = inject('store')

/*
const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  }
})
*/

const rows = ref([])
const addEventDialog = ref(false)
const nameEventDialog = ref(false)
const newEventName = ref()
const newNodeNumber = ref()
const newEventNumber = ref()
const eventIdentifier = ref()
var eventType = ref()


const columns = [
  {name: 'eventIdentifier', field: 'eventIdentifier', required: true, label: 'EventId', align: 'left', sortable: true},
  {name: 'eventName', field: 'eventName', required: false, label: 'Name', align: 'left', sortable: true},
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node', align: 'left', sortable: true},
  {name: 'eventNumber', field: 'eventNumber', required: true, label: 'Event', align: 'left', sortable: true},
  {name: 'eventIndex', field: 'eventIndex', required: true, label: 'Event Index', align: 'left', sortable: true},
  {name: 'eventType', field: 'eventType', required: true, label: 'Event Type', align: 'left', sortable: true},
  {name: 'edit', field: 'edit', required: true, label: 'Edit', align: 'left', sortable: true}
]


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



onBeforeMount(() => {
//  refreshEvents()
//  update_rows()
})

onMounted(() => {
})

</script>

<style scoped>

</style>
