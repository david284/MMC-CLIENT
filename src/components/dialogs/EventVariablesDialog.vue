<template>
  <q-dialog v-model='model' persistent full-width full-height> 
    <q-card class="q-pa-none q-ma-none">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Event Variables for event :  {{ store.getters.event_name(props.eventIdentifier) }}
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
            <template v-slot:action>
              <q-btn color="cyan-1" size="sm" text-color="black" 
                label="update Module Descriptor" @click="clickUpdateModuleDescriptor()"/>
            </template>
          </q-card-section>


          <div class="q-pa-xs row">

            <div v-for="item in variablesDescriptor" :key="item">
              <EventVariableBitArray v-if="(item.type=='EventVariableBitArray') && (isVisible(item))"
                                    :nodeNumber = "props.nodeNumber"
                                    :eventIndex = "props.eventIndex"
                                    :eventVariableIndex=item.eventVariableIndex
                                    :bitCollection = item.bitCollection
                                    :displayTitle="item.displayTitle"
                                    :displaySubTitle="item.displaySubTitle">
              </EventVariableBitArray>
              <EventVariableBitSingle v-if="(item.type=='EventVariableBitSingle') && (isVisible(item))"
                                    :nodeNumber = "props.nodeNumber"
                                    :eventIndex = props.eventIndex
                                    :eventVariableIndex=item.eventVariableIndex
                                    :bit = "item.bit"
                                    :displayTitle="item.displayTitle"
                                    :displaySubTitle="item.displaySubTitle">
              </EventVariableBitSingle>
              <EventVariableGroup v-if="(item.type=='EventVariableGroup') && (isVisible(item))"
                            :configuration = item>
              </EventVariableGroup>
              <EventVariableNumber v-if="(item.type=='EventVariableNumber') && (isVisible(item))"
                          :node-number=props.nodeNumber
                          :eventIndex = props.eventIndex
                          :eventVariableIndex= "item.eventVariableIndex"
                          :displayTitle="item.displayTitle"
                          :displaySubTitle="item.displaySubTitle"
                          :startBit = "item.startBit"
                          :endBit = "item.endBit"
                          :displayOffset = "item.displayOffset"
                          :min = "item.min"
                          :max = "item.max"
                          :configuration = item>
              </EventVariableNumber>
              <EventVariableSelect v-if="(item.type=='EventVariableSelect') && (isVisible(item))"
                                :nodeNumber="props.nodeNumber"
                                :eventIndex = "props.eventIndex"
                                :eventVariableIndex= "item.eventVariableIndex"
                                :bitMask = "item.bitMask"
                                :displayTitle="item.displayTitle"
                                :displaySubTitle="item.displaySubTitle"
                                :options= "item.options">
              </EventVariableSelect>
              <EventVariableSlider v-if="(item.type=='EventVariableSlider') && (isVisible(item))"
                                    :node-number="props.nodeNumber"
                                    :eventIndex = "props.eventIndex"
                                    :eventVariableIndex= "item.eventVariableIndex"
                                    :displayTitle="item.displayTitle"
                                    :displaySubTitle = "item.displaySubTitle"
                                    :displayScale="item.displayScale"
                                    :displayUnits="item.displayUnits"
                                    :displayOffset = "item.displayOffset"
                                    :min = "item.min"
                                    :max = "item.max"
                                    :startBit = "item.startBit"
                                    :endBit = "item.endBit">
              </EventVariableSlider>
              <EventVariableTabs v-if="(item.type=='EventVariableTabs') && (isVisible(item))"
                          :configuration=item>
              </EventVariableTabs>
            </div>
          </div>

          <q-separator />

          <q-card-section class="q-pa-xs row" v-if="showRawVariables">
            <EventVariableRaw
              :eventVariableIndex="n"
              :nodeNumber="props.nodeNumber"
              :eventIndex = props.eventIndex
              v-for="n in store.state.nodes[props.nodeNumber].parameters[5]"
              :key="n">
            </EventVariableRaw>
            <q-separator />
          </q-card-section>

          <q-card-section class="q-pa-xs" v-if="showVariablesDescriptor">
            <div class="q-pa-xs row">
              <div class="text-body1">Variables descriptor<br></div>
              <div class="text-body2">
                <pre>{{ variablesDescriptor }}</pre>
              </div>
            </div>
            <q-separator />
          </q-card-section>


          <q-card-section class="q-pa-xs" v-if="showStoredEventJSON">
            <div class="q-pa-xs row">
              <div class="text-body1">Stored event<br></div>
              <div class="text-body2">
                <pre>{{ store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex] }}</pre>
              </div>
            </div>
            <q-separator />
          </q-card-section>


        </q-card-section>
      </q-card>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Toggle stored event view" @click="clickToggleStoredEvent()"/>
        <q-btn flat label="Toggle variable descriptor view" @click="clickToggleVariablesDescriptor()"/>
        <q-btn flat label="Toggle raw view" @click="clickToggleRaw()"/>
      </q-card-actions>

    </q-card>
  </q-dialog>

  <manageModuleDescriptorsDialog v-model='showManageModuleDescriptorsDialog'/>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import { useQuasar } from 'quasar'
