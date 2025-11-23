import { useState } from "react";
import axios from "axios";

export default function ExampleGet({ name, api }) {
  const [resp, setResp] = useState(null);

  const backendBase = import.meta.env.VITE_REST_BASE_API;

  async function callGet() {
    try {
      const res = await axios.get(`${backendBase}${api}`);
      setResp(res.data);
    } catch (err) {
      setResp({ error: err.toString() });
    }
  }

  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h3>GET: {name}</h3>
        <button onClick={callGet}>Submit</button>
      </div>
      <textarea
        rows={5}
        style={{ width: "100%" }}
        readOnly
        value={resp ? JSON.stringify(resp, null, 2) : ""}
      />
    </section>
  );
}
