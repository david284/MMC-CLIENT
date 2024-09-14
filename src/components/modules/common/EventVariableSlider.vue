<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <q-badge color="secondary">
        {{ displayValue }} {{ displayUnits }}
      </q-badge>
      <q-slider
        v-model="sliderValue"
        :max="max"
        :min="min"
        @change="update_variable"
      >
      </q-slider>
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
  "displayScale": {
    type: Number,
    default: 1
  },
  "displayUnits": {
    type: String,
    default: ""
  },
  "displayOffset":{
    type: Number,
    default: 0
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
  }
})

const name = "EventVariableSlider"
const store = inject('store')
const error = ref(false)
const error_message = ref('')
//console.log(`EventVariableSlider Props : ${JSON.stringify(props)}`)
const bitMask = computed(() => {
  var bitMask = 0;
  for (var i=props.startBit; i<= props.endBit; i++){
    bitMask += 1<<i;
  }
  return bitMask;
})
// console.log(name +`: bitMask : ${bitMask.value}`)

const displayValue = computed(() =>{
  var value = (sliderValue.value * props.displayScale) + props.displayOffset
  if (props.displayScale >= 1){
    // do nothing, value will be good
  } else if (props.displayScale >= 0.1){
    value = value.toFixed(1)
  } else if (props.displayScale >= 0.01){
    value = value.toFixed(2)
  } else {
    // don't show more than 3 decimal places
    value = value.toFixed(3)
  }
  return value
})

const sliderValue = computed({
  get() {
    return ((store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex) & bitMask.value) >> props.startBit)
  },
  set(newValue) {
    // get previous value, as starting point for updated byte value
    let newByteValue = store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex)
//    console.log(name +`: OldByteValue : ${newByteValue}`)
//    console.log(name + `: NewValue : ${newValue}`)
    // not sure we need to do a range check as the slider control uses max & min anyway...
    if (newValue <= props.max && newValue >= props.min) {
//      console.log(name + `: update_variable : ${newValue}`)
      let processedValue = newValue                           // take a copy to change
      processedValue = processedValue << props.startBit       // shift to position in variable
      //set bits, but only if they match bits in the bitmask
      newByteValue = newByteValue | (processedValue & bitMask.value)							// set bit by 'or-ing' bit value
      // clear bits, but only if they match bits in the bitmask
      newByteValue = newByteValue & (processedValue | ~bitMask.value)							// clear bit by 'and-ing' inverse bit value

      error.value = false
      error_message.value = ''
      store.methods.event_teach_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex, newByteValue)
    } else {
      console.log(name + `: Invalid Value : ${newValue}`)
      error_message.value = 'Invalid Value'
      error.value = true
    }
  }
})

const update_variable = (newValue) => {
  if (error.value) {
    console.log(name + `: Invalid Value : ${newValue}`)
  } else {
//    console.log(name + `: update slider value : ${newValue}`)
  }
}

onMounted(() => {
//  console.log(name + `: EventVariableSlider onMounted`)
})

</script>

<style scoped>

</style>
