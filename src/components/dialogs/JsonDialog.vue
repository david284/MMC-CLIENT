<template>

    <q-dialog v-model='model' persistent  full-width full-height>
      <q-card>

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          JSON Dialog
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="sm" label="Close" v-close-popup/>
        </template>
      </q-banner>


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
          <q-tab name="cbusErrors" label="Cbus Errors"/>
          <q-tab name="events" label="Events"/>
          <q-tab name="layout" label="Layout"/>
          <q-tab name="layouts" label="Layouts"/>
          <q-tab name="nodes" label="Nodes"/>
          <q-tab name="nodeDescriptors" label="Node Descriptors"/>
          <q-tab name="traffic" label="Traffic"/>
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="nodes">
            <div class="text-h6">Nodes</div>
            <pre>
              {{ store.state.nodes }}
            </pre>
          </q-tab-panel>

          <q-tab-panel name="nodeDescriptors">
            <div class="text-h6">Node Descriptors</div>
            <pre>
              {{ store.state.nodeDescriptors }}
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

          <q-tab-panel name="traffic">
            <div class="text-h6">Node Traffic</div>
            <pre>
            {{ store.state.nodeTraffic }}
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


        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Close" v-close-popup/>
        </q-card-actions>

      </q-card>
    </q-dialog>

</template>


<script setup>

/************************************************************************************
      usage
      <JsonDialog v-model='showJsonDialog' />
      
************************************************************************************ */ 


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "JsonDialog"
const tab = ref('nodes')


const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
  console.log(name + `: WATCH model`)
})


onBeforeMount(() => {
})

onMounted(() => {
})




</script>

<style scoped>

</style>
