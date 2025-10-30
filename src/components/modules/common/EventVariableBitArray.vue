<template>
  <q-card class="q-ma-xs no-padding" style ="min-width: 100px;">
    <q-card-section class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}
        <q-card-section style ="min-width: 10px; height: 10px" class="no-margin no-padding float-right text-caption text-weight-thin">
          &nbsp; {{ eventVariableIndex }}
        </q-card-section>
      </div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <q-card-section class="no-margin no-padding">
        <div v-for="item in bitCollection" :key="item">
          <event-variable-bit
            :nodeNumber=nodeNumber
            :eventVariableIndex=eventVariableIndex
            :eventIdentifier=eventIdentifier
            :eventIndex=eventIndex
            :bit=item.bitPosition
            :label=item.label
            :configuration=configuration
          ></event-variable-bit>
        </div>
      </q-card-section>
     </q-card-section>

  </q-card>
</template>

<script setup>
import EventVariableBit from "components/modules/common/EventVariableBit"

import { inject, onMounted } from "vue";
const store = inject('store')

const props = defineProps({
  nodeNumber: { type: Number, required: true },
  eventIdentifier: { type: String, required: true },
  eventIndex: {type: Number, required: true },
  eventVariableIndex: { type: Number, required: true },
  bitCollection: { required: true },
  displayTitle: { type: String, required: false },
  displaySubTitle: { type: String, default: "" },
  configuration: { type: Object, required: true }
})



onMounted(() => {
//  console.log(`EventVariableBitArray onMounted:`)
//  console.log(`EventVariableBitArray: props: ${JSON.stringify(props)}`)
})


</script>

<style scoped>

</style>
