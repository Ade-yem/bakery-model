/** @file Read-only production record table shared by home and records pages. */
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productionRecords } from './preview-data';
interface Props {
  base: string;
  query?: string;
}
/**
 * @description Shows production-only fields, never sales, customers or monetary values.
 * @param props Preview route base and optional user search query.
 * @returns Searchable batch rows or an explicit empty state.
 */
export function StaffTable({ base, query = '' }: Props) {
  const records = productionRecords.filter((record) =>
    `${record.id} ${record.product} ${record.state}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="sw-table-scroll">
      <table className="sw-table">
        <thead>
          <tr>
            <th scope="col">Batch / product</th>
            <th scope="col">Submitted</th>
            <th scope="col">Recorded</th>
            <th scope="col">Transfer state</th>
            <th scope="col">Record</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>
                <strong>{record.id}</strong>
                <span>{record.product}</span>
              </td>
              <td>{record.quantity} units</td>
              <td>{record.time}</td>
              <td>
                <span className="sw-label">{record.state}</span>
              </td>
              <td>
                <Link
                  className="sw-inline"
                  to={`${base}/records/${record.id}`}
                  aria-label={`View batch ${record.id}`}
                >
                  <ArrowUpRight size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {records.length === 0 && (
        <div className="sw-empty">
          <h3>No matching batches</h3>
          <p>Try another batch reference, product or transfer state.</p>
        </div>
      )}
    </div>
  );
}
