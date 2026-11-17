import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { getOrders, products, getTransfers, type State } from './model';

export function DisbursementRecords({
  state,
  base,
  pendingOnly = false,
}: {
  state: State;
  base: string;
  pendingOnly?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const rows = [
    ...getTransfers().map((item) => {
      const event = state.events.find((e) => e.kind === 'accept' && e.id === item.id);
      return {
        ...item,
        quantity: item.submitted,
        type: 'Incoming transfer',
        status: event
          ? event.quantity === event.expected
            ? 'Accepted'
            : 'Accepted with difference'
          : 'Awaiting count',
        complete: !!event,
      };
    }),
    ...getOrders().map((item) => {
      const complete = state.events.some((e) => e.kind === 'fulfill' && e.id === item.id);
      return {
        ...item,
        type: 'Pushed order',
        status: complete ? 'Fulfilled' : 'Ready to pack',
        complete,
      };
    }),
  ].filter(
    (item) =>
      (!pendingOnly || !item.complete) &&
      (filter === 'all' || item.type === filter) &&
      `${item.id} ${products[item.product]} ${item.status}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  return (
    <>
      <div className="db-filters">
        <label className="sw-search">
          <Search size={16} />
          <input
            aria-label="Search disbursement records"
            placeholder="Search reference, product or status"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="db-filter">
          Record type
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All records</option>
            <option>Incoming transfer</option>
            <option>Pushed order</option>
          </select>
        </label>
      </div>
      <section className="sw-panel">
        <div className="sw-table-scroll">
          <table className="sw-table">
            <thead>
              <tr>
                <th scope="col">Reference / product</th>
                <th scope="col">Type</th>
                <th scope="col">Units</th>
                <th scope="col">Status</th>
                <th scope="col">Review</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.id}</strong>
                    <span>
                      {'lines' in item && item.lines?.length
                        ? item.lines.map((line) => products[line.product]).join(' / ')
                        : products[item.product]}
                    </span>
                  </td>
                  <td>{item.type}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <span className="sw-label">{item.status}</span>
                  </td>
                  <td>
                    <Link
                      className="sw-inline"
                      aria-label={`Review ${item.id}`}
                      to={`${base}/records/${item.id}`}
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="sw-empty">
            <h2>No matching records</h2>
            <p>Try another search or filter. Completed work is available in records.</p>
          </div>
        )}
        <div className="sw-panel-footer">
          Only orders explicitly pushed by Reception are included.
        </div>
      </section>
    </>
  );
}
