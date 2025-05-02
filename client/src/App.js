import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000/api";

function App() {
  const [formType, setFormType] = useState("login");
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: "", description: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const endpoint = formType === "register" ? "users/register" : "users/login";
    const payload = {
      email: formData.email,
      password: formData.password,
      ...(formType === "register" && { username: formData.username })
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      localStorage.setItem("token", data.token);
      setUser(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const fetchProposals = async () => {
    try {
      setLoadingProposals(true);
      const res = await fetch(`${API_BASE}/proposals`);
      const data = await res.json();
      setProposals(data);
    } catch (err) {
      console.error("Error loading proposals:", err);
    } finally {
      setLoadingProposals(false);
    }
  };

  const voteOnProposal = async (proposalId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/proposals/${proposalId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser((prev) => ({ ...prev, tokenBalance: prev.tokenBalance - 10 }));
      fetchProposals();
    } catch (err) {
      alert(err.message);
    }
  };

  const earnTokens = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/users/earn`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser((prev) => ({ ...prev, tokenBalance: data.tokenBalance }));
      alert(data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  const createProposal = async () => {
    const token = localStorage.getItem("token");

    if (!newProposal.title.trim()) {
      alert("Title is required.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newProposal),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Proposal submitted!");
      setNewProposal({ title: "", description: "" });
      fetchProposals();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  return (
    <div className="container">
      <h1>Community Hub</h1>

      {user ? (
        <>
          <h2>Welcome, {user.username} 👋</h2>
          <p>Token Balance: {user.tokenBalance}</p>
          <button onClick={logout}>Logout</button>
          <button onClick={earnTokens} style={{ marginTop: 10 }}>
            Claim Daily Reward (+10 tokens)
          </button>

          <hr style={{ margin: "30px 0", opacity: 0.2 }} />

          <div style={{ marginTop: 30, background: "#2c2c2c", padding: 20, borderRadius: 10 }}>
  <h3 style={{ marginBottom: 15 }}>Submit a Proposal</h3>

  <input
    type="text"
    placeholder="Proposal Title"
    value={newProposal.title}
    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
    style={{
      width: "95%",
      padding: "10px",
      marginBottom: "10px",
      borderRadius: "6px",
      border: "1px solid #444",
      backgroundColor: "#1e1e1e",
      color: "#fff"
    }}
  />

  <textarea
    placeholder="Description (optional)"
    value={newProposal.description}
    onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
    rows={4}
    style={{
      width: "95%",
      padding: "10px",
      marginBottom: "10px",
      borderRadius: "6px",
      border: "1px solid #444",
      backgroundColor: "#1e1e1e",
      color: "#fff",
      resize: "vertical"
    }}
  />

  <button onClick={createProposal}>Submit Proposal</button>
</div>

          <hr style={{ margin: "30px 0", opacity: 0.2 }} />

          <h3>Proposals</h3>
          {loadingProposals ? (
            <p>Loading proposals...</p>
          ) : proposals.length === 0 ? (
            <p>No proposals yet.</p>
          ) : (
            proposals.map((proposal) => (
              <div key={proposal._id} style={{ marginTop: 20, borderTop: "1px solid #444", paddingTop: 10 }}>
                <h4>{proposal.title}</h4>
                <p>{proposal.description}</p>
                <p>Votes: {proposal.votes}</p>
                <button
                  onClick={() => voteOnProposal(proposal._id)}
                  style={{ marginTop: 5 }}
                >
                  Vote (−10 tokens)
                </button>
              </div>
            ))
          )}
        </>
      ) : (
        <>
          <h2>{formType === "login" ? "Login" : "Register"}</h2>

          {formType === "register" && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : formType === "login" ? "Login" : "Register"}
          </button>

          <p>
            {formType === "login" ? (
              <>
                Don’t have an account?{" "}
                <span onClick={() => setFormType("register")}>Register</span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span onClick={() => setFormType("login")}>Login</span>
              </>
            )}
          </p>

          {error && <p className="error">{error}</p>}
        </>
      )}
    </div>
  );
}

export default App;
