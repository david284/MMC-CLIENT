<template>

  <q-dialog v-model='model' persistent> 
    <q-card class="q-pa-sm" style="max-width: 500px">
      <q-card-section>
        <div class="text-h6">Parameter Information for {{ store.getters.node_name(store.state.selected_node) }}</div>
      </q-card-section>

       <q-card-section>
        <node-parameter Name="Node Number"
                        :Value="store.state.nodes[store.state.selected_node].nodeNumber">
        </node-parameter>
        <node-parameter Name="Events Currently Stored"
                        :Value="store.state.nodes[store.state.selected_node].eventCount">
        </node-parameter>
        <node-parameter Name="Manufacturer"
                        :Value="store.state.nodes[store.state.selected_node].moduleManufacturerName">
        </node-parameter>
        <node-parameter Name="Module"
                        :Value="store.state.nodes[store.state.selected_node].moduleName">
        </node-parameter>
        <node-parameter Name="Module Identifier"
                        :Value="store.state.nodes[store.state.selected_node].moduleIdentifier">
        </node-parameter>
        <node-parameter Name="Producer"
                        :Value="store.state.nodes[store.state.selected_node].producer">
        </node-parameter>
        <node-parameter Name="Consumer"
                        :Value="store.state.nodes[store.state.selected_node].consumer">
        </node-parameter>
        <node-parameter Name="Consume own Events"
                        :Value="store.state.nodes[store.state.selected_node].coe">
        </node-parameter>
        <node-parameter Name="Node Variables"
                        :Value="store.state.nodes[store.state.selected_node].parameters[6]">
        </node-parameter>
        <node-parameter Name="Events Supported"
                        :Value="store.state.nodes[store.state.selected_node].parameters[4]">
        </node-parameter>
        <node-parameter Name="Event Variables"
                        :Value="store.state.nodes[store.state.selected_node].parameters[5]">
        </node-parameter>
        <node-parameter Name="Filename"
                        :Value="moduleDescriptorFilename">
        </node-parameter>
        <node-parameter Name="CPU Name"
                        :Value="store.state.nodes[store.state.selected_node].cpuName">
        </node-parameter>
        <node-parameter Name="Interface"
                        :Value="store.state.nodes[store.state.selected_node].interfaceName">
        </node-parameter>
        <node-parameter Name="Firmware Version"
                        :Value="store.state.nodes[store.state.selected_node].parameters[7] +
							String.fromCharCode(store.state.nodes[store.state.selected_node].parameters[2])">
        </node-parameter>
        <node-parameter Name="Beta Version"
                        :Value="store.state.nodes[store.state.selected_node].parameters[20]">
        </node-parameter>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup/>
        </q-card-actions>
    </q-card>
  </q-dialog>


</template>


<script setup>

/************************************************************************************
      usage
      <DialogExampleCompositionAPI v-model='showAddEventDialog' />
      
************************************************************************************ */ 


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import NodeParameter from "components/modules/common/NodeParameter"

const store = inject('store')

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })




onBeforeMount(() => {
})

onMounted(() => {
})




</script>

<style scoped>

</style>
