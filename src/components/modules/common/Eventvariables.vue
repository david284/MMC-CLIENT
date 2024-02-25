<template>
  <div class="q-pa-xs row">

    <div v-for="item in configuration" :key="item">
      <EventVariableBitArray v-if="(item.type=='EventVariableBitArray') && (isVisible(item))"
                            :nodeNumber = "props.nodeNumber"
                            :eventIndex = "props.eventIndex"
                            :eventVariableIndex=item.eventVariableIndex
                            :bitCollection = item.bitCollection
                            :displayTitle="item.displayTitle"
                            :displaySubTitle="item.displaySubTitle">
      </EventVariableBitArray>
      <EventVariableBitSingle v-if="(item.type=='EventVariableBitSingle') && (isVisible(item))"
                            :nodeNumber = "props.nodeNumber"
                            :eventIndex = props.eventIndex
                            :eventVariableIndex=item.eventVariableIndex
                            :bit = "item.bit"
                            :displayTitle="item.displayTitle"
                            :displaySubTitle="item.displaySubTitle">
      </EventVariableBitSingle>
      <EventVariableGroup v-if="(item.type=='EventVariableGroup') && (isVisible(item))"
                    :configuration = item>
      </EventVariableGroup>
      <EventVariableNumber v-if="(item.type=='EventVariableNumber') && (isVisible(item))"
                  :node-number=props.nodeNumber
                  :eventIndex = props.eventIndex
                  :eventVariableIndex= "item.eventVariableIndex"
                  :displayTitle="item.displayTitle"
                  :displaySubTitle="item.displaySubTitle"
                  :startBit = "item.startBit"
                  :endBit = "item.endBit"
                  :displayOffset = "item.displayOffset"
                  :min = "item.min"
                  :max = "item.max"
                  :configuration = item>
      </EventVariableNumber>
      <EventVariableSelect v-if="(item.type=='EventVariableSelect') && (isVisible(item))"
                        :nodeNumber="props.nodeNumber"
                        :eventIndex = "props.eventIndex"
                        :eventVariableIndex= "item.eventVariableIndex"
                        :bitMask = "item.bitMask"
                        :displayTitle="item.displayTitle"
                        :displaySubTitle="item.displaySubTitle"
                        :options= "item.options">
      </EventVariableSelect>
      <EventVariableSlider v-if="(item.type=='EventVariableSlider') && (isVisible(item))"
                            :node-number="props.nodeNumber"
                            :eventIndex = "props.eventIndex"
                            :eventVariableIndex= "item.eventVariableIndex"
                            :displayTitle="item.displayTitle"
                            :displaySubTitle = "item.displaySubTitle"
                            :displayScale="item.displayScale"
                            :displayUnits="item.displayUnits"
                            :displayOffset = "item.displayOffset"
                            :min = "item.min"
                            :max = "item.max"
                            :startBit = "item.startBit"
                            :endBit = "item.endBit">
      </EventVariableSlider>
      <EventVariableTabs v-if="(item.type=='EventVariableTabs') && (isVisible(item))"
                  :configuration=item>
      </EventVariableTabs>
    </div>

  </div>
</template>

<script setup>
import {computed, inject, onBeforeMount, onMounted, onUpdated, watch} from "vue";
import EventVariableBitArray from "components/modules/common/EventVariableBitArray"
import EventVariableBitSingle from "components/modules/common/EventVariableBitSingle"
import EventVariableGroup from "components/modules/common/EventVariableGroup"
import EventVariableNumber from "components/modules/common/EventVariableNumber"
import EventVariableSelect from "components/modules/common/EventVariableSelect"
import EventVariableSlider from "components/modules/common/EventVariableSlider"
import EventVariableTabs from "components/modules/common/EventVariableTabs"
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";

const props = defineProps({
  configuration: Object,
  nodeNumber: {type: Number, required: true },
  eventIndex: {type: Number, required: true },
  eventIdentifier: {type: String, required: true },
})

const store = inject('store')
const name = "EventVariables"

const isVisible = (item) =>{
  var result = true
  if (item.visibilityLogic) {
    result = parseLogicElement(item.visibilityLogic, store, store.state.selected_event_index)
  }
  console.log(name + `: isVisible: ` + result + ' ' + item.type)
  return result
}


const level = computed(() =>{
    return props.level
})



watch(level, () => {
  console.log(name + ': watch source ' + props.source + ' level ' + level.value)
})

onBeforeMount(() => {
  console.log(name + `: onBeforeMount source ` + props.source + ` level ` + props.level)
})

onMounted(() => {
//  console.log(name + `: onMounted source ` + props.source + ` level ` + props.level)
})

onUpdated(() => {
  console.log(name + `: onUpdated`)
})

</script>

<style scoped>

</style>
