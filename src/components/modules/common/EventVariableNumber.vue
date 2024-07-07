<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <q-input
        mask="###"
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
  "displayTitle": {
    type: String,
    required: false
  },
  "displaySubTitle": {
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
  "startBit":{
    type: Number,
    default: 0
  },
  "endBit":{
    type: Number,
    default: 7
  },
  "displayOffset":{
    type: Number,
    default: 0
  }
})

const label = props.name ? props.name : "Event Variable " + props.eventVariableIndex
const store = inject('store')
const error = ref(false)
const error_message = ref('')
const eventValue = ref()
//console.log(`EventVariableNumber: Props : ${JSON.stringify(props)}`)
const bitMask = computed(() => {
  var bitMask = 0;
  for (var i=props.startBit; i<= props.endBit; i++){
    bitMask += 1<<i;
  }
  return bitMask;
})
console.log(`EventVariableNumber: bitMask2 : ${bitMask.value}`)


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
//eventValue.value = ((eventVariableValue.value & bitMask.value) >> props.startBit) + props.displayOffset
eventValue.value = ((eventVariableValue.value & bitMask.value) >> props.startBit)  + props.displayOffset
})

const update_event = (newValue) => {

  // get previous value, as starting point for updated byte value
  let byteValue = eventVariableValue.value

  let processedValue = newValue                           // take a copy to change
  processedValue -= props.displayOffset                   // remove display offset

  if (processedValue < props.min || processedValue > props.max ||newValue =='') {
    error.value = true
    error_message.value = 'Invalid Value ' + newValue + ' : Valid Range ' + (props.min + props.displayOffset) + ' - ' + (props.max + props.displayOffset)
  } else {
    processedValue = processedValue << props.startBit       // shift to position in variable

    //set bits, but only if they match bits in the bitmask
    byteValue = byteValue | (processedValue & bitMask.value)							// set bit by 'or-ing' bit value
    // clear bits, but only if they match bits in the bitmask
    byteValue = byteValue & (processedValue | ~bitMask.value)							// clear bit by 'and-ing' inverse bit value

    error_message.value = ''
    error.value = false
    //store.methods.update_event_variable(props.nodeNumber, eventIdentifier, props.eventIndex, props.eventVariableIndex, byteValue)
    store.methods.event_teach_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex, byteValue)
  }
}


onMounted(() => {
  console.log(`EventVariableNumber: onMounted`)
//  let startValue = store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].variables[props.eventVariableIndex]
//  eventValue.value = ((startValue  & bitMask.value)  >> props.startBit) + props.displayOffset
  //eventValue.value = ((startValue & bitMask.value) >> props.startBit) + props.displayOffset
})

</script>

<style scoped>

</style>
