import { Link } from 'react-router-dom';

interface HeaderProps {
  userName: string;
  onSignOut(): void;
}

function Header({ userName, onSignOut }: HeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Zootracker home">
        <span className="brand-mark" aria-hidden="true">
          Z
        </span>
        Zootracker
      </Link>
      <div className="account-actions">
        <span>{userName}</span>
        <button className="button-secondary" type="button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}

export default Header;
