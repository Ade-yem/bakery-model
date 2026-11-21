/** @file Raw Material Stock inventory levels, thresholds, and quick reorder view. */
import { useState } from 'react';
import { PackagePlus, Search } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { formatMoney, getStockStatus } from './domain';
import type { RawMaterial, Supplier } from './types';

interface Props {
  materials: readonly RawMaterial[];
  suppliers: readonly Supplier[];
  onReorder: (material: RawMaterial) => void;
}

/**
 * @description Displays current raw-material stock levels, reorder thresholds, and status badges.
 * @param props Raw materials, suppliers for preferred vendor lookup, and reorder callback.
 * @returns Searchable raw-material inventory table with quick Reorder actions.
 */
export function RawMaterialStockPage({ materials, suppliers, onReorder }: Props) {
  const [query, setQuery] = useState('');
  const supplierById = new Map(suppliers.map((s) => [s.id, s.name]));

  const filtered = materials.filter((material) =>
    `${material.sku} ${material.name} ${getStockStatus(material.currentStock, material.minThreshold)}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const needsRestock = materials.filter(
    (m) => getStockStatus(m.currentStock, m.minThreshold) !== 'OK',
  ).length;

  return (
    <section aria-labelledby="stock-heading">
      <header className="sw-page-header">
        <div>
          <p className="sw-eyebrow">Store inventory</p>
          <h1 id="stock-heading">Raw Material Stock</h1>
          <p>Stock levels increment automatically when procurement deliveries are posted.</p>
        </div>
        <span className="pr-count">{needsRestock} needing restock</span>
      </header>

      <div className="sw-panel pr-panel">
        <div className="pr-toolbar">
          <label className="sw-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search SKU, ingredient, or status"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className="pr-count">{filtered.length} tracked materials</span>
        </div>

        <div className="sw-table-scroll">
          <table className="sw-table pr-table">
            <thead>
              <tr>
                <th scope="col">SKU / Material</th>
                <th scope="col">Current stock</th>
                <th scope="col">Min threshold</th>
                <th scope="col">Last unit cost</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((material) => {
                const status = getStockStatus(material.currentStock, material.minThreshold);
                return (
                  <tr key={material.id}>
                    <td>
                      <strong>{material.name}</strong>
                      <span>
                        {material.sku} · {supplierById.get(material.preferredSupplierId) ?? 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <strong>{material.currentStock}</strong> {material.unit}
                    </td>
                    <td>
                      {material.minThreshold} {material.unit}
                    </td>
                    <td className="pr-money">{formatMoney(material.lastUnitCostKobo)}</td>
                    <td>
                      <span className={`sw-state pr-status-pill pr-${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={status === 'OK' ? 'secondary' : 'copper'}
                        icon={<PackagePlus size={15} />}
                        onClick={() => onReorder(material)}
                      >
                        Reorder
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="sw-empty">
              <h3>No matching materials</h3>
              <p>Try another SKU, ingredient name, or status.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
