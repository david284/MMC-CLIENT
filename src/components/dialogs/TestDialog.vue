<template>
  <q-dialog v-model="model">

    <!-- min-width: has no effect on q-dialog -->
    <q-card  style="min-width: 800px" class="q-pa-none q-ma-none">
      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Test dialog
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card>
        <q-card-actions align="left" class="text-primary q-py-none no-margin">
          <q-btn flat label="Request Event By Index" @click="clickRequestEventByIndex()"/>
        </q-card-actions>
      </q-card>

    </q-card>

  </q-dialog>
</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "TestDialog"
const showMore = ref(false)

const props = defineProps({
  modelValue: { type: Boolean, required: true }
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


const clickRequestEventByIndex = () => {
  console.log(name + `: clickRequestEventByIndex`)
  store.methods.request_node_event_by_index(1,2)
}

const clickShowMore = () => {
  console.log(name + `: clickShowMore: value ${showMore.value}`)
  showMore.value = showMore.value ? false : true
}



</script>

<style scoped>

</style>
