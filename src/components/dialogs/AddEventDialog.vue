<template>

  <q-dialog v-model='model' persistent>
    <q-card style="width: 600px; min-height: 200px;">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          {{ title }}
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card-section>
        <div class="text-h6" v-if="(storedEventsSupported == false)">
          This module does not support any stored events
        </div>
      </q-card-section>

      <div v-if="(storedEventsSupported)">

        <q-card-section class="q-py-none q-ma-xs row">
            <q-radio dense v-model="eventType" val='long' label="Long event" />
            <q-space/>
            <q-radio dense v-model="eventType" val='short' label="Short event" />
            <q-space/>
            <q-space/>
        </q-card-section>

        <q-card style="min-height: 280px;">

          <q-card-section style="min-height: 80px;">
            <q-card-section v-if="(eventType == 'long')" class="q-pa-none q-ma-none">
              <div class="text-body">Consumed events will need the number of the node that produces the event</div>
              <div class="text-body">Events produced by this node will need the number of this node, as well as editing the event variables</div>
            </q-card-section>
          </q-card-section>

          <q-card class="q-py-none q-ma-xs row">

            <q-card style="width: 200px;">
              <q-card-section v-if="(eventType == 'long')">
                <q-card-section class="q-pa-none q-ma-none">
                  <div class="text-h6">Node Number</div>
                </q-card-section>
                <q-card-section class="q-pa-none q-ma-none">
                  <q-input dense v-model="newEventNodeNumber" type="number" autofocus />
                </q-card-section>
                <q-card-section class="q-pa-none q-ma-none">
                  <div class="text-h6">Event Number</div>
                </q-card-section>
                <q-card-section class="q-pa-none q-ma-none">
                  <q-input dense v-model="newEventNumber" type="number" />
                </q-card-section>
              </q-card-section>

              <q-card-section v-if="(eventType == 'short')">
                <q-card-section class="q-pa-none q-ma-none">
                  <div class="text-h6">Device Number</div>
                </q-card-section>
                <q-card-section class="q-pa-none q-ma-none">
                  <q-input dense v-model="newEventNumber" type="number" autofocus />
                </q-card-section>
              </q-card-section>
            </q-card>

            <q-card-section style="width: 350px;">
              <q-card-actions v-if="(!addEventEnabled && (eventType != null))" align="center" class="q-pa-none q-ma-none">
                <q-btn :disable="!eventEntered" color="blue" label="check event" v-close-popup @click="clickCheckEvent()"/>
              </q-card-actions>
              <q-card-section v-if="(addEventEnabled)" class="q-pa-none q-ma-none">
                <div class="text-h6" style="color:dodgerblue;">Event OK</div>
              </q-card-section>
            </q-card-section>

          </q-card>

        </q-card>


        <q-card-section>
          <div class="text-body">Event Name and Event Group are optional values</div>
          <div class="text-body">Input will be disabled if previously entered</div>
          <q-card-section class="q-pa-none q-ma-none">
            <div class="text-h6">Event Name</div>
          </q-card-section>
          <q-card-section class="q-pa-none q-ma-none">
            <q-input :disable="eventAlreadyExistsInLayoutData" dense v-model="newEventName" />
          </q-card-section>
          <q-card-section class="q-pa-none q-ma-none">
            <div class="text-h6">Event Group</div>
          </q-card-section>
          <q-card-section class="q-pa-none q-ma-none">
            <q-input :disable="eventAlreadyExistsInLayoutData" dense v-model="newEventGroup" />
          </q-card-section>
        </q-card-section>

        <q-card-section>
          <q-card-actions align="right" class=" q-pa-none q-ma-none">
            <q-btn :disable="!addEventEnabled" color="blue" label="Add Event" v-close-popup @click="clickAddEvent()"/>
          </q-card-actions>
        </q-card-section>

      </div> <!-- end if storedEventsSupported  -->

    </q-card>
  </q-dialog>


  <eventVariablesDialog v-model='showEventVariablesDialog'
        :nodeNumber = nodeNumber
        :eventIdentifier = new_event_Identifier
        :newEvent = true
  />

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
import eventVariablesDialog from "components/dialogs/EventVariablesDialog"
import {createNewEvent} from "components/functions/EventFunctions.js"

