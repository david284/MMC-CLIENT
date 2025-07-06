<template>
  <q-card class="q-ma-xs no-padding" style ="min-width: 100px;">
    <q-card-section class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}
        <q-card-section style ="min-width: 10px; height: 10px" class="no-margin no-padding float-right text-caption text-weight-thin">
          &nbsp; {{ nodeVariableIndex }}
        </q-card-section>
      </div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <div v-for="button in newButtonCollection" :key="button" class="no-margin q-pb-xs">
        <q-btn dense size="sm" color="blue" v-bind:label="button.label" @click="clickButton(button.value)" no-caps/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>

import { inject, onMounted, ref, computed, watch } from "vue";
import {getLinkedNodeVariables} from "components/modules/common/commonFunctions.js"
import {overloadedLabel} from "components/modules/common/CommonLogicParsers.js";

const name = 'NodeVariableButtons'
const store = inject('store')
var newButtonCollection = ref()

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
  "buttonCollection" : {
    required:true
  },
  "configuration": {
    type: Object,
    required: true
  }
})

// need this to update overloaded labels if other variables change
//
const variables = computed(() =>{
  return store.state.nodes[props.nodeNumber].nodeVariables
})

// need this to update overloaded labels if other variables change
//
watch(variables, () => {
  refreshArray();
})

//
//
onMounted(() => {
  //console.log(name + `: onMounted`)
  refreshArray();
})

//
//
function refreshArray() {
  //console.log(name + `: refresh`)
  newButtonCollection.value = []
  for (var i in props.buttonCollection){
    if (props.buttonCollection[i].overload){
      var label = overloadedLabel(props.nodeNumber, props.buttonCollection[i].overload, store)
      if (label) {
        var entry = {"value": props.buttonCollection[i].value, "label": label}
        newButtonCollection.value.push(entry)
      }
    } else if (props.buttonCollection[i].label){
      newButtonCollection.value.push(props.buttonCollection[i])
    }
  }
}

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickButton = (newByteValue) => {
  console.log(name + `: clickButton : ` + newByteValue)
  store.methods.update_node_variable(
    props.nodeNumber,
    props.nodeVariableIndex,
    newByteValue,
    false,
    getLinkedNodeVariables(props.configuration)
  )
}


</script>

<style scoped>

</style>
