<template>

  <q-dialog v-model='model' persistent full-width full-height> 
    <q-card class="q-pa-sm">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
      <div class="text-h6">
        Node Variables for node :  {{ store.getters.node_name(store.state.selected_node) }}
      </div>
      <template v-slot:action>
        <q-btn color="cyan-1" size="sm" text-color="black" 
          label="update Module Descriptor" @click="clickUpdateModuleDescriptor()"/>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
      </template>
    </q-banner>
      <q-card-section>
        <div class="text-h6" v-if="showDescriptorWarning">
          *** Descriptor not loaded for this node ***
        </div>
        <div class="text-h6" v-if="showNoVariablesMessage">
          this node has no variables to display
        </div>
      </q-card-section>

      <div class="q-pa-xs row">
        <div v-for="item in variablesDescriptor" :key="item">
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
        <q-btn flat label="Toggle variables descriptor view" @click="clickToggleVariablesDescriptor()"/>
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

      <q-card-section class="q-pa-sm" v-if="showVariableDescriptor">
        <div class="q-pa-xs row">
          <div class="text-body1">Variables descriptor<br></div>
          <div class="text-body2">
            <pre>{{ variablesDescriptor }}</pre>
          </div>
        </div>
      </q-card-section>

    </q-card>
  </q-dialog>

  <manageModuleDescriptorsDialog v-model='showManageModuleDescriptorsDialog'/>

</template>

/*/////////////////////////////////////////////////////////////////////////////

Note this dialog expects the node variables to be populated before being called
This is because the dialog is expected to be created when the parent page is loaded,
and then only made visible when this dialog is selected for a specific node
- only then can the variables be populated, not when initially created

/////////////////////////////////////////////////////////////////////////////*/


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
import manageModuleDescriptorsDialog from "components/dialogs/ManageModuleDescriptorsDialog";

const $q = useQuasar()
const store = inject('store')
const name = "NodevariablesDialog"
const showDescriptorWarning = ref(false)
const variablesDescriptor = ref()
const showRawVariables = ref(false)
const showNoVariablesMessage = ref(false)
const showManageModuleDescriptorsDialog = ref(false)
const showVariableDescriptor = ref(false)
var loadFile_notification_raised = {}    // used by checkFileLoad

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true }
})


const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

watch(model, () => {
  console.log(name + `: WATCH model`)
  showRawVariables.value = false
  showVariableDescriptor.value = false
})




const isVisible = (item) =>{
      var result = true
      if (item.visibilityLogic) {
        result = parseLogicElement(item.visibilityLogic, store)
      }
      console.log(name + `: isVisible: ` + result + ' ' + item.type)
      return result
    }

    
const update_variablesDescriptor = () => {
  if (props.nodeNumber){
    if (store.state.nodeDescriptors[props.nodeNumber] != undefined){
        variablesDescriptor.value = store.state.nodeDescriptors[props.nodeNumber].nodeVariables
        showDescriptorWarning.value = false
      } else{
        variablesDescriptor.value = {}
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
  console.log(name + ': onUpdated')
  variablesDescriptor.value = null
  if (props.nodeNumber){
    console.log('NodeVariableDialog onUpdated - nodeNumber ' + props.nodeNumber)
    update_variablesDescriptor()
    checkFileLoad()
    if (store.state.nodes[props.nodeNumber].parameters[6] == 0){
      showNoVariablesMessage.value = true
    }else{
      showNoVariablesMessage.value = false
    }
  }
})


// raise notification if nodeDescriptor file not present
const checkFileLoad = () => {
  console.log(name + `: checkFileLoad`)
  if (loadFile_notification_raised[props.nodeNumber] == undefined) {
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
      loadFile_notification_raised[props.nodeNumber]=true;
    }
    if (loadFile_notification_raised[props.nodeNumber]) {
       console.log(name + `: checkLoadFile notification raised`) 
    }
  }
}
  

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickClose = () => {
  console.log(name + `: clickClose`)
  variablesDescriptor.value={}
}

const clickToggleRaw = () => {
  console.log(name + `: clickToggleRaw`)
  if (showRawVariables.value){
    showRawVariables.value = false
  } else {
    showRawVariables.value = true
  }
}

const clickToggleVariablesDescriptor = () => {
  console.log(name + `: clickToggleNodeDescriptor`)
  if (showVariableDescriptor.value){
    showVariableDescriptor.value = false
  } else {
    showVariableDescriptor.value = true
  }
}

const clickUpdateModuleDescriptor = () => {
  console.log(name + `: clickUpdateModuleDescriptor`)
  showManageModuleDescriptorsDialog.value = true
}


</script>

<style scoped>

</style>
