import type { Idea } from '../../types/idea';
import { findIdeaSheetRow, IDEA_HEADER, ideaToRow, sheetValuesToIdeas } from '../../features/ideas/ideaMapper';
import { googleJson, scheduleGoogleWrite } from './client';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const IDEA_RANGE = 'ideas!A:I';

interface SheetProperties {
  sheetId: number;
  title: string;
}

interface SpreadsheetResponse {
  spreadsheetId: string;
  sheets?: Array<{ properties: SheetProperties }>;
}

interface ValuesResponse {
  range: string;
  majorDimension: 'ROWS' | 'COLUMNS';
  values?: string[][];
}

interface UpdateValuesResponse {
  spreadsheetId: string;
  updatedRange?: string;
  updatedRows?: number;
}

interface AppendValuesResponse {
  spreadsheetId: string;
  updates?: UpdateValuesResponse;
}

interface BatchUpdateSpreadsheetResponse {
  spreadsheetId: string;
}

export async function createIdeaSpreadsheet(): Promise<string> {
  const response = await scheduleGoogleWrite(() =>
    googleJson<SpreadsheetResponse>(SHEETS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: { title: 'ideas' },
        sheets: [{ properties: { title: 'ideas' } }],
      }),
    })
  );
  await writeIdeaHeader(response.spreadsheetId);
  return response.spreadsheetId;
}

export async function getSpreadsheet(spreadsheetId: string): Promise<SpreadsheetResponse> {
  const params = new URLSearchParams({ fields: 'spreadsheetId,sheets.properties(sheetId,title)' });
  return googleJson<SpreadsheetResponse>(`${SHEETS_API}/${encodeURIComponent(spreadsheetId)}?${params}`);
}

export async function getIdeaValues(spreadsheetId: string): Promise<string[][]> {
  const range = encodeURIComponent(IDEA_RANGE);
  const response = await googleJson<ValuesResponse>(`${SHEETS_API}/${encodeURIComponent(spreadsheetId)}/values/${range}`);
  return response.values ?? [];
}

export async function getIdeas(spreadsheetId: string): Promise<Idea[]> {
  return sheetValuesToIdeas(await getIdeaValues(spreadsheetId));
}

export async function writeIdeaHeader(spreadsheetId: string): Promise<void> {
  const range = encodeURIComponent('ideas!A1:I1');
  await scheduleGoogleWrite(() =>
    googleJson<UpdateValuesResponse>(
      `${SHEETS_API}/${encodeURIComponent(spreadsheetId)}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ range: 'ideas!A1:I1', majorDimension: 'ROWS', values: [[...IDEA_HEADER]] }),
      }
    )
  );
}

export async function appendIdea(spreadsheetId: string, idea: Idea): Promise<void> {
  const range = encodeURIComponent(IDEA_RANGE);
  const params = new URLSearchParams({ valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS' });
  await scheduleGoogleWrite(() =>
    googleJson<AppendValuesResponse>(`${SHEETS_API}/${encodeURIComponent(spreadsheetId)}/values/${range}:append?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ range: IDEA_RANGE, majorDimension: 'ROWS', values: [ideaToRow(idea)] }),
    })
  );
}

export async function updateIdea(spreadsheetId: string, idea: Idea): Promise<void> {
  const latestValues = await getIdeaValues(spreadsheetId);
  const rowNumber = findIdeaSheetRow(latestValues, idea.id);

  if (!rowNumber) {
    throw new Error('수정할 아이디어를 시트에서 찾지 못했습니다. 목록을 새로 불러온 뒤 다시 시도해 주세요.');
  }

  const rangeName = `ideas!A${rowNumber}:I${rowNumber}`;
  const range = encodeURIComponent(rangeName);
  await scheduleGoogleWrite(() =>
    googleJson<UpdateValuesResponse>(
      `${SHEETS_API}/${encodeURIComponent(spreadsheetId)}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ range: rangeName, majorDimension: 'ROWS', values: [ideaToRow(idea)] }),
      }
    )
  );
}

export async function ensureIdeaSheetStructure(spreadsheetId: string): Promise<void> {
  const spreadsheet = await getSpreadsheet(spreadsheetId);
  const ideasSheet = spreadsheet.sheets?.find((sheet) => sheet.properties.title === 'ideas');

  if (!ideasSheet) {
    const firstSheet = spreadsheet.sheets?.[0];
    const requests = firstSheet
      ? [
          {
            updateSheetProperties: {
              properties: { sheetId: firstSheet.properties.sheetId, title: 'ideas' },
              fields: 'title',
            },
          },
        ]
      : [{ addSheet: { properties: { title: 'ideas' } } }];

    await scheduleGoogleWrite(() =>
      googleJson<BatchUpdateSpreadsheetResponse>(`${SHEETS_API}/${encodeURIComponent(spreadsheetId)}:batchUpdate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
      })
    );
  }

  const values = await getIdeaValues(spreadsheetId);
  const header = values[0];
  if (!header?.length) {
    await writeIdeaHeader(spreadsheetId);
    return;
  }

  if (header.join('\u0000') !== IDEA_HEADER.join('\u0000')) {
    throw new Error('ideas 시트의 헤더가 Idea Box 형식과 다릅니다. README의 헤더 순서를 확인해 주세요.');
  }
}