const store = inject('store')
const $q = useQuasar()
const name = "AddEventDialog"
const newEventNodeNumber = ref()
const newEventNumber = ref()
const newEventName = ref()
const newEventGroup = ref()
const addEventEnabled = ref(false)
const eventEntered = ref(false)
const storedEventsSupported = ref(true)
const eventAlreadyExistsInLayoutData = ref(false)
const eventType = ref()
const showEventVariablesDialog = ref(false)
const new_event_Identifier = ref("")
const title = ref('')

var entered_event_identifier = null

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
    eventType.value = undefined
    if (props.nodeNumber == undefined){
      title.value = "Add event"
    } else {
      title.value = "Add event for node " + store.getters.node_name(props.nodeNumber)
    }
  }
})

//
//
watch(newEventNumber, () => {
//  console.log(name + `: WATCH newEventNumber`)
  // enable add event button if conditions met
  if ((newEventNodeNumber.value != undefined) || (eventType.value == 'short')) {
    eventEntered.value = true
  }
})

//
//
watch(newEventNodeNumber, () => {
//  console.log(name + `: WATCH newEventNodeNumber`)
  // enable add event button if conditions met
  if (newEventNumber.value != undefined) {
    eventEntered.value = true
  }
})

//
//
const checkLayoutData = (eventIdentifier) => {
  if (eventIdentifier){
    if (eventIdentifier in store.state.layout.eventDetails){
      eventAlreadyExistsInLayoutData.value = true
      newEventName.value = store.getters.event_name(eventIdentifier)
      newEventGroup.value = store.getters.event_group(eventIdentifier)
    }
  }
}

//
//
onUpdated(() =>{
//  console.log(name + ` OnUpdated`)
  // check if this module actually supports any stored events
  if (props.nodeNumber != undefined){
    if(store.state.nodes[props.nodeNumber].parameters[4] == 0) {
      storedEventsSupported.value == false
    }
  }
  newEventNodeNumber.value = null
  newEventNumber.value = null
  newEventName.value = null
  // don't clear the newEventGroup value from last time as we might want to re-use it
  eventType.value = null
  addEventEnabled.value = false
  eventEntered.value = false
  eventAlreadyExistsInLayoutData.value = false
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickAddEvent = () => {
  console.log(name + `: clickAddEvent ` + newEventNodeNumber.value + ' ' + newEventNumber.value)
  //
  // adding an event to an actual node, create a new event & open variables dialog
  new_event_Identifier.value = entered_event_identifier
  if (props.nodeNumber != undefined){
    if (createNewEvent(store, props.nodeNumber, new_event_Identifier.value)){
      showEventVariablesDialog.value = true
    }
  }
  //
  // always add it to Layout Data if it doesn't already exist
  if (!eventAlreadyExistsInLayoutData.value){
    store.setters.event_name(new_event_Identifier.value, newEventName.value)
    store.setters.event_group(new_event_Identifier.value, newEventGroup.value)
  }
  model.value = false
}

//
//
const clickCheckEvent = () => {
  console.log(name + `: clickNext `)

  // to program a short event, the node number must be zero
  if (eventType.value == 'short'){newEventNodeNumber.value = 0}
  // need to create an eventIdentifier from entered values
  entered_event_identifier = parseInt(newEventNodeNumber.value).toString(16).toUpperCase().padStart(4, 0)
  entered_event_identifier += parseInt(newEventNumber.value).toString(16).toUpperCase().padStart(4, 0)
  console.log(name + `: entered_event_identifier: ` + entered_event_identifier)

  checkLayoutData(entered_event_identifier)
  console.log(name + `: eventAlreadyExistsInLayoutData: ` + eventAlreadyExistsInLayoutData.value)

  // if event already exists,
  var displayAlreadyExistsWarning = false

  if (props.nodeNumber){
    if (store.state.nodes[props.nodeNumber].storedEventsNI[entered_event_identifier] != undefined){
      displayAlreadyExistsWarning = true
    }
  } else {
    if (eventAlreadyExistsInLayoutData.value){
      displayAlreadyExistsWarning = true
    }
  }

  if ( displayAlreadyExistsWarning ){
    const result = $q.notify({
      message: 'This event already exists',
      timeout: 0,
      position: 'center',
      color: 'primary',
      actions: [
        { label: 'continue', color: 'white', handler: async () => {  } }
      ]
    })
  } else {
    // doesn't alread exist so enable
    addEventEnabled.value = true
  }
}

</script>

<style scoped>

</style>
