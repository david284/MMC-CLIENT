<template>
  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 350px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Import
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card-section>
          <div class="text-subtitle2">Select a file to import</div>
          <div class="text-subtitle2">
          </div>
        </q-card-section>

        <q-file
            v-model="importFile"
            label="Pick one file"
            filled
            style="max-width: 300px"
          />

          <q-card-section>
            <div class="text-subtitle2">Current node:</div>
            <div class="text-subtitle2">
              Module name: {{ store.state.nodes[store.state.selected_node].moduleName }}<br/>
              Module identifier: {{ store.state.nodes[store.state.selected_node].moduleIdentifier }}<br/>
              Module version: {{ store.state.nodes[store.state.selected_node].moduleVersion }}<br/>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-subtitle2">If this module descriptor already exists on the server, it will be overwritten  </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <!-- // Only close top dialog - this gives time for underlying dialogs to update -->
            <q-btn color="positive" label="Import" v-close-popup  @click="clickImport()" />
          </q-card-actions>

    </q-card>
  </q-dialog>
</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import {sleep} from "components/functions/utils.js"

const store = inject('store')
const name = "ImportDialog"
const importFile = ref()


const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

watch(model, () => {
  console.log(name + `: WATCH model`)
})


onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickImport = () => {
  }


</script>

<style scoped>

</style>
