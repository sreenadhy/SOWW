import { useEffect, useState } from 'react';
import AddressSelectionCard from '../components/AddressSelectionCard';
import OrderStatusSteps from '../components/OrderStatusSteps';
import PageIntro from '../components/PageIntro';
import ShippingForm from '../components/ShippingForm';
import useStorefront from '../hooks/useStorefront';
import { validateShippingForm } from '../utils/storefront';
import '../styles/profile-page.css';

function formatDate(value) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function ProfilePage() {
  const {
    currentUser,
    profile,
    addresses,
    orders,
    profileLoading,
    profileError,
    formatCurrency,
    updateProfileDetails,
    updateSavedAddress,
    selectAddress,
    selectedAddressId,
    useSavedAddress,
    startNewAddress,
  } = useStorefront();
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || currentUser?.name || '',
    email: profile?.email || currentUser?.email || '',
    secondaryPhoneNumber: '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [addressErrors, setAddressErrors] = useState({});
  const [addressMessage, setAddressMessage] = useState('');
  const [addressForm, setAddressForm] = useState(() => ({
    fullName: '',
    phoneNumber: currentUser?.phoneNumber || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  }));

  useEffect(() => {
    setProfileForm((current) => ({
      ...current,
      name: profile?.name || currentUser?.name || '',
      email: profile?.email || currentUser?.email || '',
    }));
  }, [profile?.name, profile?.email, currentUser?.name, currentUser?.email]);

  useEffect(() => {
    const address = addresses.find((item) => item.id === selectedAddressId);
    if (!address) {
      return;
    }

    setAddressForm({
      fullName: currentUser?.name || '',
      phoneNumber: currentUser?.phoneNumber || '',
      addressLine1: address.fullAddress,
      addressLine2: '',
      city: address.city,
      state: address.state,
      postalCode: address.pincode,
    });
  }, [addresses, currentUser?.name, currentUser?.phoneNumber, selectedAddressId]);

  function handleProfileChange(field, value) {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    const response = await updateProfileDetails(profileForm);
    setProfileForm((current) => ({
      ...current,
      name: response.name,
      email: response.email || '',
    }));
    setProfileMessage('Profile updated successfully.');
  }

  function handleAddressChange(field, value) {
    setAddressForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleAddressSave(event) {
    event.preventDefault();

    if (!selectedAddressId) {
      setAddressMessage('Select a saved address to update it.');
      return;
    }

    const nextErrors = validateShippingForm(addressForm);
    setAddressErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await updateSavedAddress(selectedAddressId, {
      fullAddress: [addressForm.addressLine1, addressForm.addressLine2].filter(Boolean).join(', '),
      city: addressForm.city,
      state: addressForm.state,
      pincode: addressForm.postalCode,
      isDefault: true,
    });
    setAddressMessage('Address updated successfully.');
  }

  return (
    <>
      <PageIntro
        eyebrow="My Profile"
        title={`Signed in as ${currentUser?.name || currentUser?.phoneNumber}`}
        description="Manage your profile, saved addresses, and track every order from one place."
      />

      {profileError ? <p className="form-error">{profileError}</p> : null}
      {profileLoading ? <div className="state-card">Loading your account...</div> : null}

      <section className="profile-grid">
        <section className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Profile</p>
              <h2>Your details</h2>
            </div>
          </div>

          <form className="login-stage" onSubmit={handleProfileSubmit}>
            <label className="field-group">
              <span>Name</span>
              <input
                value={profileForm.name}
                onChange={(event) => handleProfileChange('name', event.target.value)}
              />
            </label>

            <label className="field-group">
              <span>Email</span>
              <input
                value={profileForm.email}
                onChange={(event) => handleProfileChange('email', event.target.value)}
              />
            </label>

            <label className="field-group">
              <span>Primary phone</span>
              <input value={profile?.phone || currentUser?.phoneNumber || ''} disabled />
            </label>

            <label className="field-group">
              <span>Secondary phone</span>
              <input
                value={profileForm.secondaryPhoneNumber}
                onChange={(event) =>
                  handleProfileChange('secondaryPhoneNumber', event.target.value.replace(/\D/g, ''))
                }
              />
            </label>

            {profileMessage ? <p className="login-feedback-success">{profileMessage}</p> : null}

            <button className="primary-button panel-button" type="submit">
              Save profile
            </button>
          </form>
        </section>

        <AddressSelectionCard
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          useSavedAddress={useSavedAddress}
          onSelectAddress={(addressId) => {
            selectAddress(addressId);
            const address = addresses.find((item) => item.id === addressId);
            if (address) {
              setAddressForm({
                fullName: currentUser?.name || '',
                phoneNumber: currentUser?.phoneNumber || '',
                addressLine1: address.fullAddress,
                addressLine2: '',
                city: address.city,
                state: address.state,
                postalCode: address.pincode,
              });
            }
          }}
          onAddNew={() => {
            startNewAddress();
            setAddressForm({
              fullName: currentUser?.name || '',
              phoneNumber: currentUser?.phoneNumber || '',
              addressLine1: '',
              addressLine2: '',
              city: '',
              state: '',
              postalCode: '',
            });
          }}
        />
      </section>

      <section className="profile-grid">
        <section className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Address Book</p>
              <h2>Update selected address</h2>
            </div>
          </div>

          <form className="login-stage" onSubmit={handleAddressSave}>
            <ShippingForm
              shippingForm={addressForm}
              errors={addressErrors}
              onChange={handleAddressChange}
            />

            {addressMessage ? <p className="login-feedback-success">{addressMessage}</p> : null}

            <button className="primary-button panel-button" type="submit">
              Save address
            </button>
          </form>
        </section>

        <section className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">My Orders</p>
              <h2>Order history</h2>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="state-card compact">No orders yet. Your placed orders will appear here.</div>
          ) : (
            <div className="stacked-list">
              {orders.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-card-header">
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <p>{formatDate(order.createdAt)}</p>
                    </div>
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                  </div>

                  <p>
                    Payment: {order.payment?.paymentMethod} | Delivery by {order.estimatedDeliveryDate}
                  </p>
                  <OrderStatusSteps status={order.orderStatus} />
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </>
  );
}
