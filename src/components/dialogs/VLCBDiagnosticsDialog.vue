<template>

  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 600px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          VLCB Diagnostics
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <div >
        <q-table
          title="Diagnostics"
          :rows=rows
          :columns="columns"
          row-key="diagnosticCode"
          virtual-scroll
          :rows-per-page-options="[0]"
          :virtual-scroll-sticky-size-start="48"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="diagnosticCode" :props="props">{{ props.row.diagnosticCode }}</q-td>
              <q-td key="diagnosticValue" :props="props">{{ props.row.diagnosticValue}}</q-td>
              <q-td key="diagnosticName" :props="props">{{ props.row.diagnosticName}}</q-td>
            </q-tr>
          </template>
        </q-table>
      </div>



      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Toggle diagnostics json" @click="clickToggleShowDiagnosticsJSON()"/>
        <q-btn flat label="Close" v-close-popup/>
      </q-card-actions>

      <q-card-section class="q-pa-sm" v-if="showDiagnosticsJSON">
        <div class="q-pa-xs row">
          <div class="text-body1">Diagnostics<br></div>
          <div class="text-body2">
            <pre>{{ store.state.nodes[store.state.selected_node].services[store.state.selected_service_index].diagnostics }}</pre>
          </div>
        </div>
      </q-card-section>

    </q-card>

  </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "VLCBDiagnosticsDialog"
const showDiagnosticsJSON = ref(false)
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
  console.log(name + `: WATCH model`)
  update_rows()
})


const columns = [
  {name: 'diagnosticCode', field: 'diagnosticCode', required: true, label: 'Diagnostic Code', align: 'left', sortable: true},
  {name: 'diagnosticValue', field: 'diagnosticValue', required: false, label: 'Diagnostic Value', align: 'left', sortable: true},
  {name: 'diagnosticName', field: 'diagnosticName', required: true, label: 'Name', align: 'left', sortable: true}
]


const nodeServiceDiagnostics = computed(() =>{
  return Object.values(store.state.nodes[store.state.selected_node].services[store.state.selected_service_index].diagnostics)
})

watch(nodeServiceDiagnostics, () => {
  update_rows()
})

const nodeService = store.state.nodes[store.state.selected_node].services[store.state.selected_service_index]
console.log(`Default2ServiceDiagnostics: Service: ${JSON.stringify(nodeService)}`)

const update_rows = () => {
  rows.value = []
  nodeServiceDiagnostics.value.forEach(diagnostic => {
    let output = {}
      output['diagnosticCode'] = diagnostic.DiagnosticCode
      output['diagnosticValue'] = diagnostic.DiagnosticValue
      output['diagnosticName'] = diagnostic.DiagnosticName
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


const clickToggleShowDiagnosticsJSON = () => {
  console.log(name + `: clickToggleShowDiagnosticsJSON`)
  if (showDiagnosticsJSON.value){
    showDiagnosticsJSON.value = false
  } else {
    showDiagnosticsJSON.value = true
  }
}







</script>

<style scoped>

</style>
