<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 350px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Delete for node {{ store.getters.node_name(store.state.selected_node) }}
          </div>
        </q-banner>

        <q-card-section>
          <div class="text-h6">Are you sure you want to delete this node?</div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Yes" v-close-popup @click="deleteNode()"/>
          <q-btn flat label="Cancel" v-close-popup/>
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
  nodeNumber: {type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

const deleteNode = () => {
  console.log("deleting node " + props.nodeNumber)
//  store.methods.remove_node(props.NodeNumber)
}



onBeforeMount(() => {
})

onMounted(() => {
})




</script>

<style scoped>

</style>
