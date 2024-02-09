<template>
  <div class="full-width" >
    <q-table
      title="Published Services"
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
            <q-btn color="primary" flat rounded label="diagnostics" @click="showDiagnostics(props.row.serviceIndex)" no-caps/>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
  <div class="q-pa-sm row" v-if="store.state.debug">
    <p>
      {{ Object.values(store.state.busEvents) }}
    </p>
  </div>
</template>

<script setup>
import {inject, onBeforeMount, computed, watch, ref} from "vue";
import Default2NodeServiceDiagnostics from "components/modules/default2/Default2NodeServiceDiagnostics";

const columns = [
  {name: 'serviceIndex', field: 'serviceIndex', required: true, label: 'Service Index', align: 'left', sortable: true},
  {name: 'serviceType', field: 'serviceType', required: false, label: 'Service Type', align: 'left', sortable: true},
  {name: 'serviceName', field: 'serviceName', required: true, label: 'Name', align: 'left', sortable: true},
  {name: 'diagnostics', field: 'diagnostics', required: true, label: 'diagnostics', align: 'left'}
]


const store = inject('store')
const rows = ref([])

const nodeServices = computed(() =>{
  return Object.values(store.state.nodes[store.state.selected_node].services)
})

watch(nodeServices, () => {
  update_rows()
})

const update_rows = () => {
  //console.log(`DefaultEventList Update Rows ${store.state.selected_node}`)
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
  //console.log(`DefaultEventList Mounted ${store.state.selected_node}`)
//  store.methods.request_all_node_events(store.state.selected_node)
  update_rows()
})


const showDiagnostics = (serviceIndex) => {
  console.log(`showDiagnostics for index ${serviceIndex}`)
  store.methods.request_diagnostics(store.state.selected_node, serviceIndex)
  store.state.selected_service_index = serviceIndex
  store.methods.update_services_component("Default2NodeServiceDiagnostics")
}


</script>

<style scoped>

</style>
