<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 900px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Startup
          </div>
          <!--
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" @click="clickClose()" v-close-popup/>
          </template>
          -->
        </q-banner>

        <div class="q-pa-md row">

          <q-card inline class="q-pa-xs" flat style="max-width: 500px">
            <q-card-section class="q-pa-xs">
              <div class="text-h6">Select Layout</div>
              <q-table
                flat bordered
                dense
                :rows="teRows"
                :columns="teColumns"
                row-key="name"
                hide-header
                :pagination="{rowsPerPage: 10}"
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
          </q-card>

          <q-card-section>
            <div class="text-h6">
              click below to add a new layout
            </div>

            <q-card-actions align="center" class="text-primary">
              <div>
                <q-btn color="positive" label="Add" @click="clickAddNewLayout()"/>
              </div>
            </q-card-actions>
          </q-card-section>

        </div>

      </q-card>
    </q-dialog>

    <addLayoutDialog v-model='showAddLayoutDialog' />


</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { useQuasar } from 'quasar'
import {sleep} from "components/functions/utils.js"
import addLayoutDialog from "components/dialogs/AddLayoutDialog";

const $q = useQuasar()
const store = inject('store')
const name = "StartupDialog"
const layoutName = ref('')
const teRows = ref([])
const showAddLayoutDialog = ref(false)

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


const layoutList = computed(() => {
  return Object.values(store.state.layouts_list)
})

// need to update when new layout added
watch(layoutList, () => {
//  console.log(name + `: WATCH layoutList`)
  updateLayoutList()
})


const updateLayoutList = () => {
  teRows.value = []
  layoutList.value.forEach(layout => {
//    console.log(name + `: update ` + layout)
    teRows.value.push({"layout" : layout})
  })
//    console.log(name + `: updateLayoutList: ` + JSON.stringify(teRows))
}

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


const clickSelectLayout = async (row) => {
  console.log(name + ': clickLayouts on ', row)
  layoutName.value = row
  store.methods.change_layout(layoutName.value)
  store.state.inStartup = false
  await sleep(50)     // allow a bit of a delay for the change
  model.value = false
}


onBeforeMount(() => {
})

onMounted(() => {
})




</script>

<style scoped>

</style>
