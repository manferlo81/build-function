import { ParameterDescriptor } from "../src";
import { compileParam } from "../src/compile";

describe("compile function parameters", () => {

  test("should compile parameter using cache", () => {

    const param1: ParameterDescriptor = { id: "param", type: "param" };
    const param2: ParameterDescriptor = { id: "param", type: "param" };

    const cache = {};
    const same = compileParam(param1, cache) === compileParam(param2, cache);

    // FIXME: it should be true
    expect(same).toBe(false);

  });

});
