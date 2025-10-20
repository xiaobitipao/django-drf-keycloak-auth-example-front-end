import {
  unstable_HistoryRouter as HistoryRouter,
  Routes,
  Route,
} from "react-router-dom";
import { message } from "antd";

import "./App.css";

import { history } from "@/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "@/components/Auth";
import Layout from "@/pages/Layout";

/**
 * antd message setting
 * Set maxCount to 1 to prevent multiple messages from being displayed at the same time.
 */
message.config({
  duration: 2,
  maxCount: 1,
});

function App() {
  return (
    <HistoryRouter history={history}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        ></Route>
        <Route path="/auth/callback" element={<Auth />} />
      </Routes>
    </HistoryRouter>
  );
}

export default App;
