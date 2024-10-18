<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 800px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Startup
          </div>
          <template v-slot:action>
            <q-btn class="q-mx-xs q-my-none" size="sm" color="info" label="INFO"  no-caps
                @click="clickInfo()" />
            <q-space/>
            <q-btn class="q-mx-xs q-my-none" size="sm" color="negative" label="Exit" @click="clickExit()" no-caps/>
          </template>
        </q-banner>

        <div class="q-pa-md row">

          <q-card inline class="q-pa-xs" flat style="width: 380px">
            <q-card-section class="q-pa-xs" style="height: 450px">
              <div class="text-h6">Select Layout</div>
              <q-table
                flat bordered
                dense
                :rows="teRows"
                :columns="teColumns"
                row-key="name"
                hide-header
                :pagination="{rowsPerPage: 8}"
              >
                <template #body-cell="props">
                    <q-td key="layout" :props="props">
                      <q-btn flat color="primary" :label="props.value"
                      @click="clickSelectLayout(props.value)" />
                    </q-td>
                    <q-td >
                      <q-btn dense class="q-mx-xs q-my-none" outline color="negative" size="xs" label="Delete"
                      @click="clickDeleteLayout(props.value)" no-caps />
                    </q-td>
                </template>
              </q-table>          
            </q-card-section>

            <q-card-section>
              <div class="text-h6">
                click to add a new layout &nbsp;
                <q-btn color="positive" label="Add" @click="clickAddNewLayout()"/>
              </div>
            </q-card-section>

          </q-card>

           <q-card flat inline class="q-pa-xs" style="width: 380px">

            <q-card-section class="q-pa-xs" style="height: 450px">

              <q-card-section>
                <div class="text-h6">
                  Selected layout
                </div>
                <div class="bg-light-blue-1 text-h6">
                  {{ layoutName }}
                </div>
              </q-card-section>

              <q-card-section  style="width: 350px; height: 200px">
                <div class="text-h6">
                  Connection details
                </div>
                <q-card flat style="height: 100px">
                  <div v-for="(n, i) in (connectionDetails)" :key = i>
                    {{ connectionDetails[i] }}
                  </div>
                </q-card>
                <div class="text-h6">
                  <q-btn color="positive" label="Edit" @click="clickEditConnectionDetails()"/>
                    &nbsp; Edit connection details
                  </div>
              </q-card-section>
            </q-card-section>

            <q-card-section class="q-pa-xs">
              <q-card-actions align="center">
                <q-btn v-if="readyToProceed" color="primary" label="Proceed" @click="clickProceed()"/>
                <q-btn v-if="!readyToProceed" disabled color="primary" label="Proceed" @click="clickProceed()"/>
              </q-card-actions>
            </q-card-section>

          </q-card>

        </div>

      </q-card>

    </q-dialog>

    <addLayoutDialog v-model='showAddLayoutDialog' />

    <EditConnectionDetailsDialog v-model='showEditConnectionDetailsDialog' />


</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { useQuasar } from 'quasar'
import {sleep} from "components/functions/utils.js"
import addLayoutDialog from "components/dialogs/AddLayoutDialog";
import EditConnectionDetailsDialog from "components/dialogs/EditConnectionDetailsDialog";

const $q = useQuasar()
const store = inject('store')
const name = "StartupDialog"
const layoutName = ref('<not selected>')
const teRows = ref([])
const showAddLayoutDialog = ref(false)
const showEditConnectionDetailsDialog = ref(false)
const readyToProceed = ref(false)
const layoutValid = ref(false)
const connectionDetails = ref([])

const teColumns = [
  {name: 'layout', field: 'layout', required: true, label: 'Layout', sortable: true}
//  ,{name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'right', sortable: false}
]

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
//  console.log(name + `: WATCH model`)
  updateLayoutList()
})

const layout = computed(() => {
  return Object.values(store.state.layout)
})

// need to update when new layout added
watch(layout, () => {
//  console.log(name + `: WATCH layout`)
  updateLayout()
})

const layoutList = computed(() => {
  return Object.values(store.state.layouts_list)
})

// need to update when new layout added
watch(layoutList, () => {
//  console.log(name + `: WATCH layoutList`)
  updateLayoutList()
})


const updateLayout = () => {
//    console.log(name + `: updateLayout: ` + JSON.stringify(teRows))
  try{
    if (store.state.layout.connectionDetails == undefined){
      store.state.layout.connectionDetails={}
      store.state.layout.connectionDetails["mode"] = "Auto"
      store.state.layout.connectionDetails["serialPort"] = ""
      store.state.layout.connectionDetails["host"] = ""
      store.state.layout.connectionDetails["hostPort"] = ""
      store.methods.update_layout()
    }
  } catch(error) {}
  connectionDetails.value = []
  connectionDetails.value.push("Mode: " + store.state.layout.connectionDetails.mode)
  if (store.state.layout.connectionDetails.mode == "SerialPort"){
    connectionDetails.value.push("serialPort: " + store.state.layout.connectionDetails.serialPort)
  }
  if (store.state.layout.connectionDetails.mode == "Network"){
    connectionDetails.value.push("Host: " + store.state.layout.connectionDetails.host)
    connectionDetails.value.push("Host Port: " + store.state.layout.connectionDetails.hostPort)
  }
  layoutValid.value = true
}


const updateLayoutList = () => {
  teRows.value = []
  layoutList.value.forEach(layout => {
//    console.log(name + `: update ` + layout)
    teRows.value.push({"layout" : layout})
  })
//    console.log(name + `: updateLayoutList: ` + JSON.stringify(teRows))
}

onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickAddNewLayout = async () => {
  console.log(name + ': clickAddNewLayout')
  showAddLayoutDialog.value=true
}

const clickDeleteLayout = async (row) => {
  console.log(name + ': clickDeleteLayout ', row)
  const result = $q.notify({
    message: 'Are you sure you want to delete this?',
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => { 
        store.methods.delete_layout(row)
        await sleep(50)     // allow a bit of a delay for the change
        store.methods.request_layout_list()
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

const clickEditConnectionDetails = async () => {
  console.log(name + ': clickEditConnectionDetails')
  showEditConnectionDetailsDialog.value=true
}

const clickInfo = async () => {
  console.log(name + ': clickInfo')
}

const clickExit = () => {
  console.log(name + `: clickExit`)
  const result = $q.notify({
    message: 'Are you sure you want to exit and stop the server?',
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => { 
        store.methods.STOP_SERVER()
        await sleep(50)     // allow a bit of a delay for the change
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

const clickProceed = async () => {
  console.log(name + ': clickProceed')
  if (store.state.layout != {} ){
    store.methods.start_connection(store.state.layout.connectionDetails)
    await sleep(500)     // allow a bit of a delay for the change
    store.state.inStartup = false
    model.value = false
  }
}


const clickSelectLayout = async (row) => {
  console.log(name + ': clickLayouts on ', row)
  layoutName.value = row
  store.methods.change_layout(layoutName.value)
  readyToProceed.value = ref(true)
}



</script>

<style scoped>

</style>
