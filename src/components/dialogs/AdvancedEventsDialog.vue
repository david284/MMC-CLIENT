<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 600px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Advanced events functions for node {{ store.getters.node_name(nodeNumber) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card-actions align="left" class="text-primary">
          <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Delete all events" v-close-popup @click="deleteAllEvents()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'

const $q = useQuasar()
const store = inject('store')
const name = "AdvancedEventsDialog"

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
  const result = $q.notify({
    message: 'Are you sure you want to delete all events for node '+ store.getters.node_name(props.nodeNumber),
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => { 
        store.methods.delete_all_events(props.nodeNumber)
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}




onBeforeMount(() => {
})

onMounted(() => {
})




</script>

<style scoped>

</style>
