import React from "react";

export function ImageInput({ label, state, setState, stateKey }) {
  return (
    <>
      <label>{label}</label>
      <input
        type="file"
        onChange={async (e) => {
          const imageBitmap = await createImageBitmap(e.target.files[0]);
          setState((state) => ({
            ...state,
            [stateKey]: imageBitmap,
          }));
        }}
      />
    </>
  );
}
