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
  "name": {
    type: String,
    required: false
  }
})

const label = props.name ? props.name : "Event Variable " + props.eventVariableIndex
const store = inject('store')
const error = ref(false)
const error_message = ref('')
const eventValue = ref()
let eventIdentifier = store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].eventIdentifier


const eventVariableValue = computed(() => {
  return store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].variables[props.eventVariableIndex]
})


watch(eventVariableValue, () => {
eventValue.value = eventVariableValue.value
})

const update_event = (newValue) => {
  if (newValue < 0 || newValue > 255 ||newValue =='') {
    error.value = true
    error_message.value = 'Invalid Value'
  } else {
    error_message.value = ''
    error.value = false
    store.methods.update_event_variable(props.nodeNumber, eventIdentifier, props.eventIndex, props.eventVariableIndex, newValue)
  }
}


onMounted(() => {
  eventValue.value = store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].variables[props.eventVariableIndex]
})

</script>

<style scoped>

</style>
