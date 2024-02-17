<template>
  <q-card  class="q-ma-xs no-padding" flat>
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ Title }}</div>
      <div class="text-subtitle2">{{ Description }}</div>
      <q-input
        mask="###"
        :label="label"
        debounce="1000"
        :hint="hint"
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

//name: "EventVariable"
const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "eventIndex": {
    type: Number,
    required: true
  },
  "eventVariableIndex": {
    type: Number,
    required: true
  },
  "Title": {
    type: String,
    required: false
  },
  "Description": {
    type: String,
    required: false
  },
  "name": {
    type: String,
    required: false
  },
  "max": {
    type: Number,
    default: 255
  },
  "min": {
    type: Number,
    default: 0
  },
  "hint": {
    type: String,
    default: ""
  }
})

const label = props.name ? props.name : "Event Variable " + props.eventVariableIndex
const store = inject('store')
const error = ref(false)
const error_message = ref('')
const eventValue = ref()
let eventIdentifier = store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].eventIdentifier
console.log(`Event Variable Props : ${JSON.stringify(props)}`)


const eventVariableValue = computed(() => {
  return store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].variables[props.eventVariableIndex]
})


watch(eventVariableValue, () => {
eventValue.value = eventVariableValue.value
})

const update_event = (newValue) => {
  if (newValue < props.min || newValue > props.max ||newValue =='') {
    //console.log(`Invalid Value : ${newValue}`)
    error.value = true
    error_message.value = 'Invalid Value'
  } else {
    //console.log(`Valid Value : ${newValue}`)
    error_message.value = ''
    error.value = false
    store.methods.update_event_variable(props.nodeNumber, eventIdentifier, props.eventIndex, props.eventVariableIndex, newValue)
  }
}

//console.log(`EventVariable` + eventVariableValue.value)

onMounted(() => {
  //console.log(`EventVariable onMounted` + props.nodeNumber + ' : ' + props.eventIndex + ' : ' + props.eventVariableIndex)
  eventValue.value = store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].variables[props.eventVariableIndex]
})

</script>

<style scoped>

</style>
