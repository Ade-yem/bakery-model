import { useState } from 'react';
import type { Department } from '../integration/auth';
import { StaffHeading } from '../staff-workspace/StaffPages';
import type { ApiCustomer, CatalogItem } from './contracts';

export function CustomerDirectory({
  source,
  permissions,
  onAdd,
}: {
  source: ApiCustomer[];
  permissions: readonly string[];
  onAdd: () => void;
}) {
  const [query, setQuery] = useState('');
  const can = (permission: string) => permissions.includes(permission);
  const customers = source.filter((c) =>
    `${c.displayName} ${c.externalReference ?? ''}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <>
      <StaffHeading title="Customers" description="Customer profiles in your selected business." />
      <div className="api-actions">
        <label className="sw-search">
          Search customers
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        {can('customers:manage') && (
          <button className="sw-primary" onClick={onAdd}>
            Add customer
          </button>
        )}
      </div>
      <section className="sw-panel">
        <div className="sw-table-scroll">
          <table className="sw-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Reference</th>
                {can('customers:contact:read') && <th>Contact</th>}
                <th>Credit ceiling</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.displayName}</td>
                  <td>{c.externalReference ?? 'Not provided'}</td>
                  {can('customers:contact:read') && <td>{c.phone ?? c.email ?? 'Not provided'}</td>}
                  <td>
                    {c.creditCeiling !== null && c.currency !== null
                      ? `${c.creditCeiling} ${c.currency ?? ''}`
                      : 'Unavailable'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!customers.length && (
          <div className="sw-empty">
            <h2>No matching customers</h2>
            <p>Registered customers will appear here.</p>
          </div>
        )}
      </section>
    </>
  );
}
export function CatalogueDirectory({
  source,
  department,
  permissions,
}: {
  source: CatalogItem[];
  department: Department;
  permissions: readonly string[];
}) {
  const [query, setQuery] = useState('');
  const can = (permission: string) => permissions.includes(permission);
  const items = source.filter((i) =>
    `${i.name} ${i.sku ?? ''}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <>
      <StaffHeading
        title={
          department === 'production' || department === 'procurement'
            ? 'Material catalogue'
            : 'Product catalogue'
        }
        description="Catalogue information for your department. Stock quantities are currently unavailable."
      />
      <label className="sw-search">
        Search catalogue
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <section className="sw-panel">
        <div className="sw-table-scroll">
          <table className="sw-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Unit</th>
                {department === 'reception' && can('items:price:read') && <th>Unit price</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku ?? 'Not provided'}</td>
                  <td>{item.uom}</td>
                  {department === 'reception' && can('items:price:read') && (
                    <td>
                      {item.sellingPrice !== null && item.currency !== null
                        ? `${item.sellingPrice} ${item.currency ?? ''}`
                        : 'Unavailable'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!items.length && (
          <div className="sw-empty">
            <h2>No matching items</h2>
            <p>Authorized catalogue items will appear here.</p>
          </div>
        )}
      </section>
    </>
  );
}
