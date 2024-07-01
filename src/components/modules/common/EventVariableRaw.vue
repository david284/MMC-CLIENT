<template>
  <q-card class="q-pa-none" flat>
    <q-card-section>
      <q-input
        mask="###"
        :label="label"
        debounce="1000"
        v-model="eventValue"
        outlined
        :error-message="error_message"
        :error="error"
        @change="update_event">
      </q-input>
    </q-card-section>
  </q-card>
</template>

<script setup>
import {inject, ref, onMounted, computed, watch} from "vue";
import {getStoredEventIndex} from "components/functions/EventFunctions.js"


const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "eventIndex": {
    type: Number,
    required: true
  },
  "eventIdentifier": {
    type: String,
    required: true
  },
  "eventVariableIndex": {
    type: Number,
    required: true
  },
  "name": {
    type: String,
    required: false
  }
})

const name = 'EventVariableRaw'
const label = props.name ? props.name : "Event Variable " + props.eventVariableIndex
const store = inject('store')
const error = ref(false)
const error_message = ref('')
const eventValue = ref()

const eventVariableValue = computed(() => {
  var value
  try {
  // get position in array - it may have changed
  var key = getStoredEventIndex(store, props.nodeNumber, props.eventIdentifier)
//  console.log(name +': eventVariableValue: index ' + key)
  // get value 
  value = store.state.nodes[props.nodeNumber].storedEvents[key].variables[props.eventVariableIndex]
  } catch (err){
//    console.log(name +': eventVariableValue ' + err) 
  }
  return value 
})


watch(eventVariableValue, () => {
  eventValue.value = eventVariableValue.value
  console.log(name +': watch eventVariableValue')
})


const update_event = (newValue) => {
  if (newValue < 0 || newValue > 255 ||newValue =='') {
    error.value = true
    error_message.value = 'Invalid Value'
  } else {
    error_message.value = ''
    error.value = false
    store.methods.event_teach_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex, newValue)
  }
}

onMounted(() => {
  eventValue.value = store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].variables[props.eventVariableIndex]
  console.log(name +': onMounted: eventValue ' + eventValue.value)
})

</script>

<style scoped>

</style>
