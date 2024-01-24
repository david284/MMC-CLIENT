<template>
  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 350px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Bus message
        </div>
        <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card-section class="fit">
        <div class="text-h6">direction: {{ busMessage.direction }}</div>
        <div class="text-h6">
          message: {{ busMessage.json.text }}
        </div>
        <div class="text-h6">
          encoded: {{ busMessage.json.encoded }}
        </div>

<!--
        <div class="text-h6">
          <pre>
            message: {{ JSON.stringify (busMessage.json, null, "    ") }}
          </pre>
        </div>
 -->

</q-card-section>

    </q-card>
  </q-dialog>
</template>


<script setup>

/************************************************************************************
      usage
      <ModifiedGridConnectDialog v-model='showModifiedGridConnectDialog' />
      
************************************************************************************ */ 


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "ModifiedGridConnectDialog"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  busMessage: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
  console.log(name + `: WATCH model`)
})


onBeforeMount(() => {
})

onMounted(() => {
})




</script>

<style scoped>

</style>
