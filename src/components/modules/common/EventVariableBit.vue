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


const eventVariableValue = computed(() => {
  return store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex)
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
  store.methods.event_teach_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex, byteValue)
}

//console.log(`EventVariableBit ` + eventVariableValue.value)

onMounted(() => {
  var initial_value = store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex)
  checked.value = initial_value & bitArray[props.bit] ? true : false
})

</script>

<style scoped>

</style>
