<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}
        <q-card-section style ="min-width: 10px; height: 10px" class="no-margin no-padding float-right text-caption text-weight-thin">
          &nbsp; {{ eventVariableIndex }}
        </q-card-section>
      </div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <EventVariableBit
        :nodeNumber=nodeNumber
        :eventIdentifier=eventIdentifier
        :eventVariableIndex=eventVariableIndex
        :bit=bit
        :configuration=configuration
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
  },
  configuration: {
    type: Object,
    required: true
  }
})

onMounted(() => {
//  console.log(`EventVariableBit onMounted`)
})

</script>

<style scoped>

</style>
