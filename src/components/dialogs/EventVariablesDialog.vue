<template>
  <q-dialog v-model='model' persistent full-width full-height position="right">
    <q-card class="q-pa-none q-ml-xl">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Node: {{ store.getters.node_name(props.nodeNumber)}}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            Event: {{ store.getters.event_name(props.eventIdentifier) }}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <!-- Event index: {{ storedEventsIndex }} -->
          </div>
          <template v-slot:action>
            <q-btn v-if="(!numberOfChannels==0)" class="q-mx-xs q-my-none" color="blue" size="sm"
              label="channel names" @click="clickChannelNames()"/>
            <q-btn color="cyan-1" size="sm" text-color="black"
              label="update Module Descriptor" @click="clickUpdateModuleDescriptor()"/>
            <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Refresh" @click="clickRefresh()"/>
            <q-btn flat color="white" size="md" label="Close" v-close-popup @click="clickClose"/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card class="scroll no-margin q-py-none">
        <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">

          <q-card-section class="scroll no-margin q-py-none">
            <div class="text-h6" v-if="showDescriptorWarning">
              *** Descriptor not loaded for this node ***
            </div>
            <template v-slot:action>
              <q-btn color="cyan-1" size="sm" text-color="black"
                label="update Module Descriptor" @click="clickUpdateModuleDescriptor()"/>
            </template>
          </q-card-section>

          <q-card-section class="q-pa-none q-ma-none text-h6" v-if="eventVariableInformation">
            {{ eventVariableInformation }}
          </q-card-section>

          <div class="q-pa-xs row">

            <EventVariables v-if="store.state.nodeDescriptors[props.nodeNumber]"
              :configuration = processedEventVariableDescriptor
              :nodeNumber = props.nodeNumber
              :eventIdentifier = props.eventIdentifier>
            </EventVariables>

          </div>
          <q-separator />

          <q-card-section class="q-pa-none" v-if="showRawVariables">
            <EventRawVariables
              :nodeNumber = nodeNumber
              :eventIdentifier = props.eventIdentifier
            />
            <q-separator />
          </q-card-section>

          <q-card-section class="q-pa-xs" v-if="showStoredEventJSON">
            <div class="q-pa-xs row">
              <div class="text-primary text-h6">Stored event<br></div>
              <div class="text-body2">
                <pre>{{ store.state.nodes[nodeNumber].storedEventsNI[eventIdentifier] }}</pre>
              </div>
            </div>
            <q-separator />
          </q-card-section>

          <q-card-section class="q-pa-xs" v-if="showVariablesDescriptor">
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
        <q-btn flat label="Toggle stored event view" @click="clickToggleStoredEvent()"/>
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

  <WaitingOnBusTrafficDialog v-model='showWaitingOnBusTrafficDialog'
    callingModule = "EventVariablesDialog"
    :message = WaitingOnBusTrafficMessage
    @WaitingOnBusTrafficDialogEvent="WaitingOnBusTrafficDialogReturn = $event"
  />



</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import { useQuasar, useTimeout } from 'quasar'
import {sleep} from "components/functions/utils.js"
import {timeStampedLog} from "components/functions/utils.js"
import {createNewEvent} from "components/functions/EventFunctions.js"
import EventVariables from "components/modules/common/EventVariables"
import EventRawVariables from "components/modules/common/EventRawVariables"
import NodeBackupDialog from "components/dialogs/NodeBackupDialog"
import NodeChannelNamesDialog from "./NodeChannelNamesDialog.vue";
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog"
import MDFDialog from "components/dialogs/MDFDialog";
import { replaceChannelTokens } from "../functions/utils";
import { getNumberOfChannels } from "../functions/NodeFunctions";

const $q = useQuasar()
const { registerTimeout } = useTimeout()
const store = inject('store')
const name = "EventVariablesDialog"

