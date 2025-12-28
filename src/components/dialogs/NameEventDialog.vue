<template>

  <q-dialog v-model="model" persistent>
    <q-card style="min-width: 350px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Edit name for event :  {{ store.getters.event_name(props.eventIdentifier) }}
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <EventNameAndGroup
        :eventIdentifier=eventIdentifier
      />

    </q-card>

  </q-dialog>

</template>


<script setup>

import {inject, onUpdated, computed, watch, ref} from "vue";
import * as utils from "components/functions/utils.js"
import EventNameAndGroup from "components/modules/common/EventNameAndGroup"

const store = inject('store')
const name = "NameEventDialog"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  eventIdentifier: { type:String, required: true }
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
