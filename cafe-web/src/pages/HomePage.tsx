import HomeHeader from '../components/HomeHeader';
import StoriesSection from '../components/StoriesSection';
import HomeContent from '../components/HomeContent';
import PullToRefresh from '../components/PullToRefresh';

import { useMenuStore } from '../stores/menu';
import { useNewsStore } from '../stores/news';
import { useBranchesStore } from '../stores/branches';
import { useStoriesStore } from '../stores/stories';
import { useReviewsStore } from '../stores/reviews';
import { useProfileStore } from '../stores/profile';

export default function HomePage() {
  const handleRefresh = async () => {
    const profileId = useProfileStore.getState().id;
    await Promise.all([
      useMenuStore.getState().fetchMenuItems(true),
      useNewsStore.getState().fetchNews(true),
      useStoriesStore.getState().fetchStories(true),
      useReviewsStore.getState().fetchReviews(true),
      ...(profileId ? [useProfileStore.getState().fetchProfile(profileId)] : []),
    ]);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)',
    }}>
      <HomeHeader />
      <div style={{ flex: 1, minHeight: 0 }}>
        <PullToRefresh onRefresh={handleRefresh}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 20 // add slight padding at bottom
          }}>
            <StoriesSection />
            <HomeContent />
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
}
