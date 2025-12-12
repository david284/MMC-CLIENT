<template>
  <q-dialog v-model="model">

    <!-- min-width: has no effect on q-dialog -->
    <q-card  style="min-width: 400px" class="q-pa-none q-ma-none">
      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Activate {{ titleText }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card-section class="q-pa-none q-ma-none">
         Click the associated Event to activate a particular index
      </q-card-section>

      <q-card style="max-height: 75vh" class="scroll no-margin q-py-none-xs">
        <q-table
          bordered
          dense
          :rows=rows
          :columns="slot_columns"
          row-key="eventIndex"
          virtual-scroll
          :rows-per-page-options="[0]"
          :virtual-scroll-sticky-size-start="0"
          hide-bottom
        >
          <template v-slot:body="props">
            <q-tr :props="props" class="q-my-none q-py-none">
              <q-td key="eventIndex" :props="props">{{ props.row.eventIndex }}</q-td>
              <q-td key="actions" :props="props">
                <q-btn dense class="q-mx-xs" outline size="md" color="primary" label="Event" no-caps @click="clickEvent(props.row.eventIndex)"/>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>

    </q-card>

  </q-dialog>

  <EventIdentityDialog v-model="showEventIdentityDialog"
    :nodeNumber=nodeNumber
    :eventIndex=selected_event_index
    :showVariables=true
  />


</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import * as utils from "components/functions/utils.js"
import * as eventFunctions from "components/functions/EventFunctions.js"
import EventIdentityDialog from "components/dialogs/EventIdentityDialog"


const store = inject('store')
const name = "ActivateSlotDialog"
const rows = ref([])
const selected_event_index = ref()
const showEventIdentityDialog = ref(false)
const titleText = ref()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true }
})

const slot_columns = [
  {name: 'eventIndex', field: 'eventIndex', label: 'Index', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: true}
]



const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
  //console.log(name + `: WATCH model`)
  if (store.getters.node_useSlots(props.nodeNumber)){
    titleText.value = "slot"
  } else {
    titleText.value = "index"
  }
  update_rows()
})

// watch if any nodes change
const nodesUpdated = computed(() => {
  return store.state.nodes.updateTimestamp
})

watch(nodesUpdated, () => {
  //utils.timeStampedLog(name + `: WATCH: nodesUpdated ` + nodesUpdated.value)
  if (props.nodeNumber){
    update_rows()
  }
})


onBeforeMount(() => {
})

onMounted(() => {
})

const update_rows = () => {
  //utils.timeStampedLog(name + `: update_rows: node ${props.nodeNumber} `)
  rows.value = []
  try{
    //utils.timeStampedLog(name + `: update_rows: node ${props.nodeNumber} `)
    let numberOfEvents = store.getters.node_eventCapacity(props.nodeNumber)
    for (let i=1; i<= numberOfEvents; i++){
      //let event = store.state.nodes[props.nodeNumber].eventsByIndex[i]
      //var eventNodeNumber = parseInt(event.eventIdentifier.substr(0, 4), 16)
      //var eventNumber = parseInt(event.eventIdentifier.substr(4, 4), 16)
      //
      if ((store.state.nodes[props.nodeNumber].eventsByIndex[i] == undefined) ||
      (store.state.nodes[props.nodeNumber].eventsByIndex[i].eventIdentifier == "00000000")){
        let output = {}
        output['eventIdentifier'] = ""
        output['nodeNumber'] = ""
        output['eventIndex'] = i
        output['eventNumber'] = ""
        output['eventType'] = ""
        rows.value.push(output)
      }
    }
    // sort rows by eventIndex
    rows.value.sort(function(a, b){return (a.eventIndex < b.eventIndex)? -1 : 1;});
  } catch(err){
    utils.timeStampedLog(name + `: update_rows: ${err} `)
  }
}


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickEvent = (eventIndex) => {
  utils.timeStampedLog(name + `: clickEvent: eventIndex ${eventIndex}`)
  selected_event_index.value = eventIndex
  showEventIdentityDialog.value = true
}


</script>

<style scoped>

</style>
