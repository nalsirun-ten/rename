import { useNavigationStore } from '../stores/navigation';
import BottomNav from './BottomNav';
import HomePage from '../pages/HomePage';
import BranchesPage from '../pages/BranchesPage';
import MenuPage from '../pages/MenuPage';
import ProfilePage from '../pages/ProfilePage';
import StoryViewer from './StoryViewer';
import BranchDetailModal from './BranchDetailModal';

const SCREENS = [
  <HomePage key="home" />,
  <BranchesPage key="branches" />,
  <MenuPage key="menu" />,
  <ProfilePage key="profile" />,
];

export default function MainShell() {
  const { activeTab } = useNavigationStore();

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#000' }}>
      {/* Phone-width container: 430px = iPhone 17 Pro Max width */}
      <div style={{ height: '100%', width: '100%', maxWidth: 430, backgroundColor: '#1B5E3D', position: 'relative', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Screen content — render ONLY the active tab */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {SCREENS[activeTab]}
        </div>

        {/* Bottom shadow gradient */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            pointerEvents: 'none',
            zIndex: 40,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)',
          }}
        />

        {/* Bottom Navigation */}
        <BottomNav />
        
        {/* Story Viewer Modal */}
        <StoryViewer />

        {/* Branch Detail Modal */}
        <BranchDetailModal />
      </div>
    </div>
  );
}
