<template>
  <div class="q-pa-xs row">

    <div v-for="item in nodeVariables" :key="item">
      <NodeVariableBitArray v-if="(item.type=='NodeVariableBitArray') && (isVisible(item))"
                            :nodeNumber="store.state.selected_node"
                            :VariableIndex=item.nodeVariableIndex
                            :bitCollection = item.bitCollection
                            :displayTitle="item.displayTitle"
                            :displaySubTitle="item.displaySubTitle"
                            :learn="false"
      ></NodeVariableBitArray>
      <NodeVariableBitSingle v-if="(item.type=='NodeVariableBitSingle') && (isVisible(item))"
                                :NodeNumber="store.state.selected_node"
                                :VariableIndex=item.nodeVariableIndex
                                :displayTitle="item.displayTitle"
                                :displaySubTitle="item.displaySubTitle"
                                :Bit=item.bit
      >
      </NodeVariableBitSingle>
      <NodeVariableDual v-if="(item.type=='NodeVariableDual') && (isVisible(item))"
                        :NodeVariableIndexLow="item.nodeVariableIndexLow"
                        :NodeVariableIndexHigh="item.nodeVariableIndexHigh"
                        :NodeNumber="store.state.selected_node"
                        :displayTitle="item.displayTitle"
                        :displaySubTitle="item.displaySubTitle">
      </NodeVariableDual>
      <NodeVariableGroup v-if="(item.type=='NodeVariableGroup') && (isVisible(item))"
                    :configuration = item>
      </NodeVariableGroup>
      <NodeVariableNumber v-if="(item.type=='NodeVariableNumber') && (isVisible(item))"
                    :node-number=store.state.selected_node
                    :displayTitle="item.displayTitle"
                    :displaySubTitle="item.displaySubTitle"
                    :node-variable-index=item.nodeVariableIndex>
      </NodeVariableNumber>
      <NodeVariableSelect v-if="(item.type=='NodeVariableSelect') && (isVisible(item))"
                          :nodeVariableIndex="item.nodeVariableIndex"
                          :nodeNumber="store.state.selected_node"
                          :displayTitle="item.displayTitle"
                          :displaySubTitle="item.displaySubTitle"
                          :options="item.options"
                          :bitMask="item.bitMask">
      </NodeVariableSelect>
      <node-variable-slider v-if="(item.type=='NodeVariableSlider') && (isVisible(item))"
                            :node-number="store.state.selected_node"
                            :nodeVariableIndex="item.nodeVariableIndex"
                            :displayTitle="item.displayTitle"
                            :displaySubTitle = "item.displaySubTitle"
                            :displayScale="item.displayScale"
                            :displayUnits="item.displayUnits"
                            :displayOffset = "item.displayOffset"
                            :min = "item.min"
                            :max = "item.max"
                            :startBit = "item.startBit"
                            :endBit = "item.endBit">
      </node-variable-slider>
      <NodeVariableTabs v-if="(item.type=='NodeVariableTabs') && (isVisible(item))"
                  :configuration=item>
      </NodeVariableTabs>
      <div v-if="store.state.debug">
        {{ item.type }} - {{ item.nodeVariableIndex}} - {{ item.displayTitle }}
      </div>
    </div>
  </div>
  <h5>Raw View</h5>
  <div class="q-pa-xs row">
    <NodeVariableRaw :node-variable-index="n"
                  :node-number=store.state.selected_node
                  v-for="n in store.state.nodes[store.state.selected_node].parameters[6]"
                  :key="n">
    </NodeVariableRaw>
  </div>

  <div class="q-pa-xs row">
    <p v-if="store.state.debug">
      Debug: Node variables<br>
      <pre>
        {{ store.state.nodes[store.state.selected_node].nodeVariables }}
      </pre>
    </p>
  </div>

</template>

<script>
import {inject, onBeforeMount, ref} from "vue";
import DefaultInfo from "components/modules/default/DefaultInfo"
import NodeVariableBitArray from "components/modules/common/NodeVariableBitArray"
import NodeVariableBitSingle from "components/modules/common/NodeVariableBitSingle"
import NodeVariableDual from "components/modules/common/NodeVariableDual"
import NodeVariableGroup from "components/modules/common/NodeVariableGroup"
import NodeVariableNumber from "components/modules/common/NodeVariableNumber"
import NodeVariableRaw from "components/modules/common/NodeVariableRaw"
import NodeVariableSelect from "components/modules/common/NodeVariableSelect"
import NodeVariableSlider from "components/modules/common/NodeVariableSlider"
import NodeVariableTabs from "components/modules/common/NodeVariableTabs"
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";

export default {
  name: "DefaultVariables",
  components: {
    NodeVariableBitArray,
    NodeVariableBitSingle,
    NodeVariableDual,
    NodeVariableGroup,
    NodeVariableNumber,
    NodeVariableRaw,
    NodeVariableSelect,
    NodeVariableSlider,
    NodeVariableTabs
  },
  setup() {
    const store = inject('store')
    const nodeVariables = ref()
    onBeforeMount(() => {
      if (store.state.nodeDescriptors[store.state.selected_node] != undefined){
        nodeVariables.value = store.state.nodeDescriptors[store.state.selected_node].nodeVariables
      }

      store.methods.request_all_node_variables(store.state.selected_node, store.state.nodes[store.state.selected_node].parameters[6], 100, 1)
    })

    function isVisible(item){
      var result = true
      if (item.visibilityLogic) {
//        result = parseLogicElement(item.visibilityLogic, store)
      }
      console.log(`isVisible: ` + result + ' ' + item.type)
      return result
    }

    return {store, nodeVariables, isVisible}
  }
}
</script>

<style scoped>

</style>
