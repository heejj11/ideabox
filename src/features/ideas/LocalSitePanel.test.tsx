import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocalSitePanel } from './LocalSitePanel';

describe('LocalSitePanel', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows a running port and copies its stop command', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response()));
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    render(<LocalSitePanel markdown="[사이트](http://localhost:5303/result)" />);

    await waitFor(() => expect(screen.getByLabelText('사이트 상태: 실행 중')).toBeInTheDocument());
    expect(screen.getByText('PORT 5303')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '사이트 열기' })).toHaveAttribute(
      'href',
      'http://localhost:5303/result'
    );

    await user.click(screen.getByRole('button', { name: '중지 명령 복사' }));
    expect(writeText).toHaveBeenCalledWith('lsof -tiTCP:5303 -sTCP:LISTEN | xargs kill');
    expect(screen.getByRole('button', { name: '중지 명령 복사됨' })).toBeInTheDocument();
  });
});
