import React from "react";

export function ColorInput({ label, state, setState, stateKey }) {
  return (
    <>
      <label className="color">
        {label}
        <input
          type="color"
          value={state[stateKey]}
          onChange={(e) =>
            setState((state) => ({ ...state, [stateKey]: e.target.value }))
          }
        />
      </label>
    </>
  );
}
