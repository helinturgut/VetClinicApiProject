export default function Footer() {
  return (
    <footer className="bg-white text-muted border-top py-3 mt-auto">
      <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-1">
        <span className="small">&copy; {new Date().getFullYear()} VetClinic. All rights reserved.</span>
      </div>
    </footer>
  );
}
