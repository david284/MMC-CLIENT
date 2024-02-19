<template>
  <q-card class="q-pa-xs" flat>
<!--    <q-input
      :label="props.Name"
      v-model="props.Value"
      outlined
      readonly
    >
    </q-input>-->
    <b>{{ Name }}</b> : {{ Value }}
  </q-card>
</template>

<script>
import {onMounted} from "vue";

export default {
  name: "NodeParameter",
  props: ["Name", "Value"],
  setup(props) {
    /*onMounted(() => {
      console.log(`node-parameter mounted ` + props.Value)
    })*/
    return {props}
  }
}
</script>

<style scoped>

</style>
