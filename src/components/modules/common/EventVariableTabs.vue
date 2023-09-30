<template>
    <div class="q-pa-xs">

      <q-tabs v-model="selectedTab">
        <q-tab v-for="tab in tabPanels" :key="tab.displayTitle"
          :label="tab.displayTitle"
          :name="tab.displayTitle"
        />
      </q-tabs>

      <q-tab-panels keep-alive v-model="selectedTab">
        <q-tab-panel v-for="tab in tabPanels" :key="tab.displayTitle" :name="tab.displayTitle" >

          <div class="q-pa-md row"  style="border:1px solid grey">
            <div v-for="item in tab.items" :key="item">

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
              <EventVariableTabGroup v-if="(item.type=='EventVariableGroup') && (isVisible(item))"
                    :configuration = item>
              </EventVariableTabGroup>

            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>

    </div>
  </template>
  

  <script>
  
  // composition API - uses ref()

  import { inject, ref, onMounted } from 'vue'
  import EventVariableBitArray from "components/modules/common/EventVariableBitArray"
  import EventVariableBitSingle from "components/modules/common/EventVariableBitSingle"
  import EventVariableNumber from "components/modules/common/EventVariableNumber"
  import EventVariableSelect from "components/modules/common/EventVariableSelect"
  import EventVariableSlider from "components/modules/common/EventVariableSlider"
  import EventVariableTabGroup from "components/modules/common/EventVariableTabGroup"
  import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";

  export default {
    props: {
      configuration: Object
    },
    components: {
      EventVariableBitArray,
      EventVariableBitSingle,
      EventVariableNumber,
      EventVariableSelect,
      EventVariableSlider,
      EventVariableTabGroup
    },
    setup (props) {
      const tabPanels = ref()
      const selectedTab = ref()
      const store = inject('store')
      onMounted(() => {
        console.log('tabs props: ' + JSON.stringify(props))
        tabPanels.value = props.configuration.tabPanels
        console.log('tabs tabPanels: ' + JSON.stringify(tabPanels.value))
        selectedTab.value = tabPanels.value[0].displayTitle
      })

      function isVisible(item){
        var result = true
        if (item.visibilityLogic) {
          result = parseLogicElement(item.visibilityLogic, store, store.state.selected_event_index)
        }
        console.log(`isVisible: ` + result + ' ' + item.type)
        return result
      }

      return {
        store,
        selectedTab,
        tabPanels,
        isVisible
      }
    }
  }
  </script>
  