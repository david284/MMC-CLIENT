<template>
  <q-dialog v-model='model' persistent full-width full-height position="right">
    <q-card class="q-pa-none q-ml-xl">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Node: {{ store.getters.node_name(props.nodeNumber)}}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span v-if="(store.getters.node_useEventIndex(nodeNumber))">
              {{ titleText }}: {{ eventIndex }}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
            event: {{ store.getters.event_name(props.eventIdentifier) }}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
          <template v-slot:action>
            <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="names">
              <q-menu auto-close>
                <q-list style="min-width: 100px">
                  <div v-for="(item, name) in store.state.nodeDescriptors[nodeNumber].tokens" :key="item">
                    <q-item>
                      <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" :label=name
                        @click="clickNamesMenu(name, item.maxNumber)" />
                    </q-item>
                  </div>
                </q-list>
              </q-menu>
            </q-btn>
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
              :eventIdentifier = props.eventIdentifier
              :eventIndex = props.eventIndex>
            </EventVariables>

          </div>
          <q-separator />

          <q-card-section class="q-pa-none" v-if="showRawVariables">
            <EventRawVariables
              :nodeNumber = nodeNumber
              :eventIdentifier = eventIdentifier
              :eventIndex = eventIndex
              :configuration = processedEventVariableDescriptor
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


  <NodeTokenNamesDialog v-model="showNodeTokenNamesDialog"
    :nodeNumber=nodeNumber
    :numberOfItems=numberOfTokenInstances
    :token = selectedToken
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
import * as EventFunctions from "components/functions/EventFunctions.js"
import {getLinkedEventVariables} from "components/modules/common/commonFunctions.js"
import * as utils from "components/functions/utils.js"
import {createNewEvent} from "components/functions/EventFunctions.js"
import EventVariables from "components/modules/common/EventVariables"
import EventRawVariables from "components/modules/common/EventRawVariables"
import NodeBackupDialog from "components/dialogs/NodeBackupDialog"
import NodeTokenNamesDialog from "./NodeTokenNamesDialog.vue"
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog"
import MDFDialog from "components/dialogs/MDFDialog";

const $q = useQuasar()
const { registerTimeout } = useTimeout()
const store = inject('store')
const name = "EventVariablesDialog"

const showWaitingOnBusTrafficDialog = ref(false)
const showRawVariables = ref(false)
const showDescriptorWarning = ref(false)
const showMDFDialog = ref(false)
const showVariablesDescriptor = ref(false)
const showStoredEventJSON = ref(false)
const eventVariableInformation = ref()
const processedEventVariableDescriptor = ref()
const WaitingOnBusTrafficDialogReturn = ref('')
const WaitingOnBusTrafficMessage = ref('')
const showNodeBackupDialog = ref(false)
var DialogOpenedTimestamp = Date.now()
const titleText = ref()
const showNodeTokenNamesDialog = ref(false)
const selectedToken = ref(null)
const numberOfTokenInstances = ref(0)

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, default: 0 },
  eventIdentifier: {required: true },
  eventIndex: {default: 0 },
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
  //utils.timeStampedLog(name + `: WATCH model`)
  if (model.value == true){
    DialogOpenedTimestamp = Date.now()
    showVariablesDescriptor.value = false
    if (variablesDescriptor.value == undefined){
      showRawVariables.value = true
      showDescriptorWarning.value = true
      processedEventVariableDescriptor.value = undefined
    } else {
      showRawVariables.value = false
      showDescriptorWarning.value = false
      processedEventVariableDescriptor.value = variablesDescriptor.value
      eventVariableInformation.value = store.state.nodeDescriptors[props.nodeNumber].eventVariableInformation
      updateDescriptorNames()
    }
    if (store.getters.node_useSlots(props.nodeNumber)){
      titleText.value = "slot"
    } else {
      titleText.value = "index"
    }
  }
})

// update the tokens in the variables descriptor object
// as it's a blocking call, need to allow this dialog to be displayed first
// so show a notification, then set a timeout before calling function
//
const updateDescriptorNames = () => {
  // create notification to alert that descriptor token replacement function is going to be called
  let descriptorNamesNotfication = $q.notify({
    message: 'updating names',
    caption: 'please wait....',
    timeout: 0,
    position: 'center',
    color: 'primary'
  })
  // set a timed callback
  registerTimeout(() => {
    //utils.timeStampedLog(name + `: registerTimeout`)
    processedEventVariableDescriptor.value = utils.replaceDescriptorTokens(store, variablesDescriptor.value, props.nodeNumber)
    descriptorNamesNotfication()
  }, 300) // arbitrary timeout of 300mS seems to allow dialog to be displayed
}

