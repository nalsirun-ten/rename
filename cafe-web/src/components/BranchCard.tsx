import { useBranchesStore, type Branch } from '../stores/branches';

interface Props {
  branch: Branch;
}

export default function BranchCard({ branch }: Props) {
  const toggleSaved = useBranchesStore((s) => s.toggleSaved);

  return (
    <div style={{
      padding: '20px 0',
      margin: '0 20px',
      borderBottom: '1px solid #CBD5E1',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left Side: Info */}
        <div style={{ flex: 1, paddingRight: 12 }}>
          <h3 style={{
            fontSize: 17,
            fontWeight: 600,
            color: '#3B82F6',
            marginBottom: 6,
            lineHeight: 1.3,
          }}>
            {branch.title}
          </h3>
          <p style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#000000',
            marginBottom: 10,
            lineHeight: 1.4,
          }}>
            {branch.address}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span className="icon-material" style={{ fontSize: 16, color: '#64748B', marginRight: 6 }}>
              schedule
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>
              Сегодня: {branch.openTime} - {branch.closeTime}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="icon-material" style={{ fontSize: 16, color: '#64748B', marginRight: 6 }}>
              local_cafe
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>
              {branch.type}
            </span>
          </div>
        </div>

        {/* Right Side: Image */}
        <div style={{ flexShrink: 0, width: 110, height: 110, borderRadius: 12, overflow: 'hidden' }}>
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
          height: 44,
          padding: '0 16px',
          backgroundColor: branch.isOpen ? '#DCFCE7' : '#FEE2E2',
          borderRadius: 22,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: branch.isOpen ? '#22C55E' : '#EF4444',
            marginRight: 8,
          }} />
          <span style={{
            fontSize: 14,
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
          onClick={() => toggleSaved(branch.id)}
          aria-label={branch.isSaved ? "Убрать из закладок" : "В закладки"}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            border: '1.5px solid #3B82F6',
            backgroundColor: '#EFF6FF',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontFamily: "'Material Icons Round'", fontSize: 24, color: branch.isSaved ? '#1D4ED8' : '#3B82F6' }}>
            {branch.isSaved ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>
    </div>
  );
}
