import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createBooking, getChef, getQuote } from "../api";
import type { ChefDetail as ChefDetailType, QuoteBreakdown } from "../types";
import { formatMoney } from "../format";

export function ChefDetail() {
  const { id } = useParams<{ id: string }>();
  const chefId = Number(id);
  const navigate = useNavigate();

  const [chef, setChef] = useState<ChefDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedMenuId, setSelectedMenuId] = useState<number | undefined>(
    undefined,
  );
  const [guestCount, setGuestCount] = useState(10);
  const [eventDate, setEventDate] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");

  const [quote, setQuote] = useState<QuoteBreakdown | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getChef(chefId)
      .then((res) => {
        if (!cancelled) {
          setChef(res);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load chef",
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
  }, [chefId]);

  async function handleGetQuote() {
    setQuoting(true);
    setQuoteError(null);
    try {
      const result = await getQuote({
        chefId,
        menuId: selectedMenuId,
        guestCount,
      });
      setQuote(result);
    } catch (err) {
      setQuote(null);
      setQuoteError(err instanceof Error ? err.message : "Failed to get quote");
    } finally {
      setQuoting(false);
    }
  }

  async function handleConfirmBooking() {
    if (!eventDate) {
      setBookingError("Please choose an event date.");
      return;
    }
    setBooking(true);
    setBookingError(null);
    try {
      await createBooking({
        chefId,
        menuId: selectedMenuId,
        eventDate: new Date(eventDate).toISOString(),
        guestCount,
        dietaryNotes: dietaryNotes || undefined,
      });
      navigate("/bookings");
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Failed to create booking",
      );
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return <div className="loading">Loading chef…</div>;
  }

  if (loadError || !chef) {
    return (
      <div className="page container">
        <Link to="/" className="back-link">
          ← Back to chefs
        </Link>
        <div className="notice notice--error">
          {loadError ?? "Chef not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <Link to="/" className="back-link">
        ← Back to chefs
      </Link>

      <div className="detail-grid">
        <div>
          <div className="chef-hero">
            <img
              className="chef-hero__image"
              src={chef.imageUrl}
              alt={chef.name}
            />
            <div>
              <h1 className="chef-hero__name">{chef.name}</h1>
              <div className="chef-card__meta">
                <span className="rating">
                  <span className="rating__star">★</span>
                  {chef.avgRating.toFixed(1)}
                </span>
                <span>·</span>
                <span>
                  {chef.reviewCount} review
                  {chef.reviewCount === 1 ? "" : "s"}
                </span>
                <span>·</span>
                <span>{chef.location}</span>
              </div>
              <div className="cuisine-tags" style={{ marginTop: 8 }}>
                {chef.cuisines.map((cuisine) => (
                  <span key={cuisine} className="tag">
                    {cuisine}
                  </span>
                ))}
              </div>
              <div className="muted" style={{ marginTop: 10 }}>
                Minimum spend <strong>{formatMoney(chef.minSpendPence)}</strong>
              </div>
            </div>
          </div>

          <p className="muted">{chef.bio}</p>

          <div className="section">
            <h2 className="section__title">Menus</h2>
            <div className="menu-list">
              {chef.menus.map((menu) => {
                const selected = selectedMenuId === menu.id;
                return (
                  <button
                    type="button"
                    key={menu.id}
                    className={
                      selected ? "menu-item menu-item--selected" : "menu-item"
                    }
                    onClick={() =>
                      setSelectedMenuId(selected ? undefined : menu.id)
                    }
                  >
                    <div>
                      <div className="menu-item__name">{menu.name}</div>
                      <div className="menu-item__desc">{menu.description}</div>
                      <div className="menu-item__style">{menu.serviceStyle}</div>
                    </div>
                    <div className="menu-item__price">
                      {formatMoney(menu.pricePerHeadPence)}
                      <div className="menu-item__style">per head</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="section">
            <h2 className="section__title">Reviews</h2>
            {chef.reviews.length === 0 ? (
              <p className="muted">No reviews yet.</p>
            ) : (
              chef.reviews.map((review) => (
                <div key={review.id} className="review">
                  <div className="review__head">
                    <span className="review__author">{review.authorName}</span>
                    <span className="rating">
                      <span className="rating__star">★</span>
                      {review.rating}
                    </span>
                  </div>
                  <p className="review__comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="panel">
          <h2 className="panel__title">Get a quote</h2>

          <div className="field">
            <label htmlFor="guest-count">Guests</label>
            <input
              id="guest-count"
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) =>
                setGuestCount(Math.max(1, Number(e.target.value)))
              }
            />
          </div>

          <div className="field">
            <label htmlFor="event-date">Event date</label>
            <input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="dietary-notes">Dietary notes (optional)</label>
            <textarea
              id="dietary-notes"
              rows={2}
              placeholder="e.g. 2 vegetarian, 1 nut allergy"
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={handleGetQuote}
            disabled={quoting}
          >
            {quoting ? "Calculating…" : "Get a quote"}
          </button>

          {quoteError && (
            <div className="notice notice--error" style={{ marginTop: 12 }}>
              {quoteError}
            </div>
          )}

          {quote && (
            <>
              <div className="quote-breakdown">
                <div className="quote-row">
                  <span>
                    {formatMoney(quote.perHeadPence)} × {quote.guestCount} guests
                  </span>
                  <span>{formatMoney(quote.subtotalPence)}</span>
                </div>
                {quote.minSpendTopUpPence > 0 && (
                  <div className="quote-row">
                    <span>Minimum spend top-up</span>
                    <span>{formatMoney(quote.minSpendTopUpPence)}</span>
                  </div>
                )}
                <div className="quote-row">
                  <span>Service fee (10%)</span>
                  <span>{formatMoney(quote.serviceFeePence)}</span>
                </div>
                <div className="quote-row quote-row--total">
                  <span>Total</span>
                  <span>{formatMoney(quote.totalPence)}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn--primary btn--block"
                style={{ marginTop: 16 }}
                onClick={handleConfirmBooking}
                disabled={booking}
              >
                {booking ? "Confirming…" : "Confirm booking"}
              </button>
            </>
          )}

          {bookingError && (
            <div className="notice notice--error" style={{ marginTop: 12 }}>
              {bookingError}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
