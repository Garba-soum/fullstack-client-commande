import { useEffect, useMemo, useState } from "react";
import {
  fetchUsers,
  createUser,
  createAdmin,
  deleteUser,
} from "../services/admin.service";
import { useAuth } from "../auth/AuthContext";

export default function AdminCreate() {
  const { user } = useAuth(); // Infos utilisateur connecté (doit être ADMIN)
  // ---------
  // Liste users
  // ---------
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState("");

  // ---------
  // Form création 
  // ---------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [asAdmin, setAsAdmin] = useState(false);

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorCreate, setErrorCreate] = useState("");

  // ---------
  // Recherche
  // ---------
  const [q, setQ] = useState("");

  const filteredUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      const a = (u.username || "").toLowerCase();
      const b = (u.email || "").toLowerCase();
      const c = (u.role || u.roles || "").toString().toLowerCase();
      return a.includes(s) || b.includes(s) || c.includes(s);
    });
  }, [q, users]);

  // -----------------------------
  // Chargement initial de la liste
  // -----------------------------
  async function loadUsers() {
    setErrorList("");
    setLoadingList(true);
    try {
      const data = await fetchUsers();

      // Supporte plusieurs formats possibles
      // - soit un tableau direct
      // - soit { items: [...] } ou { content: [...] }
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.content)
            ? data.content
            : [];

      setUsers(list);
    } catch (err) {
      const status = err?.response?.status || 0;
      if (status === 403)
        setErrorList("Accès refusé (403) : tu n'es pas ADMIN.");
      else
        setErrorList(
          "Impossible de charger les utilisateurs. Vérifie le backend.",
        );
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // -----------------------------
  // Création user/admin
  // -----------------------------
  async function handleCreate(e) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorCreate("");
    setLoadingCreate(true);

    try {
      const payload = {
        username: username.trim(),
        password: password,
      };
      if (email.trim()) payload.email = email.trim();

      if (asAdmin) await createAdmin(payload);
      else await createUser(payload);

      setSuccessMsg(asAdmin ? "Admin créé ✅" : "Utilisateur créé ✅");

      setUsername("");
      setPassword("");
      setEmail("");
      setAsAdmin(false);

      await loadUsers();
    } catch (err) {
      const status = err?.response?.status || 0;
      if (status === 400)
        setErrorCreate("Requête invalide (400). Vérifie les champs.");
      else if (status === 409)
        setErrorCreate("Conflit (409). Username déjà utilisé.");
      else if (status === 403)
        setErrorCreate("Accès refusé (403) : action ADMIN requise.");
      else setErrorCreate("Impossible de créer. Vérifie les routes backend.");
    } finally {
      setLoadingCreate(false);
    }
  }

  // -----------------------------
  // Suppression user
  // -----------------------------
  async function handleDelete(u) {
    const id = u.id ?? u.userId ?? u._id;
    if (id === undefined || id === null) {
      alert(
        "Impossible de supprimer : l'id utilisateur est introuvable dans l'objet.",
      );
      return;
    }

    //  Empêcher de supprimer son propre compte (si tu as user dans AuthContext)
    // Nécessite: const { user } = useAuth()
    if (user?.username && u.username === user.username) {
      alert("Tu ne peux pas supprimer ton propre compte.");
      return;
    }

    const label = u.username ? u.username : `ID ${id}`;
    const ok = window.confirm(`Supprimer l'utilisateur ${label} ?`);
    if (!ok) return;

    try {
      await deleteUser(id);

      // Recharger depuis le backend (plus fiable que filter local)
      await loadUsers();
    } catch (err) {
      const status = err?.response?.status || 0;
      if (status === 403) alert("403 : accès refusé (ADMIN requis).");
      else
        alert("Suppression impossible. Vérifie la route DELETE côté backend.");
    }
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>Administration</h1>
      <p style={styles.subtitle}>
        Gestion des utilisateurs : création, consultation, suppression.
      </p>

      {/* ---- Bloc création ---- */}
      <div style={styles.card}>
        <h2 style={styles.h2}>Créer un compte</h2>

        {successMsg ? <div style={styles.ok}>{successMsg}</div> : null}
        {errorCreate ? <div style={styles.ko}>{errorCreate}</div> : null}

        <form onSubmit={handleCreate} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loadingCreate}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email (optionnel)</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loadingCreate}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loadingCreate}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Type</label>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={asAdmin}
                  onChange={(e) => setAsAdmin(e.target.checked)}
                  disabled={loadingCreate}
                />
                <span style={{ marginLeft: 8 }}>Créer en tant qu’ADMIN</span>
              </label>
            </div>
          </div>

          <button style={styles.btnPrimary} disabled={loadingCreate}>
            {loadingCreate ? "Création..." : "Créer"}
          </button>
        </form>
      </div>

      {/* ---- Bloc liste ---- */}
      <div style={styles.card}>
        <div style={styles.listHeader}>
          <h2 style={styles.h2}>Utilisateurs</h2>
          <button
            style={styles.btnGhost}
            onClick={loadUsers}
            disabled={loadingList}
          >
            {loadingList ? "Chargement..." : "Rafraîchir"}
          </button>
        </div>

        {errorList ? <div style={styles.ko}>{errorList}</div> : null}

        <input
          placeholder="Rechercher (username, email, role)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={styles.search}
        />

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td style={styles.td} colSpan={5}>
                    {loadingList ? "Chargement..." : "Aucun utilisateur"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  // ID fiable (obligatoire pour React + backend)
                  const id = u.id ?? u.userId ?? u._id;
                  if (id === undefined || id === null) return null;

                  // Normalisation du rôle
                  const role = u.role
                    ? u.role.replace("ROLE_", "")
                    : Array.isArray(u.roles)
                      ? u.roles.map((r) => r.replace("ROLE_", "")).join(", ")
                      : "-";

                  // Empêcher la suppression de son propre compte
                  const isSelf = user?.username && u.username === user.username;

                  return (
                    <tr key={id}>
                      <td style={styles.td}>{id}</td>
                      <td style={styles.td}>{u.username || "-"}</td>
                      <td style={styles.td}>{u.email || "-"}</td>
                      <td style={styles.td}>{role}</td>
                      <td style={styles.td}>
                        <button
                          style={{
                            ...styles.btnDanger,
                            opacity: isSelf ? 0.5 : 1,
                            cursor: isSelf ? "not-allowed" : "pointer",
                          }}
                          disabled={isSelf}
                          onClick={() => handleDelete(u)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 980, margin: "20px auto", padding: 16 },
  title: { fontSize: 44, marginBottom: 6 },
  subtitle: { marginTop: 0, color: "#444", marginBottom: 18 },

  card: {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    background: "#fff",
    marginBottom: 16,
  },
  h2: { margin: 0, marginBottom: 12 },

  ok: {
    background: "#e7f7ee",
    border: "1px solid #b7e1c6",
    padding: 12,
    borderRadius: 8,
    color: "#1e5b3a",
    marginBottom: 12,
  },
  ko: {
    background: "#fde2e2",
    border: "1px solid #f5b5b5",
    padding: 12,
    borderRadius: 8,
    color: "#7a1c1c",
    marginBottom: 12,
  },

  form: { display: "flex", flexDirection: "column", gap: 12 },
  row: { display: "flex", gap: 12, flexWrap: "wrap" },
  field: { flex: "1 1 280px", minWidth: 260 },
  label: { display: "block", fontWeight: 800, marginBottom: 6 },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  checkbox: { display: "flex", alignItems: "center", marginTop: 10 },

  btnPrimary: {
    padding: "12px 14px",
    borderRadius: 8,
    border: "none",
    background: "#1f6feb",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    width: 200,
  },
  btnGhost: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #f0b0b0",
    background: "#fde2e2",
    fontWeight: 800,
    cursor: "pointer",
  },

  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  search: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: 12,
  },

  tableWrap: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #eee",
    borderRadius: 10,
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 720 },
  th: {
    textAlign: "left",
    padding: 12,
    borderBottom: "1px solid #eee",
    background: "#fafafa",
  },
  td: { padding: 12, borderBottom: "1px solid #eee" },

  hint: { color: "#555", marginTop: 12, fontSize: 13 },
};
