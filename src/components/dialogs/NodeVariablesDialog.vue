<template>

  <q-dialog v-model='model' persistent full-width> 
    <q-card class="q-pa-sm">
      <q-card-section>
        <div class="text-h6">Node Variables for {{ store.getters.node_name(props.nodeNumber) }}</div>
      </q-card-section>

      <div class="q-pa-xs row">
        <div v-for="item in nodeVariables" :key="item">
          <NodeVariableBitArray v-if="(item.type=='NodeVariableBitArray') && (isVisible(item))"
                                :nodeNumber="props.nodeNumber"
                                :VariableIndex=item.nodeVariableIndex
                                :bitCollection = item.bitCollection
                                :displayTitle="item.displayTitle"
                                :displaySubTitle="item.displaySubTitle"
                                :learn="false"
          ></NodeVariableBitArray>
          <NodeVariableBitSingle v-if="(item.type=='NodeVariableBitSingle') && (isVisible(item))"
                                    :NodeNumber="props.nodeNumber"
                                    :VariableIndex=item.nodeVariableIndex
                                    :displayTitle="item.displayTitle"
                                    :displaySubTitle="item.displaySubTitle"
                                    :Bit=item.bit
          >
          </NodeVariableBitSingle>
          <NodeVariableDual v-if="(item.type=='NodeVariableDual') && (isVisible(item))"
                            :NodeVariableIndexLow="item.nodeVariableIndexLow"
                            :NodeVariableIndexHigh="item.nodeVariableIndexHigh"
                            :NodeNumber="props.nodeNumber"
                            :displayTitle="item.displayTitle"
                            :displaySubTitle="item.displaySubTitle">
          </NodeVariableDual>
          <NodeVariableGroup v-if="(item.type=='group') && (isVisible(item))"
                        :configuration = item>
          </NodeVariableGroup>
          <NodeVariableNumber v-if="(item.type=='NodeVariableNumber') && (isVisible(item))"
                        :node-number=props.nodeNumber
                        :displayTitle="item.displayTitle"
                        :displaySubTitle="item.displaySubTitle"
                        :node-variable-index=item.nodeVariableIndex>
          </NodeVariableNumber>
          <NodeVariableSelect v-if="(item.type=='NodeVariableSelect') && (isVisible(item))"
                              :nodeVariableIndex="item.nodeVariableIndex"
                              :nodeNumber="props.nodeNumber"
                              :displayTitle="item.displayTitle"
                              :displaySubTitle="item.displaySubTitle"
                              :options="item.options">
          </NodeVariableSelect>
          <node-variable-slider v-if="(item.type=='NodeVariableSlider') && (isVisible(item))"
                                :node-number="props.nodeNumber"
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

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Close" v-close-popup/>
      </q-card-actions>

      <q-card-actions align="left" class="text-primary">
        <q-btn flat label="Toggle raw view" @click="clickToggleRaw()"/>
      </q-card-actions>

      <div class="q-pa-none row" v-if="showRawVariables">
        <NodeVariableRaw :node-variable-index="n"
                      :node-number=props.nodeNumber
                      v-for="n in store.state.nodes[props.nodeNumber].parameters[6]"
                      :key="n">
        </NodeVariableRaw>
      </div>

      <div class="q-pa-xs row">
        <p v-if="store.state.debug">
          Debug: Node variables<br>
          <pre>
            {{ store.state.nodes[props.nodeNumber].nodeVariables }}
          </pre>
        </p>
      </div>

    </q-card>
  </q-dialog>


</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";

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


const store = inject('store')

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true }
})

const nodeVariables = ref()
const showRawVariables = ref(false)

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

watch(props.nodeNumber, () => {
  console.log('NodeVariableDialog - watch nodeNumber')
})

const isVisible = (item) =>{
      var result = true
      if (item.visibilityLogic) {
        result = parseLogicElement(item.visibilityLogic, store)
      }
      console.log(`isVisible: ` + result + ' ' + item.type)
      return result
    }


onBeforeMount(() => {
})

onMounted(() => {
})


onUpdated(() => {
  console.log('NodeVariableDialog onUpdated')
  if (props.nodeNumber){
    console.log('NodeVariableDialog onUpdated - nodeNumber ' + props.nodeNumber)
  }
  if (props.nodeNumber){
    if (store.state.nodeDescriptors[props.nodeNumber] != undefined){
        nodeVariables.value = store.state.nodeDescriptors[props.nodeNumber].nodeVariables
      }
      store.methods.request_all_node_variables(props.nodeNumber, store.state.nodes[props.nodeNumber].parameters[6], 100, 1)
  }
})

const clickToggleRaw = () => {
  console.log(`EventVariablesDialog clickToggleRaw`)
  if (showRawVariables.value){
    showRawVariables.value = false
  } else {
    showRawVariables.value = true
  }
}



</script>

<style scoped>

</style>
