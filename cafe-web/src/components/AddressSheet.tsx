import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { useOrderStore } from '../stores/orders';
import type { SavedAddress } from '../stores/orders';
import { useProfileStore } from '../stores/profile';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { useT } from '../i18n/useT';
import CountrySelectModal from './CountrySelectModal';
import type { Country } from './CountrySelectModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AddressSheet = React.memo(function AddressSheet({ isOpen, onClose }: Props) {
  const t = useT();
  const { savedAddresses, fetchAddresses, activeDeliveryAddress, setActiveDeliveryAddress } = useOrderStore();
  const userId = useProfileStore((s) => s.id);

  const [isNewAddress, setIsNewAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: '+996',
    flag: '🇰🇬',
    name: 'Кыргызстан',
    format: 'XXX XXX XXX'
  });
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  useLockBodyScroll(isOpen);
  useOverlayClose(onClose, isOpen);
  const sheetRef = useSwipeToClose(onClose);
  useHardwareBack(onClose, isOpen);

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
      setIsNewAddress(false);
      setDeliveryAddress('');
      setEntrance('');
      setFloor('');
      setApartment('');
      setPhone('');
    }
  }, [isOpen, fetchAddresses]);

  if (!isOpen) return null;

  const handleSelectAddress = (addr: SavedAddress) => {
    setActiveDeliveryAddress(addr);
    onClose();
  };

  const handleSaveNewAddress = async () => {
    if (!userId || !deliveryAddress.trim() || !phone.trim()) return;
    setIsSaving(true);
    
    // Build full address line for immediate selection
    const parts = [deliveryAddress.trim()];
    if (entrance.trim()) parts.push(`${t('order_entrance_abbr')} ${entrance.trim()}`);
    if (floor.trim()) parts.push(`${floor.trim()} ${t('order_floor_abbr')}`);
    if (apartment.trim()) parts.push(`${t('order_apartment_abbr')} ${apartment.trim()}`);
    const fullLine = parts.join(', ');

    try {
      const { data, error } = await supabase.from('user_addresses').insert({
        user_id: userId,
        address: fullLine,
        entrance: entrance.trim() || null,
        floor: floor.trim() || null,
        apartment: apartment.trim() || null,
        phone: `${selectedCountry.code} ${phone.trim()}`,
        is_default: savedAddresses.length === 0,
      }).select().single();

      if (!error && data) {
        await fetchAddresses();
        setActiveDeliveryAddress(data as SavedAddress);
      } else {
        // Fallback if we couldn't get the saved record immediately
        setActiveDeliveryAddress({
          id: 'temp_new',
          user_id: userId,
          label: null,
          address: fullLine,
          entrance: entrance.trim() || null,
          floor: floor.trim() || null,
          apartment: apartment.trim() || null,
          phone: `${selectedCountry.code} ${phone.trim()}`,
          is_default: savedAddresses.length === 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {createPortal(
        <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="rs-sheet"
        style={{
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        }}
      >
        {/* Handle */}
        <div style={{ padding: '12px 0 20px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' }} />
        </div>

        {/* Content */}
        <div style={{ padding: '0 20px 32px 20px', overflowY: 'auto' }}>
          <h2 style={{ fontSize: 'clamp(20px, 5.1rem, 26px)', fontWeight: 800, color: '#1E293B', margin: '0 0 24px 0' }}>
            {t('address_where_to_deliver')}
          </h2>

          {!isNewAddress ? (
            <>
              {savedAddresses.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      className="btn-reset"
                      onClick={() => handleSelectAddress(addr)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px', borderRadius: 16,
                        border: activeDeliveryAddress?.id === addr.id ? '2px solid #1B5E3D' : '1.5px solid #E2E8F0',
                        backgroundColor: activeDeliveryAddress?.id === addr.id ? '#F0FDF4' : '#FFF',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span className="icon-material" style={{ fontSize: 24, color: activeDeliveryAddress?.id === addr.id ? '#1B5E3D' : '#64748B', flexShrink: 0 }}>
                        location_on
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>
                          {addr.label || addr.address.split(',')[0]}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {addr.address}
                        </div>
                      </div>
                      {activeDeliveryAddress?.id === addr.id && (
                        <span className="icon-material" style={{ fontSize: 22, color: '#1B5E3D' }}>check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <button
                className="btn-reset"
                onClick={() => setIsNewAddress(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '14px', borderRadius: 16,
                  backgroundColor: '#F1F5F9', color: '#1E293B',
                  fontSize: 15, fontWeight: 600,
                }}
              >
                <span className="icon-material" style={{ fontSize: 20 }}>add</span>
                {t('order_new_address')}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder={t('order_street')}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 14,
                  border: '1.5px solid #E2E8F0', fontSize: 15, fontWeight: 500,
                  color: '#1E293B', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder={t('order_entrance')}
                  value={entrance}
                  onChange={(e) => setEntrance(e.target.value)}
                  style={{
                    flex: 1, minWidth: 0, padding: '14px 12px', borderRadius: 14,
                    border: '1.5px solid #E2E8F0', fontSize: 15, fontWeight: 500,
                    color: '#1E293B', outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <input
                  type="text"
                  placeholder={t('order_floor')}
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  style={{
                    flex: 1, minWidth: 0, padding: '14px 12px', borderRadius: 14,
                    border: '1.5px solid #E2E8F0', fontSize: 15, fontWeight: 500,
                    color: '#1E293B', outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <input
                  type="text"
                  placeholder={t('order_apartment')}
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  style={{
                    flex: 1, minWidth: 0, padding: '14px 12px', borderRadius: 14,
                    border: '1.5px solid #E2E8F0', fontSize: 15, fontWeight: 500,
                    color: '#1E293B', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Phone Input */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  className="btn-reset"
                  onClick={() => setIsCountryModalOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '14px 12px', borderRadius: 14, border: '1.5px solid #E2E8F0',
                    backgroundColor: '#F8FAFC', fontSize: 15, fontWeight: 600, color: '#1E293B',
                    flexShrink: 0
                  }}
                >
                  <span style={{ fontSize: 18 }}>{selectedCountry.flag}</span>
                  <span>{selectedCountry.code}</span>
                  <span className="icon-material" style={{ fontSize: 20, color: '#94A3B8' }}>arrow_drop_down</span>
                </button>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="tel"
                    placeholder={selectedCountry.format}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 14,
                      border: '1.5px solid #E2E8F0', fontSize: 16, fontWeight: 600,
                      color: '#1E293B', outline: 'none', letterSpacing: '0.5px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  className="btn-reset"
                  onClick={() => setIsNewAddress(false)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 16,
                    backgroundColor: '#F1F5F9', color: '#64748B',
                    fontSize: 15, fontWeight: 600, textAlign: 'center',
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn-reset"
                  disabled={!deliveryAddress.trim() || !phone.trim() || isSaving}
                  onClick={handleSaveNewAddress}
                  style={{
                    flex: 2, padding: '14px', borderRadius: 16,
                    backgroundColor: deliveryAddress.trim() && phone.trim() && !isSaving ? '#22C55E' : '#94A3B8',
                    color: '#FFF', fontSize: 15, fontWeight: 700, textAlign: 'center',
                    opacity: isSaving ? 0.7 : 1, transition: 'background-color 0.2s',
                  }}
                >
                  {isSaving ? t('saving') : t('save_and_select')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )}
      {isCountryModalOpen && (
        <CountrySelectModal
          onClose={() => setIsCountryModalOpen(false)}
          onSelect={(country) => {
            setSelectedCountry(country);
            setIsCountryModalOpen(false);
            setPhone('');
          }}
        />
      )}
    </>
  );
});

export default AddressSheet;
