import HomeHeader from '../components/HomeHeader';
import StoriesSection from '../components/StoriesSection';
import HomeContent from '../components/HomeContent';

export default function HomePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      <HomeHeader />
      <StoriesSection />
      <HomeContent />
    </div>
  );
}
