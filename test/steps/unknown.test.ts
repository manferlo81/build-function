import { compileStep } from "../../src";

describe("unknown step", () => {

  test("should throw on unknown step", () => {

    expect(() => compileStep(undefined as any)).toThrow();
    expect(() => compileStep(null as any)).toThrow();

  });

  test("should throw on unknown step type", () => {

    const step = {
      type: "unknown",
    };

    expect(() => compileStep(step as any)).toThrow();

  });

});
