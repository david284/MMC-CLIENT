<template>
  <q-dialog v-model="model" position="left">
    <!-- min-width: has no effect on q-dialog -->
    <q-card  style="width: 300px" class="q-pa-none q-ma-none">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Bus Traffic
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card>
        <q-card-section style="max-height: 50vh" class="scroll q-py-none no-margin">
          <q-list bordered >
            <q-item
              v-for="message in store.state.nodeTraffic"
              :key="message"
              clickable
              dense
              v-ripple
              >
            <q-item-label dense class="q-pa-none q-my-none">{{ message.direction + "&nbsp;&nbsp;&nbsp;" + message.json.mnemonic }}</q-item-label>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

    </q-card>
  </q-dialog>
</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "BusTrafficDialog"
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
//  console.log(name + `: WATCH model`)
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
