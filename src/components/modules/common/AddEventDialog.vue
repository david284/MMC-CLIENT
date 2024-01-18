<template>

    <q-dialog v-model='model'>
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
          <q-btn flat label="Cancel" v-close-popup @click="closeDialog()"/>
          <q-btn flat label="Add Event" v-close-popup @click="createEvent()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

</template>

<script setup>
import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const newNodeNumber = ref()
const newEventNumber = ref()
var eventType = ref()
const dialogRef = ref(null);

const props = defineProps({
  showDialog: { type: Boolean, required: true }
})

const emit = defineEmits(['update:showDialog'])

const model = computed({
      get() { return props.showDialog },
      set(newValue) { emit('update:showDialog', newValue) }
    })


onBeforeMount(() => {
  console.log(`addEventDialog`)
  newNodeNumber.value = null
  newEventNumber.value = null
  eventType.value = null
})

onMounted(() => {
  console.log(`addEventDialog`)
  newNodeNumber.value = null
  newEventNumber.value = null
  eventType.value = null
})

const closeDialog = () => {
  console.log(`closeDialog`)
  dialogRef.value.hide()
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
