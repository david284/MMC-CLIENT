<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 800px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6" >
            Information about the Events By Node View
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card class="q-pa-sm">
          <div class="text_body1  text-weight-bold">
            This view is intended to allow management of the events for a specific node
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            The intention is to always use 'fresh' data read from the nodes, and if the required data hasn't yet been read, there may be a pop-up displayed whilst that data is being read
          </div>
          <div class="text_body1">
            If the node has already been read, the display will use the data it has, but will update when the 'fresh' data arrives
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            The ADVANCED button gives access to further actions
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            The SEARCH option will filter on all of the text columns (such as Name & Group), and is not case sensitive, e.g. will find both 'switch' and 'Switch'
          </div>
          <div class="text_body1">
            It also matches partial text, so searching for 'switch' will find both 'switch-01' and 'switch-02'
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            The Name option allows the setting of a Group name as well, which is very useful when used with the SEARCH option
          </div>
        </q-card>

        <q-card class="q-pa-sm">
          <div class="text_body1">
            The event source shows if the event has been read from the module (stored event) or if the event hasn't been read from the module, but has been seen on the CAN bus (Bus event), which is the case for default events on some modules that can't be read from the module
          </div>
        </q-card>

      </q-card>
    </q-dialog>

    />


</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "EventsByNodeViewInfoDialog"

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
