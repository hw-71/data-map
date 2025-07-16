'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Column {
  column_name: string;
  data_type: string;
  description: string | null;
  sample_data: any[];
}

interface TableDetails {
  description: string | null;
}

const SkeletonRow = () => (
  <tr>
    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
  </tr>
);

const TableDetailsPage = () => {
  const params = useParams();
  const { table_name } = params;
  const [columns, setColumns] = useState<Column[]>([]);
  const [details, setDetails] = useState<TableDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (table_name) {
      async function fetchTableData() {
        setLoading(true);
        try {
          // Fetch columns
          const columnsResponse = await fetch(`${apiBaseUrl}/api/schemas/out_gov/tables/${table_name}/columns`);
          if (!columnsResponse.ok) {
            const errorData = await columnsResponse.json();
            throw new Error(errorData.detail || 'Failed to fetch columns');
          }
          const columnsData = await columnsResponse.json();
          setColumns(columnsData.columns);

          // Fetch table details (description)
          const detailsResponse = await fetch(`${apiBaseUrl}/api/schemas/out_gov/tables/${table_name}`);
          if (!detailsResponse.ok) {
            const errorData = await detailsResponse.json();
            throw new Error(errorData.detail || 'Failed to fetch table details');
          }
          const detailsData = await detailsResponse.json();
          setDetails(detailsData);

        } catch (error: any) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }

      fetchTableData();
    }
  }, [table_name]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{table_name}</h1>
          {loading ? (
            <div className="h-6 bg-gray-200 rounded w-2/3 mt-2 animate-pulse"></div>
          ) : (
            <p className="mt-2 text-lg text-gray-600">{details?.description || 'No description available.'}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />)
              ) : (
                columns.map((column) => (
                  <tr key={column.column_name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{column.column_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.data_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{column.description || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{column.sample_data[0] !== null ? String(column.sample_data[0]) : 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default TableDetailsPage;
