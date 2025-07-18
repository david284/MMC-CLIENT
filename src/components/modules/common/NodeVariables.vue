<template>
  <div class="q-pa-xs row">
    <div v-for="item in configuration" :key="item">
      <NodeChannelList v-if="(item.type=='NodeChannelList') && (isVisible(item))"
        :nodeNumber=nodeNumber
        :configuration=item>
      </NodeChannelList>
      <NodeVariableBitArray v-if="(item.type=='NodeVariableBitArray') && (isVisible(item))"
        :nodeNumber=nodeNumber
        :variableIndex=item.nodeVariableIndex
        :bitCollection = item.bitCollection
        :displayTitle="item.displayTitle"
        :displaySubTitle="item.displaySubTitle"
        :configuration = item
        >
      </NodeVariableBitArray>
      <NodeVariableBitSingle v-if="(item.type=='NodeVariableBitSingle') && (isVisible(item))"
        :nodeNumber=nodeNumber
        :variableIndex=item.nodeVariableIndex
        :displayTitle="item.displayTitle"
        :displaySubTitle="item.displaySubTitle"
        :bit=item.bit
        :configuration = item
        >
      </NodeVariableBitSingle>
      <NodeVariableButtons v-if="(item.type=='NodeVariableButtons') && (isVisible(item))"
        :nodeNumber=nodeNumber
        :nodeVariableIndex="item.nodeVariableIndex"
        :buttonCollection = item.buttonCollection
        :displayTitle="item.displayTitle"
        :displaySubTitle="item.displaySubTitle"
        :configuration = item
        >
      </NodeVariableButtons>
      <NodeVariableDual v-if="(item.type=='NodeVariableDual') && (isVisible(item))"
        :NodeVariableIndexLow="item.nodeVariableIndexLow"
        :NodeVariableIndexHigh="item.nodeVariableIndexHigh"
        :NodeNumber=nodeNumber
        :displayTitle="item.displayTitle"
        :displaySubTitle="item.displaySubTitle"
        :displayScale = "item.displayScale"
        :displayOffset = "item.displayOffset"
        :displayUnits="item.displayUnits"
        :min = "item.min"
        :max = "item.max"
        :startBit = "item.startBit"
        :endBit = "item.endBit"
        :configuration = item
        >
      </NodeVariableDual>
      <NodeVariableGroup v-if="(item.type=='NodeVariableGroup') && (isVisible(item))"
        :nodeNumber=nodeNumber
        :configuration = item>
      </NodeVariableGroup>
      <NodeVariableNumber v-if="(item.type=='NodeVariableNumber') && (isVisible(item))"
        :node-number=nodeNumber
        :displayTitle="item.displayTitle"
        :displaySubTitle="item.displaySubTitle"
        :node-variable-index=item.nodeVariableIndex
        :displayScale = "item.displayScale"
        :displayOffset = "item.displayOffset"
        :displayUnits="item.displayUnits"
        :min = "item.min"
        :max = "item.max"
        :startBit = "item.startBit"
        :endBit = "item.endBit"
        :configuration = item
        >
      </NodeVariableNumber>
      <NodeVariableSelect v-if="(item.type=='NodeVariableSelect') && (isVisible(item))"
        :nodeVariableIndex="item.nodeVariableIndex"
        :nodeNumber=nodeNumber
        :bitMask = "item.bitMask"
        :displayTitle="item.displayTitle"
        :displaySubTitle="item.displaySubTitle"
        :options="item.options"
        :configuration = "item"
        >
      </NodeVariableSelect>
      <node-variable-slider v-if="(item.type=='NodeVariableSlider') && (isVisible(item))"
        :node-number=nodeNumber
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
        :configuration = "item"
        >
      </node-variable-slider>
      <NodeVariableTabs v-if="(item.type=='NodeVariableTabs') && (isVisible(item))"
        :nodeNumber=nodeNumber
        :configuration=item>
      </NodeVariableTabs>
    </div>
  </div>

</template>

<script setup>
import {computed, inject, onBeforeMount, onMounted, onUpdated, watch} from "vue";
import NodeChannelList from "components/modules/common/NodeChannelList"
import NodeVariableBitArray from "components/modules/common/NodeVariableBitArray"
import NodeVariableBitSingle from "components/modules/common/NodeVariableBitSingle"
import NodeVariableButtons from "components/modules/common/NodeVariableButtons"
import NodeVariableDual from "components/modules/common/NodeVariableDual"
import NodeVariableGroup from "components/modules/common/NodeVariableGroup"
import NodeVariableNumber from "components/modules/common/NodeVariableNumber"
import NodeVariableSelect from "components/modules/common/NodeVariableSelect"
import NodeVariableSlider from "components/modules/common/NodeVariableSlider"
import NodeVariableTabs from "components/modules/common/NodeVariableTabs"
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";

const props = defineProps({
  nodeNumber: Number,
  configuration: Object,
})

const store = inject('store')
const name = "NodeVariables"

function isVisible(item){
  var result = true
  if (item.visibilityLogic) {
    result = parseLogicElement(nodeNumber, item.visibilityLogic, store)
  }
//  console.log(name + `: isVisible: ` + result + ' ' + item.type)
  return result
}


onBeforeMount(() => {
//  console.log(name + `: onBeforeMount`)
})

onMounted(() => {
//  console.log(name + `: onMounted`)
})

onUpdated(() => {
//  console.log(name + `: onUpdated`)
})

</script>

<style scoped>

</style>
