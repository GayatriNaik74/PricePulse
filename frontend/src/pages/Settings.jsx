import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/auth/me").then((res) => setUser(res.data));
  }, []);

  const toggleSetting = async (key) => {
    const updated = { ...user, [key]: !user[key] };
    setUser(updated);
    setSaving(true);
    try {
      await axiosClient.patch("/auth/settings", { [key]: updated[key] });
      setMessage("Preferences saved");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Failed to save — reverting");
      setUser(user); // revert on failure
      setTimeout(() => setMessage(""), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    try {
      await axiosClient.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setMessage("Password updated successfully");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Could not update password");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    await axiosClient.delete("/auth/me");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-blue-50">
        <Sidebar />
        <main className="flex-1 bg-navy-950 flex items-center justify-center">
          <p className="text-gray-400">Loading settings...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />

      <main className="flex-1 bg-navy-950 min-h-screen">
        <div className="flex items-center justify-between px-8 py-5 bg-blue-50">
          <div className="w-96" />
          <button
            onClick={() => navigate("/add-product")}
            className="bg-mint-400 hover:bg-mint-500 text-navy-950 font-semibold px-5 py-2.5 rounded-lg transition"
          >
            + Add Product
          </button>
        </div>

        <div className="px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-400 mt-1">Manage your account preferences and alerts.</p>
            </div>
            {message && (
              <span className="text-mint-400 text-sm font-medium">{message}</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 mt-6">
            {/* Profile card */}
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-navy-800 mx-auto flex items-center justify-center text-2xl text-mint-400 font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-white font-semibold mt-4">{user.name}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>

            {/* Account settings */}
            <div className="col-span-2 bg-navy-900 border border-navy-800 rounded-xl p-6">
              <h2 className="text-mint-400 font-semibold mb-4">🛡 Account Settings</h2>

              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full flex items-center justify-between bg-navy-800 rounded-lg px-4 py-3 mb-3 hover:bg-navy-800/70 transition"
              >
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Change Password</p>
                  <p className="text-gray-400 text-xs">Update your security credentials</p>
                </div>
                <span className="text-gray-400">{showPasswordForm ? "▲" : "▶"}</span>
              </button>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="bg-navy-800 rounded-lg p-4 mb-3 space-y-3">
                  {passwordError && (
                    <p className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2">{passwordError}</p>
                  )}
                  <input
                    type="password"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-navy-950 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-mint-400"
                    required
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-navy-950 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-mint-400"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-mint-400 hover:bg-mint-500 text-navy-950 font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Update Password
                  </button>
                </form>
              )}

              <div className="flex items-center justify-between bg-navy-800 rounded-lg px-4 py-3 mb-3 opacity-60">
                <div>
                  <p className="text-white text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-gray-400 text-xs">Not yet available — requires additional setup</p>
                </div>
                <span className="text-gray-500 text-xs">Coming soon</span>
              </div>
            </div>
          </div>

          {/* Notification preferences */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 mt-6">
            <h2 className="text-mint-400 font-semibold mb-4">🔔 Notification Preferences</h2>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Price Alerts</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <label className="flex items-start gap-3 bg-navy-800 rounded-lg px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.email_alerts}
                  onChange={() => toggleSetting("email_alerts")}
                  className="mt-1 accent-mint-400"
                />
                <div>
                  <p className="text-white text-sm font-medium">Email</p>
                  <p className="text-gray-400 text-xs">Sent when a price hits your target</p>
                </div>
              </label>

              <label className="flex items-start gap-3 bg-navy-800 rounded-lg px-4 py-3 cursor-pointer opacity-60">
                <input
                  type="checkbox"
                  checked={user.push_alerts}
                  onChange={() => toggleSetting("push_alerts")}
                  className="mt-1 accent-mint-400"
                  disabled
                />
                <div>
                  <p className="text-white text-sm font-medium">Push</p>
                  <p className="text-gray-400 text-xs">Requires a mobile app — not built yet</p>
                </div>
              </label>

              <label className="flex items-start gap-3 bg-navy-800 rounded-lg px-4 py-3 cursor-pointer opacity-60">
                <input
                  type="checkbox"
                  checked={user.sms_alerts}
                  onChange={() => toggleSetting("sms_alerts")}
                  className="mt-1 accent-mint-400"
                  disabled
                />
                <div>
                  <p className="text-white text-sm font-medium">SMS</p>
                  <p className="text-gray-400 text-xs">Requires SMS provider — not built yet</p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-navy-800 pt-4">
              <div>
                <p className="text-white text-sm font-medium">Weekly Newsletter</p>
                <p className="text-gray-400 text-xs">Trends and price movement summaries</p>
              </div>
              <button
                onClick={() => toggleSetting("weekly_newsletter")}
                className={`w-12 h-6 rounded-full transition relative ${
                  user.weekly_newsletter ? "bg-mint-400" : "bg-navy-800"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${
                    user.weekly_newsletter ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-navy-800 pt-4 mt-4">
              <div>
                <p className="text-white text-sm font-medium">System Updates</p>
                <p className="text-gray-400 text-xs">New feature announcements and maintenance</p>
              </div>
              <button
                onClick={() => toggleSetting("system_updates")}
                className={`w-12 h-6 rounded-full transition relative ${
                  user.system_updates ? "bg-mint-400" : "bg-navy-800"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${
                    user.system_updates ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Billing placeholder */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 mt-6 opacity-60">
            <h2 className="text-mint-400 font-semibold mb-2">💳 Membership & Billing</h2>
            <p className="text-gray-400 text-sm">
              Billing isn't set up yet — this app doesn't currently connect to a payment provider.
            </p>
          </div>

          {/* Danger zone */}
          <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6 mt-6">
            <h2 className="text-red-400 font-semibold mb-2">⚠ Danger Zone</h2>
            <p className="text-gray-400 text-sm mb-4">
              Permanently remove your account and all tracked product data. This action is irreversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSignOut}
                className="border border-navy-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-navy-800 transition"
              >
                Sign Out
              </button>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-500/20 transition"
                >
                  Delete Account
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-sm">Are you sure?</span>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition"
                  >
                    Yes, delete everything
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-gray-400 text-sm px-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}