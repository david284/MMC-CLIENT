<template>

  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 800px">
      <q-card-section>

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          VLCB Services
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>
      </q-card-section> 

      <q-card-section style="max-height: 75vh" class="scroll">
       <div>
        <q-table
          :rows=rows
          :columns="columns"
          row-key="serviceIndex"
          virtual-scroll
          :rows-per-page-options="[0]"
          :virtual-scroll-sticky-size-start="48"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="serviceIndex" :props="props">{{ props.row.serviceIndex }}</q-td>
              <q-td key="serviceType" :props="props">{{ props.row.serviceType}}</q-td>
              <q-td key="serviceName" :props="props">{{ props.row.serviceName}}</q-td>
              <q-td key="diagnostics" :props="props">
                <q-btn color="primary" flat rounded label="diagnostics" @click="clickDiagnostics(props.row.serviceIndex)" no-caps/>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>

      <div class="q-pa-xs row"  v-if="showServicesJSON">
        <div class="text-body1">Services<br></div>
        <div class="text-body2">
          <pre>{{ store.state.nodes[store.state.selected_node].services }}</pre>
        </div>
      </div>

    </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Toggle services json" @click="clickToggleShowServicesJSON()"/>
      </q-card-actions>

<!-- 
      <q-card-section class="q-pa-sm" v-if="showServicesJSON">
        <div class="q-pa-xs row">
          <div class="text-body1">Services<br></div>
          <div class="text-body2">
            <pre>{{ store.state.nodes[store.state.selected_node].services }}</pre>
          </div>
        </div>
      </q-card-section>
 -->
    </q-card>

  </q-dialog>

  <vlcbDiagnosticsDialog  v-model='showVLCBDiagnosticsDialog' />


</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import vlcbDiagnosticsDialog from "components/dialogs/VLCBDiagnosticsDialog"

const store = inject('store')
const name = "VLCBServicesDialog"
const showServicesJSON = ref(false)
const showVLCBDiagnosticsDialog = ref(false)
const rows = ref([])

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
})



const columns = [
  {name: 'serviceIndex', field: 'serviceIndex', required: true, label: 'Service Index', align: 'left', sortable: true},
  {name: 'serviceType', field: 'serviceType', required: false, label: 'Service Type', align: 'left', sortable: true},
  {name: 'serviceName', field: 'serviceName', required: true, label: 'Name', align: 'left', sortable: true},
  {name: 'diagnostics', field: 'diagnostics', required: true, label: '', align: 'left'}
]


const nodeServices = computed(() =>{
  var obj = {}
  if(store.state.selected_node){
    obj = Object.values(store.state.nodes[store.state.selected_node].services)
  }
  return obj
})


watch(nodeServices, () => {
  update_rows()
})


const update_rows = () => {
  rows.value = []
  nodeServices.value.forEach(service => {
    let output = {}
    output['serviceIndex'] = service.ServiceIndex
    output['serviceType'] = service.ServiceType
    output['serviceName'] = service.ServiceName
    rows.value.push(output)
  })
}


onBeforeMount(() => {
//  update_rows()
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickToggleShowServicesJSON = () => {
  console.log(name + `: clickToggleShowServicesJSON`)
  showServicesJSON.value ? showServicesJSON.value = false : showServicesJSON.value = true
}


const clickDiagnostics = (serviceIndex) => {
  console.log(`clickiagnostics: index ${serviceIndex}`)
  store.methods.request_diagnostics(store.state.selected_node, serviceIndex)
  store.state.selected_service_index = serviceIndex
  showVLCBDiagnosticsDialog.value = true
}





</script>

<style scoped>

</style>
