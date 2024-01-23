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

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Accept" v-close-popup @click="clickAccept()"/>
          <q-btn flat label="Cancel" v-close-popup />
        </q-card-actions>

    </q-card>
  </q-dialog>

</template>


<script setup>

import {inject, onUpdated, computed, watch, ref} from "vue";

const store = inject('store')

const newEventName = ref("")

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  eventIdentifier: { type:String, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })


const clickAccept = () => {
  console.log("new event name: " + props.eventIdentifier + ' ' + newEventName.value)
  store.setters.event_name(props.eventIdentifier, newEventName.value)
  newEventName.value = ""   // clear for next time
}


onUpdated(() => {
  console.log("NameEventDialog onUpdated " + props.eventIdentifier)
  if (store.state.layout.eventDetails[props.eventIdentifier]) {
    newEventName.value = store.state.layout.eventDetails[props.eventIdentifier].name
  }
})




</script>

<style scoped>

</style>
