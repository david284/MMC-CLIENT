<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 350px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Advanced events :  {{ store.getters.event_name(props.eventIdentifier) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card-actions align="left" class="text-primary">
          <q-btn flat color="positive" label="Clear all events" @click="clearAllEvents()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

</template>


<script setup>

/************************************************************************************
      usage
      <DialogExampleCompositionAPI v-model='showAddEventDialog' />
      
************************************************************************************ */ 


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

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

const clearAllEvents = () => {
  console.log(`clearAllEvents ` + props.nodeNumber)
}




onBeforeMount(() => {
})

onMounted(() => {
})




</script>

<style scoped>

</style>
