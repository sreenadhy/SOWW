import '../styles/address-selection.css';

export default function AddressSelectionCard({
  addresses,
  selectedAddressId,
  useSavedAddress,
  onSelectAddress,
  onAddNew,
}) {
  return (
    <section className="panel-card">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Addresses</p>
          <h2>Select delivery address</h2>
        </div>
        <button type="button" className="secondary-button compact" onClick={onAddNew}>
          Add new address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="state-card compact">
          No saved addresses yet. Add a new address below to continue.
        </div>
      ) : (
        <div className="stacked-list">
          {addresses.map((address) => (
            <label className="selection-card" key={address.id}>
              <input
                type="radio"
                name="savedAddress"
                checked={useSavedAddress && selectedAddressId === address.id}
                onChange={() => onSelectAddress(address.id)}
              />
              <div>
                <strong>
                  {address.city}, {address.state}
                </strong>
                <p>{address.fullAddress}</p>
                <p>{address.pincode}</p>
              </div>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
