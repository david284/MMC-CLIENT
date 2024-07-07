<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <EventVariableBit
        :nodeNumber=nodeNumber
        :eventIndex=eventIndex
        :eventIdentifier=eventIdentifier
        :eventVariableIndex=eventVariableIndex
        :bit=bit
      >
      </EventVariableBit>
    </q-card-section>

  </q-card>
</template>

<script setup>
import EventVariableBit from "components/modules/common/EventVariableBit"
import {inject} from "vue";
import {onMounted} from "vue";

const store = inject('store')

const props = defineProps({
  "nodeNumber":{
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
  }
})

onMounted(() => {
//  console.log(`EventVariableBit onMounted`)
})

</script>

<style scoped>

</style>
