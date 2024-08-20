<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 600px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Advanced events functions for node {{ store.getters.node_name(store.state.selected_node) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card-actions align="left" class="text-primary">
          <q-btn flat color="positive" label="Delete all events" v-close-popup @click="deleteAllEvents()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <deleteAllEventsDialog v-model='showDeleteAllEventsDialog'
      :nodeNumber = store.state.selected_node
    />



</template>


<script setup>

/************************************************************************************
      usage
      <DialogExampleCompositionAPI v-model='showAddEventDialog' />
      
************************************************************************************ */ 


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import deleteAllEventsDialog from "components/dialogs/DeleteAllEventsDialog"

const store = inject('store')
const name = "AdvancedEventsDialog"
const showDeleteAllEventsDialog = ref(false)

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const deleteAllEvents = () => {
  console.log(name + `: deleteAllEvents ` + props.nodeNumber)
  showDeleteAllEventsDialog.value = true
}




onBeforeMount(() => {
})

onMounted(() => {
})




</script>

<style scoped>

</style>
