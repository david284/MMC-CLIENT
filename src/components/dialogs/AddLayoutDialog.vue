<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 400px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Add Layout
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <div class="q-pa-md row">

          <q-card class="q-pa-xs" style="max-width: 300px">
            <q-card-section class="q-pa-xs">
              <div class="text-h6">Add new layout</div>
              <q-input
                autofocus
                class="q-pa-sm"
                outlined
                v-model="layoutName"
                label="layout name"
                maxlength="30"
                >
              </q-input>
              <p>enter a name for a new layout</p>
              <q-btn color="negative" label="Add" @click="clickAddLayout()" no-caps/>
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
const name = "AddLayoutDialog"
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
})


const layoutList = computed(() => {
  return Object.values(store.state.layouts_list)
})

// need to update when new layout added
watch(layoutList, () => {
//  console.log(name + `: WATCH layoutList`)
})


onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickAddLayout = async () => {
  console.log(name + `: Change layout`)
  store.methods.change_layout(layoutName.value)
  store.methods.request_layout_list()
  layoutName.value = ""
  await sleep(50)
  model.value=false
}


</script>

<style scoped>

</style>
