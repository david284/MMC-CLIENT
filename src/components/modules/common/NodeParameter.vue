<template>
  <q-card class="q-pa-xs" flat>
    <b>{{ Name }}</b> : {{ Value }}
  </q-card>
</template>

<script setup>

const props = defineProps({
  "Name": String,
  "Value": Number
})

</script>
