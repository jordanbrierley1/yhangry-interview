import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelBooking, listBookings } from "../api";
import type { Booking } from "../types";
import { formatEventDate, formatMoney } from "../format";

export function MyBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listBookings()
      .then((res) => {
        if (!cancelled) {
          setBookings(res);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load bookings",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCancel(id: number) {
    setCancellingId(id);
    setError(null);
    try {
      const updated = await cancelBooking(id);
      setBookings((prev) =>
        prev
          ? prev.map((b) => (b.id === updated.id ? updated : b))
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="page container">
      <div className="page__header">
        <div>
          <h1 className="page__title">My bookings</h1>
          <p className="page__subtitle">Your upcoming and past chef bookings.</p>
        </div>
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      {loading && <div className="loading">Loading bookings…</div>}

      {!loading && bookings && bookings.length === 0 && (
        <div className="empty-state">
          <p className="empty-state__title">No bookings yet</p>
          <p>
            Browse our chefs and book your first event.{" "}
            <Link to="/" style={{ color: "var(--brand)", fontWeight: 600 }}>
              Browse chefs →
            </Link>
          </p>
        </div>
      )}

      {!loading && bookings && bookings.length > 0 && (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="card booking-card">
              <img
                className="booking-card__image"
                src={booking.chef.imageUrl}
                alt={booking.chef.name}
              />
              <div className="booking-card__main">
                <h3 className="booking-card__title">{booking.chef.name}</h3>
                <div className="booking-card__meta">
                  <span>{formatEventDate(booking.eventDate)}</span>
                  <span>{booking.guestCount} guests</span>
                  <span>{booking.chef.location}</span>
                  {booking.dietaryNotes && (
                    <span>Notes: {booking.dietaryNotes}</span>
                  )}
                </div>
              </div>
              <div className="booking-card__side">
                <span className={`badge badge--${booking.status}`}>
                  {booking.status}
                </span>
                <span className="booking-card__total">
                  {formatMoney(booking.totalPence)}
                </span>
                {booking.status !== "cancelled" && (
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id ? "Cancelling…" : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
