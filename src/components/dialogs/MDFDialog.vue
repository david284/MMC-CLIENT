<template>

  <q-dialog v-model='model' persistent>
    <q-card  class="q-pa-none q-ma-none" style="min-width: 950px;">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin g-py-none">
          <div class="text-h6">
            Module Descriptor File Management
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="refresh" @click="update_SYSTEM_rows()"/>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card>

        <q-card-section>
          <div class="text-h6">Current node:</div>
          <div class="text-subtitle2">
            Module name: {{ store.state.nodes[store.state.selected_node].moduleName }}<br/>
            Module identifier: {{ store.state.nodes[store.state.selected_node].moduleIdentifier }}<br/>
            Module version: {{ store.state.nodes[store.state.selected_node].moduleVersion }}<br/>
            Processor type: {{ store.state.nodes[store.state.selected_node].cpuName }}<br/>
            Processor code: {{ store.state.nodes[store.state.selected_node].parameters[9] }}<br/>
          </div>
          <div class="text-h6">
            Current module descriptor  {{ store.state.nodes[store.state.selected_node].moduleDescriptorFilename }}
          </div>
        </q-card-section>

        <q-card bordered class="no-margin q-pa-none">
          <q-card-section class="no-margin q-pa-none">
            <div class="text-h6" align="center">
              All files related to this module type
            </div>
          </q-card-section>

          <q-card-section style="max-height: 75vh" class="no-margin q-pa-none row">

            <q-card flat style="max-height: 75vh" class="scroll q-pa-xs">
            <q-card-section class="no-margin q-pa-xs"  style="min-width: 400px;">
              <div class="text-h6">System files</div>
              <div class="text-subtitle2"></div>
              <q-table
                flat bordered
                dense
                :rows="systemRows"
                :columns="systemColumns"
                row-key="file"
                hide-bottom
                virtual-scroll
                :rows-per-page-options="[0]"
                :virtual-scroll-sticky-size-start="48"
                >
                <template v-slot:body="props">
                  <q-tr :props="props" class="q-my-none q-py-none">
                    <q-td key="file" :props="props">{{ props.row.file }}</q-td>
                    <q-td key="version" :props="props">{{ props.row.version }}</q-td>
                    <q-td key="actions" :props="props">
                      <q-btn dense class="q-mx-xs" outline color="primary" size="md" label="Download" no-caps/>
                    </q-td>              
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
            </q-card>

            <q-card flat style="max-height: 75vh" class="scroll q-pa-xs">
            <q-card-section class="no-margin q-py-xs" style="min-width: 450px;">
              <div class="text-h6">User files</div>
              <div class="text-subtitle2"></div>
              <q-table
                flat bordered
                dense
                :rows="userRows"
                :columns="userColumns"
                row-key="file"
                hide-bottom
                virtual-scroll
                :rows-per-page-options="[0]"
                :virtual-scroll-sticky-size-start="48"
                >
                <template v-slot:body="props">
                  <q-tr :props="props" class="q-my-none q-py-none">
                    <q-td key="file" :props="props">{{ props.row.file }}</q-td>
                    <q-td key="version" :props="props">{{ props.row.version }}</q-td>
                    <q-td key="actions" :props="props">
                      <q-btn dense class="q-mx-xs" outline color="primary" size="md" label="Download" no-caps/>
                      <q-btn dense class="q-mx-xs" outline color="primary" size="md" label="Delete" no-caps/>
                    </q-td>              
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>

        </q-card-section>
        </q-card>

        <q-card-actions class="text-primary">
          <q-btn color="positive" label="Upload new file" @click="actionUpload()" />
        </q-card-actions>

      </q-card>

    </q-card>
  </q-dialog>


</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import {sleep} from "components/functions/utils.js"

const store = inject('store')
const name = 'MDFDialog'



const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: { type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

// model changes when Dialog opened & closed
watch(model, () => {
//  console.log(name + `: WATCH model`)
  update_SYSTEM_rows()
  update_USER_rows()
})

/*
const USER_MDF_LIST = computed(() =>{
  return store.state.nodes[props.nodeNumber].USER_MDF_List
})
watch(USER_MDF_LIST, () => {
//  update_USER_rows()
})
*/


const server_node = computed(() =>{
  return store.state.server.nodes[props.nodeNumber]
})
watch(server_node, () => {
  console.log(name + `: WATCH: server_node`)
  update_SYSTEM_rows()
  update_USER_rows()
})


const systemRows = ref([])

const systemColumns = [
  {name: 'file', field: 'file', required: true, label: 'File', align: 'left', sortable: true},
  {name: 'version', field: 'version', required: true, label: 'Version', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]

const userRows = ref([])
const userColumns = [
  {name: 'file', field: 'file', required: true, label: 'File', align: 'left', sortable: true},
  {name: 'version', field: 'version', required: true, label: 'Version', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]


const update_SYSTEM_rows = async () => {
  await sleep(500)
  console.log(name + `: update_SYSTEM_rows`)
  if (server_node.value != undefined){
    systemRows.value = []
    if (server_node.value.SYSTEM_MDF_List != undefined){
      server_node.value.SYSTEM_MDF_List.forEach(item => {
        systemRows.value.push({"file" : item[0], "version" : item[1]})
      })
    }
    // sort rows by file
    systemRows.value.sort(function(a, b){return (a.file < b.file)? -1 : 1;});
  }
}


const update_USER_rows = async () => {
  await sleep(500)
  console.log(name + `: update_USER_rows`)
  if (server_node.value != undefined){
    userRows.value = []
    if (server_node.value.USER_MDF_List != undefined){
      server_node.value.USER_MDF_List.forEach(item => {
        userRows.value.push({"file" : item[0], "version" : item[1]})
      })
    }
    // sort rows by file
    userRows.value.sort(function(a, b){return (a.file < b.file)? -1 : 1;});
  }
}




onBeforeMount(() => {
})

onMounted(() => {
})

onUpdated(() => {
//  console.log("EventTeachDialog onUpdated")
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/




</script>

<style scoped>

</style>
