import React from "react";

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container">
          <h1 className="brand-title">Brightness Web</h1>
        </div>
      </header>
      <main className="app-main">
        <div className="container">{children ?? <HomeContent />}</div>
      </main>
      <footer className="app-footer">
        <div className="container">© {new Date().getFullYear()} Brightness Web</div>
      </footer>
    </div>
  );
};

const HomeContent: React.FC = () => {
  return (
    <section>
      <h2>Welcome</h2>
      <p>Your app is running. Start building by editing src/app.tsx.</p>
    </section>
  );
};

export default RootLayout;
