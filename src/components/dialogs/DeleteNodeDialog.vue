<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 350px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Delete node {{ store.getters.node_name(nodeNumber) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card-section>
          <div class="text-h6">Are you sure you want to delete this node?</div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat colour="positive" label="Yes" v-close-popup @click="clickDeleteNode()"/>
          <q-btn flat colour="positive" label="No" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = 'DeleteNodeDialog'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true }
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

const clickDeleteNode = () => {
  console.log(name + ": deleting node " + props.nodeNumber)
  store.methods.remove_node(props.nodeNumber)
  store.eventBus.emit('NODE_DELETED_EVENT', props.nodeNumber)
}




</script>

<style scoped>

</style>
