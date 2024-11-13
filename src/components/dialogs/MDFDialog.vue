<template>
  <q-dialog v-model='model' persistent>
    <q-card class="q-pa-none q-ma-none" style="min-width: 950px; min-height: 600px;">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin g-py-none">
          <div class="text-h6">
            Module Descriptor File Management
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup="3"/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card-section style="max-height: 85vh" class="scroll no-margin q-py-none">

          <!-- 1st element -->
          <q-card flat class="row no-margin q-pa-none">

            <q-card-section style="width: 500px;" class="no-margin q-py-none">
              <div class="text-h6">Current node:</div>
              <div class="text-subtitle2">
                Module name: {{ store.state.nodes[nodeNumber].moduleName }}<br/>
                Module identifier: {{ store.state.nodes[nodeNumber].moduleIdentifier }}<br/>
                Module version: {{ store.state.nodes[nodeNumber].moduleVersion }}<br/>
                Processor type: {{ store.state.nodes[nodeNumber].cpuName }}<br/>
                Processor code: {{ store.state.nodes[nodeNumber].parameters[9] }}<br/>
                Current module descriptor:  {{ moduleDescriptorFilename }}
              </div>
            </q-card-section>

            <q-card-section  style="width: 400px;" class="no-margin q-py-none">
              <div class="text-subtitle2">
                The file is matched using the name, module identifier, version number and processor code<br/>
                If no match is found, then it will fall back to using just the name, module identifier and the version number<br/>
                Modules that need files using the processor code are the exception, most won't use it<br/>
              </div>
              <q-card-actions class="text-primary">
                <q-btn color="positive" size="sm" label="Upload new file" @click="clickUpload()" />
              </q-card-actions>
            </q-card-section>

          </q-card>

          
          <!-- 2nd element -->
            <q-card flat style="max-height: 70vh" class="no-margin q-pa-none">

              <q-card-section flat class="no-margin q-pa-none row">

                <q-card flat style="max-height: 50vh" class="scroll no-margin q-pa-none">
                <q-card-section class="no-margin q-pa-xs"  style="min-width: 380px;">
                  <div class="text-h6">System files for this module type</div>
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
                        <q-td key="timestamp" :props="props">{{ props.row.timestamp }}</q-td>
                        <q-td key="actions" :props="props">
                          <q-btn dense class="q-mx-xs" outline color="primary" size="md" label="Download" @click="clickSystemDownload(props.row.file)" no-caps/>
                        </q-td>              
                      </q-tr>
                    </template>
                  </q-table>
                </q-card-section>
                </q-card>

                <q-card flat style="max-height: 50vh" class="scroll no-margin q-pa-none">
                <q-card-section class="no-margin q-py-xs" style="min-width: 450px;">
                  <div class="text-h6">User files for this module type</div>
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
                        <q-td key="timestamp" :props="props">{{ props.row.timestamp }}</q-td>
                        <q-td key="actions" :props="props">
                          <q-btn dense class="q-mx-xs" outline color="primary" size="md" label="Download" @click="clickUserDownload(props.row.file)" no-caps/>
                          <q-btn dense class="q-mx-xs" outline color="primary" size="md" label="Delete" @click="clickDelete(props.row.file)" no-caps/>
                        </q-td>              
                      </q-tr>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>

            </q-card-section>
          </q-card>

      </q-card-section>

    </q-card>
  </q-dialog>

  <MDFDownloadDialog  v-model='showMDFDownloadDialog'
    :moduleDescriptorFilename = export_filename
  />

  <MDFUploadDialog  v-model='showMDFUploadDialog' 
    :nodeNumber = nodeNumber
  />

</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import MDFDownloadDialog from "components/dialogs/MDFDownloadDialog"
import MDFUploadDialog from "components/dialogs/MDFUploadDialog"

const $q = useQuasar()
const store = inject('store')
const name = 'MDFDialog'
const showMDFDownloadDialog = ref(false)
const showMDFUploadDialog = ref(false)
const export_filename = ref()
const moduleDescriptorFilename = ref()


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: { type: Number}
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
  getModuleDescriptorFilename()
})


const MDFChanged = computed(() =>{
  return store.state.MDFChanged
})
watch(MDFChanged, () => {
  console.log(name + `: WATCH: MDFChanged`)
  update_SYSTEM_rows()
  update_USER_rows()
  getModuleDescriptorFilename()
})



const server_node = computed(() =>{
  return store.state.server.nodes[props.nodeNumber]
})
watch(server_node, () => {
  console.log(name + `: WATCH: server_node`)
  update_SYSTEM_rows()
  update_USER_rows()
})

const getModuleDescriptorFilename = () => {
  moduleDescriptorFilename.value = ''
  try {
    moduleDescriptorFilename.value = store.state.nodeDescriptors[props.nodeNumber].moduleDescriptorFilename
  } catch (err){ 
    console.log(name + `: getModuleDescriptorFilename: ` + err)
  }
  console.log(name + `: getModuleDescriptorFilename: ` + moduleDescriptorFilename.value)
}

const systemRows = ref([])

const systemColumns = [
  {name: 'file', field: 'file', required: true, label: 'File', align: 'left', sortable: true},
  {name: 'timestamp', field: 'timestamp', required: true, label: 'Timestamp', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]

const userRows = ref([])
const userColumns = [
  {name: 'file', field: 'file', required: true, label: 'File', align: 'left', sortable: true},
  {name: 'timestamp', field: 'timestamp', required: true, label: 'Timestamp', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]


const update_SYSTEM_rows = async () => {
//  await sleep(500)
  console.log(name + `: update_SYSTEM_rows`)
  if (server_node.value != undefined){
    systemRows.value = []
    if (server_node.value.SYSTEM_MDF_List != undefined){
      server_node.value.SYSTEM_MDF_List.forEach(item => {
        systemRows.value.push({"file" : item[0], "timestamp" : item[1]})
      })
    }
    // sort rows by file
    systemRows.value.sort(function(a, b){return (a.file < b.file)? -1 : 1;});
  }
}


const update_USER_rows = async () => {
//  await sleep(500)
  console.log(name + `: update_USER_rows`)
  if (server_node.value != undefined){
    userRows.value = []
    if (server_node.value.USER_MDF_List != undefined){
      server_node.value.USER_MDF_List.forEach(item => {
        userRows.value.push({"file" : item[0], "timestamp" : item[1]})
      })
    }
    // sort rows by file
    userRows.value.sort(function(a, b){return (a.file < b.file)? -1 : 1;});
  }
}

const refresh_user_list = async () =>{
  await sleep(500)
  store.methods.request_matching_mdf_list(props.nodeNumber, "USER")
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


const clickDelete = (filename) => {
  console.log(name + `: clickDelete`)
  const result = $q.notify({
    message: 'Are you sure you want to delete file ' + filename,
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => { 
        store.methods.request_MDF_delete(filename)
        refresh_user_list()
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}


const clickSystemDownload = (filename) => {
  console.log(name + `: clickSystemDownload`)
  store.methods.request_MDF_export('SYSTEM', filename)
  export_filename.value = filename
  showMDFDownloadDialog.value = true
}


const clickUserDownload = (filename) => {
  console.log(name + `: clickUserDownload`)
  store.methods.request_MDF_export('USER', filename)
  export_filename.value = filename
  showMDFDownloadDialog.value = true
}


const clickUpload = () => {
  console.log(name + `: clickUpload`)
  showMDFUploadDialog.value = true
}




</script>

<style scoped>

</style>
