import { useOutletContext } from 'react-router-dom';
import type { AuthenticatedOutletContext } from '../auth/AuthenticatedLayout';
import SharedFeedingQueue from '../feeding-tasks/SharedFeedingQueue';
import ConnectionCard from './ConnectionCard';

function HomePage() {
  const { currentUser } = useOutletContext<AuthenticatedOutletContext>();

  return (
    <main className="hero">
      <p className="eyebrow">Animal care, clearly tracked</p>
      <h1>A reliable home for daily zoo care.</h1>
      <p className="intro">
        Zootracker brings animal information, feeding responsibilities, and care
        history into one shared workspace.
      </p>
      <ConnectionCard />
      <SharedFeedingQueue currentUser={currentUser} />
    </main>
  );
}

export default HomePage;
