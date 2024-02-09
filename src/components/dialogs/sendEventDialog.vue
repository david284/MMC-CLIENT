<template>

  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 350px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Test event :  {{ store.getters.event_name(props.eventIdentifier) }}
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card-section>
        <div class="text-h6">Sending Node {{ props.sendingNodeNumber }}</div>
        <div class="text-h6">Event {{ eventNodeNumber }}:{{ props.eventNumber }}</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="text-h6">Generate event</div>
        <div class="text-subtitle2">Send this event as ON or OFF</div>
        <div class="q-pa-md q-gutter-sm">
          <q-btn color="green" label="ON" v-close-popup @click="send_on()"/>
          <q-btn color="negative" label="OFF" v-close-popup @click="send_off()"/>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup/>
      </q-card-actions>

    </q-card>
  </q-dialog>

</template>


<script setup>

/************************************************************************************
  nodeNumber is the node sending the event - not the eventNodeNumber
  for long events, eventIdentifier is built from the eventNodeNumber & the event number
  for short events, eventIdentifier is built from '0000' & the device number
  to send a short event, the nodenumber used is the sending node number
************************************************************************************ */ 


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "SendEventDialog"
const eventNodeNumber = ref()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  eventNumber: { type: Number, required: true },
  sendingNodeNumber: { type: Number, required: true },
  eventIdentifier: { type: String, required: true }
})


const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

watch(model, () => {
  console.log(name + `: WATCH model`)
//  eventNodeNumber.value = parseInt(props.eventIdentifier.slice(0,4), 16)
})


onBeforeMount(() => {
  console.log("SendEventDialog onBeforeMount")
})

onMounted(() => {
  console.log("SendEventDialog onMounted")
})

const send_on = () => {
  console.log ("send on " + props.eventIdentifier)
  var eventNodeNumber = parseInt(props.eventIdentifier.slice(0,4), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_on_event(props.sendingNodeNumber, props.eventNumber)
  } else {
    store.methods.long_on_event(eventNodeNumber, props.eventNumber)
  }
}

const send_off = () => {
  console.log ("send off " + props.eventIdentifier)
  var eventNodeNumber = parseInt(props.eventIdentifier.slice(0,4), 16)
  if (eventNodeNumber == 0) {
    store.methods.short_off_event(props.sendingNodeNumber, props.eventNumber)
  } else {
    store.methods.long_off_event(eventNodeNumber, props.eventNumber)
  }
}


</script>

<style scoped>

</style>
