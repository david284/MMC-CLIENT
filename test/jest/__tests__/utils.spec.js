import { describe, expect, it } from '@jest/globals';
import each from 'jest-each';

import * as utils from "components/functions/utils.js"

  let store = {
    "state":{"layout":{
      "eventDetails":{
        "000A0001": {"name": "event #1"},
        "000A0002": {}
      },
      "nodeDetails":{
        "10": {"name": "CANACC5-10",
          "moduleName": "CANACC5"
        },
        "20": {}
      }
    }},
    "getters":{
      node_channel_name(nodeNumber, channelNumber){
        console.log(`unit_test: node_channel_name ${nodeNumber} ${channelNumber}`)
        let channelName = "undefined"
        if (channelNumber == 1){
          channelName = "switch"
        }
        if (channelNumber == 3){
          channelName = "turnout"
        }
        return channelName
      }
    },
    "setters":{
      event_name(eventIdentifier, eventName){
        event_name_updated = true
        console.log(`unit_test: event_name updated ${event_name_updated}`)
      },
      node_moduleName(nodeNumber, moduleName){
        node_moduleName_updated = true
      },
      node_name(nodeNumber, nodeName){
        node_name_updated = true
      },
      node_token_name(nodeNumber, token, channelNumber, name){
        console.log(`unit_test: setter: node_token_name: ${nodeNumber} ${token} ${channelNumber} ${name}`)
      }
    }
  }




describe('utils Test', () => {


  //
  // TimeStampToText test
  //
  each([
    [0, ""],
    ["549755813887", "5497/55/81 38:87"],
    ["202411092105", "2024/11/09 21:05"],
    [undefined, ""]
  ]).test('TimeStampToText test %s %s', (a, expected) => {
    console.log(`TimeStampToText test BEGIN ${a} ${expected}`)
    let result = utils.TimeStampToText(a)
    console.log('TimeStampToText: result = ' + result)
    expect(result).toBe(expected)
    console.log("TimeStampToText test END")
  });

  //
  //
  it('replaceChannelTokens test', () => {
    console.log("unit_test: replaceChannelTokens test BEGIN")
    let jsonObj = {test1: "${chaNNel1} green",
      test2: "${channel2",
      test3: "${CHANNEL **3**} red",
      test4: "${channel4",
      test5: "text"
    }
    let nodeNumber = 1
    let result = utils.replaceChannelTokens(store, jsonObj, nodeNumber)
    console.log('unit_test: replaceChannelTokens: result = ' + JSON.stringify(result))
    expect(result.test1).toMatch(/switch/);
    expect(result.test3).toMatch(/turnout/);
    console.log("unit_test: replaceChannelTokens test END")
  });


  //
  //
  it('extractMDFTokens test', () => {
    console.log("unit_test: extractMDFTokens test BEGIN")
    let jsonObj = {test1: "${chaNNel1} green",
      test2: "${channel2",
      test3: "${CHANNEL **3**} red",
      test4: "${channel4",
      test5: "${CHANNEL9} red",
      test6: "${CHANNEL2} red",
      test7: "${palette 2} red",
      test8: "${palette99}",
      test9: "${palette6}",
      test10: "text"
    }
    let result = utils.extractMDFTokens(jsonObj)
    console.log('unit_test: extractMDFTokens: result = ' + JSON.stringify(result, null, " "))
    expect(result["channel"].maxNumber).toMatch("9");
    expect(result["channel ****"].maxNumber).toMatch("3");
    expect(result["palette"].maxNumber).toMatch("99");
    console.log("unit_test: extractMDFTokens test END")
  });

  //
  //
  it('getListOfTokens test', () => {
    console.log("unit_test: getListOfTokens test BEGIN")
    let jsonObj = {test1: "${chaNNel1} green",
      test2: "${channel2",
      test3: "${CHANNEL **3**} red",
      test4: "${channel4",
      test5: "${CHANNEL9} red",
      test6: "${CHANNEL2} red",
      test6: "${palette2} red",
      test7: "text"
    }
    let result = utils.getListOfTokens(JSON.stringify(jsonObj))
    console.log('unit_test: getListOfTokens: result = ' + JSON.stringify(result, null, " "))
    expect(result[0]).toMatch("${chaNNel1}");
    expect(result[1]).toMatch("${CHANNEL **3**}");
    expect(result[2]).toMatch("${CHANNEL9}");
    expect(result[3]).toMatch("${palette2}");
    console.log("unit_test: getListOfTokens test END")
  });

  //
  //
  it('convertUserChannelNames test', () => {
    console.log("unit_test: convertUserChannelNames test BEGIN")
    store.state.layout.nodeDetails[10].channels = {
      "2": {
        "channelName": "user_channel_2"
      }
    }
    store.state.layout.nodeDetails[20].channels = {
      "4": {
        "channelName": "user_channel_4"
      }
    }
    console.log(`unit_test: convertUserChannelNames: ${JSON.stringify(store, null, "  ")}`)
    var result = utils.convertUserChannelNames(store.state, store.setters)
    console.log(`unit_test: convertUserChannelNames: ${JSON.stringify(store, null, "  ")}`)

    console.log("unit_test: convertUserChannelNames test END")

  })



});

