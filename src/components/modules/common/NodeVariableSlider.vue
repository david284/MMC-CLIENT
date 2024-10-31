style="min-width: 350px; min-height: 200px;"
<template>
  <q-card class="q-ma-xs no-padding" style ="min-width: 200px;">
    <q-card-section :style="cardHeight" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <q-badge color="secondary">
        {{ displayValue }} {{ displayUnits }}
      </q-badge>
      <q-slider
        :model-value="sliderValue"
        :max="max"
        :min="min"
        @change="val => { sliderValue = val }"
      >
      </q-slider>

      <q-card flat class = "row no-margin q-py-none">
        <q-card-section align="left" flat class = "row no-margin q-pa-none">
          <q-btn align="left" dense color="blue" icon="remove" size="sm" @click="clickNegative()" no-caps/>
        </q-card-section>
        <q-space />
        <q-card-section align="left" flat class = "row no-margin q-pa-none">
          <q-btn align="left" dense color="blue" label = "-5" size="sm" @click="clickNegative5()" no-caps/>
        </q-card-section>
        <q-space />
        <q-space />
        <q-space />
        <q-card-section flat class = "row no-margin q-pa-none">
          <div v-if="(outputOnWrite)">
            <q-btn dense size="sm" label="Test" @click="clickTest()" no-caps/>
          </div>
        </q-card-section>
        <q-space />
        <q-space />
        <q-space />
        <q-card-section align="right" flat class = "row no-margin q-pa-none">
          <q-btn align="right" dense color="blue" label="+5" size="sm" @click="clickPositive5()" no-caps/>
        </q-card-section>
        <q-space />
        <q-card-section align="right" flat class = "row no-margin q-pa-none">
          <q-btn align="right" dense color="blue" icon="add" size="sm" @click="clickPositive()" no-caps/>
        </q-card-section>
      </q-card>

    </q-card-section>
  </q-card>
</template>

<script setup>
import {inject, ref, onMounted, computed, onUpdated, watch} from "vue";
const name = 'NodeVariableSlider'

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
  },
  "configuration": {
    type: Object
  }
})

//console.log(name + `: configuration : ` + JSON.stringify(props.configuration))
//console.log(`Node Variable : ` + props.nodeNumber)
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
// get previous value, as starting point for updated byte value
let newByteValue = store.state.nodes[props.nodeNumber].nodeVariables[props.nodeVariableIndex]
// console.log(`NodeVariableSlider: bitMask : ${bitMask.value}`)

const cardHeight = computed(() => {
  if(outputOnWrite.value) {
   return{ height: '150px' }
  } else {
    return{ height: '150px' }
  }
 })

const outputOnWrite = computed(() =>{
  var result = false
  if (props){
  result =  props.configuration.outputOnWrite ? true : false
  }
  return result
})
// console.log(name + `: computed outputOnWrite: ` + outputOnWrite.value)

watch(outputOnWrite, () => {
//  console.log(name + `: WATCH outputOnWrite: ` + outputOnWrite.value)
})

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
    return ((store.state.nodes[props.nodeNumber].nodeVariables[props.nodeVariableIndex] & bitMask.value) >> props.startBit)
  },
  set(newValue) {
//    console.log(`OldByteValue : ${newByteValue}`)
    // not sure we need to do a range check as the slider control uses max & min anyway...
    if (newValue <= props.max && newValue >= props.min) {
//      console.log(`update_variable : ${newValue}`)
      let processedValue = newValue                           // take a copy to change
      processedValue = processedValue << props.startBit       // shift to position in variable
      //set bits, but only if they match bits in the bitmask
      newByteValue = newByteValue | (processedValue & bitMask.value)							// set bit by 'or-ing' bit value
      // clear bits, but only if they match bits in the bitmask
      newByteValue = newByteValue & (processedValue | ~bitMask.value)							// clear bit by 'and-ing' inverse bit value

      error.value = false
      error_message.value = ''
      store.methods.update_node_variable(props.nodeNumber, props.nodeVariableIndex, newByteValue)
//      console.log(`NewByteValue : ${newByteValue}`)
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
//    console.log(`update_variable : ${newValue}`)
  }
}

onUpdated(() =>{
})

onMounted(() => {
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickNegative = () => {
  console.log(name + `: clickNegative`)
  if (sliderValue.value >0){
    sliderValue.value--
  }
}

const clickNegative5 = () => {
  console.log(name + `: clickNegative`)
  if (sliderValue.value >5){
    sliderValue.value -= 5
  } else{
    sliderValue.value = 0
  }
}

const clickPositive = () => {
  console.log(name + `: clickPositive`)
  if (sliderValue.value <255){
    sliderValue.value++
  }
}

const clickPositive5 = () => {
  console.log(name + `: clickPositive`)
  if (sliderValue.value <250){
    sliderValue.value += 5
  } else {
    sliderValue.value = 255
  }
}

const clickTest = () => {
  console.log(name + `: clickTest`)
  store.methods.update_node_variable(props.nodeNumber, props.nodeVariableIndex, newByteValue)
}



</script>

<style scoped>

</style>
