<template>

  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 350px">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Add event for node {{ store.getters.node_name(store.state.selected_node) }}
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card-section>
      <div class="text-h6" v-if="(addEventEnabled == false)">
        This module does not support any stored events
      </div>
      </q-card-section>
      <div v-if="(addEventEnabled)">
      <q-card-section>
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
    </div>
      <q-card-actions align="right" class="text-primary">
        <q-btn v-if="(addEventEnabled)" flat label="Add Event" v-close-popup @click="createEvent()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <eventVariablesDialog v-model='showEventVariablesDialog'
        :nodeNumber = store.state.selected_node
        :eventIndex = store.state.selected_event_index
        :eventIdentifier = selected_event_Identifier
  />


</template>

<script setup>
import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import eventVariablesDialog from "components/dialogs/EventVariablesDialog"

const store = inject('store')
const name = "AddEventDialog"
const newNodeNumber = ref()
const newEventNumber = ref()
const addEventEnabled = ref(true)
var eventType = ref()
const showEventVariablesDialog = ref(false)
const selected_event_Identifier = ref("") // Dialog will complain if null
const selected_event_node = ref(0) // Dialog will complain if null
const selected_event_number = ref(0) // Dialog will complain if null
const selected_event_index = ref(0) // Dialog will complain if null


const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })


onBeforeMount(() => {
})

onMounted(() => {
})

onUpdated(() =>{
  console.log(name + ` OnUpdated`)
  // check if this module actually supports any stored events
  if(store.state.nodes[store.state.selected_node].parameters[4] == 0) {
    addEventEnabled.value == false
  }
  newNodeNumber.value = null
  newEventNumber.value = null
  eventType.value = null
  // check if this module actually supports any stored events
  if(store.state.nodes[store.state.selected_node].parameters[4] == 0) {
    addEventEnabled.value = false
    console.log(name + ` OnUpdated - addEvent disabled `)
  }
})

const createEvent = () => {
  var eventIndex = getFreeEventIndex()
  selected_event_index.value = eventIndex
  store.state.selected_event_index = eventIndex
  // to program a short event, the node number must be zero
  if (eventType.value == 'short'){newNodeNumber.value = 0}
  var eventIdentifier = parseInt(newNodeNumber.value).toString(16).toUpperCase().padStart(4, 0)
               + parseInt(newEventNumber.value).toString(16).toUpperCase().padStart(4, 0)
  selected_event_Identifier.value = eventIdentifier
  console.log(`createEvent - index ` + eventIndex + ` eventIdentifier ` + eventIdentifier)
//  store.methods.teach_event(store.state.selected_node, eventIdentifier, eventIndex, )
  // event list will be refreshed on acknowledge (WRACK, GRSP) from node
  showEventVariablesDialog.value = true
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
      eventIndex = i + 3
      break
    }
  }
  return eventIndex
}


</script>

<style scoped>

</style>
