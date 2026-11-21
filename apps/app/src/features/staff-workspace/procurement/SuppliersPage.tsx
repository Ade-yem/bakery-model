/** @file Supplier directory view with search and Add Supplier modal trigger. */
import { useState } from 'react';
import { Building2, Search } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import type { Supplier } from './types';

interface Props {
  suppliers: readonly (Omit<Supplier, 'category' | 'leadTimeDays'> & {
    category: string | null;
    leadTimeDays: number | null;
  })[];
  onOpenAddSupplier?: () => void;
}

/**
 * @description Lists registered ingredient and packaging vendors with contact and lead-time details.
 * @param props Supplier list and callback to open the Add Supplier dialog.
 * @returns Searchable supplier directory panel.
 */
export function SuppliersPage({ suppliers, onOpenAddSupplier }: Props) {
  const [query, setQuery] = useState('');

  const filtered = suppliers.filter((supplier) =>
    `${supplier.name} ${supplier.category ?? 'Category not provided'} ${supplier.contactName || 'Not provided'} ${supplier.email || 'Not provided'}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  return (
    <section aria-labelledby="suppliers-heading">
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">Vendor directory</p>
          <h1 id="suppliers-heading">Suppliers</h1>
          <p>Active suppliers registered with your business.</p>
        </div>
        {onOpenAddSupplier && (
          <Button icon={<Building2 size={16} />} onClick={onOpenAddSupplier}>
            Add supplier
          </Button>
        )}
      </header>

      <div className="sw-panel pr-panel">
        <div className="pr-toolbar">
          <label className="sw-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search vendor name, category, or contact"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className="pr-count">{filtered.length} active vendors</span>
        </div>

        <div className="sw-table-scroll">
          <table className="sw-table pr-table">
            <thead>
              <tr>
                <th scope="col">Vendor / Category</th>
                <th scope="col">Primary contact</th>
                <th scope="col">Phone &amp; Email</th>
                <th scope="col">Lead time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <strong>{supplier.name}</strong>
                    <span>
                      {supplier.id} · {supplier.category ?? 'Category not provided'}
                    </span>
                  </td>
                  <td>{supplier.contactName || 'Not provided'}</td>
                  <td>
                    <strong>{supplier.phone || 'Not provided'}</strong>
                    <span>{supplier.email || 'Not provided'}</span>
                  </td>
                  <td>
                    <span className="sw-label">
                      {supplier.leadTimeDays === null
                        ? 'Not provided'
                        : `${supplier.leadTimeDays} ${supplier.leadTimeDays === 1 ? 'day' : 'days'}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="sw-empty">
              <h3>No matching suppliers</h3>
              <p>Try another vendor name, category, or contact person.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
