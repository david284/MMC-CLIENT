<template>
  <q-card-section class="no-margin no-padding">

    <q-card-section class="q-pt-none">
      <div class="text-h6">Event name</div>
      <q-input dense :disable="disableInput" v-model="newEventName" autofocus/>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="text-h6">Event group</div>
      <q-input dense :disable="disableInput" v-model="newEventGroup" autofocus/>
    </q-card-section>

<!--
    <q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Accept" v-close-popup @click="clickAccept()"/>
      </q-card-actions>
    </q-card-section>
 -->

  </q-card-section>
</template>

<script setup>
import {inject, ref, onMounted, onUpdated, computed, watch} from "vue";
import * as utils from "components/functions/utils.js"

const store = inject('store')
const name = "EventNameAndGroup"
const newEventName = ref("")
const newEventGroup = ref("")
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
    if (EventIdentifierIsValid() ) {
      if (store.state.layout.eventDetails[props.eventIdentifier]) {
        newEventName.value = store.state.layout.eventDetails[props.eventIdentifier].name
        newEventGroup.value = store.state.layout.eventDetails[props.eventIdentifier].group
      }
      disableInput.value = false
    } else {
      newEventName.value = ""
      newEventGroup.value = ""
      disableInput.value = true
    }
    utils.timeStampedLog(name + `: eventIdentifierIn ${props.eventIdentifier}`)
  } catch(err) {
    utils.timeStampedLog(name + ": eventIdentifierIn " + err)
  }
})

//
//
watch(newEventName, () => {
  utils.timeStampedLog(name + `: watch: newEventName: ${newEventName.value}`)
  store.setters.event_name(props.eventIdentifier, newEventName.value)
})

watch(newEventGroup, () => {
  utils.timeStampedLog(name + `: watch: newEventGroup: ${newEventGroup.value}`)
  store.setters.event_group(props.eventIdentifier, newEventGroup.value)
})


//
//
onMounted(() => {
  //utils.timeStampedLog(name + ": onMounted " + props.eventIdentifier)
  if (store.state.layout.eventDetails[props.eventIdentifier]) {
    newEventName.value = store.state.layout.eventDetails[props.eventIdentifier].name
    newEventGroup.value = store.state.layout.eventDetails[props.eventIdentifier].group
  }
  if (EventIdentifierIsValid()){
    disableInput.value = false
  } else {
    disableInput.value = true
  }
})

//
// need to check that the evbentIdentifier passed in is actually valid
// so that we don't try setting name & group to an invalid event
//
const EventIdentifierIsValid = () => {
    if ((props.eventIdentifier.length != 8)
    || (props.eventIdentifier.includes("NAN") )
    || (props.eventIdentifier == "00000000") ) {
      // ok, not valid
      utils.timeStampedLog(name + `: EventIdentifierIsValid: false`)
      return false
    } else {
      utils.timeStampedLog(name + `: EventIdentifierIsValid: true`)
      return true
    }
}

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickAccept = () => {
  utils.timeStampedLog(name + `: clickAccept: name: ${newEventName.value} group: ${newEventGroup.value}`)
  store.setters.event_group(props.eventIdentifier, newEventGroup.value)
  store.setters.event_name(props.eventIdentifier, newEventName.value)
}


</script>

<style scoped>

</style>
