<template>
  <q-dialog v-model="model">
    <!-- min-width: has no effect on q-dialog -->
    <q-card  style="min-width: 400px" class="q-pa-none q-ma-none">
      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Event for {{ bannerText }} {{eventIndex}}
          </div>
          <template v-slot:action>
            <q-btn color="info" size="sm" label="Info" @click="clickInfo()"/>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

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
        <q-btn :disable="!addEventEnabled" color="blue" label="Save Event" @click="clickSaveEvent()"/>
      </q-card-actions>

      <EventNameAndGroup
        :eventIdentifier=selected_event_Identifier
      />

    </q-card>

  </q-dialog>

  <EventVariablesDialog v-model='showEventVariablesDialog'
    :nodeNumber = nodeNumber
    :eventIdentifier = selected_event_Identifier
    :eventIndex = eventIndex
  />

  <AddEventInfoDialog v-model='showInfo'/>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import * as utils from "components/functions/utils.js"
import * as eventFunctions from "components/functions/EventFunctions.js"
import cbusLib from "cbuslibrary"
import AddEventInfoDialog from "components/dialogs/AddEventInfoDialog"
import EventVariablesDialog from "components/dialogs/EventVariablesDialog"
import EventNameAndGroup from "components/modules/common/EventNameAndGroup"


const store = inject('store')
const logPrefix = "EventIdentityDialog"
const newEventNodeNumber = ref()
const newEventNumber = ref()
const addEventEnabled = ref(false)
const eventType = ref()
const showEventVariablesDialog = ref(false)
const selected_event_Identifier = ref()
const showEventNameAndGroup = ref(false)
const showInfo = ref(false)


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true },
  eventIndex: {default: 0 },
  eventIdentifier: {default: "0000000" },
  bannerText: {type: String, default: "index"},
  showVariables: {default: false}
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
  utils.timeStampedLog(logPrefix + `: WATCH model`)
  if (model.value == true){
    utils.timeStampedLog(logPrefix + `: watch model: ${props.eventIdentifier}`)
    newEventNodeNumber.value = parseInt(props.eventIdentifier.substring(0, 4), 16)
    newEventNumber.value = parseInt(props.eventIdentifier.substring(4, 8), 16)
    if (newEventNodeNumber.value == 0){
      eventType.value = 'short'
    } else {
      eventType.value = 'long'
    }
  addEventEnabled.value = eventFunctions.EventIdentifierIsValid(props.eventIdentifier)
  }
})


watch(newEventNodeNumber, () => {
  updateEventIdentifier()
})


watch(newEventNumber, () => {
  updateEventIdentifier()
})


const updateEventIdentifier = () => {
  let entered_event_identifier = parseInt(newEventNodeNumber.value).toString(16).toUpperCase().padStart(4, 0)
  entered_event_identifier += parseInt(newEventNumber.value).toString(16).toUpperCase().padStart(4, 0)
  selected_event_Identifier.value = entered_event_identifier
  addEventEnabled.value = eventFunctions.EventIdentifierIsValid(selected_event_Identifier.value)
  utils.timeStampedLog(logPrefix + `: updateEventIdentifier ${selected_event_Identifier.value}`)
}



onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickSaveEvent = async () => {
  utils.timeStampedLog(logPrefix + `: clickAddEventIdentifier`)
  await utils.sleep(500)

  if (eventType.value == 'short'){newEventNodeNumber.value = 0}
  let entered_event_identifier = parseInt(newEventNodeNumber.value).toString(16).toUpperCase().padStart(4, 0)
  entered_event_identifier += parseInt(newEventNumber.value).toString(16).toUpperCase().padStart(4, 0)
  selected_event_Identifier.value = entered_event_identifier

  utils.timeStampedLog(logPrefix + `: clickAddEventIdentifier: entered_event_identifier ${entered_event_identifier} `)

  if (store.getters.node_useEventIndex(props.nodeNumber) == true){
    store.methods.event_teach_by_index(
      props.nodeNumber,
      entered_event_identifier,
      props.eventIndex,
      0,
      0,
      true,
    )
    await utils.sleep(500)
    // send a single NENRD to refresh the event ID back from the node
    let commandString = cbusLib.encodeNENRD(props.nodeNumber, props.eventIndex)
    store.methods.send_cbus_message(commandString)
  } else {
    // teach EV1
    store.methods.event_teach_by_identifier(
      props.nodeNumber,
      entered_event_identifier,
      1,
      1)
    // now EV2
    store.methods.event_teach_by_identifier(
      props.nodeNumber,
      entered_event_identifier,
      2,
      props.eventIndex)
  }
  if(store.getters.node_numberOfEventVariables(props.nodeNumber) > 0){
    if (props.showVariables){
      // need to display event variables dialog
      showEventVariablesDialog.value = true
    }
  }
  showEventNameAndGroup.value = true
}

//
//
const clickInfo = () => {
  utils.timeStampedLog(logPrefix + `: clickInfo`)
  showInfo.value = true
}


//
//
const clickLongEvent = () => {
  utils.timeStampedLog(logPrefix + `: clickLongEvent`)
  newEventNodeNumber.value = props.nodeNumber
}

//
//
const clickShortEvent = () => {
  utils.timeStampedLog(logPrefix + `: clickShortEvent`)
  newEventNodeNumber.value = 0
}

</script>

<style scoped>

</style>
