import { useBranchesStore, type Branch } from '../stores/branches';

interface Props {
  branch: Branch;
}

export default function BranchCard({ branch }: Props) {
  const { toggleSaved, openBranch } = useBranchesStore();

  return (
    <div
      onClick={() => openBranch(branch.id)}
      style={{
      padding: '20px 0',
      margin: '0 12px',
      borderBottom: '1px solid #CBD5E1',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left Side: Info */}
        <div style={{ flex: 1, paddingRight: 12, minWidth: 0 }}>
          <h3 style={{
            fontSize: 'clamp(16px, 4.1vw, 22px)',
            fontWeight: 600,
            color: '#3B82F6',
            marginBottom: 6,
            lineHeight: 1.3,
          }}>
            {branch.title}
          </h3>
          <p style={{
            fontSize: 'clamp(13px, 3.3vw, 18px)',
            fontWeight: 600,
            color: '#000000',
            marginBottom: 10,
            lineHeight: 1.4,
          }}>
            {branch.address}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span className="icon-material" style={{ fontSize: 'clamp(15px, 3.8vw, 20px)', color: '#64748B', marginRight: 6 }}>
              schedule
            </span>
            <span style={{ fontSize: 'clamp(12px, 3.1vw, 17px)', fontWeight: 500, color: '#64748B' }}>
              Сегодня: {branch.openTime} - {branch.closeTime}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(15px, 3.8vw, 20px)', color: '#64748B', marginRight: 6 }}>
              local_cafe
            </span>
            <span style={{ fontSize: 'clamp(12px, 3.1vw, 17px)', fontWeight: 500, color: '#64748B' }}>
              {branch.type}
            </span>
          </div>
        </div>

        {/* Right Side: Image */}
        <div style={{ flexShrink: 0, width: 'clamp(102px, 26vw, 146px)', height: 'clamp(102px, 26vw, 146px)', borderRadius: 12, overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
          <img
            src={branch.imageUrl}
            alt={branch.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        {/* Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: 'clamp(40px, 10.2vw, 60px)',
          padding: '0 12px',
          backgroundColor: branch.isOpen ? '#DCFCE7' : '#FEE2E2',
          borderRadius: 22,
        }}>
          <div style={{
            width: 'clamp(8px, 2vw, 12px)',
            height: 'clamp(8px, 2vw, 12px)',
            borderRadius: '50%',
            backgroundColor: branch.isOpen ? '#22C55E' : '#EF4444',
            marginRight: 8,
          }} />
          <span style={{
            fontSize: 'clamp(13px, 3.3vw, 18px)',
            fontWeight: 700,
            color: branch.isOpen ? '#166534' : '#991B1B',
            lineHeight: 1,
          }}>
            {branch.isOpen ? 'Открыто' : 'Закрыто'}
          </span>
        </div>

        {/* Save Button */}
        <button
          className="btn-reset flex-center"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaved(branch.id);
          }}
          aria-label={branch.isSaved ? "Убрать из закладок" : "В закладки"}
          style={{
            width: 'clamp(40px, 10.2vw, 60px)',
            height: 'clamp(40px, 10.2vw, 60px)',
            borderRadius: 14,
            border: '1.5px solid #3B82F6',
            backgroundColor: '#EFF6FF',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontFamily: "'Material Icons Round'", fontSize: 'clamp(22px, 5.5vw, 29px)', color: branch.isSaved ? '#1D4ED8' : '#3B82F6' }}>
            {branch.isSaved ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>
    </div>
  );
}
