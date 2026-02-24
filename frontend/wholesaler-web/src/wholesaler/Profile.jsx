import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/me");
      setUser(res.data.user);
      setFormData(res.data.user);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.put("/me", {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        businessName: formData.businessName,
      });

      setUser(res.data.user);
      setEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="card">
      <h2 style={{ marginBottom: 25 }}>Profile</h2>

      {!editing ? (
        <>
          <div style={{ lineHeight: "1.8" }}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Business:</strong> {user.businessName}</p>
            <p><strong>Address:</strong> {user.address}</p>
          </div>

          <button
            className="primary-btn"
            style={{ marginTop: 20 }}
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>

          <button
            className="danger-btn"
            style={{ marginTop: 15 }}
            onClick={handleLogout}
          >
          Logout
          </button>
        </>
      ) : (
        <div className="form-card">
          <div className="form-grid">
            <input
              className="form-input"
              placeholder="Name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
              className="form-input"
              placeholder="Phone"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />

            <input
              className="form-input"
              placeholder="Business Name"
              value={formData.businessName || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  businessName: e.target.value,
                })
              }
            />

            <input
              className="form-input"
              placeholder="Address"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <button className="primary-btn" onClick={handleSave}>
              Save Changes
            </button>

            <button
              className="secondary-btn"
              style={{ marginLeft: 10 }}
              onClick={() => {
                setEditing(false);
                setFormData(user);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}