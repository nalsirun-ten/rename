import React from 'react';
import { useBranchesStore, type Branch, isBranchOpenNow } from '../stores/branches';
import { useT } from '../i18n/useT';

interface Props {
  branch: Branch;
}

const BranchCard = React.memo(function BranchCard({ branch }: Props) {
  const { toggleSaved, openBranch } = useBranchesStore();
  const t = useT();

  const bishkekTimeString = new Date().toLocaleString("en-US", { timeZone: "Asia/Bishkek" });
  const bishkekDate = new Date(bishkekTimeString);
  const todayIndex = bishkekDate.getDay() === 0 ? 6 : bishkekDate.getDay() - 1;
  const WEEKDAY_ENGLISH_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const todayKey = WEEKDAY_ENGLISH_KEYS[todayIndex];
  const val = branch.weeklySchedule?.[todayKey];
  const todayScheduleString = (val && val.trim().length > 0) ? val : `${branch.openTime} - ${branch.closeTime}`;
  
  const isOpen = isBranchOpenNow(branch);

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
            fontSize: 'clamp(16px, 4.1rem, 22px)',
            fontWeight: 600,
            color: '#3B82F6',
            marginBottom: 2,
            lineHeight: 1.3,
          }}>
            {branch.title}
          </h3>
          <p style={{
            fontSize: 'clamp(15px, 3.8rem, 20px)',
            fontWeight: 600,
            color: '#000000',
            marginBottom: 10,
            lineHeight: 1.4,
          }}>
            {branch.address}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span className="icon-material" style={{ fontSize: 'clamp(15px, 3.8rem, 20px)', color: '#64748B', marginRight: 6 }}>
              schedule
            </span>
            <span style={{ fontSize: 'clamp(12px, 3.1rem, 17px)', fontWeight: 500, color: '#64748B' }}>
              {t('branch_today')} {todayScheduleString}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(15px, 3.8rem, 20px)', color: '#64748B', marginRight: 6 }}>
              local_cafe
            </span>
            <span style={{ fontSize: 'clamp(12px, 3.1rem, 17px)', fontWeight: 500, color: '#64748B' }}>
              {branch.type}
            </span>
          </div>
        </div>

        {/* Right Side: Image */}
        <div style={{ flexShrink: 0, width: 'clamp(102px, 26rem, 146px)', height: 'clamp(102px, 26rem, 146px)', borderRadius: 12, overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
          <img
            src={branch.imageUrl}
            alt={branch.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        {/* Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: 'clamp(40px, 10.2rem, 60px)',
          padding: '0 12px',
          backgroundColor: isOpen ? '#1B5E3D' : '#FEE2E2',
          borderRadius: 22,
        }}>
          <div style={{
            width: 'clamp(8px, 2rem, 12px)',
            height: 'clamp(8px, 2rem, 12px)',
            borderRadius: '50%',
            backgroundColor: isOpen ? '#FFF' : '#EF4444',
            marginRight: 8,
          }} />
          <span style={{
            fontSize: 'clamp(13px, 3.3rem, 18px)',
            fontWeight: 700,
            color: isOpen ? '#FFF' : '#991B1B',
            lineHeight: 1,
          }}>
            {isOpen ? t('branch_open') : t('branch_closed')}
          </span>
        </div>

        {/* Save Button */}
        <button
          className="btn-reset flex-center"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaved(branch.id);
          }}
          aria-label={branch.isSaved ? t('branch_unsave') : t('branch_save')}
          style={{
            width: 'clamp(40px, 10.2rem, 60px)',
            height: 'clamp(40px, 10.2rem, 60px)',
            borderRadius: 14,
            border: '1.5px solid #3B82F6',
            backgroundColor: '#EFF6FF',
            transition: 'all 0.2s',
          }}
        >
          <span className="icon-material" style={{ fontSize: 'clamp(22px, 5.5rem, 29px)', color: branch.isSaved ? '#1D4ED8' : '#94A3B8', fontVariationSettings: branch.isSaved ? "'FILL' 1" : "'FILL' 0" }}>
            bookmark
          </span>
        </button>
      </div>
    </div>
  );
});

export default BranchCard;
