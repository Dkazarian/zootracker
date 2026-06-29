import { Link } from 'react-router-dom';
import {
  formatApplicationRole,
  type ApplicationRole,
} from '../../auth/application-role';

interface HeaderProps {
  userName: string;
  userRole: ApplicationRole;
  onSignOut(): void;
}

function Header({ userName, userRole, onSignOut }: HeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Zootracker home">
        <span className="brand-mark" aria-hidden="true">
          Z
        </span>
        Zootracker
      </Link>
      <nav className="site-navigation" aria-label="Primary navigation">
        <Link to="/">Home</Link>
        {userRole === 'admin' && <Link to="/personnel">Personnel</Link>}
      </nav>
      <div className="account-actions">
        <span className="account-identity">
          <strong>{userName}</strong>
          <span>{formatApplicationRole(userRole)}</span>
        </span>
        <button className="button-secondary" type="button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}

export default Header;
