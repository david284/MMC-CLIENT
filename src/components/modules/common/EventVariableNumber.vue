<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}
        <q-card-section style ="min-width: 10px; height: 10px" class="no-margin no-padding float-right text-caption text-weight-thin">
          &nbsp; {{ eventVariableIndex }}
        </q-card-section>
      </div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <q-badge color="secondary">
        range {{ minValue }} to {{ maxValue }} {{ displayUnits }}
      </q-badge>
      <q-input
        class="ev_input_box"
        :mask="displayMask"
        debounce="10"
        dense
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
import {setByteVariable} from "components/modules/common/commonFunctions.js"
import {getDisplayValue} from "components/modules/common/commonFunctions.js"
import {getLinkedEventVariables} from "components/modules/common/commonFunctions.js"

const name = "EventVariableNumber"

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
  "displayTitle": {
    type: String,
    required: false
  },
  "displaySubTitle": {
    type: String,
    required: false
  },
  "displayOffset": {
    type: Number,
    required: false,
    default: 0
  },
  "displayScale": {
    type: Number,
    required: false,
    default: 1
  },
  "displayUnits": {
    type: String,
    default: ""
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
  "configuration": {
    type: Object,
    required: true
  }
})

const store = inject('store')
const error = ref(false)
const error_message = ref('')
const eventValue = ref()
//console.log(name + `: Props : ${JSON.stringify(props)}`)

const displayMask = computed(() => {
  let MaxValue = 255* props.displayScale + props.displayOffset
  if(MaxValue > 100000) {
    return '######'
  } 
  if(MaxValue > 10000) {
    return '#####'
  } 
  else if (MaxValue > 1000) {
    return '####'
  }
  else {
    return '###'
  }
 })

 const minValue = computed(() => {
  return (props.min * props.displayScale) + props.displayOffset
 })

 const maxValue = computed(() => {
  return (props.max * props.displayScale) + props.displayOffset
 })


const eventVariableValue = computed(() => {
  return store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex)
})

watch(eventVariableValue, () => {
  eventValue.value = getDisplayValue(eventVariableValue.value, 
    props.displayScale, 
    props.displayOffset, 
    props.startBit, 
    props.endBit)
})

const update_event = (newValue) => {
  // get previous value, as starting point for updated byte value
  let byteValue = eventVariableValue.value
  let processedValue = Number(newValue)            // take a copy to change

  // max & min are the max & min of the values in the byte variable value
  // so need to scale up to check the display value actually used
  if (processedValue < minValue.value){
    error.value = true
    error_message.value = 'Value less than ' + minValue.value
  }
  else if (processedValue > maxValue.value) {
    error.value = true
    error_message.value = 'Value more than ' + maxValue.value
  } 
  else {
    byteValue = setByteVariable(byteValue, processedValue, props.displayScale, props.displayOffset, props.startBit, props.endBit)
    error_message.value = ''
    error.value = false
    store.methods.event_teach_by_identifier(
      props.nodeNumber, 
      props.eventIdentifier, 
      props.eventVariableIndex, 
      byteValue,
      true,
      getLinkedEventVariables(props.configuration)
    )
  }
  // update display value
  eventValue.value = getDisplayValue(eventVariableValue.value, 
    props.displayScale, 
    props.displayOffset, 
    props.startBit, 
    props.endBit)
}


onMounted(() => {
//  console.log(name + `: onMounted`)
  let startValue = store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex)
  eventValue.value = getDisplayValue(eventVariableValue.value, 
    props.displayScale, 
    props.displayOffset, 
    props.startBit, 
    props.endBit)
})

</script>

<style scoped>
:deep(.ev_input_box .q-field__control),
:deep(.ev_input_box .q-field__marginal) {
  height: 32px;
  width: 80px;
  font-size: 16px;
}

</style>
