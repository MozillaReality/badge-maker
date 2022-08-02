import React from "react";
import { createRoot } from "react-dom/client";
import QRCode from "qrcode";
import "./index.css";

const RES = 1024;

function App() {
  const [state, setState] = React.useState({
    nameOne: "JOHN SMITH",
    nameTwo: "SMITHERSON",
    company: "FOOCORP",
    role: "3D ARTIST",
    url: "https://www.foocorp.org/jssmitherson",
    text: "#eeeeff",
    back: "#ccccff",
    bottom: "#000066",
    highlight: "#4444aa",
  });

  const [saveUrl, setSaveUrl] = React.useState();

  const canvas = React.useRef();
  const ctx = React.useRef();

  React.useEffect(() => {
    canvas.current.width = RES;
    canvas.current.height = RES;
    ctx.current = canvas.current.getContext("2d");
  }, [canvas]);

  React.useEffect(() => {
    if (state.url) {
      const img = new Image();
      img.onload = () => {
        setState((state) => ({ ...state, qrcode: img }));
      };
      QRCode.toDataURL(
        state.url,
        { margin: 2, width: RES * 0.35156 },
        (err, url) => {
          img.src = url;
        }
      );
    }
  }, [state.url]);

  React.useEffect(() => {
    const ct = ctx.current;

    ct.fillStyle = state.back;
    ct.fillRect(0, 0, RES, RES);

    if (state.logo) {
      drawImageFitted(
        ct,
        state.logo,
        RES * 0.0195,
        RES * 0.195,
        RES * 0.1562,
        RES * 0.1562
      );
    }

    if (state.qrcode) {
      ct.drawImage(
        state.qrcode,
        RES * 0.625,
        RES * 0.43,
        RES * 0.352,
        RES * 0.352
      );
    }

    ct.fillStyle = state.bottom;
    ct.fillRect(0, RES - RES * 0.176, RES * 0.5, RES * 0.176);

    ct.fillStyle = "black";
    ct.fillRect(RES * 0.527, 0, RES * 0.078, RES);

    ct.fillStyle = state.highlight;
    ct.fillRect(RES * 0.0295, RES * 0.43, RES * 0.352, RES * 0.352);

    if (state.picture) {
      drawImageFitted(
        ct,
        state.picture,
        RES * 0.039,
        RES * 0.439,
        RES * 0.332,
        RES * 0.332
      );
    }

    ct.fillStyle = state.text;
    ct.font = `bold ${RES * 0.0586}px sans-serif`;
    ct.fillText(state.nameOne || "", RES * 0.0195, RES - RES * 0.117);
    ct.fillText(state.nameTwo || "", RES * 0.0195, RES - RES * 0.064);

    ct.font = `normal ${RES * 0.039}px sans-serif`;
    ct.fillText(state.company || "", RES * 0.0195, RES - RES * 0.0195);

    ct.save();

    ct.translate(RES * 0.41, RES * 0.879);
    ct.rotate(-Math.PI / 2);

    ct.fillStyle = state.highlight;
    ct.fillRect(0, 0, RES, RES * 0.0683);

    ct.font = `bold ${RES * 0.0586}px sans-serif`;
    ct.fillStyle = state.text;
    ct.fillText(state.role || "", RES * 0.0293, RES * 0.0537);

    ct.restore();

    setSaveUrl(null);
    const timeoutId = setTimeout(
      () => setSaveUrl(canvas.current?.toDataURL()),
      500
    );

    return () => {
      clearTimeout(timeoutId);
    };
  }, [ctx, state]);

  return (
    <>
      <div className="form">
        <h1>Badge Maker</h1>
        <ImageInput
          label="Logo"
          stateKey="logo"
          state={state}
          setState={setState}
        />
        <ImageInput
          label="Picture"
          stateKey="picture"
          state={state}
          setState={setState}
        />
        <TextInput
          label="Name (first line)"
          stateKey="nameOne"
          state={state}
          setState={setState}
        />
        <TextInput
          label="Name (second line)"
          stateKey="nameTwo"
          state={state}
          setState={setState}
        />
        <TextInput
          label="Company"
          stateKey="company"
          state={state}
          setState={setState}
        />
        <TextInput
          label="Role"
          stateKey="role"
          state={state}
          setState={setState}
        />
        <TextInput
          label="Url"
          stateKey="url"
          state={state}
          setState={setState}
        />
        <div className="colors">
          <ColorInput
            label="Text"
            stateKey="text"
            state={state}
            setState={setState}
          />
          <ColorInput
            label="Back"
            stateKey="back"
            state={state}
            setState={setState}
          />
          <ColorInput
            label="Bottom"
            stateKey="bottom"
            state={state}
            setState={setState}
          />
          <ColorInput
            label="Highlight"
            stateKey="highlight"
            state={state}
            setState={setState}
          />
        </div>
        <a
          className={`save ${saveUrl ? "" : "disabled"}`}
          download={filename(state)}
          href={saveUrl}
        >
          Save
        </a>
      </div>
      <canvas ref={canvas}></canvas>
    </>
  );
}

function TextInput({ label, state, setState, stateKey }) {
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

function ImageInput({ label, state, setState, stateKey }) {
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

function ColorInput({ label, state, setState, stateKey }) {
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

function drawImageFitted(ct, img, x, y, w, h) {
  const aspect = img.width / img.height;
  if (aspect > 1) {
    const ha = h / aspect;
    ct.drawImage(img, x, y + (h - ha) / 2, w, ha);
  } else if (aspect < 1) {
    const wa = w * aspect;
    ct.drawImage(img, x + (w - wa) / 2, y, wa, h);
  } else {
    ct.drawImage(img, x, y, w, h);
  }
}

function filename(state) {
  return `badge-${state.nameOne.replaceAll(" ", "-").toLowerCase()}${
    state.nameTwo ? `-${state.nameTwo.toLowerCase()}` : ""
  }.png`;
}

createRoot(root).render(<App />);
