<template>
  <q-dialog v-model='model' persistent>

    <q-card style="min-width: 800px" class="q-pa-none q-ma-none">
      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            VLCB Diagnostics for {{ store.state.nodes[nodeNumber].services[serviceIndex].ServiceName }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card>
        <q-card-section class="no-margin q-pa-xs">

          <q-table
            class="vlcb-diagnostics-table"
            dense
            :rows=rows
            :columns="columns"
            row-key="diagnosticCode"
            virtual-scroll
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="48"
            hide-bottom
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="diagnosticCode" :props="props">{{ props.row.diagnosticCode }}</q-td>
                <q-td key="diagnosticValue" :props="props">{{ props.row.diagnosticValue}}</q-td>
                <q-td key="diagnosticName" :props="props">{{ props.row.diagnosticName}}</q-td>
              </q-tr>
            </template>
          </q-table>

          <div class="q-pa-xs row" v-if="showDiagnosticsJSON">
            <div class="text-body1">Diagnostics<br></div>
            <div class="text-body2">
              <pre>{{ store.state.nodes[nodeNumber].services[serviceIndex].diagnostics }}</pre>
            </div>
          </div>

        </q-card-section>
      </q-card>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Toggle diagnostics json" @click="clickToggleShowDiagnosticsJSON()"/>
      </q-card-actions>

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
  modelValue: { type: Boolean, required: true },
  nodeNumber:  { type: Number, required: true },
  serviceIndex:  { type: Number, default: 0 }
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


const columns = [
  {name: 'diagnosticCode', field: 'diagnosticCode', required: true, label: 'Diagnostic Code', align: 'left', sortable: true},
  {name: 'diagnosticValue', field: 'diagnosticValue', required: false, label: 'Diagnostic Value', align: 'left', sortable: true},
  {name: 'diagnosticName', field: 'diagnosticName', required: true, label: 'Name', align: 'left', sortable: true}
]


const nodeServiceDiagnostics = computed(() =>{
  var obj = undefined
  if(props.nodeNumber){
    if(store.state.nodes[props.nodeNumber].services[props.serviceIndex]){
      obj = Object.values(store.state.nodes[props.nodeNumber].services[props.serviceIndex].diagnostics)
    }
  }
  return obj
})


watch(nodeServiceDiagnostics, () => {
  if (nodeServiceDiagnostics.value){
      update_rows()
  }
})

const update_rows = () => {
  rows.value = []
  nodeServiceDiagnostics.value.forEach(diagnostic => {
    if (diagnostic.DiagnosticCode != 0){
      // don't display diagnostic code 0 - it's not really a diagnostic code
      let output = {}
      output['diagnosticCode'] = diagnostic.DiagnosticCode
      output['diagnosticValue'] = diagnostic.DiagnosticValue
      output['diagnosticName'] = diagnostic.DiagnosticName
      rows.value.push(output)
    }
  })
}


onBeforeMount(() => {
})

onMounted(() => {
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickToggleShowDiagnosticsJSON = () => {
  console.log(name + `: clickToggleShowDiagnosticsJSON`)
  showDiagnosticsJSON.value ? showDiagnosticsJSON.value = false : showDiagnosticsJSON.value = true
}



</script>

<style lang="sass">
.vlcb-diagnostics-table
  /* height or max-height is important */
  height: 500px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    /* otherwise you see the table scrolling underneath the header */
    background-color: $blue-grey-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
