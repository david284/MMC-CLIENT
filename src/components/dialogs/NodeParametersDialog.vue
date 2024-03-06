<template>

  <q-dialog v-model='model' persistent> 
    <q-card style="min-width: 700px">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Parameter Information for {{ store.getters.node_name(props.nodeNumber) }}
        </div>
        <template v-slot:action>
          <q-btn color="cyan-1" size="sm" text-color="black" 
            label="update Module Descriptor" @click="clickUpdateModuleDescriptor()"/>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

       <q-card-section>
        <node-parameter Name="Node Number"
                        :Value=store.state.nodes[props.nodeNumber].nodeNumber>
        </node-parameter>
        <node-parameter Name="Events Currently Stored"
                        :Value=store.state.nodes[props.nodeNumber].eventCount>
        </node-parameter>
        <node-parameter Name="Manufacturer"
                        :Value="store.state.nodes[props.nodeNumber].moduleManufacturerName">
        </node-parameter>
        <node-parameter Name="Module"
                        :Value="store.state.nodes[props.nodeNumber].moduleName">
        </node-parameter>
        <node-parameter Name="Module Identifier"
                        :Value="store.state.nodes[props.nodeNumber].moduleIdentifier">
        </node-parameter>
        <node-parameter Name="Producer"
                        :Value=store.state.nodes[props.nodeNumber].producer>
        </node-parameter>
        <node-parameter Name="Consumer"
                        :Value=store.state.nodes[props.nodeNumber].consumer>
        </node-parameter>
        <node-parameter Name="Consume own Events"
                        :Value=store.state.nodes[props.nodeNumber].coe>
        </node-parameter>
        <node-parameter Name="VLCB"
                        :Value=store.state.nodes[props.nodeNumber].VLCB>
        </node-parameter>
        <node-parameter Name="Node Variables"
                        :Value=store.state.nodes[props.nodeNumber].parameters[6]>
        </node-parameter>
        <node-parameter Name="Events Supported"
                        :Value=store.state.nodes[props.nodeNumber].parameters[4]>
        </node-parameter>
        <node-parameter Name="Event Variables"
                        :Value=store.state.nodes[props.nodeNumber].parameters[5]>
        </node-parameter>
        <node-parameter Name="CPU Name"
                        :Value="store.state.nodes[props.nodeNumber].cpuName">
        </node-parameter>
        <node-parameter Name="Interface"
                        :Value="store.state.nodes[props.nodeNumber].interfaceName">
        </node-parameter>
        <node-parameter Name="Firmware Version"
                        :Value="store.state.nodes[props.nodeNumber].parameters[7] +
							String.fromCharCode(store.state.nodes[props.nodeNumber].parameters[2])">
        </node-parameter>
        <node-parameter Name="Beta Version"
                        :Value=store.state.nodes[props.nodeNumber].parameters[20]>
        </node-parameter>
        <node-parameter Name="Module Descriptor Filename"
                        :Value="moduleDescriptorFilename">
        </node-parameter>
      </q-card-section>
    </q-card>
  </q-dialog>

  <manageModuleDescriptorsDialog v-model='showManageModuleDescriptorsDialog'/>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import NodeParameter from "components/modules/common/NodeParameter"
import manageModuleDescriptorsDialog from "components/dialogs/ManageModuleDescriptorsDialog";

const store = inject('store')
const showManageModuleDescriptorsDialog = ref(false)

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

const moduleDescriptorFilename = computed(() => {
  return store.state.nodes[props.nodeNumber].moduleDescriptorFilename
})




onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickUpdateModuleDescriptor = () => {
  console.log(name + `: clickUpdateModuleDescriptor`)
  showManageModuleDescriptorsDialog.value = true
}




</script>

<style scoped>

</style>
