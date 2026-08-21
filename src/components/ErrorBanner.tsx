interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <section className="error-banner" role="alert">
      <div>
        <strong>작업을 마치지 못했어요.</strong>
        <p>{message}</p>
      </div>
      <div className="error-banner__actions">
        {onRetry ? (
          <button type="button" onClick={onRetry}>
            다시 시도
          </button>
        ) : null}
        {onDismiss ? (
          <button type="button" onClick={onDismiss}>
            닫기
          </button>
        ) : null}
      </div>
    </section>
  );
}
