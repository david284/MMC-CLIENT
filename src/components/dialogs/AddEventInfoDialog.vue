<template>

  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 800px">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">Add event information</div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>
      <q-card-section class="q-pa-xs q-ma-none">
        <div class="text-h6">Long Events</div>
        <div class="text-body">An event consumed by this node will need the node number of the event to be consumed, typically the node number of the node that produces the event</div>
        <div class="text-body">An event produced by this node typically uses the number of this node, but can be set to any other number</div>
        <div class="text-h6">Short Events</div>
        <div class="text-body">The node number for adding short events is always 0</div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "AddEventInfoDialog"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/




</script>

<style scoped>

</style>
