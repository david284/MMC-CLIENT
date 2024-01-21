<template>

  <q-dialog v-model='model' persistent full-width full-height> 
    <q-card class="q-pa-sm">
      <q-card-section>
        <div class="text-h6">Node Variables for {{ store.getters.node_name(props.nodeNumber) }}</div>
        <div class="text-h6" v-if="showDescriptorWarning">
          *** Descriptor not loaded for this node ***
        </div>
      </q-card-section>

      <div class="q-pa-xs row">
        <div v-for="item in nodeVariablesDescriptor" :key="item">
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
          <NodeVariableGroup v-if="(item.type=='NodeVariableGroup') && (isVisible(item))"
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
                              :bitMask = "item.bitMask"
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
        <q-btn flat label="Toggle raw view" @click="clickToggleRaw()"/>
        <q-btn flat label="Close" v-close-popup @click="clickClose()"/>
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
import { useQuasar } from 'quasar'

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

const $q = useQuasar()
const store = inject('store')
const showDescriptorWarning = ref(false)
const nodeVariablesDescriptor = ref()
const showRawVariables = ref(false)
var loadFile_notification_raised = false    // used by checkFileLoad

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true }
})


const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })


const isVisible = (item) =>{
      var result = true
      if (item.visibilityLogic) {
        result = parseLogicElement(item.visibilityLogic, store)
      }
      console.log(`isVisible: ` + result + ' ' + item.type)
      return result
    }

    
const update_nodeVariablesDescriptor = () => {
  if (props.nodeNumber){
    if (store.state.nodeDescriptors[props.nodeNumber] != undefined){
        nodeVariablesDescriptor.value = store.state.nodeDescriptors[props.nodeNumber].nodeVariables
        showDescriptorWarning.value = false
      } else{
        nodeVariablesDescriptor.value = {}
        showRawVariables.value = true
        showDescriptorWarning.value = true
    }
  }
}

onBeforeMount(() => {
})

onMounted(() => {
})


onUpdated(() => {
  console.log('NodeVariableDialog onUpdated')
  nodeVariablesDescriptor.value = null
  if (props.nodeNumber){
    console.log('NodeVariableDialog onUpdated - nodeNumber ' + props.nodeNumber)
    update_nodeVariablesDescriptor()
    checkFileLoad()
    store.methods.request_all_node_variables(props.nodeNumber, store.state.nodes[props.nodeNumber].parameters[6], 100, 1)
  }
})


// raise notification if nodeDescriptor file not present
const checkFileLoad = () => {
  console.log(`checkFileLoad`)
  if (loadFile_notification_raised != true) {
    // module descriptor filename won't be created if there's no moduleName
    if( store.state.nodes[props.nodeNumber].moduleName == 'Unknown'){
      $q.notify({
        message: 'module name unknown',
        timeout: 0,
        type: 'warning',
        position: 'center',
        actions: [ { label: 'Dismiss' } ]
      })
      loadFile_notification_raised = true;
    } 
    else if ((store.state.nodes[props.nodeNumber].moduleDescriptorFilename != undefined)  
      && (store.state.nodeDescriptors[props.nodeNumber] == undefined)) 
    {
      $q.notify({
        message: 'Failed to load module file ' + store.state.nodes[props.nodeNumber].moduleDescriptorFilename,
        timeout: 0,
        type: 'warning',
        position: 'center',
        actions: [ { label: 'Dismiss' } ]
      })
      loadFile_notification_raised = true;
    }
    if (loadFile_notification_raised) {
       console.log(`checkLoadFile notification raised`) 
    }
  }
}
  

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickClose = () => {
  console.log(`EventVariablesDialog clickClose`)
  showRawVariables.value = false
//  loadFile_notification_raised = false
  nodeVariablesDescriptor.value={}
}

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
