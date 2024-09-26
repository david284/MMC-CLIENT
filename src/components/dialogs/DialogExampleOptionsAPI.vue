<!-- Example ChildDialog -->
<template>
  <q-dialog v-model='model' persistent>
    <q-card
      style='max-width: 400px; width:100%; max-height: 300px; height:100%;'>
      <q-card-section class='row items-center no-wrap'>
        <div class="text-h6">Dialog example</div>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup @click="closeDialog()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>

import { computed } from 'vue';
export default {
  name: 'CookiesDialogWhichWeUse',
  props: {
    modelValue: { type: Boolean, required: true }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })
    return { model };
  }
};
</script>