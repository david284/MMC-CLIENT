<template>
    <q-dialog v-model='model' persistent  full-width full-height>
      <q-card class="q-pa-none q-ma-none">

        <q-card-section class="q-pa-none q-ma-none">
          <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
            <div class="text-h6">
              JSON Dialog
            </div>
            <template v-slot:action>
              <q-btn flat color="white" size="md" label="Close" v-close-popup/>
            </template>
          </q-banner>
        </q-card-section>


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
          <q-tab name="busEvents" label="Bus Events"/>
          <q-tab name="cbusErrors" label="Cbus Errors"/>
          <q-tab name="layout" label="Layout"/>
          <q-tab name="layouts" label="Layouts"/>
          <q-tab name="nodes" label="Nodes"/>
          <q-tab name="nodeDescriptors" label="Node Descriptors"/>
          <q-tab name="nodeDescriptorList" label="Node Descriptor Lists"/>
          <q-tab name="restoredData" label="RestoredData"/>
          <q-tab name="server" label="Server"/>
          <q-tab name="serverStatus" label="server Status"/>
          <q-tab name="traffic" label="Traffic"/>
        </q-tabs>
        <q-tab-panels v-model="tab" animated>

          <q-tab-panel name="busEvents">
            <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
              <div class="text-h6">Events</div>
              <pre>
                {{ store.state.busEvents }}
              </pre>
            </q-card-section>
          </q-tab-panel>

          <q-tab-panel name="cbusErrors">
            <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
              <div class="text-h6">Cbus Errors</div>
              <pre>
              {{ store.state.cbus_errors }}
              </pre>
            </q-card-section>
          </q-tab-panel>

          <q-tab-panel name="layout">
            <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
              <div class="text-h6">Layout</div>
              <pre>
              {{ store.state.layout }}
              </pre>
            </q-card-section>
          </q-tab-panel>

          <q-tab-panel name="layouts">
            <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
              <div class="text-h6">Layouts</div>
              <pre>
              {{ store.state.layouts_list }}
              </pre>
            </q-card-section>
          </q-tab-panel>

          <q-tab-panel name="nodeDescriptorList">
            <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
              <div class="text-h6">Descriptor List</div>
              <pre>
                {{ store.state.nodeDescriptorList }}
              </pre>
            </q-card-section>
          </q-tab-panel>

          <q-tab-panel name="nodeDescriptors">
            <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
              <div class="text-h6">Node Descriptors</div>
              <pre>
                {{ store.state.nodeDescriptors }}
              </pre>
            </q-card-section>
          </q-tab-panel>

          <q-tab-panel name="nodes">
            <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
              <div class="text-h6">Nodes</div>
              <pre>
                {{ store.state.nodes }}
              </pre>
            </q-card-section>
          </q-tab-panel>

          <q-tab-panel name="restoredData">
            <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
              <div class="text-h6">restoredData</div>
              <pre>
                {{ store.state.restoredData }}
              </pre>
            </q-card-section>
          </q-tab-panel>

          <q-tab-panel name="server">
            <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
              <div class="text-h6">Server</div>
              <pre>
                {{ store.state.server }}
              </pre>
            </q-card-section>
          </q-tab-panel>

          <q-tab-panel name="serverStatus">
            <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
              <div class="text-h6">Server Status</div>
              <pre>
                {{ store.state.serverStatus }}
              </pre>
            </q-card-section>
          </q-tab-panel>

          <q-tab-panel name="traffic">
            <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none">
              <div class="text-h6">Node Traffic</div>
              <pre>
              {{ store.state.nodeTraffic }}
              </pre>
            </q-card-section>
          </q-tab-panel>

        </q-tab-panels>
      </q-card>

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
