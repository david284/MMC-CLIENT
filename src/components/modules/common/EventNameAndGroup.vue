<template>
  <q-card-section class="no-margin no-padding">
    <div class="q-pa-sm">
      Name and group changes take effect immediately
    </div>
    <q-card-section class="q-pt-none">
      <div class="text-h6">Event name</div>
      <q-input
        dense
        debounce="500"
        :disable="disableInput"
        v-model="newEventName"
        autofocus/>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="text-h6">Event group</div>
      <q-input
        dense
        debounce="500"
        :disable="disableInput"
        v-model="newEventGroup"
        autofocus/>
    </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-h6">Colour</div>
        <q-select
          v-model="newEventColour"
          dense
          debounce="500"
          :options=items
          popup-content-class="no-margin no-padding"
        >
        </q-select>
      </q-card-section>

  </q-card-section>
</template>

<script setup>
import {inject, ref, onMounted, onUpdated, computed, watch} from "vue";
import * as utils from "components/functions/utils.js"
import * as eventFunctions from "components/functions/EventFunctions.js"
import {text_colours} from "src/definitions/general_definitions"

const store = inject('store')
const logPrefix = "EventNameAndGroup"
const newEventName = ref("")
const newEventGroup = ref("")
const newEventColour = ref()
const items = ref([])
const disableInput = ref(true)

const props = defineProps({
  eventIdentifier: { type: String}
})


const eventIdentifierIn = computed(() => {
  return props.eventIdentifier
})

//
//
watch(eventIdentifierIn, () => {
  try{
    if (eventFunctions.EventIdentifierIsValid(props.eventIdentifier) ) {
      if (store.state.layout.eventDetails[props.eventIdentifier]) {
        newEventName.value = store.state.layout.eventDetails[props.eventIdentifier].name
        newEventGroup.value = store.state.layout.eventDetails[props.eventIdentifier].group
        newEventColour.value = store.state.layout.eventDetails[props.eventIdentifier].colour
      }else {
        newEventName.value = null
        newEventGroup.value = null
        newEventColour.value = "black"
      }
      disableInput.value = false
    } else {
      newEventName.value = null
      newEventGroup.value = null
      newEventColour.value = "black"
      disableInput.value = true
    }
    utils.timeStampedLog(logPrefix + `: eventIdentifierIn ${props.eventIdentifier}`)
  } catch(err) {
    utils.timeStampedLog(logPrefix + ": eventIdentifierIn " + err)
  }
})

//
//
watch(newEventName, () => {
  utils.timeStampedLog(logPrefix + `: watch: newEventName: ${newEventName.value}`)
  store.setters.event_name(props.eventIdentifier, newEventName.value)
})

watch(newEventGroup, () => {
  utils.timeStampedLog(logPrefix + `: watch: newEventGroup: ${newEventGroup.value}`)
  store.setters.event_group(props.eventIdentifier, newEventGroup.value)
})

watch(newEventColour, () => {
  utils.timeStampedLog(logPrefix + `: watch: newEventColour: ${newEventColour.value}`)
  store.setters.event_colour(props.eventIdentifier, newEventColour.value)
})


//
//
onMounted(() => {
  //utils.timeStampedLog(logPrefix + ": onMounted " + props.eventIdentifier)
  if (store.state.layout.eventDetails[props.eventIdentifier]) {
    newEventName.value = store.state.layout.eventDetails[props.eventIdentifier].name
    newEventGroup.value = store.state.layout.eventDetails[props.eventIdentifier].group
    newEventColour.value = store.state.layout.eventDetails[props.eventIdentifier].colour
  } else {
    newEventName.value = null
    newEventGroup.value = null
    newEventColour.value = "black"
  }
  if (eventFunctions.EventIdentifierIsValid(props.eventIdentifier)){
    disableInput.value = false
  } else {
    disableInput.value = true
  }
  //
  for (const index in text_colours)
  {
    let newItem = text_colours[index]
    utils.timeStampedLog(logPrefix + `: onMounted ${JSON.stringify(newItem)}`)
    items.value.push( newItem )
  }
})





/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


</script>

<style scoped>

</style>
