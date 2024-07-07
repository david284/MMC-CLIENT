<template>
  <q-card class="q-ma-xs no-padding">

    <q-card-section class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <div v-for="item in bitCollection" :key="item">
        <event-variable-bit
          :nodeNumber=nodeNumber
          :eventVariableIndex=eventVariableIndex
          :eventIndex=eventIndex
          :eventIdentifier=eventIdentifier
          :bit=item.bitPosition
          :name=item.label
        ></event-variable-bit>
      </div>
     </q-card-section>
 
  </q-card>
</template>

<script setup>
import EventVariableBit from "components/modules/common/EventVariableBit"

import { inject, onMounted } from "vue";
const store = inject('store')

const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "eventIndex": {
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
  bitCollection: {
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
  "learn": {
    type: Boolean,
    default: false
  }
})



onMounted(() => {
//  console.log(`EventVariableBitArray onMounted:`)
//  console.log(`EventVariableBitArray: props: ${JSON.stringify(props)}`)
})


</script>

<style scoped>

</style>
