import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCartStore } from '../stores/cart';
import { useBranchesStore } from '../stores/branches';
import { useOrderStore } from '../stores/orders';
import type { SavedAddress } from '../stores/orders';
import { useProfileStore } from '../stores/profile';
import { supabase } from '../lib/supabase';
import { useT } from '../i18n/useT';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { thumbnailUrl } from '../utils/imageUrl';
import CountrySelectModal from './CountrySelectModal';
import type { Country } from './CountrySelectModal';
import type { DeliveryMethod } from '../stores/orders';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: () => void;
}

const CheckoutSheet = React.memo(function CheckoutSheet({ isOpen, onClose, onOrderComplete }: Props) {
  const t = useT();

  const COUNTRIES: Country[] = [
    { code: '+996', flag: '🇰🇬', name: t('country_kg'), format: 'XXX XXX XXX' },
    { code: '+7', flag: '🇰🇿', name: t('country_kz'), format: '(XXX) XXX-XX-XX' },
    { code: '+7', flag: '🇷🇺', name: t('country_ru'), format: '(XXX) XXX-XX-XX' },
    { code: '+998', flag: '🇺🇿', name: t('country_uz'), format: 'XX XXX-XX-XX' },
    { code: '+994', flag: '🇦🇿', name: t('country_az'), format: 'XX XXX-XX-XX' },
    { code: '+374', flag: '🇦🇲', name: t('country_am'), format: 'XX XXX-XXX' },
    { code: '+375', flag: '🇧🇾', name: t('country_by'), format: 'XX XXX-XX-XX' },
    { code: '+1', flag: '🇺🇸', name: t('country_us'), format: '(XXX) XXX-XXXX' },
    { code: '+44', flag: '🇬🇧', name: t('country_gb'), format: 'XXXX XXXXXX' },
    { code: '+971', flag: '🇦🇪', name: t('country_ae'), format: 'XX XXX XXXX' },
  ];

  const { items, getTotalPrice, clearCart } = useCartStore();
  const branches = useBranchesStore(s => s.branches);
  // Only name/phone are needed — subscribing to the whole profile store would
  // re-render this sheet on every profile refresh (stamps, visits, etc.)
  const profileName = useProfileStore(s => s.name);
  const profilePhone = useProfileStore(s => s.phone);
  const { createOrder, isSubmitting, error, clearError, savedAddresses, fetchAddresses, activeDeliveryAddress, setActiveDeliveryAddress } = useOrderStore();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    branches.length === 1 ? branches[0].id : null
  );
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [recipientName, setRecipientName] = useState(profileName && profileName !== t('guest') ? profileName : '');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');

  const [selectedCountry, setSelectedCountry] = useState<Country>({ code: '+996', flag: '🇰🇬', name: '', format: 'XXX XXX XXX' });
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  const getInitialPhone = () => {
    if (!profilePhone) return '';
    let cleanPhone = profilePhone;
    if (cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('+996')) cleanPhone = cleanPhone.slice(4);
    } else if (cleanPhone.startsWith('996')) {
      cleanPhone = cleanPhone.slice(3);
    }
    const digits = cleanPhone.replace(/\D/g, '');
    let formatted = '';
    let digitIndex = 0;
    const format = 'XXX XXX XXX';
    for (let i = 0; i < format.length; i++) {
      if (digitIndex >= digits.length) break;
      if (format[i] === 'X') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += format[i];
      }
    }
    return formatted;
  };

  const [phone, setPhone] = useState(getInitialPhone());
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useLockBodyScroll(isOpen);
  useOverlayClose(onClose, isOpen);
  const sheetRef = useSwipeToClose(onClose);
  useHardwareBack(onClose, isOpen);

  // Fetch saved addresses when sheet opens with delivery selected
  useEffect(() => {
    if (isOpen && deliveryMethod === 'delivery') {
      fetchAddresses();
    }
  }, [isOpen, deliveryMethod, fetchAddresses]);

  // Auto-select activeDeliveryAddress or default
  useEffect(() => {
    const applyAddress = (addr: SavedAddress) => {
      setSelectedAddressId(addr.id);
      setDeliveryAddress(addr.address);
      setEntrance(addr.entrance || '');
      setFloor(addr.floor || '');
      setApartment(addr.apartment || '');
      if (addr.phone) {
        const matchingCountry = COUNTRIES.find(c => addr.phone?.startsWith(c.code));
        if (matchingCountry) {
          setSelectedCountry(matchingCountry);
          setPhone(addr.phone.substring(matchingCountry.code.length).trim().replace(/\D/g, ''));
        }
      }
    };

    if (activeDeliveryAddress && !selectedAddressId && !isNewAddress) {
      applyAddress(activeDeliveryAddress);
    } else if (savedAddresses.length > 0 && !selectedAddressId && !isNewAddress) {
      const defaultAddr = savedAddresses.find(a => a.is_default) || savedAddresses[0];
      applyAddress(defaultAddr);
    }
  }, [savedAddresses, activeDeliveryAddress, selectedAddressId, isNewAddress]);

  const handleSelectAddress = (addr: SavedAddress) => {
    setActiveDeliveryAddress(addr);
    setSelectedAddressId(addr.id);
    setIsNewAddress(false);
    setDeliveryAddress(addr.address);
    setEntrance(addr.entrance || '');
    setFloor(addr.floor || '');
    setApartment(addr.apartment || '');
    if (addr.phone) {
      const matchingCountry = COUNTRIES.find(c => addr.phone?.startsWith(c.code));
      if (matchingCountry) {
        setSelectedCountry(matchingCountry);
        setPhone(addr.phone.substring(matchingCountry.code.length).trim().replace(/\D/g, ''));
      }
    }
  };

  const handleNewAddress = () => {
    setSelectedAddressId(null);
    setIsNewAddress(true);
    setDeliveryAddress('');
    setEntrance('');
    setFloor('');
    setApartment('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const format = selectedCountry.format || 'XXX XXX XXX';
    let formatted = '';
    let digitIndex = 0;
    for (let i = 0; i < format.length; i++) {
      if (digitIndex >= digits.length) break;
      if (format[i] === 'X') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += format[i];
      }
    }
    setPhone(formatted);
  };

  // Build full address string
  const buildFullAddress = (): string => {
    const parts = [deliveryAddress.trim()];
    if (entrance.trim()) parts.push(`${t('order_entrance_abbr')} ${entrance.trim()}`);
    if (floor.trim()) parts.push(`${floor.trim()} ${t('order_floor_abbr')}`);
    if (apartment.trim()) parts.push(`${t('order_apartment_abbr')} ${apartment.trim()}`);
    return parts.join(', ');
  };

  if (!isOpen) return null;

  const total = getTotalPrice();
  const orderItems = items.map(item => ({
    menu_item_id: item.id,
    name: item.title,
    price: item.price,
    quantity: item.quantity,
    image_url: item.imageUrl,
    variant_name: item.variantName,
  }));

  // Save address to user_addresses after successful order
  const saveDeliveryAddress = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId || !deliveryAddress.trim()) return;

    try {
      const { data, error: dbError } = await supabase.from('user_addresses').insert({
        user_id: userId,
        address: deliveryAddress.trim(),
        entrance: entrance.trim() || null,
        floor: floor.trim() || null,
        apartment: apartment.trim() || null,
        is_default: savedAddresses.length === 0,
      }).select().single();
      
      if (!dbError && data) {
        setActiveDeliveryAddress(data as SavedAddress);
      }
    } catch (err) {
      // Silently fail — address saving is non-critical
    }
  };

  const handleSubmit = async () => {
    // Reset errors
    setOrderError(null);
    clearError();

    // Validate
    if (!selectedBranchId) {
      setOrderError(t('err_select_branch'));
      return;
    }
    if (deliveryMethod === 'delivery') {
      if (!recipientName.trim()) {
        setOrderError(t('err_recipient_name'));
        return;
      }
      if (!deliveryAddress.trim()) {
        setOrderError(t('err_delivery_address'));
        return;
      }
    }
    if (!phone.replace(/\D/g, '')) {
      setOrderError(t('err_phone_number'));
      return;
    }

    const fullAddress = deliveryMethod === 'delivery' ? buildFullAddress() : undefined;
    const nameToSend = recipientName.trim() || (profileName !== t('guest') ? profileName : undefined);

    const order = await createOrder({
      branch_id: selectedBranchId,
      items: orderItems,
      total_price: total,
      delivery_method: deliveryMethod,
      delivery_address: fullAddress,
      recipient_name: nameToSend,
      phone: `${selectedCountry.code}${phone.replace(/\D/g, '')}`,
      notes: notes.trim() || undefined,
    });

    if (order) {
      // Save address for future orders
      if (deliveryMethod === 'delivery' && isNewAddress) {
        saveDeliveryAddress();
      }
      clearCart();
      setShowSuccess(true);
      setTimeout(() => {
        onOrderComplete();
        setShowSuccess(false);
      }, 2500);
    } else {
      setOrderError(error || t('err_create_order_failed'));
    }
  };

  if (showSuccess) {
    return createPortal(
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />
        <div style={{
          position: 'relative',
          backgroundColor: '#FFF',
          borderRadius: 24,
          padding: '40px 32px',
          textAlign: 'center',
          maxWidth: 320,
          width: 'calc(100% - 48px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', backgroundColor: '#22C55E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <span className="icon-material" style={{ fontSize: 36, color: '#FFF' }}>check</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', margin: '0 0 8px' }}>
            {t('order_success_title')}
          </h3>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
            {t('order_success_desc')}
          </p>
        </div>
      </div>,
      document.body
    );
  }

  return (
    <>
      {createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="rs-sheet"
        style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        overflowX: 'hidden',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0 20px 12px 20px' }}>
          <h2 style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', fontWeight: 700, color: '#1E293B', margin: 0 }}>
            {t('order_checkout_title')}
          </h2>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>

          {/* ─── Branch Selection ─── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('order_branch')}
            </div>
            {branches.length === 0 ? (
              <div style={{ padding: '12px 16px', backgroundColor: '#FEF2F2', borderRadius: 12, color: '#EF4444', fontSize: 14 }}>
                {t('order_no_branches')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {branches.filter(b => b.isOpen).map((branch) => (
                  <button
                    key={branch.id}
                    className="btn-reset"
                    onClick={() => setSelectedBranchId(branch.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: selectedBranchId === branch.id ? '2px solid #1B5E3D' : '1.5px solid #E2E8F0',
                      backgroundColor: selectedBranchId === branch.id ? '#F0FDF4' : '#FFF',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: selectedBranchId === branch.id ? '2px solid #1B5E3D' : '2px solid #CBD5E1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {selectedBranchId === branch.id && (
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#1B5E3D' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{branch.title}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>{branch.address}</div>
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 6,
                      backgroundColor: branch.isOpen ? '#F0FDF4' : '#FEF2F2',
                      color: branch.isOpen ? '#16A34A' : '#EF4444',
                    }}>
                      {branch.isOpen ? t('branch_open') : t('branch_closed')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Delivery Method ─── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('order_method')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-reset"
                onClick={() => setDeliveryMethod('delivery')}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  border: deliveryMethod === 'delivery' ? '2px solid #1B5E3D' : '1.5px solid #E2E8F0',
                  backgroundColor: deliveryMethod === 'delivery' ? '#F0FDF4' : '#FFF',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <span className="icon-material" style={{ fontSize: 24, color: deliveryMethod === 'delivery' ? '#1B5E3D' : '#94A3B8' }}>
                  local_shipping
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: deliveryMethod === 'delivery' ? '#1B5E3D' : '#64748B' }}>
                  {t('order_delivery')}
                </span>
              </button>
              <button
                className="btn-reset"
                onClick={() => setDeliveryMethod('pickup')}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  border: deliveryMethod === 'pickup' ? '2px solid #1B5E3D' : '1.5px solid #E2E8F0',
                  backgroundColor: deliveryMethod === 'pickup' ? '#F0FDF4' : '#FFF',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <span className="icon-material" style={{ fontSize: 24, color: deliveryMethod === 'pickup' ? '#1B5E3D' : '#94A3B8' }}>
                  storefront
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: deliveryMethod === 'pickup' ? '#1B5E3D' : '#64748B' }}>
                  {t('order_pickup')}
                </span>
              </button>
            </div>
          </div>

          {/* ─── Delivery Fields ─── */}
          {deliveryMethod === 'delivery' && (
            <>
              {/* Recipient Name */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {t('order_recipient_name')}
                </div>
                <input
                  type="text"
                  placeholder={t('order_recipient_placeholder')}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1.5px solid #E2E8F0', fontSize: 14, fontWeight: 500,
                    color: '#1E293B', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {t('order_saved_addresses')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        className="btn-reset"
                        onClick={() => handleSelectAddress(addr)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 10,
                          border: selectedAddressId === addr.id && !isNewAddress ? '2px solid #1B5E3D' : '1.5px solid #E2E8F0',
                          backgroundColor: selectedAddressId === addr.id && !isNewAddress ? '#F0FDF4' : '#FFF',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span className="icon-material" style={{ fontSize: 20, color: '#64748B', flexShrink: 0 }}>
                          location_on
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
                            {addr.label || addr.address.split(',')[0]}
                          </div>
                          <div style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {addr.address}
                            {addr.entrance && `, ${t('order_entrance_abbr')} ${addr.entrance}`}
                            {addr.floor && `, ${addr.floor} ${t('order_floor_abbr')}`}
                            {addr.apartment && `, ${t('order_apartment_abbr')} ${addr.apartment}`}
                          </div>
                        </div>
                      </button>
                    ))}
                    <button
                      className="btn-reset"
                      onClick={handleNewAddress}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 10,
                        border: isNewAddress ? '2px solid #1B5E3D' : '1.5px dashed #CBD5E1',
                        backgroundColor: isNewAddress ? '#F0FDF4' : 'transparent',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span className="icon-material" style={{ fontSize: 20, color: '#1B5E3D', flexShrink: 0 }}>add</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#1B5E3D' }}>{t('order_new_address')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Address Form */}
              {(isNewAddress || savedAddresses.length === 0) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {t('order_address')}
                  </div>
                  <input
                    type="text"
                    placeholder={t('order_street')}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '1.5px solid #E2E8F0', fontSize: 14, fontWeight: 500,
                      color: '#1E293B', outline: 'none', boxSizing: 'border-box',
                      marginBottom: 8,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, width: '100%', boxSizing: 'border-box' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={3}
                      placeholder={t('order_entrance')}
                      value={entrance}
                      onChange={(e) => setEntrance(e.target.value)}
                      style={{
                        width: 0, flex: '1 1 0', minWidth: 0, padding: '12px 10px', borderRadius: 12,
                        border: '1.5px solid #E2E8F0', fontSize: 14, fontWeight: 500,
                        color: '#1E293B', outline: 'none', boxSizing: 'border-box',
                        textAlign: 'center',
                      }}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={3}
                      placeholder={t('order_floor')}
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      style={{
                        width: 0, flex: '1 1 0', minWidth: 0, padding: '12px 10px', borderRadius: 12,
                        border: '1.5px solid #E2E8F0', fontSize: 14, fontWeight: 500,
                        color: '#1E293B', outline: 'none', boxSizing: 'border-box',
                        textAlign: 'center',
                      }}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder={t('order_apartment')}
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      style={{
                        width: 0, flex: '1 1 0', minWidth: 0, padding: '12px 10px', borderRadius: 12,
                        border: '1.5px solid #E2E8F0', fontSize: 14, fontWeight: 500,
                        color: '#1E293B', outline: 'none', boxSizing: 'border-box',
                        textAlign: 'center',
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─── Phone ─── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('order_phone')}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn-reset"
                onClick={() => setIsCountryModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  borderRadius: 12,
                  border: '1.5px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  height: 48,
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ fontSize: 24, marginRight: 8 }}>{selectedCountry.flag}</span>
                <span style={{ color: '#1E293B', marginRight: 4, fontSize: 14, fontWeight: 500 }}>{selectedCountry.code}</span>
                <span className="icon-material" style={{ fontSize: 20, color: '#94A3B8' }}>
                  expand_more
                </span>
              </button>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder={selectedCountry.format ? selectedCountry.format.replace(/X/g, '0') : '000 000 000'}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1.5px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1E293B',
                  outline: 'none',
                  height: 48,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* ─── Notes ─── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('order_notes')}
            </div>
            <input
              type="text"
              placeholder={t('order_notes_placeholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid #E2E8F0', fontSize: 14, fontWeight: 500,
                color: '#1E293B', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* ─── Order Summary ─── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('order_summary')}
            </div>
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, backgroundColor: item.imageUrl ? '#F1F5F9' : '#1B5E3D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageUrl ? (
                      <img src={thumbnailUrl(item.imageUrl, 100)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 7, fontWeight: 700, color: '#FFFFFF', textAlign: 'center', lineHeight: 1.1, padding: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{item.title}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                      {item.quantity} x {item.price} {t('som')}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>
                    {item.price * item.quantity} {t('som')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div style={{ 
          padding: '16px 20px 0 20px', 
          backgroundColor: '#FFFFFF',
          borderTop: '1.5px solid #94A3B8',
          boxShadow: '0 -12px 32px rgba(0,0,0,0.15)',
          zIndex: 10
        }}>
          {/* ─── Error ─── */}
          {orderError && (
            <div style={{
              padding: '12px 16px', backgroundColor: '#FEF2F2', borderRadius: 12,
              color: '#EF4444', fontSize: 13, fontWeight: 500, marginBottom: 16,
            }}>
              {orderError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#64748B' }}>{t('cart_total')}</span>
            <span style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', fontWeight: 700, color: '#1E293B' }}>
              {total} {t('som')}
            </span>
          </div>
          <button
            className="btn-reset"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%', padding: '16px 24px',
              backgroundColor: isSubmitting ? '#94A3B8' : '#1B5E3D',
              borderRadius: 16, color: '#FFF',
              fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 700,
              marginBottom: 12, opacity: isSubmitting ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', animation: 'rm-spin .6s linear infinite' }} />
                {t('order_placing')}
              </>
            ) : (
              t('order_confirm')
            )}
          </button>
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

export default CheckoutSheet;
