import { PRODUCTS } from '@/data/products';

export function ShowroomFallback() {
  return (
    <section aria-label="AETHER Sneaker Exhibition Catalog (Accessible HTML)" className="sr-only">
      <h2>Complete Season 04 Collection</h2>
      <ul>
        {PRODUCTS.map((prod) => (
          <li key={prod.id}>
            <article>
              <h3>{prod.name} ({prod.referenceCode})</h3>
              <p>{prod.tier} - {prod.subtitle}</p>
              <p>{prod.description}</p>
              <p>Category: {prod.category}</p>
              <p>Price: {prod.currency}{prod.price}</p>
              <p>Status: {prod.status}</p>
              <div>
                Available Sizes:
                <ul>
                  {prod.variants.map((v) => (
                    <li key={v.id}>{v.label} {v.available ? '(In Stock)' : '(Out of Stock)'}</li>
                  ))}
                </ul>
              </div>
              <div>
                Colorways:
                <ul>
                  {prod.colors.map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
