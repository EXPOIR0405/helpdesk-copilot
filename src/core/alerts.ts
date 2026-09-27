export type Alert = {
  level: "warn" | "error";
  /** 같은 key는 중복 방지 창 안에서 한 번만 보냄 */
  key: string;
  title: string;
  detail: Record<string, string | number>;
  /** 기본 중복 방지 창 대신 쓸 값 (예: 예산 알림은 하루 한 번) */
  windowSeconds?: number;
};

/** 실제 전송 (Slack·콘솔) */
export type AlertSink = (alert: Alert) => Promise<void>;

/** 창 안에서 처음이면 true. 서버리스 인스턴스가 여러 개여도 한 번만 보내려면 DB 기반 Quota를 넘김 */
export type AlertGate = (key: string, windowSeconds: number) => Promise<boolean>;

export type Alerter = { notify(alert: Alert): Promise<void> };

/**
 * 알림은 부가 기능: 전송·중복 확인이 실패해도 요청을 실패시키지 않음
 * 같은 장애가 이어지면 요청마다 알림이 쏟아지므로 key별로 창 안에서 한 번만
 */
export function createAlerter(opts: { sink: AlertSink; gate: AlertGate; windowSeconds: number }): Alerter {
  return {
    async notify(alert) {
      try {
        if (!(await opts.gate(`alert:${alert.key}`, alert.windowSeconds ?? opts.windowSeconds))) return;
        await opts.sink(alert);
      } catch (e) {
        console.error("알림 전송 실패", alert.key, e);
      }
    },
  };
}

export const consoleSink: AlertSink = async (a) => {
  console.warn(`[${a.level}] ${a.title}`, a.detail);
};

/** Slack Incoming Webhook. 5초 안에 못 보내면 포기 (요청을 붙잡지 않음) */
export function slackSink(webhookUrl: string, service: string, fetchImpl: typeof fetch = fetch): AlertSink {
  return async (a) => {
    const res = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(slackPayload(a, service)),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) throw new Error(`Slack ${res.status}`);
  };
}

export function slackPayload(a: Alert, service: string) {
  const icon = a.level === "error" ? ":rotating_light:" : ":warning:";
  const fields = Object.entries(a.detail).map(([k, v]) => `*${k}*: ${v}`).join("\n");
  return {
    text: `${icon} [${service}] ${a.title}`,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `${icon} *[${service}] ${a.title}*` } },
      ...(fields ? [{ type: "section", text: { type: "mrkdwn", text: fields } }] : []),
    ],
  };
}

/** 오류 객체를 알림에 넣을 짧은 문자열로 */
export function describeError(e: unknown): string {
  const status = (e as { status?: unknown })?.status;
  const message = e instanceof Error ? e.message : String(e);
  return `${typeof status === "number" ? `${status} ` : ""}${message}`.slice(0, 300);
}