const showWaitingOnBusTrafficDialog = ref(false)
const showRawVariables = ref(false)
const showNodeChannelNamesDialog = ref(false)
const showDescriptorWarning = ref(false)
const showMDFDialog = ref(false)
const showVariablesDescriptor = ref(false)
const showStoredEventJSON = ref(false)
const eventVariableInformation = ref()
const processedEventVariableDescriptor = ref()
const numberOfChannels=ref(0)
const WaitingOnBusTrafficDialogReturn = ref('')
const WaitingOnBusTrafficMessage = ref('')
const showNodeBackupDialog = ref(false)
var DialogOpenedTimestamp = Date.now()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, default: 0 },
  eventIdentifier: {type: String, required: true },
  newEvent:  { type: Boolean, default: false }
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
watch(model, () => {
  //timeStampedLog(name + `: WATCH model`)
  if (model.value == true){
    DialogOpenedTimestamp = Date.now()
    showVariablesDescriptor.value = false
    if (variablesDescriptor.value == undefined){
      showRawVariables.value = true
      showDescriptorWarning.value = true
    } else {
      showRawVariables.value = false
      showDescriptorWarning.value = false
      processedEventVariableDescriptor.value = variablesDescriptor.value
      eventVariableInformation.value = store.state.nodeDescriptors[props.nodeNumber].eventVariableInformation
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
    processedEventVariableDescriptor.value = replaceChannelTokens(store, variablesDescriptor.value, props.nodeNumber)
    channelNamesNotfication()
  }, 300) // arbitrary timeout of 300mS seems to allow dialog to be displayed
}


//
//
watch(showNodeChannelNamesDialog, () => {
  //timeStampedLog(name + `: WATCH showNodeChannelNamesDialog: ${showNodeChannelNamesDialog.value}`)
  try{
    if (showNodeChannelNamesDialog.value == false) {
      updateChannelNames()
    }
  } catch {}
})

// need to know if descriptor changed, could be updated import
//
const variablesDescriptor = computed(() =>{
  var obj = undefined
  try{
    obj = store.state.nodeDescriptors[props.nodeNumber].eventVariables
  } catch{}
  return obj
})

//
//
watch(variablesDescriptor, () => {
  //timeStampedLog(name + `: WATCH variablesDescriptor`)
  if (model.value == true){     // don't bother if not displayed
    if (variablesDescriptor.value == undefined){
      showRawVariables.value = true
      showDescriptorWarning.value = true
    } else {
      showDescriptorWarning.value = false
      eventVariableInformation.value = store.state.nodeDescriptors[props.nodeNumber].eventVariableInformation
      updateChannelNames()
    }
    //timeStampedLog(name + `: WATCH variablesDescriptor: getNumberOfChannels`)
    numberOfChannels.value = getNumberOfChannels(store, props.nodeNumber)
  }
})


//
//
onUpdated(async () => {
  //timeStampedLog(name + ': onUpdated:')
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

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
const clickClose = async () => {
  timeStampedLog(name +`: clickClose: node ` + props.nodeNumber + ' eventIdentifier ' + props.eventIdentifier)
  if (props.newEvent){
    // An event will be created, if it doesn't exist, when any variable is changed (EVLRN)
    // if it's a new event, in the case no variable was changed, ensure an event was created
    // by setting EV1
    // and then refresh all events as index may have changed
    timeStampedLog(name +`: clickClose: new event`)
    try {
      var nodeEntry = store.state.nodes[props.nodeNumber]
      try{
        var eventVariableValue = nodeEntry.storedEventsNI[props.eventIdentifier].variables[1]
        if (eventVariableValue == undefined) {eventVariableValue = 0}
      } catch (err){
        createNewEvent (store, props.nodeNumber, props.eventIdentifier)
        eventVariableValue = 0
      }
      store.methods.event_teach_by_identifier(props.nodeNumber, props.eventIdentifier, 1, eventVariableValue)
      await sleep(250)
      store.methods.request_all_node_events(props.nodeNumber)
    } catch (err){
      timeStampedLog(name + ': clickClose ' + err)
    }
  }
  // now look at backup notification
  let nodeModified = ((store.state.nodes[props.nodeNumber].NodeModifiedTimestamp-DialogOpenedTimestamp) > 0) ? true : false
  //timeStampedLog(name + `: clickClose: nodeModified ${nodeModified}`)
  if((nodeModified) && (store.state.notification_settings.backup_notify)) {
    $q.notify({
      message: 'Variables changed',
      caption: 'Do you want to take a backup?',
      timeout: 0,
      position: 'center',
      color: 'primary',
      actions: [
        { label: 'YES', color: 'white', handler: async () => {
          showNodeBackupDialog.value=true
        } },
        { label: 'NO', color: 'white', handler: () => { } }
      ]
    })
  }
}

//
//
const clickRefresh = async () => {
  timeStampedLog(name + `: clickRefresh`)
  store.methods.request_event_variables_by_identifier(props.nodeNumber, props.eventIdentifier)
  WaitingOnBusTrafficMessage.value = "Loading Event Variables"
  showWaitingOnBusTrafficDialog.value = true
}

//
//
const clickToggleVariablesDescriptor = () => {
  timeStampedLog(name + `: clickToggleVariablesDescriptor`)
  showVariablesDescriptor.value = showVariablesDescriptor.value ? false : true
}

//
//
const clickToggleRaw = () => {
  timeStampedLog(name + `: clickToggleRaw`)
  showRawVariables.value = showRawVariables.value ? false : true
}

//
//
const clickToggleStoredEvent = () => {
  timeStampedLog(name + `: clickToggleStoredEvents:`)
  showStoredEventJSON.value = showStoredEventJSON.value ? false : true
}

//
//
const clickUpdateModuleDescriptor = () => {
  timeStampedLog(name + `: clickUpdateModuleDescriptor`)
  store.methods.request_matching_mdf_list(props.nodeNumber, "USER")
  store.methods.request_matching_mdf_list(props.nodeNumber, "SYSTEM")
  showMDFDialog.value = true
}

</script>

<style scoped>

</style>