//
//
watch(showNodeTokenNamesDialog, () => {
  try{
    if (showNodeTokenNamesDialog.value == false) {
      updateDescriptorNames()
    }
    //processedNodeVariableDescriptor.value = utils.replaceDescriptorTokens(store, variablesDescriptor.value, props.nodeNumber)
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
  //utils.timeStampedLog(name + `: WATCH variablesDescriptor`)
  if (model.value == true){     // don't bother if not displayed
    if (variablesDescriptor.value == undefined){
      showRawVariables.value = true
      showDescriptorWarning.value = true
    } else {
      showDescriptorWarning.value = false
      eventVariableInformation.value = store.state.nodeDescriptors[props.nodeNumber].eventVariableInformation
      updateDescriptorNames()
    }
  }
})


//
//
onUpdated(async () => {
  //utils.timeStampedLog(name + ': onUpdated:')
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickClose = async () => {
  utils.timeStampedLog(name +`: clickClose: node ` + props.nodeNumber + ' eventIdentifier ' + props.eventIdentifier)
  if (props.newEvent){
    // An event will be created, if it doesn't exist, when any variable is changed (EVLRN)
    // if it's a new event, in the case no variable was changed, ensure an event was created
    // by setting EV1
    // and then refresh all events as index may have changed
    utils.timeStampedLog(name +`: clickClose: new event`)
    try {
      var nodeEntry = store.state.nodes[props.nodeNumber]
      try{
        var eventVariableValue = nodeEntry.storedEventsNI[props.eventIdentifier].variables[1]
        if (eventVariableValue == undefined) {eventVariableValue = 0}
      } catch (err){
        createNewEvent (store, props.nodeNumber, props.eventIdentifier)
        eventVariableValue = 0
      }

      EventFunctions.eventTeach(
        store,
        props.nodeNumber,
        props.eventIdentifier,
        props.eventIndex,
        1,
        eventVariableValue,
        true,
        getLinkedEventVariables(variablesDescriptor.value)
      )

      await utils.sleep(250)
      EventFunctions.requestAllNodeEvents(props.nodeNumber)
    } catch (err){
      utils.timeStampedLog(name + ': clickClose ' + err)
    }
  }
  // now look at backup notification
  let nodeModified = ((store.state.nodes[props.nodeNumber].NodeModifiedTimestamp-DialogOpenedTimestamp) > 0) ? true : false
  //utils.timeStampedLog(name + `: clickClose: nodeModified ${nodeModified}`)
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
const clickNamesMenu = (name, number) => {
  utils.timeStampedLog(name + `: clickNamesMenu ${name} ${number}`)
  selectedToken.value = name
  numberOfTokenInstances.value = number
  showNodeTokenNamesDialog.value = true
}

//
//
const clickRefresh = async () => {
  utils.timeStampedLog(name + `: clickRefresh`)
  store.methods.request_event_variables_by_identifier(props.nodeNumber, props.eventIdentifier)
  WaitingOnBusTrafficMessage.value = "Loading Event Variables"
  showWaitingOnBusTrafficDialog.value = true
}

//
//
const clickToggleVariablesDescriptor = () => {
  utils.timeStampedLog(name + `: clickToggleVariablesDescriptor`)
  showVariablesDescriptor.value = showVariablesDescriptor.value ? false : true
}

//
//
const clickToggleRaw = () => {
  utils.timeStampedLog(name + `: clickToggleRaw`)
  showRawVariables.value = showRawVariables.value ? false : true
}

//
//
const clickToggleStoredEvent = () => {
  utils.timeStampedLog(name + `: clickToggleStoredEvents:`)
  showStoredEventJSON.value = showStoredEventJSON.value ? false : true
}

//
//
const clickUpdateModuleDescriptor = () => {
  utils.timeStampedLog(name + `: clickUpdateModuleDescriptor`)
  store.methods.request_matching_mdf_list(props.nodeNumber, "USER")
  store.methods.request_matching_mdf_list(props.nodeNumber, "SYSTEM")
  showMDFDialog.value = true
}

</script>

<style scoped>

</style>
