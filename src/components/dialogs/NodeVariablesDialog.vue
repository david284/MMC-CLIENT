<template>
  <q-dialog v-model='model' persistent full-width full-height> 
    <q-card class="q-pa-none q-ma-none">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin g-py-none">
          <div class="text-h6">
            Node Variables for node :  {{ store.getters.node_name(nodeNumber) }}
          </div>
          <template v-slot:action>
            <q-btn color="cyan-1" size="sm" text-color="black" 
              label="manage Module Descriptor" @click="clickManageModuleDescriptor()"/>
              <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Refresh" @click="clickRefresh()"/>
              <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card class="q-pa-none q-ma-none">
        <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
  
          <q-card-section class="q-pa-none q-ma-none">
            <div class="text-h6" v-if="showDescriptorWarning">
              *** Descriptor not loaded for this node ***
            </div>
            <div class="text-h6" v-if="showNoVariablesMessage">
              this node has no variables to display
            </div>
          </q-card-section>
 
          <q-card-section class="q-pa-none q-ma-none text-h6" v-if="nodeVariableInformation">
            {{ nodeVariableInformation }}
          </q-card-section>

          <NodeVariables v-if="store.state.nodeDescriptors[props.nodeNumber]"
            :configuration = store.state.nodeDescriptors[props.nodeNumber].nodeVariables
          />

          <q-card-section class="q-pa-none" v-if="showRawVariables">
            <NodeRawVariables
              :nodeNumber = nodeNumber
            />
            <q-separator />
          </q-card-section>

          <q-card-section class="q-pa-sm" v-if="showVariableDescriptor">
            <div class="q-pa-xs row">
              <div class="text-body1">Variables descriptor<br></div>
              <div class="text-body2">
                <pre>{{ variablesDescriptor }}</pre>
              </div>
            </div>
            <q-separator />
          </q-card-section>

        </q-card-section>
      </q-card>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Toggle variables descriptor view" @click="clickToggleVariablesDescriptor()"/>
        <q-btn flat label="Toggle raw view" @click="clickToggleRaw()"/>
      </q-card-actions>

    </q-card>

  </q-dialog>

  <MDFDialog v-model='showMDFDialog'
    :nodeNumber = nodeNumber
  />

  <WaitingOnBusTrafficDialog v-model='showWaitOnBusTrafficDialog'
    callingModule = "Node Variables"
    message = "Waiting on Node Variables"
  />


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
import NodeVariables from "components/modules/common/NodeVariables"
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog"
import NodeRawVariables from "components/modules/common/NodeRawVariables"
import MDFDialog from "components/dialogs/MDFDialog";
import { sleep } from "../functions/utils";

const $q = useQuasar()
const store = inject('store')
const name = "NodevariablesDialog"

const showDescriptorWarning = ref(false)
const showMDFDialog = ref(false)
const showWaitOnBusTrafficDialog = ref(false)
const showNoVariablesMessage = ref(false)
const showRawVariables = ref(false)
const showVariableDescriptor = ref(false)
const nodeVariableInformation = ref()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, default: 0 }
})


const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

watch(model, async () => {
//  console.log(name + `: WATCH model`)
  showRawVariables.value = false
  showVariableDescriptor.value = false
  if (variablesDescriptor.value == undefined){
    showRawVariables.value = true
    showDescriptorWarning.value = true
  } else {
    showDescriptorWarning.value = false
  }
})


// need to know if descriptor changed, could be updated import
const variablesDescriptor = computed(() =>{
  var obj = undefined
  if (props.nodeNumber){
    if (store.state.nodeDescriptors[props.nodeNumber] != undefined){
        obj = store.state.nodeDescriptors[props.nodeNumber].nodeVariables
      }
  }
  return obj
})

watch(variablesDescriptor, () => {
//  console.log(name + `: WATCH variablesDescriptor`)
  if (variablesDescriptor.value == undefined){
    showRawVariables.value = true
    showDescriptorWarning.value = true
  } else {
    showDescriptorWarning.value = false
    nodeVariableInformation.value = store.state.nodeDescriptors[props.nodeNumber].nodeVariableInformation
  }
})


onBeforeMount(() => {
//  console.log(name + ': onBeforeMount')
})

onMounted(() => {
//  console.log(name + ': onMounted')
})

onUpdated(async () => {
//  console.log(name + ': onUpdated')
  if (props.nodeNumber){
//    console.log('NodeVariableDialog onUpdated - nodeNumber ' + props.nodeNumber)
    if (store.state.nodes[props.nodeNumber].parameters[6] == 0){
      showNoVariablesMessage.value = true
    }else{
      showNoVariablesMessage.value = false
    }
  }
})



/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickClose = () => {
  console.log(name + `: clickClose`)
}

const clickManageModuleDescriptor = () => {
  console.log(name + `: clickUpdateModuleDescriptor`)
  store.methods.request_matching_mdf_list(props.nodeNumber, "USER")
  store.methods.request_matching_mdf_list(props.nodeNumber, "SYSTEM")
  showMDFDialog.value = true
}

const clickRefresh = () => {
  console.log(name + `: clickRefresh`)
  store.methods.request_all_node_variables(props.nodeNumber)
  showWaitOnBusTrafficDialog.value = true
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


</script>

<style scoped>

</style>
