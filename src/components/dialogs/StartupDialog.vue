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
                  <q-td :props="props" >
                    <q-btn
                      flat
                      color="primary"
                      :label="props.value"
                      @click="clickSelectLayout(props.value)"
                    />
                  </q-td>
                </template>
              </q-table>          
            </q-card-section>
          </q-card>
        </div>

      </q-card>
    </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import {sleep} from "components/functions/utils.js"

const store = inject('store')
const name = "StartupDialog"
const layoutName = ref('')
const teRows = ref([])

const teColumns = [
  {name: 'layout', field: 'layout', required: true, label: 'Layout', align: 'left', sortable: true},
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
  console.log(name + `: WATCH model`)
  updateLayoutList()
})


const layoutList = computed(() => {
  return Object.values(store.state.layouts_list)
})

// need to update when new layout added
watch(layoutList, () => {
  console.log(name + `: WATCH layoutList`)
  updateLayoutList()
})


const updateLayoutList = () => {
  teRows.value = []
  layoutList.value.forEach(layout => {
    console.log(name + `: update ` + layout)
    teRows.value.push({"layout" : layout})
  })
}

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickClose = () => {
  console.log(name + ': clickClose')
  store.state.inStartup = false
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
