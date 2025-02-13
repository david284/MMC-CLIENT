<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
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
import {overloadedLabel} from "components/modules/common/CommonLogicParsers.js";
import {getLinkedEventVariables} from "components/modules/common/commonFunctions.js"

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
  "displayTitle": {
    type: String,
    required: false
  },
  "displaySubTitle": {
    type: String,
    required: false
  },
  configuration: {
    type: Object,
    required: true
  }
})

const name = "EventVariableSelect"
const label = props.name ? props.name : "Variable" + props.eventVariableIndex
const store = inject('store')
const selectVariable = ref()
var items = ref();

const variableValue = computed(() =>{
  return store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex)
})

watch(variableValue, () => {
  selectVariable.value = variableValue.value & props.bitMask
})

const update_variable = (newValue) => {
//  console.log(name +`: newValue ${newValue.value}`);
  
  // get previous value
  let byteValue = variableValue.value
  //set bits, but only if they match bits in the bitmask
  byteValue = byteValue | (newValue.value & props.bitMask)							// set bit by 'or-ing' bit value
  // clear bits, but only if they match bits in the bitmask
  byteValue = byteValue & (newValue.value | ~props.bitMask)							// clear bit by 'and-ing' inverse bit value

  console.log(`EventVariableSelect: byteValue ${byteValue}`);
  
  store.methods.event_teach_by_identifier(
    props.nodeNumber, 
    props.eventIdentifier, 
    props.eventVariableIndex, 
    byteValue,
    true,
    getLinkedEventVariables(props.configuration)
  )
}

onMounted(() => {
//  console.log(name + `: onMounted`)
  let startValue = store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex)
  selectVariable.value = startValue & props.bitMask
//  console.log(name + `: props: ${JSON.stringify(props)}`)
  items.value = []
  for (var i in props.options){
//    console.log(name + `: ComplexSelect: item: ${i}`)
    if (props.options[i].overload != undefined) {   
      var label = overloadedLabel(props.nodeNumber, props.options[i].overload, store) 
      if (label) {
        var entry = {"value": props.options[i].value, "label": label}
        items.value.push(entry)
      }
    } else if(props.options[i].label != undefined){
      items.value.push(props.options[i])
    }
  }
//  console.log(name + `: items: ${JSON.stringify(items.value)}`)
})


</script>

<style scoped>

</style>
