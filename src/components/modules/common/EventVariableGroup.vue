<template>
  <div class="q-pa-xs no-margin">

    <div style="border:2px solid grey" class="q-py-none no-margin">

      <div class = "GroupTitle q-py-none no-margin"> {{ configuration.displayTitle }}</div>
      <q-card-section class="q-py-none no-margin text-body1">
        <b>{{ configuration.displaySubTitle }}</b>
      </q-card-section>
      <q-card-section  class="q-py-none no-margin row">
        <EventVariables
          :configuration = configuration.groupItems
          :nodeNumber = nodeNumber
          :eventIdentifier = eventIdentifier
          :eventIndex = eventIndex
          >
        </EventVariables>
      </q-card-section>

    </div>

  </div>
</template>


<script setup>
  import {inject, ref, onMounted, computed, watch} from "vue";
  import EventVariables from "components/modules/common/EventVariables"

  const props = defineProps({
    configuration: Object,
    nodeNumber: {type: Number, required: true },
    eventIdentifier: {type: String, required: true },
    eventIndex: {type: Number, required: true }
  })

  const store = inject('store')
  const name = 'EventVariableGroup'

  onMounted(() => {
//    console.log(name + ": onMounted")
//    console.log(name + ':  props: ' + JSON.stringify(props))
  })


</script>


<style scoped>
.GroupTitle {
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
}
</style>
