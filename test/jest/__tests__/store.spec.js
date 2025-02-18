import { describe, expect, it } from '@jest/globals';
import * as store from "../../../src/store/index.js";


describe('store Test', () => {



  it('cbusTrafficTimeStamp test', () => {
    console.log (`store ${JSON.stringify(store.default.state.cbusTrafficTimeStamp)}`)
    expect(store.default.state.cbusTrafficTimeStamp).toBe(0)
  });

});

