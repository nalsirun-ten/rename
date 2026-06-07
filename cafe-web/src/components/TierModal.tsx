import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useProfileStore, REWARDS, getNextReward } from '../stores/profile';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useT } from '../i18n/useT';

interface Props {
  onClose: () => void;
}



export default function TierModal({ onClose }: Props) {
  const t = useT();
  const sheetRef = useSwipeToClose(onClose);
  const { visits } = useProfileStore();

  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);


  // Progress logic
  const nextReward = getNextReward(visits);

  // Extend the list if visits >= 1000 so they always see their next reward
  const displayRewards = [...REWARDS];
  if (nextReward.visits > 1000) {
    displayRewards.push(nextReward);
  }

  let previousMilestone = 0;
  if (visits >= 1000) {
    const cycle = Math.floor((visits - 1000) / 250);
    previousMilestone = 1000 + cycle * 250;
  } else {
    for (let i = REWARDS.length - 1; i >= 0; i--) {
      if (visits >= REWARDS[i].visits) {
        previousMilestone = REWARDS[i].visits;
        break;
      }
    }
  }

  const progressInInterval = Math.max(0, visits - previousMilestone);
  const interval = nextReward.visits - previousMilestone;
  const progress = Math.min(progressInInterval / interval, 1);
  const remaining = nextReward.visits - visits;

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div
        ref={sheetRef}
        className="rs-sheet flex-col"
        style={{
          width: '100%', maxWidth: 430,
          borderTopLeftRadius: 32, borderTopRightRadius: 32,
          overflow: 'hidden',
          height: '80vh',
          backgroundColor: '#FCFBFA',
        }}
      >

        {/* Header */}
        <div className="flex-between" style={{ padding: '16px 16px 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              {t('rewards_title')}
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button
            className="btn-reset flex-center"
            onClick={onClose}
            style={{ width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%', backgroundColor: '#E2E8F0' }}
          >
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}>
          {/* Progress Counter Card */}
          <div style={{ padding: '0 16px 20px' }}>
            <div style={{
              borderRadius: 24, border: '2px solid #374151',
              background: 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
              padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', minWidth: 0 }}>
                  <span style={{ fontSize: 'clamp(24px, 6.1rem, 36px)', fontWeight: 600, color: '#FFF', lineHeight: 1 }}>{visits}</span>
                  <span style={{ fontSize: 'clamp(14px, 3.6rem, 20px)', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{' / '}{nextReward.visits}</span>
                </div>
                <span style={{ fontSize: 'clamp(16px, 4rem, 24px)', fontWeight: 600, color: '#FFF', paddingLeft: 8 }}>-{remaining} {t('visits_abbr')}</span>
              </div>

              <div style={{ height: 8, width: '100%', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: '#FFF', borderRadius: 4 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ fontSize: 'clamp(16px, 4rem, 20px)', fontWeight: 800, color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                  {t(nextReward.nameKey as any)}
                </span>
                <span style={{ fontSize: 'clamp(14px, 3.6rem, 20px)', fontWeight: 800, color: '#FFF', flexShrink: 0 }}>{t('reward_next')}</span>
              </div>
            </div>
          </div>

          {/* Content (Timeline) */}
          <div style={{ padding: '0 16px' }}>
            <div style={{ position: 'relative' }}>
              {displayRewards.map((reward, index) => {
                  const isAchieved = visits >= reward.visits;
                  const isNext = !isAchieved && (index === 0 || visits >= displayRewards[index - 1].visits);

                  const color = isAchieved ? '#22C55E' : isNext ? '#3B82F6' : '#94A3B8';
                  const bg = isAchieved ? '#F0FDF4' : isNext ? '#EFF6FF' : '#F8FAFC';
                  const iconName = isAchieved ? 'check_circle' : isNext ? 'redeem' : 'lock';

                  return (
                    <div key={reward.visits} style={{ display: 'flex', gap: 12, marginBottom: index === displayRewards.length - 1 ? 0 : 12, position: 'relative', zIndex: 1 }}>
                      {/* Icon Column */}
                      <div style={{ position: 'relative', flexShrink: 0, marginTop: 'clamp(6px, 2rem, 12px)' }}>
                        {index !== displayRewards.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            top: 'clamp(40px, 12.3rem, 60px)', bottom: 'calc(clamp(18px, 5.1rem, 28px) * -1)', left: 'calc(clamp(40px, 12.3rem, 60px) / 2 - 2px)',
                            width: 4, backgroundColor: isAchieved ? '#22C55E' : '#E2E8F0', zIndex: -1
                          }} />
                        )}
                        <div style={{
                          width: 'clamp(40px, 12.3rem, 60px)', height: 'clamp(40px, 12.3rem, 60px)', borderRadius: '50%',
                          backgroundColor: bg,
                          border: `2px solid ${color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span className="icon-material" style={{ fontSize: 'clamp(20px, 6.1rem, 32px)', color: color, fontVariationSettings: "'FILL' 1" }}>
                            {iconName}
                          </span>
                        </div>
                      </div>

                      {/* Card Column */}
                      <div style={{
                        flex: 1, backgroundColor: isAchieved ? '#FFFFFF' : '#FEF9F5',
                        borderRadius: 24, padding: '12px 16px',
                        border: isNext ? `1.5px solid ${color}` : `1.5px solid ${isAchieved ? '#22C55E' : '#E2E8F0'}`,
                        opacity: isAchieved || isNext ? 1 : 0.7
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 'clamp(16px, 4rem, 20px)', fontWeight: 800, color: '#1E293B' }}>
                            {t(reward.nameKey as any)}
                          </span>
                          <div style={{
                            padding: '4px 10px', borderRadius: 10,
                            backgroundColor: color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <span style={{ fontSize: 'clamp(12px, 3rem, 15px)', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
                              {reward.visits} {t('visits_abbr')}
                            </span>
                          </div>
                        </div>
                        <p style={{ fontSize: 'clamp(13px, 3.3rem, 16px)', color: '#94A3B8', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                          {isAchieved
                            ? t('reward_achieved')
                            : isNext
                              ? `${t('reward_visits_left')}: ${reward.visits - visits}`
                              : t('reward_next')}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
