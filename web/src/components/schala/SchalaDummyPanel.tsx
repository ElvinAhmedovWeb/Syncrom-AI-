export default function SchalaDummyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="schala-nofolder" style={{ padding: "20px", textAlign: "center" }}>
      <p className="schala-nofolder-title" style={{ fontSize: "14px", marginBottom: "8px" }}>{title}</p>
      <p className="schala-nofolder-desc">{description}</p>
    </div>
  );
}
