import { useEffect, useState } from "react";
import { listChefs } from "../api";
import type { ChefListResponse } from "../types";
import { ChefCard } from "../components/ChefCard";
import { Pagination } from "../components/Pagination";

const CUISINES = [
  "Italian",
  "Greek",
  "Mexican",
  "Indian",
  "Japanese",
  "French",
  "Mediterranean",
  "British",
  "Thai",
  "Lebanese",
];

type Sort = "rating" | "price";

export function BrowseChefs() {
  const [cuisine, setCuisine] = useState("");
  const [sort, setSort] = useState<Sort>("rating");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ChefListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listChefs({ cuisine: cuisine || undefined, sort, page })
      .then((res) => {
        if (!cancelled) {
          setResult(res);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load chefs");
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
  }, [cuisine, sort, page]);

  return (
    <div className="page container">
      <div className="page__header">
        <div>
          <h1 className="page__title">Browse chefs</h1>
          <p className="page__subtitle">
            Private chefs and caterers for your event, at home.
          </p>
        </div>
        <div className="toolbar">
          <div className="field">
            <label htmlFor="cuisine-filter">Cuisine</label>
            <select
              id="cuisine-filter"
              value={cuisine}
              onChange={(e) => {
                setCuisine(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All cuisines</option>
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sort-by">Sort by</label>
            <select
              id="sort-by"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as Sort);
                setPage(1);
              }}
            >
              <option value="rating">Top rated</option>
              <option value="price">Lowest price</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      {loading && <div className="loading">Loading chefs…</div>}

      {!loading && result && result.data.length === 0 && (
        <div className="empty-state">
          <p className="empty-state__title">No chefs found</p>
          <p>Try a different cuisine filter.</p>
        </div>
      )}

      {!loading && result && result.data.length > 0 && (
        <>
          <div className="chef-grid">
            {result.data.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