import EventVariableBitArray from "components/modules/common/EventVariableBitArray"
import EventVariableBitSingle from "components/modules/common/EventVariableBitSingle"
import EventVariableGroup from "components/modules/common/EventVariableGroup"
import EventVariableNumber from "components/modules/common/EventVariableNumber"
import EventVariableRaw from "components/modules/common/EventVariableRaw"
import EventVariableSelect from "components/modules/common/EventVariableSelect"
import EventVariableSlider from "components/modules/common/EventVariableSlider"
import EventVariableTabs from "components/modules/common/EventVariableTabs"
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";
import manageModuleDescriptorsDialog from "components/dialogs/ManageModuleDescriptorsDialog";


const $q = useQuasar()
const store = inject('store')
const name = "EventVariablesdialog"
const variablesDescriptor = ref()
const showRawVariables = ref(false)
const showDescriptorWarning = ref(false)
const showManageModuleDescriptorsDialog = ref(false)
const showVariablesDescriptor = ref(false)
const showStoredEventJSON = ref(false)


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true },
  eventIndex: {type: Number, required: true },
  eventIdentifier: {type: String, required: true }
})


const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

watch(model, () => {
  console.log(name + `: WATCH model`)
  showRawVariables.value = false
  showVariablesDescriptor.value = false
})



watch(props.nodeNumber, () => {
  console.log(name +': - watch nodeNumber')
})

watch(props.eventIndex, () => {
  console.log(name +': - watch eventIndex')
  if (props.eventIndex){
    store.state.selected_event_index = props.eventIndex
    console.log(name + ': selected_event_index: ' + JSON.stringify(store.state.selected_event_index))
  }
})

const isVisible = (item) =>{
      var result = true
      if (item.visibilityLogic) {
        result = parseLogicElement(item.visibilityLogic, store, store.state.selected_event_index)
      }
      console.log(name + `: isVisible: ` + result + ' ' + item.type)
      return result
    }


onBeforeMount(() => {
})

onMounted(() => {
})


onUpdated(() => {
  console.log(name + ': onUpdated')
  if ((props.nodeNumber) && (props.eventIndex)){
    console.log(name + ': onUpdated - nodeNumber ' + props.nodeNumber)
    if (store.state.nodeDescriptors[props.nodeNumber] != undefined){
      variablesDescriptor.value = store.state.nodeDescriptors[props.nodeNumber].eventVariables
      showDescriptorWarning.value = false
    } else {
      variablesDescriptor.value = {}
      showRawVariables.value = true
      showDescriptorWarning.value = true
    }
    checkFileLoad()
    // many downstream components depend on selected_event_index being set
    store.state.selected_event_index = props.eventIndex
  }
})

// raise notification if nodeDescriptor file not present
const checkFileLoad = () => {
  console.log(name + `: checkFileLoad`)
  if (store.state.loadFile_notification_raised[props.nodeNumber] != true) {
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
      store.state.loadFile_notification_raised[props.nodeNumber] = true;
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
  console.log(name +`: clickClose`)
  showRawVariables.value = false
  variablesDescriptor.value={}
}

const clickToggleVariablesDescriptor = () => {
  console.log(name + `: clickToggleVariablesDescriptor`)
  if (showVariablesDescriptor.value){
    showVariablesDescriptor.value = false
  } else {
    showVariablesDescriptor.value = true
  }
}

const clickToggleRaw = () => {
  console.log(name + `: clickToggleRaw`)
  if (showRawVariables.value){
    showRawVariables.value = false
  } else {
    showRawVariables.value = true
  }
}

const clickToggleStoredEvent = () => {
  console.log(name + `: clickToggleStoredEvent`)
  showStoredEventJSON.value = showStoredEventJSON.value ? false : true
}

const clickUpdateModuleDescriptor = () => {
  console.log(name + `: clickUpdateModuleDescriptor`)
  showManageModuleDescriptorsDialog.value = true
}


</script>

<style scoped>

</style>
