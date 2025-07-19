<template>
  <q-dialog v-model='model' persistent full-width full-height>
    <q-card class="q-pa-none q-ml-xl">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin g-py-none">
          <div class="text-h6">
            Node Variables for channel : {{ store.getters.node_channel_name(nodeNumber, channelNumber) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card class="q-pa-none q-ma-none">
        <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">

          <q-card-section class="q-pa-none q-ma-none">
            <div class="text-h6" v-if="showDescriptorWarning">
              *** Descriptor not loaded for this channel ***
            </div>
            <div class="text-h6" v-if="showNoVariablesMessage">
              this node has no variables to display
            </div>
          </q-card-section>

          <NodeVariables v-if="store.state.nodeDescriptors[props.nodeNumber]"
            :nodeNumber = nodeNumber
            :configuration = variablesDescriptor
          />

          <q-card-section class="q-pa-none" v-if="showRawVariables">
            <NodeRawVariables
              :nodeNumber = nodeNumber
            />
            <q-separator />
          </q-card-section>

          <q-card-section class="q-pa-sm" v-if="showVariableDescriptor">
            <div class="q-pa-xs row">
              <div class="text-primary text-h6">Variables descriptor<br></div>
              <div class="text-body2">
                <pre>{{ variablesDescriptor }}</pre>
              </div>
            </div>
            <q-separator />
          </q-card-section>

        </q-card-section>
      </q-card>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Toggle raw view" @click="clickToggleRaw()"/>
        <q-btn flat label="Toggle variables descriptor view" @click="clickToggleVariablesDescriptor()"/>
      </q-card-actions>

    </q-card>

  </q-dialog>




</template>

/*/////////////////////////////////////////////////////////////////////////////

Note this dialog expects the node variables to be populated before being called
This is because the dialog is expected to be created when the parent page is loaded,
and then only made visible when this dialog is selected for a specific node
- only then can the variables be populated, not when initially created

/////////////////////////////////////////////////////////////////////////////*/


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import { useQuasar, useTimeout } from 'quasar'
import {timeStampedLog} from "components/functions/utils.js"
import NodeVariables from "components/modules/common/NodeVariables"
import NodeRawVariables from "components/modules/common/NodeRawVariables"


const $q = useQuasar()
const { registerTimeout } = useTimeout()
const store = inject('store')
const name = "NodeChannelVariablesDialog"

const showDescriptorWarning = ref(false)
const showNoVariablesMessage = ref(false)
const showRawVariables = ref(false)
const showVariableDescriptor = ref(false)
const variablesDescriptor = ref()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, default: 0 },
  channelNumber: {type: Number, default: 0 },
  configuration: {type: Object, default: undefined }
})

const emit = defineEmits(['update:modelValue'])

//
//
const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

//
//
watch(model, async () => {
  if (model.value == true){
    //timeStampedLog(name + `: WATCH model: config ${JSON.stringify(props.configuration)} `)
    variablesDescriptor.value = props.configuration
    showVariableDescriptor.value = false
    if (variablesDescriptor.value == undefined){
      timeStampedLog(name + `: WATCH model: variablesDescriptor undefined`)
      showRawVariables.value = true
      showDescriptorWarning.value = true
    } else if (Object.keys(variablesDescriptor.value).length == 0){
      timeStampedLog(name + `: WATCH model: variablesDescriptor zero entries`)
      showRawVariables.value = true
      showDescriptorWarning.value = true
    } else {
      showRawVariables.value = false
      showDescriptorWarning.value = false
    }
  }
})


//
//
onUpdated(async () => {
  //timeStampedLog(name + ': onUpdated')
  if (props.nodeNumber){
    //timeStampedLog('NodeVariableDialog onUpdated - nodeNumber ' + props.nodeNumber)
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

//
//
const clickClose = () => {
  timeStampedLog(name + `: clickClose`)
}

//
//
const clickToggleRaw = () => {
  timeStampedLog(name + `: clickToggleRaw`)
  if (showRawVariables.value){
    showRawVariables.value = false
  } else {
    showRawVariables.value = true
  }
}

//
//
const clickToggleVariablesDescriptor = () => {
  timeStampedLog(name + `: clickToggleNodeDescriptor`)
  if (showVariableDescriptor.value){
    showVariableDescriptor.value = false
  } else {
    showVariableDescriptor.value = true
  }
}


</script>

<style scoped>

</style>
