<template>
  <q-card class="q-pa-xs" flat>
    <b>{{ Name }}</b> : {{ Value }}
  </q-card>
</template>

<script setup>

// note use of array, not object so the type isn't defined
// this is so it can handle a mix of text & numbers
const props = defineProps([
  "Name", "Value"
])

</script>
