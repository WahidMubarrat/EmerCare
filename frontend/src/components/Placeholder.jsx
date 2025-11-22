export default function Placeholder({ label = 'Component' }) {
  return (
    <div style={{ padding: 12, border: '1px dashed #aaa', borderRadius: 8 }}>
      <strong>{label}</strong> is ready.
    </div>
  );
}
