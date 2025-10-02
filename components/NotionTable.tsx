import { Block } from "@notionhq/client/build/src/api-types"
import { NotionText, TextProps } from "./NotionText"

interface TableRow {
  cells: TextProps[][]
}

interface Table {
  has_column_header: boolean
  has_row_header: boolean
  children: Block[]
}

const TableRow = ({ row }: { row: TableRow }) => {
  return (
    <tr>
      {row.cells.map((c) => {
        return (
          <td>
            {c.map((c, idx) => {
              return <NotionText key={idx} text={[c]} />
            })}
          </td>
        )
      })}
    </tr>
  )
}

/**
 * Barebones table component that only supports tables with:
 * - column headers
 * - text cells
 */
export const NotionTable = ({ table }: { table: Table }) => {
  const baseRows = table.children
    // @ts-ignore: Current client version does not support `table_row` but API does
    .filter((c) => c.type === "table_row")
    // @ts-ignore: Current client version does not support `table_row` but API does
    .map((c) => c.table_row)

  const columnHeaders = table.has_column_header ? baseRows[0] : null
  const rows = table.has_column_header ? baseRows.slice(1) : baseRows

  return (
    <table className="prose">
      {columnHeaders != null && (
        <thead className="font-medium">
          <TableRow row={columnHeaders} />
        </thead>
      )}
      <tbody>
        {rows.map((r) => (
          <TableRow key={r.id} row={r} />
        ))}
      </tbody>
    </table>
  )
}
