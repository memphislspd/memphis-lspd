export default function FormLoading() {
  return (
    <div className="form-loading" role="status" aria-live="polite">
      <span className="form-loading__spinner" aria-hidden="true" />
      <span>ЗАГРУЗКА ФОРМЫ</span>
    </div>
  );
}
