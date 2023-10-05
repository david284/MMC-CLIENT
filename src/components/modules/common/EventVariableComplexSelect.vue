<template>
  <q-card class="q-pm-none">
    <q-card-section>
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
    <q-select
      v-model="selectVariable"
      :options=items
      popup-content-class="q-pm-none"
      map-options
      @update:model-value="update_variable"
    >
    </q-select>
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
  "bitMask": {
    type: Number,
    default: 255
  },
  "name": {
    type: String,
    required: false
  },
  "options": {
    required: true
  },
  "hint": {
    type: String,
    default: ""
  },
  "displayTitle": {
    type: String,
    required: false
  },
  "displaySubTitle": {
    type: String,
    required: false
  }
})

const label = props.name ? props.name : "Variable" + props.eventVariableIndex
const store = inject('store')
const selectVariable = ref()
let eventIdentifier = store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].eventIdentifier

var x =   {"value": 0, "label": "no event (0)"}

var items = ref();

const variableValue = computed(() =>{
  return store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex].variables[props.eventVariableIndex]
})

watch(variableValue, () => {
  selectVariable.value = variableValue.value & props.bitMask
})

const update_variable = (newValue) => {
  console.log(`EventVariableComplexSelect: newValue ${newValue.value}`);

  
  // get previous value
  let byteValue = variableValue.value
  //set bits, but only if they match bits in the bitmask
  byteValue = byteValue | (newValue.value & props.bitMask)							// set bit by 'or-ing' bit value
  // clear bits, but only if they match bits in the bitmask
  byteValue = byteValue & (newValue.value | ~props.bitMask)							// clear bit by 'and-ing' inverse bit value

  console.log(`EventVariableComplexSelect: byteValue ${byteValue}`);
  
  store.methods.update_event_variable(props.nodeNumber, eventIdentifier, props.eventIndex, props.eventVariableIndex, byteValue)
}

onMounted(() => {
  console.log(`EventVariableComplexSelect: onMounted`)
  selectVariable.value = variableValue.value & props.bitMask
  console.log(`EventVariableComplexSelect: props: ${JSON.stringify(props)}`)

  items.value = []
  for (var i in props.options){
    console.log(`EventVariableComplexSelect: item: ${i}`)
    if (props.options[i].complexSelector_NV != undefined) {    
      var result = process(props.options[i])
      if (result) {items.value.push(result)}
    } else {
      items.value.push(props.options[i])
    }
  }
  console.log(`EventVariableComplexSelect: items: ${JSON.stringify(items.value)}`)
})

const process = (item) => {
  var nv = item.complexSelector_NV
  var value = store.state.nodes[store.state.selected_node].nodeVariables[nv]
  console.log(`EventVariableComplexSelect: nv value: ${value}`)
  var x = undefined
  for (var i in item.complexOptions){
    if (value == item.complexOptions[i].value){
      var x = {"value": item.value, "label": item.complexOptions[i].label}
    }
  }
  console.log(`EventVariableComplexSelect: process: ${JSON.stringify(x)}`)
  return x
}


</script>

<style scoped>

</style>
