import { useNavigationStore } from '../stores/navigation';
import BottomNav from './BottomNav';
import HomePage from '../pages/HomePage';
import BranchesPage from '../pages/BranchesPage';
import MenuPage from '../pages/MenuPage';
import ProfilePage from '../pages/ProfilePage';
import StoryViewer from './StoryViewer';
import BranchDetailModal from './BranchDetailModal';

const SCREENS = [
  { id: 'home', component: <HomePage /> },
  { id: 'branches', component: <BranchesPage /> },
  { id: 'menu', component: <MenuPage /> },
  { id: 'profile', component: <ProfilePage /> },
];

export default function MainShell() {
  const { activeTab } = useNavigationStore();

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#000' }}>
      {/* Phone-width container: 430px = iPhone 17 Pro Max width */}
      <div style={{ height: '100%', width: '100%', maxWidth: 430, backgroundColor: '#1B5E3D', position: 'relative', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Screen content — render all tabs to keep state, but hide inactive ones */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {SCREENS.map((screen, index) => (
            <div
              key={screen.id}
              style={{
                display: activeTab === index ? 'block' : 'none',
                height: '100%',
                width: '100%',
              }}
            >
              {screen.component}
            </div>
          ))}
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
