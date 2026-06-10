import { useMemo, useCallback } from 'react';
import { useStoriesStore, CAT_CFG } from '../stores/stories';
import type { Story } from '../stores/stories';
import { useT } from '../i18n/useT';

// ─── Styles ───────────────────────────────────────────────────────

const sectionStyle: React.CSSProperties = {
  paddingTop: 12,
  paddingBottom: 28,
};

const scrollStyle: React.CSSProperties = {
  display: 'flex',
  overflowX: 'auto',
  overflowY: 'hidden',
  paddingLeft: 16,
  paddingRight: 16,
  scrollbarWidth: 'none',       // Firefox
  msOverflowStyle: 'none',      // IE
  overscrollBehaviorX: 'contain',
};

// ─── Skeleton (loading state) ─────────────────────────────────────
// Flutter: 5 placeholder items, animated opacity 0.3↔0.7, 1200ms easeInOut

function StoriesSkeleton() {
  const items = Array.from({ length: 5 }, (_, i) => (
    <div key={i} style={{ marginRight: 14, flexShrink: 0 }}>
      {/* Circle placeholder */}
      <div className="skeleton-pulse" style={{
        width: 'clamp(76px, 19.5rem, 100px)', height: 'clamp(76px, 19.5rem, 100px)', borderRadius: '50%',
      }} />
      {/* Gap: SizedBox(height:8) */}
      <div style={{ height: 8 }} />
      {/* Text placeholder */}
      <div className="skeleton-pulse" style={{
        width: 'calc(clamp(76px, 19.5rem, 100px) - 16px)', height: 13, borderRadius: 4, margin: '0 auto'
      }} />
    </div>
  ));

  return <div style={scrollStyle}>{items}</div>;
}

// ─── Story Item ───────────────────────────────────────────────────

function StoryItem({ story, isSeen, onTap }: { story: Story; isSeen: boolean; onTap: () => void }) {
  const cfg = CAT_CFG[story.category] ?? CAT_CFG.service;
  const hasImage = !!story.imageUrl;

  // Outer ring background
  // Flutter: unseen → SweepGradient(#8B5E3C, #D4A373, #8B5E3C)
  //         seen   → solid #B8A898 (light theme default)
  const outerBg = isSeen
    ? '#B8A898'
    : 'conic-gradient(#8B5E3C, #D4A373, #8B5E3C)';

  // Inner background (inside the border)
  // Show category gradient as a placeholder even if we have an image
  const innerBg = `linear-gradient(to bottom right, ${cfg.colors[0]}, ${cfg.colors[1]})`;

  return (
    <button
      className="btn-reset flex-col"
      onClick={onTap}
      style={{
        alignItems: 'center',
        marginRight: 14,
        flexShrink: 0,
      }}
    >
      {/* ── Outer ring ── */}
      <div style={{
        width: 'clamp(76px, 19.5rem, 100px)', height: 'clamp(76px, 19.5rem, 100px)', padding: 2.5, borderRadius: '50%',
        background: outerBg,
      }}>
        {/* ── Inner border: Container(border:2.5px white, circle) ── */}
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          border: '2.5px solid #FFFFFF',
        }}>
          {/* ── Content: Container(clip, circle, gradient or image) ── */}
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: innerBg,
          }}>
            {hasImage ? (
              <img
                src={story.imageUrl}
                alt={story.title}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  // Flutter: errorWidget → show emoji
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Emoji fallback — always rendered, hidden if image loads successfully */}
            <span style={{
              fontSize: 'clamp(25px, 6.4rem, 32px)',
              lineHeight: 1,
              display: hasImage ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}>
              {cfg.icon}
            </span>
          </div>
        </div>
      </div>

      {/* ── Gap: SizedBox(height:8) ── */}
      <div style={{ height: 8 }} />

      {/* ── Label ── */}
      <span style={{
        width: 'clamp(76px, 19.5rem, 100px)',
        fontSize: 'clamp(12px, 3.1rem, 15px)',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: -0.2,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {story.title}
      </span>
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────

export default function StoriesSection() {
  const t = useT();
  const { stories, isLoading, seenStories, markAsSeen, openStory } = useStoriesStore();

  // Sort: unseen first, seen last (Instagram-style)
  const sortedStories = useMemo(() =>
    [...stories].sort((a, b) => {
      const aSeen = seenStories[a.id] ? 1 : 0;
      const bSeen = seenStories[b.id] ? 1 : 0;
      return aSeen - bSeen;
    }),
    [stories, seenStories]
  );

  const handleTap = useCallback((storyId: string) => {
    markAsSeen(storyId);
    openStory(storyId);
  }, [markAsSeen, openStory]);

  return (
    <div style={sectionStyle}>
      <div style={{ height: 'calc(clamp(76px, 19.5rem, 100px) + 34px)' }}>
        {isLoading ? (
          <StoriesSkeleton />
        ) : stories.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: '#94A3B8', fontSize: 12,
          }}>
            {t('stories_empty')}
          </div>
        ) : (
          <div
            className="stories-scroll"
            style={scrollStyle}
          >
            {sortedStories.map((story, index) => (
              <StoryItem
                key={story.id || String(index)}
                story={story}
                isSeen={!!seenStories[story.id]}
                onTap={() => handleTap(story.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
