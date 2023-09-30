<template>
  <div class="q-pa-md" >
    <q-banner inline-actions>
      <div class="text-h6">
        {{Title}}
      </div>
      <template v-slot:action>
        <q-btn color="negative" label="<Back" @click="showEventsList" no-caps/>
      </template>
    </q-banner>
  </div>
  
  <div class="q-pa-none row">

    <div v-for="item in eventVariables" :key="item">
      <EventVariableBitArray v-if="(item.type=='EventVariableBitArray') && (isVisible(item))"
                            :nodeNumber = "store.state.selected_node"
                            :eventIndex = store.state.selected_event_index
                            :eventVariableIndex=item.eventVariableIndex
                            :bitCollection = item.bitCollection
                            :displayTitle="item.displayTitle"
                            :displaySubTitle="item.displaySubTitle">
      </EventVariableBitArray>
      <EventVariableBitSingle v-if="(item.type=='EventVariableBitSingle') && (isVisible(item))"
                            :nodeNumber = "store.state.selected_node"
                            :eventIndex = store.state.selected_event_index
                            :eventVariableIndex=item.eventVariableIndex
                            :bit = "item.bit"
                            :displayTitle="item.displayTitle"
                            :displaySubTitle="item.displaySubTitle">
      </EventVariableBitSingle>
      <EventVariableGroup v-if="(item.type=='EventVariableGroup') && (isVisible(item))"
                    :configuration = item>
      </EventVariableGroup>
      <EventVariableNumber v-if="(item.type=='EventVariableNumber') && (isVisible(item))"
                  :node-number=store.state.selected_node
                  :eventIndex = store.state.selected_event_index
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
                        :nodeNumber="store.state.selected_node"
                        :eventIndex = "store.state.selected_event_index"
                        :eventVariableIndex= "item.eventVariableIndex"
                        :bitMask = "item.bitMask"
                        :displayTitle="item.displayTitle"
                        :displaySubTitle="item.displaySubTitle"
                        :options= "item.options">
      </EventVariableSelect>
      <EventVariableSlider v-if="(item.type=='EventVariableSlider') && (isVisible(item))"
                            :node-number="store.state.selected_node"
                            :eventIndex = "store.state.selected_event_index"
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
  <div class="q-pa-none row">
    <h6>Raw View</h6>
  </div>
  <div class="q-pa-none row">
    <EventVariableRaw :eventVariableIndex="n"
    :nodeNumber="store.state.selected_node"
                  :eventIndex = store.state.selected_event_index
                  v-for="n in store.state.nodes[store.state.selected_node].parameters[5]"
                  :key="n">
    </EventVariableRaw>
  </div>
</template>

<script>
import {inject, onBeforeMount, ref} from "vue";
import EventVariableBitArray from "components/modules/common/EventVariableBitArray"
import EventVariableBitSingle from "components/modules/common/EventVariableBitSingle"
import EventVariableGroup from "components/modules/common/EventVariableGroup"
import EventVariableNumber from "components/modules/common/EventVariableNumber"
import EventVariableRaw from "components/modules/common/EventVariableRaw"
import EventVariableSelect from "components/modules/common/EventVariableSelect"
import EventVariableSlider from "components/modules/common/EventVariableSlider"
import EventVariableTabs from "components/modules/common/EventVariableTabs"
import DefaultInfo from "components/modules/default/DefaultInfo"
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";

export default {
  name: "DefaultVariables",
  components: {
    EventVariableBitArray,
    EventVariableBitSingle,
    EventVariableGroup,
    EventVariableNumber,
    EventVariableRaw,
    EventVariableSelect,
    EventVariableSlider,
    EventVariableTabs
  },
  setup() {
    const store = inject('store')
    const eventVariables = ref()
    const eventIdentifier = store.state.nodes[store.state.selected_node].storedEvents[store.state.selected_event_index].eventIdentifier
    const producerNode = parseInt(eventIdentifier.substr(0, 4), 16)
    const eventNumber = parseInt(eventIdentifier.substr(4, 4), 16)
    const Title = createTitle();
    onBeforeMount(() => {
      console.log('Default2EventVariables')
      if (store.state.nodes[store.state.selected_node].variableConfig != undefined) {
        if (store.state.nodes[store.state.selected_node].variableConfig.eventVariables != undefined){
          eventVariables.value = store.state.nodes[store.state.selected_node].variableConfig.eventVariables
        }
      }
      store.methods.request_all_event_variables(
        store.state.selected_node,
        store.state.selected_event_index,
        100,
        store.state.nodes[store.state.selected_node].parameters[5]
      )
//      console.log(`Default2EventVariables: ` + JSON.stringify(store.state.nodes[store.state.selected_node].storedEvents[store.state.selected_event_index]))
//      console.log(`Default2EventVariables: config: ` + JSON.stringify(eventVariables.value))
//      console.log(`Default2EventVariables: number of event variables: ` + JSON.stringify(store.state.nodes[store.state.selected_node].parameters[5]))
    })


    function createTitle(){
      var title = 'event: node ' + producerNode + ' event ' + eventNumber
      return title
    }

    function showEventsList () {
      console.log(`showEventsList`)
      store.methods.update_event_component("Default2EventsList")
    }

    function isVisible(item){
      var result = true
      if (item.visibilityLogic) {
        result = parseLogicElement(item.visibilityLogic, store, store.state.selected_event_index)
      }
      console.log(`isVisible: ` + result + ' ' + item.type)
      return result
    }
      
    return {store, 
      EventVariableRaw, 
      eventVariables, 
      showEventsList, 
      eventIdentifier, 
      producerNode, 
      eventNumber, 
      Title,
      isVisible}
  }
}


</script>

<style scoped>

</style>
