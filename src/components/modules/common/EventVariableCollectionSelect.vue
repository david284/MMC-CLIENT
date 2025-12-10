/*
 * EventVariableCollectionSelect allows a collection (array) of EVs to be
 * set with specific values.
 * Diplayed as a selection box where each option in the box is associated with
 * the values to be set. 
 */
<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}
        <q-card-section style ="min-width: 10px; height: 10px" class="no-margin no-padding float-right text-caption text-weight-thin">
          &nbsp; {{ eventVariableIndex.toString() }}
        </q-card-section>
      </div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
    <q-select
      v-model="selectVariable"
      :style="minWidth"
      :options=props.options
      popup-content-class="q-pm-none"
      map-options
      @update:model-value="update_variable"
    >
    </q-select>
    </q-card-section>
  </q-card>
</template>

<script setup>
import {inject, ref, onMounted, computed, watch} from "vue";
import {overloadedLabel} from "components/modules/common/CommonLogicParsers.js";
import {getLinkedEventVariables} from "components/modules/common/commonFunctions.js"

/*
 * These properties can be set in the MDF and are used to modify the operation and display of
 * this component.
 */
const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "eventIdentifier": {
    type: String,
    required: true
  },
  "eventVariableIndex": {
    type: Object,
    required: true
  },
  "name": {
    type: String,
    required: false
  },
  "options": {
    required: true
  },
  "displayTitle": {
    type: String,
    required: false
  },
  "displaySubTitle": {
    type: String,
    required: false
  },
  configuration: {
    type: Object,
    required: true
  }
})

/*
 * Declare some variables
 */
const name = "EventVariableCollectionSelect"
const store = inject('store')
const selectVariable = ref()

/*
 * Whenever the variableValue variable is read the value is actually calculated using this funftion.
 * This builds an array of EV values.
 */
const variableValue = computed(() =>{
  //console.log(name +`: computed EVs:`+props.eventVariableIndex);
  const evv = [];
  for (const evi of props.eventVariableIndex) {
    var v = store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, evi);
    if (typeof(v) == 'undefined') v = 0;
    evv.push(v);
  }
  //console.log(name +`: computed evv=${evv}`);
  return evv;
})

/*
 * Whenever the variableValue variable is read the value is actually calculated using this funftion.
 * This looks for the maximum length of the option labels and returns a CSS string to set sufficient
 * width of the component to display the text in full.
 */
const minWidth = computed(() => {
  var maxLength=0;
  for (let i=0; i < props.options.length; i++) {
    //console.log(name +`label= ${props.options[i].label} length=${props.options[i].label.length}`);
    if (props.options[i].label.length > maxLength) {
      maxLength = props.options[i].label.length;
    }
  }
  //console.log(name+`length = ${maxLength}`);
  return `min-width:${maxLength}ch`;
})

/*
 * This function is called whenever variableValue is changed.
 * It simply copies the value to selectVariable.
 */
watch(variableValue, () => {
  //console.log(name +`: watch`);
  selectVariable.value = variableValue.value;
})

/*
 * The update_variable callback function is called when the user selects an option.
 * It uses writes the EVs.
 * newValue is an object of {"label", "value":array[ev_values]}
 */
const update_variable = (newValue) => {
//console.log(name +`: newValue ${newValue.value} NN=${props.nodeNumber} EN=${props.eventIdentifier}`);
  for (let i=0; i < props.eventVariableIndex.length; i++) {
    //console.log(name +`: eventVariableIndex ${props.eventVariableIndex[i]} value ${newValue.value[i]}`);
    store.methods.event_teach_by_identifier(
      props.nodeNumber, 
      props.eventIdentifier, 
      props.eventVariableIndex[i], 
      newValue.value[i],
      true,
      getLinkedEventVariables(props.configuration)
    )
  }
}

/*
 * onMounted is called when the component is to be displayed, it is used to initialise the display.
 * Load the EV values ready to be displayed and it will also show the currently selected option.
 */
onMounted(() => {
  //console.log(name + `: onMounted`);
  selectVariable.value = [];
  for (const evi of props.eventVariableIndex) {
    var v = store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, evi);
    if (typeof(v) == 'undefined') v = 0;
    selectVariable.value.push(v);
  }
})

</script>

<style scoped>

</style>
