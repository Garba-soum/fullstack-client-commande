import { Link } from 'react-router-dom'

export default function Forbidden() {
  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>403</h1>
      <p style={styles.text}>Accès interdit : tu n’as pas les droits pour voir cette page.</p>

      <div style={styles.actions}>
        <Link to="/clients" style={styles.btnPrimary}>Retour aux clients</Link>
        <Link to="/login" style={styles.btnGhost}>Se connecter</Link>
      </div>
    </div>
  )
}

const styles = {
  wrap: { maxWidth: 720, margin: '60px auto', padding: 16, textAlign: 'center' },
  title: { fontSize: 64, margin: 0 },
  text: { fontSize: 18, marginTop: 10, marginBottom: 24, color: '#444' },
  actions: { display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' },
  btnPrimary: {
    padding: '10px 14px',
    borderRadius: 8,
    background: '#1f6feb',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 700,
  },
  btnGhost: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #ccc',
    background: '#fff',
    color: '#111',
    textDecoration: 'none',
    fontWeight: 700,
  },
}
