import { LoadingRow, LoadingTable } from './LoadingTable'
import { useSortBy, useTable } from 'react-table'

import { ILog } from 'types/Log'
import LogDetails from './LogDetails'
import { Transition } from '@headlessui/react'
import { columns } from './columns'
import { useModal } from '@apideck/components'

interface IProps {
  logs: ILog[]
  isLoading?: boolean
  isLoadingMore?: boolean
}

const Table = ({ logs, isLoading, isLoadingMore }: IProps) => {
  const { getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: logs || []
    },
    useSortBy
  )
  const { addModal } = useModal()

  if (isLoading) return <LoadingTable />

  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="">
          {headerGroups.map((headerGroup: any, i: number) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={`headerGroup${i}`}>
              {headerGroup.headers.map((column: any, i: number) => (
                <th
                  key={`column-${i}`}
                  className="py-3 pr-1 space-x-6 text-xs tracking-wide text-left text-gray-500 uppercase font-semi-bold"
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="inline-block w-4 h-4 ml-2 text-gray-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="inline-block w-4 h-4 ml-2 text-gray-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )
                    ) : (
                      ''
                    )}
                  </span>
                </th>
              ))}
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
          {rows.map((row: any, i: number) => {
            prepareRow(row)

            return (
              <Transition
                show={true}
                enter="transition ease-out duration-300"
                enterFrom="transform opacity-40"
                enterTo="transform opacity-100"
                leave="transition ease-in duration-300"
                leaveFrom="transform opacity-100"
                leaveTo="transform opacity-0"
                as="tr"
                {...row.getRowProps()}
                key={`row-${i}`}
              >
                {row.cells.map((cell: any, i: number) => {
                  return (
                    <td
                      className="max-w-xs py-4 space-x-6 text-sm font-medium text-gray-900 truncate whitespace-nowrap"
                      {...cell.getCellProps()}
                      key={`cell-${i}`}
                    >
                      {cell.render('Cell')}
                    </td>
                  )
                })}
                <td className="py-4 text-sm font-medium text-right whitespace-nowrap">
                  <span
                    className="font-semibold cursor-pointer text-primary-600 hover:text-primary-900"
                    onClick={() => addModal(<LogDetails log={row.original} />)}
                  >
                    Details
                  </span>
                </td>
              </Transition>
            )
          })}
        </tbody>
      </table>
      {isLoadingMore ? (
        <table className="min-w-full divide-y divide-gray-200">
          {Array.from(Array(16).keys()).map((key) => (
            <LoadingRow key={key} />
          ))}
        </table>
      ) : (
        ''
      )}
    </div>
  )
}

export default Table
