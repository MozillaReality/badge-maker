import React from "react";

export function TextInput({ label, state, setState, stateKey }) {
  return (
    <>
      <label>{label}</label>
      <input
        value={state[stateKey]}
        onChange={(e) =>
          setState((state) => ({ ...state, [stateKey]: e.target.value }))
        }
      />
    </>
  );
}
