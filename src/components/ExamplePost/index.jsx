import { useState } from "react";
import axios from "axios";

export default function ExamplePost({ name, api }) {
  const [resp, setResp] = useState(null);
  const [payload, setPayload] = useState({ text: "Hello" });

  const backendBase = import.meta.env.VITE_REST_BASE_API;

  async function callPost() {
    try {
      const res = await axios.post(
        `${backendBase}${api}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setResp(res.data);
    } catch (err) {
      setResp({ error: err.toString() });
    }
  }

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h3>POST: {name}</h3>
        <button onClick={callPost}>Submit</button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>payload (JSON):</label>
        <textarea
          rows={3}
          style={{ width: "100%" }}
          value={JSON.stringify(payload, null, 2)}
          onChange={(e) => {
            try {
              setPayload(JSON.parse(e.target.value));
            } catch {
              // ignore parse error while typing
            }
          }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Response (JSON):</label>
        <textarea
          rows={5}
          style={{ width: "100%" }}
          readOnly
          value={resp ? JSON.stringify(resp, null, 2) : ""}
        />
      </div>
    </section>
  );
}
