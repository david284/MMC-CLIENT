<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 350px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Delete event :  {{ store.getters.event_name(props.eventIdentifier) }}
          </div>
          <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
        </q-banner>

        <q-card-section>
          <div class="text-h6">Are you sure you want to delete this event?</div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat color="positive" label="Yes" v-close-popup @click="removeEvent()"/>
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

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true },
  eventIdentifier: {type: String, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})


const removeEvent = () => {
  console.log(`removeEvent ` + props.nodeNumber + ' ' + props.eventIdentifier)
  store.methods.remove_event(props.nodeNumber, props.eventIdentifier)
}



onBeforeMount(() => {
})

onMounted(() => {
})




</script>

<style scoped>

</style>
