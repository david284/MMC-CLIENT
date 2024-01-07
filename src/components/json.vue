<template>
  <div>
    <div>
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="nodes" label="Nodes"/>
          <q-tab name="events" label="Events"/>
          <q-tab name="layout" label="Layout"/>
          <q-tab name="layouts" label="Layouts"/>
          <q-tab name="cbusErrors" label="Cbus Errors"/>
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="nodes">
            <div class="text-h6">Nodes</div>

            <pre>
              {{ store.state.nodes }}
            </pre>
          </q-tab-panel>

          <q-tab-panel name="events">
            <div class="text-h6">Events</div>
            <pre>
              {{ store.state.events }}
            </pre>
          </q-tab-panel>

          <q-tab-panel name="layout">
            <div class="text-h6">Layout</div>
            <pre>
            {{ store.state.layout }}
            </pre>
          </q-tab-panel>

          <q-tab-panel name="layouts">
            <div class="text-h6">List of Layouts</div>
            <pre>
            {{ store.state.layouts_list }}
            </pre>
          </q-tab-panel>

          <q-tab-panel name="cbusErrors">
            <div class="text-h6">Cbus Errors</div>
            <pre>
            {{ store.state.cbus_errors }}
            </pre>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
      <!--      <VueJsonPretty :data="store.state.nodes"
                           collapsedOnClickBrackets=True
                           deepCollapseChildren=True
                           :deep="1">
            </VueJsonPretty>-->
    </div>
  </div>
</template>

<script>
import {ref, inject} from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

export default {
  name: "JSON",
  // components: {VueJsonPretty},
  setup() {
    const store = inject('store')
    return {
      tab: ref('nodes'),
      store
    }
  }
}
</script>

<style scoped>

</style>
