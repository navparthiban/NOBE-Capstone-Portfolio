export default function TextBox({ message }) {
  return (
    <div className="text-box" aria-live="polite">
      {message}
    </div>
  )
}
