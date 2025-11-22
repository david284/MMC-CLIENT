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
        reverse-fill-mask
        debounce="10"
        dense
        v-model="eventValue"
        outlined
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
import * as EventFunctions from "components/functions/EventFunctions.js"

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
  "eventIndex": {
    type: Number,
    default: 0
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
const eventValue = ref()
//console.log(name + `: Props : ${JSON.stringify(props)}`)

//
//
const displayMask = computed(() => {
  let MaxValue = 255* props.displayScale + props.displayOffset
  if (MaxValue > 100000) { return '######' }
  if (MaxValue > 10000) { return '#####' }
  if (MaxValue > 1000) { return '####' }
  if (MaxValue > 100) { return '###' }
  if (MaxValue > 10) { return '##.#' }
  if (MaxValue > 1) { return '#.##' }
  return '.###'
 })

 //
 //
 const minValue = computed(() => {
  let fixed = 0
  if (props.displayScale < 1){ fixed = 1 }
  if (props.displayScale < 0.1){ fixed = 2 }
  if (props.displayScale < 0.01){ fixed = 3 }
  return ((props.min * props.displayScale) + props.displayOffset).toFixed(fixed)
 })

 //
 //
 const maxValue = computed(() => {
  let value = 0
  try {
    // work out how many decimal points the result should be
    let fixed = 0
    if (props.displayScale < 1){ fixed = 1 }
    if (props.displayScale < 0.1){ fixed = 2 }
    if (props.displayScale < 0.01){ fixed = 3 }
    // work out max value from number of bits
    let maxFromBits = (2 ** (props.endBit - props.startBit + 1) - 1)
    // work out which max value to use
    let maxRawvalue = ( props.max < maxFromBits) ? props.max : maxFromBits
    // work out scaled max value with any offset, to required decimal places
    value = ((maxRawvalue * props.displayScale) + props.displayOffset).toFixed(fixed)
    //console.log (name + `: maxValue ${value} ${props.max} ${maxFromBits}`)
  } catch {}
  return value
 })

const eventVariableValue = computed(() => {
  return EventFunctions.getEventVariable(store, props.nodeNumber, props.eventIdentifier, props.eventIndex, props.eventVariableIndex)
  //return store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex)
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

  // check newValue against max & min display limits
  if (processedValue < minValue.value){ processedValue = minValue.value }
  if (processedValue > maxValue.value) { processedValue = maxValue.value }
  //
  byteValue = setByteVariable(
    byteValue,
    processedValue,
    props.displayScale,
    props.displayOffset,
    props.startBit,
    props.endBit
  )

  EventFunctions.eventTeach(
    store,
    props.nodeNumber,
    props.eventIdentifier,
    props.eventIndex,
    props.eventVariableIndex,
    byteValue,
    true,
    getLinkedEventVariables(props.configuration)
  )

  // update display value
  eventValue.value = getDisplayValue(eventVariableValue.value,
    props.displayScale,
    props.displayOffset,
    props.startBit,
    props.endBit
  )
}


onMounted(() => {
//  console.log(name + `: onMounted`)
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
