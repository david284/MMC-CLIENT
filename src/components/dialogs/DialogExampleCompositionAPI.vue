<template>

  <!-- <q-dialog v-model='model' persistent style="min-width: 350px"> -->

    <q-dialog v-model="model">


      <!-- min-width: has no effect on q-dialog -->
      <q-card  style="min-width: 800px" class="q-pa-none q-ma-none">

        <q-card-section class="q-pa-none q-ma-none">
          <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
            <div class="text-h6">
              Example banner  
            </div>
            <template v-slot:action>
              <q-btn flat color="white" size="md" label="Close" v-close-popup/>
            </template>
          </q-banner>
        </q-card-section>

        <q-card>

        <q-card-section style="max-height: 50vh" class="scroll">
          <q-card>
          <q-btn flat color="positive" label="example button"/>
          <q-btn flat color="negative" label="example button"/>
          </q-card>

          <p v-for="n in 5" :key="n">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum repellendus sit voluptate voluptas eveniet porro. Rerum blanditiis perferendis totam, ea at omnis vel numquam exercitationem aut, natus minima, porro labore.</p>
          <div v-if="(showMore)" class="text-red">  
            <p v-for="n in 5" :key="n">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum repellendus sit voluptate voluptas eveniet porro. Rerum blanditiis perferendis totam, ea at omnis vel numquam exercitationem aut, natus minima, porro labore.</p>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">
              Example q-card
            </div>
        </q-card-section>


      </q-card>
      <q-card-actions align="right" class="text-primary q-pa-none q-ma-none">
        <q-btn flat label="toggle show more" @click="clickShowMore()"/>
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
const name = "DialogExampleCompositionAPI"
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


const clickShowMore = () => {
  showMore.value = showMore.value ? false : true
}



</script>

<style scoped>

</style>
