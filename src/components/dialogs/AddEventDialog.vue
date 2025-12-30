<template>

  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 400px; min-height: 200px;" class="q-pa-none q-ma-none">
      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            {{ title }}
          </div>
          <template v-slot:action>
            <q-btn color="info" size="sm" label="Info" @click="clickInfo()"/>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <div v-if="(storedEventsSupported == false)">
        <q-card-section>
          <div class="text-h6">
            This module does not support any stored events
          </div>
        </q-card-section>
      </div>

      <div v-if="(storedEventsSupported)">

        <q-card-section>
          <div class="q-gutter-sm">
            <q-radio v-model="eventType" val='long' label="Long event" @click="clickLongEvent()" />
            <q-radio v-model="eventType" val='short' label="Short event" @click="clickShortEvent()" />
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none" style="width: 200px;">
          <div class="text-h6">Node Number</div>
          <q-input
            :disable="(eventType != 'long')"
            class="text-h6"
            dense
            v-model="newEventNodeNumber"
            type="number"
            autofocus
            :rules="[ val => val <= 65535 || 'Please use value no greater than 65535']"
          />
        </q-card-section>
        <q-card-section class="q-pt-none" style="width: 200px;">
          <div class="text-h6">Event Number</div>
          <q-input
            :disable="(eventType == undefined) "
            class="text-h6"
            dense
            v-model="newEventNumber"
            type="number"
            autofocus
            :rules="[ val => val <= 65535 || 'Please use value no greater than 65535']"
            />
        </q-card-section>

        <q-card-actions align="right" class="q-py-none q-ma-none">
          <q-btn :disable="!addEventEnabled" color="blue" label="Add Event" @click="clickAddEvent()"/>
        </q-card-actions>

      </div> <!-- end if storedEventsSupported  -->

      <EventNameAndGroup
        :eventIdentifier=selected_event_Identifier
      />

    </q-card>
  </q-dialog>


  <eventVariablesDialog v-model='showEventVariablesDialog'
        :nodeNumber = nodeNumber
        :eventIdentifier = selected_event_Identifier
        :newEvent = true
  />

  <AddEventInfoDialog v-model='showInfo'/>

</template>

<script setup>

//
// This dialog will add an event, prompting for details like event number, name & group
//
// If a node number property is supplied, then once the details are populated, the variables dialog
// is raised so it can be 'taught' to that node
//
// If no node number is supplied, then the event is just written to the Layout data structure,
// and no doe is programmed
//

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import * as utils from "components/functions/utils.js"
import * as eventFunctions from "components/functions/EventFunctions.js"
import AddEventInfoDialog from "components/dialogs/AddEventInfoDialog"
import eventVariablesDialog from "components/dialogs/EventVariablesDialog"
import {createNewEvent} from "components/functions/EventFunctions.js"
import EventNameAndGroup from "components/modules/common/EventNameAndGroup"


const store = inject('store')
const $q = useQuasar()
const name = "AddEventDialog"
const newEventNodeNumber = ref()
const newEventNumber = ref()
const addEventEnabled = ref(false)
const storedEventsSupported = ref(true)
const eventType = ref()
const showEventVariablesDialog = ref(false)
const title = ref('')
const selected_event_Identifier = ref()
const showInfo = ref(false)

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, default: undefined}
})

const emit = defineEmits(['update:modelValue'])

//
//
const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

//
//
watch (model, () => {
  if (model.value == true){
    // reset selection
    eventType.value = undefined
    newEventNumber.value = undefined
    newEventNodeNumber.value = undefined
    if (props.nodeNumber == undefined){
      title.value = "Add event"
    } else {
      title.value = "Add event for node " + store.getters.node_name(props.nodeNumber)
    }
    if(store.getters.node_eventCapacity(props.nodeNumber) == 0) {
      storedEventsSupported.value == false
    }
  }
})

//
//
watch(newEventNumber, () => {
  //utils.timeStampedLog(name + `: WATCH newEventNumber`)
  if(eventType.value == 'short'){
    newEventNodeNumber.value = 0
  }
  updateEventIdentifier()
})

//
//
watch(newEventNodeNumber, () => {
  //utils.timeStampedLog(name + `: WATCH newEventNodeNumber`)
  updateEventIdentifier()
})

const updateEventIdentifier = () => {
  let entered_event_identifier = parseInt(newEventNodeNumber.value).toString(16).toUpperCase().padStart(4, 0)
  entered_event_identifier += parseInt(newEventNumber.value).toString(16).toUpperCase().padStart(4, 0)
  selected_event_Identifier.value = entered_event_identifier
  addEventEnabled.value = eventFunctions.EventIdentifierIsValid(selected_event_Identifier.value)
  utils.timeStampedLog(name + `: updateEventIdentifier ${selected_event_Identifier.value}`)
}

//
//
onUpdated(() =>{
  //utils.timeStampedLog(name + ` OnUpdated`)
})

onMounted(() =>{
  //utils.timeStampedLog(name + ` onMounted`)
})
/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickAddEvent = () => {
  utils.timeStampedLog(name + `: clickAddEvent ${props.nodeNumber} ${selected_event_Identifier.value}`)

  if (props.nodeNumber){
    if (store.state.nodes[props.nodeNumber].storedEventsNI[selected_event_Identifier.value] != undefined){
      const result = $q.notify({
        message: 'This event already exists on this node',
        timeout: 0,
        position: 'center',
        color: 'primary',
        actions: [
          { label: 'dismiss', color: 'white', handler: async () => {  } }
        ]
      })
    } else {
      //
      // adding an event to an actual node, create a new event & open variables dialog
      if (props.nodeNumber != undefined){
        if (createNewEvent(store, props.nodeNumber, selected_event_Identifier.value)){
          showEventVariablesDialog.value = true
        }
      }
    }
  }
  //model.value = false
}

//
//
const clickInfo = () => {
  utils.timeStampedLog(name + `: clickInfo`)
  showInfo.value = true
}

//
//
const clickLongEvent = () => {
  utils.timeStampedLog(name + `: clickLongEvent`)
  newEventNodeNumber.value = props.nodeNumber
}

//
//
const clickShortEvent = () => {
  utils.timeStampedLog(name + `: clickShortEvent`)
  newEventNodeNumber.value = 0
}


</script>

<style scoped>

</style>
