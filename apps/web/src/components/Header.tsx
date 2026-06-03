import { useState, type ChangeEvent } from "react";
import { NavLink } from "react-router-dom";
import { CUSTOMERS, getActiveCustomerId, setActiveCustomerId } from "../api";

export function Header() {
  const [customerId, setCustomerId] = useState(getActiveCustomerId());

  function handleCustomerChange(e: ChangeEvent<HTMLSelectElement>) {
    const id = Number(e.target.value);
    setActiveCustomerId(id);
    setCustomerId(id);
    // Reload so every page re-fetches as the newly active customer.
    window.location.reload();
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <NavLink to="/" className="wordmark">
          y<span>hangry</span>
        </NavLink>
        <nav className="header__nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            Browse chefs
          </NavLink>
          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            My bookings
          </NavLink>
        </nav>
        <div className="customer-switcher">
          <label htmlFor="customer-switcher">Logged in as</label>
          <select
            id="customer-switcher"
            value={customerId}
            onChange={handleCustomerChange}
          >
            {CUSTOMERS.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
