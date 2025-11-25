<template>
  <q-dialog v-model='model' persistent full-width position="right">

  <EventsListByNode
    :nodeNumber = nodeNumber
    :isDialog = true
  />

  </q-dialog>
</template>


<script setup>

import {computed, inject, ref, watch, onBeforeMount, onMounted, onUpdated} from "vue"
import EventsListByNode from "components/views/EventsListByNode"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

</script>

<style lang="sass">
</style>
