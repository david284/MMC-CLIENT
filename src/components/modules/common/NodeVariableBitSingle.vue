<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="min-width:120px; height: 120px;" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}
        <q-card-section style ="min-width: 10px; height: 10px" class="no-margin no-padding float-right text-caption">
            {{ variableIndex }}
        </q-card-section>
      </div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <node-variable-bit
        :nodeNumber = nodeNumber
        :variableIndex = variableIndex
        :bit = bit
        :configuration = configuration
      >
      </node-variable-bit>
    </q-card-section>

  </q-card>
</template>


<script setup>

//
// Note this doesn't use the label property of NodeVariableBit
// as it already has a title and sub title
//


import NodeVariableBit from "components/modules/common/NodeVariableBit"

import {inject} from "vue";
import {onMounted} from "vue";

const store = inject('store')
const name = "NodeVariableBitSingle"

const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "variableIndex": {
    type: Number,
    required: true
  },
  "displayTitle": {
    type: String,
    required: false
  },
  "displaySubTitle": {
    type: String,
    default: ""
  },
  "bit": {
    type: Number,
    required: true
  },
  "configuration": {
    type: Object,
    required: true
  }
})


onMounted(() => {
//  console.log(name + `: onMounted`)
})
</script>

<style scoped>

</style>
