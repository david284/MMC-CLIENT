<template>
  <q-dialog v-model='model' persistent full-width full-height position="right">
    <q-card class="q-pa-none q-ml-xl">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin g-py-none">
          <div class="text-h6">
            Node Variables for node :  {{ store.getters.node_name(nodeNumber) }}
          </div>
          <template v-slot:action>
          <q-btn v-if="(store.state.develop)" class="q-mx-xs q-my-none" color="blue" size="sm" label="names">
            <q-menu auto-close>
              <q-list style="min-width: 100px">
                <div v-for="(item, name) in store.state.layout.nodeDetails[nodeNumber].tokens" :key="item">
                  <q-item>
                    <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" :label=name
                      @click="clickNamesMenu(name, item.maxNumber)" />
                  </q-item>
                </div>
              </q-list>
            </q-menu>
          </q-btn>
            <q-btn v-if="(!numberOfChannels==0)" class="q-mx-xs q-my-none" color="blue" size="sm"
              label="channel names" @click="clickChannelNames()"/>
            <q-btn color="cyan-1" size="sm" text-color="black"
              label="manage Module Descriptor" @click="clickManageModuleDescriptor()"/>
            <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Refresh" @click="clickRefresh()"/>
            <q-btn flat color="white" size="md" label="Close" @click="clickClose()" v-close-popup/>
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
            :nodeNumber = nodeNumber
            :configuration = processedNodeVariableDescriptor
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

  <MDFDialog v-model='showMDFDialog'
    :nodeNumber = nodeNumber
  />

  <NodeBackupDialog v-model='showNodeBackupDialog'
    :nodeNumber = nodeNumber
  />

  <NodeChannelNamesDialog v-model="showNodeChannelNamesDialog"
    :nodeNumber=nodeNumber
    :numberOfChannels=numberOfChannels
  />

  <NodeTokenNamesDialog v-model="showNodeTokenNamesDialog"
    :nodeNumber=nodeNumber
    :numberOfItems=numberOfTokenInstances
    :token = selectedToken
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
import { useQuasar, useTimeout } from 'quasar'
import {timeStampedLog} from "components/functions/utils.js"
import MDFDialog from "components/dialogs/MDFDialog";
import NodeBackupDialog from "components/dialogs/NodeBackupDialog"
import NodeChannelNamesDialog from "./NodeChannelNamesDialog.vue";
import NodeVariables from "components/modules/common/NodeVariables"
import NodeRawVariables from "components/modules/common/NodeRawVariables"
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog"
import { replaceChannelTokens } from "../functions/utils";
import { getNumberOfChannels } from "../functions/NodeFunctions";
import NodeTokenNamesDialog from "./NodeTokenNamesDialog.vue"

const $q = useQuasar()
const { registerTimeout } = useTimeout()
const store = inject('store')
const name = "NodevariablesDialog"

const showDescriptorWarning = ref(false)
const showMDFDialog = ref(false)
const showNodeChannelNamesDialog = ref(false)
const showWaitOnBusTrafficDialog = ref(false)
const showNoVariablesMessage = ref(false)
const showRawVariables = ref(false)
const showVariableDescriptor = ref(false)
const nodeVariableInformation = ref()
const processedNodeVariableDescriptor = ref()
const numberOfChannels=ref(0)
const showNodeBackupDialog = ref(false)
var DialogOpenedTimestamp = Date.now()
const showNodeTokenNamesDialog = ref(false)
const selectedToken = ref(null)
const numberOfTokenInstances = ref(0)

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, default: 0 }
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
    //timeStampedLog(name + `: WATCH model`)
    DialogOpenedTimestamp = Date.now()
    showVariableDescriptor.value = false
    if (variablesDescriptor.value == undefined){
      showRawVariables.value = true
      showDescriptorWarning.value = true
      processedNodeVariableDescriptor.value = undefined
    } else {
      showRawVariables.value = false
      showDescriptorWarning.value = false
      nodeVariableInformation.value = store.state.nodeDescriptors[props.nodeNumber].nodeVariableInformation
      updateChannelNames()
    }
    //timeStampedLog(name + `: WATCH model: getNumberOfChannels`)
    numberOfChannels.value = getNumberOfChannels(store, props.nodeNumber)
  }
})

