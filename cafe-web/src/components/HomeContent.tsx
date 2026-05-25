// ─── Light theme content container below StoriesSection ───
// Flutter:
//   Container(
//     transform: translateY(-16),
//     padding: top:12,
//     decoration: color:#FEF9F5 (surface), radius:top:32,
//                boxShadow: rgba(0,0,0,0.06) blur16 spread2 offset(0,-4),
//     child: Column([ LoyaltyCard, SizedBox(8), StampsProgress, ... 120px spacer ])
//   )

import { useState } from 'react';
import LoyaltyCard from './LoyaltyCard';
import StampsProgress from './StampsProgress';
import QuickActions from './QuickActions';
import ReviewsBanner from './ReviewsBanner';
import ReviewsSheet from './ReviewsSheet';
import NewsSection from './NewsSection';

export default function HomeContent() {
  const [showReviews, setShowReviews] = useState(false);

  return (
    <>
      <div
        style={{
          marginTop: -16,
          position: 'relative',
          zIndex: 1,
          paddingTop: 16,
          backgroundColor: '#FEF9F5',
          borderTopLeftRadius: 52,
          borderTopRightRadius: 52,
          boxShadow: '0 -4px 16px 2px rgba(0,0,0,0.06)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <LoyaltyCard />
        {/* SizedBox(height:8) — matching Flutter */}
        <div style={{ height: 8, flexShrink: 0 }} />
        <StampsProgress />
        {/* SizedBox(height:8) — matching Flutter */}
        <div style={{ height: 8, flexShrink: 0 }} />
        <QuickActions />
        {/* SizedBox(height:8) — matching section gaps */}
        <div style={{ height: 8, flexShrink: 0 }} />
        <ReviewsBanner onTap={() => setShowReviews(true)} />
        {/* SizedBox(height:8) — matching StampsProgress gap */}
        <div style={{ height: 8, flexShrink: 0 }} />
        <NewsSection />

        {/* Spacer at bottom: SizedBox(height:120) — matching Flutter */}
        <div style={{ height: 120, flexShrink: 0 }} />
      </div>

      {/* Reviews Sheet */}
      {showReviews && <ReviewsSheet onClose={() => setShowReviews(false)} />}
    </>
  );
}
