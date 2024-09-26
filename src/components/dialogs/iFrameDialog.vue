<template>
  <q-dialog v-model="model" persistent full-width full-height>
    <q-card class="q-pa-none q-ma-none">

      <q-card-section style="max-height: 12vh" class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Example banner  
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card>

        <q-card-section style="max-height: 88vh" class="scroll no-margin no-padding">
          <iframe :src="URL" style="width:100vw; height:100vh;"></iframe>
        </q-card-section>

      </q-card>

    </q-card>
  </q-dialog>
</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "DialogExampleCompositionAPI"
const showMore = ref(false)

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  URL:{type:String, required:true }
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


const clickShowMore = () => {
  showMore.value = showMore.value ? false : true
}



</script>

<style scoped>

</style>
