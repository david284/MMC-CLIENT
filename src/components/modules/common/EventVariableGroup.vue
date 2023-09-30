<template>
  <div style="border:2px solid grey">

    <div class = "GroupTitle"> {{ configuration.displayTitle }}</div>

    <div class="q-pa-xs row">
      <div v-for="item in configuration.groupItems" :key="item" >

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
      <EventVariableNumber v-if="(item.type=='EventVariableNumber') && (isVisible(item))"
                  :node-number=store.state.selected_node
                  :eventIndex = store.state.selected_event_index
                  :eventVariableIndex= "item.eventVariableIndex"
                  :startBit = "item.startBit"
                  :endBit = "item.endBit"
                  :displayOffset = "item.displayOffset"
                  :displayTitle="item.displayTitle"
                  :displaySubTitle="item.displaySubTitle"
                  :min = "item.min"
                  :max = "item.max">
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
   </div>
</template>


<script>
import {inject, ref, onMounted, computed, watch} from "vue";
import EventVariableBitArray from "components/modules/common/EventVariableBitArray"
import EventVariableBitSingle from "components/modules/common/EventVariableBitSingle"
import EventVariableNumber from "components/modules/common/EventVariableNumber"
import EventVariableSelect from "components/modules/common/EventVariableSelect"
import EventVariableSlider from "components/modules/common/EventVariableSlider"
import EventVariableTabs from "components/modules/common/EventVariableTabs"
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";

export default {

  components: {
    EventVariableBitArray,
    EventVariableBitSingle,
    EventVariableNumber,
    EventVariableSelect,
    EventVariableSlider,
    EventVariableTabs
  },

  props: {
    configuration: Object
  },
  setup(props) {
    const store = inject('store')
    onMounted(() => {
      console.log("Event Group onMounted")
      console.log('Event Group props: ' + JSON.stringify(props))
    })

    function isVisible(item){
      var result = true
      if (item.visibilityLogic) {
        result = parseLogicElement(item.visibilityLogic, store, store.state.selected_event_index)
      }
      console.log(`isVisible: ` + result + ' ' + item.type)
      return result
    }

    return {store, isVisible }
  }
}
</script>


<style scoped>
.GroupTitle {
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
}
</style>
