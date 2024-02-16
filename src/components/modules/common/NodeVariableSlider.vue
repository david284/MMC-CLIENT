<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <q-badge color="secondary">
        {{ (sliderValue * displayScale) + displayOffset }} {{ displayUnits }}
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
import {inject, ref, onMounted, computed} from "vue";

const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "nodeVariableIndex": {
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

console.log(`Node Variable : ` + props.nodeNumber)
const label = props.name ? props.name : "Variable" + props.nodeVariableIndex
const store = inject('store')
const error = ref(false)
const error_message = ref('')
const bitMask = computed(() => {
  var bitMask = 0;
  for (var i=props.startBit; i<= props.endBit; i++){
    bitMask += 1<<i;
  }
  return bitMask;
})
console.log(`NodeVariableSlider: bitMask : ${bitMask.value}`)

const sliderValue = computed({
  get() {
    return ((store.state.nodes[props.nodeNumber].nodeVariables[props.nodeVariableIndex] & bitMask.value) >> props.startBit)
  },
  set(newValue) {
    // get previous value, as starting point for updated byte value
    let newByteValue = store.state.nodes[props.nodeNumber].nodeVariables[props.nodeVariableIndex]
    console.log(`OldByteValue : ${newByteValue}`)
    // not sure we need to do a range check as the slider control uses max & min anyway...
    if (newValue <= props.max && newValue >= props.min) {
      console.log(`update_variable : ${newValue}`)
      let processedValue = newValue                           // take a copy to change
      processedValue = processedValue << props.startBit       // shift to position in variable
      //set bits, but only if they match bits in the bitmask
      newByteValue = newByteValue | (processedValue & bitMask.value)							// set bit by 'or-ing' bit value
      // clear bits, but only if they match bits in the bitmask
      newByteValue = newByteValue & (processedValue | ~bitMask.value)							// clear bit by 'and-ing' inverse bit value

      error.value = false
      error_message.value = ''
      store.methods.update_node_variable(props.nodeNumber, props.nodeVariableIndex, newByteValue)
      console.log(`NewByteValue : ${newByteValue}`)
    } else {
      console.log(`Invalid Value : ${newValue}`)
      error_message.value = 'Invalid Value'
      error.value = true
    }
  }
})

const update_variable = (newValue) => {
  if (error.value) {
    console.log(`Invalid Value : ${newValue}`)
  } else {
    console.log(`update_variable : ${newValue}`)
  }
}

onMounted(() => {
  console.log(`NodeVariableSlider`)
})


</script>

<style scoped>

</style>
