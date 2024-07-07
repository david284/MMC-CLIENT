<template>
  <q-checkbox min-width="100"
              v-model="checked"
              :label="name"
              @click = "update_checked"
              left-label
  ></q-checkbox>
</template>

<script setup>
import {inject, ref, onMounted, computed, watch} from "vue";
import {getStoredEventIndex} from "components/functions/EventFunctions.js"

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
  "eventIdentifier": {
    type: String,
    required: true
  },
  "eventVariableIndex": {
    type: Number,
    required: true
  },
  "bit": {
    type: Number,
    required: true
  },
  "name": {
    type: String,
    required: false
  },
  "hint": {
    type: String,
    default: ""
  }
})

const label = props.name ? props.name : "Event Variable " + props.eventVariableIndex
const store = inject('store')

const bitArray = {0: 1, 1: 2, 2: 4, 3: 8, 4: 16, 5: 32, 6: 64, 7: 128}
const checked = ref(false)

//console.log(`eventIdentifier ${props.nodeNumber} ${props.eventIndex} ${props.eventVariableIndex}`)
let eventIdentifier = store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].eventIdentifier
//console.log(`EventVariableBit: eventIdentifier: ${eventIdentifier}`)
//console.log(`EventVariableBit: props: ${JSON.stringify(props)}`)


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
  checked.value = eventVariableValue.value & bitArray[props.bit] ? true : false
})

const update_checked = () => {

  let byteValue = eventVariableValue.value
  console.log(`EventVariableBit update_checked ${checked.value} ${byteValue}`)
  if (checked.value) {
    byteValue = byteValue | bitArray[props.bit]										// set bit by 'or-ing' bit value
  } else {
    byteValue = byteValue & ~bitArray[props.bit]									// clear bit by 'and-ing' inverse bit value
  }
  console.log(`EventVariableBit update_checked-2 ${checked.value} ${byteValue}`)
  //store.methods.update_node_variable(props.NodeNumber, props.VariableIndex, byteValue)
//  store.methods.update_event_variable(props.nodeNumber, eventIdentifier, props.eventIndex, props.eventVariableIndex, byteValue)
  store.methods.event_teach_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex, byteValue)
}

//console.log(`EventVariableBit ` + eventVariableValue.value)

onMounted(() => {
  //console.log(`NodeVariableBit onMounted: `+store.state.nodes[props.NodeNumber].nodeVariables[props.VariableIndex])
  const checked_value = store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].variables[props.eventVariableIndex] & bitArray[props.bit] ? true : false
  //this.checked.set( store.state.nodes[props.NodeNumber].nodeVariables[props.VariableIndex] & bitArray[props.Bit] ? true : false)
  //console.log(`EventVariableBit onMounted: Checked ${props.nodeNumber} ${checked_value}`)
  checked.value = checked_value
})

</script>

<style scoped>

</style>
