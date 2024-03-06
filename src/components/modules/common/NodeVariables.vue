<template>
  <div class="q-pa-xs row">
    <div v-for="item in configuration" :key="item">
      <NodeVariableBitArray v-if="(item.type=='NodeVariableBitArray') && (isVisible(item))"
                            :nodeNumber=store.state.selected_node
                            :VariableIndex=item.nodeVariableIndex
                            :bitCollection = item.bitCollection
                            :displayTitle="item.displayTitle"
                            :displaySubTitle="item.displaySubTitle"
                            :learn="false"
      ></NodeVariableBitArray>
      <NodeVariableBitSingle v-if="(item.type=='NodeVariableBitSingle') && (isVisible(item))"
                                :NodeNumber=store.state.selected_node
                                :VariableIndex=item.nodeVariableIndex
                                :displayTitle="item.displayTitle"
                                :displaySubTitle="item.displaySubTitle"
                                :Bit=item.bit
      >
      </NodeVariableBitSingle>
      <NodeVariableDual v-if="(item.type=='NodeVariableDual') && (isVisible(item))"
                        :NodeVariableIndexLow="item.nodeVariableIndexLow"
                        :NodeVariableIndexHigh="item.nodeVariableIndexHigh"
                        :NodeNumber=store.state.selected_node
                        :displayTitle="item.displayTitle"
                        :displaySubTitle="item.displaySubTitle">
      </NodeVariableDual>
      <NodeVariableGroup v-if="(item.type=='NodeVariableGroup') && (isVisible(item))"
                    :configuration = item
                    :level=level>
      </NodeVariableGroup>
      <NodeVariableNumber v-if="(item.type=='NodeVariableNumber') && (isVisible(item))"
                    :node-number=store.state.selected_node
                    :displayTitle="item.displayTitle"
                    :displaySubTitle="item.displaySubTitle"
                    :node-variable-index=item.nodeVariableIndex>
      </NodeVariableNumber>
      <NodeVariableSelect v-if="(item.type=='NodeVariableSelect') && (isVisible(item))"
                          :nodeVariableIndex="item.nodeVariableIndex"
                          :nodeNumber=store.state.selected_node
                          :bitMask = "item.bitMask"
                          :displayTitle="item.displayTitle"
                          :displaySubTitle="item.displaySubTitle"
                          :options="item.options">
      </NodeVariableSelect>
      <node-variable-slider v-if="(item.type=='NodeVariableSlider') && (isVisible(item))"
                            :node-number=store.state.selected_node
                            :nodeVariableIndex="item.nodeVariableIndex"
                            :displayTitle="item.displayTitle"
                            :displaySubTitle = "item.displaySubTitle"
                            :displayScale="item.displayScale"
                            :displayUnits="item.displayUnits"
                            :displayOffset = "item.displayOffset"
                            :min = "item.min"
                            :max = "item.max"
                            :startBit = "item.startBit"
                            :endBit = "item.endBit"
                            :configuration = "item">
      </node-variable-slider>
      <NodeVariableTabs v-if="(item.type=='NodeVariableTabs') && (isVisible(item))"
                  :configuration=item
                  :level=level>
      </NodeVariableTabs>
    </div>
  </div>

</template>

<script setup>
import {computed, inject, onBeforeMount, onMounted, onUpdated, watch} from "vue";
import NodeVariableBitArray from "components/modules/common/NodeVariableBitArray"
import NodeVariableBitSingle from "components/modules/common/NodeVariableBitSingle"
import NodeVariableDual from "components/modules/common/NodeVariableDual"
import NodeVariableGroup from "components/modules/common/NodeVariableGroup"
import NodeVariableNumber from "components/modules/common/NodeVariableNumber"
import NodeVariableSelect from "components/modules/common/NodeVariableSelect"
import NodeVariableSlider from "components/modules/common/NodeVariableSlider"
import NodeVariableTabs from "components/modules/common/NodeVariableTabs"
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";

const props = defineProps({
  configuration: Object,
})

const store = inject('store')
const name = "NodeVariables"

function isVisible(item){
  var result = true
  if (item.visibilityLogic) {
    result = parseLogicElement(store.state.selected_node, item.visibilityLogic, store)
  }
  console.log(name + `: isVisible: ` + result + ' ' + item.type)
  return result
}


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
