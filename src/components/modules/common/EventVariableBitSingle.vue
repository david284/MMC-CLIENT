<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <EventVariableBit
        :nodeNumber="store.state.selected_node"
        :eventIndex=eventIndex
        :eventVariableIndex=eventVariableIndex
        :bit=bit
        :name="name"
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
  "eventIndex": {
    type: Number,
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
  },
  "name": {
    type: String,
    required: false
  }
})

onMounted(() => {
//  console.log(`EventVariableBit onMounted`)
})

</script>

<style scoped>

</style>
