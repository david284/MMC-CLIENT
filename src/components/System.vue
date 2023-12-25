<template>
  <div class="bg-primary q-pa-md">
    <div class="q-pa-md bg-white rounded-borders">
      <div class="text-h4">System</div>
      <q-card class="q-pa-md" flat>
        <q-btn color="negative" label="stop Server" @click="stop1()" no-caps/>
        This will signal the server to stop and close the page
      </q-card>
    </div>
  </div>
</template>

<script setup>
import {inject} from "vue";

const store = inject('store')

const stop1 = () => {
  store.methods.STOP_SERVER()
}



</script>

<style scoped>

</style>
