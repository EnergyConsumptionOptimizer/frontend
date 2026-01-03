const ensureSseResponse = (response) => {
  if (!response.ok) {
    throw new Error(
      `SSE subscribe failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/event-stream")) {
    throw new Error(`Unexpected content-type: ${contentType}`);
  }
};

const dispatchParsedEvent = (rawEvent, onMessage) => {
  const dataLines = [];
  let eventType = null;

  for (const line of rawEvent.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      eventType = line.slice(6).trim();
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) return;
  const payload = dataLines.join("\n");
  if (!payload) return;

  try {
    const parsedData = JSON.parse(payload);
    if (eventType && !parsedData.type) {
      parsedData.type = eventType;
    }
    onMessage?.(parsedData);
  } catch {
    // ignore
  }
};

export const subscribeToSse = async (
  url,
  { onEvent: onMessage, onOpen, signal } = {},
) => {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "text/event-stream" },
    credentials: "include",
    signal,
  });

  ensureSseResponse(response);
  onOpen?.();

  const stream = response.body;
  if (!stream) throw new Error("SSE response body is not readable");

  const decoder = new TextDecoder();
  let buffer = "";

  // eslint-disable-next-line no-restricted-syntax
  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });

    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      dispatchParsedEvent(rawEvent, onMessage);
    }
  }
};
