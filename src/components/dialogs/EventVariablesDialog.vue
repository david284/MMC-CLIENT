<template>

  <q-dialog v-model='model' persistent full-width> 
    <q-card class="q-pa-sm">
      <q-card-section>
        <div class="text-h6">Event Variables for event : {{ store.getters.event_name(props.eventIdentifier) }}</div>
      </q-card-section>


      <div class="q-pa-none row">

        <div v-for="item in eventVariables" :key="item">
          <EventVariableBitArray v-if="(item.type=='EventVariableBitArray') && (isVisible(item))"
                                :nodeNumber = "props.nodeNumber"
                                :eventIndex = props.eventIndex
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

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Close" v-close-popup/>
      </q-card-actions>

      <q-card-actions align="left" class="text-primary">
        <q-btn flat label="Toggle raw view" @click="clickToggleRaw()"/>
      </q-card-actions>

      <div class="q-pa-none row" v-if="showRawVariables">
        <EventVariableRaw
          :eventVariableIndex="n"
          :nodeNumber="props.nodeNumber"
          :eventIndex = props.eventIndex
          v-for="n in store.state.nodes[props.nodeNumber].parameters[5]"
          :key="n">
        </EventVariableRaw>
      </div>

      <div class="q-pa-xs row">
        <p v-if="store.state.debug">
          Debug: event variables<br>
          <pre>
            {{ store.state.nodes[props.nodeNumber].storedEvents[props.eventIndex] }}
          </pre>
        </p>
      </div>




    </q-card>
  </q-dialog>


</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import EventVariableBitArray from "components/modules/common/EventVariableBitArray"
import EventVariableBitSingle from "components/modules/common/EventVariableBitSingle"
import EventVariableGroup from "components/modules/common/EventVariableGroup"
import EventVariableNumber from "components/modules/common/EventVariableNumber"
import EventVariableRaw from "components/modules/common/EventVariableRaw"
import EventVariableSelect from "components/modules/common/EventVariableSelect"
import EventVariableSlider from "components/modules/common/EventVariableSlider"
import EventVariableTabs from "components/modules/common/EventVariableTabs"
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";


const store = inject('store')
const eventVariables = ref()
const showRawVariables = ref(false)


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

watch(props.nodeNumber, () => {
  console.log('NodeVariableDialog - watch nodeNumber')
})

const isVisible = (item) =>{
      var result = true
      if (item.visibilityLogic) {
        result = parseLogicElement(item.visibilityLogic, store)
      }
      console.log(`isVisible: ` + result + ' ' + item.type)
      return result
    }


onBeforeMount(() => {
})

onMounted(() => {
})


onUpdated(() => {
  console.log('EventVariablesDialog onUpdated')
  if (props.nodeNumber){
    console.log('NodeVariableDialog onUpdated - nodeNumber ' + props.nodeNumber)
    
    if (store.state.nodeDescriptors[props.nodeNumber] != undefined){
      eventVariables.value = store.state.nodeDescriptors[props.nodeNumber].eventVariables
    }
    store.methods.request_all_event_variables(
      props.nodeNumber,
      props.eventIndex,
      100,
      store.state.nodes[props.nodeNumber].parameters[5]
    )
  }
})

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