<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 800px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6" >
            Information about Node Programming
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            Configuration memory is used to enable or disable hardware features of the MCU.
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            EEPROM memory is used to hold non-volatile settings for the firmware (such as node number, events etc..)
          </div>
          <div class="text_body1">
            Re-programming EEPROM memory will force the node into an un-initialsed state (green led lit) and will need to be re-initialised with a node number (typically started by holding the button down until the yellow led starts flashing)
          </div>
        </q-card>

      </q-card>
    </q-dialog>

</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "ProgramNodeInfoDialog"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})


onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/




</script>

<style scoped>

</style>
