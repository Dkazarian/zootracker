import ConnectionCard from './ConnectionCard';

function HomePage() {
  return (
    <main className="hero">
      <p className="eyebrow">Animal care, clearly tracked</p>
      <h1>A reliable home for daily zoo care.</h1>
      <p className="intro">
        Zootracker brings animal information, feeding responsibilities, and care
        history into one shared workspace.
      </p>
      <ConnectionCard />
    </main>
  );
}

export default HomePage;
