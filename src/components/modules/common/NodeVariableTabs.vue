<template>
  <div class="no-padding no-margin" >

    <!-- you have to set a width for the scrolling to work -->
    <!-- auto doesn't work, % gives flickering display -->
    <q-tabs v-model="selectedTab" outside-arrows narrow-indicator dense style="max-width:92vw">
      <q-tab v-for="tab in tabPanels" :key="tab.displayTitle"
        :label="tab.displayTitle"
        :name="tab.displayTitle"
      />
    </q-tabs>

    <q-tab-panels keep-alive v-model="selectedTab" class="no-padding no-margin" >
      <q-tab-panel v-for="tab in tabPanels" :key="tab.displayTitle" :name="tab.displayTitle"  class="no-padding no-margin">
          <div class="no-padding no-margin"  style="border:1px solid grey">
            <q-card-section class="q-py-none no-margin text-body1">
              <b>{{ tab.displaySubTitle }}</b>
            </q-card-section>
            <q-card-section class="no-padding no-margin row">
              <NodeVariables :configuration = tab.items />
            </q-card-section>
        </div>

      </q-tab-panel>
    </q-tab-panels>

  </div>
</template>
  

<script setup>

  // composition API - uses ref()

  import { inject, ref, onMounted, watch, onUpdated } from 'vue'
  import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";
  import NodeVariables from "components/modules/common/NodeVariables"


  const props = defineProps({
    configuration: Object
  })

  const name = 'NodeVariableTabsA'
  const tabPanels = ref()
  const selectedTab = ref()  
  const store = inject('store')
  const sourceName=ref("nvTabs")
  const tabWidth = ref("92vw")

  onMounted(() => {
    tabPanels.value = props.configuration.tabPanels
    selectedTab.value = tabPanels.value[0].displayTitle
  })

  watch(selectedTab, () => {
//    console.log(name + `: WATCH selectedTab ` + JSON.stringify(selectedTab.value))
  })


  function isVisible(item){
    var result = true
    if (item.visibilityLogic) {
      result = parseLogicElement(item.visibilityLogic, store)
    }
    console.log(name + `: isVisible: ` + result + ' ' + item.type)
    return result
  }

onUpdated(() => {
})

</script>


