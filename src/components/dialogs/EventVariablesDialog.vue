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

          <q-card-section class="text-h6" v-if="eventVariableInformation">
            {{ eventVariableInformation }}
          </q-card-section>

          <div class="q-pa-xs row">

            <EventVariables v-if="store.state.nodeDescriptors[props.nodeNumber]"
              :configuration = store.state.nodeDescriptors[props.nodeNumber].eventVariables
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

  <WaitingOnBusTrafficDialog v-model='showWaitingOnBusTrafficDialog'
    callingModule = "Event Variables"
    message = "Waiting for event variables loading"
  />


</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import { useQuasar } from 'quasar'
import {sleep} from "components/functions/utils.js"
import {createNewEvent} from "components/functions/EventFunctions.js"
import {refreshEventIndexes} from "components/functions/EventFunctions.js"
import EventVariables from "components/modules/common/EventVariables"
import EventRawVariables from "components/modules/common/EventRawVariables"
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog"
import MDFDialog from "components/dialogs/MDFDialog";

const $q = useQuasar()
const store = inject('store')
const name = "EventVariablesDialog"
const variablesDescriptor = ref()

const showWaitingOnBusTrafficDialog = ref(false)
const showRawVariables = ref(false)
const showDescriptorWarning = ref(false)
const showMDFDialog = ref(false)
const showVariablesDescriptor = ref(false)
const showStoredEventJSON = ref(false)
const eventVariableInformation = ref()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, default: 0 },
  eventIdentifier: {type: String, required: true },
  newEvent:  { type: Boolean, default: false }
})


const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

watch(model, () => {
//  console.log(name + `: WATCH model`)
  showRawVariables.value = false
  showVariablesDescriptor.value = false
//  console.log(name + ': watch model: props: ' + JSON.stringify(props))
})


/*
watch(props.nodeNumber, () => {
//  console.log(name +': watch nodeNumber')
})
*/

//
//
onUpdated(async () => {
//  console.log(name + ': onUpdated:') 
//  console.log(name + ': onUpdated: storedEventsNI for node ' + props.nodeNumber + ' ' + JSON.stringify(store.state.nodes[props.nodeNumber].storedEventsNI))
  try {
    if (props.nodeNumber){
    
      if (store.state.nodeDescriptors[props.nodeNumber] != undefined){
        variablesDescriptor.value = store.state.nodeDescriptors[props.nodeNumber].eventVariables
        eventVariableInformation.value = store.state.nodeDescriptors[props.nodeNumber].eventVariableInformation
        showDescriptorWarning.value = false
  //      console.log(name + ': onUpdated: variablesDescriptor valid')
      } else {
        variablesDescriptor.value = {}
        showRawVariables.value = true
        showDescriptorWarning.value = true
  //      console.log(name + ': onUpdated: variablesDescriptor empty')
      }
      
    } else {
      showRawVariables.value = true
    }
  } catch (err ) {
    console.log(name + ': onUpdated: error: ' + err)    
  }
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickClose = async () => {
  console.log(name +`: clickClose: node ` + props.nodeNumber + ' eventIdentifier ' + props.eventIdentifier)
  if (props.newEvent){
    // An event will be created, if it doesn't exist, when any variable is changed (EVLRN)
    // if it's a new event, in the case no variable was changed, ensure an event was created
    // by setting EV1
    // and then refresh all events as index may have changed
    console.log(name +`: clickClose: new event`)
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
      console.log(name + ': clickClose ' + err)        
    }
  }
}

//
//
const clickRefresh = async () => {
  console.log(name + `: clickRefresh`)
  // make sure the indexes are up to date
  await refreshEventIndexes(store, props.nodeNumber)
  store.methods.request_event_variables_by_identifier(props.nodeNumber, props.eventIdentifier)
  showWaitingOnBusTrafficDialog.value = true
}

//
//
const clickToggleVariablesDescriptor = () => {
  console.log(name + `: clickToggleVariablesDescriptor`)
  showVariablesDescriptor.value = showVariablesDescriptor.value ? false : true
}

//
//
const clickToggleRaw = () => {
  console.log(name + `: clickToggleRaw`)
  showRawVariables.value = showRawVariables.value ? false : true
}

//
//
const clickToggleStoredEvent = () => {
  console.log(name + `: clickToggleStoredEvents:`)
  showStoredEventJSON.value = showStoredEventJSON.value ? false : true
}

//
//
const clickUpdateModuleDescriptor = () => {
  console.log(name + `: clickUpdateModuleDescriptor`)
  store.methods.request_matching_mdf_list(props.nodeNumber, "USER")
  store.methods.request_matching_mdf_list(props.nodeNumber, "SYSTEM")
  showMDFDialog.value = true
}

</script>

<style scoped>

</style>
