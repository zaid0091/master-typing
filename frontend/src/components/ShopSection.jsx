import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { shop } from '../services/api';

export default function ShopSection() {
  const { user, setUser, showToast, refreshUser } = useApp();
  const [items, setItems] = useState([]);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try { setItems(await shop.items()); } catch {}
  };

  const handleBuy = async (itemId) => {
    try {
      const res = await shop.buy(itemId);
      showToast(res.message);
      if (res.user) setUser(res.user);
      await loadItems();
    } catch (err) {
      showToast(err.message || 'Purchase failed', false);
    }
  };

  const handleEquip = async (itemId) => {
    try {
      const res = await shop.equip(itemId);
      showToast(res.message);
      if (res.user) setUser(res.user);
      await loadItems();
    } catch (err) {
      showToast(err.message || 'Equip failed', false);
    }
  };

  const equippedIds = [user?.equipped_theme, user?.equipped_aura, user?.equipped_pet].filter(Boolean);

  return (
    <section className="active-section">
      <div className="section-header">
        <h1>Premium <span>Shop</span></h1>
        <p style={{ marginTop: 5 }}>Spend your Bits on exclusive themes, auras, and companions.</p>
      </div>
      <div className="bits-balance-card glass-panel">
        <div className="label">Total Balance</div>
        <div className="balance-value"><span className="bits-icon">🪙</span> {(user?.bits || 0).toLocaleString()} Bits</div>
      </div>
      <div className="shop-grid">
        {items.map(item => {
          const isOwned = item.owned;
          const isEquipped = equippedIds.includes(item.id);
          return (
            <div key={item.id} className="shop-item">
              {item.tag && <span className={`item-tag ${item.tag === 'New' ? 'tag-new' : ''}`}>{item.tag}</span>}
              <div className="item-icon">{item.icon}</div>
              <h3>{item.name}</h3>
              <p className="item-desc">{item.desc}</p>
              <div className="item-price">
                {isOwned ? (isEquipped ? 'Equipped' : 'Owned') : `🪙 ${item.price}`}
              </div>
              <button
                className={`shop-btn ${isOwned ? (isEquipped ? 'equipped' : 'buy') : 'buy'}`}
                onClick={() => isOwned ? (isEquipped ? null : handleEquip(item.id)) : handleBuy(item.id)}
                disabled={isEquipped}
              >
                {isOwned ? (isEquipped ? 'Currently Equipped' : 'Equip Item') : 'Buy Now'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
