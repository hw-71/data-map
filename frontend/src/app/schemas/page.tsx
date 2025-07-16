'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Table {
  table_name: string;
  estimated_row_count: number;
  total_size: string;
  description: string | null;
}

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="mt-4 flex justify-between items-center">
        <div className="w-1/3">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="w-1/3 text-right">
          <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto mb-1"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 ml-auto"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function OutGovSchemaPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/schemas/out_gov/tables`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Network response was not ok');
        }
        const data = await response.json();
        setTables(data.tables);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTables();
  }, []);

  const tablesWithRows = tables.filter(t => t.estimated_row_count > 0);
  const tablesWithZeroRows = tables.filter(t => t.estimated_row_count === 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Data Catalog</h1>
          <p className="mt-2 text-lg text-gray-600">
            An overview of all tables within the <span className="font-medium text-indigo-600">out_gov</span> schema.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Active Tables</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
          ) : (
            tablesWithRows.map((table) => (
              <Link key={table.table_name} href={`/schemas/out_gov/tables/${table.table_name}`}>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 truncate">{table.table_name}</h3>
                    <p className="text-sm text-gray-500 mt-1 truncate h-5">{table.description || ''}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p className="font-semibold">Rows</p>
                        <p className="text-lg font-mono text-indigo-600">{table.estimated_row_count.toLocaleString()}</p>
                      </div>
                      <div className="text-sm text-gray-600 text-right">
                        <p className="font-semibold">Size</p>
                        <p className="text-lg font-mono text-indigo-600">{table.total_size}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {!loading && tablesWithZeroRows.length > 0 && (
          <>
            <h2 class="text-2xl font-semibold text-gray-800 mb-2">Tables with Zero Rows (Needs Review)</h2>
            <p className="text-sm text-gray-500 mb-4">
              이 테이블들의 행 개수가 0으로 표시되는 것은 여러 이유가 있을 수 있습니다. 테이블이 최근에 생성되었거나 데이터 변경이 자주 발생하지 않는 경우, 데이터베이스 시스템의 통계 정보가 아직 업데이트되지 않았을 수 있습니다. 이는 성능을 위해 실제 데이터를 매번 검사하지 않기 때문에 발생하는 정상적인 현상일 수 있습니다. 만약 데이터가 확실히 존재하는데도 0으로 표시된다면, 데이터 팀에 문의하여 통계 정보 수동 업데이트를 요청할 수 있습니다.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tablesWithZeroRows.map((table) => (
                <Link key={table.table_name} href={`/schemas/out_gov/tables/${table.table_name}`}>
                  <div className="bg-yellow-50 rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 truncate">{table.table_name}</h3>
                      <p className="text-sm text-gray-500 mt-1 truncate h-5">{table.description || ''}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <p className="font-semibold">Rows</p>
                          <p className="text-lg font-mono text-red-600">{table.estimated_row_count}</p>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          <p className="font-semibold">Size</p>
                          <p className="text-lg font-mono text-indigo-600">{table.total_size}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}