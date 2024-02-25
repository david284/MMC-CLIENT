<template>
  <q-dialog v-model='model' persistent full-width full-height> 
    <q-card class="q-pa-none q-ma-none">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin g-py-none">
          <div class="text-h6">
            Node Variables for node :  {{ store.getters.node_name(store.state.selected_node) }}
          </div>
          <template v-slot:action>
            <q-btn color="cyan-1" size="sm" text-color="black" 
              label="update Module Descriptor" @click="clickUpdateModuleDescriptor()"/>
              <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card>
        <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
  
          <q-card-section>
            <div class="text-h6" v-if="showDescriptorWarning">
              *** Descriptor not loaded for this node ***
            </div>
            <div class="text-h6" v-if="showNoVariablesMessage">
              this node has no variables to display
            </div>
          </q-card-section>

          <NodeVariables
            :configuration = store.state.nodeDescriptors[store.state.selected_node].nodeVariables
            :level=1
            :source="sourceName">
          </NodeVariables>

          <div class="q-pa-none row" v-if="showRawVariables">
            <NodeVariableRaw :node-variable-index="n"
                          :node-number=props.nodeNumber
                          v-for="n in store.state.nodes[props.nodeNumber].parameters[6]"
                          :key="n">
            </NodeVariableRaw>
          </div>

          <q-card-section class="q-pa-sm" v-if="showVariableDescriptor">
            <div class="q-pa-xs row">
              <div class="text-body1">Variables descriptor<br></div>
              <div class="text-body2">
                <pre>{{ variablesDescriptor }}</pre>
              </div>
            </div>
          </q-card-section>

        </q-card-section>
      </q-card>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Toggle variables descriptor view" @click="clickToggleVariablesDescriptor()"/>
        <q-btn flat label="Toggle raw view" @click="clickToggleRaw()"/>
      </q-card-actions>

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
import NodeVariables from "components/modules/common/NodeVariables"
import NodeVariableRaw from "components/modules/common/NodeVariableRaw"
import manageModuleDescriptorsDialog from "components/dialogs/ManageModuleDescriptorsDialog";

const $q = useQuasar()
const store = inject('store')
const name = "NodevariablesDialog"
const showDescriptorWarning = ref(false)
const showRawVariables = ref(false)
const showNoVariablesMessage = ref(false)
const showManageModuleDescriptorsDialog = ref(false)
const showVariableDescriptor = ref(false)
const sourceName=ref("nvDialog")

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
  console.log(name + `: WATCH variablesDescriptor`)
  if (variablesDescriptor.value == undefined){
    showRawVariables.value = true
    showDescriptorWarning.value = true
  } else {
    showDescriptorWarning.value = false
  }
})


onBeforeMount(() => {
  console.log(name + ': onBeforeMount')
})

onMounted(() => {
  console.log(name + ': onMounted')
})

onUpdated(() => {
  console.log(name + ': onUpdated')
  if (props.nodeNumber){
    console.log('NodeVariableDialog onUpdated - nodeNumber ' + props.nodeNumber)
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
  if (store.state.loadFile_notification_raised[props.nodeNumber] == undefined) {
    // module descriptor filename won't be created if there's no moduleName
    if( store.state.nodes[props.nodeNumber].moduleName == 'Unknown'){
      $q.notify({
        message: 'module name unknown',
        timeout: 0,
        type: 'warning',
        position: 'center',
        actions: [ { label: 'Dismiss' } ]
      })
      store.state.loadFile_notification_raised[props.nodeNumber] = true;
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
      store.state.loadFile_notification_raised[props.nodeNumber]=true;
    }
    if (store.state.loadFile_notification_raised[props.nodeNumber]) {
       console.log(name + `: checkLoadFile notification raised`) 
    }
  }
}
  

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickClose = () => {
  console.log(name + `: clickClose`)
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
