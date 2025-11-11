<template>
  <q-dialog v-model="model">

    <!-- min-width: has no effect on q-dialog -->
    <q-card  style="min-width: 400px" class="q-pa-none q-ma-none">
      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Slot {{eventIndex}} Event Identity
          </div>
          <template v-slot:action>
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
      <div>
        <q-card-section>
          <div>Node Number</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input :disable="(eventType == 'short')" dense v-model="newEventNodeNumber" autofocus />
        </q-card-section>
        <q-card-section>
        <div>Event Number</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input dense v-model="newEventNumber" autofocus />
          </q-card-section>
        </div>
      <div v-if="(eventType != null)">
        <q-card-actions align="right" class="text-primary">
          <q-btn v-if="(addEventEnabled)" label="Add Event" @click="clickAddEventIdentifier()" v-close-popup/>
        </q-card-actions>
      </div>

    </q-card>

  </q-dialog>


</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import * as utils from "components/functions/utils.js"
import * as eventFunctions from "components/functions/EventFunctions.js"

const store = inject('store')
const name = "EventIdentityDialog"
const newEventNodeNumber = ref()
const newEventNumber = ref()
const addEventEnabled = ref(true)
const eventType = ref()
const new_event_Identifier = ref("") // Dialog will complain if null


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true },
  eventIndex: {type: Number, default: 0 },
  eventIdentifier: {type: String, default: "0000000" }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
  console.log(name + `: WATCH model`)
  if (model.value == true){
    utils.timeStampedLog(name + `: watch model: ${props.eventIdentifier}`)
    newEventNodeNumber.value = parseInt(props.eventIdentifier.substring(0, 4), 16)
    newEventNumber.value = parseInt(props.eventIdentifier.substring(4, 8), 16)
    if (newEventNodeNumber.value == 0){
      eventType.value = 'short'
    } else {
      eventType.value = 'long'
    }
  }
})


onBeforeMount(() => {
})

onMounted(() => {
})



/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickAddEventIdentifier = () => {
  utils.timeStampedLog(name + `: clickAddEventIdentifier`)

  if (eventType.value == 'short'){newEventNodeNumber.value = 0}
  let entered_event_identifier = parseInt(newEventNodeNumber.value).toString(16).toUpperCase().padStart(4, 0)
  entered_event_identifier += parseInt(newEventNumber.value).toString(16).toUpperCase().padStart(4, 0)

  utils.timeStampedLog(name + `: clickAddEventIdentifier: entered_event_identifier ${entered_event_identifier} `)

  store.methods.event_teach_by_index(
      props.nodeNumber,
      entered_event_identifier,
      props.eventIndex,
      0,
      0,
      true,
    )

    if (store.getters.node_descriptor_useNENRD(props.nodeNumber)) {
      eventFunctions.requestAllEventsByIndex(store, props.nodeNumber)
    } else {
      store.methods.request_all_node_events(props.nodeNumber)
    }

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
