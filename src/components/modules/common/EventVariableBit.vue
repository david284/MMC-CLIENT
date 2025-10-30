<template>
  <q-card-section class="no-margin no-padding">
    <q-checkbox
      dense
      min-width="100"
      v-model="checked"
      :label=label
      right-label
      @update:model-value="updated"
    ></q-checkbox>
  </q-card-section>
</template>

<script setup>
import {inject, ref, onMounted, computed, watch} from "vue";
import {getLinkedEventVariables} from "components/modules/common/commonFunctions.js"
import * as EventFunctions from "components/functions/EventFunctions.js"

const name = "EventVariableBit"
const props = defineProps({
  nodeNumber: { type: Number, required: true },
  eventIdentifier: { type: String, required: true },
  eventIndex: { type: Number, required: true },
  eventVariableIndex: { type: Number, required: true },
  bit: { type: Number, required: true },
  label: { type: String, required: false },
  configuration: { type: Object,  required: true }
})

const store = inject('store')

const bitArray = {0: 1, 1: 2, 2: 4, 3: 8, 4: 16, 5: 32, 6: 64, 7: 128}
const checked = ref(false)


const eventVariableValue = computed(() => {
  return store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex)
})

watch(eventVariableValue, () => {
  checked.value = eventVariableValue.value & bitArray[props.bit] ? true : false
})

const updated = (v, e) => {
  //console.log(name + ": updated " + checked.value)
  update_checked()
}



const update_checked = () => {

  let byteValue = eventVariableValue.value
  //console.log(`EventVariableBit update_checked ${checked.value} ${byteValue}`)
  if (checked.value) {
    byteValue = byteValue | bitArray[props.bit]										// set bit by 'or-ing' bit value
  } else {
    byteValue = byteValue & ~bitArray[props.bit]									// clear bit by 'and-ing' inverse bit value
  }
  //console.log(`EventVariableBit update_checked-2 ${checked.value} ${byteValue}`)

  EventFunctions.eventTeach(
    store,
    props.nodeNumber,
    props.eventIdentifier,
    props.eventIndex,
    props.eventVariableIndex,
    byteValue,
    true,
    getLinkedEventVariables(props.configuration)
    )

}

//console.log(`EventVariableBit ` + eventVariableValue.value)

onMounted(() => {
  var initial_value = store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex)
  checked.value = initial_value & bitArray[props.bit] ? true : false
})

</script>

<style scoped>

</style>
