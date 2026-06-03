import { Link } from "react-router-dom";
import type { ChefSummary } from "../types";
import { formatMoney } from "../format";

export function ChefCard({ chef }: { chef: ChefSummary }) {
  return (
    <Link to={`/chefs/${chef.id}`} className="card chef-card">
      <img
        className="chef-card__image"
        src={chef.imageUrl}
        alt={chef.name}
        loading="lazy"
      />
      <div className="chef-card__body">
        <h3 className="chef-card__name">{chef.name}</h3>
        <div className="chef-card__meta">
          <span className="rating">
            <span className="rating__star">★</span>
            {chef.avgRating.toFixed(1)}
          </span>
          <span>·</span>
          <span>
            {chef.reviewCount} review{chef.reviewCount === 1 ? "" : "s"}
          </span>
          <span>·</span>
          <span>{chef.location}</span>
        </div>
        <div className="cuisine-tags">
          {chef.cuisines.map((cuisine) => (
            <span key={cuisine} className="tag">
              {cuisine}
            </span>
          ))}
        </div>
        <div className="chef-card__price">
          From <strong>{formatMoney(chef.fromPricePerHeadPence)}</strong> per head
          <div className="muted">
            Min spend {formatMoney(chef.minSpendPence)}
          </div>
        </div>
      </div>
    </Link>
  );
}
