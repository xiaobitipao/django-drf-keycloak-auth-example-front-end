import { useState } from "react";
import axios from "axios";

export default function App() {
  const [getResp, setGetResp] = useState(null);
  const [postResp, setPostResp] = useState(null);
  const [payload, setPayload] = useState({ text: "Hello from React" });

  const backendBase = import.meta.env.VITE_REST_BASE_API;

  async function callGet() {
    try {
      const res = await axios.get(`${backendBase}/example/hello/`);
      setGetResp(res.data);
    } catch (err) {
      setGetResp({ error: err.toString() });
    }
  }

  async function callPost() {
    try {
      const res = await axios.post(
        `${backendBase}/example/echo/`,
        { refresh_token: "Hello from React" },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setPostResp(res.data);
    } catch (err) {
      setPostResp({ error: err.toString() });
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>React ↔ Django DRF (axios demo)</h2>

      <section style={{ marginBottom: 20 }}>
        <h3>GET 示例</h3>
        <button onClick={callGet}>调用 GET /example/hello/</button>
        <pre>{getResp ? JSON.stringify(getResp, null, 2) : "未调用"}</pre>
      </section>

      <section>
        <h3>POST 示例</h3>
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
        <button onClick={callPost}>调用 POST /example/echo/</button>
        <pre>{postResp ? JSON.stringify(postResp, null, 2) : "未调用"}</pre>
      </section>
    </div>
  );
}
