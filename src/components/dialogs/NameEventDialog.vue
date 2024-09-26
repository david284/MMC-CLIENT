<template>

    <q-dialog v-model="model" persistent>
      <q-card style="min-width: 350px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Edit name for event :  {{ store.getters.event_name(props.eventIdentifier) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card-section class="q-pt-none">
          <div class="text-h6">Event name</div>
          <q-input dense v-model="newEventName" autofocus />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-h6">Event group</div>
          <q-input dense v-model="newEventGroup" autofocus />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Accept" v-close-popup @click="clickAccept()"/>
        </q-card-actions>

    </q-card>
  </q-dialog>

</template>


<script setup>

import {inject, onUpdated, computed, watch, ref} from "vue";

const store = inject('store')
const name = "NameEventDialog"
const newEventName = ref("")
const newEventGroup = ref("")

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  eventIdentifier: { type:String, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

onUpdated(() => {
//  console.log(name + ": onUpdated " + props.eventIdentifier)
  if (store.state.layout.eventDetails[props.eventIdentifier]) {
    newEventName.value = store.state.layout.eventDetails[props.eventIdentifier].name
    newEventGroup.value = store.state.layout.eventDetails[props.eventIdentifier].group
  }
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickAccept = () => {
  console.log(name + ": clickAccept: name: " + props.eventIdentifier + ' ' + newEventName.value)
  store.setters.event_name(props.eventIdentifier, newEventName.value)
  store.setters.event_group(props.eventIdentifier, newEventGroup.value)
  newEventName.value = ""   // clear for next time
  newEventGroup.value = ""   // clear for next time
}

</script>

<style scoped>

</style>
