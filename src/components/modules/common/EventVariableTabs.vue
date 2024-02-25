<template>
  <div class="no-padding no-margin">

    <!-- you have to set a width for the scrolling to work -->
    <!-- auto doesn't work, % gives flickering display -->
    <q-tabs v-model="selectedTab" outside-arrows narrow-indicator dense  style="max-width:92vw">
      <q-tab v-for="tab in tabPanels" :key="tab.displayTitle"
        :label="tab.displayTitle"
        :name="tab.displayTitle"
      />
    </q-tabs>

    <div class="no-padding no-margin">
      <q-tab-panels keep-alive v-model="selectedTab">
        <q-tab-panel v-for="tab in tabPanels" :key="tab.displayTitle" :name="tab.displayTitle" >

          <div class="no-padding no-margin row"  style="border:1px solid grey">
            <EventVariables
              :configuration = tab.items
              :nodeNumber = props.nodeNumber
              :eventIndex = props.eventIndex
              :eventIdentifier = props.eventIdentifier>
            </EventVariables>
          </div>

        </q-tab-panel>
      </q-tab-panels>
    </div>

  </div>
</template>
  

  <script setup>
  
  // composition API - uses ref()

  import { inject, ref, onMounted } from 'vue'
  import EventVariables from "components/modules/common/EventVariables"

  const props = defineProps({
    configuration: Object,
    nodeNumber: {type: Number, required: true },
    eventIndex: {type: Number, required: true },
    eventIdentifier: {type: String, required: true },
  })

    const tabPanels = ref()
    const selectedTab = ref()
    const store = inject('store')
    const name = 'EventVariableTabs'

    onMounted(() => {
      console.log(name + ': props: ' + JSON.stringify(props))
      tabPanels.value = props.configuration.tabPanels
      console.log(name + ': tabPanels: ' + JSON.stringify(tabPanels.value))
      selectedTab.value = tabPanels.value[0].displayTitle
    })


  </script>
  