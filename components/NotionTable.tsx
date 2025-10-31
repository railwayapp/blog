import type { Block } from "@notionhq/client/build/src/api-types";
import { NotionText, type TextProps } from "./NotionText";

interface TableRow {
	cells: TextProps[][];
}

interface Table {
	has_column_header: boolean;
	has_row_header: boolean;
	children: Block[];
}

const TableRow = ({ row }: { row: TableRow }) => {
	return (
		<tr>
			{row.cells.map((c, idx) => {
				return (
					<td key={idx} className="px-4 py-3 text-sm text-gray-800">
						{c.map((c, idx) => {
							return <NotionText key={idx} text={[c]} />;
						})}
					</td>
				);
			})}
		</tr>
	);
};

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
		.map((c) => ({ id: c.id, row: c.table_row }));

	const columnHeaders = table.has_column_header ? baseRows[0] : null;
	const rows = table.has_column_header ? baseRows.slice(1) : baseRows;

	return (
		<div className="overflow-x-auto my-8 -mx-5 md:-mx-0">
			<table className="w-full min-w-full border-collapse">
				{columnHeaders != null && (
					<thead className="font-medium bg-gray-50 border-b border-gray-200">
						<TableRow key={columnHeaders.id} row={columnHeaders.row} />
					</thead>
				)}
				<tbody className="divide-y divide-gray-200">
					{rows.map((r) => (
						<TableRow key={r.id} row={r.row} />
					))}
				</tbody>
			</table>
		</div>
	);
};