// update the channel names in the variables descriptor object
// as it's a blocking call, need to allow this dialog to be displayed first
// so show a notification, then set a timeout before calling function
//
const updateChannelNames = () => {
  // create notification to alert that channel names function is going to be called
  let channelNamesNotfication = $q.notify({
    message: 'updating channel names',
    caption: 'please wait....',
    timeout: 0,
    position: 'center',
    color: 'primary'
  })
  // set a timed callback
  registerTimeout(() => {
    //timeStampedLog(name + `: registerTimeout`)
    processedNodeVariableDescriptor.value = replaceChannelTokens(store, variablesDescriptor.value, props.nodeNumber)
    channelNamesNotfication()
  }, 300) // arbitrary timeout of 300mS seems to allow dialog to be displayed
}




// need to know if descriptor changed, could be updated import
//
const variablesDescriptor = computed(() =>{
  var obj = undefined
  try{
    obj = store.state.nodeDescriptors[props.nodeNumber].nodeVariables
  } catch {}
  return obj
})

//
//
watch(showNodeChannelNamesDialog, () => {
  try{
    if (showNodeChannelNamesDialog.value == false) {
      updateChannelNames()
    }
    //processedNodeVariableDescriptor.value = replaceChannelTokens(store, variablesDescriptor.value, props.nodeNumber)
  } catch {}
})

//
//
watch(variablesDescriptor, () => {
  //timeStampedLog(name + `: WATCH variablesDescriptor`)
  if (model.value == true){     // don't do if not visible
    if (variablesDescriptor.value == undefined){
      showRawVariables.value = true
      showDescriptorWarning.value = true
    } else {
      showDescriptorWarning.value = false
      nodeVariableInformation.value = store.state.nodeDescriptors[props.nodeNumber].nodeVariableInformation
      updateChannelNames()
      //processedNodeVariableDescriptor.value = replaceChannelTokens(store, variablesDescriptor.value, props.nodeNumber)
    }
    //timeStampedLog(name + `: WATCH variablesDescriptor: getNumberOfChannels`)
    numberOfChannels.value = getNumberOfChannels(store, props.nodeNumber)
  }
})

//
//
onBeforeMount(() => {
//  timeStampedLog(name + ': onBeforeMount')
})

//
//
onMounted(() => {
//  timeStampedLog(name + ': onMounted')
})

//
//
onUpdated(async () => {
//  timeStampedLog(name + ': onUpdated')
  if (props.nodeNumber){
//    timeStampedLog('NodeVariableDialog onUpdated - nodeNumber ' + props.nodeNumber)
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
  let nodeModified = ((store.state.nodes[props.nodeNumber].NodeModifiedTimestamp-DialogOpenedTimestamp) > 0) ? true : false
  //timeStampedLog(name + `: clickClose: nodeModified ${nodeModified}`)
  if((nodeModified) && (store.state.notification_settings.backup_notify)) {
    $q.notify({
      message: 'Variables changed - Do you want to take a backup?',
      caption: 'Yes, No or \'Don\'t remind me again\'',
      timeout: 0,
      position: 'center',
      color: 'primary',
      actions: [
        { label: 'YES', color: 'white', handler: async () => {
          showNodeBackupDialog.value=true
        } },
        { label: 'NO', color: 'white', handler: () => { } },
        { label: `Don't remind me again`, color:'white',
            handler: () => { store.state.notification_settings.backup_notify = false }
        }
      ]
    })
  }
}

//
//
const clickChannelNames = () => {
  timeStampedLog(name + `: clickChannelNames: number ${numberOfChannels.value}`)
  if (numberOfChannels.value > 0){
    showNodeChannelNamesDialog.value = true
  }
}

//
//
const clickManageModuleDescriptor = () => {
  timeStampedLog(name + `: clickUpdateModuleDescriptor`)
  store.methods.request_matching_mdf_list(props.nodeNumber, "USER")
  store.methods.request_matching_mdf_list(props.nodeNumber, "SYSTEM")
  showMDFDialog.value = true
}

//
//
const clickNamesMenu = (name, number) => {
  timeStampedLog(name + `: clickNamesMenu ${name} ${number}`)
  selectedToken.value = name
  numberOfTokenInstances.value = number
  showNodeTokenNamesDialog.value = true
}

//
//
const clickRefresh = () => {
  timeStampedLog(name + `: clickRefresh`)
  store.methods.request_all_node_variables(props.nodeNumber)
  showWaitOnBusTrafficDialog.value = true
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
