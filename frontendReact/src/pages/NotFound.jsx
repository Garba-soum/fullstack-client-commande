import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>404</h1>
      <p style={styles.text}>Page introuvable.</p>

      <Link to="/" style={styles.btnPrimary}>
        Retour à l’accueil
      </Link>
    </div>
  )
}

const styles = {
  wrap: { maxWidth: 720, margin: '60px auto', padding: 16, textAlign: 'center' },
  title: { fontSize: 64, margin: 0 },
  text: { fontSize: 18, marginTop: 10, marginBottom: 24, color: '#444' },
  btnPrimary: {
    display: 'inline-block',
    padding: '10px 14px',
    borderRadius: 8,
    background: '#1f6feb',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 700,
  },
}
