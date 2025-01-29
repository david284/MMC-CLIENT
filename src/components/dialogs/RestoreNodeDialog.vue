<template>
  <q-dialog v-model="model" persistent>

    <!-- min-width: has no effect on q-dialog -->
    <q-card  style="min-width: 900px" class="q-pa-none q-ma-none">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Restore Node: {{ store.getters.node_name(nodeNumber) }} 
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <div style="max-height: 85vh" class="scroll no-margin no-padding">

      <div class="q-pa-md row" style="max-height: 80vh">

        <q-card flat inline class="q-pa-none q-ma-none" style="width: 400px">
          <div class="text-h6">List of Backups</div>
          <q-card-section style="max-height: 75vh" class="scroll no-margin q-pa-xs">

            <q-table
              class="restore-node-table"
              dense
              :rows="teRows"
              :columns="teColumns"
              row-key="name"
              virtual-scroll
              :rows-per-page-options="[0]"
              :virtual-scroll-sticky-size-start="0"
              hide-header
              hide-bottom
            >
              <template #body-cell="props">
                <q-td :props="props" >
                  <q-btn
                    flat
                    color="primary"
                    :label="props.value"
                    @click="clickBackupList(props.value)"
                  />
                </q-td>
                <q-td >
                  <q-btn dense class="q-mx-xs q-my-none" outline color="negative" size="xs" label="Delete"
                  @click="clickDelete(props.value)" no-caps />
                </q-td>
              </template>
            </q-table>          
          </q-card-section>
        </q-card>


        <q-card flat inline class="q-pa-xs" style="width: 400px">

        <q-card-section class="q-pa-xs" style="height: 350px">

          <q-card-section>
            <div class="text-h6">
              Selected Backup
            </div>
            <div class="bg-light-blue-1 text-h6">
              {{ backupFilename }}
            </div>
          </q-card-section>

        </q-card-section>

<!-- 
        <q-card-section class="q-pa-xs">
          <q-card-actions align="center">
            <q-btn v-if="readyToProceed" color="primary" label="Proceed" @click="clickRestore()"/>
            <q-btn v-if="!readyToProceed" disabled color="primary" label="Proceed" @click="clickRestore()"/>
          </q-card-actions>
        </q-card-section>
 -->

        </q-card>

      </div>

      <q-card class="no-margin no-padding">
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Toggle node json" @click="clickToggleNodeJSON()"/>
        </q-card-actions>
        <q-card-section v-if="showNodeJSON" style="width: 350px" class="text-body2 no-margin no-padding">
          <pre>{{ restoredNode }}</pre>
        </q-card-section>
      </q-card>

    </div>

    </q-card>

  </q-dialog>

</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { useQuasar } from 'quasar'
import {sleep} from "components/functions/utils.js"

const $q = useQuasar()
const store = inject('store')
const name = "RestoreNodeDialog"
const backupFilename = ref("")
const restoredNode = ref("")
const showNodeJSON = ref(false)
const teRows = ref([])

const teColumns = [
  {name: 'backup', field: 'backup', required: true, label: 'backup', align: 'left', sortable: true},
]

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
  //console.log(name + `: WATCH model`)
  if (model.value){
    store.methods.request_node_backups_list(store.state.layout.layoutDetails.title, props.nodeNumber)
    store.state.restoredData = {}
  }
})

const restoredData = computed(() => {
    return store.state.restoredData
})

watch(restoredData, () => {
  //console.log(name + `: WATCH restoredData`)
  try {
    restoredNode.value = restoredData.value.nodeConfig.nodes[props.nodeNumber]
  } catch (err) {
    console.log(name + `: WATCH restoredData ` + err)
    restoredNode.value = {}
  }
})

const backupList = computed(() => {
  return store.state.backups_list
})

// need to update when new layout added
watch(backupList, () => {
  //console.log(name + `: WATCH backupList`)
  updateBackupList()
})

const updateBackupList = () => {
  teRows.value = []
  backupList.value.forEach(backup => {
    //console.log(name + `: update ` + backup)
    teRows.value.push({"backup" : backup})
  })
}

onBeforeMount(() => {
})

onMounted(() => {
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickBackupList = (row) => {
  console.log(name + ': clickBackupList on ', row)
  backupFilename.value = row
  store.methods.request_node_backup(store.state.layout.layoutDetails.title, props.nodeNumber, backupFilename.value)

}


const clickDelete = (fileName) => {
  console.log(name + ': clickDelete ', fileName)
  const result = $q.notify({
    message: 'Are you sure you want to delete backup ' + fileName,
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => { 
        store.methods.delete_node_backup(
          store.state.layout.layoutDetails.title, 
          props.nodeNumber, 
          fileName)
        await sleep(50)     // allow a bit of a delay for the change
        store.methods.request_node_backups_list(store.state.layout.layoutDetails.title, props.nodeNumber)
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}


const clickRestore = (row) => {
  console.log(name + ': clickRestore')
}


const clickToggleNodeJSON = () => {
  console.log(name + `: clickToggleNodeJSON`)
  showNodeJSON.value  = showNodeJSON.value ? false : true
}



</script>

<style lang="sass">
.restore-node-table
  /* height or max-height is important */
  max-height: 65vh

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
